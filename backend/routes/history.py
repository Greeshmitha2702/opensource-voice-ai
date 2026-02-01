
from fastapi import APIRouter, HTTPException, Request, UploadFile, File, Form
from fastapi.responses import JSONResponse
from datetime import datetime

from .utils import contains_sensitive, normalize_text

router = APIRouter()

@router.post("/history")
async def save_uploaded_history(
    request: Request,
    file: UploadFile = File(...),
    text: str = Form(""),
    voice: str = Form(""),
    emotion: str = Form(""),
    pitch: int = Form(0),
    speed: float = Form(1.0)
):
    # Always check all user input for sensitive words: text, file name, and translation to English
    file_text = file.filename if file and hasattr(file, 'filename') else ""
    from deep_translator import GoogleTranslator
    translated_text = text
    translated_to_en = text
    try:
        translated_text = GoogleTranslator(source='auto', target='en').translate(text)
        translated_to_en = translated_text
    except Exception:
        translated_to_en = text
    # Check all relevant user input fields
    user_inputs = [text, file_text, translated_text, translated_to_en]
    for value in user_inputs:
        if contains_sensitive(value):
            return JSONResponse({"warning": "Input contains sensitive or inappropriate language."})
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


