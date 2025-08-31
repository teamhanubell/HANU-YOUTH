'use client'

import { useEffect } from 'react'
import StreakSystem from '@/components/StreakSystem'
import BackButton from '@/components/BackButton'

export default function StreaksPage() {
  useEffect(() => {
    // Record page visit as daily streak activity
    const recordPageVisit = async () => {
      try {
        await fetch('/api/gamification/streak', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'record_activity',
            activity_type: 'page_visit'
          })
        })
      } catch (error) {
        console.error('Error recording page visit:', error)
      }
    }
    
    recordPageVisit()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <BackButton />
        <StreakSystem />
      </div>
    </div>
  )
}