
import sys
import os
import pytest
from fastapi.testclient import TestClient
import io

# Ensure backend is in sys.path for import
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from backend.app import app

client = TestClient(app)

def test_save_uploaded_history_valid():
    response = client.post(
        "/api/history",
        data={"text": "Hello world", "voice": "Madhur", "emotion": "happy", "pitch": 1, "speed": 1.0},
        files={"file": ("test.wav", io.BytesIO(b"fake audio"), "audio/wav")}
    )
    assert response.status_code == 200
    assert response.json().get("status") == "ok"


def test_save_uploaded_history_sensitive():
    # Try multiple sensitive words to confirm filter works
    sensitive_texts = [
        "This is shit",
        "You are a bitch",
        "fuck you",
        "kill them",
        "nigger",
        "terrorist attack"
    ]
    for stext in sensitive_texts:
        response = client.post(
            "/api/history",
            data={"text": stext, "voice": "Madhur", "emotion": "angry", "pitch": 1, "speed": 1.0},
            files={"file": ("test.wav", io.BytesIO(b"fake audio"), "audio/wav")}
        )
        assert response.status_code == 200
        assert "warning" in response.json(), f"Failed for input: {stext} got {response.json()}"
        assert response.json()["warning"] == "Input contains sensitive or inappropriate language."

def test_tts_sensitive():
    # Simulate a TTS request with a sensitive word
    payload = {
        "text": "You are a bitch",
        "voice": "Madhur",
        "emotion": "angry",
        "pitch": 1,
        "speed": 1.0
    }
    response = client.post("/api/tts", json=payload)
    assert response.status_code == 200
    # If response is JSON, check for warning, else it is audio (should not happen for sensitive input)
    try:
        data = response.json()
        assert "warning" in data
        assert data["warning"] == "Input contains sensitive or inappropriate language."
    except Exception:
        assert False, "Expected JSON warning for sensitive input, got audio/mpeg instead."

def test_get_voice_history():
    response = client.get("/api/history")
    assert response.status_code == 200
    assert "history" in response.json()
    assert isinstance(response.json()["history"], list)
