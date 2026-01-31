from fastapi.staticfiles import StaticFiles
import os
import edge_tts
import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from deep_translator import GoogleTranslator
# MongoDB imports
from pymongo import MongoClient
from datetime import datetime


from backend.routes import history, tts

app = FastAPI(title="VoxOpen AI Backend")

# Enable CORS for React frontend
"""
MongoDB Setup
"""
MONGO_URI = "mongodb+srv://bingumallagreeshmitha_db_user:Blg270206@mongo-cluster.mm65oeb.mongodb.net/"
client = MongoClient(MONGO_URI)
db = client["voice_ai_db"]
voice_history_collection = db["voice_history"]
app.voice_history_collection = voice_history_collection

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

# CORS: Allow all origins since frontend is served by backend (single deployment)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register history router
app.include_router(history.router, prefix="/api")
app.include_router(tts.router, prefix="/api")

# Serve React frontend build as static files (MUST be after all API routes)
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "../frontend/dist"))

def mount_static(app):
    if os.path.exists(frontend_dist):
        app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="static")

mount_static(app)

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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)