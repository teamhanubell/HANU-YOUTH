import { NextRequest, NextResponse } from 'next/server'

// Force static export for this route
export const dynamic = "force-static"

export async function POST(request: NextRequest) {
  try {
    const { text, targetLanguage, sourceLanguage = 'auto' } = await request.json()
    
    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: 'Text and target language are required' },
        { status: 400 }
      )
    }

    // Mock translation for static export
    const mockTranslation = {
      originalText: text,
      translatedText: `[Translated to ${targetLanguage}]: ${text}`,
      sourceLanguage: sourceLanguage === 'auto' ? 'en' : sourceLanguage,
      targetLanguage,
      confidence: 0.95,
      detectedLanguage: sourceLanguage === 'auto' ? 'en' : sourceLanguage
    }
    
    return NextResponse.json(mockTranslation)
  } catch (error) {
    console.error('Translation error:', error)
    return NextResponse.json(
      { error: 'Failed to translate text' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Mock supported languages for static export
    const mockLanguages = [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Spanish' },
      { code: 'fr', name: 'French' },
      { code: 'de', name: 'German' },
      { code: 'it', name: 'Italian' },
      { code: 'pt', name: 'Portuguese' },
      { code: 'ru', name: 'Russian' },
      { code: 'zh', name: 'Chinese' },
      { code: 'ja', name: 'Japanese' },
      { code: 'ko', name: 'Korean' },
      { code: 'ar', name: 'Arabic' },
      { code: 'hi', name: 'Hindi' }
    ]
    
    return NextResponse.json({ languages: mockLanguages })
  } catch (error) {
    console.error('Get languages error:', error)
    return NextResponse.json(
      { error: 'Failed to get supported languages' },
      { status: 500 }
    )
  }
}