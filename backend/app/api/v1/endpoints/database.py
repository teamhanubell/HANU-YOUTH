"""
Database API endpoints for HANU-YOUTH platform
Lightweight database operations for user data, leaderboard, and research
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from app.core.database import get_db
from app.models import User
from app.api.v1.endpoints.auth import get_current_user
from pydantic import BaseModel
import json
import uuid

router = APIRouter()

# User Data Models
class UserProfile(BaseModel):
    """User profile model"""
    user_id: int
    username: str
    email: str
    level: int
    xp: int
    coins: int
    streak_days: int
    join_date: datetime
    last_active: datetime
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    preferences: Dict[str, Any] = {}

class UserStats(BaseModel):
    """User statistics model"""
    user_id: int
    total_quizzes_taken: int
    average_score: float
    total_research_viewed: int
    total_innovations_created: int
    team_participations: int
    achievements_earned: int
    hours_spent: float

class UserPreferences(BaseModel):
    """User preferences model"""
    theme: str = "light"
    language: str = "en"
    notifications_enabled: bool = True
    email_notifications: bool = True
    voice_assistant_enabled: bool = True
    privacy_level: str = "standard"
    custom_settings: Dict[str, Any] = {}

# Leaderboard Models
class LeaderboardEntry(BaseModel):
    """Leaderboard entry model"""
    rank: int
    user_id: int
    username: str
    avatar_url: Optional[str] = None
    score: int
    level: int
    xp: int
    streak_days: int
    change_in_rank: Optional[int] = None

class LeaderboardResponse(BaseModel):
    """Leaderboard response model"""
    leaderboard_type: str  # "global", "weekly", "monthly", "team"
    entries: List[LeaderboardEntry]
    total_entries: int
    current_user_rank: Optional[int] = None
    last_updated: datetime

# Research Data Models
class ResearchItem(BaseModel):
    """Research item model"""
    research_id: str
    title: str
    abstract: str
    authors: List[str]
    publication_date: datetime
    source: str
    url: str
    type: str  # "paper", "report", "article", "dataset"
    category: str
    tags: List[str]
    view_count: int
    download_count: int
    rating: float
    user_rating: Optional[float] = None
    is_bookmarked: bool = False
    is_viewed: bool = False

class ResearchFilter(BaseModel):
    """Research filter model"""
    category: Optional[str] = None
    type: Optional[str] = None
    tags: Optional[List[str]] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    min_rating: Optional[float] = None
    search_query: Optional[str] = None

class UserResearchActivity(BaseModel):
    """User research activity model"""
    user_id: int
    total_views: int
    total_downloads: int
    bookmarks: List[str]  # List of research IDs
    recently_viewed: List[ResearchItem]
    favorite_categories: List[str]
    reading_history: List[Dict[str, Any]]

# Database Storage (in-memory for lightweight deployment)
# In production, this would be replaced with proper database tables
user_data_storage = {}
leaderboard_storage = {
    "global": [],
    "weekly": [],
    "monthly": [],
    "team": []
}
research_storage = {}
user_research_activity = {}

@router.get("/user-data/profile", response_model=UserProfile)
async def get_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user profile data"""
    
    try:
        user_id = current_user.id
        
        # Check if user data exists, create if not
        if user_id not in user_data_storage:
            user_data_storage[user_id] = {
                "user_id": user_id,
                "username": current_user.username,
                "email": current_user.email,
                "level": 1,
                "xp": 0,
                "coins": 100,  # Starting coins
                "streak_days": 0,
                "join_date": datetime.utcnow(),
                "last_active": datetime.utcnow(),
                "avatar_url": None,
                "bio": None,
                "preferences": {
                    "theme": "light",
                    "language": "en",
                    "notifications_enabled": True,
                    "email_notifications": True,
                    "voice_assistant_enabled": True,
                    "privacy_level": "standard",
                    "custom_settings": {}
                }
            }
        
        user_data = user_data_storage[user_id]
        user_data["last_active"] = datetime.utcnow()
        
        return UserProfile(**user_data)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve user profile: {str(e)}"
        )

