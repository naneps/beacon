"""Persistence boundary.

The rest of the app talks to a `Repository` and never touches storage
directly. Today it's a JSON file; swapping to SQLite/Postgres later means
adding one implementation and injecting it into `Store` — no router or
domain-logic changes.

Persisted shape (a plain dict):
    {
        "current_project_id": str | None,
        "projects": [ {...} ],
        "global_variables": { ... }
    }
"""
import json
import os
from abc import ABC, abstractmethod
from typing import Optional

CONFIG_FILE = "config/tests.json"


class Repository(ABC):
    @abstractmethod
    def load(self) -> Optional[dict]:
        """Return the persisted dict, or None if nothing is stored yet."""

    @abstractmethod
    def save(self, data: dict) -> None:
        """Persist the given dict."""


class JsonRepository(Repository):
    """Stores everything in a single JSON file (rewritten on each save)."""

    def __init__(self, path: str = CONFIG_FILE):
        self.path = path

    def load(self) -> Optional[dict]:
        if not os.path.exists(self.path):
            return None
        with open(self.path, "r", encoding="utf-8") as f:
            return json.load(f)

    def save(self, data: dict) -> None:
        """Write atomically: dump to a sibling temp file, flush to disk, then
        rename over the target. A crash or a concurrent writer can only ever see
        the whole old file or the whole new one — never a truncated/torn mix that
        would corrupt the config. Mirrors the desktop shell's atomic config write."""
        directory = os.path.dirname(self.path)
        if directory:
            os.makedirs(directory, exist_ok=True)
        tmp = self.path + ".tmp"
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
            f.flush()
            os.fsync(f.fileno())
        os.replace(tmp, self.path)  # atomic on the same volume, incl. Windows
