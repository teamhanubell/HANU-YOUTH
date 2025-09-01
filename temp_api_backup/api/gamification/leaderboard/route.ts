import { NextRequest, NextResponse } from 'next/server'

// Force static export for this route
export const dynamic = "force-static"

// GET /api/gamification/leaderboard - Get leaderboard
export async function GET(request: NextRequest) {
  try {
    // Serve from centralized mock DB for consistency across app
    const { getLeaderboard } = await import('@/data/leaderboard')
    const data = getLeaderboard()

    return NextResponse.json({
      leaderboard: data,
      pagination: {
        total: data.length,
        limit: 10,
        offset: 0,
        hasMore: false,
      },
    })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}