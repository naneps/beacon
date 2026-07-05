import requests
import time
import uuid
import random
import re
import string
import threading
import base64
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Dict, List, Callable, Optional, Any
import json


def _dig(data, path):
    """Walk a dot-path (leading 'body.' optional) through dicts and list indices."""
    if data is None or not path:
        return None
    p = path[5:] if path.startswith("body.") else path
    cur = data
    for key in p.split("."):
        if isinstance(cur, dict) and key in cur:
            cur = cur[key]
        elif isinstance(cur, list) and key.lstrip("-").isdigit() and -len(cur) <= int(key) < len(cur):
            cur = cur[int(key)]
        else:
            return None
    return cur


def _assert_cmp(op, actual, expected):
    try:
        if op == "eq":
            return str(actual) == str(expected)
        if op == "ne":
            return str(actual) != str(expected)
        if op in ("lt", "gt", "lte", "gte"):
            a, e = float(actual), float(expected)
            return {"lt": a < e, "gt": a > e, "lte": a <= e, "gte": a >= e}[op]
        if op == "contains":
            return str(expected) in str(actual)
        if op == "exists":
            return actual is not None
    except Exception:
        return False
    return False


def evaluate_assertions(assertions, result):
    """Check each rule against a send_once result dict. Returns a list of
    {type, op, expected, actual, ok}. Types: status, time_ms, body_contains,
    header, jsonpath."""
    out = []
    body = result.get("body") or ""
    js = result.get("json")
    headers = {str(k).lower(): v for k, v in (result.get("headers") or {}).items()}
    for a in assertions or []:
        t = a.get("type")
        op = a.get("op", "eq")
        val = a.get("value")
        actual = None
        if t == "status":
            actual = result.get("status")
            ok = _assert_cmp(op, actual, val)
        elif t == "time_ms":
            actual = result.get("time_ms")
            ok = _assert_cmp(op, actual, val)
        elif t == "body_contains":
            ok = str(val) in body
        elif t == "header":
            actual = headers.get(str(a.get("name", "")).lower())
            ok = (actual is not None) if op == "exists" else _assert_cmp(op, actual, val)
        elif t == "jsonpath":
            actual = _dig(js, a.get("path", ""))
            ok = (actual is not None) if op == "exists" else _assert_cmp(op, actual, val)
        else:
            ok = False
        out.append({"type": t, "op": op, "expected": val, "actual": actual, "ok": bool(ok)})
    return out


class EndpointTest:
    def __init__(self, test_id: str, name: str, url: str, method: str = "POST",
                 headers: Dict = None, payload: Dict = None, payload_type: str = "json",
                 extractors: Dict = None, run_config: Dict = None, assertions: List = None):
        self.id = test_id or str(uuid.uuid4())
        self.name = name
        self.url = url
        self.method = method.upper()
        self.headers = headers or {}
        self.payload = payload or {}
        self.payload_type = payload_type  # "json", "form", "multipart", "raw"
        self.extractors = extractors or {}  # e.g. {"access_token": "body.access_token"}
        # Optional per-endpoint run override: {concurrency, max_requests, delay, use_min_delay}
        self.run_config = run_config or None
        # Pass/fail rules checked against the response, e.g.
        # {"type": "status", "op": "eq", "value": 200} or
        # {"type": "jsonpath", "path": "body.ok", "op": "eq", "value": True}
        self.assertions = assertions or []

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "url": self.url,
            "method": self.method,
            "headers": self.headers,
            "payload": self.payload,
            "payload_type": self.payload_type,
            "extractors": self.extractors,
            "run_config": self.run_config,
            "assertions": self.assertions,
        }

    @staticmethod
    def from_dict(d):
        return EndpointTest(
            d.get("id"), d["name"], d["url"], d.get("method", "POST"),
            d.get("headers", {}), d.get("payload", {}), d.get("payload_type", "json"),
            d.get("extractors", {}), d.get("run_config"), d.get("assertions", [])
        )

