import { NextRequest, NextResponse } from 'next/server'

// Force static export for this route
export const dynamic = "force-static"

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json()
    
    switch (action) {
      case 'createUser':
        return await handleCreateUser(data)
      case 'sendMessage':
        return await handleSendMessage(data)
      case 'saveResearch':
        return await handleSaveResearch(data)
      case 'joinEvent':
        return await handleJoinEvent(data)
      case 'updateProgress':
        return await handleUpdateProgress(data)
      case 'sendNotification':
        return await handleSendNotification(data)
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Firebase API error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const userId = searchParams.get('userId')
    
    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      )
    }
    
    switch (action) {
      case 'getUser':
        return await handleGetUser(userId)
      case 'getMessages':
        return await handleGetMessages(userId)
      case 'getResearch':
        return await handleGetResearch(userId)
      case 'getEvents':
        return await handleGetEvents()
      case 'getLeaderboard':
        return await handleGetLeaderboard()
      case 'getNotifications':
        return await handleGetNotifications(userId)
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Firebase API error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

async function handleCreateUser(data: any) {
  // Mock user creation for static export
  const result = {
    success: true,
    user: {
      id: `user_${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString()
    }
  }
  return NextResponse.json(result)
}

async function handleSendMessage(data: any) {
  // Mock message sending for static export
  const result = {
    success: true,
    message: {
      id: `msg_${Date.now()}`,
      ...data,
      timestamp: new Date().toISOString()
    }
  }
  return NextResponse.json(result)
}

async function handleSaveResearch(data: any) {
  // Mock research saving for static export
  const result = {
    success: true,
    research: {
      id: `research_${Date.now()}`,
      ...data,
      savedAt: new Date().toISOString()
    }
  }
  return NextResponse.json(result)
}

async function handleJoinEvent(data: any) {
  // Mock event joining for static export
  const result = {
    success: true,
    eventId: data.eventId,
    userId: data.userId,
    joinedAt: new Date().toISOString()
  }
  return NextResponse.json(result)
}

async function handleUpdateProgress(data: any) {
  // Mock progress update for static export
  const result = {
    success: true,
    userId: data.userId,
    progress: data.progress,
    updatedAt: new Date().toISOString()
  }
  return NextResponse.json(result)
}

async function handleSendNotification(data: any) {
  // Mock notification sending for static export
  const result = {
    success: true,
    notification: {
      id: `notif_${Date.now()}`,
      ...data,
      sentAt: new Date().toISOString()
    }
  }
  return NextResponse.json(result)
}

async function handleGetUser(userId: string | null) {
  if (!userId) {
    return NextResponse.json(
      { error: 'User ID is required' },
      { status: 400 }
    )
  }
  // Mock user data for static export
  const result = {
    id: userId,
    username: 'DemoUser',
    email: 'demo@example.com',
    createdAt: new Date().toISOString()
  }
  return NextResponse.json(result)
}

async function handleGetMessages(userId: string | null) {
  if (!userId) {
    return NextResponse.json(
      { error: 'User ID is required' },
      { status: 400 }
    )
  }
  // Mock messages for static export
  const result = {
    messages: [
      {
        id: 'msg_1',
        userId,
        content: 'Welcome to HANU-YOUTH!',
        timestamp: new Date().toISOString()
      }
    ]
  }
  return NextResponse.json(result)
}

async function handleGetResearch(userId: string | null) {
  if (!userId) {
    return NextResponse.json(
      { error: 'User ID is required' },
      { status: 400 }
    )
  }
  // Mock research data for static export
  const result = {
    research: [
      {
        id: 'research_1',
        userId,
        title: 'Sample Research',
        content: 'This is sample research content',
        createdAt: new Date().toISOString()
      }
    ]
  }
  return NextResponse.json(result)
}

async function handleGetEvents() {
  // Mock events for static export
  const result = {
    events: [
      {
        id: 'event_1',
        title: 'Global Youth Summit',
        date: new Date().toISOString(),
        location: 'Virtual'
      }
    ]
  }
  return NextResponse.json(result)
}

async function handleGetLeaderboard() {
  // Mock leaderboard for static export
  const result = {
    leaderboard: [
      {
        rank: 1,
        username: 'DemoUser',
        score: 1000
      }
    ]
  }
  return NextResponse.json(result)
}

async function handleGetNotifications(userId: string | null) {
  if (!userId) {
    return NextResponse.json(
      { error: 'User ID is required' },
      { status: 400 }
    )
  }
  // Mock notifications for static export
  const result = {
    notifications: [
      {
        id: 'notif_1',
        userId,
        title: 'Welcome!',
        content: 'Welcome to HANU-YOUTH platform',
        read: false,
        createdAt: new Date().toISOString()
      }
    ]
  }
  return NextResponse.json(result)
}