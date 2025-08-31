"""
Optimized Chatbot API endpoints for HANU-YOUTH platform
Improved performance with caching and efficient data structures
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from collections import defaultdict, deque
import asyncio
import json
import uuid
import time
from app.core.database import get_db
from app.models import User
from app.api.v1.endpoints.auth import get_current_user
from app.core.cache import cache, cache_response, CACHE_KEYS
from pydantic import BaseModel
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

class OptimizedConversationStore:
    """Optimized conversation store with efficient data structures"""
    
    def __init__(self, max_conversations_per_user: int = 50, max_messages_per_conversation: int = 100):
        self.conversations = {}  # conversation_id -> conversation_data
        self.user_conversations = defaultdict(lambda: deque(maxlen=max_conversations_per_user))
        self.message_cache = {}  # message_id -> message_data
        self.conversation_titles = {}  # conversation_id -> title
        self.last_accessed = {}  # conversation_id -> timestamp
        
        # Cleanup task
        self.cleanup_task: Optional[asyncio.Task] = None
    
    def create_conversation(self, user_id: int, conversation_id: str) -> Dict[str, Any]:
        """Create a new conversation"""
        conversation_data = {
            "conversation_id": conversation_id,
            "user_id": user_id,
            "messages": [],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        self.conversations[conversation_id] = conversation_data
        self.user_conversations[user_id].append(conversation_id)
        self.last_accessed[conversation_id] = time.time()
        
        return conversation_data
    
    def get_conversation(self, conversation_id: str, user_id: int) -> Optional[Dict[str, Any]]:
        """Get conversation with user ownership check"""
        if conversation_id not in self.conversations:
            return None
        
        conversation = self.conversations[conversation_id]
        if conversation["user_id"] != user_id:
            return None
        
        self.last_accessed[conversation_id] = time.time()
        return conversation
    
    def add_message(self, conversation_id: str, message: Dict[str, Any]) -> None:
        """Add message to conversation"""
        if conversation_id not in self.conversations:
            return
        
        conversation = self.conversations[conversation_id]
        
        # Limit messages per conversation
        if len(conversation["messages"]) >= 100:
            conversation["messages"] = conversation["messages"][-99:]  # Keep last 99 messages
        
        conversation["messages"].append(message)
        conversation["updated_at"] = datetime.utcnow()
        self.message_cache[message["message_id"]] = message
        
        # Generate title if this is the first exchange
        if len(conversation["messages"]) == 2 and conversation_id not in self.conversation_titles:
            self.conversation_titles[conversation_id] = self._generate_title(conversation["messages"][0]["content"])
    
    def get_user_conversations(self, user_id: int, limit: int = 10, offset: int = 0) -> List[Dict[str, Any]]:
        """Get user's conversations with pagination"""
        conversation_ids = list(self.user_conversations[user_id])
        
        # Reverse to get most recent first
        conversation_ids.reverse()
        
        # Apply pagination
        paginated_ids = conversation_ids[offset:offset + limit]
        
        conversations = []
        for conv_id in paginated_ids:
            if conv_id in self.conversations:
                conv_data = self.conversations[conv_id].copy()
                conv_data["title"] = self.conversation_titles.get(conv_id)
                conversations.append(conv_data)
        
        return conversations
    
    def delete_conversation(self, conversation_id: str, user_id: int) -> bool:
        """Delete conversation with user ownership check"""
        if conversation_id not in self.conversations:
            return False
        
        conversation = self.conversations[conversation_id]
        if conversation["user_id"] != user_id:
            return False
        
        # Remove from all data structures
        del self.conversations[conversation_id]
        
        # Remove from user's conversation list
        user_conv_list = self.user_conversations[user_id]
        if conversation_id in user_conv_list:
            user_conv_list.remove(conversation_id)
        
        # Remove from cache
        if conversation_id in self.conversation_titles:
            del self.conversation_titles[conversation_id]
        if conversation_id in self.last_accessed:
            del self.last_accessed[conversation_id]
        
        # Remove message cache
        messages_to_remove = [msg["message_id"] for msg in conversation["messages"]]
        for msg_id in messages_to_remove:
            if msg_id in self.message_cache:
                del self.message_cache[msg_id]
        
        return True
    
    def _generate_title(self, first_message: str) -> str:
        """Generate conversation title from first message"""
        words = first_message.split()[:5]
        return " ".join(words) + ("..." if len(first_message.split()) > 5 else "")
    
    async def start_cleanup_task(self, cleanup_interval: int = 3600):  # 1 hour
        """Start background cleanup task"""
        if self.cleanup_task and not self.cleanup_task.done():
            return
        
        async def cleanup():
            while True:
                await asyncio.sleep(cleanup_interval)
                self._cleanup_old_conversations()
        
        self.cleanup_task = asyncio.create_task(cleanup())
    
    def _cleanup_old_conversations(self, max_age_days: int = 30):
        """Clean up old conversations"""
        cutoff_time = time.time() - (max_age_days * 24 * 3600)
        
        conversations_to_delete = [
            conv_id for conv_id, last_access in self.last_accessed.items()
            if last_access < cutoff_time
        ]
        
        for conv_id in conversations_to_delete:
            if conv_id in self.conversations:
                user_id = self.conversations[conv_id]["user_id"]
                self.delete_conversation(conv_id, user_id)

