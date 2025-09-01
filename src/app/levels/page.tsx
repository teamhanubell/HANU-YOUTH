'use client'

import { useEffect } from 'react'
import XPLevelsSystem from '@/components/XPLevelsSystem'
import BackButton from '@/components/BackButton'

export default function LevelsPage() {
  useEffect(() => {
    // Mock XP award for static export
    const awardPageVisitXP = async () => {
      try {
        // Simulate XP award without API call
        console.log('XP awarded for visiting levels page: +5 XP')
        // In a real app, this would update local storage or state
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