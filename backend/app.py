import edge_tts
import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from deep_translator import GoogleTranslator
# MongoDB imports
from pymongo import MongoClient
from datetime import datetime


from routes import history

app = FastAPI(title="VoxOpen AI Backend")

# Enable CORS for React frontend
"""
MongoDB Setup
"""
# Replace with your MongoDB connection string
MONGO_URI = "mongodb://localhost:27017/"
client = MongoClient(MONGO_URI)
db = client["voice_ai_db"]
voice_history_collection = db["voice_history"]

# Helper to save voice history
def save_voice_history(text, voice, emotion, pitch, speed, timestamp=None):
    doc = {
        "text": text,
        "voice": voice,
        "emotion": emotion,
        "pitch": pitch,
        "speed": speed,
        "timestamp": timestamp or datetime.utcnow()
    }
    voice_history_collection.insert_one(doc)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register history router
app.include_router(history.router, prefix="/api")

# Voice Mapping: Frontend Name -> Microsoft Neural ID
VOICE_MAP = {
    # Existing Indian Voices
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

    # English Global
    "Kore": "en-US-ChristopherNeural",
    "Jenny": "en-US-JennyNeural",
    "Ryan": "en-GB-RyanNeural",
    "Sonia": "en-GB-SoniaNeural",
    "Liam": "en-CA-LiamNeural",
    "Natasha": "en-AU-NatashaNeural",

    # European
    "Remy": "fr-FR-RemyNeural",
    "Eloise": "fr-FR-EloiseNeural",
    "Alvaro": "es-ES-AlvaroNeural",
    "Elena": "es-ES-ElviraNeural",
    "Lukas": "de-DE-KillianNeural",
    "Katrin": "de-DE-KatjaNeural",
    "Bibi": "it-IT-ElsaNeural",

    # Asian & Middle East
    "Nanami": "ja-JP-NanamiNeural",
    "Keita": "ja-JP-KeitaNeural",
    "Zhiyu": "zh-CN-XiaoxiaoNeural",
    "Sun-Hi": "ko-KR-SunHiNeural",
    "Layla": "ar-AE-FatimaNeural",
    "Ali": "ar-AE-HamdanNeural",

    # South American
    "Francisca": "pt-BR-FranciscaNeural",
    "Antonio": "pt-BR-AntonioNeural",
}

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


        # Save to MongoDB
        save_voice_history(
            text=data.get("text", ""),
            voice=raw_voice,
            emotion=emotion,
            pitch=base_pitch,
            speed=base_speed
        )

        return Response(content=audio_data, media_type="audio/mpeg")

    except Exception as e:
        print(f"Backend Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)