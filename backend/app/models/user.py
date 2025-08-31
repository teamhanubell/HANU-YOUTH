"""
User models for HANU-YOUTH platform
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Float, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import datetime

class User(Base):
    """User model"""
    
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    country = Column(String, default="Global")
    avatar_url = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    
    # Gamification fields
    xp = Column(Integer, default=0)
    level = Column(Integer, default=1)
    coins = Column(Integer, default=100)  # Virtual currency
    gems = Column(Integer, default=10)    # Premium currency
    
    # Streak system
    daily_streak = Column(Integer, default=0)
    last_login = Column(DateTime, default=datetime.datetime.utcnow)
    current_streak_start = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Activity tracking
    total_searches = Column(Integer, default=0)
    total_quizzes_taken = Column(Integer, default=0)
    total_innovations = Column(Integer, default=0)
    
    # Preferences
    theme = Column(String, default="cyberpunk")
    language = Column(String, default="en")
    notifications_enabled = Column(Boolean, default=True)
    
    # Account status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    is_premium = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    achievements = relationship("UserAchievement", back_populates="user")
    quiz_attempts = relationship("QuizAttempt", back_populates="user")
    team_memberships = relationship("TeamMember", back_populates="user")
    inventory_items = relationship("UserInventory", back_populates="user")
    
    def __repr__(self):
        return f"<User(id={self.id}, username={self.username}, level={self.level})>"

class UserAchievement(Base):
    """User achievement model"""
    
    __tablename__ = "user_achievements"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    achievement_id = Column(Integer, ForeignKey("achievements.id"), nullable=False)
    unlocked_at = Column(DateTime, default=func.now())
    progress = Column(Float, default=100.0)  # Progress percentage
    
    # Relationships
    user = relationship("User", back_populates="achievements")
    achievement = relationship("Achievement")
    
    def __repr__(self):
        return f"<UserAchievement(user_id={self.user_id}, achievement_id={self.achievement_id})>"

class UserInventory(Base):
    """User inventory model for virtual items"""
    
    __tablename__ = "user_inventory"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    item_id = Column(Integer, ForeignKey("inventory_items.id"), nullable=False)
    quantity = Column(Integer, default=1)
    equipped = Column(Boolean, default=False)
    acquired_at = Column(DateTime, default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="inventory_items")
    item = relationship("InventoryItem")
    
    def __repr__(self):
        return f"<UserInventory(user_id={self.user_id}, item_id={self.item_id}, quantity={self.quantity})>"