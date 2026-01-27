from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from deep_translator import GoogleTranslator

router = APIRouter()

class TranslateRequest(BaseModel):
    text: str
    target_lang: str = "en"

@router.post("/translate")
async def translate_text(req: TranslateRequest):
    try:
        translated = GoogleTranslator(
            source="auto",
            target=req.target_lang
        ).translate(req.text)

        return {"translatedText": translated}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))