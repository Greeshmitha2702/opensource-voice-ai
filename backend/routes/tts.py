import io
import edge_tts
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

router = APIRouter()

VOICE_MAP = {
    "Kore": "en-US-ChristopherNeural",
    "Puck": "en-GB-ThomasNeural",
    "Charon": "en-US-EricNeural",
    "Fenrir": "en-AU-WilliamNeural",
    "Zephyr": "en-US-JennyNeural",
}

class TTSRequest(BaseModel):
    text: str
    voice: str
    language: str
    emotion: str = "Neutral"
    speed: float = 1.0

@router.post("/tts")
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