# Global optimized conversation store
conversation_store = OptimizedConversationStore()

# Start cleanup task
async def start_conversation_cleanup():
    await conversation_store.start_cleanup_task()

@router.post("/chat", response_model=ChatResponse)
async def chat_with_bot(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Optimized chatbot endpoint with caching and efficient data structures"""
    
    try:
        # Generate or use existing conversation ID
        conversation_id = request.conversation_id or str(uuid.uuid4())
        
        # Get or create conversation
        conversation = conversation_store.get_conversation(conversation_id, current_user.id)
        if not conversation:
            conversation = conversation_store.create_conversation(current_user.id, conversation_id)
        
        # Add user message
        user_message = {
            "role": "user",
            "content": request.message,
            "timestamp": datetime.utcnow(),
            "message_id": str(uuid.uuid4())
        }
        
        conversation_store.add_message(conversation_id, user_message)
        
        # Get AI response with caching for common queries
        cache_key = f"chat_response:{hash(request.message)}:{hash(str(request.context))}"
        cached_response = cache.get(cache_key)
        
        if cached_response:
            ai_response = cached_response
        else:
            # Get last 10 messages for context (limited for performance)
            recent_messages = conversation["messages"][-10:]
            ai_response = await get_ai_response(
                message=request.message,
                context=request.context,
                conversation_history=recent_messages
            )
            
            # Cache common responses (short queries only)
            if len(request.message) < 100:
                cache.set(cache_key, ai_response, ttl=300)  # 5 minutes
        
        # Create assistant response
        assistant_message = {
            "role": "assistant",
            "content": ai_response["response"],
            "timestamp": datetime.utcnow(),
            "message_id": str(uuid.uuid4())
        }
        
        conversation_store.add_message(conversation_id, assistant_message)
        
        # Generate follow-up suggestions (cached)
        suggestions = generate_suggestions_cached(ai_response["response"])
        
        # Clear user's conversation cache
        cache.delete(CACHE_KEYS['CONVERSATIONS'].format(user_id=current_user.id))
        
        return ChatResponse(
            response=ai_response["response"],
            conversation_id=conversation_id,
            message_id=assistant_message["message_id"],
            timestamp=assistant_message["timestamp"],
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
@cache_response(ttl=60)  # 1 minute cache
async def get_conversation_history(
    current_user: User = Depends(get_current_user),
    limit: int = 10,
    offset: int = 0
):
    """Get user's conversation history with efficient pagination"""
    
    try:
        cache_key = CACHE_KEYS['CONVERSATIONS'].format(user_id=current_user.id)
        
        # Check cache first
        cached_conversations = cache.get(cache_key)
        if cached_conversations:
            return cached_conversations[offset:offset + limit]
        
        # Get conversations from optimized store
        conversations_data = conversation_store.get_user_conversations(
            current_user.id, limit=limit + offset, offset=0
        )
        
        # Convert to response format
        conversations = []
        for conv_data in conversations_data:
            messages = [
                ChatMessage(**msg) for msg in conv_data["messages"]
            ]
            
            conversation = ConversationHistory(
                conversation_id=conv_data["conversation_id"],
                messages=messages,
                created_at=conv_data["created_at"],
                updated_at=conv_data["updated_at"],
                title=conv_data.get("title")
            )
            conversations.append(conversation)
        
        # Cache the result
        cache.set(cache_key, conversations, ttl=60)
        
        # Apply pagination
        return conversations[offset:offset + limit]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve conversation history: {str(e)}"
        )

