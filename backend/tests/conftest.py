from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Any, Iterable

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient


class _FakeCursor:
    def __init__(self, items: list[dict[str, Any]]):
        self._items = items

    def sort(self, key: str, direction: int):
        reverse = direction == -1
        self._items.sort(key=lambda x: x.get(key), reverse=reverse)
        return self

    def limit(self, n: int):
        self._items = self._items[:n]
        return self

    def __iter__(self) -> Iterable[dict[str, Any]]:
        return iter(self._items)


class FakeHistoryCollection:
    def __init__(self):
        self.items: list[dict[str, Any]] = []

    def insert_one(self, doc: dict[str, Any]):
        doc = dict(doc)
        doc.setdefault("_id", str(len(self.items) + 1))
        doc.setdefault("timestamp", datetime.utcnow())
        self.items.append(doc)
        return {"inserted_id": doc["_id"]}

    def find(self):
        return _FakeCursor(list(self.items))


@dataclass
class AppContext:
    app: FastAPI
    client: TestClient
    history_collection: FakeHistoryCollection


@pytest.fixture()
def app_ctx(monkeypatch: pytest.MonkeyPatch) -> AppContext:
    """Build a minimal FastAPI app for tests (no real Mongo / no network)."""

    # Import routers (safe; doesn't touch MongoDB)
    from backend.routes import history, tts, translate

    app = FastAPI()
    history_collection = FakeHistoryCollection()

    # seed a couple of docs for GET /history sorting
    now = datetime.utcnow()
    history_collection.insert_one({
        "text": "older",
        "voice": "Kore",
        "emotion": "Neutral",
        "pitch": 0,
        "speed": 1.0,
        "timestamp": now - timedelta(minutes=5),
    })
    history_collection.insert_one({
        "text": "newer",
        "voice": "Kore",
        "emotion": "Neutral",
        "pitch": 0,
        "speed": 1.0,
        "timestamp": now,
    })

    # Attach fake DB collection where routes expect it
    app.voice_history_collection = history_collection

    app.include_router(history.router, prefix="/api")
    app.include_router(tts.router, prefix="/api")
    app.include_router(translate.router, prefix="/api")

    client = TestClient(app)
    return AppContext(app=app, client=client, history_collection=history_collection)
