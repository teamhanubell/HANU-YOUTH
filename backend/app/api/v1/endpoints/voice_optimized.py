"""
Optimized Voice API endpoints for HANU-YOUTH platform
Improved performance with error handling, retries, and circuit breakers
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime
import asyncio
import os
import uuid
import time
from app.core.database import get_db
from app.models import User
from app.api.v1.endpoints.auth import get_current_user
from app.core.cache import cache, cache_response
from app.core.error_handling import (
    retry_with_backoff, RETRY_CONFIGS, CIRCUIT_BREAKERS,
    handle_external_service_errors, ErrorHandler, handle_database_errors
)
from pydantic import BaseModel
from app.services.ai_service import ai_service

router = APIRouter()

class SpeechToTextRequest(BaseModel):
    """Speech-to-text request model"""
    language: str = "en"
    model: str = "whisper-tiny"
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
    processing_time_ms: float

class TextToSpeechRequest(BaseModel):
    """Text-to-speech request model"""
    text: str
    voice: str = "default"
    language: str = "en"
    speed: float = 1.0
    pitch: float = 1.0
    format: str = "mp3"

class TextToSpeechResponse(BaseModel):
    """Text-to-speech response model"""
    audio_url: str
    text: str
    voice: str
    language: str
    duration: float
    file_size: int
    file_id: str
    processing_time_ms: float

class VoiceModulationRequest(BaseModel):
    """Voice modulation request model"""
    audio_file_id: str
    effects: Dict[str, Any]
    output_format: str = "mp3"

class VoiceModulationResponse(BaseModel):
    """Voice modulation response model"""
    processed_audio_url: str
    original_file_id: str
    effects_applied: List[str]
    duration: float
    file_id: str
    processing_time_ms: float

class VoiceInfo(BaseModel):
    """Voice information model"""
    voice_id: str
    name: str
    language: str
    gender: str
    description: str
    sample_url: Optional[str] = None

# Optimized audio file management
class AudioFileManager:
    """Optimized audio file manager with cleanup"""
    
    def __init__(self, max_files: int = 1000, cleanup_interval: int = 3600):
        self.max_files = max_files
        self.cleanup_interval = cleanup_interval
        self.file_metadata = {}  # file_id -> metadata
        self.access_times = {}  # file_id -> last_access_time
        self.cleanup_task: Optional[asyncio.Task] = None
    
    async def save_file(self, file_data: bytes, filename: str, metadata: Dict[str, Any]) -> str:
        """Save audio file with metadata"""
        file_id = str(uuid.uuid4())
        upload_dir = "uploads/audio"
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate filename
        safe_filename = f"{file_id}_{filename}"
        file_path = os.path.join(upload_dir, safe_filename)
        
        # Save file
        start_time = time.time()
        with open(file_path, "wb") as buffer:
            buffer.write(file_data)
        
        # Store metadata
        file_metadata = {
            "file_id": file_id,
            "filename": safe_filename,
            "original_filename": filename,
            "file_path": file_path,
            "file_size": len(file_data),
            "created_at": datetime.utcnow(),
            "metadata": metadata
        }
        
        self.file_metadata[file_id] = file_metadata
        self.access_times[file_id] = time.time()
        
        # Cleanup old files if needed
        await self._cleanup_if_needed()
        
        return file_id
    
    def get_file_path(self, file_id: str) -> Optional[str]:
        """Get file path with access tracking"""
        if file_id in self.file_metadata:
            self.access_times[file_id] = time.time()
            return self.file_metadata[file_id]["file_path"]
        return None
    
    def get_file_metadata(self, file_id: str) -> Optional[Dict[str, Any]]:
        """Get file metadata"""
        if file_id in self.file_metadata:
            self.access_times[file_id] = time.time()
            return self.file_metadata[file_id]
        return None
    
    def delete_file(self, file_id: str) -> bool:
        """Delete audio file"""
        if file_id not in self.file_metadata:
            return False
        
        try:
            file_path = self.file_metadata[file_id]["file_path"]
            if os.path.exists(file_path):
                os.remove(file_path)
            
            # Remove from tracking
            del self.file_metadata[file_id]
            if file_id in self.access_times:
                del self.access_times[file_id]
            
            return True
        except Exception as e:
            ErrorHandler.log_error(e, f"Deleting file {file_id}")
            return False
    
    async def _cleanup_if_needed(self):
        """Cleanup old files if needed"""
        if len(self.file_metadata) > self.max_files:
            await self._cleanup_old_files()
    
    async def _cleanup_old_files(self):
        """Clean up old files based on LRU"""
        if not self.access_times:
            return
        
        # Sort files by access time (oldest first)
        sorted_files = sorted(
            self.access_times.items(),
            key=lambda x: x[1]
        )
        
        # Remove oldest 20% of files
        files_to_remove = int(len(sorted_files) * 0.2)
        
        for file_id, _ in sorted_files[:files_to_remove]:
            self.delete_file(file_id)
    
    async def start_cleanup_task(self):
        """Start background cleanup task"""
        if self.cleanup_task and not self.cleanup_task.done():
            return
        
        async def cleanup():
            while True:
                await asyncio.sleep(self.cleanup_interval)
                await self._cleanup_old_files()
        
        self.cleanup_task = asyncio.create_task(cleanup())

# Global audio file manager
audio_manager = AudioFileManager()

# Voice processing circuit breaker
voice_circuit_breaker = CIRCUIT_BREAKERS["ai_service"]

@router.post("/speech-to-text", response_model=SpeechToTextResponse)
@handle_database_errors
@retry_with_backoff(RETRY_CONFIGS["ai_service"])
async def speech_to_text(
    file: UploadFile = File(...),
    language: str = Form("en"),
    model: str = Form("whisper-tiny"),
    enable_punctuation: bool = Form(True),
    enable_timestamps: bool = Form(False),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Optimized speech-to-text with error handling and retries"""
    
    start_time = time.time()
    
    # Validate file
    if not file.content_type.startswith("audio/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an audio file"
        )
    
    # Validate file size
    max_size = 25 * 1024 * 1024  # 25MB
    file_data = await file.read()
    file_size = len(file_data)
    
    if file_size > max_size:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds 25MB limit"
        )
    
    try:
        # Save file with metadata
        file_id = await audio_manager.save_file(
            file_data,
            file.filename or "audio.wav",
            {
                "user_id": current_user.id,
                "language": language,
                "model": model,
                "processing_type": "speech_to_text"
            }
        )
        
        # Process with circuit breaker protection
        def process_audio():
            # Mock processing - in production, this would call Whisper/Vosk
            processing_time = 0.1 + (file_size / (1024 * 1024)) * 0.5  # Scale with file size
            
            # Simulate processing delay
            time.sleep(processing_time)
            
            return {
                "text": f"Transcribed audio from {file.filename}",
                "confidence": 0.92,
                "language": language,
                "duration": 30.5,
                "word_count": len(f"Transcribed audio from {file.filename}".split())
            }
        
        # Execute with circuit breaker
        result = voice_circuit_breaker.call(process_audio)
        
        # Add segments if requested
        segments = None
        if enable_timestamps:
            segments = [{
                "start": 0.0,
                "end": result["duration"],
                "text": result["text"],
                "confidence": result["confidence"]
            }]
        
        processing_time_ms = (time.time() - start_time) * 1000
        
        return SpeechToTextResponse(
            text=result["text"],
            confidence=result["confidence"],
            language=result["language"],
            duration=result["duration"],
            word_count=result["word_count"],
            segments=segments,
            file_id=file_id,
            processing_time_ms=processing_time_ms
        )
        
    except Exception as e:
        ErrorHandler.log_error(e, "Speech-to-text processing")
        raise ErrorHandler.create_http_exception(e, "Speech-to-text processing failed")

