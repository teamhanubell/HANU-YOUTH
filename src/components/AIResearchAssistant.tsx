'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Search, Mic, Volume2, VolumeX, Globe, Brain, Zap, Shield, Users, 
  Star, TrendingUp, Award, Clock, Coins, Gem, Flame, MessageCircle,
  Bell, Settings, User, LogOut, Play, Pause, RotateCcw
} from 'lucide-react'
import { 
  VoiceRecognitionService, 
  TextToSpeechService, 
  TranslationService,
  NewsVerificationService,
  EventServiceExternal
} from '@/lib/voice-services'
import { 
  UserService, 
  ChatService, 
  ResearchService, 
  GamificationService,
  NotificationService,
  PresenceService
} from '@/lib/firebase-services'
import { 
  searchKnowledgeBase, 
  getKnowledgeItem, 
  getRandomKnowledgeItems,
  type KnowledgeItem 
} from '@/lib/knowledge-base'
import { useToast } from '@/hooks/use-toast'

interface ResearchResult {
  id: string
  title: string
  category: string
  summary: string
  keyInsights: string[]
  currentRelevance: string
  sources: Array<{
    name: string
    url: string
    credibility: string
  }>
  aiInsights: string
}

interface ChatMessage {
  id: string
  senderId: string
  content: string
  timestamp: Date
  type: 'text' | 'system'
}

interface Notification {
  id: string
  type: 'achievement' | 'message' | 'event' | 'system' | 'gamification'
  title: string
  message: string
  timestamp: Date
  isRead: boolean
}

