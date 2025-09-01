import { NextRequest, NextResponse } from 'next/server'

// Force static export for this route
export const dynamic = "force-static"

export async function POST(request: NextRequest) {
  try {
    const { url, query } = await request.json()
    
    if (!url && !query) {
      return NextResponse.json(
        { error: 'URL or query is required' },
        { status: 400 }
      )
    }

    // Mock news verification for static export
    if (url) {
      // Verify specific article
      const mockVerification = {
        url,
        isVerified: true,
        confidence: 0.85,
        sources: ['BBC News', 'Reuters'],
        factCheck: {
          claims: [
            {
              claim: 'Sample claim from article',
              isTrue: true,
              evidence: 'Multiple sources confirm this information'
            }
          ],
          overallAccuracy: 0.85
        },
        publishedAt: new Date().toISOString(),
        source: {
          name: 'Mock News Source',
          reliability: 'high'
        }
      }
      return NextResponse.json(mockVerification)
    } else if (query) {
      // Search for news and verify sources
      const mockArticles = [
        {
          title: `News about ${query}`,
          description: 'This is a mock news article for demonstration purposes',
          url: 'https://example.com/news',
          publishedAt: new Date().toISOString(),
          source: {
            name: 'Mock News Source',
            url: 'https://example.com'
          },
          verification: {
            isVerified: true,
            confidence: 0.8,
            sources: ['Mock News Source']
          }
        }
      ]
      
      return NextResponse.json({ articles: mockArticles })
    }
    
  } catch (error) {
    console.error('News verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify news' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Mock headlines for static export
    const mockHeadlines = [
      {
        title: 'Global Youth Summit Announces New Initiatives',
        description: 'Annual summit brings together youth leaders from around the world',
        url: 'https://example.com/news1',
        publishedAt: new Date().toISOString(),
        source: {
          name: 'Global News Network',
          url: 'https://example.com'
        }
      },
      {
        title: 'UN Sustainable Development Goals Progress Report Released',
        description: 'New report shows mixed progress on global sustainability targets',
        url: 'https://example.com/news2',
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        source: {
          name: 'UN News',
          url: 'https://example.com'
        }
      }
    ]
    return NextResponse.json({ headlines: mockHeadlines })
  } catch (error) {
    console.error('News API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    )
  }
}