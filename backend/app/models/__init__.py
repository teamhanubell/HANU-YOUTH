"""
Database models for HANU-YOUTH platform
"""

from .user import User, UserAchievement, UserInventory
from .gamification import (
    Achievement, Level, PowerUp, UserPowerUp, DailyChallenge, UserDailyChallenge,
    Streak, StreakReward, StreakFreeze, StreakType, StreakStatus
)
from .quiz import Quiz, Question, QuizAttempt, UserAnswer, LearningPath, LearningModule, UserPathProgress, UserModuleProgress
from .teams import Team, TeamMember, Competition, CompetitionParticipant, TeamCompetition, TeamAchievement, Leaderboard, LeaderboardEntry

# Export all models
__all__ = [
    # User models
    "User", "UserAchievement", "UserInventory",
    
    # Gamification models
    "Achievement", "Level", "PowerUp", "UserPowerUp", "DailyChallenge", "UserDailyChallenge",
    "Streak", "StreakReward", "StreakFreeze", "StreakType", "StreakStatus",
    
    # Quiz models
    "Quiz", "Question", "QuizAttempt", "UserAnswer", "LearningPath", "LearningModule", 
    "UserPathProgress", "UserModuleProgress",
    
    # Team models
    "Team", "TeamMember", "Competition", "CompetitionParticipant", "TeamCompetition", 
    "TeamAchievement", "Leaderboard", "LeaderboardEntry"
]