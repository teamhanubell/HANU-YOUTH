"""
Gamification Service for HANU-YOUTH platform
Handles XP, levels, achievements, and rewards
"""

from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import random

class GamificationService:
    """Service for managing gamification features"""
    
    def __init__(self):
        self.xp_per_level = 100  # Base XP per level
        self.level_multiplier = 1.5  # XP multiplier per level
        
    def calculate_level(self, xp: int) -> Dict[str, Any]:
        """Calculate user level based on XP"""
        level = 1
        xp_for_next_level = self.xp_per_level
        
        while xp >= xp_for_next_level:
            level += 1
            xp_for_next_level = int(self.xp_per_level * (level ** self.level_multiplier))
        
        current_level_xp = int(self.xp_per_level * ((level - 1) ** self.level_multiplier))
        level_progress = ((xp - current_level_xp) / (xp_for_next_level - current_level_xp)) * 100 if xp_for_next_level > current_level_xp else 100
        
        return {
            "level": level,
            "current_xp": xp,
            "xp_for_next_level": xp_for_next_level,
            "current_level_xp": current_level_xp,
            "level_progress": level_progress
        }
    
    def calculate_rewards(self, activity_type: str, base_xp: int, performance_score: float = 1.0) -> Dict[str, Any]:
        """Calculate rewards for different activities"""
        # Base rewards
        xp_reward = int(base_xp * performance_score)
        coin_reward = int(base_xp * 0.5 * performance_score)
        gem_reward = 0
        
        # Bonus rewards for high performance
        if performance_score >= 0.9:
            xp_reward = int(xp_reward * 1.5)  # 50% bonus
            coin_reward = int(coin_reward * 1.5)
            gem_reward = 1 if random.random() < 0.3 else 0  # 30% chance for gem
        elif performance_score >= 0.8:
            xp_reward = int(xp_reward * 1.25)  # 25% bonus
            coin_reward = int(coin_reward * 1.25)
        
        # Activity-specific bonuses
        activity_bonuses = {
            "quiz": {"xp_multiplier": 1.2, "coin_multiplier": 1.1},
            "innovation": {"xp_multiplier": 1.5, "coin_multiplier": 1.3},
            "research": {"xp_multiplier": 1.3, "coin_multiplier": 1.2},
            "daily_streak": {"xp_multiplier": 2.0, "coin_multiplier": 1.5},
            "achievement": {"xp_multiplier": 1.8, "coin_multiplier": 1.4}
        }
        
        if activity_type in activity_bonuses:
            bonus = activity_bonuses[activity_type]
            xp_reward = int(xp_reward * bonus["xp_multiplier"])
            coin_reward = int(coin_reward * bonus["coin_multiplier"])
        
        return {
            "xp_reward": xp_reward,
            "coin_reward": coin_reward,
            "gem_reward": gem_reward,
            "performance_score": performance_score,
            "activity_type": activity_type
        }
    
    def check_achievements(self, user_stats: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Check for new achievements based on user stats"""
        achievements = []
        
        # XP-based achievements
        if user_stats.get("total_xp", 0) >= 1000:
            achievements.append({
                "id": "xp_1000",
                "name": "Knowledge Seeker",
                "description": "Earn 1000 XP",
                "icon": "📚",
                "category": "learning",
                "rarity": "common"
            })
        
        if user_stats.get("total_xp", 0) >= 5000:
            achievements.append({
                "id": "xp_5000",
                "name": "Knowledge Master",
                "description": "Earn 5000 XP",
                "icon": "🎓",
                "category": "learning",
                "rarity": "rare"
            })
        
        # Streak-based achievements
        if user_stats.get("daily_streak", 0) >= 7:
            achievements.append({
                "id": "streak_7",
                "name": "Week Warrior",
                "description": "Maintain a 7-day streak",
                "icon": "🔥",
                "category": "consistency",
                "rarity": "rare"
            })
        
        if user_stats.get("daily_streak", 0) >= 30:
            achievements.append({
                "id": "streak_30",
                "name": "Monthly Champion",
                "description": "Maintain a 30-day streak",
                "icon": "🏆",
                "category": "consistency",
                "rarity": "epic"
            })
        
        # Activity-based achievements
        if user_stats.get("total_quizzes_taken", 0) >= 10:
            achievements.append({
                "id": "quiz_10",
                "name": "Quiz Enthusiast",
                "description": "Complete 10 quizzes",
                "icon": "📝",
                "category": "quiz",
                "rarity": "common"
            })
        
        if user_stats.get("total_searches", 0) >= 50:
            achievements.append({
                "id": "search_50",
                "name": "Research Explorer",
                "description": "Perform 50 searches",
                "icon": "🔍",
                "category": "research",
                "rarity": "common"
            })
        
        if user_stats.get("total_innovations", 0) >= 5:
            achievements.append({
                "id": "innovation_5",
                "name": "Innovation Pioneer",
                "description": "Create 5 innovations",
                "icon": "💡",
                "category": "innovation",
                "rarity": "rare"
            })
        
        return achievements
    
    def generate_daily_challenges(self) -> List[Dict[str, Any]]:
        """Generate daily challenges"""
        challenge_templates = [
            {
                "type": "quiz",
                "title": "Quiz Master",
                "description": "Complete 3 quizzes today",
                "target_value": 3,
                "difficulty": "medium",
                "xp_reward": 200,
                "coin_reward": 100,
                "gem_reward": 2
            },
            {
                "type": "search",
                "title": "Knowledge Hunter",
                "description": "Perform 10 searches today",
                "target_value": 10,
                "difficulty": "easy",
                "xp_reward": 150,
                "coin_reward": 75,
                "gem_reward": 1
            },
            {
                "type": "innovation",
                "title": "Innovation Creator",
                "description": "Submit 1 innovation idea today",
                "target_value": 1,
                "difficulty": "hard",
                "xp_reward": 300,
                "coin_reward": 150,
                "gem_reward": 3
            },
            {
                "type": "learning",
                "title": "Learning Path",
                "description": "Complete 2 learning modules today",
                "target_value": 2,
                "difficulty": "medium",
                "xp_reward": 250,
                "coin_reward": 125,
                "gem_reward": 2
            }
        ]
        
        # Select 3 random challenges for today
        daily_challenges = random.sample(challenge_templates, min(3, len(challenge_templates)))
        
        for challenge in daily_challenges:
            challenge["id"] = f"daily_{datetime.now().strftime('%Y%m%d')}_{challenge['type']}"
            challenge["challenge_date"] = datetime.now().date()
            challenge["is_active"] = True
        
        return daily_challenges
    
    def calculate_leaderboard_rankings(self, users_data: List[Dict[str, Any]], 
                                     category: str = "xp") -> List[Dict[str, Any]]:
        """Calculate leaderboard rankings"""
        # Sort users by the specified category
        if category == "xp":
            sorted_users = sorted(users_data, key=lambda x: x.get("total_xp", 0), reverse=True)
        elif category == "coins":
            sorted_users = sorted(users_data, key=lambda x: x.get("coins", 0), reverse=True)
        elif category == "level":
            sorted_users = sorted(users_data, key=lambda x: x.get("level", 0), reverse=True)
        elif category == "streak":
            sorted_users = sorted(users_data, key=lambda x: x.get("daily_streak", 0), reverse=True)
        else:
            sorted_users = sorted(users_data, key=lambda x: x.get("total_xp", 0), reverse=True)
        
        # Assign ranks
        ranked_users = []
        for i, user in enumerate(sorted_users):
            ranked_users.append({
                "rank": i + 1,
                "user_id": user.get("user_id"),
                "username": user.get("username"),
                "value": user.get(category, 0),
                "country": user.get("country", "Global"),
                "level": user.get("level", 1),
                "category": category
            })
        
        return ranked_users
    
    def get_power_up_effects(self, power_up_type: str) -> Dict[str, Any]:
        """Get power-up effects"""
        power_up_effects = {
            "extra_time": {
                "effect_type": "time_multiplier",
                "effect_value": 1.5,
                "duration": 0,
                "description": "50% more time for quizzes"
            },
            "skip_question": {
                "effect_type": "skip_question",
                "effect_value": 1,
                "duration": 0,
                "description": "Skip one question"
            },
            "double_points": {
                "effect_type": "score_multiplier",
                "effect_value": 2.0,
                "duration": 0,
                "description": "Double points for next question"
            },
            "hint": {
                "effect_type": "hint",
                "effect_value": 1,
                "duration": 0,
                "description": "Get a hint for the current question"
            },
            "shield": {
                "effect_type": "protection",
                "effect_value": 1,
                "duration": 3600,  # 1 hour
                "description": "Protection from losing streak"
            }
        }
        
        return power_up_effects.get(power_up_type, {
            "effect_type": "unknown",
            "effect_value": 0,
            "duration": 0,
            "description": "Unknown power-up effect"
        })
    
    def calculate_streak_bonus(self, streak_days: int) -> Dict[str, Any]:
        """Calculate streak bonus rewards"""
        base_xp_bonus = streak_days * 10
        base_coin_bonus = streak_days * 5
        
        # Bonus multipliers for milestone streaks
        if streak_days >= 30:
            multiplier = 3.0
        elif streak_days >= 14:
            multiplier = 2.0
        elif streak_days >= 7:
            multiplier = 1.5
        else:
            multiplier = 1.0
        
        return {
            "xp_bonus": int(base_xp_bonus * multiplier),
            "coin_bonus": int(base_coin_bonus * multiplier),
            "gem_bonus": 1 if streak_days >= 7 else 0,
            "multiplier": multiplier,
            "streak_days": streak_days
        }

# Global gamification service instance
gamification_service = GamificationService()