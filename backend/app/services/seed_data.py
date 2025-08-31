"""
Seed data for HANU-YOUTH platform
Populates the database with initial data
"""

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models import *
from datetime import datetime, timedelta
import random

def seed_achievements(db: Session):
    """Seed achievement data"""
    achievements = [
        # Learning Achievements
        {
            "name": "First Steps",
            "description": "Complete your first quiz",
            "icon": "🎯",
            "category": "learning",
            "rarity": "common",
            "xp_reward": 50,
            "coin_reward": 25,
            "criteria": {"type": "quiz", "count": 1}
        },
        {
            "name": "Quiz Master",
            "description": "Complete 50 quizzes",
            "icon": "📚",
            "category": "learning",
            "rarity": "rare",
            "xp_reward": 500,
            "coin_reward": 250,
            "criteria": {"type": "quiz", "count": 50}
        },
        {
            "name": "Knowledge Seeker",
            "description": "Earn 1000 XP",
            "icon": "🌟",
            "category": "learning",
            "rarity": "common",
            "xp_reward": 100,
            "coin_reward": 50,
            "criteria": {"type": "xp", "amount": 1000}
        },
        
        # Innovation Achievements
        {
            "name": "Innovation Pioneer",
            "description": "Create your first innovation",
            "icon": "💡",
            "category": "innovation",
            "rarity": "common",
            "xp_reward": 100,
            "coin_reward": 50,
            "criteria": {"type": "innovation", "count": 1}
        },
        {
            "name": "Creative Genius",
            "description": "Create 10 innovations",
            "icon": "🚀",
            "category": "innovation",
            "rarity": "epic",
            "xp_reward": 1000,
            "coin_reward": 500,
            "criteria": {"type": "innovation", "count": 10}
        },
        
        # Consistency Achievements
        {
            "name": "Week Warrior",
            "description": "Maintain a 7-day streak",
            "icon": "🔥",
            "category": "consistency",
            "rarity": "rare",
            "xp_reward": 200,
            "coin_reward": 100,
            "criteria": {"type": "streak", "days": 7}
        },
        {
            "name": "Monthly Champion",
            "description": "Maintain a 30-day streak",
            "icon": "🏆",
            "category": "consistency",
            "rarity": "epic",
            "xp_reward": 1000,
            "coin_reward": 500,
            "criteria": {"type": "streak", "days": 30}
        },
        
        # Research Achievements
        {
            "name": "Research Explorer",
            "description": "Perform 50 searches",
            "icon": "🔍",
            "category": "research",
            "rarity": "common",
            "xp_reward": 150,
            "coin_reward": 75,
            "criteria": {"type": "search", "count": 50}
        },
        {
            "name": "Scholar",
            "description": "Upload 10 research papers",
            "icon": "📄",
            "category": "research",
            "rarity": "rare",
            "xp_reward": 500,
            "coin_reward": 250,
            "criteria": {"type": "upload", "count": 10}
        },
        
        # Social Achievements
        {
            "name": "Team Player",
            "description": "Join your first team",
            "icon": "👥",
            "category": "social",
            "rarity": "common",
            "xp_reward": 100,
            "coin_reward": 50,
            "criteria": {"type": "team", "action": "join"}
        },
        {
            "name": "Leader",
            "description": "Create a team",
            "icon": "👑",
            "category": "social",
            "rarity": "rare",
            "xp_reward": 200,
            "coin_reward": 100,
            "criteria": {"type": "team", "action": "create"}
        }
    ]
    
    for achievement_data in achievements:
        achievement = Achievement(**achievement_data)
        db.add(achievement)
    
    db.commit()

def seed_levels(db: Session):
    """Seed level data"""
    levels = []
    base_xp = 100
    multiplier = 1.5
    
    for level in range(1, 51):  # Levels 1-50
        min_xp = int(base_xp * ((level - 1) ** multiplier))
        max_xp = int(base_xp * (level ** multiplier))
        
        rewards = {}
        gems = 0
        
        # Milestone rewards
        if level % 5 == 0:
            rewards["coins"] = level * 50
        if level % 10 == 0:
            rewards["coins"] = level * 100
            gems = 1
        if level % 25 == 0:
            rewards["coins"] = level * 200
            gems = 5
        
        unlocked_features = []
        if level >= 5:
            unlocked_features.append("team_creation")
        if level >= 10:
            unlocked_features.append("custom_avatar")
        if level >= 15:
            unlocked_features.append("premium_quizzes")
        if level >= 25:
            unlocked_features.append("ai_assistant")
        
        level_data = Level(
            level=level,
            name=f"Level {level}",
            min_xp=min_xp,
            max_xp=max_xp,
            rewards=rewards if rewards else None,
            unlocked_features=unlocked_features if unlocked_features else None
        )
        levels.append(level_data)
    
    for level in levels:
        db.add(level)
    
    db.commit()

