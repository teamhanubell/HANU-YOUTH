"""
Voice API endpoints for HANU-YOUTH platform
Lightweight speech-to-text and text-to-speech functionality
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.core.database import get_db
from app.models import User
from app.api.v1.endpoints.auth import get_current_user
from pydantic import BaseModel
import json
import uuid
import os
from app.services.ai_service import ai_service

router = APIRouter()

class SpeechToTextRequest(BaseModel):
    """Speech-to-text request model"""
    language: str = "en"
    model: str = "whisper-tiny"  # Options: whisper-tiny, whisper-base, vosk, coqui
    enable_punctuation: bool = True
    enable_timestamps: bool = False

class SpeechToTextResponse(BaseModel):
    """Speech-to-text response model"""
    text: str
    confidence: float
    language: str
    duration: float
    word_count: int
    segments: Optional[List[Dict[str, Any]]] = None
    file_id: str

class TextToSpeechRequest(BaseModel):
    """Text-to-speech request model"""
    text: str
    voice: str = "default"
    language: str = "en"
    speed: float = 1.0
    pitch: float = 1.0
    format: str = "mp3"  # Options: mp3, wav, ogg

class TextToSpeechResponse(BaseModel):
    """Text-to-speech response model"""
    audio_url: str
    text: str
    voice: str
    language: str
    duration: float
    file_size: int
    file_id: str

class VoiceModulationRequest(BaseModel):
    """Voice modulation request model"""
    audio_file_id: str
    effects: Dict[str, Any]  # Effects like pitch, speed, reverb, echo, etc.
    output_format: str = "mp3"

class VoiceModulationResponse(BaseModel):
    """Voice modulation response model"""
    processed_audio_url: str
    original_file_id: str
    effects_applied: List[str]
    duration: float
    file_id: str

class VoiceInfo(BaseModel):
    """Voice information model"""
    voice_id: str
    name: str
    language: str
    gender: str
    description: str
    sample_url: Optional[str] = None

@router.post("/speech-to-text", response_model=SpeechToTextResponse)
async def speech_to_text(
    file: UploadFile = File(...),
    language: str = Form("en"),
    model: str = Form("whisper-tiny"),
    enable_punctuation: bool = Form(True),
    enable_timestamps: bool = Form(False),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Convert speech to text using lightweight AI models"""
    
    if not file.content_type.startswith("audio/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an audio file"
        )
    
    try:
        # Validate file size (limit to 25MB for lightweight deployment)
        max_size = 25 * 1024 * 1024  # 25MB
        file_size = 0
        content = await file.read()
        file_size = len(content)
        
        if file_size > max_size:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="File size exceeds 25MB limit"
            )
        
        # Save audio file
        upload_dir = "uploads/audio"
        os.makedirs(upload_dir, exist_ok=True)
        
        filename = f"{uuid.uuid4()}_{file.filename}"
        file_path = os.path.join(upload_dir, filename)
        
        with open(file_path, "wb") as buffer:
            buffer.write(content)
        
        # Process speech-to-text using AI service
        result = await ai_service.voice_to_text(content, language)
        
        # Calculate additional metadata
        word_count = len(result["text"].split())
        
        # Create segments if timestamps are enabled
        segments = None
        if enable_timestamps:
            segments = [
                {
                    "start": 0.0,
                    "end": result["duration"],
                    "text": result["text"],
                    "confidence": result["confidence"]
                }
            ]
        
        return SpeechToTextResponse(
            text=result["text"],
            confidence=result["confidence"],
            language=result["language"],
            duration=result["duration"],
            word_count=word_count,
            segments=segments,
            file_id=filename
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Speech-to-text conversion failed: {str(e)}"
        )

