"""
Optimized Database API endpoints for HANU-YOUTH platform
Improved time complexity and performance
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from collections import defaultdict
import bisect
from app.core.database import get_db
from app.models import User
from app.api.v1.endpoints.auth import get_current_user
from app.core.cache import cache, cache_response, CACHE_KEYS
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
    leaderboard_type: str
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
    type: str
    category: str
    tags: List[str]
    view_count: int
    download_count: int
    rating: float
    user_rating: Optional[float] = None
    is_bookmarked: bool = False
    is_viewed: bool = False

class UserResearchActivity(BaseModel):
    """User research activity model"""
    user_id: int
    total_views: int
    total_downloads: int
    bookmarks: List[str]
    recently_viewed: List[ResearchItem]
    favorite_categories: List[str]
    reading_history: List[Dict[str, Any]]

# Optimized data structures
class OptimizedDataStore:
    """Optimized data store with indexing and caching"""
    
    def __init__(self):
        self.user_data = {}
        self.leaderboard_data = {
            "global": {"entries": [], "user_index": {}},
            "weekly": {"entries": [], "user_index": {}},
            "monthly": {"entries": [], "user_index": {}},
            "team": {"entries": [], "user_index": {}}
        }
        self.research_data = {
            "items": {},
            "category_index": defaultdict(list),
            "type_index": defaultdict(list),
            "tag_index": defaultdict(list),
            "rating_index": []
        }
        self.user_research_activity = {}
    
    def initialize_sample_data(self):
        """Initialize optimized sample data"""
        # Initialize leaderboard with user index for O(1) lookup
        for leaderboard_type in self.leaderboard_data:
            entries = []
            user_index = {}
            
            for i in range(1, 101):
                entry = {
                    "rank": i,
                    "user_id": i,
                    "username": f"user_{i}",
                    "avatar_url": None,
                    "score": 10000 - (i * 100) + (i * 5),
                    "level": max(1, 50 - i // 2),
                    "xp": (100 - i) * 100,
                    "streak_days": max(0, 30 - i // 3),
                    "change_in_rank": None
                }
                entries.append(entry)
                user_index[i] = entry  # O(1) user lookup
            
            self.leaderboard_data[leaderboard_type]["entries"] = entries
            self.leaderboard_data[leaderboard_type]["user_index"] = user_index
        
        # Initialize research data with indexes
        categories = ["AI", "Climate Change", "Education", "Health", "Technology", "Sustainability"]
        types = ["paper", "report", "article", "dataset"]
        tags = ["study", "analysis", "research", "innovation", "global"]
        
        for i in range(1, 51):
            research_id = f"research_{i}"
            category = categories[i % len(categories)]
            item_type = types[i % len(types)]
            item_tags = [category, tags[i % len(tags)]]
            
            item = {
                "research_id": research_id,
                "title": f"Research Study on {category} #{i}",
                "abstract": f"This is a comprehensive study on {category} with significant findings...",
                "authors": [f"Author {i}", f"Researcher {i+1}"],
                "publication_date": datetime.utcnow() - timedelta(days=i * 7),
                "source": f"Journal of {category}",
                "url": f"https://example.com/research/{research_id}",
                "type": item_type,
                "category": category,
                "tags": item_tags,
                "view_count": i * 10,
                "download_count": i * 5,
                "rating": 4.5 - (i * 0.01),
                "user_rating": None,
                "is_bookmarked": False,
                "is_viewed": False
            }
            
            self.research_data["items"][research_id] = item
            self.research_data["category_index"][category].append(research_id)
            self.research_data["type_index"][item_type].append(research_id)
            
            for tag in item_tags:
                self.research_data["tag_index"][tag].append(research_id)
            
            # Add to rating index (sorted list for binary search)
            bisect.insort(self.research_data["rating_index"], (item["rating"], research_id))

# Global optimized data store
data_store = OptimizedDataStore()
data_store.initialize_sample_data()

@router.get("/user-data/profile", response_model=UserProfile)
@cache_response(ttl=180)  # 3 minute cache
async def get_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user profile data with caching"""
    
    try:
        user_id = current_user.id
        
        # Check cache first
        cache_key = CACHE_KEYS['USER_PROFILE'].format(user_id=user_id)
        cached_profile = cache.get(cache_key)
        if cached_profile:
            return cached_profile
        
        # Initialize user data if not exists
        if user_id not in data_store.user_data:
            data_store.user_data[user_id] = {
                "user_id": user_id,
                "username": current_user.username,
                "email": current_user.email,
                "level": 1,
                "xp": 0,
                "coins": 100,
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
        
        user_data = data_store.user_data[user_id].copy()
        user_data["last_active"] = datetime.utcnow()
        
        profile = UserProfile(**user_data)
        
        # Cache the result
        cache.set(cache_key, profile)
        
        return profile
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve user profile: {str(e)}"
        )

