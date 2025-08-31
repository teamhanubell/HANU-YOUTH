'use client'

import { useMemo, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpen, User, Target, MessageCircle, FileCheck, Clock } from 'lucide-react'
import BackButton from '@/components/BackButton'


type ResearchItem = {
  id: string
  title: string
  authors: string
  date: string
  abstract: string
  content: string
  category: 'ai-ml' | 'coding' | 'unesco' | 'tech' | 'hackathon'
  tags: string[]
  url?: string
}

export default function ResearchHubPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'verified' | 'unverified'>('verified')

  // Initialize reveal-on-scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.08 }
    )

    const elements = document.querySelectorAll('.reveal-on-scroll')
    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  const papers: ResearchItem[] = useMemo(() => ([
    {
      id: 'ai-001',
      title: 'Foundations of Modern Machine Learning',
      authors: 'A. Researcher',
      date: '2023-06-12',
      abstract: 'Overview of supervised and unsupervised methods, evaluation and regularization.',
      content: 'Full content of the ML paper goes here. Explain methods, experiments, results and references.',
      category: 'ai-ml',
      tags: ['machine learning','supervised','evaluation'],
      url: '#'
    },
    {
      id: 'unesco-001',
      title: 'Media & Information Literacy: Policy and Practice',
      authors: 'UNESCO Working Group',
      date: '2021-03-22',
      abstract: 'Frameworks for MIL education and community implementation at scale.',
      content: 'Full UNESCO report summary and links, methodology, recommendations and case studies.',
      category: 'unesco',
      tags: ['media literacy','education','policy'],
      url: '#'
    },
    {
      id: 'hack-001',
      title: 'Running Effective Hackathons for Social Good',
      authors: 'Event Org',
      date: '2022-09-10',
      abstract: 'Best practices to organise, mentor and scale hackathons for impact projects.',
      content: 'Detailed guide for organizers and participants with templates, judging criteria and timelines.',
      category: 'hackathon',
      tags: ['hackathon','community','events'],
      url: '#'
    },
    {
      id: 'tech-001',
      title: 'Emerging Technologies for Social Good (1)',
      authors: 'E. Innovator',
      date: '2024-01-17',
      abstract: 'Survey of AI, IoT and distributed systems used in community impact projects.',
      content: 'In-depth survey, selected deployments, lessons learned and future directions.',
      category: 'tech',
      tags: ['iot','ai','community'],
      url: '#'
    },
    {
      id: 'tech-002',
      title: 'Emerging Technologies for Social Good (2)',
      authors: 'E. Innovator',
      date: '2024-01-17',
      abstract: 'Survey of AI, IoT and distributed systems used in community impact projects.',
      content: 'In-depth survey, selected deployments, lessons learned and future directions.',
      category: 'tech',
      tags: ['iot','ai','community'],
      url: '#'
    },
    {
      id: 'tech-003',
      title: 'Emerging Technologies for Social Good (3)',
      authors: 'E. Innovator',
      date: '2024-01-17',
      abstract: 'Survey of AI, IoT and distributed systems used in community impact projects.',
      content: 'In-depth survey, selected deployments, lessons learned and future directions.',
      category: 'tech',
      tags: ['iot','ai','community'],
      url: '#'
    },
    {
      id: 'tech-004',
      title: 'Emerging Technologies for Social Good (4)',
      authors: 'E. Innovator',
      date: '2024-01-17',
      abstract: 'Survey of AI, IoT and distributed systems used in community impact projects.',
      content: 'In-depth survey, selected deployments, lessons learned and future directions.',
      category: 'tech',
      tags: ['iot','ai','community'],
      url: '#'
    },
    {
      id: 'tech-005',
      title: 'Emerging Technologies for Social Good (5)',
      authors: 'E. Innovator',
      date: '2024-01-17',
      abstract: 'Survey of AI, IoT and distributed systems used in community impact projects.',
      content: 'In-depth survey, selected deployments, lessons learned and future directions.',
      category: 'tech',
      tags: ['iot','ai','community'],
      url: '#'
    },
    {
      id: 'tech-006',
      title: 'Emerging Technologies for Social Good (6)',
      authors: 'E. Innovator',
      date: '2024-01-17',
      abstract: 'Survey of AI, IoT and distributed systems used in community impact projects.',
      content: 'In-depth survey, selected deployments, lessons learned and future directions.',
      category: 'tech',
      tags: ['iot','ai','community'],
      url: '#'
    }
  ]), [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* AWS-style navbar */}
      <nav className="w-full aws-header border-b border-gray-200 sticky top-0 z-40 backdrop-blur glow">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="text-lg font-bold text-slate-900">HANU-YOUTH</div>
          </div>

          <div className="hidden sm:flex items-center gap-6 text-sm">
            <button className="px-2 py-1 rounded-md cursor-pointer text-slate-700 hover:text-slate-900" onClick={() => window.location.href = '/'}>Home</button>
            <button className="px-2 py-1 rounded-md cursor-pointer text-slate-900 font-medium">Research</button>
            <button className="px-2 py-1 rounded-md cursor-pointer text-slate-700 hover:text-slate-900" onClick={() => window.location.href = '/global-awareness'}>Global awareness</button>
            <button className="px-2 py-1 rounded-md cursor-pointer text-slate-700 hover:text-slate-900" onClick={() => window.location.href = '/'}>About</button>
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

      <div className="relative z-10 container mx-auto px-4 py-8">
        <BackButton />
        
        {/* Header */}
        <header className="text-center mb-12 reveal-on-scroll">
          <div className="mb-6">
            <h1 className="text-4xl md:text-5xl font-bold mb-2 text-slate-900 flex items-center justify-center gap-3">
              <BookOpen className="w-8 h-8 text-primary" />
              Research Hub
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-2">
              Access verified academic papers, UN reports, and review unverified submissions
            </p>
            <p className="text-base text-slate-600">
              Browse research across AI-ML, UNESCO, hackathons and technology. Review and validate community submissions.
            </p>
          </div>
        </header>

    <div className='overflow-auto scrollbar-hidden pr-2' style={{maxHeight:'calc(100vh-50px)'}}></div>

        {/* Tab Content */}
        
         { /* Verified Research Papers Grid */}
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {papers.map((p, index) => (
                <Card 
                  key={p.id} 
                  className="cursor-pointer reveal-on-scroll"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => router.push(`/research-hub/${p.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between w-full">
                      <div className="flex-1">
                        <CardTitle className="text-lg text-slate-900 mb-2">{p.title}</CardTitle>
                        <CardDescription className="text-slate-600">
                          {p.authors} • {new Date(p.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                          })}
                        </CardDescription>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-xs text-slate-500 uppercase tracking-wide">Category</div>
                        <div className="font-semibold text-primary capitalize">
                          {p.category.replace('-', ' ')}
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <p className="text-sm text-slate-700 mb-4 line-clamp-3">{p.abstract}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex gap-2 flex-wrap">
                        {p.tags.slice(0, 3).map((t) => (
                          <Badge key={t} variant="secondary" className="text-xs">
                            {t}
                          </Badge>
                        ))}
                        {p.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{p.tags.length - 3}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {p.url && p.url !== '#' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              window.open(p.url, '_blank', 'noopener')
                            }}
                            className="text-xs"
                          >
                            <User className="w-3 h-3 mr-1" />
                            Source
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" disabled className="text-xs opacity-50">
                            <User className="w-3 h-3 mr-1" />
                            Source
                          </Button>
                        )}

                        <Button 
                          size="sm" 
                          variant="default"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/research-hub/${p.id}`)
                          }}
                          className="text-xs"
                        >
                          <Target className="w-3 h-3 mr-1" />
                          Read
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
      </div>
    </div>
  )
}