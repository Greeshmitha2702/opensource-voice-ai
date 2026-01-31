from fastapi import APIRouter, HTTPException
from pymongo import MongoClient
from bson import ObjectId
import os

router = APIRouter()

# MongoDB connection (reuse from app.py if possible)
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI)
db = client["voice_ai_db"]
voice_history_collection = db["voice_history"]

@router.get("/history")
def get_voice_history():
    try:
        # Get last 20 history items, newest first
        history = list(voice_history_collection.find().sort("timestamp", -1).limit(20))
        for item in history:
            item["_id"] = str(item["_id"])
            item["timestamp"] = item["timestamp"].isoformat() if "timestamp" in item else None
        return {"history": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
