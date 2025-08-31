"""
Gamification endpoints for HANU-YOUTH platform
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from app.core.database import get_db
from app.models import (
    User, Achievement, UserAchievement, Level, PowerUp, UserPowerUp,
    DailyChallenge, UserDailyChallenge, Streak, StreakReward, StreakFreeze, StreakType, StreakStatus
)
from app.api.v1.endpoints.auth import get_current_user
from pydantic import BaseModel
from sqlalchemy import and_, or_

router = APIRouter()

class StreakResponse(BaseModel):
    """Streak response model"""
    id: int
    streak_type: str
    current_count: int
    longest_count: int
    status: str
    start_date: datetime
    last_activity_date: datetime
    next_activity_deadline: Optional[datetime]
    freeze_count: int
    frozen_until: Optional[datetime]
    total_xp_earned: int
    total_coins_earned: int
    total_gems_earned: int
    milestones_achieved: List[int]

class StreakRewardResponse(BaseModel):
    """Streak reward response model"""
    id: int
    streak_type: str
    milestone: int
    xp_reward: int
    coin_reward: int
    gem_reward: int
    power_up_id: Optional[int]
    achievement_id: Optional[int]
    title_reward: Optional[str]
    xp_multiplier: float
    coin_multiplier: float
    bonus_duration_hours: int
    is_achieved: bool

class StreakActionResponse(BaseModel):
    """Streak action response model"""
    success: bool
    message: str
    streak_updated: bool
    new_count: int
    rewards_earned: dict
    next_milestone: Optional[int]
    time_until_next_deadline: Optional[str]

class LevelResponse(BaseModel):
    """Level response model"""
    id: int
    level: int
    name: str
    min_xp: int
    max_xp: int
    rewards: dict
    unlocked_features: List[str]

class UserLevelProgressResponse(BaseModel):
    """User level progress response model"""
    current_level: int
    current_xp: int
    level_progress: float
    next_level_xp: Optional[int]
    xp_to_next_level: Optional[int]
    total_levels: int
    unlocked_features: List[str]
    recent_level_ups: List[dict]

class XPResponse(BaseModel):
    """XP response model"""
    xp_earned: int
    total_xp: int
    level: int
    level_progress: float
    next_level_xp: Optional[int]

class AchievementResponse(BaseModel):
    """Achievement response model"""
    id: int
    name: str
    description: str
    icon: str
    category: str
    rarity: str
    unlocked: bool
    unlocked_at: Optional[datetime]
    progress: float

class PowerUpResponse(BaseModel):
    """Power-up response model"""
    id: int
    name: str
    description: str
    icon: str
    category: str
    effect_type: str
    effect_value: float
    duration: int
    cost_coins: int
    cost_gems: int
    max_uses_per_day: int
    uses_today: int
    can_use: bool

class DailyChallengeResponse(BaseModel):
    """Daily challenge response model"""
    id: int
    title: str
    description: str
    challenge_type: str
    difficulty: str
    target_value: int
    xp_reward: int
    coin_reward: int
    gem_reward: int
    progress: float
    is_completed: bool

@router.post("/add-xp", response_model=XPResponse)
async def add_xp(
    xp_amount: int,
    activity_type: str = "general",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add XP to user and handle level ups"""
    if xp_amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="XP amount must be positive"
        )
    
    # Add XP to user
    current_user.xp += xp_amount
    
    # Update activity stats
    if activity_type == "search":
        current_user.total_searches += 1
    elif activity_type == "quiz":
        current_user.total_quizzes_taken += 1
    elif activity_type == "innovation":
        current_user.total_innovations += 1
    
    # Check for level up
    new_level = current_user.level
    levels = db.query(Level).order_by(Level.level).all()
    
    for level in levels:
        if current_user.xp >= level.min_xp:
            new_level = level.level
        else:
            break
    
    level_up = False
    if new_level > current_user.level:
        level_up = True
        current_user.level = new_level
        
        # Add level up rewards
        level_data = db.query(Level).filter(Level.level == new_level).first()
        if level_data and level_data.rewards:
            rewards = level_data.rewards
            if "coins" in rewards:
                current_user.coins += rewards["coins"]
            if "gems" in rewards:
                current_user.gems += rewards["gems"]
    
    db.commit()
    
    # Calculate progress to next level
    next_level = db.query(Level).filter(Level.level == new_level + 1).first()
    next_level_xp = next_level.min_xp if next_level else None
    current_level = db.query(Level).filter(Level.level == new_level).first()
    
    level_progress = 0.0
    if current_level and next_level:
        level_range = next_level.min_xp - current_level.min_xp
        progress_in_level = current_user.xp - current_level.min_xp
        level_progress = (progress_in_level / level_range) * 100
    
    return XPResponse(
        xp_earned=xp_amount,
        total_xp=current_user.xp,
        level=current_user.level,
        level_progress=level_progress,
        next_level_xp=next_level_xp
    )

