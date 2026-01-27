import io
import edge_tts
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from deep_translator import GoogleTranslator

app = FastAPI(title="VoxOpen AI Backend")

# ✅ Enable CORS (REQUIRED for frontend connection)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # OK for development
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🎙 Voice mapping
VOICE_MAP = {
    "Kore": "en-US-ChristopherNeural",
    "Puck": "en-GB-ThomasNeural",
    "Charon": "en-US-EricNeural",
    "Fenrir": "en-AU-WilliamNeural",
    "Zephyr": "en-US-JennyNeural",
}

# ---------- Models ----------
class TTSRequest(BaseModel):
    text: str
    voice: str
    language: str
    emotion: str = "Neutral"
    speed: float = 1.0


# ---------- Routes ----------
@app.get("/")
def health():
    return {"status": "Backend running"}


@app.post("/api/translate")
async def translate(data: dict):
    try:
        text = data.get("text", "")
        target_lang = data.get("target_lang", "en")
        translated = GoogleTranslator(
            source="auto",
            target=target_lang
        ).translate(text)
        return {"translatedText": translated}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/tts")
async def text_to_speech(req: TTSRequest):
    try:
        voice = VOICE_MAP.get(req.voice, "en-US-ChristopherNeural")
        rate = int((req.speed - 1) * 100)
        rate_str = f"{'+' if rate >= 0 else ''}{rate}%"

        communicate = edge_tts.Communicate(
            text=req.text,
            voice=voice,
            rate=rate_str
        )

        audio_bytes = b""
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_bytes += chunk["data"]

        return StreamingResponse(
            io.BytesIO(audio_bytes),
            media_type="audio/mpeg"
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
