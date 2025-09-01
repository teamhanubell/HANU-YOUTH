import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { prompt, category } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // Mock research response for static export
    const mockResponse = `This is a research response about "${prompt}". 

${category ? `[Category: ${category}]` : ''}

In a real deployment, this would use the  to generate comprehensive research responses. The static export version provides a placeholder response that demonstrates the expected format and functionality.

Key points about this topic:
- Research shows significant developments in this area
- Multiple studies indicate growing importance
- Further investigation is recommended for detailed analysis

For more detailed and accurate information, please deploy the full version with AI services enabled.`

    return NextResponse.json({
      response: mockResponse,
      category,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Research API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate research response' },
      { status: 500 }
    )
  }
}