def seed_power_ups(db: Session):
    """Seed power-up data"""
    power_ups = [
        {
            "name": "Extra Time",
            "description": "Get 50% more time for your next quiz",
            "icon": "⏰",
            "category": "quiz",
            "effect_type": "time_multiplier",
            "effect_value": 1.5,
            "duration": 0,
            "cost_coins": 50,
            "cost_gems": 2,
            "max_uses_per_day": 3
        },
        {
            "name": "Skip Question",
            "description": "Skip one question without penalty",
            "icon": "⏭️",
            "category": "quiz",
            "effect_type": "skip_question",
            "effect_value": 1,
            "duration": 0,
            "cost_coins": 75,
            "cost_gems": 3,
            "max_uses_per_day": 2
        },
        {
            "name": "Double Points",
            "description": "Double points for your next correct answer",
            "icon": "✨",
            "category": "quiz",
            "effect_type": "score_multiplier",
            "effect_value": 2.0,
            "duration": 0,
            "cost_coins": 100,
            "cost_gems": 5,
            "max_uses_per_day": 1
        },
        {
            "name": "Hint",
            "description": "Get a hint for the current question",
            "icon": "💡",
            "category": "quiz",
            "effect_type": "hint",
            "effect_value": 1,
            "duration": 0,
            "cost_coins": 25,
            "cost_gems": 1,
            "max_uses_per_day": 5
        },
        {
            "name": "Streak Shield",
            "description": "Protect your daily streak for 24 hours",
            "icon": "🛡️",
            "category": "general",
            "effect_type": "protection",
            "effect_value": 1,
            "duration": 86400,  # 24 hours
            "cost_coins": 150,
            "cost_gems": 5,
            "max_uses_per_day": 1
        },
        {
            "name": "XP Boost",
            "description": "Get 2x XP for your next activity",
            "icon": "📈",
            "category": "general",
            "effect_type": "xp_multiplier",
            "effect_value": 2.0,
            "duration": 3600,  # 1 hour
            "cost_coins": 200,
            "cost_gems": 8,
            "max_uses_per_day": 1
        }
    ]
    
    for power_up_data in power_ups:
        power_up = PowerUp(**power_up_data)
        db.add(power_up)
    
    db.commit()

def seed_sample_quizzes(db: Session):
    """Seed sample quiz data"""
    quizzes = [
        {
            "title": "Introduction to Artificial Intelligence",
            "description": "Test your knowledge of AI fundamentals",
            "category": "ai",
            "difficulty": "easy",
            "time_limit": 600,
            "question_count": 5,
            "xp_reward": 50,
            "coin_reward": 25,
            "is_public": True,
            "is_ai_generated": True
        },
        {
            "title": "United Nations Sustainable Development Goals",
            "description": "Learn about the UN SDGs",
            "category": "un",
            "difficulty": "medium",
            "time_limit": 900,
            "question_count": 10,
            "xp_reward": 100,
            "coin_reward": 50,
            "is_public": True,
            "is_ai_generated": True
        },
        {
            "title": "Machine Learning Basics",
            "description": "Essential ML concepts and applications",
            "category": "ai",
            "difficulty": "medium",
            "time_limit": 1200,
            "question_count": 15,
            "xp_reward": 150,
            "coin_reward": 75,
            "is_public": True,
            "is_ai_generated": True
        },
        {
            "title": "Climate Change and Sustainability",
            "description": "Environmental challenges and solutions",
            "category": "sustainability",
            "difficulty": "hard",
            "time_limit": 1800,
            "question_count": 20,
            "xp_reward": 200,
            "coin_reward": 100,
            "is_public": True,
            "is_ai_generated": True
        }
    ]
    
    for quiz_data in quizzes:
        quiz = Quiz(**quiz_data)
        db.add(quiz)
        db.commit()
        db.refresh(quiz)
        
        # Add sample questions
        questions = generate_sample_questions(quiz.id, quiz.category, quiz.difficulty)
        for question_data in questions:
            question = Question(**question_data)
            db.add(question)
        
        db.commit()

