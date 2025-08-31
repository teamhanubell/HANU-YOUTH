// Voice Recognition Service (STT)
export class VoiceRecognitionService {
  private recognition: any = null
  private isListening: boolean = false
  private onResult: ((transcript: string) => void) | null = null
  private onError: ((error: string) => void) | null = null
  private onEnd: (() => void) | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeRecognition()
    }
  }

  private initializeRecognition() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition()
      this.recognition.continuous = false
      this.recognition.interimResults = true
      this.recognition.lang = 'en-US'

      this.recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result) => result.transcript)
          .join('')
        
        if (this.onResult) {
          this.onResult(transcript)
        }
      }

      this.recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        if (this.onError) {
          this.onError(event.error)
        }
      }

      this.recognition.onend = () => {
        this.isListening = false
        if (this.onEnd) {
          this.onEnd()
        }
      }
    }
  }

  startListening(
    onResult: (transcript: string) => void,
    onError: (error: string) => void,
    onEnd: () => void,
    language: string = 'en-US'
  ) {
    if (!this.recognition) {
      onError('Speech recognition not supported')
      return
    }

    this.onResult = onResult
    this.onError = onError
    this.onEnd = onEnd

    this.recognition.lang = language
    this.recognition.start()
    this.isListening = true
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
    }
  }

  isSupported(): boolean {
    return typeof window !== 'undefined' && (
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    )
  }

  getSupportedLanguages(): string[] {
    return [
      'en-US', 'en-GB', 'es-ES', 'fr-FR', 'de-DE', 'it-IT', 'pt-BR', 'ru-RU',
      'zh-CN', 'ja-JP', 'ko-KR', 'ar-SA', 'hi-IN', 'bn-IN', 'ta-IN', 'te-IN'
    ]
  }
}

// Text-to-Speech Service (TTS)
export class TextToSpeechService {
  private synth: SpeechSynthesis | null = null
  private voices: SpeechSynthesisVoice[] = []
  private currentUtterance: SpeechSynthesisUtterance | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      this.synth = window.speechSynthesis
      this.loadVoices()
    }
  }

  private loadVoices() {
    if (this.synth) {
      this.voices = this.synth.getVoices()
      
      // Chrome loads voices asynchronously
      if (this.voices.length === 0) {
        this.synth.onvoiceschanged = () => {
          this.voices = this.synth!.getVoices()
        }
      }
    }
  }

  speak(
    text: string,
    options: {
      language?: string
      rate?: number
      pitch?: number
      volume?: number
      voice?: string
    } = {}
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synth) {
        reject(new Error('Speech synthesis not supported'))
        return
      }

      // Stop any current speech
      this.stop()

      const utterance = new SpeechSynthesisUtterance(text)
      
      // Set default options
      utterance.rate = options.rate || 1
      utterance.pitch = options.pitch || 1
      utterance.volume = options.volume || 1
      
      // Set language
      if (options.language) {
        utterance.lang = options.language
      }

      // Find voice by name or language
      if (options.voice) {
        const voice = this.voices.find(v => v.name === options.voice)
        if (voice) {
          utterance.voice = voice
        }
      } else if (options.language) {
        const voice = this.voices.find(v => v.lang === options.language)
        if (voice) {
          utterance.voice = voice
        }
      }

      utterance.onend = () => {
        this.currentUtterance = null
        resolve()
      }

      utterance.onerror = (event) => {
        this.currentUtterance = null
        reject(new Error(`Speech synthesis error: ${event.error}`))
      }

      this.currentUtterance = utterance
      this.synth.speak(utterance)
    })
  }

  stop() {
    if (this.synth) {
      this.synth.cancel()
    }
  }

  pause() {
    if (this.synth) {
      this.synth.pause()
    }
  }

  resume() {
    if (this.synth) {
      this.synth.resume()
    }
  }

  isSpeaking(): boolean {
    return this.synth ? this.synth.speaking : false
  }

  isPaused(): boolean {
    return this.synth ? this.synth.paused : false
  }

  getVoices(): SpeechSynthesisVoice[] {
    return this.voices
  }

  getVoiceByLanguage(language: string): SpeechSynthesisVoice | null {
    return this.voices.find(voice => voice.lang === language) || null
  }

  getVoiceByName(name: string): SpeechSynthesisVoice | null {
    return this.voices.find(voice => voice.name === name) || null
  }

  // Get natural sounding voices
  getNaturalVoices(): SpeechSynthesisVoice[] {
    return this.voices.filter(voice => 
      voice.name.includes('Natural') || 
      voice.name.includes('Premium') ||
      voice.name.includes('Google') ||
      voice.name.includes('Microsoft')
    )
  }
}

// Translation Service
export class TranslationService {
  private baseUrl: string
  private apiKey: string

  constructor(baseUrl: string = 'https://libretranslate.de', apiKey: string = '') {
    this.baseUrl = baseUrl
    this.apiKey = apiKey
  }

