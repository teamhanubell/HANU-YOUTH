"""
Chatbot API endpoints for HANU-YOUTH platform
Lightweight, modular, and scalable chatbot functionality
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.core.database import get_db
from app.models import User
from app.api.v1.endpoints.auth import get_current_user
from pydantic import BaseModel
import json
import uuid
import asyncio
from app.services.ai_service import get_ai_response

router = APIRouter()

class ChatMessage(BaseModel):
    """Chat message model"""
    role: str  # "user" or "assistant"
    content: str
    timestamp: datetime
    message_id: str

class ChatRequest(BaseModel):
    """Chat request model"""
    message: str
    conversation_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = {}
    voice_input: Optional[bool] = False

class ChatResponse(BaseModel):
    """Chat response model"""
    response: str
    conversation_id: str
    message_id: str
    timestamp: datetime
    context: Optional[Dict[str, Any]] = {}
    voice_response: Optional[bool] = False
    suggestions: Optional[List[str]] = []

class ConversationHistory(BaseModel):
    """Conversation history model"""
    conversation_id: str
    messages: List[ChatMessage]
    created_at: datetime
    updated_at: datetime
    title: Optional[str] = None

# In-memory storage for conversations (for lightweight deployment)
# In production, this would be replaced with a proper database
conversation_storage = {}

@router.post("/chat", response_model=ChatResponse)
async def chat_with_bot(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Main chatbot endpoint - processes user messages and returns AI responses"""
    
    try:
        # Generate or use existing conversation ID
        conversation_id = request.conversation_id or str(uuid.uuid4())
        
        # Initialize conversation if it doesn't exist
        if conversation_id not in conversation_storage:
            conversation_storage[conversation_id] = {
                "messages": [],
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "user_id": current_user.id,
                "title": None
            }
        
        # Add user message to conversation
        user_message = ChatMessage(
            role="user",
            content=request.message,
            timestamp=datetime.utcnow(),
            message_id=str(uuid.uuid4())
        )
        
        conversation_storage[conversation_id]["messages"].append(user_message)
        
        # Get AI response using the AI service
        ai_response = await get_ai_response(
            message=request.message,
            context=request.context,
            conversation_history=conversation_storage[conversation_id]["messages"][-10:]  # Last 10 messages
        )
        
        # Create assistant response
        assistant_message = ChatMessage(
            role="assistant",
            content=ai_response["response"],
            timestamp=datetime.utcnow(),
            message_id=str(uuid.uuid4())
        )
        
        # Add assistant response to conversation
        conversation_storage[conversation_id]["messages"].append(assistant_message)
        conversation_storage[conversation_id]["updated_at"] = datetime.utcnow()
        
        # Generate conversation title if it's the first exchange
        if len(conversation_storage[conversation_id]["messages"]) == 2 and not conversation_storage[conversation_id]["title"]:
            conversation_storage[conversation_id]["title"] = generate_conversation_title(request.message)
        
        # Generate follow-up suggestions
        suggestions = generate_suggestions(ai_response["response"])
        
        return ChatResponse(
            response=ai_response["response"],
            conversation_id=conversation_id,
            message_id=assistant_message.message_id,
            timestamp=assistant_message.timestamp,
            context=ai_response.get("context", {}),
            voice_response=request.voice_input,
            suggestions=suggestions
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Chat processing failed: {str(e)}"
        )

@router.get("/chat/conversations", response_model=List[ConversationHistory])
async def get_conversation_history(
    current_user: User = Depends(get_current_user),
    limit: int = 10,
    offset: int = 0
):
    """Get user's conversation history"""
    
    try:
        # Filter conversations by user and paginate
        user_conversations = [
            ConversationHistory(
                conversation_id=conv_id,
                messages=conv_data["messages"],
                created_at=conv_data["created_at"],
                updated_at=conv_data["updated_at"],
                title=conv_data["title"]
            )
            for conv_id, conv_data in conversation_storage.items()
            if conv_data["user_id"] == current_user.id
        ]
        
        # Sort by updated_at (most recent first)
        user_conversations.sort(key=lambda x: x.updated_at, reverse=True)
        
        # Apply pagination
        return user_conversations[offset:offset + limit]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve conversation history: {str(e)}"
        )

@router.get("/chat/conversations/{conversation_id}", response_model=ConversationHistory)
async def get_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get specific conversation by ID"""
    
    try:
        if conversation_id not in conversation_storage:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
        
        conversation_data = conversation_storage[conversation_id]
        
        # Verify user owns the conversation
        if conversation_data["user_id"] != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this conversation"
            )
        
        return ConversationHistory(
            conversation_id=conversation_id,
            messages=conversation_data["messages"],
            created_at=conversation_data["created_at"],
            updated_at=conversation_data["updated_at"],
            title=conversation_data["title"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve conversation: {str(e)}"
        )

@router.delete("/chat/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a specific conversation"""
    
    try:
        if conversation_id not in conversation_storage:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
        
        # Verify user owns the conversation
        if conversation_storage[conversation_id]["user_id"] != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this conversation"
            )
        
        # Delete the conversation
        del conversation_storage[conversation_id]
        
        return {"message": "Conversation deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete conversation: {str(e)}"
        )

def generate_conversation_title(message: str) -> str:
    """Generate a concise title for the conversation based on the first message"""
    # Simple title generation - in production, this would use AI
    words = message.split()[:5]
    return " ".join(words) + ("..." if len(message.split()) > 5 else "")

def generate_suggestions(response: str) -> List[str]:
    """Generate follow-up suggestions based on AI response"""
    # Simple suggestion generation - in production, this would be more sophisticated
    suggestions = [
        "Tell me more about this topic",
        "Can you provide examples?",
        "How does this relate to current events?",
        "What are the practical applications?"
    ]
    
    # Return a subset of suggestions
    return suggestions[:2]

@router.post("/chat/voice")
async def voice_chat(
    file: UploadFile = File(...),
    language: str = "en",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Voice-based chat endpoint - processes audio input and returns text response"""
    
    if not file.content_type.startswith("audio/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an audio file"
        )
    
    try:
        # Save audio file
        upload_dir = "uploads/audio"
        import os
        os.makedirs(upload_dir, exist_ok=True)
        
        filename = f"{uuid.uuid4()}_{file.filename}"
        file_path = os.path.join(upload_dir, filename)
        
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Convert speech to text (mock implementation)
        transcribed_text = f"Transcribed: {file.filename}"
        
        # Process the transcribed text through the chatbot
        chat_request = ChatRequest(
            message=transcribed_text,
            voice_input=True
        )
        
        chat_response = await chat_with_bot(chat_request, current_user, db)
        
        return {
            "transcribed_text": transcribed_text,
            "chat_response": chat_response,
            "audio_file_id": filename
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Voice chat processing failed: {str(e)}"
        )