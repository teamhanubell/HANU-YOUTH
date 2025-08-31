"""
Quiz and learning models for HANU-YOUTH platform
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Float, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import datetime

class Quiz(Base):
    """Quiz model"""
    
    __tablename__ = "quizzes"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String, nullable=False)  # research, ai, un, innovation, cs
    difficulty = Column(String, default="medium")  # easy, medium, hard
    time_limit = Column(Integer, default=300)  # Time limit in seconds
    question_count = Column(Integer, default=10)
    
    # Quiz settings
    is_public = Column(Boolean, default=True)
    is_ai_generated = Column(Boolean, default=True)
    shuffle_questions = Column(Boolean, default=True)
    shuffle_answers = Column(Boolean, default=True)
    
    # Rewards
    xp_reward = Column(Integer, default=50)
    coin_reward = Column(Integer, default=25)
    
    # AI generation metadata
    generation_prompt = Column(Text, nullable=True)
    source_material = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    questions = relationship("Question", back_populates="quiz", cascade="all, delete-orphan")
    attempts = relationship("QuizAttempt", back_populates="quiz")
    
    def __repr__(self):
        return f"<Quiz(id={self.id}, title={self.title}, category={self.category})>"

class Question(Base):
    """Question model"""
    
    __tablename__ = "questions"
    
    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    question_text = Column(Text, nullable=False)
    question_type = Column(String, default="multiple_choice")  # multiple_choice, true_false, short_answer, code
    difficulty = Column(String, default="medium")
    points = Column(Integer, default=10)
    
    # Question content
    options = Column(JSON, nullable=True)  # For multiple choice
    correct_answer = Column(Text, nullable=False)
    explanation = Column(Text, nullable=True)
    
    # Media
    image_url = Column(String, nullable=True)
    audio_url = Column(String, nullable=True)
    
    # Order
    question_order = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    quiz = relationship("Quiz", back_populates="questions")
    answers = relationship("UserAnswer", back_populates="question")
    
    def __repr__(self):
        return f"<Question(id={self.id}, question_type={self.question_type}, points={self.points})>"

class QuizAttempt(Base):
    """Quiz attempt model"""
    
    __tablename__ = "quiz_attempts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    
    # Attempt details
    score = Column(Float, default=0.0)
    max_score = Column(Float, default=0.0)
    percentage = Column(Float, default=0.0)
    time_taken = Column(Integer, default=0)  # Time taken in seconds
    is_completed = Column(Boolean, default=False)
    
    # Power-ups used
    power_ups_used = Column(JSON, default=[])
    
    # Timestamps
    started_at = Column(DateTime, default=func.now())
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="quiz_attempts")
    quiz = relationship("Quiz", back_populates="attempts")
    answers = relationship("UserAnswer", back_populates="attempt")
    
    def __repr__(self):
        return f"<QuizAttempt(id={self.id}, user_id={self.user_id}, score={self.score})>"

class UserAnswer(Base):
    """User answer model"""
    
    __tablename__ = "user_answers"
    
    id = Column(Integer, primary_key=True, index=True)
    attempt_id = Column(Integer, ForeignKey("quiz_attempts.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    
    # Answer details
    user_answer = Column(Text, nullable=False)
    is_correct = Column(Boolean, default=False)
    points_earned = Column(Integer, default=0)
    time_spent = Column(Integer, default=0)  # Time spent in seconds
    
    # Timestamps
    answered_at = Column(DateTime, default=func.now())
    
    # Relationships
    attempt = relationship("QuizAttempt", back_populates="answers")
    question = relationship("Question", back_populates="answers")
    
    def __repr__(self):
        return f"<UserAnswer(id={self.id}, is_correct={self.is_correct}, points_earned={self.points_earned})>"

class LearningPath(Base):
    """Learning path model"""
    
    __tablename__ = "learning_paths"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String, nullable=False)  # ai, cs, un, innovation
    difficulty = Column(String, default="beginner")  # beginner, intermediate, advanced
    estimated_hours = Column(Float, default=10.0)
    
    # Path structure
    is_linear = Column(Boolean, default=True)
    prerequisites = Column(JSON, default=[])  # Required paths/levels
    
    # Rewards
    xp_reward = Column(Integer, default=500)
    coin_reward = Column(Integer, default=250)
    badge_reward = Column(String, nullable=True)
    
    # AI generation
    is_ai_generated = Column(Boolean, default=True)
    generation_prompt = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    modules = relationship("LearningModule", back_populates="path", cascade="all, delete-orphan")
    user_progress = relationship("UserPathProgress", back_populates="path")
    
    def __repr__(self):
        return f"<LearningPath(id={self.id}, title={self.title}, category={self.category})>"

class LearningModule(Base):
    """Learning module model"""
    
    __tablename__ = "learning_modules"
    
    id = Column(Integer, primary_key=True, index=True)
    path_id = Column(Integer, ForeignKey("learning_paths.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    content_type = Column(String, default="text")  # text, video, interactive, quiz
    content = Column(Text, nullable=False)
    
    # Module settings
    duration_minutes = Column(Integer, default=30)
    order_in_path = Column(Integer, default=0)
    is_optional = Column(Boolean, default=False)
    
    # Completion criteria
    min_score_to_pass = Column(Float, default=70.0)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    path = relationship("LearningPath", back_populates="modules")
    user_progress = relationship("UserModuleProgress", back_populates="module")
    
    def __repr__(self):
        return f"<LearningModule(id={self.id}, title={self.title}, content_type={self.content_type})>"

class UserPathProgress(Base):
    """User learning path progress"""
    
    __tablename__ = "user_path_progress"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    path_id = Column(Integer, ForeignKey("learning_paths.id"), nullable=False)
    
    # Progress tracking
    progress_percentage = Column(Float, default=0.0)
    modules_completed = Column(Integer, default=0)
    total_modules = Column(Integer, default=0)
    
    # Status
    is_started = Column(Boolean, default=False)
    is_completed = Column(Boolean, default=False)
    
    # Timestamps
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    last_accessed = Column(DateTime, default=func.now())
    
    # Relationships
    user = relationship("User")
    path = relationship("LearningPath", back_populates="user_progress")
    
    def __repr__(self):
        return f"<UserPathProgress(user_id={self.user_id}, path_id={self.path_id}, progress={self.progress_percentage})>"

class UserModuleProgress(Base):
    """User learning module progress"""
    
    __tablename__ = "user_module_progress"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    module_id = Column(Integer, ForeignKey("learning_modules.id"), nullable=False)
    
    # Progress tracking
    progress_percentage = Column(Float, default=0.0)
    time_spent_minutes = Column(Integer, default=0)
    best_score = Column(Float, default=0.0)
    
    # Status
    is_started = Column(Boolean, default=False)
    is_completed = Column(Boolean, default=False)
    
    # Timestamps
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    last_accessed = Column(DateTime, default=func.now())
    
    # Relationships
    user = relationship("User")
    module = relationship("LearningModule", back_populates="user_progress")
    
    def __repr__(self):
        return f"<UserModuleProgress(user_id={self.user_id}, module_id={self.module_id}, progress={self.progress_percentage})>"