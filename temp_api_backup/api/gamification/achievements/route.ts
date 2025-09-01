import { NextRequest, NextResponse } from 'next/server'

// Force static export for this route
export const dynamic = "force-static"

// GET /api/gamification/achievements - Get user achievements
export async function GET(request: NextRequest) {
  try {
    // For static export, we'll use mock data without accessing request.url
    const mockAchievements = [
      {
        id: 'achievement_1',
        name: 'First Steps',
        description: 'Complete your first quiz',
        icon: '🎯',
        category: 'quiz',
        rarity: 'common',
        unlocked: true,
        unlockedAt: new Date().toISOString(),
        progress: 100
      },
      {
        id: 'achievement_2',
        name: 'Knowledge Seeker',
        description: 'Search for 10 different topics',
        icon: '🔍',
        category: 'search',
        rarity: 'rare',
        unlocked: false,
        progress: 60
      },
      {
        id: 'achievement_3',
        name: 'Treasure Hunter',
        description: 'Find all treasures in a treasure hunt',
        icon: '💎',
        category: 'games',
        rarity: 'epic',
        unlocked: false,
        progress: 0
      }
    ]

    return NextResponse.json(mockAchievements)
  } catch (error) {
    console.error('Error fetching achievements:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/gamification/achievements - Unlock achievement
export async function POST(request: NextRequest) {
  try {
    const { userId, achievementId, progress } = await request.json()

    if (!userId || !achievementId) {
      return NextResponse.json({ error: 'User ID and achievement ID required' }, { status: 400 })
    }

    // Mock achievement unlock for static export
    const mockAchievement = {
      id: achievementId,
      userId,
      progress: progress || 100,
      unlockedAt: new Date().toISOString(),
      achievement: {
        id: achievementId,
        name: 'Mock Achievement',
        description: 'This is a mock achievement for static export',
        icon: '🏆',
        category: 'mock',
        rarity: 'common',
        xpReward: 50,
        coinReward: 10,
        gemReward: 1
      }
    }

    return NextResponse.json(mockAchievement)
  } catch (error) {
    console.error('Error unlocking achievement:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}