@router.put("/user-data/profile")
async def update_user_profile(
    profile_update: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user profile data"""
    
    try:
        user_id = current_user.id
        
        if user_id not in user_data_storage:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )
        
        # Update allowed fields only
        allowed_fields = ["avatar_url", "bio", "preferences"]
        for field, value in profile_update.items():
            if field in allowed_fields:
                user_data_storage[user_id][field] = value
        
        user_data_storage[user_id]["last_active"] = datetime.utcnow()
        
        return {"message": "Profile updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update user profile: {str(e)}"
        )

@router.get("/user-data/stats", response_model=UserStats)
async def get_user_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user statistics"""
    
    try:
        user_id = current_user.id
        
        # Check if user stats exist, create if not
        if user_id not in user_data_storage:
            await get_user_profile(current_user, db)
        
        # Generate stats based on user activity
        stats = UserStats(
            user_id=user_id,
            total_quizzes_taken=0,  # Would be calculated from quiz history
            average_score=0.0,
            total_research_viewed=0,  # Would be calculated from research history
            total_innovations_created=0,
            team_participations=0,
            achievements_earned=0,
            hours_spent=0.0
        )
        
        return stats
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve user stats: {str(e)}"
        )

@router.get("/leaderboard", response_model=LeaderboardResponse)
async def get_leaderboard(
    leaderboard_type: str = Query("global", regex="^(global|weekly|monthly|team)$"),
    limit: int = Query(50, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get leaderboard data"""
    
    try:
        # Generate mock leaderboard data
        if not leaderboard_storage[leaderboard_type]:
            # Create sample leaderboard entries
            for i in range(1, 101):  # 100 sample users
                entry = {
                    "rank": i,
                    "user_id": i,
                    "username": f"user_{i}",
                    "avatar_url": None,
                    "score": 10000 - (i * 100) + (i * 5),  # Decreasing score with some variation
                    "level": max(1, 50 - i // 2),
                    "xp": (100 - i) * 100,
                    "streak_days": max(0, 30 - i // 3),
                    "change_in_rank": None
                }
                leaderboard_storage[leaderboard_type].append(entry)
        
        # Get paginated results
        all_entries = leaderboard_storage[leaderboard_type]
        paginated_entries = all_entries[offset:offset + limit]
        
        # Find current user's rank
        current_user_rank = None
        for entry in all_entries:
            if entry["user_id"] == current_user.id:
                current_user_rank = entry["rank"]
                break
        
        return LeaderboardResponse(
            leaderboard_type=leaderboard_type,
            entries=[LeaderboardEntry(**entry) for entry in paginated_entries],
            total_entries=len(all_entries),
            current_user_rank=current_user_rank,
            last_updated=datetime.utcnow()
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve leaderboard: {str(e)}"
        )

@router.get("/research", response_model=List[ResearchItem])
async def get_research_items(
    category: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    tags: Optional[str] = Query(None),  # Comma-separated
    search_query: Optional[str] = Query(None),
    limit: int = Query(20, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get research items with filtering"""
    
    try:
        # Generate mock research data if not exists
        if not research_storage:
            for i in range(1, 51):  # 50 sample research items
                research_id = f"research_{i}"
                categories = ["AI", "Climate Change", "Education", "Health", "Technology", "Sustainability"]
                types = ["paper", "report", "article", "dataset"]
                
                research_storage[research_id] = {
                    "research_id": research_id,
                    "title": f"Research Study on {categories[i % len(categories)]} #{i}",
                    "abstract": f"This is a comprehensive study on {categories[i % len(categories)]} with significant findings...",
                    "authors": [f"Author {i}", f"Researcher {i+1}"],
                    "publication_date": datetime.utcnow() - timedelta(days=i * 7),
                    "source": f"Journal of {categories[i % len(categories)]}",
                    "url": f"https://example.com/research/{research_id}",
                    "type": types[i % len(types)],
                    "category": categories[i % len(categories)],
                    "tags": [categories[i % len(categories)], "study", "analysis"],
                    "view_count": i * 10,
                    "download_count": i * 5,
                    "rating": 4.5 - (i * 0.01),
                    "user_rating": None,
                    "is_bookmarked": False,
                    "is_viewed": False
                }
        
        # Filter research items
        filtered_research = []
        tags_list = tags.split(',') if tags else []
        
        for research_id, research_data in research_storage.items():
            # Apply filters
            if category and research_data["category"] != category:
                continue
            
            if type and research_data["type"] != type:
                continue
            
            if tags_list:
                if not any(tag in research_data["tags"] for tag in tags_list):
                    continue
            
            if search_query:
                query_lower = search_query.lower()
                if (query_lower not in research_data["title"].lower() and
                    query_lower not in research_data["abstract"].lower()):
                    continue
            
            filtered_research.append(research_data)
        
        # Apply pagination
        paginated_research = filtered_research[offset:offset + limit]
        
        return [ResearchItem(**research) for research in paginated_research]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve research items: {str(e)}"
        )

@router.get("/research/{research_id}", response_model=ResearchItem)
async def get_research_item(
    research_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get specific research item"""
    
    try:
        if research_id not in research_storage:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Research item not found"
            )
        
        research_data = research_storage[research_id]
        
        # Increment view count
        research_data["view_count"] += 1
        research_data["is_viewed"] = True
        
        return ResearchItem(**research_data)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve research item: {str(e)}"
        )

@router.post("/research/{research_id}/bookmark")
async def bookmark_research(
    research_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Bookmark a research item"""
    
    try:
        if research_id not in research_storage:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Research item not found"
            )
        
        user_id = current_user.id
        
        # Initialize user research activity if not exists
        if user_id not in user_research_activity:
            user_research_activity[user_id] = {
                "user_id": user_id,
                "total_views": 0,
                "total_downloads": 0,
                "bookmarks": [],
                "recently_viewed": [],
                "favorite_categories": [],
                "reading_history": []
            }
        
        # Add to bookmarks if not already bookmarked
        if research_id not in user_research_activity[user_id]["bookmarks"]:
            user_research_activity[user_id]["bookmarks"].append(research_id)
            research_storage[research_id]["is_bookmarked"] = True
        
        return {"message": "Research item bookmarked successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to bookmark research item: {str(e)}"
        )

@router.delete("/research/{research_id}/bookmark")
async def remove_bookmark(
    research_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove bookmark from research item"""
    
    try:
        user_id = current_user.id
        
        if user_id not in user_research_activity:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User activity not found"
            )
        
        # Remove from bookmarks
        if research_id in user_research_activity[user_id]["bookmarks"]:
            user_research_activity[user_id]["bookmarks"].remove(research_id)
            if research_id in research_storage:
                research_storage[research_id]["is_bookmarked"] = False
        
        return {"message": "Bookmark removed successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to remove bookmark: {str(e)}"
        )

@router.get("/user-data/research-activity", response_model=UserResearchActivity)
async def get_user_research_activity(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user research activity"""
    
    try:
        user_id = current_user.id
        
        # Initialize user research activity if not exists
        if user_id not in user_research_activity:
            user_research_activity[user_id] = {
                "user_id": user_id,
                "total_views": 0,
                "total_downloads": 0,
                "bookmarks": [],
                "recently_viewed": [],
                "favorite_categories": [],
                "reading_history": []
            }
        
        activity_data = user_research_activity[user_id]
        
        # Get recently viewed research items
        recently_viewed = []
        for research_id in activity_data["recently_viewed"][-10:]:  # Last 10 items
            if research_id in research_storage:
                recently_viewed.append(ResearchItem(**research_storage[research_id]))
        
        return UserResearchActivity(
            user_id=activity_data["user_id"],
            total_views=activity_data["total_views"],
            total_downloads=activity_data["total_downloads"],
            bookmarks=activity_data["bookmarks"],
            recently_viewed=recently_viewed,
            favorite_categories=activity_data["favorite_categories"],
            reading_history=activity_data["reading_history"]
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve user research activity: {str(e)}"
        )