@router.post("/text-to-speech", response_model=TextToSpeechResponse)
@handle_database_errors
@retry_with_backoff(RETRY_CONFIGS["ai_service"])
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
    """Optimized text-to-speech with error handling and retries"""
    
    start_time = time.time()
    
    # Validate parameters
    if len(text) > 5000:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Text length exceeds 5000 character limit"
        )
    
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
    
    try:
        # Generate audio with circuit breaker protection
        def generate_audio():
            # Mock processing - in production, this would call TTS service
            processing_time = 0.05 + (len(text) / 1000) * 0.1  # Scale with text length
            
            # Simulate processing delay
            time.sleep(processing_time)
            
            # Generate mock audio data
            duration = len(text.split()) * 0.1  # Rough estimate
            
            return {
                "audio_data": f"mock audio data for: {text}".encode(),
                "duration": duration
            }
        
        # Execute with circuit breaker
        result = voice_circuit_breaker.call(generate_audio)
        
        # Save audio file
        filename = f"tts_{uuid.uuid4()}.{format}"
        file_id = await audio_manager.save_file(
            result["audio_data"],
            filename,
            {
                "user_id": current_user.id,
                "voice": voice,
                "language": language,
                "speed": speed,
                "pitch": pitch,
                "processing_type": "text_to_speech"
            }
        )
        
        processing_time_ms = (time.time() - start_time) * 1000
        
        return TextToSpeechResponse(
            audio_url=f"/uploads/audio/{filename}",
            text=text,
            voice=voice,
            language=language,
            duration=result["duration"],
            file_size=len(result["audio_data"]),
            file_id=file_id,
            processing_time_ms=processing_time_ms
        )
        
    except Exception as e:
        ErrorHandler.log_error(e, "Text-to-speech processing")
        raise ErrorHandler.create_http_exception(e, "Text-to-speech processing failed")