def generate_sample_questions(quiz_id: int, category: str, difficulty: str) -> list:
    """Generate sample questions for a quiz"""
    questions = []
    
    if category == "ai":
        questions = [
            {
                "quiz_id": quiz_id,
                "question_text": "What does AI stand for?",
                "question_type": "multiple_choice",
                "difficulty": "easy",
                "points": 10,
                "options": ["Artificial Intelligence", "Automated Intelligence", "Advanced Intelligence", "Applied Intelligence"],
                "correct_answer": "Artificial Intelligence",
                "explanation": "AI stands for Artificial Intelligence, which refers to systems that can perform tasks that typically require human intelligence.",
                "question_order": 1
            },
            {
                "quiz_id": quiz_id,
                "question_text": "Machine Learning is a subset of AI.",
                "question_type": "true_false",
                "difficulty": "easy",
                "points": 5,
                "correct_answer": "True",
                "explanation": "Machine Learning is indeed a subset of Artificial Intelligence that focuses on systems that can learn from data.",
                "question_order": 2
            }
        ]
    elif category == "un":
        questions = [
            {
                "quiz_id": quiz_id,
                "question_text": "How many Sustainable Development Goals (SDGs) are there?",
                "question_type": "multiple_choice",
                "difficulty": "medium",
                "points": 10,
                "options": ["15", "17", "20", "25"],
                "correct_answer": "17",
                "explanation": "There are 17 Sustainable Development Goals adopted by the United Nations in 2015.",
                "question_order": 1
            },
            {
                "quiz_id": quiz_id,
                "question_text": "SDG 13 focuses on:",
                "question_type": "multiple_choice",
                "difficulty": "medium",
                "points": 10,
                "options": ["No Poverty", "Climate Action", "Quality Education", "Gender Equality"],
                "correct_answer": "Climate Action",
                "explanation": "SDG 13 is specifically about taking urgent action to combat climate change and its impacts.",
                "question_order": 2
            }
        ]
    
    return questions

def seed_learning_paths(db: Session):
    """Seed learning path data"""
    learning_paths = [
        {
            "title": "AI Fundamentals",
            "description": "Learn the basics of Artificial Intelligence",
            "category": "ai",
            "difficulty": "beginner",
            "estimated_hours": 15.0,
            "is_linear": True,
            "xp_reward": 500,
            "coin_reward": 250,
            "badge_reward": "AI_Explorer",
            "is_ai_generated": True
        },
        {
            "title": "Machine Learning Journey",
            "description": "From basics to advanced ML concepts",
            "category": "ai",
            "difficulty": "intermediate",
            "estimated_hours": 40.0,
            "is_linear": True,
            "xp_reward": 1000,
            "coin_reward": 500,
            "badge_reward": "ML_Master",
            "is_ai_generated": True
        },
        {
            "title": "UN SDGs Comprehensive",
            "description": "Understanding all 17 Sustainable Development Goals",
            "category": "un",
            "difficulty": "beginner",
            "estimated_hours": 20.0,
            "is_linear": False,
            "xp_reward": 750,
            "coin_reward": 375,
            "badge_reward": "SDG_Champion",
            "is_ai_generated": True
        },
        {
            "title": "Innovation and Design Thinking",
            "description": "Learn to create innovative solutions",
            "category": "innovation",
            "difficulty": "intermediate",
            "estimated_hours": 25.0,
            "is_linear": True,
            "xp_reward": 800,
            "coin_reward": 400,
            "badge_reward": "Innovator",
            "is_ai_generated": True
        }
    ]
    
    for path_data in learning_paths:
        path = LearningPath(**path_data)
        db.add(path)
        db.commit()
        db.refresh(path)
        
        # Add sample modules
        modules = generate_sample_modules(path.id, path.category)
        for module_data in modules:
            module = LearningModule(**module_data)
            db.add(module)
        
        db.commit()

