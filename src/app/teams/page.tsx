'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Users, Plus, Search, Trophy, Star, Clock, 
  MessageSquare, Settings, UserPlus, Crown
} from 'lucide-react'
import BackButton from '@/components/BackButton'

export default function TeamsPage() {
  const [loading, setLoading] = useState(false)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <BackButton />
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 reveal-on-scroll">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-2">
              Team Competitions
            </h1>
            <p className="text-xl text-slate-600">
              Join squads, compete in challenges, and climb the leaderboards together
            </p>
          </div>

          {/* Join the Global Youth Movement CTA */}
          <div className="flex justify-center mb-8">
            {/* Hidden original button (kept for reference) */}
            <Button
              className="hidden bg-green-600 hover:bg-green-700 text-white"
              onClick={() => (window.location.href = 'https://chat.whatsapp.com/GkcsFS3COI5AEJtRw20d4g')}
              title="Join the Global Youth Movement"
              aria-label="Join the Global Youth Movement on WhatsApp"
            >
              Join the Global Youth Movement
            </Button>

            {/* Visible, reliable link-styled button */}
            <a
              href="https://chat.whatsapp.com/GkcsFS3COI5AEJtRw20d4g"
              target="_blank"
              rel="noopener noreferrer"
              title="Join the Global Youth Movement"
              aria-label="Join the Global Youth Movement on WhatsApp"
              className="inline-flex items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
            >
              Join the Global Youth Movement
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Teams List */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-all duration-300 reveal-on-scroll">
                <CardHeader>
                  <CardTitle className="text-slate-800 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Teams
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    Browse and join teams
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">Team functionality coming soon...</p>
                </CardContent>
              </Card>
            </div>

            {/* Team Details */}
            <div className="space-y-4">
              <Card className="bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-all duration-300 reveal-on-scroll">
                <CardHeader>
                  <CardTitle className="text-slate-800 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-blue-600" />
                    Team Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">Select a team to view details</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}