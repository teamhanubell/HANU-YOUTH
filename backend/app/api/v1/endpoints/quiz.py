"""
Quiz and learning endpoints for HANU-YOUTH platform
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.core.database import get_db
from app.models import (
    User, Quiz, Question, QuizAttempt, UserAnswer, 
    LearningPath, LearningModule, UserPathProgress, UserModuleProgress
)
from app.api.v1.endpoints.auth import get_current_user
from app.api.v1.endpoints.gamification import add_xp
from pydantic import BaseModel
import json

router = APIRouter()

class QuizResponse(BaseModel):
    """Quiz response model"""
    id: int
    title: str
    description: str
    category: str
    difficulty: str
    time_limit: int
    question_count: int
    xp_reward: int
    coin_reward: int

class QuestionResponse(BaseModel):
    """Question response model"""
    id: int
    question_text: str
    question_type: str
    difficulty: str
    points: int
    options: Optional[List[str]] = None
    explanation: Optional[str] = None
    image_url: Optional[str] = None
    audio_url: Optional[str] = None

class QuizStartResponse(BaseModel):
    """Quiz start response model"""
    attempt_id: int
    quiz: QuizResponse
    questions: List[QuestionResponse]
    time_limit: int
    max_score: float

class AnswerSubmission(BaseModel):
    """Answer submission model"""
    question_id: int
    answer: str
    time_spent: int

class QuizResultResponse(BaseModel):
    """Quiz result response model"""
    attempt_id: int
    score: float
    max_score: float
    percentage: float
    time_taken: int
    is_completed: bool
    correct_answers: int
    total_questions: int
    xp_earned: int
    coins_earned: int

class LearningPathResponse(BaseModel):
    """Learning path response model"""
    id: int
    title: str
    description: str
    category: str
    difficulty: str
    estimated_hours: float
    xp_reward: int
    coin_reward: int
    progress_percentage: float
    is_started: bool
    is_completed: bool

@router.get("/quizzes", response_model=List[QuizResponse])
async def get_quizzes(
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get available quizzes"""
    query = db.query(Quiz).filter(Quiz.is_public == True)
    
    if category:
        query = query.filter(Quiz.category == category)
    if difficulty:
        query = query.filter(Quiz.difficulty == difficulty)
    
    quizzes = query.all()
    
    return [
        QuizResponse(
            id=quiz.id,
            title=quiz.title,
            description=quiz.description,
            category=quiz.category,
            difficulty=quiz.difficulty,
            time_limit=quiz.time_limit,
            question_count=quiz.question_count,
            xp_reward=quiz.xp_reward,
            coin_reward=quiz.coin_reward
        )
        for quiz in quizzes
    ]

@router.get("/quiz/{quiz_id}", response_model=QuizResponse)
async def get_quiz(
    quiz_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get quiz details"""
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found"
        )
    
    return QuizResponse(
        id=quiz.id,
        title=quiz.title,
        description=quiz.description,
        category=quiz.category,
        difficulty=quiz.difficulty,
        time_limit=quiz.time_limit,
        question_count=quiz.question_count,
        xp_reward=quiz.xp_reward,
        coin_reward=quiz.coin_reward
    )

@router.post("/quiz/{quiz_id}/start", response_model=QuizStartResponse)
async def start_quiz(
    quiz_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Start a quiz attempt"""
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found"
        )
    
    # Create quiz attempt
    attempt = QuizAttempt(
        user_id=current_user.id,
        quiz_id=quiz.id,
        max_score=sum(q.points for q in quiz.questions)
    )
    
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    
    # Get questions
    questions = db.query(Question).filter(Question.quiz_id == quiz.id).all()
    
    return QuizStartResponse(
        attempt_id=attempt.id,
        quiz=QuizResponse(
            id=quiz.id,
            title=quiz.title,
            description=quiz.description,
            category=quiz.category,
            difficulty=quiz.difficulty,
            time_limit=quiz.time_limit,
            question_count=quiz.question_count,
            xp_reward=quiz.xp_reward,
            coin_reward=quiz.coin_reward
        ),
        questions=[
            QuestionResponse(
                id=q.id,
                question_text=q.question_text,
                question_type=q.question_type,
                difficulty=q.difficulty,
                points=q.points,
                options=q.options if q.question_type == "multiple_choice" else None,
                explanation=q.explanation,
                image_url=q.image_url,
                audio_url=q.audio_url
            )
            for q in questions
        ],
        time_limit=quiz.time_limit,
        max_score=attempt.max_score
    )