def generate_sample_modules(path_id: int, category: str) -> list:
    """Generate sample modules for a learning path"""
    modules = []
    
    if category == "ai":
        modules = [
            {
                "path_id": path_id,
                "title": "What is Artificial Intelligence?",
                "description": "Introduction to AI concepts and history",
                "content_type": "text",
                "content": "Artificial Intelligence (AI) refers to the simulation of human intelligence in machines that are programmed to think like humans and mimic their actions...",
                "duration_minutes": 30,
                "order_in_path": 1,
                "is_optional": False,
                "min_score_to_pass": 70.0
            },
            {
                "path_id": path_id,
                "title": "Types of AI",
                "description": "Learn about different types of AI systems",
                "content_type": "interactive",
                "content": "Interactive content about narrow AI, general AI, and superintelligent AI...",
                "duration_minutes": 45,
                "order_in_path": 2,
                "is_optional": False,
                "min_score_to_pass": 70.0
            },
            {
                "path_id": path_id,
                "title": "AI Ethics",
                "description": "Understanding ethical considerations in AI",
                "content_type": "video",
                "content": "Video content about AI ethics, bias, and responsible development...",
                "duration_minutes": 60,
                "order_in_path": 3,
                "is_optional": False,
                "min_score_to_pass": 70.0
            }
        ]
    elif category == "un":
        modules = [
            {
                "path_id": path_id,
                "title": "Introduction to SDGs",
                "description": "Learn about the Sustainable Development Goals",
                "content_type": "text",
                "content": "The Sustainable Development Goals (SDGs) are 17 global goals set by the United Nations...",
                "duration_minutes": 45,
                "order_in_path": 1,
                "is_optional": False,
                "min_score_to_pass": 70.0
            },
            {
                "path_id": path_id,
                "title": "SDG 1-5: People Goals",
                "description": "Goals focused on ending poverty and hunger",
                "content_type": "interactive",
                "content": "Interactive exploration of SDGs 1 through 5...",
                "duration_minutes": 60,
                "order_in_path": 2,
                "is_optional": False,
                "min_score_to_pass": 70.0
            }
        ]
    
    return modules

def seed_leaderboards(db: Session):
    """Seed leaderboard data"""
    leaderboards = [
        {
            "name": "Global XP Leaderboard",
            "description": "Top users by XP worldwide",
            "leaderboard_type": "global",
            "time_frame": "all_time",
            "category": "xp",
            "refresh_interval": 3600,
            "is_active": True
        },
        {
            "name": "Weekly XP Challenge",
            "description": "Top XP earners this week",
            "leaderboard_type": "global",
            "time_frame": "weekly",
            "category": "xp",
            "refresh_interval": 3600,
            "is_active": True
        },
        {
            "name": "Innovation Leaders",
            "description": "Top innovators by project count",
            "leaderboard_type": "global",
            "time_frame": "all_time",
            "category": "innovations",
            "refresh_interval": 7200,
            "is_active": True
        },
        {
            "name": "Quiz Masters",
            "description": "Highest quiz scores",
            "leaderboard_type": "global",
            "time_frame": "weekly",
            "category": "quizzes",
            "refresh_interval": 1800,
            "is_active": True
        },
        {
            "name": "Streak Champions",
            "description": "Longest daily streaks",
            "leaderboard_type": "global",
            "time_frame": "all_time",
            "category": "streaks",
            "refresh_interval": 86400,
            "is_active": True
        }
    ]
    
    for leaderboard_data in leaderboards:
        leaderboard = Leaderboard(**leaderboard_data)
        db.add(ledgerboard)
    
    db.commit()

def main():
    """Main function to seed all data"""
    db = SessionLocal()
    
    try:
        print("🌱 Seeding database...")
        
        # Seed data in order
        print("  Seeding achievements...")
        seed_achievements(db)
        
        print("  Seeding levels...")
        seed_levels(db)
        
        print("  Seeding power-ups...")
        seed_power_ups(db)
        
        print("  Seeding quizzes...")
        seed_sample_quizzes(db)
        
        print("  Seeding learning paths...")
        seed_learning_paths(db)
        
        print("  Seeding leaderboards...")
        seed_leaderboards(db)
        
        print("✅ Database seeded successfully!")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()