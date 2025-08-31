'use client'

import React, { useMemo, useEffect } from 'react'
import CompetitionCard, { Competition } from '@/components/GlobalAwareness/CompetitionCard'
import ProfileCard, { Profile } from '@/components/GlobalAwareness/ProfileCard'
import { Button } from '@/components/ui/button'
import { Globe, MessageCircle, BookOpen } from 'lucide-react'

export default function GlobalAwarenessPage() {
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

  const competitions: Competition[] = useMemo(() => ([
    {
      id: 'comp-001',
      title: 'Mock Code Sprint — Summer 2025',
      org: 'ExampleOrg',
      date: '2025-09-10',
      deadline: '2025-09-01',
      summary: 'A 48-hour mock coding sprint focused on social good projects. Team and individual tracks.',
      url: 'https://example.com/comp/comp-001',
      tags: ['hackathon', 'social-good', '24-48h']
    },
    {
      id: 'comp-002',
      title: 'Open Algorithms Challenge (Mock)',
      org: 'TechMock',
      date: '2025-10-05',
      deadline: '2025-09-28',
      summary: 'Algorithmic problem-solving challenge for students and early-career engineers.',
      url: 'https://example.com/comp/comp-002',
      tags: ['algorithms', 'challenge']
    },
    {
      id: 'comp-003',
      title: 'Mock ML Cup',
      org: 'ML Community',
      date: '2025-11-12',
      deadline: '2025-11-01',
      summary: 'Model-building competition with dataset releases and leaderboard (mock data).',
      url: 'https://example.com/comp/comp-003',
      tags: ['ml', 'models', 'leaderboard']
    }
  ]), [])

  const profiles: Profile[] = useMemo(() => ([
    {
      id: 'p-001',
      name: 'Aisha Khan',
      title: 'Senior ML Engineer',
      org: 'ExampleOrg',
      bio: 'Mentor and judge for student hackathons (mock profile).',
      profileUrl: 'https://example.com/profiles/aisha'
    },
    {
      id: 'p-002',
      name: 'Dr. Martin Lee',
      title: 'Research Scientist',
      org: 'TechMock Labs',
      bio: 'Focus on AI for social good. Available for mentorship (mock).',
      profileUrl: 'https://example.com/profiles/martin'
    },
    {
      id: 'p-003',
      name: 'Sofia Ramos',
      title: 'Community Organizer',
      org: 'ML Community',
      bio: 'Runs workshops and bootcamps; volunteer mentor (mock).',
      profileUrl: 'https://example.com/profiles/sofia'
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
            <button className="px-2 py-1 rounded-md cursor-pointer text-slate-900 font-medium">Global awareness</button>
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
              <Globe className="w-8 h-8 text-primary" />
              Global Awareness
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-2">
              Stay updated with UN agendas, MUN events, and worldwide conferences
            </p>
            <p className="text-base text-slate-600">
              Connect with global competitions, events, and professional mentors in your field.
            </p>
          </div>
        </header>

        {/* Content Grid */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section className="reveal-on-scroll">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <div className="w-2 h-8 bg-primary rounded-full"></div>
                Recent Competitions
              </h2>

              <div className="space-y-4">
                {competitions.map((c, index) => (
                  <div 
                    key={c.id} 
                    className="reveal-on-scroll"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <CompetitionCard comp={c} />
                  </div>
                ))}
              </div>
            </section>

            <aside className="reveal-on-scroll">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <div className="w-2 h-8 bg-primary rounded-full"></div>
                Professional Profiles
              </h2>

              <div className="space-y-4">
                {profiles.map((p, index) => (
                  <div 
                    key={p.id} 
                    className="reveal-on-scroll"
                    style={{ animationDelay: `${(index + competitions.length) * 150}ms` }}
                  >
                    <ProfileCard profile={p} />
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  )
}