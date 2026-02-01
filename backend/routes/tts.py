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
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel

import re
import unicodedata

from .utils import contains_sensitive, normalize_text

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
    # Debug: print received request
    print(f"[DEBUG] Received TTS request: text={getattr(req, 'text', None)} voice={getattr(req, 'voice', None)} emotion={getattr(req, 'emotion', None)}")
    # Always check for sensitive words, even if text is empty or missing
    text = getattr(req, 'text', '')
    if not text or not isinstance(text, str) or not text.strip():
        print("[DEBUG] Empty or missing text field in TTS request")
        return JSONResponse({"warning": "Input text is required and cannot be empty."})
    # Map voice to language code for translation and TTS
    persona_lang = PERSONA_LANGUAGE.get(req.voice, "en-US")
    # Find the first matching voice in VOICE_MAP for the selected language
    voice_id = None
    for vname, vid in VOICE_MAP.items():
        if persona_lang in vid:
            voice_id = vid
            break
    if not voice_id:
        voice_id = VOICE_MAP.get(req.voice, VOICE_MAP["Kore"])
    lang_code = persona_lang
    translated_text = text
    short_code = lang_code.split("-")[0]
    from deep_translator import GoogleTranslator
    try:
        if not lang_code.startswith("en"):
            translated_text = GoogleTranslator(source='auto', target=short_code).translate(text)
        # Always try to translate to English for robust detection
        translated_to_en = GoogleTranslator(source='auto', target='en').translate(text)
    except Exception:
        translated_to_en = text
    # Check all relevant user input fields for sensitive words
    user_inputs = [text, translated_text, translated_to_en]
    for label, value in zip(["original", "translated", "translated_to_en"], user_inputs):
        if contains_sensitive(value):
            print(f"[DEBUG] Sensitive detected in {label}: {value}")
            return JSONResponse({"warning": "Input contains sensitive or inappropriate language."}, media_type="application/json")
    try:
        # Use frontend voice name mapping
        # Fallback logic: if not found, try to fallback to a language group
        voice_id = VOICE_MAP.get(req.voice)
        if not voice_id:
            voice_id = VOICE_MAP["Kore"]  # Default to English male

        print(f"[TTS DEBUG] Persona: {req.voice}, Input: {req.text}, Translated: {translated_text}, Lang: {lang_code}, Short: {short_code}, VoiceID: {voice_id}")
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
        try:
            from .history import save_voice_history
        except ImportError:
            from app import save_voice_history
        save_voice_history(
            text=translated_text,
            voice=req.voice,
            emotion=emotion,
            pitch=base_pitch,
            speed=base_speed
        )

        if not audio_bytes:
            print("[ERROR] No audio generated for input.")
            return JSONResponse({"error": "No audio generated. Please try again with different input."}, status_code=500)

        return StreamingResponse(
            io.BytesIO(audio_bytes),
            media_type="audio/mpeg"
        )

    except Exception as e:
        print(f"[ERROR] Exception in TTS: {e}")
        return JSONResponse({"error": f"TTS failed: {str(e)}"}, status_code=500)
