'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Search, Mic, Globe, Brain, Zap, Shield, Users, Trophy, 
  Star, Target, TrendingUp, Award, Clock, Coins, Gem, Flame, MessageCircle
} from 'lucide-react'
// Dark theme removed; no ThemeToggle
import SearchResults from '@/components/SearchResults'
import { useVoiceSearch } from '@/hooks/useVoiceSearch'
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from '@/components/ui/dialog'
import AIResearchAssistant from '@/components/AIResearchAssistant'

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

// Mock list of UN-verified certification courses (richer prototype data)
const UN_CERTIFICATIONS = [
  {
    id: 'un-001',
    title: 'Media and Information Literacy (MIL) Basics',
    issuer: 'UNESCO / HANU-YOUTH',
    duration: '4 weeks',
    rating: 4.6,
    enrolled: 1245,
    syllabus: [
      'Introduction to MIL',
      'Verification & fact-checking',
      'Critical consumption of media',
      'Project: create a MIL campaign'
    ],
    description:
      'Foundational course on media literacy, critical thinking, and information verification aligned with UNESCO MIL competencies. Includes hands-on projects and micro-credentials.',
    url: '/courses/un/mil-basics',
    tags: ['MIL', 'Media', 'Verification']
  },
  {
    id: 'un-002',
    title: 'SDG Youth Leadership',
    issuer: 'UN Program Office / HANU-YOUTH',
    duration: '6 weeks',
    rating: 4.8,
    enrolled: 892,
    syllabus: ['SDG overview', 'Project design', 'Fundraising basics', 'Leading community projects'],
    description:
      'Practical leadership training to design and run SDG-aligned youth projects and initiatives. Certificate awarded on completion.',
    url: '/courses/un/sdg-leadership',
    tags: ['SDG', 'Leadership', 'Projects']
  },
  {
    id: 'un-003',
    title: 'Digital Safety & Privacy for Youth',
    issuer: 'UNICEF / HANU-YOUTH',
    duration: '3 weeks',
    rating: 4.5,
    enrolled: 1570,
    syllabus: ['Privacy basics', 'Account security', 'Reporting abuse', 'Safe behaviours online'],
    description:
      'Hands-on guidance for safe online behaviour, privacy controls, and reporting mechanisms. Useful for students and community leaders.',
    url: '/courses/un/digital-safety',
    tags: ['Safety', 'Privacy', 'Online']
  }
]

