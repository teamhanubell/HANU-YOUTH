'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Flame,
  Clock,
  Shield,
  Gift,
  Trophy,
  Star,
  Zap,
  Calendar,
  TrendingUp,
  Award,
  Diamond,
  Gem,
  Snowflake
} from 'lucide-react'

interface Streak {
  id: string
  streak_type: string
  current_count: number
  longest_count: number
  status: string
  start_date: string
  last_activity_date: string
  next_activity_deadline?: string
  freeze_count: number
  frozen_until?: string
  total_xp_earned: number
  total_coins_earned: number
  total_gems_earned: number
  milestones_achieved: number[]
}

interface StreakReward {
  id: string
  streak_type: string
  milestone: number
  xp_reward: number
  coin_reward: number
  gem_reward: number
  power_up_id?: string
  achievement_id?: string
  title_reward?: string
  xp_multiplier: number
  coin_multiplier: number
  bonus_duration_hours: number
  is_achieved: boolean
}

interface StreakActionResponse {
  success: boolean
  message: string
  streak_updated: boolean
  new_count: number
  rewards_earned: {
    xp: number
    coins: number
    gems: number
    achievements: string[]
    titles: string[]
    power_ups: string[]
  }
  next_milestone?: number
  time_until_next_deadline?: string
}

export default function StreakSystem() {
  const [streaks, setStreaks] = useState<Streak[]>([])
  const [rewards, setRewards] = useState<Record<string, StreakReward[]>>({})
  const [loading, setLoading] = useState(true)
  const [lastAction, setLastAction] = useState<StreakActionResponse | null>(null)
  const [selectedStreakType, setSelectedStreakType] = useState<string>('daily')
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({})

  useEffect(() => {
    loadStreakData()
  }, [])

  useEffect(() => {
    if (selectedStreakType) {
      loadStreakRewards(selectedStreakType)
    }
  }, [selectedStreakType])

  async function loadStreakRewards(streakType: string) {
    try {
      const response = await fetch(`/api/gamification/streak/rewards?type=${encodeURIComponent(streakType)}`)
      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data)) {
          setRewards(prev => ({ ...prev, [streakType]: data }))
        } else if (data && Array.isArray((data as any).rewards)) {
          setRewards(prev => ({ ...prev, [streakType]: (data as any).rewards }))
        } else {
          setRewards(prev => ({ ...prev, [streakType]: [] }))
          console.warn('Unexpected /api/gamification/streak/rewards response shape:', data)
        }
      } else {
        setRewards(prev => ({ ...prev, [streakType]: [] }))
      }
    } catch (error) {
      console.error('Error loading streak rewards:', error)
      setRewards(prev => ({ ...prev, [streakType]: [] }))
    }
  }

  async function loadStreakData() {
    setLoading(true)
    try {
      const response = await fetch('/api/gamification/streak')
      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data)) {
          setStreaks(data)
        } else if (data && Array.isArray((data as any).streaks)) {
          setStreaks((data as any).streaks)
        } else if (data && typeof data === 'object' && Array.isArray((data as any).items)) {
          // fallback if API returns items
          setStreaks((data as any).items)
        } else {
          setStreaks([])
          console.warn('Unexpected /api/gamification/streak response shape:', data)
        }
      } else {
        setStreaks([])
      }
    } catch (error) {
      console.error('Error loading streaks:', error)
      setStreaks([])
    } finally {
      setLoading(false)
    }
  }

  async function performStreakAction(streakType: string) {
    // Example: /api/gamification/streak/action { type: 'daily' }
    setActionLoading(prev => ({ ...prev, [streakType]: true }))
    try {
      const res = await fetch('/api/gamification/streak/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: streakType })
      })
      if (!res.ok) throw new Error('Action failed')
      const data: StreakActionResponse = await res.json()
      setLastAction(data)
      // refresh streak data and rewards
      await loadStreakData()
      await loadStreakRewards(streakType)
    } catch (err) {
      console.error('Streak action error:', err)
    } finally {
      setActionLoading(prev => ({ ...prev, [streakType]: false }))
    }
  }

  // Derived totals for dashboard
  const totalXP = streaks.reduce((s, st) => s + (st.total_xp_earned || 0), 0)
  const totalCoins = streaks.reduce((s, st) => s + (st.total_coins_earned || 0), 0)
  const totalGems = streaks.reduce((s, st) => s + (st.total_gems_earned || 0), 0)
  const totalCertificates = (() => {
    const certs: string[] = []
    Object.values(rewards).forEach(arr => {
      arr.forEach(r => {
        if (r.is_achieved && r.title_reward) certs.push(r.title_reward)
      })
    })
    // include lastAction achievements
    if (lastAction?.rewards_earned?.achievements) {
      certs.push(...lastAction.rewards_earned.achievements)
    }
    return certs
  })()

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Flame className="w-5 h-5 text-amber-500" /> Current Streak
            </CardTitle>
            <CardDescription className="text-gray-500">Your ongoing consistency</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-900">
              {streaks.length ? streaks.reduce((m, s) => Math.max(m, s.current_count), 0) : 0}
            </div>
            <div className="mt-3">
              <Progress value={Math.min(100, (streaks.reduce((m, s) => Math.max(m, s.current_count), 0) / 30) * 100)} />
              <p className="text-sm text-gray-400 mt-2">Keep going — reach 30 days for a milestone.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Trophy className="w-5 h-5 text-yellow-500" /> Best Streak
            </CardTitle>
            <CardDescription className="text-gray-500">Your record so far</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-900">
              {streaks.length ? streaks.reduce((m, s) => Math.max(m, s.longest_count), 0) : 0}
            </div>
            <div className="mt-3">
              <p className="text-sm text-gray-400">Longest continuous days logged in.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Gift className="w-5 h-5 text-purple-500" /> Milestone Rewards
            </CardTitle>
            <CardDescription className="text-gray-500">Earn rewards for your consistency</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div>
                <div className="text-2xl font-semibold">{totalXP}</div>
                <div className="text-sm text-gray-400">XP</div>
              </div>
              <div>
                <div className="text-2xl font-semibold">{totalCoins}</div>
                <div className="text-sm text-gray-400">Coins</div>
              </div>
              <div>
                <div className="text-2xl font-semibold">{totalGems}</div>
                <div className="text-sm text-gray-400">Gems</div>
              </div>
            </div>

            <div className="mt-4 flex gap-2 flex-wrap">
              <Badge className="bg-gray-800 text-gray-300">Played</Badge>
              <Badge className="bg-gray-800 text-gray-300">Courses</Badge>
              <Badge className="bg-gray-800 text-gray-300">Quizzes</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action / Filter */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className={`${selectedStreakType === 'daily' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-gray-700 border-gray-200'}`}
            onClick={() => setSelectedStreakType('daily')}
          >
            Daily
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={`${selectedStreakType === 'weekly' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-gray-700 border-gray-200'}`}
            onClick={() => setSelectedStreakType('weekly')}
          >
            Weekly
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={`${selectedStreakType === 'monthly' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-gray-700 border-gray-200'}`}
            onClick={() => setSelectedStreakType('monthly')}
          >
            Monthly
          </Button>
        </div>

        <div className="text-sm text-gray-600">
          Last action:{' '}
          {lastAction ? (
            <span className="font-medium text-gray-900">{lastAction.message}</span>
          ) : (
            <span className="text-gray-500">none</span>
          )}
        </div>
      </div>

      {/* Streak List & Rewards */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Calendar className="w-5 h-5 text-blue-500" /> Streaks
            </CardTitle>
            <CardDescription className="text-gray-500">Your tracked streak types and progress</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-gray-400">Loading...</div>
            ) : streaks.length === 0 ? (
              <Alert>
                <AlertDescription>No streaks found. Start any activity to begin tracking your streaks.</AlertDescription>
              </Alert>
            ) : (
              <ScrollArea className="max-h-72">
                <div className="space-y-3">
                  {streaks.map((streak) => (
                    <div key={streak.id} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <div className="font-semibold text-gray-900">
                              {streak.streak_type.charAt(0).toUpperCase() + streak.streak_type.slice(1)}
                            </div>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            Current: <span className="text-blue-600 font-medium">{streak.current_count}</span> days — 
                            Longest: <span className="text-blue-600 font-medium">{streak.longest_count}</span>
                          </div>
                        </div>
                        <Badge className="bg-green-50 text-green-700 border-green-200">
                          {streak.status}
                        </Badge>
                      </div>
                      <div className="mt-3">
                        <Progress value={(streak.current_count / Math.max(1, streak.longest_count || 30)) * 100} />
                        <div className="flex justify-between text-sm text-gray-500 mt-1">
                          <span>Progress</span>
                          <span>{Math.round((streak.current_count / Math.max(1, streak.longest_count || 30)) * 100)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Gift className="w-5 h-5 text-purple-500" /> Rewards
            </CardTitle>
            <CardDescription className="text-gray-500">Earn rewards for your consistency</CardDescription>
          </CardHeader>
          <CardContent>
            {rewards[selectedStreakType]?.length > 0 ? (
              <ScrollArea className="h-72">
                <div className="space-y-3">
                  {rewards[selectedStreakType].map((reward) => (
                    <div key={reward.id} className="p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                          <Trophy className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Day {reward.milestone}</div>
                          <div className="text-sm text-gray-500">Milestone Reward</div>
                        </div>
                      </div>
                      
                      <div className="mt-3 space-y-2 text-sm">
                        {reward.xp_reward > 0 && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <div className="w-5 h-5 rounded bg-blue-50 flex items-center justify-center">
                              <Zap className="w-3 h-3 text-blue-600" />
                            </div>
                            <span>+{reward.xp_reward} XP</span>
                          </div>
                        )}
                        {reward.coin_reward > 0 && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <div className="w-5 h-5 rounded bg-yellow-50 flex items-center justify-center">
                              <Diamond className="w-3 h-3 text-yellow-600" />
                            </div>
                            <span>+{reward.coin_reward} Coins</span>
                          </div>
                        )}
                        {reward.gem_reward > 0 && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <div className="w-5 h-5 rounded bg-green-50 flex items-center justify-center">
                              <Gem className="w-3 h-3 text-green-600" />
                            </div>
                            <span>+{reward.gem_reward} Gems</span>
                          </div>
                        )}
                        {reward.title_reward && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <div className="w-5 h-5 rounded bg-purple-50 flex items-center justify-center">
                              <Award className="w-3 h-3 text-purple-600" />
                            </div>
                            <span>{reward.title_reward} Title</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-3 flex items-center justify-between">
                        <Badge className={reward.is_achieved ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600'}> 
                          {reward.is_achieved ? 'Claimed' : 'Locked'}
                        </Badge>
                        {reward.is_achieved && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            onClick={() => {/* Handle view reward */}}
                          >
                            View
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <Gift className="w-8 h-8 mx-auto" />
                </div>
                <p className="text-gray-500">No rewards available for this streak type.</p>
                <p className="text-sm text-gray-400 mt-1">Complete more activities to unlock rewards!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Last action summary */}
      {lastAction && (
        <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm font-medium text-gray-900">Last Action</div>
          <div className="text-sm text-gray-600 mt-1">{lastAction.message}</div>
          <div className="text-xs text-gray-500 mt-2">
            Rewards: XP {lastAction.rewards_earned.xp}, Coins {lastAction.rewards_earned.coins}, Gems {lastAction.rewards_earned.gems}
          </div>
        </div>
      )}
    </div>
  )

  // helper inside component
  function speakReward(r: StreakReward) {
    // Simple TTS readout when user clicks View (optional)
    try {
      const txt = `Milestone ${r.milestone} achieved. Reward: ${r.xp_reward} XP, ${r.coin_reward} coins, ${r.gem_reward} gems.`
      const u = new SpeechSynthesisUtterance(txt)
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(u)
    } catch (e) {
      console.error('TTS error:', e)
    }
  }
}