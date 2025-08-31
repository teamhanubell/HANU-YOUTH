"""
Main API router for HANU-YOUTH platform v1
"""

from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, gamification, quiz, teams, search, ai, chatbot, voice, database
from app.api.v1.endpoints import chatbot_optimized, database_optimized, voice_optimized

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(gamification.router, prefix="/gamification", tags=["Gamification"])
api_router.include_router(quiz.router, prefix="/quiz", tags=["Quiz & Learning"])
api_router.include_router(teams.router, prefix="/teams", tags=["Teams & Competitions"])
api_router.include_router(search.router, prefix="/search", tags=["Search & Knowledge"])
api_router.include_router(ai.router, prefix="/ai", tags=["AI Services"])
api_router.include_router(chatbot.router, prefix="/chatbot", tags=["Chatbot"])
api_router.include_router(chatbot_optimized.router, prefix="/chatbot-optimized", tags=["Chatbot (Optimized)"])
api_router.include_router(voice.router, prefix="/voice", tags=["Voice Services"])
api_router.include_router(voice_optimized.router, prefix="/voice-optimized", tags=["Voice (Optimized)"])
api_router.include_router(database.router, prefix="/database", tags=["Database Services"])
api_router.include_router(database_optimized.router, prefix="/database-optimized", tags=["Database (Optimized)"])