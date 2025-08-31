'use client'

import { useEffect } from 'react'
import XPLevelsSystem from '@/components/XPLevelsSystem'
import BackButton from '@/components/BackButton'

export default function LevelsPage() {
  useEffect(() => {
    // Award XP for visiting the levels page
    const awardPageVisitXP = async () => {
      try {
        await fetch('/api/gamification/achievements', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'add_xp',
            xp_amount: 5,
            activity_type: 'exploration',
            source_description: 'Visited levels page'
          })
        })
      } catch (error) {
        console.error('Error awarding page visit XP:', error)
      }
    }
    
    awardPageVisitXP()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <BackButton />
        <XPLevelsSystem />
      </div>
    </div>
  )
}