@router.post("/quiz/{attempt_id}/submit-answer")
async def submit_answer(
    attempt_id: int,
    answer_data: AnswerSubmission,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit an answer for a quiz"""
    # Get attempt
    attempt = db.query(QuizAttempt).filter(
        QuizAttempt.id == attempt_id,
        QuizAttempt.user_id == current_user.id
    ).first()
    
    if not attempt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz attempt not found"
        )
    
    if attempt.is_completed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quiz attempt already completed"
        )
    
    # Get question
    question = db.query(Question).filter(Question.id == answer_data.question_id).first()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    # Check if question belongs to quiz
    if question.quiz_id != attempt.quiz_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question does not belong to this quiz"
        )
    
    # Check if already answered
    existing_answer = db.query(UserAnswer).filter(
        UserAnswer.attempt_id == attempt_id,
        UserAnswer.question_id == answer_data.question_id
    ).first()
    
    if existing_answer:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question already answered"
        )
    
    # Determine if answer is correct
    is_correct = False
    if question.question_type == "multiple_choice":
        is_correct = answer_data.answer.lower() == question.correct_answer.lower()
    elif question.question_type == "true_false":
        is_correct = answer_data.answer.lower() in ["true", "false"] and answer_data.answer.lower() == question.correct_answer.lower()
    else:
        # For short answer and code questions, simple string matching
        is_correct = answer_data.answer.lower().strip() == question.correct_answer.lower().strip()
    
    points_earned = question.points if is_correct else 0
    
    # Create user answer
    user_answer = UserAnswer(
        attempt_id=attempt_id,
        question_id=answer_data.question_id,
        user_answer=answer_data.answer,
        is_correct=is_correct,
        points_earned=points_earned,
        time_spent=answer_data.time_spent
    )
    
    db.add(user_answer)
    
    # Update attempt score
    attempt.score += points_earned
    attempt.time_taken += answer_data.time_spent
    
    db.commit()
    
    return {
        "message": "Answer submitted successfully",
        "is_correct": is_correct,
        "points_earned": points_earned,
        "correct_answer": question.correct_answer if not is_correct else None,
        "explanation": question.explanation,
        "current_score": attempt.score,
        "max_score": attempt.max_score
    }

@router.post("/quiz/{attempt_id}/complete", response_model=QuizResultResponse)
async def complete_quiz(
    attempt_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Complete a quiz attempt"""
    # Get attempt
    attempt = db.query(QuizAttempt).filter(
        QuizAttempt.id == attempt_id,
        QuizAttempt.user_id == current_user.id
    ).first()
    
    if not attempt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz attempt not found"
        )
    
    if attempt.is_completed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quiz attempt already completed"
        )
    
    # Mark as completed
    attempt.is_completed = True
    attempt.completed_at = datetime.now()
    attempt.percentage = (attempt.score / attempt.max_score) * 100 if attempt.max_score > 0 else 0
    
    # Get quiz for rewards
    quiz = db.query(Quiz).filter(Quiz.id == attempt.quiz_id).first()
    
    # Calculate rewards based on performance
    xp_earned = quiz.xp_reward
    coins_earned = quiz.coin_reward
    
    # Bonus for high scores
    if attempt.percentage >= 90:
        xp_earned = int(xp_earned * 1.5)  # 50% bonus
        coins_earned = int(coins_earned * 1.5)
    elif attempt.percentage >= 75:
        xp_earned = int(xp_earned * 1.25)  # 25% bonus
        coins_earned = int(coins_earned * 1.25)
    
    # Add rewards to user
    current_user.xp += xp_earned
    current_user.coins += coins_earned
    current_user.total_quizzes_taken += 1
    
    db.commit()
    
    return QuizResultResponse(
        attempt_id=attempt.id,
        score=attempt.score,
        max_score=attempt.max_score,
        percentage=attempt.percentage,
        time_taken=attempt.time_taken,
        is_completed=attempt.is_completed,
        correct_answers=db.query(UserAnswer).filter(
            UserAnswer.attempt_id == attempt_id,
            UserAnswer.is_correct == True
        ).count(),
        total_questions=db.query(UserAnswer).filter(
            UserAnswer.attempt_id == attempt_id
        ).count(),
        xp_earned=xp_earned,
        coins_earned=coins_earned
    )

