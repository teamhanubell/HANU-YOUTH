import { NextRequest, NextResponse } from 'next/server'

// Force static export for this route
export const dynamic = "force-static"

// Shop items data
const shopItems = {
  avatars: [
    {
      id: 'avatar_cyber_ninja',
      name: 'Cyber Ninja',
      description: 'Futuristic ninja avatar with neon accents',
      type: 'avatar',
      cost: { coins: 500, gems: 0 },
      rarity: 'rare',
      category: 'avatars'
    },
    {
      id: 'avatar_space_explorer',
      name: 'Space Explorer',
      description: 'Astronaut avatar with galaxy background',
      type: 'avatar',
      cost: { coins: 750, gems: 0 },
      rarity: 'rare',
      category: 'avatars'
    },
    {
      id: 'avatar_ai_assistant',
      name: 'AI Assistant',
      description: 'Robotic AI avatar with glowing circuits',
      type: 'avatar',
      cost: { coins: 1000, gems: 5 },
      rarity: 'epic',
      category: 'avatars'
    },
    {
      id: 'avatar_un_diplomat',
      name: 'UN Diplomat',
      description: 'Professional diplomat with formal attire',
      type: 'avatar',
      cost: { coins: 1200, gems: 10 },
      rarity: 'legendary',
      category: 'avatars'
    }
  ],
  themes: [
    {
      id: 'theme_neon_cyberpunk',
      name: 'Neon Cyberpunk',
      description: 'Dark theme with neon pink and blue accents',
      type: 'theme',
      cost: { coins: 300, gems: 0 },
      rarity: 'common',
      category: 'themes'
    },
    {
      id: 'theme_nature_oasis',
      name: 'Nature Oasis',
      description: 'Fresh green theme with natural elements',
      type: 'theme',
      cost: { coins: 400, gems: 0 },
      rarity: 'common',
      category: 'themes'
    },
    {
      id: 'theme_cosmic_galaxy',
      name: 'Cosmic Galaxy',
      description: 'Space-themed with stars and nebulae',
      type: 'theme',
      cost: { coins: 600, gems: 3 },
      rarity: 'rare',
      category: 'themes'
    },
    {
      id: 'theme_golden_royalty',
      name: 'Golden Royalty',
      description: 'Luxurious gold and white theme',
      type: 'theme',
      cost: { coins: 800, gems: 5 },
      rarity: 'epic',
      category: 'themes'
    }
  ],
  badges: [
    {
      id: 'badge_early_adopter',
      name: 'Early Adopter',
      description: 'For joining HANU-YOUTH in the first month',
      type: 'badge',
      cost: { coins: 0, gems: 0 },
      rarity: 'legendary',
      category: 'badges',
      requirement: 'joined_before_2024'
    },
    {
      id: 'badge_quiz_master',
      name: 'Quiz Master',
      description: 'Complete 100 quizzes with 90%+ accuracy',
      type: 'badge',
      cost: { coins: 0, gems: 0 },
      rarity: 'epic',
      category: 'badges',
      requirement: 'quiz_achievement'
    },
    {
      id: 'badge_streak_warrior',
      name: 'Streak Warrior',
      description: 'Maintain a 30-day learning streak',
      type: 'badge',
      cost: { coins: 0, gems: 0 },
      rarity: 'rare',
      category: 'badges',
      requirement: 'streak_achievement'
    }
  ],
  effects: [
    {
      id: 'effect_rainbow_trail',
      name: 'Rainbow Trail',
      description: 'Leave a colorful rainbow trail in the interface',
      type: 'effect',
      cost: { coins: 200, gems: 2 },
      rarity: 'rare',
      category: 'effects',
      duration: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    },
    {
      id: 'effect_particle_shower',
      name: 'Particle Shower',
      description: 'Animated particles follow your cursor',
      type: 'effect',
      cost: { coins: 350, gems: 3 },
      rarity: 'epic',
      category: 'effects',
      duration: 14 * 24 * 60 * 60 * 1000 // 14 days
    },
    {
      id: 'effect_glow_aura',
      name: 'Glow Aura',
      description: 'Your profile glows with a mystical aura',
      type: 'effect',
      cost: { coins: 500, gems: 5 },
      rarity: 'legendary',
      category: 'effects',
      duration: 30 * 24 * 60 * 60 * 1000 // 30 days
    }
  ]
}

// GET /api/gamification/economy/shop - Get shop items
export async function GET(request: NextRequest) {
  try {
    // For static export, we'll return all items without filtering
    const items = [
      ...shopItems.avatars,
      ...shopItems.themes,
      ...shopItems.badges,
      ...shopItems.effects
    ]

    return NextResponse.json({
      items,
      categories: Object.keys(shopItems),
      rarities: ['common', 'rare', 'epic', 'legendary']
    })
  } catch (error) {
    console.error('Error fetching shop items:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/gamification/economy/shop/featured - Get featured items
export async function POST(request: NextRequest) {
  try {
    // Get featured items (could be based on time, user preferences, etc.)
    const featuredItems = [
      shopItems.avatars[2], // AI Assistant
      shopItems.themes[2], // Cosmic Galaxy
      shopItems.effects[1], // Particle Shower
      {
        ...shopItems.avatars[0], // Cyber Ninja
        discount: 0.2 // 20% discount
      }
    ]

    // Daily special (rotates every 24 hours)
    const now = new Date()
    const startOfYear = new Date(now.getFullYear(), 0, 0)
    const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24))
    const dailySpecial = shopItems.avatars[dayOfYear % shopItems.avatars.length]

    return NextResponse.json({
      featured: featuredItems,
      dailySpecial: {
        ...dailySpecial,
        discount: 0.15 // 15% discount
      },
      limitedTime: [
        {
          ...shopItems.effects[2], // Glow Aura
          limitedQuantity: 50,
          endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
        }
      ]
    })
  } catch (error) {
    console.error('Error fetching featured items:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}