@router.post("/text-to-speech", response_model=TextToSpeechResponse)
async def text_to_speech(
    text: str = Form(...),
    voice: str = Form("default"),
    language: str = Form("en"),
    speed: float = Form(1.0),
    pitch: float = Form(1.0),
    format: str = Form("mp3"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Convert text to speech using lightweight TTS engines"""
    
    try:
        # Validate text length (limit to 5000 characters for lightweight deployment)
        if len(text) > 5000:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Text length exceeds 5000 character limit"
            )
        
        # Validate parameters
        if not (0.5 <= speed <= 2.0):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Speed must be between 0.5 and 2.0"
            )
        
        if not (0.5 <= pitch <= 2.0):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Pitch must be between 0.5 and 2.0"
            )
        
        if format not in ["mp3", "wav", "ogg"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Format must be one of: mp3, wav, ogg"
            )
        
        # Generate audio using AI service
        tts_result = await ai_service.text_to_voice(text, voice, language)
        
        # Save generated audio file
        upload_dir = "uploads/audio"
        os.makedirs(upload_dir, exist_ok=True)
        
        filename = f"{uuid.uuid4()}_tts.{format}"
        file_path = os.path.join(upload_dir, filename)
        
        # In a real implementation, this would generate actual audio data
        # For now, we'll create a mock file
        with open(file_path, "wb") as buffer:
            # Mock audio data - in production, this would be real audio
            buffer.write(f"mock audio data for: {text}".encode())
        
        # Get file size
        file_size = os.path.getsize(file_path)
        
        return TextToSpeechResponse(
            audio_url=f"/uploads/audio/{filename}",
            text=text,
            voice=voice,
            language=language,
            duration=tts_result["duration"],
            file_size=file_size,
            file_id=filename
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Text-to-speech conversion failed: {str(e)}"
        )

@router.post("/modulate-voice", response_model=VoiceModulationResponse)
async def modulate_voice(
    audio_file_id: str = Form(...),
    effects: str = Form(...),  # JSON string of effects
    output_format: str = Form("mp3"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Apply voice modulation effects to audio"""
    
    try:
        # Parse effects JSON
        try:
            effects_dict = json.loads(effects)
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Effects must be valid JSON"
            )
        
        # Validate audio file exists
        upload_dir = "uploads/audio"
        original_file_path = os.path.join(upload_dir, audio_file_id)
        
        if not os.path.exists(original_file_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audio file not found"
            )
        
        # Validate output format
        if output_format not in ["mp3", "wav", "ogg"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Output format must be one of: mp3, wav, ogg"
            )
        
        # Apply voice modulation effects (mock implementation)
        applied_effects = []
        
        if "pitch" in effects_dict:
            pitch_value = effects_dict["pitch"]
            if not (0.5 <= pitch_value <= 2.0):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Pitch must be between 0.5 and 2.0"
                )
            applied_effects.append(f"pitch_{pitch_value}")
        
        if "speed" in effects_dict:
            speed_value = effects_dict["speed"]
            if not (0.5 <= speed_value <= 2.0):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Speed must be between 0.5 and 2.0"
                )
            applied_effects.append(f"speed_{speed_value}")
        
        if "reverb" in effects_dict:
            applied_effects.append("reverb")
        
        if "echo" in effects_dict:
            applied_effects.append("echo")
        
        if "robot" in effects_dict:
            applied_effects.append("robot")
        
        # Generate processed audio file
        processed_filename = f"{uuid.uuid4()}_modulated.{output_format}"
        processed_file_path = os.path.join(upload_dir, processed_filename)
        
        # In a real implementation, this would apply actual audio processing
        # For now, we'll copy the original file
        import shutil
        shutil.copy2(original_file_path, processed_file_path)
        
        # Get file duration (mock calculation)
        duration = 5.0  # Mock duration
        
        return VoiceModulationResponse(
            processed_audio_url=f"/uploads/audio/{processed_filename}",
            original_file_id=audio_file_id,
            effects_applied=applied_effects,
            duration=duration,
            file_id=processed_filename
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Voice modulation failed: {str(e)}"
        )

@router.get("/voices", response_model=List[VoiceInfo])
async def get_available_voices():
    """Get list of available TTS voices"""
    
    # Mock voice list - in production, this would query available voices
    voices = [
        VoiceInfo(
            voice_id="default",
            name="Default Voice",
            language="en",
            gender="neutral",
            description="Standard clear voice for general use"
        ),
        VoiceInfo(
            voice_id="male_en",
            name="Male English",
            language="en",
            gender="male",
            description="Natural male voice for English content"
        ),
        VoiceInfo(
            voice_id="female_en",
            name="Female English",
            language="en",
            gender="female",
            description="Natural female voice for English content"
        ),
        VoiceInfo(
            voice_id="child",
            name="Child Voice",
            language="en",
            gender="child",
            description="Friendly child-like voice"
        ),
        VoiceInfo(
            voice_id="robot",
            name="Robot Voice",
            language="en",
            gender="robot",
            description="Synthetic robot voice for special effects"
        )
    ]
    
    return voices

@router.get("/audio/{file_id}")
async def get_audio_file(file_id: str):
    """Serve audio files"""
    
    try:
        upload_dir = "uploads/audio"
        file_path = os.path.join(upload_dir, file_id)
        
        if not os.path.exists(file_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audio file not found"
            )
        
        from fastapi.responses import FileResponse
        return FileResponse(file_path)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to serve audio file: {str(e)}"
        )

@router.delete("/audio/{file_id}")
async def delete_audio_file(
    file_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete audio file"""
    
    try:
        upload_dir = "uploads/audio"
        file_path = os.path.join(upload_dir, file_id)
        
        if not os.path.exists(file_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audio file not found"
            )
        
        os.remove(file_path)
        
        return {"message": "Audio file deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete audio file: {str(e)}"
        )