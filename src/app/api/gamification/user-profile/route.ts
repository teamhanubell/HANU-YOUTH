import { NextRequest, NextResponse } from 'next/server'

// Force static export for this route
export const dynamic = "force-static"

// GET /api/gamification/user-profile - Get user profile
export async function GET(request: NextRequest) {
  try {
    // For static export, we'll use mock data without accessing request.url
    const mockUserProfile = {
      id: 'demo_user',
      email: 'user@example.com',
      username: 'DemoUser',
      fullName: 'Demo User',
      country: 'USA',
      avatarUrl: '/avatars/default.jpg',
      level: 15,
      xp: 8450,
      coins: 1250,
      gems: 25,
      dailyStreak: 15,
      totalSearches: 156,
      totalQuizzes: 42,
      totalInnovations: 8,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json(mockUserProfile)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/gamification/user-profile - Update user profile
export async function POST(request: NextRequest) {
  try {
    const { userId, updates } = await request.json()

    if (!userId || !updates) {
      return NextResponse.json({ error: 'User ID and updates required' }, { status: 400 })
    }

    // Mock user profile update for static export
    const mockUpdatedProfile = {
      id: userId,
      email: updates.email || 'user@example.com',
      username: updates.username || 'DemoUser',
      fullName: updates.fullName || 'Demo User',
      country: updates.country || 'USA',
      avatarUrl: updates.avatarUrl || '/avatars/default.jpg',
      level: 15,
      xp: 8450,
      coins: 1250,
      gems: 25,
      dailyStreak: 15,
      totalSearches: 156,
      totalQuizzes: 42,
      totalInnovations: 8,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json(mockUpdatedProfile)
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}