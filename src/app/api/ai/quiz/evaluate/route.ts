import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/ai/quiz/evaluate - Evaluate quiz answers and provide adaptive learning
export async function POST(request: NextRequest) {
  try {
    const { quizId, userId, answers, timeSpent } = await request.json()

    if (!quizId || !userId || !answers) {
      return NextResponse.json({ 
        error: 'Quiz ID, user ID, and answers are required' 
      }, { status: 400 })
    }

    // Get quiz with questions
    const quiz = await db.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          orderBy: { order: 'asc' }
        }
      }
    })

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
    }

    // Calculate score and process answers
    let totalScore = 0
    let maxScore = 0
    const evaluatedAnswers: Array<{
      questionId: string
      userAnswer: any
      isCorrect: boolean
      points: number
      timeSpent: any
    }> = []

    for (let i = 0; i < quiz.questions.length; i++) {
      const question = quiz.questions[i]
      const userAnswer = answers[i]
      maxScore += question.points

      const isCorrect = evaluateAnswer(question, userAnswer)
      const points = isCorrect ? question.points : 0
      totalScore += points

      evaluatedAnswers.push({
        questionId: question.id,
        userAnswer: userAnswer.answer,
        isCorrect,
        points,
        timeSpent: userAnswer.timeSpent || 0
      })
    }

    // Create quiz attempt
    const attempt = await db.quizAttempt.create({
      data: {
        userId,
        quizId,
        score: totalScore,
        maxScore,
        timeSpent,
        completedAt: new Date(),
        answers: {
          create: evaluatedAnswers
        }
      }
    })

    // Update user stats
    const accuracy = (totalScore / maxScore) * 100
    const xpGained = Math.floor(totalScore * 10)
    const coinsGained = Math.floor(totalScore * 5)

    await db.user.update({
      where: { id: userId },
      data: {
        xp: {
          increment: xpGained
        },
        coins: {
          increment: coinsGained
        },
        totalQuizzes: {
          increment: 1
        }
      }
    })

    // Generate adaptive learning recommendations
    const recommendations = await generateRecommendations(quiz, evaluatedAnswers, accuracy)

    return NextResponse.json({
      attemptId: attempt.id,
      score: totalScore,
      maxScore,
      accuracy,
      xpGained,
      coinsGained,
      timeSpent,
      recommendations,
      answers: evaluatedAnswers
    })
  } catch (error) {
    console.error('Error evaluating quiz:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function evaluateAnswer(question: any, userAnswer: any): boolean {
  switch (question.type) {
    case 'multiple_choice':
      return userAnswer.answer === question.correctAnswer
    
    case 'true_false':
      return userAnswer.answer.toLowerCase() === question.correctAnswer.toLowerCase()
    
    case 'short_answer':
      // Simple string matching for short answers
      return userAnswer.answer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim()
    
    default:
      return false
  }
}

async function generateRecommendations(quiz: any, answers: any[], accuracy: number) {
  const recommendations: Array<{
    type: string
    message: string
    action: string
  }> = []

  // Overall performance recommendation
  if (accuracy >= 90) {
    recommendations.push({
      type: 'difficulty',
      message: 'Excellent performance! Try more challenging quizzes in this category.',
      action: 'increase_difficulty'
    })
  } else if (accuracy >= 70) {
    recommendations.push({
      type: 'practice',
      message: 'Good job! Practice similar topics to reinforce your knowledge.',
      action: 'similar_topics'
    })
  } else if (accuracy >= 50) {
    recommendations.push({
      type: 'review',
      message: 'Review the basic concepts and try easier quizzes first.',
      action: 'decrease_difficulty'
    })
  } else {
    recommendations.push({
      type: 'learn',
      message: 'Consider studying the fundamentals before attempting more quizzes.',
      action: 'study_materials'
    })
  }

  // Specific topic recommendations based on incorrect answers
  const incorrectAnswers = answers.filter(a => !a.isCorrect)
  if (incorrectAnswers.length > 0) {
    recommendations.push({
      type: 'focus_areas',
      message: `Focus on improving these areas: ${incorrectAnswers.length} questions need review.`,
      action: 'review_mistakes'
    })
  }

  // Time-based recommendations
  const avgTimePerQuestion = answers.reduce((sum, a) => sum + (a.timeSpent || 0), 0) / answers.length
  if (avgTimePerQuestion > 60) {
    recommendations.push({
      type: 'time_management',
      message: 'Try to answer questions more quickly. Practice with timed quizzes.',
      action: 'timed_practice'
    })
  }

  return recommendations
}