'use client'

import { useEffect } from 'react'
import QuizSystem from '@/components/QuizSystem'
import { Button } from '@/components/ui/button'
import { Brain, MessageCircle } from 'lucide-react'

export default function QuizPage() {
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
              <Brain className="w-8 h-8 text-primary" />
              Quiz Center
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-2">
              Test your knowledge and learn through interactive quizzes
            </p>
            <p className="text-base text-slate-600">
              Challenge yourself with AI-generated questions on global topics.
            </p>
          </div>
        </header>

        {/* Quiz System */}
        <div className="reveal-on-scroll">
          <QuizSystem />
        </div>
      </div>
    </div>
  )
}