@router.get("/leaderboard", response_model=LeaderboardResponse)
@cache_response(ttl=60)  # 1 minute cache
async def get_leaderboard(
    leaderboard_type: str = Query("global", regex="^(global|weekly|monthly|team)$"),
    limit: int = Query(50, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get leaderboard data with O(1) user rank lookup"""
    
    try:
        if leaderboard_type not in data_store.leaderboard_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid leaderboard type"
            )
        
        leaderboard_info = data_store.leaderboard_data[leaderboard_type]
        all_entries = leaderboard_info["entries"]
        
        # Optimized pagination with list slicing (O(k) where k is page size)
        paginated_entries = all_entries[offset:offset + limit]
        
        # O(1) user rank lookup using pre-built index
        current_user_rank = None
        if current_user.id in leaderboard_info["user_index"]:
            current_user_rank = leaderboard_info["user_index"][current_user.id]["rank"]
        
        return LeaderboardResponse(
            leaderboard_type=leaderboard_type,
            entries=[LeaderboardEntry(**entry) for entry in paginated_entries],
            total_entries=len(all_entries),
            current_user_rank=current_user_rank,
            last_updated=datetime.utcnow()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve leaderboard: {str(e)}"
        )

@router.get("/research", response_model=List[ResearchItem])
@cache_response(ttl=300)  # 5 minute cache
async def get_research_items(
    category: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    tags: Optional[str] = Query(None),
    search_query: Optional[str] = Query(None),
    min_rating: Optional[float] = Query(None),
    limit: int = Query(20, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get research items with optimized filtering and indexing"""
    
    try:
        # Build cache key for this specific filter combination
        cache_key = CACHE_KEYS['RESEARCH_ITEMS'].format(
            filters=f"{category}:{type}:{tags}:{search_query}:{min_rating}"
        )
        
        # Check cache first
        cached_results = cache.get(cache_key)
        if cached_results:
            return cached_results[offset:offset + limit]
        
        # Start with all items
        result_ids = set(data_store.research_data["items"].keys())
        
        # Apply filters using indexes for O(1) lookups
        if category:
            category_ids = set(data_store.research_data["category_index"].get(category, []))
            result_ids &= category_ids
        
        if type:
            type_ids = set(data_store.research_data["type_index"].get(type, []))
            result_ids &= type_ids
        
        if tags:
            tags_list = tags.split(',')
            for tag in tags_list:
                tag_ids = set(data_store.research_data["tag_index"].get(tag, []))
                result_ids &= tag_ids
        
        if min_rating is not None:
            # Use binary search on sorted rating index
            rating_index = data_store.research_data["rating_index"]
            # Find first item with rating >= min_rating
            min_pos = bisect.bisect_left(rating_index, (min_rating, ""))
            high_rated_ids = {item_id for _, item_id in rating_index[min_pos:]}
            result_ids &= high_rated_ids
        
        # Apply search query (this is O(n) but only on filtered results)
        if search_query:
            query_lower = search_query.lower()
            filtered_ids = set()
            for research_id in result_ids:
                item = data_store.research_data["items"][research_id]
                if (query_lower in item["title"].lower() or 
                    query_lower in item["abstract"].lower()):
                    filtered_ids.add(research_id)
            result_ids = filtered_ids
        
        # Convert to list and sort by relevance (view count + rating)
        result_items = []
        for research_id in result_ids:
            item = data_store.research_data["items"][research_id]
            result_items.append(item)
        
        # Sort by combined score (view_count + rating * 100)
        result_items.sort(key=lambda x: x["view_count"] + x["rating"] * 100, reverse=True)
        
        # Cache the full result set
        research_items = [ResearchItem(**item) for item in result_items]
        cache.set(cache_key, research_items)
        
        # Return paginated results
        return research_items[offset:offset + limit]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve research items: {str(e)}"
        )

@router.get("/research/{research_id}", response_model=ResearchItem)
@cache_response(ttl=600)  # 10 minute cache
async def get_research_item(
    research_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get specific research item with caching"""
    
    try:
        if research_id not in data_store.research_data["items"]:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Research item not found"
            )
        
        research_data = data_store.research_data["items"][research_id].copy()
        
        # Increment view count
        research_data["view_count"] += 1
        research_data["is_viewed"] = True
        
        # Clear related caches
        cache.delete(CACHE_KEYS['RESEARCH_ITEMS'].format(filters="*"))
        
        return ResearchItem(**research_data)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve research item: {str(e)}"
        )

@router.get("/user-data/research-activity", response_model=UserResearchActivity)
@cache_response(ttl=120)  # 2 minute cache
async def get_user_research_activity(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user research activity with caching"""
    
    try:
        user_id = current_user.id
        
        # Check cache first
        cache_key = CACHE_KEYS['RECENT_RESEARCH'].format(user_id=user_id)
        cached_activity = cache.get(cache_key)
        if cached_activity:
            return cached_activity
        
        # Initialize user research activity if not exists
        if user_id not in data_store.user_research_activity:
            data_store.user_research_activity[user_id] = {
                "user_id": user_id,
                "total_views": 0,
                "total_downloads": 0,
                "bookmarks": [],
                "recently_viewed": [],
                "favorite_categories": [],
                "reading_history": []
            }
        
        activity_data = data_store.user_research_activity[user_id]
        
        # Get recently viewed research items
        recently_viewed = []
        for research_id in activity_data["recently_viewed"][-10:]:
            if research_id in data_store.research_data["items"]:
                recently_viewed.append(ResearchItem(**data_store.research_data["items"][research_id]))
        
        activity = UserResearchActivity(
            user_id=activity_data["user_id"],
            total_views=activity_data["total_views"],
            total_downloads=activity_data["total_downloads"],
            bookmarks=activity_data["bookmarks"],
            recently_viewed=recently_viewed,
            favorite_categories=activity_data["favorite_categories"],
            reading_history=activity_data["reading_history"]
        )
        
        # Cache the result
        cache.set(cache_key, activity)
        
        return activity
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve user research activity: {str(e)}"
        )

@router.post("/research/{research_id}/bookmark")
async def bookmark_research(
    research_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Bookmark a research item with cache invalidation"""
    
    try:
        if research_id not in data_store.research_data["items"]:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Research item not found"
            )
        
        user_id = current_user.id
        
        # Initialize user research activity if not exists
        if user_id not in data_store.user_research_activity:
            data_store.user_research_activity[user_id] = {
                "user_id": user_id,
                "total_views": 0,
                "total_downloads": 0,
                "bookmarks": [],
                "recently_viewed": [],
                "favorite_categories": [],
                "reading_history": []
            }
        
        # Add to bookmarks if not already bookmarked
        if research_id not in data_store.user_research_activity[user_id]["bookmarks"]:
            data_store.user_research_activity[user_id]["bookmarks"].append(research_id)
            data_store.research_data["items"][research_id]["is_bookmarked"] = True
        
        # Clear related caches
        cache.delete(CACHE_KEYS['RECENT_RESEARCH'].format(user_id=user_id))
        cache.delete(CACHE_KEYS['RESEARCH_ITEMS'].format(filters="*"))
        
        return {"message": "Research item bookmarked successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to bookmark research item: {str(e)}"
        )