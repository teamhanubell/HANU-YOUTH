import { NextRequest, NextResponse } from 'next/server'

// Force static export for this route
export const dynamic = "force-static"

// GET /api/gamification/power-ups - Get user power-ups
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Mock power-ups data for static export
    const mockPowerUps = [
      {
        id: 'powerup_double_xp',
        name: 'Double XP',
        description: 'Double your XP gains for the next hour',
        icon: '⚡',
        category: 'boost',
        effectType: 'xp_multiplier',
        effectValue: 2.0,
        duration: 3600000, // 1 hour
        costCoins: 100,
        costGems: 2,
        maxUsesPerDay: 3,
        usesToday: 1,
        canUse: true
      },
      {
        id: 'powerup_hint_reveal',
        name: 'Hint Reveal',
        description: 'Get a hint for any quiz question',
        icon: '💡',
        category: 'helper',
        effectType: 'hint',
        effectValue: 1,
        duration: 0,
        costCoins: 50,
        costGems: 1,
        maxUsesPerDay: 5,
        usesToday: 2,
        canUse: true
      },
      {
        id: 'powerup_streak_freeze',
        name: 'Streak Freeze',
        description: 'Protect your daily streak for one day',
        icon: '❄️',
        category: 'protection',
        effectType: 'streak_protection',
        effectValue: 1,
        duration: 86400000, // 24 hours
        costCoins: 200,
        costGems: 5,
        maxUsesPerDay: 1,
        usesToday: 0,
        canUse: true
      },
      {
        id: 'powerup_coin_boost',
        name: 'Coin Boost',
        description: 'Get 50% more coins for the next 2 hours',
        icon: '🪙',
        category: 'boost',
        effectType: 'coin_multiplier',
        effectValue: 1.5,
        duration: 7200000, // 2 hours
        costCoins: 150,
        costGems: 3,
        maxUsesPerDay: 2,
        usesToday: 2,
        canUse: false
      }
    ]

    return NextResponse.json(mockPowerUps)
  } catch (error) {
    console.error('Error fetching power-ups:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/gamification/power-ups/use - Use a power-up
export async function POST(request: NextRequest) {
  try {
    const { userId, powerUpId } = await request.json()

    if (!userId || !powerUpId) {
      return NextResponse.json({ error: 'User ID and power-up ID required' }, { status: 400 })
    }

    // Mock power-up usage for static export
    const mockPowerUpEffects = {
      'powerup_double_xp': {
        type: 'xp_multiplier',
        value: 2.0,
        duration: 3600000
      },
      'powerup_hint_reveal': {
        type: 'hint',
        value: 1,
        duration: 0
      },
      'powerup_streak_freeze': {
        type: 'streak_protection',
        value: 1,
        duration: 86400000
      },
      'powerup_coin_boost': {
        type: 'coin_multiplier',
        value: 1.5,
        duration: 7200000
      }
    }

    const effect = mockPowerUpEffects[powerUpId as keyof typeof mockPowerUpEffects]

    if (!effect) {
      return NextResponse.json({ error: 'Power-up not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      message: 'Power-up used successfully',
      effect
    })
  } catch (error) {
    console.error('Error using power-up:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}