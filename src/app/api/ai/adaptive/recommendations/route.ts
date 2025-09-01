import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/ai/adaptive/recommendations - Get adaptive learning recommendations
export async function POST(request: NextRequest) {
  try {
    const { userId, currentTopic, currentDifficulty } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Get user's quiz history and performance
    const userAttempts = await db.quizAttempt.findMany({
      where: { userId },
      include: {
        quiz: true,
        answers: {
          include: {
            question: true
          }
        }
      },
      orderBy: { completedAt: 'desc' },
      take: 20
    })

    // Analyze user performance
    const performanceAnalysis = analyzeUserPerformance(userAttempts)
    
    // Generate personalized recommendations
    const recommendations = await generatePersonalizedRecommendations(
      userId, 
      performanceAnalysis, 
      currentTopic, 
      currentDifficulty
    )

    return NextResponse.json({
      performanceAnalysis,
      recommendations,
      nextSteps: generateNextSteps(performanceAnalysis)
    })
  } catch (error) {
    console.error('Error generating adaptive recommendations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function analyzeUserPerformance(attempts: any[]) {
  if (attempts.length === 0) {
    return {
      totalQuizzes: 0,
      averageAccuracy: 0,
      averageTimePerQuestion: 0,
      strongTopics: [],
      weakTopics: [],
      difficultyPreference: 'medium',
      learningPace: 'normal'
    }
  }

  const totalQuizzes = attempts.length
  const totalScore = attempts.reduce((sum, attempt) => sum + attempt.score, 0)
  const maxScore = attempts.reduce((sum, attempt) => sum + attempt.maxScore, 0)
  const averageAccuracy = maxScore > 0 ? (totalScore / maxScore) * 100 : 0
  
  const totalTime = attempts.reduce((sum, attempt) => sum + attempt.timeSpent, 0)
  const totalQuestions = attempts.reduce((sum, attempt) => sum + attempt.answers.length, 0)
  const averageTimePerQuestion = totalQuestions > 0 ? totalTime / totalQuestions : 0

  // Analyze topic performance
  const topicPerformance: { [key: string]: { correct: number; total: number } } = {}
  
  attempts.forEach(attempt => {
    const topic = attempt.quiz.category
    if (!topicPerformance[topic]) {
      topicPerformance[topic] = { correct: 0, total: 0 }
    }
    
    attempt.answers.forEach((answer: any) => {
      topicPerformance[topic].total++
      if (answer.isCorrect) {
        topicPerformance[topic].correct++
      }
    })
  })

  const strongTopics: string[] = []
  const weakTopics: string[] = []

  Object.entries(topicPerformance).forEach(([topic, performance]) => {
    const accuracy = (performance.correct / performance.total) * 100
    if (accuracy >= 80) {
      strongTopics.push(topic)
    } else if (accuracy < 60) {
      weakTopics.push(topic)
    }
  })

  // Determine difficulty preference
  const difficultyCounts: { [key: string]: number } = {}
  attempts.forEach(attempt => {
    const difficulty = attempt.quiz.difficulty
    difficultyCounts[difficulty] = (difficultyCounts[difficulty] || 0) + 1
  })
  
  const preferredDifficulty = Object.entries(difficultyCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'medium'

  // Determine learning pace
  let learningPace = 'normal'
  if (averageTimePerQuestion < 20) {
    learningPace = 'fast'
  } else if (averageTimePerQuestion > 45) {
    learningPace = 'slow'
  }

  return {
    totalQuizzes,
    averageAccuracy,
    averageTimePerQuestion,
    strongTopics,
    weakTopics,
    difficultyPreference: preferredDifficulty,
    learningPace
  }
}

async function generatePersonalizedRecommendations(
  userId: string, 
  analysis: any, 
  currentTopic?: string, 
  currentDifficulty?: string
) {
  const recommendations: Array<{
    type: string
    title: string
    description: string
    action: string
    priority: string
  }> = []

  // Difficulty adjustment recommendations
  if (analysis.averageAccuracy >= 85 && analysis.difficultyPreference !== 'hard') {
    recommendations.push({
      type: 'difficulty_increase',
      title: 'Ready for a Challenge?',
      description: 'Your performance is excellent! Try harder quizzes to continue growing.',
      action: 'increase_difficulty',
      priority: 'high'
    })
  } else if (analysis.averageAccuracy < 50 && analysis.difficultyPreference !== 'easy') {
    recommendations.push({
      type: 'difficulty_decrease',
      title: 'Build Your Foundation',
      description: 'Start with easier quizzes to build confidence and understanding.',
      action: 'decrease_difficulty',
      priority: 'high'
    })
  }

  // Topic-specific recommendations
  if (analysis.weakTopics.length > 0) {
    recommendations.push({
      type: 'focus_weak_areas',
      title: 'Strengthen Weak Areas',
      description: `Focus on these topics: ${analysis.weakTopics.join(', ')}`,
      action: 'practice_weak_topics',
      priority: 'medium'
    })
  }

  // Learning pace recommendations
  if (analysis.learningPace === 'fast') {
    recommendations.push({
      type: 'accelerated_learning',
      title: 'Fast Learner',
      description: 'You learn quickly! Try more advanced topics and timed challenges.',
      action: 'accelerated_content',
      priority: 'medium'
    })
  } else if (analysis.learningPace === 'slow') {
    recommendations.push({
      type: 'paced_learning',
      title: 'Take Your Time',
      description: 'It\'s okay to learn at your own pace. Try untimed quizzes first.',
      action: 'untimed_practice',
      priority: 'medium'
    })
  }

  // Engagement recommendations
  if (analysis.totalQuizzes < 5) {
    recommendations.push({
      type: 'engagement',
      title: 'Keep the Momentum',
      description: 'Take more quizzes to unlock achievements and build your streak!',
      action: 'daily_challenges',
      priority: 'low'
    })
  }

  return recommendations
}

function generateNextSteps(analysis: any) {
  const nextSteps: Array<{
    step: number
    title: string
    description: string
    estimatedTime: string
  }> = []

  if (analysis.strongTopics.length > 0) {
    nextSteps.push({
      step: 1,
      title: 'Master Advanced Topics',
      description: `Based on your strength in ${analysis.strongTopics[0]}, explore advanced concepts.`,
      estimatedTime: '30-45 minutes'
    })
  }

  if (analysis.weakTopics.length > 0) {
    nextSteps.push({
      step: 2,
      title: 'Review Fundamentals',
      description: `Review basic concepts in ${analysis.weakTopics[0]} to build a stronger foundation.`,
      estimatedTime: '20-30 minutes'
    })
  }

  nextSteps.push({
    step: 3,
    title: 'Daily Challenge',
    description: 'Complete today\'s daily challenge to earn bonus rewards.',
    estimatedTime: '15 minutes'
  })

  return nextSteps
}