@router.post("/modulate-voice", response_model=VoiceModulationResponse)
@handle_database_errors
@retry_with_backoff(RETRY_CONFIGS["ai_service"])
async def modulate_voice(
    audio_file_id: str = Form(...),
    effects: str = Form(...),
    output_format: str = Form("mp3"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Optimized voice modulation with error handling and retries"""
    
    start_time = time.time()
    
    try:
        # Parse effects JSON
        import json
        try:
            effects_dict = json.loads(effects)
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Effects must be valid JSON"
            )
        
        # Get original file
        file_metadata = audio_manager.get_file_metadata(audio_file_id)
        if not file_metadata:
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
        
        # Validate effects parameters
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
        
        # Process audio with circuit breaker protection
        def process_modulation():
            # Mock processing - in production, this would apply audio effects
            processing_time = 0.1 + len(applied_effects) * 0.05
            
            # Simulate processing delay
            time.sleep(processing_time)
            
            # Get original file data
            file_path = audio_manager.get_file_path(audio_file_id)
            with open(file_path, "rb") as f:
                original_data = f.read()
            
            return {
                "processed_data": original_data,  # Mock - no actual processing
                "duration": 5.0  # Mock duration
            }
        
        # Execute with circuit breaker
        result = voice_circuit_breaker.call(process_modulation)
        
        # Save processed file
        processed_filename = f"modulated_{uuid.uuid4()}.{output_format}"
        processed_file_id = await audio_manager.save_file(
            result["processed_data"],
            processed_filename,
            {
                "user_id": current_user.id,
                "original_file_id": audio_file_id,
                "effects_applied": applied_effects,
                "processing_type": "voice_modulation"
            }
        )
        
        processing_time_ms = (time.time() - start_time) * 1000
        
        return VoiceModulationResponse(
            processed_audio_url=f"/uploads/audio/{processed_filename}",
            original_file_id=audio_file_id,
            effects_applied=applied_effects,
            duration=result["duration"],
            file_id=processed_file_id,
            processing_time_ms=processing_time_ms
        )
        
    except HTTPException:
        raise
    except Exception as e:
        ErrorHandler.log_error(e, "Voice modulation processing")
        raise ErrorHandler.create_http_exception(e, "Voice modulation processing failed")

@router.get("/voices", response_model=List[VoiceInfo])
@cache_response(ttl=1800)  # 30 minute cache
async def get_available_voices():
    """Get list of available TTS voices with caching"""
    
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
    """Serve audio files with access tracking"""
    
    try:
        file_path = audio_manager.get_file_path(file_id)
        if not file_path:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audio file not found"
            )
        
        from fastapi.responses import FileResponse
        return FileResponse(file_path)
        
    except HTTPException:
        raise
    except Exception as e:
        ErrorHandler.log_error(e, f"Serving audio file {file_id}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to serve audio file"
        )

@router.delete("/audio/{file_id}")
async def delete_audio_file(
    file_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete audio file with ownership check"""
    
    try:
        # Check file ownership
        file_metadata = audio_manager.get_file_metadata(file_id)
        if not file_metadata:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audio file not found"
            )
        
        if file_metadata["metadata"]["user_id"] != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this audio file"
            )
        
        # Delete file
        success = audio_manager.delete_file(file_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete audio file"
            )
        
        return {"message": "Audio file deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        ErrorHandler.log_error(e, f"Deleting audio file {file_id}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete audio file"
        )

# Initialize audio manager cleanup task
async def start_audio_cleanup():
    await audio_manager.start_cleanup_task()