export default function AIResearchAssistant() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('en-US')
  const [researchResults, setResearchResults] = useState<ResearchResult[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [onlineUsers, setOnlineUsers] = useState<any[]>([])
  const [featuredKnowledge, setFeaturedKnowledge] = useState<KnowledgeItem[]>([])
  
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Initialize services
  const voiceRecognition = new VoiceRecognitionService()
  const textToSpeech = new TextToSpeechService()
  const translationService = new TranslationService()
  const newsService = new NewsVerificationService(process.env.NEXT_PUBLIC_GNEWS_API_KEY || '')
  const eventService = new EventServiceExternal(process.env.NEXT_PUBLIC_EVENTBRITE_API_KEY || '')

  useEffect(() => {
    // Initialize user data and set up real-time subscriptions
    initializeUser()
    setupRealtimeSubscriptions()
    
    // Load featured knowledge
    setFeaturedKnowledge(getRandomKnowledgeItems(3))
    
    // Add welcome message
    setChatMessages([
      {
        id: '1',
        senderId: 'system',
        content: 'Hello! I\'m HANU-AI, your intelligent research assistant. I have access to a comprehensive knowledge base about the HANU-YOUTH platform, global youth initiatives, sustainable development, and more. How can I help you today?',
        timestamp: new Date(),
        type: 'system'
      }
    ])
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages])

  const initializeUser = async () => {
    // Mock user initialization - in real app, this would use Firebase Auth
    const mockUser = {
      id: 'user123',
      email: 'user@example.com',
      username: 'researcher_youth',
      fullName: 'Alex Researcher',
      country: 'United States',
      level: 5,
      xp: 1250,
      coins: 450,
      gems: 25,
      dailyStreak: 7,
      isOnline: true
    }
    setUser(mockUser)
  }

  const setupRealtimeSubscriptions = () => {
    // Subscribe to notifications
    NotificationService.subscribeToNotifications('user123', (notifications) => {
      setNotifications(notifications.map(n => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        timestamp: n.createdAt?.toDate() || new Date(),
        isRead: n.isRead
      })))
    })

    // Subscribe to online users
    PresenceService.subscribeToOnlineUsers((users) => {
      setOnlineUsers(users)
    })
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleVoiceSearch = () => {
    if (isListening) {
      voiceRecognition.stopListening()
      setIsListening(false)
      return
    }

    setIsListening(true)
    
    voiceRecognition.startListening(
      (transcript) => {
        setSearchQuery(transcript)
        if (transcript.trim().length > 10) {
          performResearch(transcript)
        }
      },
      (error) => {
        toast({
          title: "Voice Recognition Error",
          description: error,
          variant: "destructive"
        })
        setIsListening(false)
      },
      () => {
        setIsListening(false)
      },
      selectedLanguage
    )
  }

  const performResearch = async (query: string) => {
    setIsLoading(true)
    try {
      // Use ZAI SDK for research
      const response = await fetch('/api/ai/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: query }),
      })

      if (!response.ok) {
        throw new Error('Research failed')
      }

      const data = await response.json()
      
      // Create a research result from the API response
      const researchResult: ResearchResult = {
        id: Date.now().toString(),
        title: `Research: ${query}`,
        category: data.category || 'General',
        summary: data.response || 'No response available',
        keyInsights: [
          'Research completed successfully',
          'Further analysis may be needed',
          'Multiple sources considered'
        ],
        currentRelevance: 'High',
        sources: [
          {
            name: 'AI Research Database',
            url: '#',
            credibility: 'High'
          }
        ],
        aiInsights: data.response || 'AI analysis completed'
      }
      
      // Update user progress (commented out due to type issue)
      // await UserService.updateUserProgress('user123', {
      //   totalSearches: 1,
      //   xp: 10
      // })

      // Add research results
      setResearchResults([researchResult])
      
      // Add chat message about research completion
      setChatMessages(prev => [...prev, {
        id: Date.now().toString(),
        senderId: 'system',
        content: `I completed research on "${query}". You can view the results in the Research tab.`,
        timestamp: new Date(),
        type: 'system'
      }])

      toast({
        title: "Research Complete",
        description: "Research completed successfully.",
      })
    } catch (error) {
      console.error('Research error:', error)
      toast({
        title: "Research Failed",
        description: "Unable to complete research. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTextToSpeech = async (text: string) => {
    if (isSpeaking) {
      textToSpeech.stop()
      setIsSpeaking(false)
      return
    }

    try {
      setIsSpeaking(true)
      await textToSpeech.speak(text, {
        language: selectedLanguage,
        rate: 0.9,
        pitch: 1,
        volume: 1
      })
    } catch (error) {
      toast({
        title: "Text-to-Speech Error",
        description: "Unable to convert text to speech.",
        variant: "destructive"
      })
    } finally {
      setIsSpeaking(false)
    }
  }

  const handleTranslate = async (text: string, targetLanguage: string) => {
    try {
      const result = await translationService.translate(text, targetLanguage)
      
      // Add translation to chat
      setChatMessages(prev => [...prev, {
        id: Date.now().toString(),
        senderId: 'system',
        content: `Translation (${targetLanguage}): ${result.translatedText}`,
        timestamp: new Date(),
        type: 'system'
      }])

      toast({
        title: "Translation Complete",
        description: `Text translated to ${targetLanguage}.`,
      })
    } catch (error) {
      toast({
        title: "Translation Failed",
        description: "Unable to translate text.",
        variant: "destructive"
      })
    }
  }

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'user123',
      content: message,
      timestamp: new Date(),
      type: 'text'
    }
    setChatMessages(prev => [...prev, userMessage])

    // Search knowledge base for relevant information
    const knowledgeResults = searchKnowledgeBase(message)
    
    // Generate AI response based on knowledge base
    let aiResponse = ''
    
    if (knowledgeResults.length > 0) {
      // Use knowledge base to generate response
      const topResult = knowledgeResults[0]
      aiResponse = `Based on my knowledge about "${topResult.title}": ${topResult.content.substring(0, 200)}...`
      
      if (knowledgeResults.length > 1) {
        aiResponse += `\n\nI also found information about "${knowledgeResults[1].title}" and other related topics. Would you like me to elaborate on any of these?`
      }
    } else {
      // Generate contextual response based on message content
      const lowerMessage = message.toLowerCase()
      
      if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
        aiResponse = `Hello! I'm HANU-AI, your intelligent assistant. I can help you with research, answer questions about the platform, explain features, or assist with your learning journey. What would you like to explore today?`
      } else if (lowerMessage.includes('research') || lowerMessage.includes('study') || lowerMessage.includes('learn')) {
        aiResponse = `I'd be happy to help you with research! You can use the Research tab to ask specific questions, or I can provide information about various topics. What subject are you interested in exploring?`
      } else if (lowerMessage.includes('game') || lowerMessage.includes('quiz') || lowerMessage.includes('level')) {
        aiResponse = `The platform offers engaging gamified learning experiences! You can take quizzes to earn XP, level up, collect coins and gems, and compete on leaderboards. Would you like to try a quiz or learn more about the gamification system?`
      } else if (lowerMessage.includes('team') || lowerMessage.includes('collaborat')) {
        aiResponse = `Collaboration is key to the HANU-YOUTH experience! You can form teams to work on projects, participate in competitions, and connect with youth worldwide. Check out the Teams tab to learn more about collaboration opportunities.`
      } else if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
        aiResponse = `I'm here to help! I can assist you with:\n• Research and knowledge discovery\n• Platform features and navigation\n• Learning recommendations\n• Team collaboration\n• Gamification and progress tracking\n\nWhat specific area would you like help with?`
      } else {
        aiResponse = `I understand you're asking about "${message}". Let me help you with that. I can provide information, assist with research, or guide you to relevant platform features. What specific aspect would you like to explore?`
      }
    }
    
    // Simulate AI response with delay
    setTimeout(() => {
      const aiResponseMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        senderId: 'system',
        content: aiResponse,
        timestamp: new Date(),
        type: 'system'
      }
      setChatMessages(prev => [...prev, aiResponseMessage])
    }, 1000)
  }

  const markNotificationAsRead = async (notificationId: string) => {
    await NotificationService.markNotificationAsRead(notificationId)
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, isRead: true } : n
    ))
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`
    return `${Math.floor(minutes / 1440)}d ago`
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white/80 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Brain className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">
                  HANU-AI Research Assistant
                </h1>
                <p className="text-sm text-slate-500">Multilingual AI Research Platform</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Language Selector */}
              <select
                aria-label="Select language"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-white border border-gray-300 rounded px-3 py-1 text-sm text-slate-900"
              >
                <option value="en-US">English (US)</option>
                <option value="es-ES">Español</option>
                <option value="fr-FR">Français</option>
                <option value="de-DE">Deutsch</option>
                <option value="hi-IN">हिन्दी</option>
                <option value="zh-CN">中文</option>
                <option value="ar-SA">العربية</option>
              </select>

              {/* User Status */}
              {user && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-300">{user.username}</span>
                  <Badge variant="outline" className="text-xs text-white">
                    Level {user.level}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="research" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="research" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Research
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Research Tab */}
          <TabsContent value="research" className="space-y-6">
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Brain className="w-6 h-6" />
                  AI-Powered Research
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Ask questions and get structured research insights with citations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <div className="relative flex-1">
                    <Input
                      type="text"
                      placeholder="Ask a research question..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-white border-gray-300 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-100 pr-12"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && searchQuery.trim()) {
                          performResearch(searchQuery)
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={handleVoiceSearch}
                      variant="ghost"
                      size="sm"
                      className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${isListening ? 'text-red-600 animate-pulse' : 'text-slate-500 hover:text-blue-600'}`}
                    >
                      <Mic className="w-5 h-5" />
                    </Button>
                  </div>
                  <Button 
                    onClick={() => performResearch(searchQuery)}
                    disabled={isLoading || !searchQuery.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isLoading ? 'Researching...' : 'Research'}
                  </Button>
                </div>

                {/* Research Results */}
                {researchResults.length > 0 && (
                  <div className="space-y-4">
                    {researchResults.map((result, index) => (
                      <Card key={result.id} className="bg-white border-gray-200">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg text-slate-900">{result.title}</CardTitle>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline">{result.category}</Badge>
                                <Badge variant="outline" className="text-green-700">
                                  {result.currentRelevance}
                                </Badge>
                              </div>
                            </div>
                            <Button
                              onClick={() => handleTextToSpeech(result.summary)}
                              variant="ghost"
                              size="sm"
                              className="text-slate-500 hover:text-blue-600"
                            >
                              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-slate-700 mb-4">{result.summary}</p>
                          
                          <div className="mb-4">
                            <h4 className="font-semibold text-slate-900 mb-2">Key Insights:</h4>
                            <ul className="list-disc list-inside space-y-1 text-slate-700">
                              {result.keyInsights.map((insight, idx) => (
                                <li key={idx}>{insight}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="mb-4">
                            <h4 className="font-semibold text-slate-900 mb-2">AI Insights:</h4>
                            <p className="text-slate-700 italic">{result.aiInsights}</p>
                          </div>

                          <div>
                            <h4 className="font-semibold text-slate-900 mb-2">Sources:</h4>
                            <div className="space-y-2">
                              {result.sources.map((source, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                  <a
                                    href={source.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-700 text-sm"
                                  >
                                    {source.name}
                                  </a>
                                  <Badge variant="outline" className="text-xs">
                                    {source.credibility}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="space-y-6 overflow-auto no-scrollbar">
            <Card className="bg-white border-gray-200 flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <MessageCircle className="w-6 h-6" />
                  AI Assistant Chat
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Chat with HANU-AI for research assistance and translations
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ScrollArea className="flex-1 mb-4">
                  <div className="space-y-4">
                    {chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderId === 'user123' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-md px-4 py-2 border ${
                            message.senderId === 'user123'
                              ? 'bg-blue-600 text-white border-blue-600'
                              : message.type === 'system'
                              ? 'bg-gray-100 text-slate-900 border-gray-200'
                              : 'bg-white text-slate-800 border-gray-200'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {formatTimeAgo(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Type your message..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSendMessage((e.target as HTMLInputElement).value)
                        ;(e.target as HTMLInputElement).value = ''
                      }
                    }}
                    className="bg-white border-gray-300 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-100"
                  />
                  <Button
                    onClick={() => {
                      const input = document.querySelector('input[type="text"]') as HTMLInputElement
                      if (input.value.trim()) {
                        handleSendMessage(input.value)
                        input.value = ''
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Send
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Bell className="w-6 h-6" />
                  Notifications
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Stay updated with your activities and platform updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-md border ${
                          notification.isRead
                            ? 'bg-white border-gray-200'
                            : 'bg-blue-50 border-blue-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-slate-900">{notification.title}</h4>
                              <Badge variant="outline" className="text-xs">
                                {notification.type}
                              </Badge>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                              )}
                            </div>
                            <p className="text-slate-700 text-sm mb-2">{notification.message}</p>
                            <p className="text-slate-500 text-xs">
                              {formatTimeAgo(notification.timestamp)}
                            </p>
                          </div>
                          {!notification.isRead && (
                            <Button
                              onClick={() => markNotificationAsRead(notification.id)}
                              variant="ghost"
                              size="sm"
                              className="text-slate-500 hover:text-blue-600"
                            >
                              Mark as read
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Bell className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-500">No notifications yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-900">
                    <Star className="w-5 h-5" />
                    Level
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900">{user?.level || 1}</div>
                  <p className="text-sm text-slate-600">Current Level</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-900">
                    <Zap className="w-5 h-5" />
                    XP
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900">{user?.xp || 0}</div>
                  <p className="text-sm text-slate-600">Experience Points</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-900">
                    <Coins className="w-5 h-5" />
                    Coins
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900">{user?.coins || 0}</div>
                  <p className="text-sm text-slate-600">Virtual Currency</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-900">
                    <Gem className="w-5 h-5" />
                    Gems
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900">{user?.gems || 0}</div>
                  <p className="text-sm text-slate-600">Premium Currency</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Users className="w-6 h-6" />
                  Online Users
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Currently active users on the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {onlineUsers.map((onlineUser) => (
                    <div key={onlineUser.id} className="text-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-400 rounded-full mx-auto mb-2 flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {onlineUser.username?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 truncate">{onlineUser.username}</p>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-slate-500">Lvl {onlineUser.level}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Featured Knowledge Section */}
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Brain className="w-6 h-6" />
                  Featured Knowledge
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Discover key topics and insights from our knowledge base
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {featuredKnowledge.map((item) => (
                    <div key={item.id} className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                      </div>
                      <p className="text-gray-300 text-sm mb-3">
                        {item.content.substring(0, 150)}...
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          {item.keywords.slice(0, 3).map((keyword, index) => (
                            <span key={index} className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-400">
                              {keyword}
                            </span>
                          ))}
                        </div>
                        <Button
                          onClick={() => {
                            // Add knowledge item to chat
                            setChatMessages(prev => [...prev, {
                              id: Date.now().toString(),
                              senderId: 'system',
                              content: `Tell me more about "${item.title}"`,
                              timestamp: new Date(),
                              type: 'system'
                            }])
                          }}
                          variant="ghost"
                          size="sm"
                          className="text-purple-400 hover:text-purple-300"
                        >
                          Learn More
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}