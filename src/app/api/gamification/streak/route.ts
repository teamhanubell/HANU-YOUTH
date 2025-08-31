import { NextRequest, NextResponse } from 'next/server'

// Force static export for this route
export const dynamic = "force-static"

// POST /api/gamification/streak/update - Update daily streak
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Mock streak update for static export
    const mockStreakUpdate = {
      streak: 15,
      previousStreak: 14,
      bonus: 25,
      totalCoins: 1250,
      totalXP: 8450
    }

    return NextResponse.json(mockStreakUpdate)
  } catch (error) {
    console.error('Error updating daily streak:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/gamification/streak/status - Get streak status
export async function GET(request: NextRequest) {
  try {
    // For static export, we'll use mock data without accessing request.url
    const mockStreakStatus = {
      currentStreak: 15,
      wasActiveToday: false,
      wasActiveYesterday: true,
      nextBonusIn: 2,
      nextBonusAmount: 25
    }

    return NextResponse.json(mockStreakStatus)
  } catch (error) {
    console.error('Error fetching streak status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}