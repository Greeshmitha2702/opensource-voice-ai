import edge_tts
import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from deep_translator import GoogleTranslator

app = FastAPI(title="VoxOpen AI Backend")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Voice Mapping: Frontend Name -> Microsoft Neural ID
VOICE_MAP = {
<<<<<<< HEAD
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
    "Kore": "en-US-ChristopherNeural",
    "Jenny": "en-US-JennyNeural",
    "Ryan": "en-GB-RyanNeural",
    "Sonia": "en-GB-SoniaNeural",
    "Remy": "fr-FR-RemyNeural",
    "Eloise": "fr-FR-EloiseNeural",
    "Alvaro": "es-ES-AlvaroNeural",
    "Nanami": "ja-JP-NanamiNeural",
}

=======
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


# ---------------- MODELS ----------------
class TTSRequest(BaseModel):
    text: str
    voice: str = "Kore"
    language: str = "en"
    emotion: str = "Neutral"
    speed: float = 1.0
    pitch: float = 0.0   # 👈 new



# ---------------- ROUTES ----------------
@app.get("/")
def health_check():
    return {"status": "Backend running ✅"}

@app.post("/api/translate")
def translate_text(payload: dict):
    try:
        text = payload.get("text", "")
        target = payload.get("target_lang", "en")
        translated = GoogleTranslator(source="auto", target=target).translate(text)
        return {"translatedText": translated}
    except Exception as e:
        return {"translatedText": text, "error": str(e)}

>>>>>>> origin/main
@app.post("/api/tts")
async def text_to_speech(data: dict):
    try:
        text = data.get("text", "")
        raw_voice = data.get("voice", "Kore")
        voice_id = VOICE_MAP.get(raw_voice, raw_voice)
        
        # Get base values from frontend
        base_pitch = int(data.get('pitch', 0))
        base_speed = float(data.get('speed', 1.0))
        emotion = data.get("emotion", "Neutral")

        # --- VIRTUAL EMOTION ENGINE ---
        # Since Edge API blocks the 'express-as' tag, we simulate emotions
        # by overriding pitch and speed based on the selected emotion.
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

        # Format for edge-tts
        final_pitch = f"{base_pitch:+d}Hz"
        final_rate = f"{int((base_speed - 1) * 100):+d}%"

        # Automatic Translation Logic
        target_lang_code = voice_id.split('-')[0] 
        if target_lang_code != 'en' and text.strip():
            try:
                text = GoogleTranslator(source='auto', target=target_lang_code).translate(text)
            except Exception as trans_err:
                print(f"Translation error: {trans_err}")

        # Neural Synthesis (Back to plain text for Edge API compatibility)
        communicate = edge_tts.Communicate(text, voice_id, pitch=final_pitch, rate=final_rate)
        audio_data = b""
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_data += chunk["data"]

        if not audio_data:
            raise Exception("TTS engine failed to generate audio.")

        return Response(content=audio_data, media_type="audio/mpeg")

    except Exception as e:
        print(f"Backend Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)