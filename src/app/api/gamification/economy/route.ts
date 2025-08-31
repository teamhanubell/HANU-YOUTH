import { NextRequest, NextResponse } from 'next/server'

// Force static export for this route
export const dynamic = "force-static"

// GET /api/gamification/economy/inventory - Get user inventory
export async function GET(request: NextRequest) {
  try {
    // For static export, we'll use mock data without accessing request.url
    const mockInventory = [
      {
        id: 'inventory_1',
        userId: 'demo_user',
        itemType: 'power-up',
        itemId: 'double-xp',
        quantity: 3,
        acquiredAt: new Date().toISOString()
      },
      {
        id: 'inventory_2',
        userId: 'demo_user',
        itemType: 'avatar',
        itemId: 'cyber-ninja',
        quantity: 1,
        acquiredAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'inventory_3',
        userId: 'demo_user',
        itemType: 'badge',
        itemId: 'early-adopter',
        quantity: 1,
        acquiredAt: new Date(Date.now() - 172800000).toISOString()
      }
    ]

    return NextResponse.json(mockInventory)
  } catch (error) {
    console.error('Error fetching inventory:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/gamification/economy/purchase - Purchase item
export async function POST(request: NextRequest) {
  try {
    const { userId, itemType, itemId, cost } = await request.json()

    if (!userId || !itemType || !itemId || cost === undefined) {
      return NextResponse.json({ 
        error: 'User ID, item type, item ID, and cost are required' 
      }, { status: 400 })
    }

    // Mock purchase for static export
    const mockPurchase = {
      message: 'Item purchased successfully',
      remainingCoins: 150,
      remainingGems: 8,
      item: {
        id: `inventory_${Date.now()}`,
        userId,
        itemType,
        itemId,
        quantity: 1,
        acquiredAt: new Date().toISOString()
      }
    }

    return NextResponse.json(mockPurchase)
  } catch (error) {
    console.error('Error purchasing item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}