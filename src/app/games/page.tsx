'use client'

import { Component, ReactNode, Suspense, useState } from 'react'
import GamesHub from '@/components/games/GamesHub'
import BackButton from '@/components/BackButton'

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error?: any }> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            <div className="font-semibold mb-1">Something went wrong in Games Hub.</div>
            <div className="text-sm opacity-80">{String(this.state.error)}</div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default function GamesPage() {
  const [retryKey, setRetryKey] = useState(0)
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-6">
        <BackButton />
        {/* Breadcrumb */}
        <nav className="mt-4 mb-3 text-sm text-slate-600" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2">
            <li><a href="/" className="hover:underline">Home</a></li>
            <li className="text-slate-400">/</li>
            <li className="font-medium text-slate-700">Games</li>
          </ol>
        </nav>
        {/* Page header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Games</h1>
            <p className="text-sm text-slate-600">Interactive learning games with progress and rewards</p>
          </div>
          <button
            onClick={() => setRetryKey(k => k + 1)}
            className="text-sm px-3 py-1 rounded border border-slate-300 text-slate-700 hover:bg-slate-100"
          >
            Retry
          </button>
        </div>
        <ErrorBoundary>
          <Suspense fallback={<div className="p-6 text-center">Loading Games Hub…</div>}>
            <div key={retryKey}>
              <GamesHub />
            </div>
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  )
}