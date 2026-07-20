# Web Page Load Testing

Beacon can load-test an HTML page in addition to API endpoints. A Web Page
target sends repeated HTTP document requests from the user's computer and uses
the same Load, Ramp, Spike, Soak, Rate Probe, and Benchmark modes as an API
request.

## Create a Web Page target

1. Select **New Endpoint**.
2. Change **Target type** to **Web Page**.
3. Enter a complete URL such as `https://example.com/`.
4. Save the target, select a Test Mode, and run it.

The preset uses `GET`, sends no request body, follows redirects, and adds safe
assertions for status, response time, and an HTML content type.

## What Beacon measures

- Attempts, successes, errors, and rate-limited responses
- Current and average request throughput
- Total latency and latency percentiles
- Time to first response headers (TTFB) on a single Send
- Response size, content type, redirects, and final URL
- Status-code distribution and the first observed throttle response

Beacon measures requests sent and responses received by its local runner. To
confirm how many requests reached the origin, compare the run with CDN, reverse
proxy, or application server logs.

## HTTP page load versus browser journey

A Web Page target requests the HTML document. It does not launch a browser,
execute JavaScript, render the page, or automatically download CSS, images,
fonts, and other subresources. This makes it appropriate for measuring high
request rates against a page route or CDN edge.

Use a browser automation tool when the test must click controls, submit forms,
measure Core Web Vitals, or reproduce a full user journey. Browser workers are
substantially heavier and should not be interpreted as the same workload as an
HTTP request load test.

::: warning Authorized targets only
Run load tests only against websites you own or have explicit permission to
test. Begin with low concurrency and a conservative request limit.
:::
