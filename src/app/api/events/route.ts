import { NextRequest, NextResponse } from 'next/server'

// Force static export for this route
export const dynamic = "force-static"

export async function POST(request: NextRequest) {
  try {
    const { query, options = {} } = await request.json()
    
    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    // Mock events data for static export
    const mockEvents = [
      {
        id: `event_1_${Date.now()}`,
        title: `${query} Conference`,
        description: `International conference focusing on ${query} and its global impact.`,
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        location: "Virtual",
        category: "conference",
        url: "https://example.com/event1"
      },
      {
        id: `event_2_${Date.now()}`,
        title: `${query} Workshop`,
        description: `Interactive workshop on ${query} for youth development.`,
        date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        location: "Online",
        category: "workshop",
        url: "https://example.com/event2"
      }
    ]
    
    return NextResponse.json({ events: mockEvents })
  } catch (error) {
    console.error('Events search error:', error)
    return NextResponse.json(
      { error: 'Failed to search events' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Mock events data for static export
    const mockEvents = [
      {
        id: `event_1_${Date.now()}`,
        title: "Global Youth Summit",
        description: "Annual summit bringing together youth leaders from around the world.",
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        location: "Virtual",
        category: "summit",
        url: "https://example.com/event1"
      },
      {
        id: `event_2_${Date.now()}`,
        title: "UN Sustainable Development Forum",
        description: "Forum discussing progress on UN Sustainable Development Goals.",
        date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        location: "Online",
        category: "forum",
        url: "https://example.com/event2"
      }
    ]
    
    return NextResponse.json({ events: mockEvents })
  } catch (error) {
    console.error('Get events error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}