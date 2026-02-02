from __future__ import annotations

import json
from pathlib import Path


def test_translate_ok(app_ctx, monkeypatch):
    data = json.loads(Path(__file__).with_name("data").joinpath("translate_request.json").read_text(encoding="utf-8"))

    class _FakeTranslator:
        def __init__(self, source: str, target: str):
            self.source = source
            self.target = target

        def translate(self, text: str) -> str:
            return "hola mundo"

    monkeypatch.setattr("backend.routes.translate.GoogleTranslator", _FakeTranslator)

    res = app_ctx.client.post("/api/translate", json=data)
    assert res.status_code == 200
    assert res.json()["translatedText"] == "hola mundo"
