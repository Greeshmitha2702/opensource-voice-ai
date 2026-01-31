from deep_translator import GoogleTranslator
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
    # Gujarati
    # Marathi
    # Bengali
    "Sagar": "bn-IN",
    "Tanishaa": "bn-IN",
    # English (US/UK/CA/AU)
    "Kore": "en-US",
    "Jenny": "en-US",
    "Eric": "en-US",
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
    # Portuguese (Brazil)
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
    # Add Telugu female (Shruti) and male (Mohan) if not present
        # Add fallback for any missing male/female voices for all languages
        # Marathi
        "Aarohi": "mr-IN-AarohiNeural",
        # Bengali
        "Tanishaa": "bn-IN-TanishaaNeural",
        # Gujarati
        "Dhwani": "gu-IN-DhwaniNeural",
        # French
        "Henri": "fr-FR-HenriNeural",
        # Italian
        "Elsa": "it-IT-ElsaNeural",
    # Gujarati
    # Marathi
    # Bengali
    "Sagar": "bn-IN-BashkarNeural",
    "Tanishaa": "bn-IN-TanishaaNeural",
    # English (US/UK/CA/AU)
    "Kore": "en-US-ChristopherNeural",
    "Jenny": "en-US-JennyNeural",
    "Eric": "en-US-EricNeural",
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
    # Portuguese (Brazil)
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
        translated_text = req.text
        short_code = lang_code.split("-")[0]
        try:
            if not lang_code.startswith("en"):
                translated_text = GoogleTranslator(source='auto', target=short_code).translate(req.text)
                text = translated_text
            print(f"[TTS DEBUG] Persona: {req.voice}, Input: {req.text}, Translated: {translated_text}, Lang: {lang_code}, Short: {short_code}, VoiceID: {voice_id}")
        except Exception as e:
            print(f"Translation error for {req.voice} ({short_code}): {e}")
            translated_text = req.text
            text = req.text
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

        # Save to MongoDB history (store translated text for verification)
        from backend.app import save_voice_history
        save_voice_history(
            text=translated_text,
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
