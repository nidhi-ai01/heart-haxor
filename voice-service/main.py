from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
import shutil
import os
import uuid

# Try imports
try:
    import whisper
    whisper_model = whisper.load_model("base")
except ImportError:
    whisper_model = None
    print("WARNING: whisper not installed. STT will be mocked.")

try:
    from TTS.api import TTS
    # Init generic model
    tts = TTS(model_name="tts_models/en/ljspeech/glow-tts", progress_bar=False, gpu=False)
except ImportError:
    tts = None
    print("WARNING: TTS not installed. TTS will be mocked.")

app = FastAPI()

TEMP_DIR = "temp_audio"
os.makedirs(TEMP_DIR, exist_ok=True)

@app.get("/health")
def health():
    return {"status": "ok", "stt": whisper_model is not None, "tts": tts is not None}

@app.post("/stt")
async def speech_to_text(file: UploadFile = File(...)):
    if not whisper_model:
        return {"text": "This is mocked STT text because Whisper is not installed."}
    
    file_path = os.path.join(TEMP_DIR, f"{uuid.uuid4()}.wav")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        result = whisper_model.transcribe(file_path)
        return {"text": result["text"]}
    except Exception as e:
        print(f"STT Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)

from pydantic import BaseModel

class TTSRequest(BaseModel):
    text: str
    character: str = "default"

@app.post("/tts")
async def text_to_speech(request: TTSRequest):
    text = request.text
    character = request.character
    output_filename = f"{uuid.uuid4()}.wav"
    output_path = os.path.join(TEMP_DIR, output_filename)
    
    if not tts:
        # Mock: Create a dummy wav file? Or just fail?
        # Creating valid 1 sec silence wav header for testing
        with open(output_path, "wb") as f:
            # Minimal WAV header (44 bytes) for 0 data
            f.write(b'RIFF$\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00D\xac\x00\x00\x88X\x01\x00\x02\x00\x10\x00data\x00\x00\x00\x00')
        return FileResponse(output_path, media_type="audio/wav")

    try:
        # tts.tts_to_file(text=text, file_path=output_path) # Simple API
        # Or with speaker embedding if supported by model
        tts.tts_to_file(text=text, file_path=output_path)
        return FileResponse(output_path, media_type="audio/wav")
    except Exception as e:
        print(f"TTS Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
