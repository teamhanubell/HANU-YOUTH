import { NextRequest, NextResponse } from 'next/server'

// Force static export for this route
export const dynamic = "force-static"

// GET /api/gamification/daily-challenges - Get user daily challenges
export async function GET(request: NextRequest) {
  try {
    // For static export, we'll use mock data without accessing request.url
    const mockChallenges = [
      {
        id: 'challenge_1',
        title: 'Daily Quiz Master',
        description: 'Complete 3 quizzes today',
        challengeType: 'quiz',
        difficulty: 'easy',
        targetValue: 3,
        xpReward: 50,
        coinReward: 25,
        gemReward: 1,
        progress: 33,
        isCompleted: false
      },
      {
        id: 'challenge_2',
        title: 'Knowledge Explorer',
        description: 'Search for 5 different topics',
        challengeType: 'search',
        difficulty: 'medium',
        targetValue: 5,
        xpReward: 75,
        coinReward: 40,
        gemReward: 2,
        progress: 80,
        isCompleted: false
      },
      {
        id: 'challenge_3',
        title: 'Treasure Hunter',
        description: 'Find 2 treasures in treasure hunt',
        challengeType: 'games',
        difficulty: 'hard',
        targetValue: 2,
        xpReward: 100,
        coinReward: 60,
        gemReward: 3,
        progress: 100,
        isCompleted: true
      }
    ]

    return NextResponse.json(mockChallenges)
  } catch (error) {
    console.error('Error fetching daily challenges:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/gamification/daily-challenges - Update challenge progress
export async function POST(request: NextRequest) {
  try {
    const { userId, challengeId, progress } = await request.json()

    if (!userId || !challengeId || progress === undefined) {
      return NextResponse.json({ error: 'User ID, challenge ID, and progress required' }, { status: 400 })
    }

    // Mock challenge update for static export
    const mockUpdatedChallenge = {
      id: challengeId,
      userId,
      progress: progress,
      isCompleted: progress >= 100,
      completedAt: progress >= 100 ? new Date().toISOString() : null,
      progressPercentage: Math.min(progress, 100),
      rewardsGiven: progress >= 100
    }

    return NextResponse.json(mockUpdatedChallenge)
  } catch (error) {
    console.error('Error updating daily challenge:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}