@router.get("/chat/conversations/{conversation_id}", response_model=ConversationHistory)
@cache_response(ttl=300)  # 5 minute cache
async def get_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get specific conversation with caching"""
    
    try:
        cache_key = f"conversation:{conversation_id}"
        
        # Check cache first
        cached_conversation = cache.get(cache_key)
        if cached_conversation:
            return cached_conversation
        
        conversation = conversation_store.get_conversation(conversation_id, current_user.id)
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
        
        messages = [ChatMessage(**msg) for msg in conversation["messages"]]
        
        response = ConversationHistory(
            conversation_id=conversation_id,
            messages=messages,
            created_at=conversation["created_at"],
            updated_at=conversation["updated_at"],
            title=conversation_store.conversation_titles.get(conversation_id)
        )
        
        # Cache the result
        cache.set(cache_key, response, ttl=300)
        
        return response
        
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
    """Delete conversation with cache invalidation"""
    
    try:
        success = conversation_store.delete_conversation(conversation_id, current_user.id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
        
        # Clear related caches
        cache.delete(CACHE_KEYS['CONVERSATIONS'].format(user_id=current_user.id))
        cache.delete(f"conversation:{conversation_id}")
        
        return {"message": "Conversation deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete conversation: {str(e)}"
        )

@router.post("/chat/voice")
async def voice_chat(
    file: UploadFile = File(...),
    language: str = "en",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Voice-based chat with optimized processing"""
    
    if not file.content_type.startswith("audio/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an audio file"
        )
    
    try:
        # Validate file size (25MB limit)
        max_size = 25 * 1024 * 1024
        file_size = 0
        content = await file.read()
        file_size = len(content)
        
        if file_size > max_size:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="File size exceeds 25MB limit"
            )
        
        # Save audio file (in production, use cloud storage)
        import os
        upload_dir = "uploads/audio"
        os.makedirs(upload_dir, exist_ok=True)
        
        filename = f"{uuid.uuid4()}_{file.filename}"
        file_path = os.path.join(upload_dir, filename)
        
        with open(file_path, "wb") as buffer:
            buffer.write(content)
        
        # Convert speech to text (mock implementation)
        transcribed_text = f"Transcribed: {file.filename}"
        
        # Process through chatbot
        chat_request = ChatRequest(
            message=transcribed_text,
            voice_input=True
        )
        
        chat_response = await chat_with_bot(chat_request, current_user, db)
        
        return {
            "transcribed_text": transcribed_text,
            "chat_response": chat_response,
            "audio_file_id": filename,
            "processing_time_ms": 150  # Mock processing time
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Voice chat processing failed: {str(e)}"
        )

# Cached suggestion generator
suggestion_cache = {}

def generate_suggestions_cached(response: str) -> List[str]:
    """Generate follow-up suggestions with caching"""
    cache_key = f"suggestions:{hash(response)}"
    
    if cache_key in suggestion_cache:
        return suggestion_cache[cache_key]
    
    # Simple suggestion generation
    suggestions = [
        "Tell me more about this topic",
        "Can you provide examples?",
        "How does this relate to current events?",
        "What are the practical applications?"
    ]
    
    result = suggestions[:2]  # Return first 2 suggestions
    
    # Cache the result
    suggestion_cache[cache_key] = result
    
    # Limit cache size
    if len(suggestion_cache) > 1000:
        # Remove oldest entry
        oldest_key = next(iter(suggestion_cache))
        del suggestion_cache[oldest_key]
    
    return result