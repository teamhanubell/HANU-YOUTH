"""
User management endpoints for HANU-YOUTH platform
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
from app.core.database import get_db
from app.models import User, UserAchievement, UserInventory
from app.api.v1.endpoints.auth import get_current_user
from pydantic import BaseModel
import os
import uuid

router = APIRouter()

class UserProfileUpdate(BaseModel):
    """User profile update model"""
    full_name: Optional[str] = None
    country: Optional[str] = None
    bio: Optional[str] = None
    theme: Optional[str] = None
    language: Optional[str] = None
    notifications_enabled: Optional[bool] = None

class UserProfileResponse(BaseModel):
    """User profile response model"""
    id: int
    email: str
    username: str
    full_name: Optional[str]
    country: str
    bio: Optional[str]
    avatar_url: Optional[str]
    level: int
    xp: int
    coins: int
    gems: int
    daily_streak: int
    total_searches: int
    total_quizzes_taken: int
    total_innovations: int
    theme: str
    language: str
    notifications_enabled: bool
    is_premium: bool
    is_verified: bool
    created_at: datetime

class UserStatsResponse(BaseModel):
    """User statistics response model"""
    total_xp: int
    current_level: int
    next_level_xp: Optional[int]
    level_progress: float
    total_coins: int
    total_gems: int
    daily_streak: int
    total_achievements: int
    total_quizzes_taken: int
    total_searches: int
    total_innovations: int
    join_date: datetime

@router.get("/profile", response_model=UserProfileResponse)
async def get_user_profile(
    current_user: User = Depends(get_current_user)
):
    """Get current user profile"""
    return UserProfileResponse(
        id=current_user.id,
        email=current_user.email,
        username=current_user.username,
        full_name=current_user.full_name,
        country=current_user.country,
        bio=current_user.bio,
        avatar_url=current_user.avatar_url,
        level=current_user.level,
        xp=current_user.xp,
        coins=current_user.coins,
        gems=current_user.gems,
        daily_streak=current_user.daily_streak,
        total_searches=current_user.total_searches,
        total_quizzes_taken=current_user.total_quizzes_taken,
        total_innovations=current_user.total_innovations,
        theme=current_user.theme,
        language=current_user.language,
        notifications_enabled=current_user.notifications_enabled,
        is_premium=current_user.is_premium,
        is_verified=current_user.is_verified,
        created_at=current_user.created_at
    )

@router.put("/profile")
async def update_user_profile(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user profile"""
    # Update fields
    if profile_data.full_name is not None:
        current_user.full_name = profile_data.full_name
    if profile_data.country is not None:
        current_user.country = profile_data.country
    if profile_data.bio is not None:
        current_user.bio = profile_data.bio
    if profile_data.theme is not None:
        current_user.theme = profile_data.theme
    if profile_data.language is not None:
        current_user.language = profile_data.language
    if profile_data.notifications_enabled is not None:
        current_user.notifications_enabled = profile_data.notifications_enabled
    
    current_user.updated_at = datetime.now()
    db.commit()
    
    return {"message": "Profile updated successfully"}

@router.post("/upload-avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload user avatar"""
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )
    
    # Create uploads directory if it doesn't exist
    upload_dir = "uploads/avatars"
    os.makedirs(upload_dir, exist_ok=True)
    
    # Generate unique filename
    file_extension = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(upload_dir, filename)
    
    # Save file
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    # Update user avatar URL
    current_user.avatar_url = f"/{file_path}"
    current_user.updated_at = datetime.now()
    db.commit()
    
    return {
        "message": "Avatar uploaded successfully",
        "avatar_url": current_user.avatar_url
    }

