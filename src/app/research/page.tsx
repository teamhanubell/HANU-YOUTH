'use client'

import ResearchAssistant from '@/components/ResearchAssistant'

export default function ResearchPage() {
  return (
    <div className="min-h-screen bg-white text-black">
      {/* Top header (AWS-like) */}
      <nav className="w-full aws-header border-b border-gray-200 sticky top-0 z-40 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-lg font-bold">HANU-YOUTH</div>
            <div className="text-xs text-slate-600 border-l pl-3">AI Research</div>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-sm">
            <button className="px-2 py-1 rounded-md cursor-pointer" onClick={() => (window.location.href = '/')}>Home</button>
            <button className="px-2 py-1 rounded-md cursor-pointer" onClick={() => (window.location.href = '/research-hub')}>Research Hub</button>
            <button className="px-2 py-1 rounded-md cursor-pointer" onClick={() => (window.location.href = '/global-awareness')}>Global awareness</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-2">AI Research</h1>
          <p className="text-slate-600">Ask questions and receive structured, credible research summaries.</p>
        </header>

        <ResearchAssistant />
      </div>
    </div>
  )
}