function UNVerifiedModal() {
  return (
    <div className="mb-6">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-black dark:text-white">UNESCO / UN Verified Courses</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Prototype list — click View to open the course page or Enroll to simulate enrollment.
        </p>
      </div>

      <div className="text-gray-900">
        <div className="mb-2 text-xs uppercase tracking-wide text-gray-500">Available courses: {UN_CERTIFICATIONS.length}</div>
        <div className="space-y-4" role="list">
          {UN_CERTIFICATIONS.length === 0 && (
            <div className="p-6 rounded-md border border-gray-200 text-gray-700">No courses available.</div>
          )}
          {UN_CERTIFICATIONS.map((course) => (
            <div
              key={course.id}
              className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-4"
              role="listitem"
            >
              <div className="flex items-start justify-between w-full gap-4">
                <div className="min-w-0">
                  <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{course.title}</div>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                      {course.issuer}
                    </span>
                    <span className="text-xs px-2 py-1 rounded bg-green-50 text-green-700">{course.duration}</span>
                    <span className="text-xs px-2 py-1 rounded bg-yellow-50 text-yellow-800">{course.rating} ★</span>
                    <span className="text-xs px-2 py-1 rounded bg-gray-50 text-gray-700">{course.enrolled} enrolled</span>
                  </div>
                  <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">{course.description}</p>

                  <div className="mt-3">
                    <div className="text-sm font-medium mb-1 text-gray-800 dark:text-gray-200">Syllabus</div>
                    <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300">
                      {course.syllabus.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <Button
                    onClick={() => window.location.href = course.url}
                    className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white"
                    title={`View ${course.title}`}
                    aria-label={`View ${course.title}`}
                  >
                    View
                  </Button>
                  <EnrollButton courseId={course.id} label="Enroll" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function EnrollButton({ courseId, label }: { courseId: string; label?: string }) {
  const key = `mock_enrolled_${courseId}`
  const [enrolled, setEnrolled] = useState<boolean>(() => {
    try {
      return Boolean(localStorage.getItem(key))
    } catch {
      return false
    }
  })

  function toggle() {
    try {
      if (enrolled) {
        localStorage.removeItem(key)
        setEnrolled(false)
      } else {
        localStorage.setItem(key, '1')
        setEnrolled(true)
      }
    } catch {
      setEnrolled(!enrolled)
    }
  }

  return (
    <button
      onClick={toggle}
      className={`px-3 py-1 rounded ${enrolled ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100'}`}
      aria-pressed={enrolled}
      title={enrolled ? 'Enrolled' : label}
    >
      {enrolled ? 'Enrolled' : label}
    </button>
  )
}

function VoiceResearchAssistant() {
  const [listening, setListening] = useState(false)
  const [isSupported, setIsSupported] = useState(true)
  const recognitionRef = useRef<any>(null)

  // Track TTS utterance so we can stop it on user request
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null)
  const [isSpeaking, setIsSpeaking] = useState(false)

  function stopSpeaking() {
    try {
      window.speechSynthesis.cancel()
    } catch (e) {
      /* ignore */
    }
    utterRef.current = null
    setIsSpeaking(false)
  }

  useEffect(() => {
    const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    if (!SR) {
      setIsSupported(false)
      return
    }

    // TypeScript may not include SpeechRecognition in all lib environments;
    // use `any` to avoid "Cannot find name 'SpeechRecognition'" while keeping runtime behavior.
    const rec: any = new SR()
    rec.lang = 'en-US' // change if you want multilingual detection
    rec.interimResults = false
    rec.maxAlternatives = 1

    rec.onresult = (event: any) => {
      const text = event?.results?.[0]?.[0]?.transcript?.trim()
      if (text) {
        // send the captured voice text to research API and speak response
        handleQuery(text)
      }
    }

    rec.onend = () => {
      // recognition stops by itself after silence — reflect UI
      setListening(false)
    }

    rec.onerror = (ev: any) => {
      console.error('Speech recognition error', ev)
      setListening(false)
    }

    recognitionRef.current = rec

    return () => {
      try {
        recognitionRef.current?.abort()
      } catch {}
      recognitionRef.current = null
      // stop any playing speech when component unmounts
      stopSpeaking()
    }
  }, [])

  async function handleQuery(query: string) {
    try {
      // fetch response from your research API
      const res = await fetch('/api/ai/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: query })
      })

      let text = ''
      if (res.ok) {
        const data = await res.json()
        text = (data?.response || data?.text || '').toString()
      } else {
        text = 'Sorry, I could not get a response.'
      }

      // speak the response only (voice-only)
      speakText(text)
    } catch (err) {
      console.error('Voice assistant error', err)
      speakText('An error occurred while processing your request.')
    }
  }

  function speakText(text: string) {
    if (!text) return
    try {
      // stop any existing speech then play new utterance
      stopSpeaking()
      const utter = new SpeechSynthesisUtterance(text)
      utter.lang = 'en-US'
      utter.onend = () => {
        utterRef.current = null
        setIsSpeaking(false)
      }
      utter.onerror = () => {
        utterRef.current = null
        setIsSpeaking(false)
      }
      utterRef.current = utter
      setIsSpeaking(true)
      window.speechSynthesis.speak(utter)
    } catch (e) {
      console.error('TTS failed', e)
    }
  }

  function toggleListening() {
    if (!recognitionRef.current) return
    if (listening) {
      try {
        recognitionRef.current.stop()
      } catch {}
      setListening(false)
      return
    }

    try {
      // start recognition and update UI
      recognitionRef.current.start()
      setListening(true)
    } catch (e) {
      console.error('Failed to start recognition', e)
      setListening(false)
    }
  }

  if (!isSupported) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-gray-400">Voice not supported in this browser.</p>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-8">
      <div className="relative flex items-center justify-center">
        {/* outer animated ring when listening */}
        {listening && (
          <div
            aria-hidden
            className="absolute w-48 h-48 rounded-full bg-purple-600/10 animate-ping"
            style={{ filter: 'blur(8px)' }}
          />
        )}

        {/* main mic circle */}
        <button
          type="button"
          onClick={toggleListening}
          aria-pressed={!!listening}
          aria-label={listening ? 'Stop listening' : 'Start voice assistant'}
          title={listening ? 'Stop' : 'Speak'}
          className={
            `relative z-10 flex items-center justify-center rounded-full shadow-lg focus:outline-none transition-transform ` +
            (listening
              ? 'w-32 h-32 bg-red-500 text-white scale-110 transform-gpu animate-pulse'
              : 'w-20 h-20 bg-gradient-to-r from-purple-600 to-cyan-600 text-white hover:scale-105')
          }
        >
          <Mic className={listening ? 'w-10 h-10' : 'w-6 h-6'} />
          {/* Visually-hidden live status for screen readers */}
          <span className="sr-only">{listening ? 'Listening' : 'Not listening'}</span>
        </button>

        {/* small stop button visible while assistant is speaking */}
        {isSpeaking && (
          <button
            type="button"
            onClick={stopSpeaking}
            aria-label="Stop speaking"
            className="absolute -bottom-20 z-20 px-4 py-2 rounded-full bg-gray-800/80 text-red-400 border border-red-500/40 hover:bg-gray-800"
          >
            Stop
          </button>
        )}

        {/* subtle hint below the mic (optional, very small) */}
        <div className="absolute -bottom-10 w-full text-center pointer-events-none">
          <div className="text-xs text-gray-400 select-none">
            {listening ? 'Listening...' : 'Tap to speak'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [hasSearched, setHasSearched] = useState(false)

  // 3D scroll scene ref
  const sceneRef = useRef<HTMLDivElement | null>(null)

  // Dark theme removed; force light

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    toggleListening,
    isSupported,
    error
  } = useVoiceSearch((transcript) => {
    setSearchQuery(transcript)
    // Auto-search when voice input is complete
    if (transcript.trim()) {
      performSearch(transcript)
    }
  })

  const performSearch = async (query: string) => {
    if (query.trim()) {
      setIsLoading(true)
      setHasSearched(true)
      
      try {
        const response = await fetch('/api/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: query,
            category: selectedCategory === 'all' ? undefined : selectedCategory,
            limit: 10
          }),
        })

        if (!response.ok) {
          throw new Error('Search failed')
        }

        const data = await response.json()
        setSearchResults(data.results)
      } catch (error) {
        console.error('Search error:', error)
        setSearchResults([])
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    await performSearch(searchQuery)
  }

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category)
    if (searchQuery.trim() && hasSearched) {
      // Re-search with new category
      setIsLoading(true)
      setTimeout(async () => {
        try {
          const response = await fetch('/api/search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              query: searchQuery,
              category: category === 'all' ? undefined : category,
              limit: 10
            }),
          })

          if (!response.ok) {
            throw new Error('Search failed')
          }

          const data = await response.json()
          setSearchResults(data.results)
        } catch (error) {
          console.error('Search error:', error)
          setSearchResults([])
        } finally {
          setIsLoading(false)
        }
      }, 300)
    }
  }

  // Reveal-on-scroll: fade/slide cards into view, staggered
  useEffect(() => {
    let observer: IntersectionObserver | null = null

    function init() {
      const els = Array.from(document.querySelectorAll<HTMLElement>('.reveal-on-scroll'))
      if (!els.length) return

      const baseDelay = 120 // ms between items (stagger)
      const duration = 1200 // ms animation duration (slow fade)

      // set per-element CSS variables for stagger + duration
      els.forEach((el, i) => {
        el.style.setProperty('--reveal-delay', `${i * baseDelay}ms`)
        el.style.setProperty('--reveal-duration', `${duration}ms`)
      })

      observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const el = entry.target as HTMLElement
              el.classList.add('reveal-visible')
              obs.unobserve(el)
            }
          })
        },
        { threshold: 0.08 }
      )

      els.forEach((el) => observer!.observe(el))
    }

    // slight delay to ensure dynamic DOM (search results, dialogs) ready
    const id = window.setTimeout(init, 60)

    return () => {
      window.clearTimeout(id)
      if (observer) observer.disconnect()
    }
  }, [hasSearched, searchResults.length])

  // Subtle scroll-linked animation (updates CSS var --scroll)
  useEffect(() => {
    const onScroll = () => {
      const y = Math.min(window.scrollY, 800) // clamp
      const v = y / 800
      document.documentElement.style.setProperty('--scroll', String(v))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className={`min-h-screen bg-white text-black`}>

      {/* NAVBAR */}
      <nav className={`w-full aws-header border-b border-gray-200 sticky top-0 z-40 backdrop-blur glow`}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="text-lg font-bold">HANU-YOUTH</div>
          </div>

          <div className="hidden sm:flex items-center gap-6 text-sm">
            <button className="px-2 py-1 rounded-md cursor-pointer">Home</button>
            <button className="px-2 py-1 rounded-md cursor-pointer" onClick={() => window.location.href = '/research-hub'}>Research</button>
            <button className="px-2 py-1 rounded-md cursor-pointer" onClick={() => window.location.href = '/global-awareness'}>Global awareness</button>
            <button className="px-2 py-1 rounded-md cursor-pointer" onClick={() => window.location.href = 'https://teamhanu.netlify.app'}>About</button>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="icon"
              variant="outline"
              aria-label="Chat"
              title="Chat"
              onClick={() => (window.location.href = '/chat')}
              className="text-black hover:ring-gray-300/60 hover:ring-[2px] hover:ring-offset-1 hover:ring-offset-white hover:border-gray-300"
            >
              <MessageCircle className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => window.location.href = '/signup'}>Sign up</Button>
            <Button size="sm" variant="default" onClick={() => window.location.href = '/signin'}>Sign in</Button>
          </div>
        </div>
      </nav>

      {/* Fixed 3D background (grid + glow) */}
      <div className="aws-3d-bg pointer-events-none" aria-hidden="true">
        <div className="aws-layer aws-grid" />
        <div className="aws-layer aws-glow" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12 aws-tilt">
          <div className="mb-6">
            <h1 className="text-4xl md:text-5xl font-bold mb-2 text-slate-900">HANU-YOUTH</h1>
            <p className="text-lg md:text-xl subtext mb-2">HUMAN-AI FOR NEXUS UNIFICATION</p>
            <p className="text-base text-slate-600">
              "Empowering Global Youth by uniting knowledge, innovation, and communities into one hub."
            </p>
          </div>
        </header>

        {/* Voice Search Status */}
        {error && (
          <div className="max-w-4xl mx-auto mb-4">
            <Card className="bg-red-900/20 border-red-500/50">
              <CardContent className="p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {isListening && (
          <div className="max-w-4xl mx-auto mb-4">
            <Card className="bg-cyan-900/20 border-cyan-500/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
                  <p className="text-cyan-400">Listening... {transcript && `"${transcript}"`}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Search Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Knowledge Nexus Search</CardTitle>
              <CardDescription className="text-slate-600">
                Access authentic global research, UN agendas, and innovation resources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-6">
                <Input
                  type="text"
                  placeholder="Search research papers, UN reports, global events..."
                  value={transcript || searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={toggleListening}
                    disabled={!isSupported}
                    variant="default"
                    size="icon"
                    aria-label={isSupported ? "Click to speak" : "Voice search not supported"}
                    title={isSupported ? "Click to speak" : "Voice search not supported"}
                    className="text-black hover:ring-gray-300/60 hover:ring-[2px] hover:ring-offset-1 hover:ring-offset-white hover:border-gray-300"
                  >
                    <Mic className="w-4 h-4" />
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    size="icon"
                    aria-label={isLoading ? 'Searching...' : 'Search'}
                    title={isLoading ? 'Searching...' : 'Search'}
                    className="text-black hover:ring-gray-300/60 hover:ring-[2px] hover:ring-offset-1 hover:ring-offset-white hover:border-gray-300"
                  >
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </form>

              {/* Quick Search Categories */}
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  { key: 'all', label: 'All Results', color: 'border-purple-500/50 text-white bg-black' },
                  { key: 'research', label: 'Research Papers', color: 'border-purple-500/50 text-purple-400' },
                  { key: 'un_report', label: 'UN Reports', color: 'border-cyan-500/50 text-cyan-400' },
                  { key: 'event', label: 'Events', color: 'border-green-500/50 text-green-400' },
                  { key: 'innovation', label: 'ReVibe Lab', color: 'border-pink-500/50 text-pink-400', url: 'https://reviber.netlify.app' }
                ].map((category) => (
                  <Button
                    key={category.key}
                    variant={selectedCategory === category.key ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => (category as any).url ? (window.location.href = (category as any).url) : handleCategoryClick(category.key)}
                    title={category.label}
                    aria-label={category.label}
                  >
                    {category.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Results */}
        {hasSearched && (
          <div className="max-w-6xl mx-auto mb-16">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Search Results</h2>
              <p className="text-slate-600">
                {isLoading ? 'Searching across global knowledge bases...' : `Found ${searchResults.length} results for "${searchQuery}"`}
              </p>
            </div>
            <SearchResults results={searchResults} isLoading={isLoading} />
          </div>
        )}

        {/* Feature Cards - Only show if no search has been performed */}
        {!hasSearched && (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              <Card className="cursor-pointer" onClick={() => (window.location.href = '/research-hub')}>
                <CardHeader>
                  <CardTitle className="flex flex-col justify-center gap-5">
                    <Brain className="w-6 h-6" />
                    Research Hub
                  </CardTitle>
                  <CardDescription className="h-6 w-full gap-5">
                    Access verified academic papers, UN reports, and global research repositories
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="cursor-pointer" onClick={()=>(window.location.href='/global-awareness')}>
                <CardHeader>
                  <CardTitle className="flex flex-col justify-center gap-5">
                    <Globe className="w-6 h-6" />
                    Global Awareness
                  </CardTitle>
                  <CardDescription>
                    Stay updated with UN agendas, MUN events, and worldwide conferences
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="cursor-pointer" onClick={() => (window.location.href = 'https://reviber.netlify.app')}>
                <CardHeader>
                  <CardTitle className="flex flex-col justify-center gap-5">
                    <Zap className="w-6 h-6" />
                    ReVibe Lab
                  </CardTitle>
                  <CardDescription>
                    Transform waste materials into innovative products with AI guidance
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="cursor-pointer" onClick={() => window.location.href = '/learning-hub'}>
                <CardHeader>
                  <CardTitle className="flex flex-col justify-center gap-5">
                    <Users className="w-6 h-6" />
                    Learning Hub
                  </CardTitle>
                  <CardDescription>
                    Gamified learning paths with AI-driven feedback and global rankings
                  </CardDescription>
                </CardHeader>
              </Card>

              <Dialog>
                <DialogTrigger asChild>
                  <Card className="cursor-pointer">
                    <CardHeader>
                      <CardTitle className="flex flex-col justify-center gap-5">
                        <Shield className="w-6 h-6" />
                        UN Verified
                      </CardTitle>
                      <CardDescription>
                        Earn certifications and badges recognized by UNESCO and UN frameworks
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </DialogTrigger>
                <DialogContent className="max-w-3xl w-[90vw] max-h-[80vh] bg-white p-6 rounded-lg overflow-y-auto scrollbar-hide">
                  <DialogTitle className="text-lg font-semibold text-black mb-5">UNESCO Verified Courses</DialogTitle>
                  <UNVerifiedModal />
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Card className="cursor-pointer">
                    <CardHeader>
                      <CardTitle className="flex flex-col justify-center gap-5">
                        <Mic className="w-6 h-6" />
                        Voice Assistant
                      </CardTitle>
                      <CardDescription className="flex flex-col gap-3">
                        Multilingual voice-enabled AI assistant for seamless interaction
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogTitle className="text-lg font-semibold text-black mb-2">Voice Assistant</DialogTitle>
                  <VoiceResearchAssistant />
                </DialogContent>
              </Dialog>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              <Card className="cursor-pointer" onClick={() => window.location.href = '/quiz'}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Target className="w-6 h-6" />
                    <CardTitle>Test quiz</CardTitle>
                  </div>
                  <CardDescription>A feature to test your knowledge and earn points</CardDescription>
                </CardHeader>
              </Card>

              <Card className="cursor-pointer" onClick={() => window.location.href = '/streaks'}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Flame className="w-6 h-6" />
                    <CardTitle>My Streak</CardTitle>
                  </div>
                  <CardDescription>A feature to see your consistency in learning</CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="cursor-pointer" onClick={() => window.location.href = '/levels'}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Star className="w-6 h-6" />
                    <CardTitle>My Level</CardTitle>
                  </div>
                  <CardDescription>A feature to let you know current level, XP and achievements</CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="cursor-pointer" onClick={() => window.location.href = 'https://teamhanu.netlify.app'}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-black" />
                    <CardTitle>Join Team</CardTitle>
                  </div>
                  <CardDescription>Click to see our team portfolio and connect with us</CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="cursor-pointer" onClick={() => window.location.href = '/economy'}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Coins className="w-6 h-6" />
                    <CardTitle>Virtual Economy</CardTitle>
                  </div>
                  <CardDescription>Earn coins and gems, shop for exclusive items, and build your wealth!</CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="cursor-pointer" onClick={() => window.location.href = '/leaderboard'}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-6 h-6" />
                    <CardTitle>Leaderboard</CardTitle>
                  </div>
                  <CardDescription>Click to know who is on the top and try to overcome them</CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="cursor-pointer" onClick={() => window.location.href = '/research'}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Brain className="w-6 h-6" />
                    <CardTitle>AI Research</CardTitle>
                  </div>
                  <CardDescription>AI feature to help you get researches easily using AI</CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="cursor-pointer" onClick={() => window.location.href = '/games'}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Zap className="w-6 h-6" />
                    <CardTitle>Games hub</CardTitle>
                  </div>
                  <CardDescription>For the youths enjoyment and better learning</CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="cursor-pointer" onClick={() => window.location.href = '/ai-assistant'}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Brain className="w-6 h-6" />
                    <CardTitle>AI Assistant</CardTitle>
                  </div>
                  <CardDescription>An AI assistant that responds in voice and communicates by talking</CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="cursor-pointer" onClick={() => window.location.href = '/chat'}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Brain className="w-6 h-6" />
                    <CardTitle>Chat</CardTitle>
                  </div>
                  <CardDescription>To connect with new people and learn new things for better understanding</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </>
        )}

        {/* Call to Action */}
        {!hasSearched && (
          <div className="text-center">
            <Button className="px-12 py-4 text-lg text-black">
              Join the Global Youth Movement
            </Button>
            <p className="mt-4 text-slate-600">
              UNESCO Media and Information Literacy (MIL) Compliant Platform
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