@router.get("/stats", response_model=UserStatsResponse)
async def get_user_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user statistics"""
    from app.models.gamification import Level
    
    # Get current level info
    current_level = db.query(Level).filter(Level.level == current_user.level).first()
    next_level = db.query(Level).filter(Level.level == current_user.level + 1).first()
    
    # Calculate level progress
    level_progress = 0.0
    if current_level and next_level:
        level_range = next_level.min_xp - current_level.min_xp
        progress_in_level = current_user.xp - current_level.min_xp
        level_progress = (progress_in_level / level_range) * 100
    
    # Get total achievements
    total_achievements = db.query(UserAchievement).filter(
        UserAchievement.user_id == current_user.id
    ).count()
    
    return UserStatsResponse(
        total_xp=current_user.xp,
        current_level=current_user.level,
        next_level_xp=next_level.min_xp if next_level else None,
        level_progress=level_progress,
        total_coins=current_user.coins,
        total_gems=current_user.gems,
        daily_streak=current_user.daily_streak,
        total_achievements=total_achievements,
        total_quizzes_taken=current_user.total_quizzes_taken,
        total_searches=current_user.total_searches,
        total_innovations=current_user.total_innovations,
        join_date=current_user.created_at
    )

@router.get("/inventory")
async def get_user_inventory(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user inventory"""
    inventory_items = db.query(UserInventory).filter(
        UserInventory.user_id == current_user.id
    ).all()
    
    result = []
    for item in inventory_items:
        result.append({
            "id": item.id,
            "item_id": item.item_id,
            "item_name": item.item.name if item.item else "Unknown",
            "quantity": item.quantity,
            "equipped": item.equipped,
            "acquired_at": item.acquired_at,
            "item_type": item.item.category if item.item else "unknown"
        })
    
    return result

@router.post("/inventory/{item_id}/equip")
async def equip_inventory_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Equip an inventory item"""
    inventory_item = db.query(UserInventory).filter(
        UserInventory.user_id == current_user.id,
        UserInventory.id == item_id
    ).first()
    
    if not inventory_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory item not found"
        )
    
    # Unequip other items of the same type
    if inventory_item.item:
        same_type_items = db.query(UserInventory).filter(
            UserInventory.user_id == current_user.id,
            UserInventory.item_id != inventory_item.item_id,
            UserInventory.equipped == True
        ).all()
        
        for item in same_type_items:
            item.equipped = False
    
    # Equip the item
    inventory_item.equipped = True
    db.commit()
    
    return {"message": "Item equipped successfully"}

@router.post("/inventory/{item_id}/unequip")
async def unequip_inventory_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Unequip an inventory item"""
    inventory_item = db.query(UserInventory).filter(
        UserInventory.user_id == current_user.id,
        UserInventory.id == item_id
    ).first()
    
    if not inventory_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory item not found"
        )
    
    inventory_item.equipped = False
    db.commit()
    
    return {"message": "Item unequipped successfully"}

@router.get("/recent-activity")
async def get_recent_activity(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 10
):
    """Get user's recent activity"""
    # This would typically query activity logs, but for now we'll return basic info
    activities = []
    
    # Get recent quiz attempts
    from app.models.quiz import QuizAttempt
    recent_quizzes = db.query(QuizAttempt).filter(
        QuizAttempt.user_id == current_user.id,
        QuizAttempt.is_completed == True
    ).order_by(QuizAttempt.completed_at.desc()).limit(5).all()
    
    for quiz in recent_quizzes:
        activities.append({
            "type": "quiz",
            "title": f"Completed quiz: {quiz.quiz.title if quiz.quiz else 'Unknown'}",
            "score": quiz.score,
            "max_score": quiz.max_score,
            "timestamp": quiz.completed_at
        })
    
    # Get recent achievements
    recent_achievements = db.query(UserAchievement).filter(
        UserAchievement.user_id == current_user.id
    ).order_by(UserAchievement.unlocked_at.desc()).limit(5).all()
    
    for achievement in recent_achievements:
        activities.append({
            "type": "achievement",
            "title": f"Unlocked achievement: {achievement.achievement.name if achievement.achievement else 'Unknown'}",
            "timestamp": achievement.unlocked_at
        })
    
    # Sort by timestamp and limit
    activities.sort(key=lambda x: x["timestamp"], reverse=True)
    activities = activities[:limit]
    
    return activities