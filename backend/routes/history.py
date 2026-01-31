from fastapi import APIRouter, HTTPException

from fastapi import Request

router = APIRouter()



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
