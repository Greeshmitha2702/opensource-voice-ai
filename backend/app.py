
import os
import io
import edge_tts
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel
from deep_translator import GoogleTranslator

app = FastAPI()

# Path Resolution
# The root directory is the parent of the backend folder
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(BACKEND_DIR)

# Voice Mapping for edge-tts (Free Neural Voices)
VOICE_MAP = {
    "Kore": "en-US-ChristopherNeural",
    "Puck": "en-GB-ThomasNeural",
    "Charon": "en-US-EricNeural",
    "Fenrir": "en-AU-WilliamNeural",
    "Zephyr": "en-US-JennyNeural"
}

class TTSRequest(BaseModel):
    text: str
    voice: str
    language: str
    emotion: str = "Neutral"
    speed: float = 1.0

@app.post("/api/translate")
async def translate(request: Request):
    data = await request.json()
    text = data.get("text")
    target_lang = data.get("target_lang", "en")
    try:
        translated = GoogleTranslator(source='auto', target=target_lang).translate(text)
        return {"translatedText": translated}
    except Exception as e:
        return {"translatedText": text, "error": str(e)}

@app.post("/api/tts")
async def text_to_speech(req: TTSRequest):
    try:
        target_voice = VOICE_MAP.get(req.voice, "en-US-ChristopherNeural")
        rate_val = int((req.speed - 1) * 100)
        rate_str = f"{'+' if rate_val >= 0 else ''}{rate_val}%"
        
        communicate = edge_tts.Communicate(req.text, target_voice, rate=rate_str)
        audio_data = b""
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_data += chunk["data"]
        
        return StreamingResponse(io.BytesIO(audio_data), media_type="audio/mpeg")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def read_index():
    index_path = os.path.join(ROOT_DIR, "index.html")
    return FileResponse(index_path)

@app.get("/{path:path}")
async def serve_static(path: str):
    # Try to serve from root (where the frontend entry points are)
    file_path = os.path.join(ROOT_DIR, path)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(file_path)
    # Fallback to index for SPA
    return FileResponse(os.path.join(ROOT_DIR, "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=80)
