import io
import edge_tts
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

router = APIRouter()

VOICE_MAP = {
    # English
    "en": "en-US-JennyNeural",

    # South Indian
    "ta": "ta-IN-PallaviNeural",   # Tamil
    "te": "te-IN-ShrutiNeural",    # Telugu
    "kn": "kn-IN-SapnaNeural",     # Kannada
    "ml": "ml-IN-SobhanaNeural",   # Malayalam

    # North Indian
    "hi": "hi-IN-SwaraNeural",     # Hindi
    "mr": "mr-IN-AarohiNeural",    # Marathi
    "bn": "bn-IN-TanishaaNeural",  # Bengali
    "gu": "gu-IN-DhwaniNeural",    # Gujarati
    "pa": "pa-IN-GurpreetNeural",  # Punjabi
}


class TTSRequest(BaseModel):
    text: str
    voice: str = "Kore"
    language: str = "en"
    emotion: str = "Neutral"
    speed: float = 1.0
    pitch: float = 0.0   # 👈 new


@router.post("/tts")
async def text_to_speech(req: TTSRequest):
    try:
        voice = VOICE_MAP.get(req.language, VOICE_MAP["en"])
        rate = int((req.speed - 1) * 100)
        rate_str = f"{'+' if rate >= 0 else ''}{rate}%"
        pitch = int(req.pitch)
        pitch_str = f"{'+' if pitch >= 0 else ''}{pitch}Hz"

        communicate = edge_tts.Communicate(
    text=req.text,
    voice=voice,
    rate=rate_str,
    pitch=pitch_str
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
