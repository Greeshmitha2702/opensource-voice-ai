from deep_translator import GoogleTranslator
PERSONA_LANGUAGE = {
    "Madhur": "hi-IN",
    "Swara": "hi-IN",
    "Karthik": "ta-IN",
    "Pallavi": "ta-IN",
    "Gagan": "kn-IN",
    "Sapna": "kn-IN",
    "Mohan": "te-IN",
    "Shruti": "te-IN",
    "Dhaval": "gu-IN",
    "Nirmala": "mr-IN",
    "Sagar": "bn-IN",
    "Kore": "en-US",
    "Jenny": "en-US",
    "Ryan": "en-GB",
    "Sonia": "en-GB",
    "Liam": "en-CA",
    "Natasha": "en-AU",
    "Remy": "fr-FR",
    "Eloise": "fr-FR",
    "Alvaro": "es-ES",
    "Elena": "es-ES",
    "Lukas": "de-DE",
    "Katrin": "de-DE",
    "Bibi": "it-IT",
    "Nanami": "ja-JP",
    "Keita": "ja-JP",
    "Zhiyu": "zh-CN",
    "Sun-Hi": "ko-KR",
    "Layla": "ar-AE",
    "Ali": "ar-AE",
    "Francisca": "pt-BR",
    "Antonio": "pt-BR",
}
import io
import edge_tts
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

router = APIRouter()


# Use the same VOICE_MAP as backend/app.py for consistency
VOICE_MAP = {
    "Madhur": "hi-IN-MadhurNeural",
    "Swara": "hi-IN-SwaraNeural",
    "Karthik": "ta-IN-ValluvarNeural",
    "Pallavi": "ta-IN-PallaviNeural",
    "Gagan": "kn-IN-GaganNeural",
    "Sapna": "kn-IN-SapnaNeural",
    "Mohan": "te-IN-MohanNeural",
    "Shruti": "te-IN-ShrutiNeural",
    "Dhaval": "gu-IN-DhavalNeural",
    "Nirmala": "mr-IN-NirmalaNeural",
    "Sagar": "bn-IN-BashkarNeural",
    "Kore": "en-US-ChristopherNeural",
    "Jenny": "en-US-JennyNeural",
    "Ryan": "en-GB-RyanNeural",
    "Sonia": "en-GB-SoniaNeural",
    "Liam": "en-CA-LiamNeural",
    "Natasha": "en-AU-NatashaNeural",
    "Remy": "fr-FR-RemyNeural",
    "Eloise": "fr-FR-EloiseNeural",
    "Alvaro": "es-ES-AlvaroNeural",
    "Elena": "es-ES-ElviraNeural",
    "Lukas": "de-DE-KillianNeural",
    "Katrin": "de-DE-KatjaNeural",
    "Bibi": "it-IT-ElsaNeural",
    "Nanami": "ja-JP-NanamiNeural",
    "Keita": "ja-JP-KeitaNeural",
    "Zhiyu": "zh-CN-XiaoxiaoNeural",
    "Sun-Hi": "ko-KR-SunHiNeural",
    "Layla": "ar-AE-FatimaNeural",
    "Ali": "ar-AE-HamdanNeural",
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
    try:
        # Use frontend voice name mapping
        # Fallback logic: if not found, try to fallback to a language group
        voice_id = VOICE_MAP.get(req.voice)
        if not voice_id:
            voice_id = VOICE_MAP["Kore"]  # Default to English male

        # Translate text to target language if needed
        lang_code = PERSONA_LANGUAGE.get(req.voice, "en-US")
        text = req.text
        # Only translate if not English
        if not lang_code.startswith("en"):
            # GoogleTranslator expects short language code (e.g., 'ta', 'hi', etc.)
            short_code = lang_code.split("-")[0]
            try:
                text = GoogleTranslator(source='auto', target=short_code).translate(req.text)
            except Exception as e:
                pass  # fallback to original text if translation fails
        base_pitch = int(req.pitch)
        base_speed = float(req.speed)
        emotion = req.emotion

        # --- VIRTUAL EMOTION ENGINE ---
        if emotion == "Cheerful":
            base_pitch += 15
            base_speed += 0.1
        elif emotion == "Angry":
            base_pitch -= 10
            base_speed += 0.2
        elif emotion == "Sad":
            base_pitch -= 15
            base_speed -= 0.2
        elif emotion == "Excited":
            base_pitch += 20
            base_speed += 0.2
        elif emotion == "Whispering":
            base_pitch -= 5
            base_speed -= 0.3

        final_pitch = f"{base_pitch:+d}Hz"
        final_rate = f"{int((base_speed - 1) * 100):+d}%"


        communicate = edge_tts.Communicate(
            text=text,
            voice=voice_id,
            rate=final_rate,
            pitch=final_pitch
        )

        audio_bytes = b""
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_bytes += chunk["data"]

        # Save to MongoDB history
        from backend.app import save_voice_history
        save_voice_history(
            text=req.text,
            voice=req.voice,
            emotion=emotion,
            pitch=base_pitch,
            speed=base_speed
        )

        return StreamingResponse(
            io.BytesIO(audio_bytes),
            media_type="audio/mpeg"
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