  async translate(
    text: string,
    targetLanguage: string,
    sourceLanguage: string = 'auto'
  ): Promise<{ translatedText: string; detectedLanguage?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: sourceLanguage,
          target: targetLanguage,
          format: 'text',
          api_key: this.apiKey
        })
      })

      if (!response.ok) {
        throw new Error(`Translation failed: ${response.statusText}`)
      }

      const data = await response.json()
      return {
        translatedText: data.translatedText,
        detectedLanguage: sourceLanguage === 'auto' ? data.detectedLanguage : undefined
      }
    } catch (error) {
      console.error('Translation error:', error)
      throw error
    }
  }

  async detectLanguage(text: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/detect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          api_key: this.apiKey
        })
      })

      if (!response.ok) {
        throw new Error(`Language detection failed: ${response.statusText}`)
      }

      const data = await response.json()
      return data[0]?.language || 'en'
    } catch (error) {
      console.error('Language detection error:', error)
      throw error
    }
  }

  async getSupportedLanguages(): Promise<Array<{ code: string; name: string }>> {
    try {
      const response = await fetch(`${this.baseUrl}/languages`)
      
      if (!response.ok) {
        throw new Error(`Failed to get languages: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Get languages error:', error)
      throw error
    }
  }
}

// News Verification Service
export class NewsVerificationService {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async searchNews(
    query: string,
    options: {
      language?: string
      country?: string
      from?: string
      to?: string
      sortBy?: string
      maxResults?: number
    } = {}
  ): Promise<any[]> {
    try {
      const params = new URLSearchParams()
      params.append('q', query)
      params.append('apiKey', this.apiKey)
      
      // Add optional parameters
      if (options.language) params.append('language', options.language)
      if (options.country) params.append('country', options.country)
      if (options.from) params.append('from', options.from)
      if (options.to) params.append('to', options.to)
      if (options.sortBy) params.append('sortBy', options.sortBy)
      if (options.maxResults) params.append('max', options.maxResults.toString())

      const response = await fetch(`https://gnews.io/api/v4/search?${params}`)
      
      if (!response.ok) {
        throw new Error(`News search failed: ${response.statusText}`)
      }

      const data = await response.json()
      return data.articles || []
    } catch (error) {
      console.error('News search error:', error)
      throw error
    }
  }

  async getTopHeadlines(
    options: {
      language?: string
      country?: string
      category?: string
      maxResults?: number
    } = {}
  ): Promise<any[]> {
    try {
      const params = new URLSearchParams()
      params.append('apiKey', this.apiKey)
      
      // Add optional parameters
      if (options.language) params.append('language', options.language)
      if (options.country) params.append('country', options.country)
      if (options.category) params.append('category', options.category)
      if (options.maxResults) params.append('max', options.maxResults.toString())

      const response = await fetch(`https://gnews.io/api/v4/top-headlines?${params}`)
      
      if (!response.ok) {
        throw new Error(`Failed to get headlines: ${response.statusText}`)
      }

      const data = await response.json()
      return data.articles || []
    } catch (error) {
      console.error('Get headlines error:', error)
      throw error
    }
  }

  async verifyArticle(url: string): Promise<{ isVerified: boolean; confidence: number; sources: string[] }> {
    try {
      // This is a simplified verification process
      // In a real implementation, you would use more sophisticated fact-checking APIs
      const response = await fetch(`/api/verify-news`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url })
      })

      if (!response.ok) {
        throw new Error(`Verification failed: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Article verification error:', error)
      throw error
    }
  }
}

// Event Service (Eventbrite integration)
export class EventServiceExternal {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async searchEvents(
    query: string,
    options: {
      location?: string
      startDate?: string
      endDate?: string
      categories?: string[]
      maxResults?: number
    } = {}
  ): Promise<any[]> {
    try {
      // This would integrate with Eventbrite API
      // For now, we'll return mock data
      const mockEvents = [
        {
          id: '1',
          name: 'UN Youth Climate Summit',
          description: 'Global youth summit focusing on climate action and sustainability',
          start_time: '2024-09-15T09:00:00Z',
          end_time: '2024-09-17T18:00:00Z',
          venue: {
            name: 'United Nations Headquarters',
            address: 'New York, NY'
          },
          is_free: true,
          category: 'Conference'
        },
        {
          id: '2',
          name: 'AI for Good Hackathon',
          description: '48-hour hackathon to develop AI solutions for social good',
          start_time: '2024-10-01T09:00:00Z',
          end_time: '2024-10-03T18:00:00Z',
          venue: {
            name: 'Tech Innovation Center',
            address: 'San Francisco, CA'
          },
          is_free: false,
          category: 'Hackathon'
        }
      ]

      return mockEvents.filter(event => 
        event.name.toLowerCase().includes(query.toLowerCase()) ||
        event.description.toLowerCase().includes(query.toLowerCase())
      )
    } catch (error) {
      console.error('Event search error:', error)
      throw error
    }
  }
}