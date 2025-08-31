"""
HANU-YOUTH Backend Server
FastAPI backend for the HANU-YOUTH platform
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from contextlib import asynccontextmanager
import uvicorn
from app.core.config import settings
from app.api.v1.api import api_router
from app.core.cache import cache
from app.api.v1.endpoints.chatbot_optimized import start_conversation_cleanup
from app.api.v1.endpoints.voice_optimized import start_audio_cleanup

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    print("🚀 HANU-YOUTH Backend Starting...")
    
    # Initialize cache and background tasks
    await cache.start_cleanup_task()
    await start_conversation_cleanup()
    await start_audio_cleanup()
    
    print("✅ Cache and background services initialized")
    
    yield
    # Shutdown
    print("🛑 HANU-YOUTH Backend Shutting Down...")

# Create FastAPI app
app = FastAPI(
    title="HANU-YOUTH Platform API",
    description="Advanced AI platform empowering global youth through knowledge, innovation, and community unification",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_HOSTS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Include API routes
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to HANU-YOUTH Platform API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "🌟 Operational"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "HANU-YOUTH Backend"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info"
    )