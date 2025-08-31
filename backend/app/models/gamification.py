"""
Gamification models for HANU-YOUTH platform
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Float, JSON, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import datetime
import enum

class StreakType(str, enum.Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"

class StreakStatus(str, enum.Enum):
    ACTIVE = "active"
    FROZEN = "frozen"  # User used streak freeze power-up
    BROKEN = "broken"
    PAUSED = "paused"

class Streak(Base):
    """User streak tracking model"""
    
    __tablename__ = "streaks"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    streak_type = Column(Enum(StreakType), nullable=False, default=StreakType.DAILY)
    current_count = Column(Integer, default=0)
    longest_count = Column(Integer, default=0)
    status = Column(Enum(StreakStatus), default=StreakStatus.ACTIVE)
    
    # Dates
    start_date = Column(DateTime, default=func.now())
    last_activity_date = Column(DateTime, default=func.now())
    next_activity_deadline = Column(DateTime, nullable=True)
    
    # Freeze functionality
    freeze_count = Column(Integer, default=0)  # Available streak freezes
    frozen_until = Column(DateTime, nullable=True)  # When freeze expires
    
    # Rewards and bonuses
    total_xp_earned = Column(Integer, default=0)
    total_coins_earned = Column(Integer, default=0)
    total_gems_earned = Column(Integer, default=0)
    
    # Milestone tracking
    milestones_achieved = Column(JSON, default=list)  # List of milestone levels achieved
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User")
    
    def __repr__(self):
        return f"<Streak(user_id={self.user_id}, type={self.streak_type}, count={self.current_count})>"

class StreakReward(Base):
    """Streak reward configuration"""
    
    __tablename__ = "streak_rewards"
    
    id = Column(Integer, primary_key=True, index=True)
    streak_type = Column(Enum(StreakType), nullable=False)
    milestone = Column(Integer, nullable=False)  # Streak count required
    
    # Rewards
    xp_reward = Column(Integer, default=0)
    coin_reward = Column(Integer, default=0)
    gem_reward = Column(Integer, default=0)
    
    # Special rewards
    power_up_id = Column(Integer, ForeignKey("power_ups.id"), nullable=True)
    achievement_id = Column(Integer, ForeignKey("achievements.id"), nullable=True)
    title_reward = Column(String, nullable=True)  # Special title to unlock
    
    # Bonus multipliers
    xp_multiplier = Column(Float, default=1.0)
    coin_multiplier = Column(Float, default=1.0)
    
    # Duration (for temporary bonuses)
    bonus_duration_hours = Column(Integer, default=0)
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    power_up = relationship("PowerUp")
    achievement = relationship("Achievement")
    
    def __repr__(self):
        return f"<StreakReward(type={self.streak_type}, milestone={self.milestone}, xp={self.xp_reward})>"

class StreakFreeze(Base):
    """Streak freeze power-up usage"""
    
    __tablename__ = "streak_freezes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    streak_id = Column(Integer, ForeignKey("streaks.id"), nullable=False)
    
    # Freeze details
    freeze_duration_hours = Column(Integer, default=24)  # How long the freeze lasts
    used_at = Column(DateTime, default=func.now())
    expires_at = Column(DateTime, nullable=False)
    
    # Reason for freeze (optional)
    reason = Column(String, nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    user = relationship("User")
    streak = relationship("Streak")
    
    def __repr__(self):
        return f"<StreakFreeze(user_id={self.user_id}, expires_at={self.expires_at})>"

class Achievement(Base):
    """Achievement model"""
    
    __tablename__ = "achievements"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    icon = Column(String, nullable=False)
    category = Column(String, nullable=False)  # research, innovation, social, learning
    rarity = Column(String, default="common")  # common, rare, epic, legendary
    xp_reward = Column(Integer, default=100)
    coin_reward = Column(Integer, default=50)
    gem_reward = Column(Integer, default=0)
    
    # Achievement criteria
    criteria = Column(JSON)  # Flexible criteria for different achievement types
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    user_achievements = relationship("UserAchievement", back_populates="achievement")
    
    def __repr__(self):
        return f"<Achievement(name={self.name}, category={self.category}, rarity={self.rarity})>"

class Level(Base):
    """Level definition model"""
    
    __tablename__ = "levels"
    
    id = Column(Integer, primary_key=True, index=True)
    level = Column(Integer, unique=True, nullable=False)
    name = Column(String, nullable=False)
    min_xp = Column(Integer, nullable=False)
    max_xp = Column(Integer, nullable=False)
    rewards = Column(JSON)  # Rewards for reaching this level
    unlocked_features = Column(JSON)  # Features unlocked at this level
    
    def __repr__(self):
        return f"<Level(level={self.level}, name={self.name}, min_xp={self.min_xp})>"

class PowerUp(Base):
    """Power-up model"""
    
    __tablename__ = "power_ups"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    icon = Column(String, nullable=False)
    category = Column(String, nullable=False)  # quiz, search, innovation
    effect_type = Column(String, nullable=False)  # time_multiplier, score_bonus, skip_question
    effect_value = Column(Float, nullable=False)
    duration = Column(Integer, default=0)  # Duration in seconds, 0 for instant
    cost_coins = Column(Integer, default=0)
    cost_gems = Column(Integer, default=0)
    
    # Usage limits
    max_uses_per_day = Column(Integer, default=3)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    
    def __repr__(self):
        return f"<PowerUp(name={self.name}, category={self.category}, cost_coins={self.cost_coins})>"

class UserPowerUp(Base):
    """User power-up usage tracking"""
    
    __tablename__ = "user_power_ups"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    power_up_id = Column(Integer, ForeignKey("power_ups.id"), nullable=False)
    uses_today = Column(Integer, default=0)
    last_used = Column(DateTime, default=func.now())
    
    # Relationships
    user = relationship("User")
    power_up = relationship("PowerUp")
    
    def __repr__(self):
        return f"<UserPowerUp(user_id={self.user_id}, power_up_id={self.power_up_id}, uses_today={self.uses_today})>"

class DailyChallenge(Base):
    """Daily challenge model"""
    
    __tablename__ = "daily_challenges"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    challenge_type = Column(String, nullable=False)  # quiz, search, innovation
    difficulty = Column(String, default="medium")  # easy, medium, hard
    target_value = Column(Integer, nullable=False)  # Target to complete
    xp_reward = Column(Integer, default=200)
    coin_reward = Column(Integer, default=100)
    gem_reward = Column(Integer, default=5)
    
    # Date
    challenge_date = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    
    def __repr__(self):
        return f"<DailyChallenge(title={self.title}, challenge_type={self.challenge_type}, date={self.challenge_date})>"

class UserDailyChallenge(Base):
    """User daily challenge progress"""
    
    __tablename__ = "user_daily_challenges"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    challenge_id = Column(Integer, ForeignKey("daily_challenges.id"), nullable=False)
    progress = Column(Float, default=0.0)  # Progress percentage
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User")
    challenge = relationship("DailyChallenge")
    
    def __repr__(self):
        return f"<UserDailyChallenge(user_id={self.user_id}, challenge_id={self.challenge_id}, progress={self.progress})>"