@router.get("/learning-paths", response_model=List[LearningPathResponse])
async def get_learning_paths(
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get available learning paths"""
    query = db.query(LearningPath)
    
    if category:
        query = query.filter(LearningPath.category == category)
    if difficulty:
        query = query.filter(LearningPath.difficulty == difficulty)
    
    paths = query.all()
    
    result = []
    for path in paths:
        # Get user progress
        user_progress = db.query(UserPathProgress).filter(
            UserPathProgress.user_id == current_user.id,
            UserPathProgress.path_id == path.id
        ).first()
        
        if not user_progress:
            user_progress = UserPathProgress(
                user_id=current_user.id,
                path_id=path.id,
                progress_percentage=0.0,
                modules_completed=0,
                total_modules=len(path.modules),
                is_started=False,
                is_completed=False
            )
            db.add(user_progress)
            db.commit()
            db.refresh(user_progress)
        
        result.append(LearningPathResponse(
            id=path.id,
            title=path.title,
            description=path.description,
            category=path.category,
            difficulty=path.difficulty,
            estimated_hours=path.estimated_hours,
            xp_reward=path.xp_reward,
            coin_reward=path.coin_reward,
            progress_percentage=user_progress.progress_percentage,
            is_started=user_progress.is_started,
            is_completed=user_progress.is_completed
        ))
    
    return result

@router.post("/learning-path/{path_id}/start")
async def start_learning_path(
    path_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Start a learning path"""
    path = db.query(LearningPath).filter(LearningPath.id == path_id).first()
    if not path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Learning path not found"
        )
    
    # Get or create user progress
    user_progress = db.query(UserPathProgress).filter(
        UserPathProgress.user_id == current_user.id,
        UserPathProgress.path_id == path_id
    ).first()
    
    if not user_progress:
        user_progress = UserPathProgress(
            user_id=current_user.id,
            path_id=path_id,
            progress_percentage=0.0,
            modules_completed=0,
            total_modules=len(path.modules),
            is_started=True,
            is_completed=False,
            started_at=datetime.now()
        )
        db.add(user_progress)
    else:
        user_progress.is_started = True
        if not user_progress.started_at:
            user_progress.started_at = datetime.now()
    
    db.commit()
    
    return {"message": "Learning path started successfully", "path_id": path_id}

@router.get("/learning-path/{path_id}/modules")
async def get_learning_path_modules(
    path_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get modules for a learning path"""
    path = db.query(LearningPath).filter(LearningPath.id == path_id).first()
    if not path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Learning path not found"
        )
    
    modules = db.query(LearningModule).filter(
        LearningModule.path_id == path_id
    ).order_by(LearningModule.order_in_path).all()
    
    # Get user progress for each module
    result = []
    for module in modules:
        user_progress = db.query(UserModuleProgress).filter(
            UserModuleProgress.user_id == current_user.id,
            UserModuleProgress.module_id == module.id
        ).first()
        
        result.append({
            "id": module.id,
            "title": module.title,
            "description": module.description,
            "content_type": module.content_type,
            "duration_minutes": module.duration_minutes,
            "order_in_path": module.order_in_path,
            "is_optional": module.is_optional,
            "progress_percentage": user_progress.progress_percentage if user_progress else 0.0,
            "is_completed": user_progress.is_completed if user_progress else False,
            "best_score": user_progress.best_score if user_progress else 0.0
        })
    
    return result