class TestConfig:
    def __init__(self, base_url: str = "", variables: Dict = None, tests: List[EndpointTest] = None):
        self.base_url = base_url
        self.variables = variables or {}
        self.tests = tests or []

    def to_dict(self):
        return {
            "base_url": self.base_url,
            "variables": self.variables,
            "tests": [t.to_dict() for t in self.tests]
        }

    @staticmethod
    def from_dict(d):
        tests = [EndpointTest.from_dict(t) for t in d.get("tests", [])]
        return TestConfig(d.get("base_url", ""), d.get("variables", {}), tests)

class APITester:
    def __init__(self, test: EndpointTest, config: TestConfig,
                 concurrency: int = 1, delay: float = 0.1, max_requests: int = 100,
                 log_callback: Callable[[str], None] = None,
                 stats_callback: Callable[[Dict], None] = None,
                 response_callback: Callable[[Dict], None] = None,
                 stop_flag: Optional[Dict] = None):
        self.test = test
        self.config = config
        self.concurrency = max(1, concurrency)
        self.delay = delay
        self.max_requests = max_requests
        self.log = log_callback or print
        self.update_stats = stats_callback or (lambda x: None)
        self.emit_response = response_callback or (lambda x: None)
        self.stop_flag = stop_flag or {"stop": False}
        # Per-thread HTTP sessions. A single requests.Session shared across the
        # ThreadPoolExecutor workers is not thread-safe (its cookie jar and
        # header dict race), which corrupts state under concurrency > 1.
        self._tls = threading.local()
        self._lock = threading.Lock()
        self._reset_metrics()

    def _session(self) -> "requests.Session":
        s = getattr(self._tls, "session", None)
        if s is None:
            s = requests.Session()
            self._tls.session = s
        return s

    def _reset_metrics(self):
        self.results = {"attempts": 0, "success": 0, "rate_limited": 0, "errors": 0}
        self._codes: Dict[str, int] = {}
        self._recent: List[int] = []
        self._all_lat: List[float] = []  # full-run latencies, for percentiles
        self._lat = {"sum": 0.0, "count": 0, "min": 0.0, "max": 0.0, "last": 0.0}
        # Defense-validation metrics: at which attempt the target first threw a
        # 429/throttle, and the last Retry-After it advertised.
        self._first_rate_limited_at: Optional[int] = None
        self._last_retry_after: Optional[str] = None
        self._t_start = time.time()

    def _record_latency(self, ms: float):
        l = self._lat
        l["sum"] += ms
        l["count"] += 1
        l["last"] = ms
        l["min"] = ms if l["count"] == 1 else min(l["min"], ms)
        l["max"] = max(l["max"], ms)
        self._recent.append(round(ms))
        if len(self._recent) > 60:
            del self._recent[0]
        self._all_lat.append(ms)

    @staticmethod
    def _percentile(sorted_vals: List[float], pct: float) -> float:
        """Linear-interpolated percentile over an already-sorted list."""
        n = len(sorted_vals)
        if n == 0:
            return 0.0
        if n == 1:
            return sorted_vals[0]
        rank = pct / 100.0 * (n - 1)
        lo = int(rank)
        hi = min(lo + 1, n - 1)
        return sorted_vals[lo] + (sorted_vals[hi] - sorted_vals[lo]) * (rank - lo)

    def _snapshot(self) -> Dict:
        """Build a stats snapshot (counters + latency + status mix + throughput)."""
        l = self._lat
        cnt = l["count"]
        elapsed = max(time.time() - self._t_start, 1e-9)
        snap = dict(self.results)
        snap["status_codes"] = dict(self._codes)
        snap["recent_ms"] = list(self._recent)
        # Percentiles over the full run (modest run sizes; sort cost acceptable).
        srt = sorted(self._all_lat)
        snap["latency_ms"] = {
            "avg": round(l["sum"] / cnt) if cnt else 0,
            "min": round(l["min"]),
            "max": round(l["max"]),
            "last": round(l["last"]),
            "p50": round(self._percentile(srt, 50)),
            "p95": round(self._percentile(srt, 95)),
            "p99": round(self._percentile(srt, 99)),
        }
        snap["elapsed_s"] = round(elapsed, 2)
        snap["rps"] = round(self.results["attempts"] / elapsed, 1)
        snap["first_rate_limited_at"] = self._first_rate_limited_at
        snap["retry_after"] = self._last_retry_after
        return snap

    def _substitute(self, value: Any) -> Any:
        if isinstance(value, str):
            # 1. Replace static variables first
            for k, v in self.config.variables.items():
                value = value.replace(f"{{{{{k}}}}}", str(v))

            # 2. Replace dynamic generators (fresh per request)
            def dynamic_replacer(match):
                inner = match.group(1).strip()
                return self._generate_dynamic(inner)

            value = re.sub(r'\{\{([^}]+)\}\}', dynamic_replacer, value)
            return value
        if isinstance(value, dict):
            # Don't template embedded file fields (binary base64, not text).
            if value.get("__file__"):
                return value
            return {k: self._substitute(v) for k, v in value.items()}
        if isinstance(value, list):
            return [self._substitute(item) for item in value]
        return value

    def _generate_dynamic(self, spec: str) -> str:
        """Support special generators like {{random_phone}}, {{random_email}}, {{uuid}} etc."""
        spec = spec.lower().strip()

        if spec == "random_email":
            return f"test{random.randint(100000, 9999999)}@mail.test"

        if spec == "random_phone":
            # Indonesian format: +62812xxxxxxxx (common mobile)
            return "+62812" + "".join(str(random.randint(0, 9)) for _ in range(8))

        if spec == "random_uuid" or spec == "uuid":
            return str(uuid.uuid4())

        if spec == "timestamp":
            return str(int(time.time() * 1000))

        # Bare versions (no params) - defaults
        if spec == "random_string":
            length = 8
            chars = string.ascii_letters + string.digits
            return ''.join(random.choice(chars) for _ in range(length))

        if spec == "random_number" or spec == "random_int":
            return str(random.randint(100000, 999999))

        # Parameterized versions
        if spec.startswith("random_int:"):
            # e.g. random_int:1000:9999
            try:
                parts = spec.split(":")
                min_v = int(parts[1])
                max_v = int(parts[2])
                return str(random.randint(min_v, max_v))
            except:
                return str(random.randint(1000, 9999))

        if spec.startswith("random_string:"):
            try:
                length = int(spec.split(":")[1])
                chars = string.ascii_letters + string.digits
                return ''.join(random.choice(chars) for _ in range(max(1, length)))
            except:
                return "rnd" + str(random.randint(100,999))

        # unknown - leave it (or return empty)
        return "{{" + spec + "}}"

    def _extract_from_response(self, resp):
        """Extract values from response body or headers and update variables (fresh token support)."""
        try:
            body = resp.json() if 'application/json' in resp.headers.get('content-type', '') else {}
        except Exception:
            body = {}

        for var_name, source in self.test.extractors.items():
            value = None
            src = source.lower()

            if src.startswith("body."):
                path = source[5:]
                cur = body
                for key in path.split("."):
                    if isinstance(cur, dict) and key in cur:
                        cur = cur[key]
                    elif isinstance(cur, list) and key.lstrip("-").isdigit() and \
                            -len(cur) <= int(key) < len(cur):
                        cur = cur[int(key)]
                    else:
                        cur = None
                        break
                value = cur

            elif "set-cookie" in src or "cookie" in src:
                # Basic Set-Cookie parsing
                set_cookie = resp.headers.get("Set-Cookie", "")
                if var_name.lower() in set_cookie.lower():
                    # crude parse access_token=xxx;
                    import re as _re
                    m = _re.search(rf"{var_name}=([^;]+)", set_cookie, _re.IGNORECASE)
                    if m:
                        value = m.group(1)

            if value is not None:
                self.config.variables[var_name] = str(value)
                self.log(f"[extract] {var_name} updated from response")

    def _build_request(self):
        url = self._substitute(self.test.url)
        if not url.startswith("http"):
            url = self.config.base_url.rstrip("/") + "/" + url.lstrip("/")

        headers = {k: self._substitute(v) for k, v in self.test.headers.items()}

        # Substitute inside payload (supports nested if present)
        raw_payload = self.test.payload or {}
        payload = self._substitute(raw_payload)

        return url, headers, payload

    def _do_request(self, session, url, headers, payload, timeout: int = 10):
        """Issue one HTTP request honoring payload_type. Shared by the load run
        and single-send so the two request paths never diverge."""
        ptype = (self.test.payload_type or "json").lower()
        if ptype == "form":
            return session.request(self.test.method, url, headers=headers, data=payload, timeout=timeout)
        if ptype == "multipart":
            # multipart/form-data — text fields + real file fields (base64-embedded)
            files = {}
            for k, v in (payload or {}).items():
                if isinstance(v, dict) and v.get("__file__"):
                    try:
                        content = base64.b64decode(v.get("data", "") or "")
                    except Exception:
                        content = b""
                    files[k] = (v.get("name") or "file", content, v.get("type") or "application/octet-stream")
                else:
                    files[k] = (None, str(v))
            # drop content-type so requests sets the correct multipart boundary
            h = {k: v for k, v in headers.items() if k.lower() != "content-type"}
            return session.request(self.test.method, url, headers=h, files=files, timeout=timeout)
        if ptype == "raw":
            # Raw body (text / XML / GraphQL / etc.). The Content-Type is whatever
            # the endpoint's headers declare; requests sends the bytes verbatim.
            body = payload if isinstance(payload, str) else json.dumps(payload)
            return session.request(self.test.method, url, headers=headers,
                                   data=body.encode("utf-8"), timeout=timeout)
        # json (default)
        return session.request(self.test.method, url, headers=headers, json=payload, timeout=timeout)

    def send_once(self, max_body: int = 262144, retries: int = 0, retry_delay: float = 0.0) -> Dict:
        """Fire a single request and return the full response for inspection
        (status, timing, headers, body). Applies templating and, on a 2xx,
        runs extractors just like a run — so 'Send login' refreshes tokens.
        Evaluates the endpoint's assertions against the response. Retries up to
        `retries` times (waiting `retry_delay`s between tries) while the request
        errors or returns a non-2xx. Never raises: errors come back as
        {ok: False, error: ...}."""
        url, headers, payload = self._build_request()
        total = max(0, int(retries)) + 1

        for attempt in range(1, total + 1):
            last = attempt == total
            start = time.time()
            try:
                resp = self._do_request(self._session(), url, headers, payload, timeout=30)
            except Exception as e:
                if last:
                    return {"ok": False, "error": str(e), "target": url,
                            "time_ms": round((time.time() - start) * 1000), "attempts": attempt}
                if retry_delay:
                    time.sleep(retry_delay)
                continue

            is_success = 200 <= resp.status_code < 300
            if not is_success and not last:
                if retry_delay:
                    time.sleep(retry_delay)
                continue

            elapsed_ms = round((time.time() - start) * 1000)
            text = resp.text or ""
            ctype = resp.headers.get("content-type", "")
            parsed = None
            if "application/json" in ctype.lower():
                try:
                    parsed = resp.json()
                except Exception:
                    parsed = None

            extracted: List[str] = []
            if is_success and getattr(self.test, "extractors", None):
                before = dict(self.config.variables)
                self._extract_from_response(resp)
                extracted = [k for k, v in self.config.variables.items() if before.get(k) != v]

            result = {
                "ok": True,
                "status": resp.status_code,
                "reason": getattr(resp, "reason", "") or "",
                "time_ms": elapsed_ms,
                "size_bytes": len(resp.content or b""),
                "truncated": len(text) > max_body,
                "content_type": ctype,
                "headers": dict(resp.headers),
                "body": text[:max_body],
                "json": parsed,
                "target": url,
                "extracted": extracted,
                "attempts": attempt,
            }
            result["assertions"] = evaluate_assertions(getattr(self.test, "assertions", None), result)
            result["passed"] = (all(a["ok"] for a in result["assertions"])
                                if result["assertions"] else None)
            return result

    def _send_one(self, i: int) -> Dict:
        if self.stop_flag.get("stop"):
            return {"status": "stopped"}

        url, headers, payload = self._build_request()

        start = time.time()
        try:
            session = self._session()
            resp = self._do_request(session, url, headers, payload, timeout=10)

            elapsed = time.time() - start
            is_success = 200 <= resp.status_code < 300
            retry_after = resp.headers.get("Retry-After")
            # Accurate throttle detection: prefer HTTP 429 / Retry-After, then
            # fall back to specific phrases. Avoid a bare "rate" substring — it
            # matches innocent words like "generate"/"accurate" and inflates the
            # rate_limited count that defense-validation runs depend on.
            text_lc = resp.text.lower()
            is_rate = (
                resp.status_code == 429
                or "rate limit" in text_lc
                or "ratelimit" in text_lc
                or "too many request" in text_lc
                or "too many attempt" in text_lc
            )

            with self._lock:
                self.results["attempts"] += 1
                if is_success:
                    self.results["success"] += 1
                elif is_rate:
                    self.results["rate_limited"] += 1
                    if self._first_rate_limited_at is None:
                        self._first_rate_limited_at = self.results["attempts"]
                    if retry_after:
                        self._last_retry_after = retry_after
                else:
                    self.results["errors"] += 1
                self._codes[str(resp.status_code)] = self._codes.get(str(resp.status_code), 0) + 1
                self._record_latency(elapsed * 1000.0)
                snapshot = self._snapshot()

            # === Process extractors (for fresh tokens from login/onboarding etc) ===
            if is_success and getattr(self.test, 'extractors', None):
                self._extract_from_response(resp)

            result = {
                "attempt": i,
                "method": self.test.method,
                "url": url,
                "status": resp.status_code,
                "time": round(elapsed, 3),
                "success": is_success,
                "rate_limited": is_rate,
                "retry_after": retry_after,
                "body": resp.text[:50000],
            }

            self.update_stats(snapshot)
            self.emit_response(result)
            self.log(f"[{i}] {self.test.name} {url} -> {resp.status_code} ({elapsed:.2f}s) {'SUCCESS' if is_success else 'FAIL'}")

            return result
        except Exception as e:
            with self._lock:
                self.results["attempts"] += 1
                self.results["errors"] += 1
                self._codes["error"] = self._codes.get("error", 0) + 1
                snapshot = self._snapshot()
            self.update_stats(snapshot)
            err = {
                "attempt": i,
                "method": self.test.method,
                "url": url,
                "error": str(e),
                "success": False,
            }
            self.emit_response(err)
            self.log(f"[{i}] ERROR: {str(e)}")
            return err

    def run(self):
        self._reset_metrics()
        self.update_stats(self._snapshot())

        if self.concurrency > 1:
            with ThreadPoolExecutor(max_workers=self.concurrency) as executor:
                futures = []
                for i in range(1, self.max_requests + 1):
                    if self.stop_flag.get("stop"):
                        break
                    futures.append(executor.submit(self._send_one, i))
                    if self.delay > 0:
                        time.sleep(self.delay)  # throttle submissions
                for f in as_completed(futures):
                    if self.stop_flag.get("stop"):
                        break
        else:
            for i in range(1, self.max_requests + 1):
                if self.stop_flag.get("stop"):
                    break
                self._send_one(i)
                if self.delay > 0:
                    time.sleep(self.delay)

        self.log(f"Finished. {self.results}")
        return self.results