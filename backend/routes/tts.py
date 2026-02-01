from deep_translator import GoogleTranslator
import io
import edge_tts

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel

from .utils import contains_sensitive

router = APIRouter()

# Persona → Language
PERSONA_LANGUAGE = {
    # Hindi
    "Madhur": "hi-IN",
    "Swara": "hi-IN",
    # Tamil
    "Karthik": "ta-IN",
    "Pallavi": "ta-IN",
    # Kannada
    "Gagan": "kn-IN",
    "Sapna": "kn-IN",
    # Telugu
    "Mohan": "te-IN",
    "Shruti": "te-IN",
    # Bengali
    "Sagar": "bn-IN",
    "Tanishaa": "bn-IN",
    # English
    "Kore": "en-US",
    "Jenny": "en-US",
    "Ryan": "en-GB",
    "Sonia": "en-GB",
    "Liam": "en-CA",
    "Natasha": "en-AU",
    # French
    "Eloise": "fr-FR",
    # Spanish
    "Alvaro": "es-ES",
    "Elena": "es-ES",
    # German
    "Lukas": "de-DE",
    "Katrin": "de-DE",
    # Italian
    "Bibi": "it-IT",
    # Japanese
    "Nanami": "ja-JP",
    "Keita": "ja-JP",
    # Chinese
    "Zhiyu": "zh-CN",
    # Korean
    "Sun-Hi": "ko-KR",
    # Arabic
    "Layla": "ar-AE",
    "Ali": "ar-AE",
    # Portuguese
    "Francisca": "pt-BR",
    "Antonio": "pt-BR",
}

# Persona → Real Microsoft Voice ID
VOICE_MAP = {
    # Hindi
    "Madhur": "hi-IN-MadhurNeural",
    "Swara": "hi-IN-SwaraNeural",
    # Tamil
    "Karthik": "ta-IN-ValluvarNeural",
    "Pallavi": "ta-IN-PallaviNeural",
    # Kannada
    "Gagan": "kn-IN-GaganNeural",
    "Sapna": "kn-IN-SapnaNeural",
    # Telugu
    "Mohan": "te-IN-MohanNeural",
    "Shruti": "te-IN-ShrutiNeural",
    # Bengali
    "Sagar": "bn-IN-BashkarNeural",
    "Tanishaa": "bn-IN-TanishaaNeural",
    # English
    "Kore": "en-US-ChristopherNeural",
    "Jenny": "en-US-JennyNeural",
    "Ryan": "en-GB-RyanNeural",
    "Sonia": "en-GB-SoniaNeural",
    "Liam": "en-CA-LiamNeural",
    "Natasha": "en-AU-NatashaNeural",
    # French
    "Eloise": "fr-FR-EloiseNeural",
    # Spanish
    "Alvaro": "es-ES-AlvaroNeural",
    "Elena": "es-ES-ElviraNeural",
    # German
    "Lukas": "de-DE-KillianNeural",
    "Katrin": "de-DE-KatjaNeural",
    # Italian
    "Bibi": "it-IT-ElsaNeural",
    # Japanese
    "Nanami": "ja-JP-NanamiNeural",
    "Keita": "ja-JP-KeitaNeural",
    # Chinese
    "Zhiyu": "zh-CN-XiaoxiaoNeural",
    # Korean
    "Sun-Hi": "ko-KR-SunHiNeural",
    # Arabic
    "Layla": "ar-AE-FatimaNeural",
    "Ali": "ar-AE-HamdanNeural",
    # Portuguese
    "Francisca": "pt-BR-FranciscaNeural",
    "Antonio": "pt-BR-AntonioNeural",
}

class TTSRequest(BaseModel):
    text: str
    voice: str = "Kore"
    emotion: str = "Neutral"
    speed: float = 1.0
    pitch: float = 0


@router.post("/tts")
async def text_to_speech(req: TTSRequest):

    if not req.text or not req.text.strip():
        return JSONResponse({"warning": "Input text is required."})

    # Sensitive check
    if contains_sensitive(req.text):
        return JSONResponse({"warning": "Input contains sensitive language."})

    # Strict persona → language
    lang_code = PERSONA_LANGUAGE.get(req.voice, "en-US")
    short_code = lang_code.split("-")[0]

    # Strict persona → voice
    voice_id = VOICE_MAP.get(req.voice)
    if not voice_id:
        voice_id = VOICE_MAP["Kore"]

    # Translate if needed
    translated_text = req.text
    if not lang_code.startswith("en"):
        translated_text = GoogleTranslator(
            source="auto",
            target=short_code
        ).translate(req.text)

    print(f"[TTS DEBUG] Persona={req.voice}")
    print(f"[TTS DEBUG] Lang={lang_code}")
    print(f"[TTS DEBUG] VoiceID={voice_id}")
    print(f"[TTS DEBUG] FinalText={translated_text}")

    # Emotion engine
    base_pitch = int(req.pitch)
    base_speed = float(req.speed)

    if req.emotion == "Cheerful":
        base_pitch += 15
        base_speed += 0.1
    elif req.emotion == "Angry":
        base_pitch -= 10
        base_speed += 0.2
    elif req.emotion == "Sad":
        base_pitch -= 15
        base_speed -= 0.2
    elif req.emotion == "Excited":
        base_pitch += 20
        base_speed += 0.2
    elif req.emotion == "Whispering":
        base_pitch -= 5
        base_speed -= 0.3

    final_pitch = f"{base_pitch:+d}Hz"
    final_rate = f"{int((base_speed - 1) * 100):+d}%"

    try:
        communicate = edge_tts.Communicate(
            text=translated_text,
            voice=voice_id,
            rate=final_rate,
            pitch=final_pitch
        )

        audio_bytes = b""
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_bytes += chunk["data"]

        if not audio_bytes:
            return JSONResponse({"error": "No audio generated."}, status_code=500)

        return StreamingResponse(
            io.BytesIO(audio_bytes),
            media_type="audio/mpeg"
        )

    except Exception as e:
        print("[ERROR]", e)
        return JSONResponse({"error": str(e)}, status_code=500)
