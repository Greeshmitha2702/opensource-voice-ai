from __future__ import annotations

import json
from pathlib import Path


def test_history_get_returns_latest_first(app_ctx):
    res = app_ctx.client.get("/api/history")
    assert res.status_code == 200
    body = res.json()
    assert "history" in body
    assert len(body["history"]) >= 2
    assert body["history"][0]["text"] == "newer"


def test_history_post_saves_document_offline(app_ctx, monkeypatch):
    form = json.loads(Path(__file__).with_name("data").joinpath("history_form.json").read_text(encoding="utf-8"))

    # Avoid network translation in the history endpoint
    class _FakeTranslator:
        def __init__(self, source: str, target: str):
            pass

        def translate(self, text: str) -> str:
            return text

    monkeypatch.setattr("deep_translator.GoogleTranslator", _FakeTranslator)

    files = {"file": ("sample.wav", b"FAKEWAV", "audio/wav")}
    res = app_ctx.client.post(
        "/api/history",
        data={
            "text": form["text"],
            "voice": form["voice"],
            "emotion": form["emotion"],
            "pitch": str(form["pitch"]),
            "speed": str(form["speed"]),
        },
        files=files,
    )

    assert res.status_code == 200
    assert res.json()["status"] == "ok"

    # Confirm something was inserted
    assert any(item.get("text") == form["text"] for item in app_ctx.history_collection.items)


def test_history_post_blocks_sensitive(app_ctx, monkeypatch):
    class _FakeTranslator:
        def __init__(self, source: str, target: str):
            pass

        def translate(self, text: str) -> str:
            return text

    monkeypatch.setattr("deep_translator.GoogleTranslator", _FakeTranslator)

    files = {"file": ("sample.wav", b"FAKEWAV", "audio/wav")}
    res = app_ctx.client.post(
        "/api/history",
        data={"text": "kill", "voice": "Kore", "emotion": "Neutral", "pitch": "0", "speed": "1.0"},
        files=files,
    )

    assert res.status_code == 200
    assert "warning" in res.json()
