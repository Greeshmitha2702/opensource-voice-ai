from fastapi import APIRouter, HTTPException, Request, UploadFile, File
from fastapi.responses import JSONResponse
from datetime import datetime

router = APIRouter()

@router.post("/history")
async def save_uploaded_history(request: Request, file: UploadFile = File(...), text: str = "", voice: str = "", emotion: str = "", pitch: int = 0, speed: float = 1.0):
    # Save uploaded/recorded audio to history (no audio storage, just metadata)
    try:
        voice_history_collection = request.app.voice_history_collection if hasattr(request.app, 'voice_history_collection') else None
        if voice_history_collection is None:
            from backend.app import voice_history_collection as vcol
            voice_history_collection = vcol
        doc = {
            "text": text,
            "voice": voice,
            "emotion": emotion,
            "pitch": pitch,
            "speed": speed,
            "timestamp": datetime.utcnow(),
            # Optionally store file.filename or other info
        }
        voice_history_collection.insert_one(doc)
        return JSONResponse({"status": "ok"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history")
def get_voice_history(request: Request):
    try:
        # Use the same collection as app.py
        voice_history_collection = request.app.voice_history_collection if hasattr(request.app, 'voice_history_collection') else None
        if voice_history_collection is None:
            # fallback for direct import
            from backend.app import voice_history_collection as vcol
            voice_history_collection = vcol
        history = list(voice_history_collection.find().sort("timestamp", -1).limit(20))
        for item in history:
            item["_id"] = str(item["_id"])
            item["timestamp"] = item["timestamp"].isoformat() if "timestamp" in item else None
        return {"history": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/history")
async def save_uploaded_history(request: Request, file: UploadFile = File(...), text: str = "", voice: str = "", emotion: str = "", pitch: int = 0, speed: float = 1.0):
    # Save uploaded/recorded audio to history (no audio storage, just metadata)
    try:
        voice_history_collection = request.app.voice_history_collection if hasattr(request.app, 'voice_history_collection') else None
        if voice_history_collection is None:
            from backend.app import voice_history_collection as vcol
            voice_history_collection = vcol
        doc = {
            "text": text,
            "voice": voice,
            "emotion": emotion,
            "pitch": pitch,
            "speed": speed,
            "timestamp": datetime.utcnow(),
            # Optionally store file.filename or other info
        }
        voice_history_collection.insert_one(doc)
        return JSONResponse({"status": "ok"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
