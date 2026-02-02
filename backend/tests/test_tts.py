from __future__ import annotations

import asyncio
import json
from pathlib import Path


def test_tts_requires_text(app_ctx):
    res = app_ctx.client.post("/api/tts", json={"text": "  ", "voice": "Kore"})
    assert res.status_code == 200
    assert res.json()["warning"]


def test_tts_blocks_sensitive_text(app_ctx):
    res = app_ctx.client.post("/api/tts", json={"text": "kill", "voice": "Kore"})
    assert res.status_code == 200
    assert "sensitive" in res.json()["warning"].lower()


def test_tts_returns_audio_bytes_offline(app_ctx, monkeypatch):
    payload = json.loads(Path(__file__).with_name("data").joinpath("tts_request_en.json").read_text(encoding="utf-8"))

    # English voice -> no translation call needed, but keep it safe anyway
    class _FakeTranslator:
        def __init__(self, source: str, target: str):
            pass

        def translate(self, text: str) -> str:
            return text

    monkeypatch.setattr("backend.routes.tts.GoogleTranslator", _FakeTranslator)

    # Fake edge_tts stream
    class _FakeCommunicate:
        def __init__(self, text: str, voice: str, rate: str, pitch: str):
            self.text = text

        async def stream(self):
            yield {"type": "audio", "data": b"FAKE_MP3_BYTES"}

    monkeypatch.setattr("backend.routes.tts.edge_tts.Communicate", _FakeCommunicate)

    res = app_ctx.client.post("/api/tts", json=payload)
    assert res.status_code == 200
    assert res.headers["content-type"].startswith("audio/")
    assert res.content == b"FAKE_MP3_BYTES"


def test_tts_translates_for_non_english_voice(app_ctx, monkeypatch):
    payload = json.loads(Path(__file__).with_name("data").joinpath("tts_request_non_en.json").read_text(encoding="utf-8"))

    translated_calls = {"count": 0}

    class _FakeTranslator:
        def __init__(self, source: str, target: str):
            self.target = target

        def translate(self, text: str) -> str:
            translated_calls["count"] += 1
            return "नमस्ते"  # deterministic fake translation

    monkeypatch.setattr("backend.routes.tts.GoogleTranslator", _FakeTranslator)

    class _FakeCommunicate:
        def __init__(self, text: str, voice: str, rate: str, pitch: str):
            # ensure we used translated text
            assert text == "नमस्ते"

        async def stream(self):
            yield {"type": "audio", "data": b"FAKE_NON_EN"}

    monkeypatch.setattr("backend.routes.tts.edge_tts.Communicate", _FakeCommunicate)

    res = app_ctx.client.post("/api/tts", json=payload)
    assert res.status_code == 200
    assert res.content == b"FAKE_NON_EN"
    assert translated_calls["count"] == 1