@router.get("/achievements", response_model=List[AchievementResponse])
async def get_achievements(
    category: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user achievements"""
    query = db.query(Achievement)
    if category:
        query = query.filter(Achievement.category == category)
    
    achievements = query.all()
    
    # Get user's unlocked achievements
    user_achievements = db.query(UserAchievement).filter(
        UserAchievement.user_id == current_user.id
    ).all()
    
    unlocked_achievement_ids = {ua.achievement_id for ua in user_achievements}
    
    result = []
    for achievement in achievements:
        user_achievement = next(
            (ua for ua in user_achievements if ua.achievement_id == achievement.id),
            None
        )
        
        result.append(AchievementResponse(
            id=achievement.id,
            name=achievement.name,
            description=achievement.description,
            icon=achievement.icon,
            category=achievement.category,
            rarity=achievement.rarity,
            unlocked=achievement.id in unlocked_achievement_ids,
            unlocked_at=user_achievement.unlocked_at if user_achievement else None,
            progress=user_achievement.progress if user_achievement else 0.0
        ))
    
    return result

@router.get("/power-ups", response_model=List[PowerUpResponse])
async def get_power_ups(
    category: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get available power-ups"""
    query = db.query(PowerUp)
    if category:
        query = query.filter(PowerUp.category == category)
    
    power_ups = query.all()
    
    # Get user's power-up usage
    user_power_ups = db.query(UserPowerUp).filter(
        UserPowerUp.user_id == current_user.id
    ).all()
    
    user_power_up_dict = {upu.power_up_id: upu for upu in user_power_ups}
    
    result = []
    for power_up in power_ups:
        user_power_up = user_power_up_dict.get(power_up.id)
        
        # Check if user can use this power-up
        can_use = True
        uses_today = 0
        
        if user_power_up:
            # Check if it's a new day
            if user_power_up.last_used.date() == datetime.now().date():
                uses_today = user_power_up.uses_today
                if uses_today >= power_up.max_uses_per_day:
                    can_use = False
        
        # Check if user has enough currency
        if (current_user.coins < power_up.cost_coins or 
            current_user.gems < power_up.cost_gems):
            can_use = False
        
        result.append(PowerUpResponse(
            id=power_up.id,
            name=power_up.name,
            description=power_up.description,
            icon=power_up.icon,
            category=power_up.category,
            effect_type=power_up.effect_type,
            effect_value=power_up.effect_value,
            duration=power_up.duration,
            cost_coins=power_up.cost_coins,
            cost_gems=power_up.cost_gems,
            max_uses_per_day=power_up.max_uses_per_day,
            uses_today=uses_today,
            can_use=can_use
        ))
    
    return result

@router.post("/use-power-up/{power_up_id}")
async def use_power_up(
    power_up_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Use a power-up"""
    power_up = db.query(PowerUp).filter(PowerUp.id == power_up_id).first()
    if not power_up:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Power-up not found"
        )
    
    # Check if user can afford it
    if current_user.coins < power_up.cost_coins or current_user.gems < power_up.cost_gems:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient currency"
        )
    
    # Get or create user power-up record
    user_power_up = db.query(UserPowerUp).filter(
        UserPowerUp.user_id == current_user.id,
        UserPowerUp.power_up_id == power_up_id
    ).first()
    
    if not user_power_up:
        user_power_up = UserPowerUp(
            user_id=current_user.id,
            power_up_id=power_up_id,
            uses_today=0
        )
        db.add(user_power_up)
    
    # Check usage limits
    if user_power_up.last_used.date() == datetime.now().date():
        if user_power_up.uses_today >= power_up.max_uses_per_day:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Daily usage limit exceeded"
            )
        user_power_up.uses_today += 1
    else:
        user_power_up.uses_today = 1
    
    # Deduct currency
    current_user.coins -= power_up.cost_coins
    current_user.gems -= power_up.cost_gems
    
    user_power_up.last_used = datetime.now()
    
    db.commit()
    
    return {
        "message": f"Power-up '{power_up.name}' used successfully",
        "effect": {
            "type": power_up.effect_type,
            "value": power_up.effect_value,
            "duration": power_up.duration
        },
        "remaining_uses": power_up.max_uses_per_day - user_power_up.uses_today,
        "user_currency": {
            "coins": current_user.coins,
            "gems": current_user.gems
        }
    }

@router.get("/daily-challenges", response_model=List[DailyChallengeResponse])
async def get_daily_challenges(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get daily challenges"""
    today = datetime.now().date()
    
    # Get today's challenges
    challenges = db.query(DailyChallenge).filter(
        DailyChallenge.challenge_date == today,
        DailyChallenge.is_active == True
    ).all()
    
    # Get user's progress
    user_challenges = db.query(UserDailyChallenge).filter(
        UserDailyChallenge.user_id == current_user.id,
        UserDailyChallenge.challenge_id.in_([c.id for c in challenges])
    ).all()
    
    user_challenge_dict = {uc.challenge_id: uc for uc in user_challenges}
    
    result = []
    for challenge in challenges:
        user_challenge = user_challenge_dict.get(challenge.id)
        
        if not user_challenge:
            # Create user challenge record
            user_challenge = UserDailyChallenge(
                user_id=current_user.id,
                challenge_id=challenge.id,
                progress=0.0,
                is_completed=False
            )
            db.add(user_challenge)
            db.commit()
            db.refresh(user_challenge)
        
        result.append(DailyChallengeResponse(
            id=challenge.id,
            title=challenge.title,
            description=challenge.description,
            challenge_type=challenge.challenge_type,
            difficulty=challenge.difficulty,
            target_value=challenge.target_value,
            xp_reward=challenge.xp_reward,
            coin_reward=challenge.coin_reward,
            gem_reward=challenge.gem_reward,
            progress=user_challenge.progress,
            is_completed=user_challenge.is_completed
        ))
    
    return result

@router.post("/update-daily-streak")
async def update_daily_streak(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update daily streak"""
    today = datetime.now().date()
    last_login = current_user.last_login.date()
    
    streak_updated = False
    streak_bonus = 0
    
    if last_login < today:
        # Check if it's consecutive day
        if last_login == today - timedelta(days=1):
            current_user.daily_streak += 1
            streak_updated = True
        elif last_login < today - timedelta(days=1):
            # Reset streak if more than one day missed
            current_user.daily_streak = 1
            streak_updated = True
        
        current_user.current_streak_start = datetime.now()
        
        # Award streak bonus
        if streak_updated:
            streak_bonus = current_user.daily_streak * 10  # 10 XP per day streak
            current_user.xp += streak_bonus
            current_user.coins += current_user.daily_streak * 5  # 5 coins per day streak
    
    current_user.last_login = datetime.now()
    db.commit()
    
    return {
        "daily_streak": current_user.daily_streak,
        "streak_updated": streak_updated,
        "streak_bonus_xp": streak_bonus,
        "next_streak_bonus": (current_user.daily_streak + 1) * 10
    }

# === STREAK SYSTEM ENDPOINTS ===

@router.get("/streaks", response_model=List[StreakResponse])
async def get_user_streaks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all streaks for the current user"""
    streaks = db.query(Streak).filter(Streak.user_id == current_user.id).all()
    
    result = []
    for streak in streaks:
        # Check if streak is still active based on deadlines
        now = datetime.now()
        is_expired = False
        
        if streak.next_activity_deadline and now > streak.next_activity_deadline:
            if streak.status != StreakStatus.FROZEN:
                is_expired = True
                streak.status = StreakStatus.BROKEN
                db.commit()
        
        result.append(StreakResponse(
            id=streak.id,
            streak_type=streak.streak_type.value,
            current_count=streak.current_count,
            longest_count=streak.longest_count,
            status=streak.status.value,
            start_date=streak.start_date,
            last_activity_date=streak.last_activity_date,
            next_activity_deadline=streak.next_activity_deadline,
            freeze_count=streak.freeze_count,
            frozen_until=streak.frozen_until,
            total_xp_earned=streak.total_xp_earned,
            total_coins_earned=streak.total_coins_earned,
            total_gems_earned=streak.total_gems_earned,
            milestones_achieved=streak.milestones_achieved or []
        ))
    
    return result

@router.post("/streaks/{streak_type}/activity", response_model=StreakActionResponse)
async def record_streak_activity(
    streak_type: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Record activity for a specific streak type"""
    try:
        streak_type_enum = StreakType(streak_type)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid streak type: {streak_type}"
        )
    
    now = datetime.now()
    
    # Get or create streak
    streak = db.query(Streak).filter(
        and_(Streak.user_id == current_user.id, Streak.streak_type == streak_type_enum)
    ).first()
    
    if not streak:
        streak = Streak(
            user_id=current_user.id,
            streak_type=streak_type_enum,
            current_count=1,
            longest_count=1,
            status=StreakStatus.ACTIVE,
            start_date=now,
            last_activity_date=now
        )
        db.add(streak)
        db.commit()
        db.refresh(streak)
    else:
        # Check if streak is expired
        if streak.next_activity_deadline and now > streak.next_activity_deadline:
            if streak.status != StreakStatus.FROZEN:
                streak.status = StreakStatus.BROKEN
                streak.current_count = 0
                streak.start_date = now
            else:
                # Check if freeze is still active
                if streak.frozen_until and now > streak.frozen_until:
                    streak.status = StreakStatus.BROKEN
                    streak.current_count = 0
                    streak.start_date = now
                    streak.frozen_until = None
        
        # Update streak
        streak.last_activity_date = now
        streak.status = StreakStatus.ACTIVE
        
        # Calculate deadline based on streak type
        if streak_type_enum == StreakType.DAILY:
            streak.next_activity_deadline = now + timedelta(days=1)
        elif streak_type_enum == StreakType.WEEKLY:
            streak.next_activity_deadline = now + timedelta(weeks=1)
        elif streak_type_enum == StreakType.MONTHLY:
            streak.next_activity_deadline = now + timedelta(days=30)
        
        # Increment streak if this is a new activity period
        time_since_last = now - streak.last_activity_date
        if time_since_last >= timedelta(hours=12):  # Minimum 12 hours between activities
            streak.current_count += 1
            if streak.current_count > streak.longest_count:
                streak.longest_count = streak.current_count
    
    db.commit()
    
    # Check for milestone rewards
    rewards_earned = await _check_streak_milestones(streak, db)
    
    # Update user stats
    current_user.xp += rewards_earned.get("xp", 0)
    current_user.coins += rewards_earned.get("coins", 0)
    current_user.gems += rewards_earned.get("gems", 0)
    
    # Update streak totals
    streak.total_xp_earned += rewards_earned.get("xp", 0)
    streak.total_coins_earned += rewards_earned.get("coins", 0)
    streak.total_gems_earned += rewards_earned.get("gems", 0)
    
    db.commit()
    
    # Get next milestone
    next_milestone = db.query(StreakReward).filter(
        and_(
            StreakReward.streak_type == streak_type_enum,
            StreakReward.milestone > streak.current_count,
            StreakReward.is_active == True
        )
    ).order_by(StreakReward.milestone).first()
    
    # Calculate time until next deadline
    time_until_next = None
    if streak.next_activity_deadline:
        time_diff = streak.next_activity_deadline - now
        hours = int(time_diff.total_seconds() // 3600)
        minutes = int((time_diff.total_seconds() % 3600) // 60)
        time_until_next = f"{hours}h {minutes}m"
    
    return StreakActionResponse(
        success=True,
        message=f"Activity recorded for {streak_type} streak!",
        streak_updated=True,
        new_count=streak.current_count,
        rewards_earned=rewards_earned,
        next_milestone=next_milestone.milestone if next_milestone else None,
        time_until_next_deadline=time_until_next
    )

@router.get("/streaks/{streak_type}/rewards", response_model=List[StreakRewardResponse])
async def get_streak_rewards(
    streak_type: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get available rewards for a streak type"""
    try:
        streak_type_enum = StreakType(streak_type)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid streak type: {streak_type}"
        )
    
    # Get user's current streak
    user_streak = db.query(Streak).filter(
        and_(Streak.user_id == current_user.id, Streak.streak_type == streak_type_enum)
    ).first()
    
    current_count = user_streak.current_count if user_streak else 0
    achieved_milestones = user_streak.milestones_achieved if user_streak else []
    
    # Get all rewards for this streak type
    rewards = db.query(StreakReward).filter(
        and_(StreakReward.streak_type == streak_type_enum, StreakReward.is_active == True)
    ).order_by(StreakReward.milestone).all()
    
    result = []
    for reward in rewards:
        result.append(StreakRewardResponse(
            id=reward.id,
            streak_type=reward.streak_type.value,
            milestone=reward.milestone,
            xp_reward=reward.xp_reward,
            coin_reward=reward.coin_reward,
            gem_reward=reward.gem_reward,
            power_up_id=reward.power_up_id,
            achievement_id=reward.achievement_id,
            title_reward=reward.title_reward,
            xp_multiplier=reward.xp_multiplier,
            coin_multiplier=reward.coin_multiplier,
            bonus_duration_hours=reward.bonus_duration_hours,
            is_achieved=reward.milestone in achieved_milestones
        ))
    
    return result

@router.post("/streaks/{streak_type}/freeze")
async def use_streak_freeze(
    streak_type: str,
    hours: int = 24,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Use a streak freeze to protect a streak"""
    try:
        streak_type_enum = StreakType(streak_type)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid streak type: {streak_type}"
        )
    
    streak = db.query(Streak).filter(
        and_(Streak.user_id == current_user.id, Streak.streak_type == streak_type_enum)
    ).first()
    
    if not streak:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Streak not found"
        )
    
    if streak.freeze_count <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No streak freezes available"
        )
    
    # Check if streak is actually in danger
    now = datetime.now()
    if streak.next_activity_deadline and now <= streak.next_activity_deadline:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Streak is not in danger of breaking"
        )
    
    # Create freeze record
    freeze = StreakFreeze(
        user_id=current_user.id,
        streak_id=streak.id,
        freeze_duration_hours=hours,
        expires_at=now + timedelta(hours=hours),
        reason="User activated streak freeze"
    )
    db.add(freeze)
    
    # Update streak
    streak.freeze_count -= 1
    streak.frozen_until = freeze.expires_at
    streak.status = StreakStatus.FROZEN
    streak.next_activity_deadline = freeze.expires_at
    
    db.commit()
    
    return {
        "success": True,
        "message": f"Streak freeze activated for {hours} hours!",
        "freeze_expires_at": freeze.expires_at,
        "remaining_freezes": streak.freeze_count
    }

async def _check_streak_milestones(streak: Streak, db: Session) -> dict:
    """Check and award streak milestone rewards"""
    rewards = {"xp": 0, "coins": 0, "gems": 0, "achievements": [], "titles": [], "power_ups": []}
    
    # Get all rewards for milestones up to current count
    milestone_rewards = db.query(StreakReward).filter(
        and_(
            StreakReward.streak_type == streak.streak_type,
            StreakReward.milestone <= streak.current_count,
            StreakReward.is_active == True,
            ~StreakReward.id.in_(streak.milestones_achieved or [])
        )
    ).all()
    
    for reward in milestone_rewards:
        # Add basic rewards
        rewards["xp"] += reward.xp_reward
        rewards["coins"] += reward.coin_reward
        rewards["gems"] += reward.gem_reward
        
        # Add special rewards
        if reward.achievement_id:
            rewards["achievements"].append(reward.achievement_id)
        
        if reward.title_reward:
            rewards["titles"].append(reward.title_reward)
        
        if reward.power_up_id:
            rewards["power_ups"].append(reward.power_up_id)
        
        # Mark milestone as achieved
        if not streak.milestones_achieved:
            streak.milestones_achieved = []
        streak.milestones_achieved.append(reward.id)
    
    return rewards

# === VIRTUAL ECONOMY ENDPOINTS ===

@router.get("/economy/balance")
async def get_economy_balance(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's currency balance"""
    return {
        "coins": current_user.coins,
        "gems": current_user.gems,
        "total_earned_coins": getattr(current_user, 'total_earned_coins', 0),
        "total_earned_gems": getattr(current_user, 'total_earned_gems', 0),
        "total_spent_coins": getattr(current_user, 'total_spent_coins', 0),
        "total_spent_gems": getattr(current_user, 'total_spent_gems', 0)
    }

@router.post("/economy/earn")
async def earn_currency(
    amount: int,
    currency_type: str = "coins",  # coins or gems
    source: str = "general",
    description: str = "",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Earn currency through various activities"""
    if amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Amount must be positive"
        )
    
    if currency_type not in ["coins", "gems"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Currency type must be 'coins' or 'gems'"
        )
    
    # Add currency to user
    if currency_type == "coins":
        current_user.coins += amount
        if hasattr(current_user, 'total_earned_coins'):
            current_user.total_earned_coins += amount
    else:
        current_user.gems += amount
        if hasattr(current_user, 'total_earned_gems'):
            current_user.total_earned_gems += amount
    
    db.commit()
    
    return {
        "success": True,
        "message": f"Earned {amount} {currency_type}!",
        "new_balance": {
            "coins": current_user.coins,
            "gems": current_user.gems
        },
        "earned": {
            "currency": currency_type,
            "amount": amount,
            "source": source,
            "description": description
        }
    }

@router.post("/economy/spend")
async def spend_currency(
    amount: int,
    currency_type: str = "coins",  # coins or gems
    purpose: str = "purchase",
    item_id: str = "",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Spend currency for purchases or other purposes"""
    if amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Amount must be positive"
        )
    
    if currency_type not in ["coins", "gems"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Currency type must be 'coins' or 'gems'"
        )
    
    # Check if user has enough currency
    if currency_type == "coins" and current_user.coins < amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient coins. Need {amount}, have {current_user.coins}"
        )
    
    if currency_type == "gems" and current_user.gems < amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient gems. Need {amount}, have {current_user.gems}"
        )
    
    # Deduct currency from user
    if currency_type == "coins":
        current_user.coins -= amount
        if hasattr(current_user, 'total_spent_coins'):
            current_user.total_spent_coins += amount
    else:
        current_user.gems -= amount
        if hasattr(current_user, 'total_spent_gems'):
            current_user.total_spent_gems += amount
    
    db.commit()
    
    return {
        "success": True,
        "message": f"Spent {amount} {currency_type} on {purpose}!",
        "new_balance": {
            "coins": current_user.coins,
            "gems": current_user.gems
        },
        "spent": {
            "currency": currency_type,
            "amount": amount,
            "purpose": purpose,
            "item_id": item_id
        }
    }

@router.get("/economy/transactions")
async def get_transaction_history(
    limit: int = 20,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's transaction history (mock implementation)"""
    # In a real implementation, this would query a Transaction table
    # For now, we'll return mock data
    mock_transactions = [
        {
            "id": "tx_001",
            "type": "earned",
            "currency": "coins",
            "amount": 50,
            "source": "daily_login",
            "description": "Daily login bonus",
            "timestamp": datetime.now() - timedelta(days=1)
        },
        {
            "id": "tx_002",
            "type": "spent",
            "currency": "coins",
            "amount": 500,
            "purpose": "purchase",
            "item_id": "avatar_cyber_ninja",
            "description": "Purchased Cyber Ninja avatar",
            "timestamp": datetime.now() - timedelta(days=2)
        },
        {
            "id": "tx_003",
            "type": "earned",
            "currency": "gems",
            "amount": 5,
            "source": "level_up",
            "description": "Level 10 milestone reward",
            "timestamp": datetime.now() - timedelta(days=3)
        }
    ]
    
    return {
        "transactions": mock_transactions[offset:offset + limit],
        "total": len(mock_transactions),
        "limit": limit,
        "offset": offset
    }

@router.get("/economy/shop/categories")
async def get_shop_categories(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all shop categories"""
    return {
        "categories": [
            {
                "id": "avatars",
                "name": "Avatars",
                "description": "Custom profile pictures and representations",
                "icon": "👤",
                "item_count": 15
            },
            {
                "id": "themes",
                "name": "Themes",
                "description": "UI themes and color schemes",
                "icon": "🎨",
                "item_count": 8
            },
            {
                "id": "badges",
                "name": "Badges",
                "description": "Achievement badges and titles",
                "icon": "🏆",
                "item_count": 25
            },
            {
                "id": "effects",
                "name": "Effects",
                "description": "Visual effects and animations",
                "icon": "✨",
                "item_count": 6
            },
            {
                "id": "power_ups",
                "name": "Power-ups",
                "description": "Gameplay enhancements and boosts",
                "icon": "⚡",
                "item_count": 12
            },
            {
                "id": "bundles",
                "name": "Bundles",
                "description": "Special value packs and collections",
                "icon": "📦",
                "item_count": 4
            }
        ]
    }

@router.get("/economy/shop/featured")
async def get_featured_items(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get featured shop items"""
    # Mock featured items data
    featured_items = [
        {
            "id": "bundle_starter_pack",
            "name": "Starter Pack",
            "description": "Perfect for new users! Includes coins, gems, and a special avatar",
            "type": "bundle",
            "cost": {"coins": 0, "gems": 10},
            "original_cost": {"coins": 0, "gems": 15},
            "discount": 0.33,
            "rarity": "special",
            "category": "bundles",
            "items_included": ["avatar_rookie", "coins_1000", "gems_5"],
            "is_limited": True,
            "ends_at": datetime.now() + timedelta(days=7)
        },
        {
            "id": "avatar_dragon_lord",
            "name": "Dragon Lord",
            "description": "Majestic dragon-themed avatar with animated effects",
            "type": "avatar",
            "cost": {"coins": 2000, "gems": 20},
            "rarity": "legendary",
            "category": "avatars",
            "is_new": True,
            "popularity": 95
        },
        {
            "id": "theme_neon_dreams",
            "name": "Neon Dreams",
            "description": "Cyberpunk-inspired theme with animated neon lights",
            "type": "theme",
            "cost": {"coins": 800, "gems": 5},
            "original_cost": {"coins": 1000, "gems": 8},
            "discount": 0.20,
            "rarity": "epic",
            "category": "themes",
            "is_featured": True
        }
    ]
    
    # Daily special (rotates every 24 hours)
    day_of_year = datetime.now().timetuple().tm_yday
    daily_specials = [
        {
            "id": "power_up_double_xp",
            "name": "Double XP Boost",
            "description": "2x XP for all activities for 24 hours",
            "type": "power_up",
            "cost": {"coins": 500, "gems": 3},
            "original_cost": {"coins": 750, "gems": 5},
            "discount": 0.33,
            "rarity": "rare",
            "category": "power_ups",
            "duration": 86400  # 24 hours in seconds
        },
        {
            "id": "avatar_seasonal_special",
            "name": "Seasonal Special Avatar",
            "description": "Limited edition seasonal avatar",
            "type": "avatar",
            "cost": {"coins": 1200, "gems": 8},
            "rarity": "epic",
            "category": "avatars",
            "is_seasonal": True
        }
    ]
    
    daily_special = daily_specials[day_of_year % len(daily_specials)]
    
    return {
        "featured_items": featured_items,
        "daily_special": daily_special,
        "refresh_time": (datetime.now() + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
    }

@router.post("/economy/purchase/{item_id}")
async def purchase_item(
    item_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Purchase an item from the shop"""
    # Mock shop items database
    shop_items = {
        "avatar_cyber_ninja": {
            "name": "Cyber Ninja",
            "type": "avatar",
            "cost": {"coins": 500, "gems": 0},
            "rarity": "rare"
        },
        "theme_neon_cyberpunk": {
            "name": "Neon Cyberpunk",
            "type": "theme",
            "cost": {"coins": 300, "gems": 0},
            "rarity": "common"
        },
        "power_up_double_xp": {
            "name": "Double XP Boost",
            "type": "power_up",
            "cost": {"coins": 500, "gems": 3},
            "rarity": "rare",
            "duration": 86400
        },
        "bundle_starter_pack": {
            "name": "Starter Pack",
            "type": "bundle",
            "cost": {"coins": 0, "gems": 10},
            "rarity": "special",
            "contents": ["coins_1000", "gems_5", "avatar_rookie"]
        }
    }
    
    item = shop_items.get(item_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )
    
    # Check if user can afford it
    if current_user.coins < item["cost"]["coins"] or current_user.gems < item["cost"]["gems"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient currency"
        )
    
    # Process purchase
    current_user.coins -= item["cost"]["coins"]
    current_user.gems -= item["cost"]["gems"]
    
    # Add item to user inventory (mock implementation)
    # In a real implementation, this would add to an Inventory table
    
    db.commit()
    
    return {
        "success": True,
        "message": f"Successfully purchased {item['name']}!",
        "item": item,
        "new_balance": {
            "coins": current_user.coins,
            "gems": current_user.gems
        },
        "transaction_id": f"tx_{datetime.now().strftime('%Y%m%d%H%M%S')}"
    }

# === XP & LEVELS SYSTEM ENDPOINTS ===

@router.get("/levels", response_model=List[LevelResponse])
async def get_all_levels(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all available levels"""
    levels = db.query(Level).order_by(Level.level).all()
    
    result = []
    for level in levels:
        result.append(LevelResponse(
            id=level.id,
            level=level.level,
            name=level.name,
            min_xp=level.min_xp,
            max_xp=level.max_xp,
            rewards=level.rewards or {},
            unlocked_features=level.unlocked_features or []
        ))
    
    return result

@router.get("/levels/progress", response_model=UserLevelProgressResponse)
async def get_user_level_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's current level progress"""
    # Get current level info
    current_level = db.query(Level).filter(Level.level == current_user.level).first()
    next_level = db.query(Level).filter(Level.level == current_user.level + 1).first()
    
    # Calculate progress
    level_progress = 0.0
    xp_to_next_level = 0
    
    if current_level and next_level:
        level_range = next_level.min_xp - current_level.min_xp
        progress_in_level = current_user.xp - current_level.min_xp
        level_progress = (progress_in_level / level_range) * 100
        xp_to_next_level = next_level.min_xp - current_user.xp
    
    # Get total levels count
    total_levels = db.query(Level).count()
    
    # Get unlocked features from all levels up to current
    unlocked_features = []
    if current_user.level > 0:
        levels_below = db.query(Level).filter(Level.level <= current_user.level).all()
        for level in levels_below:
            if level.unlocked_features:
                unlocked_features.extend(level.unlocked_features)
        unlocked_features = list(set(unlocked_features))  # Remove duplicates
    
    # Get recent level ups (mock data for now)
    recent_level_ups = [
        {"level": current_user.level - 1, "achieved_at": datetime.now() - timedelta(days=7)},
        {"level": current_user.level, "achieved_at": datetime.now() - timedelta(days=1)}
    ] if current_user.level > 1 else []
    
    return UserLevelProgressResponse(
        current_level=current_user.level,
        current_xp=current_user.xp,
        level_progress=level_progress,
        next_level_xp=next_level.min_xp if next_level else None,
        xp_to_next_level=xp_to_next_level,
        total_levels=total_levels,
        unlocked_features=unlocked_features,
        recent_level_ups=recent_level_ups
    )

@router.post("/xp/add", response_model=XPResponse)
async def add_xp(
    xp_amount: int,
    activity_type: str = "general",
    source_description: str = "",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add XP to user and handle level ups"""
    if xp_amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="XP amount must be positive"
        )
    
    old_level = current_user.level
    old_xp = current_user.xp
    
    # Add XP to user
    current_user.xp += xp_amount
    
    # Update activity stats
    if activity_type == "search":
        current_user.total_searches += 1
    elif activity_type == "quiz":
        current_user.total_quizzes += 1
    elif activity_type == "innovation":
        current_user.total_innovations += 1
    
    # Check for level up
    new_level = current_user.level
    levels = db.query(Level).order_by(Level.level).all()
    
    for level in levels:
        if current_user.xp >= level.min_xp:
            new_level = level.level
        else:
            break
    
    level_up = False
    level_up_rewards = {}
    
    if new_level > current_user.level:
        level_up = True
        levels_gained = new_level - current_user.level
        current_user.level = new_level
        
        # Collect rewards for all levels gained
        for level_num in range(current_user.level - levels_gained + 1, new_level + 1):
            level_data = db.query(Level).filter(Level.level == level_num).first()
            if level_data and level_data.rewards:
                for reward_type, amount in level_data.rewards.items():
                    if reward_type == "coins":
                        current_user.coins += amount
                        level_up_rewards[reward_type] = level_up_rewards.get(reward_type, 0) + amount
                    elif reward_type == "gems":
                        current_user.gems += amount
                        level_up_rewards[reward_type] = level_up_rewards.get(reward_type, 0) + amount
                    elif reward_type == "streak_freezes":
                        # Add streak freezes to user's streaks
                        streaks = db.query(Streak).filter(Streak.user_id == current_user.id).all()
                        for streak in streaks:
                            streak.freeze_count += amount
                        level_up_rewards[reward_type] = level_up_rewards.get(reward_type, 0) + amount
    
    db.commit()
    
    # Calculate progress to next level
    next_level_data = db.query(Level).filter(Level.level == new_level + 1).first()
    next_level_xp = next_level_data.min_xp if next_level_data else None
    current_level_data = db.query(Level).filter(Level.level == new_level).first()
    
    level_progress = 0.0
    if current_level_data and next_level_data:
        level_range = next_level_data.min_xp - current_level_data.min_xp
        progress_in_level = current_user.xp - current_level_data.min_xp
        level_progress = (progress_in_level / level_range) * 100
    
    response_data = XPResponse(
        xp_earned=xp_amount,
        total_xp=current_user.xp,
        level=current_user.level,
        level_progress=level_progress,
        next_level_xp=next_level_xp
    )
    
    # Add level up information if applicable
    if level_up:
        response_data.level_up = {
            "old_level": old_level,
            "new_level": new_level,
            "levels_gained": levels_gained,
            "rewards": level_up_rewards
        }
    
    return response_data

@router.get("/levels/{level_id}", response_model=LevelResponse)
async def get_level_details(
    level_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get details for a specific level"""
    level = db.query(Level).filter(Level.id == level_id).first()
    
    if not level:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Level not found"
        )
    
    return LevelResponse(
        id=level.id,
        level=level.level,
        name=level.name,
        min_xp=level.min_xp,
        max_xp=level.max_xp,
        rewards=level.rewards or {},
        unlocked_features=level.unlocked_features or []
    )

@router.get("/levels/unlocked-features")
async def get_unlocked_features(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all features unlocked by user's current level"""
    unlocked_features = []
    
    if current_user.level > 0:
        levels_below = db.query(Level).filter(Level.level <= current_user.level).all()
        for level in levels_below:
            if level.unlocked_features:
                unlocked_features.extend(level.unlocked_features)
        unlocked_features = list(set(unlocked_features))  # Remove duplicates
    
    # Get next level features
    next_level = db.query(Level).filter(Level.level == current_user.level + 1).first()
    next_level_features = next_level.unlocked_features if next_level else []
    
    return {
        "current_level": current_user.level,
        "unlocked_features": unlocked_features,
        "next_level_features": next_level_features,
        "features_count": len(unlocked_features),
        "total_features": len(unlocked_features) + len(next_level_features)
    }