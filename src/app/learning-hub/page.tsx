'use client'

import { useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, MessageCircle, Target, BookOpen, User } from 'lucide-react'

interface ResearchPaper {
  id: string
  title: string
  authors: string
  date: string
  abstract: string
  category: 'ai-ml' | 'coding' | 'unesco' | 'tech'
  tags: string[]
  url?: string
}

export default function LearningHubPage() {
  const router = useRouter()

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

  const mockPapers: ResearchPaper[] = useMemo(() => ([
    {
      id: 'r-ai-001',
      title: 'Foundations of Modern Machine Learning',
      authors: 'A. Researcher, B. Scientist',
      date: '2023-06-12',
      abstract: 'A concise overview of supervised and unsupervised methods, regularization and evaluation.',
      category: 'ai-ml',
      tags: ['machine learning', 'supervised', 'evaluation'],
      url: '#'
    },
    {
      id: 'r-coding-001',
      title: 'Practical Patterns in Modern Software Engineering',
      authors: 'C. Dev, D. Engineer',
      date: '2022-11-05',
      abstract: 'Design patterns, architecture trade-offs and test-driven development best practices.',
      category: 'coding',
      tags: ['architecture', 'testing', 'patterns'],
      url: '#'
    },
    {
      id: 'r-unesco-001',
      title: 'Media & Information Literacy: Policy and Practice',
      authors: 'UNESCO Working Group',
      date: '2021-03-22',
      abstract: 'Frameworks for MIL education, measurement and community implementation at scale.',
      category: 'unesco',
      tags: ['media literacy', 'education', 'policy'],
      url: '#'
    },
    {
      id: 'r-tech-001',
      title: 'Emerging Technologies for Social Good',
      authors: 'E. Innovator',
      date: '2024-01-17',
      abstract: 'Survey of technologies (AI, IoT, distributed systems) used in community impact projects.',
      category: 'tech',
      tags: ['iot', 'ai', 'community'],
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
            <button className="px-2 py-1 rounded-md cursor-pointer text-slate-700 hover:text-slate-900" onClick={() => window.location.href = '/research-hub'}>Research</button>
            <button className="px-2 py-1 rounded-md cursor-pointer text-slate-700 hover:text-slate-900" onClick={() => window.location.href = '/global-awareness'}>Global awareness</button>
            <button className="px-2 py-1 rounded-md cursor-pointer text-slate-900 font-medium">Learning Hub</button>
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
        {/* Header */}
        <header className="text-center mb-12 reveal-on-scroll">
          <div className="mb-6">
            <h1 className="text-4xl md:text-5xl font-bold mb-2 text-slate-900 flex items-center justify-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              Learning Hub
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-2">
              Gamified learning paths with AI-driven feedback and global rankings
            </p>
            <p className="text-base text-slate-600">
              Browse curated research papers and take interactive quizzes across AI/ML, Coding, UNESCO and tech topics.
            </p>
          </div>
        </header>

        {/* Category Badges */}
        <div className="max-w-4xl mx-auto mb-12 reveal-on-scroll">
          <div className="flex gap-3 flex-wrap justify-center">
            <Badge variant="secondary" className="text-sm px-4 py-2">AI / ML</Badge>
            <Badge variant="secondary" className="text-sm px-4 py-2">Coding</Badge>
            <Badge variant="secondary" className="text-sm px-4 py-2">UNESCO</Badge>
            <Badge variant="secondary" className="text-sm px-4 py-2">Technology</Badge>
          </div>
        </div>

        {/* Learning Papers Grid */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockPapers.map((paper, index) => (
              <Card 
                key={paper.id} 
                className="reveal-on-scroll"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between w-full">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-slate-900 mb-2">{paper.title}</CardTitle>
                      <CardDescription className="text-slate-600">
                        {paper.authors} • {new Date(paper.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit'
                        })}
                      </CardDescription>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-xs text-slate-500 uppercase tracking-wide">Category</div>
                      <div className="font-semibold text-primary capitalize">
                        {paper.category.replace('-', ' ')}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-sm text-slate-700 mb-4 line-clamp-3">{paper.abstract}</p>

                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="flex gap-2 flex-wrap">
                      {paper.tags.slice(0, 3).map((t) => (
                        <Badge key={t} variant="outline" className="text-xs">
                          {t}
                        </Badge>
                      ))}
                      {paper.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{paper.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (paper.url && paper.url !== '#') window.open(paper.url, '_blank')
                      }}
                      disabled={!paper.url || paper.url === '#'}
                      className="text-xs flex-1"
                    >
                      <User className="w-3 h-3 mr-1" />
                      Read Paper
                    </Button>

                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => {
                        router.push(`/quiz?category=${encodeURIComponent(paper.category)}&source=${encodeURIComponent(paper.id)}`)
                      }}
                      className="text-xs flex-1"
                    >
                      <Target className="w-3 h-3 mr-1" />
                      Take Quiz
                    </Button>
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