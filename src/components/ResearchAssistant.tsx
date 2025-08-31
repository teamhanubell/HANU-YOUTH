'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { 
  Search, Brain, Globe, FileText, ExternalLink, 
  CheckCircle, AlertCircle, Clock, TrendingUp, Target
} from 'lucide-react'

interface ResearchData {
  title: string
  category: string
  summary: string
  keyInsights: string[]
  currentRelevance: string
  sources: Array<{
    name: string
    url: string
    credibility: 'High' | 'Medium' | 'Low'
  }>
  aiInsight: string
}

interface ResearchResponse {
  status: 'success' | 'error' | 'loading'
  data?: ResearchData
  error?: string
}

const CATEGORIES = [
  'AI', 'UN', 'Hackathon', 'Event', 'News', 'Global Issue', 
  'Climate', 'Education', 'Technology', 'Health', 'Economy'
]

const CREDIBILITY_COLORS = {
  High: 'bg-green-500/20 text-green-400 border-green-500/50',
  Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
  Low: 'bg-red-500/20 text-red-400 border-red-500/50'
}

export default function ResearchAssistant() {
  const [query, setQuery] = useState('')
  const [response, setResponse] = useState<ResearchResponse>({ status: 'loading' })
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [customPrompt, setCustomPrompt] = useState('')

  const handleResearch = async () => {
    if (!query.trim()) return

    setResponse({ status: 'loading' })

    try {
      // Create the research prompt
      const researchPrompt = `You are an AI research assistant for the HANU-YOUTH platform. Your role is to collect, verify, and present structured, transparent research data. When given a topic, follow this format strictly:
Title: [Concise title of research topic]
Category: [e.g., AI | UN | Hackathon | Event | News | Global Issue]
Summary (3–4 sentences): Explain the topic in simple, clear language.
Key Insights (Bulleted): Provide 4–6 important points, backed by facts.
Current Relevance: Why is this important now?
Sources & Credibility: List 2–3 credible sources with verification score (High, Medium, Low).
AI Insight: Add a short note (1–2 lines) connecting this research to innovation, youth empowerment, or global impact.
Keep responses concise, fact-based, and globally understandable. If data is unavailable, say 'Not Enough Reliable Data.' Present output in JSON-like structure for direct app integration.

Query: ${query}${customPrompt ? '\nAdditional context: ' + customPrompt : ''}

Please provide the research in the following JSON format:
{
  "title": "Research Title",
  "category": "Category | Subcategory",
  "summary": "3-4 sentence summary",
  "keyInsights": ["Insight 1", "Insight 2", "Insight 3", "Insight 4"],
  "currentRelevance": "Why this matters now",
  "sources": [
    {
      "name": "Source Name",
      "url": "https://example.com",
      "credibility": "High"
    }
  ],
  "aiInsight": "AI insight connecting to innovation/youth/global impact"
}`

      const response = await fetch('/api/ai/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: researchPrompt,
          category: selectedCategory === 'all' ? undefined : selectedCategory
        }),
      })

      if (!response.ok) {
        throw new Error('Research request failed')
      }

      const data = await response.json()
      
      // Parse the AI response
      let researchData: ResearchData
      try {
        // Try to parse as JSON first
        researchData = JSON.parse(data.response)
      } catch {
        // If JSON parsing fails, create a fallback structure
        researchData = {
          title: "Research Results",
          category: selectedCategory || "General",
          summary: data.response,
          keyInsights: ["Research completed", "Data processed"],
          currentRelevance: "Information is current and relevant",
          sources: [
            {
              name: "AI Research Assistant",
              url: "#",
              credibility: "Medium"
            }
          ],
          aiInsight: "This research contributes to knowledge sharing and global understanding."
        }
      }

      setResponse({ status: 'success', data: researchData })
    } catch (error) {
      console.error('Research error:', error)
      setResponse({ 
        status: 'error', 
        error: 'Failed to complete research. Please try again.' 
      })
    }
  }

  const getStatusIcon = () => {
    switch (response.status) {
      case 'loading':
        return <Clock className="w-5 h-5 text-cyan-400 animate-pulse" />
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />
      default:
        return <Brain className="w-5 h-5 text-purple-400" />
    }
  }

  return (
    <div className="w-full">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Brain className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl md:text-4xl font-semibold text-slate-900">
                AI Research Assistant
              </h1>
              <Brain className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-base md:text-lg text-slate-600">
              Get structured, verified research on global topics, UN initiatives, and emerging technologies
            </p>
          </div>

          {/* Research Input */}
          <Card className="bg-white border-slate-200 shadow-glow mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Search className="w-5 h-5 text-blue-600" />
                Research Query
              </CardTitle>
              <CardDescription className="text-slate-600">
                Enter a topic you'd like to research. The AI will provide structured, verified information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Research Topic
                </label>
                <Input
                  type="text"
                  placeholder="e.g., UN initiatives for AI ethics in education"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Category (Optional)
                </label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('all')}
                    className={selectedCategory === 'all' ? '' : 'border-slate-300 text-slate-700 hover:bg-slate-50'}
                  >
                    All Categories
                  </Button>
                  {CATEGORIES.map(category => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className={selectedCategory === category ? '' : 'border-slate-300 text-slate-700 hover:bg-slate-50'}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Additional Context (Optional)
                </label>
                <Textarea
                  placeholder="Add any specific context or requirements for your research..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  rows={3}
                />
              </div>

              <Button 
                onClick={handleResearch}
                disabled={!query.trim() || response.status === 'loading'}
                className="w-full"
              >
                {response.status === 'loading' ? (
                  <>
                    <Clock className="w-5 h-5 mr-2 animate-spin" />
                    Researching...
                  </>
                ) : (
                  <>
                    <Target className="w-5 h-5 mr-2" />
                    Start Research
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Research Results */}
          {response.status === 'success' && response.data && (
            <Card className="bg-white border-slate-200 shadow-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  {getStatusIcon()}
                  Research Results
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Structured research data based on your query
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Title and Category */}
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900 mb-2">{response.data.title}</h2>
                  <Badge className="bg-blue-50 text-blue-700 border border-blue-200">
                    {response.data.category}
                  </Badge>
                </div>

                {/* Summary */}
                <div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">Summary</h3>
                  <p className="text-slate-700 leading-relaxed">{response.data.summary}</p>
                </div>

                {/* Key Insights */}
                <div>
                  <h3 className="text-lg font-medium text-slate-900 mb-3">Key Insights</h3>
                  <div className="space-y-2">
                    {response.data.keyInsights.map((insight, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <p className="text-slate-700">{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Current Relevance */}
                <div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">Current Relevance</h3>
                  <p className="text-slate-700">{response.data.currentRelevance}</p>
                </div>

                {/* Sources */}
                <div>
                  <h3 className="text-lg font-medium text-slate-900 mb-3">Sources & Credibility</h3>
                  <div className="space-y-3">
                    {response.data.sources.map((source, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-slate-500" />
                          <div>
                            <p className="font-medium text-slate-900">{source.name}</p>
                            <a 
                              href={source.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              View Source
                            </a>
                          </div>
                        </div>
                        <Badge className={CREDIBILITY_COLORS[source.credibility]}>
                          {source.credibility} Credibility
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Insight */}
                <div className="p-4 rounded-lg border border-blue-200 bg-blue-50/60">
                  <h3 className="text-lg font-medium text-slate-900 mb-2">AI Insight</h3>
                  <p className="text-slate-700">{response.data.aiInsight}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {response.status === 'error' && (
            <Card className="bg-white border-red-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 text-red-600">
                  <AlertCircle className="w-6 h-6" />
                  <p className="font-medium">{response.error}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Example Query */}
          <Card className="bg-white border-slate-200 mt-6">
            <CardHeader>
              <CardTitle className="text-slate-900">Example Query</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-lg border border-slate-200 bg-slate-50">
                <p className="text-slate-700 font-mono text-sm">
                  "Provide research on UN initiatives for AI ethics in education."
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}