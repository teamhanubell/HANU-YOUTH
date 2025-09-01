import { NextRequest, NextResponse } from 'next/server'

interface SearchResult {
  id: string
  title: string
  content: string
  url: string
  type: 'research' | 'un_report' | 'event' | 'innovation'
  source: string
  date: string
  relevanceScore: number
}

export async function POST(request: NextRequest) {
  try {
    const { query, category, limit = 10 } = await request.json()

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Valid search query is required' },
        { status: 400 }
      )
    }

    // Mock search results for static export
    const mockResults: SearchResult[] = [
      {
        id: `result_1_${Date.now()}`,
        title: `Research on ${query}`,
        content: `Comprehensive research findings about ${query}. This study provides detailed analysis and insights into the topic.`,
        url: 'https://example.com/research',
        type: 'research',
        source: 'Research Institute',
        date: new Date().toISOString(),
        relevanceScore: 0.95
      },
      {
        id: `result_2_${Date.now()}`,
        title: `UN Report on ${query}`,
        content: `Official United Nations report addressing ${query} and its global implications for sustainable development.`,
        url: 'https://un.org/reports',
        type: 'un_report',
        source: 'United Nations',
        date: new Date().toISOString(),
        relevanceScore: 0.90
      },
      {
        id: `result_3_${Date.now()}`,
        title: `Global Conference on ${query}`,
        content: `Upcoming international conference focusing on ${query} with experts from around the world.`,
        url: 'https://events.example.com',
        type: 'event',
        source: 'Event Organizer',
        date: new Date().toISOString(),
        relevanceScore: 0.85
      },
      {
        id: `result_4_${Date.now()}`,
        title: `Innovation Lab: ${query} Solutions`,
        content: `Cutting-edge innovations and technological solutions related to ${query} for youth empowerment.`,
        url: 'https://innovation.example.com',
        type: 'innovation',
        source: 'Innovation Lab',
        date: new Date().toISOString(),
        relevanceScore: 0.80
      }
    ]

    // Filter by category if specified
    const filteredResults = category && category !== 'all'
      ? mockResults.filter(result => result.type === category)
      : mockResults

    // Sort by relevance score
    const sortedResults = filteredResults.sort((a, b) => b.relevanceScore - a.relevanceScore)

    return NextResponse.json({
      results: sortedResults,
      totalResults: sortedResults.length,
      query,
      category: category || 'all'
    })

  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    )
  }
}