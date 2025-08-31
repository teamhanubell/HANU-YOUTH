'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Trophy, TrendingUp, Globe, MapPin, Star, Users,
  Crown, Medal, Award, Calendar, Filter, MessageCircle,
  Flame, Coins as CoinsIcon, Gem, Gift, CheckCircle2, Zap
} from 'lucide-react'

interface LeaderboardEntry {
  id: string
  username: string
  fullName?: string
  country?: string
  avatarUrl?: string
  rank: number
  score: number
  level: number
  xp: number
  coins: number
  gems: number
  dailyStreak: number
  achievements: number
  change?: number // -1, 0, or 1 for rank change (optional if API doesn't provide)
}

interface LeaderboardStats {
  totalUsers: number
  averageScore: number
  topScore: number
  activeToday: number
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [stats, setStats] = useState<LeaderboardStats | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<'global' | 'national' | 'friends'>('global')
  const [selectedMetric, setSelectedMetric] = useState<'xp' | 'coins' | 'streak' | 'achievements'>('xp')
  const [selectedTimeframe, setSelectedTimeframe] = useState<'all' | 'monthly' | 'weekly'>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usingFallback, setUsingFallback] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [rewardAvailable, setRewardAvailable] = useState<boolean>(false)
  const [activities, setActivities] = useState<Array<{ id: string; when: string; label: string; delta: string }>>([])

  // Initialize reveal-on-scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible')
          observer.unobserve(entry.target as Element)
        }
      })
    }, { threshold: 0.08 })

    const elements = document.querySelectorAll('.reveal-on-scroll')
    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  // Streak tracking and heatmap
  const dateKey = (d: Date) => d.toISOString().slice(0,10)
  const todayKey = () => dateKey(new Date())
  const yesterdayKey = () => { const d = new Date(); d.setDate(d.getDate() - 1); return dateKey(d) }

  const markVisitedToday = () => {
    const key = 'streak_visit_days'
    const raw = localStorage.getItem(key)
    const set = new Set<string>(raw ? JSON.parse(raw) : [])
    set.add(todayKey())
    localStorage.setItem(key, JSON.stringify(Array.from(set)))
  }

  const loadVisitDays = (): Set<string> => {
    const raw = localStorage.getItem('streak_visit_days')
    return new Set<string>(raw ? JSON.parse(raw) : [])
  }

  const updateStreakFromVisits = () => {
    const me = getCurrentUser()
    if (!me) return
    const visits = loadVisitDays()
    const lastVisit = localStorage.getItem('last_visit_date')
    const today = todayKey()
    const yesterday = yesterdayKey()

    let newStreak = me.dailyStreak
    if (lastVisit === today) {
      // already counted today
    } else if (lastVisit === yesterday) {
      newStreak = (me.dailyStreak || 0) + 1
    } else {
      newStreak = 1
    }

    // persist
    localStorage.setItem('last_visit_date', today)
    const updatedVisits = new Set<string>(visits)
    updatedVisits.add(today)
    localStorage.setItem('streak_visit_days', JSON.stringify(Array.from(updatedVisits)))

    if (newStreak !== me.dailyStreak) {
      setLeaderboard(prev => prev.map(u => u.id === me.id ? { ...u, dailyStreak: newStreak } : u))
    }
  }

  useEffect(() => {
    // ensure streak is up-to-date on load
    updateStreakFromVisits()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaderboard.length])

  const StreakHeatmap = () => {
    const visits = loadVisitDays()
    const days: { key: string; active: boolean }[] = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i)
      const k = dateKey(d)
      days.push({ key: k, active: visits.has(k) })
    }
    return (
      <div>
        <div className="grid gap-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(15, 1fr)' }}>
          {days.map((d) => (
            <div key={d.key} className={`h-3 rounded ${d.active ? 'bg-blue-600/80' : 'bg-slate-200'}`} title={d.key} />
          ))}
        </div>
        <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-blue-600/80" /> Active</span>
          <span className="inline-flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-slate-200" /> Inactive</span>
          <span className="ml-auto">Past 30 days</span>
        </div>
      </div>
    )
  }

  // Activity log helpers
  const addActivity = ({ label, delta }: { label: string; delta: string }) => {
    const item = { id: Math.random().toString(36).slice(2), when: new Date().toLocaleString(), label, delta }
    setActivities(prev => {
      const next = [item, ...prev].slice(0, 10)
      localStorage.setItem('gamification_recent_activities', JSON.stringify(next))
      return next
    })
  }

  // Restore filters from localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('leaderboard_filters') || 'null')
      if (saved) {
        if (saved.selectedCategory) setSelectedCategory(saved.selectedCategory)
        if (saved.selectedMetric) setSelectedMetric(saved.selectedMetric)
        if (saved.selectedTimeframe) setSelectedTimeframe(saved.selectedTimeframe)
      }
    } catch {}
  }, [])

  // Persist filters
  useEffect(() => {
    localStorage.setItem(
      'leaderboard_filters',
      JSON.stringify({ selectedCategory, selectedMetric, selectedTimeframe })
    )
  }, [selectedCategory, selectedMetric, selectedTimeframe])

  // Load current user id if present
  useEffect(() => {
    try {
      const id = localStorage.getItem('current_user_id')
      if (id) setCurrentUserId(id)
      // daily reward availability (once per calendar day)
      const last = localStorage.getItem('daily_reward_claimed_date')
      const today = new Date().toDateString()
      setRewardAvailable(last !== today)
      // recent activities
      const rawActs = localStorage.getItem('gamification_recent_activities')
      if (rawActs) setActivities(JSON.parse(rawActs))
    } catch {}
  }, [])

  useEffect(() => {
    loadLeaderboard()
  }, [selectedCategory, selectedMetric, selectedTimeframe])

  const loadLeaderboard = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Try to fetch from API first
      const res = await fetch('/api/gamification/leaderboard', {
        cache: 'no-store',
        next: { revalidate: 60 } // Revalidate every 60 seconds
      })
      
      if (!res.ok) throw new Error(`API returned ${res.status}`)
      
      const response = await res.json()
      const apiItems = response.leaderboard || response || []
      
      if (!Array.isArray(apiItems)) {
        throw new Error('Invalid leaderboard data format')
      }

      // Process the data with proper type safety
      const mapped: LeaderboardEntry[] = apiItems.map((item: any) => ({
        id: item.id || '',
        username: item.username || 'Anonymous',
        fullName: item.fullName || '',
        country: item.country || 'Unknown',
        avatarUrl: item.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.username || 'User')}`,
        rank: item.rank || 0,
        score: item.xp || 0,
        level: item.level || 1,
        xp: item.xp || 0,
        coins: item.coins || 0,
        gems: item.gems || 0,
        dailyStreak: item.dailyStreak || 0,
        achievements: item.achievementCount || 0,
      }))

      // Calculate stats
      const totalUsers = mapped.length
      const topScore = Math.max(...mapped.map(u => u.score), 0)
      const avg = totalUsers > 0 ? mapped.reduce((sum, user) => sum + user.score, 0) / totalUsers : 0
      
      // Update state
      setLeaderboard(mapped)
      setStats({
        totalUsers,
        topScore,
        averageScore: Math.round(avg * 100) / 100,
        activeToday: Math.max(1, Math.round(totalUsers * 0.6))
      })
      setUsingFallback(false)
      
    } catch (error) {
      console.error('Error loading leaderboard:', error)
      
      // Fallback to demo data
      const demo: LeaderboardEntry[] = [
        { 
          id: 'user_1', 
          username: 'AI_Master', 
          fullName: 'Alex Johnson', 
          country: 'USA', 
          avatarUrl: 'https://ui-avatars.com/api/?name=Alex+Johnson&background=random', 
          rank: 1, 
          score: 15420, 
          level: 25, 
          xp: 15420, 
          coins: 2850, 
          gems: 45, 
          dailyStreak: 127, 
          achievements: 23 
        },
        { 
          id: 'user_2', 
          username: 'UN_Explorer', 
          fullName: 'Maria Garcia', 
          country: 'Spain', 
          avatarUrl: 'https://ui-avatars.com/api/?name=Maria+Garcia&background=random',
          rank: 2, 
          score: 14200, 
          level: 23, 
          xp: 14200, 
          coins: 2650, 
          gems: 38, 
          dailyStreak: 95, 
          achievements: 21 
        },
        { 
          id: 'user_3', 
          username: 'Tech_Wizard', 
          fullName: 'James Wilson', 
          country: 'UK', 
          avatarUrl: 'https://ui-avatars.com/api/?name=James+Wilson&background=random',
          rank: 3, 
          score: 13800, 
          level: 22, 
          xp: 13800, 
          coins: 2450, 
          gems: 42, 
          dailyStreak: 112, 
          achievements: 25 
        }
      ]
      
      const totalUsers = demo.length
      const topScore = Math.max(...demo.map(u => u.score), 0)
      const avg = totalUsers > 0 ? demo.reduce((sum, user) => sum + user.score, 0) / totalUsers : 0
      
      setLeaderboard(demo)
      setStats({
        totalUsers,
        topScore,
        averageScore: Math.round(avg * 100) / 100,
        activeToday: Math.max(1, Math.round(totalUsers * 0.6))
      })
      setUsingFallback(true)
      setError('Could not load leaderboard. Showing demo data.')
      
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-400" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-300" />
      case 3:
        return <Medal className="w-5 h-5 text-orange-400" />
      default:
        return <span className="text-lg font-bold text-gray-400">#{rank}</span>
    }
  }

  const getRankChangeIcon = (change: number) => {
    if (change > 0) {
      return <TrendingUp className="w-4 h-4 text-green-400" />
    } else if (change < 0) {
      return <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />
    }
    return null
  }

  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case 'xp': return 'Experience Points'
      case 'coins': return 'Virtual Coins'
      case 'streak': return 'Daily Streak'
      case 'achievements': return 'Achievements'
      default: return 'Score'
    }
  }

  const getMetricValue = (entry: LeaderboardEntry, metric: string) => {
    switch (metric) {
      case 'xp': return entry.xp.toLocaleString()
      case 'coins': return entry.coins.toLocaleString()
      case 'streak': return `${entry.dailyStreak} days`
      case 'achievements': return `${entry.achievements} badges`
      default: return entry.score.toLocaleString()
    }
  }

  const getMetricRaw = (entry: LeaderboardEntry, metric: string) => {
    switch (metric) {
      case 'xp': return entry.xp
      case 'coins': return entry.coins
      case 'streak': return entry.dailyStreak
      case 'achievements': return entry.achievements
      default: return entry.score
    }
  }

  // Helpers for level progress
  const levelBaseXp = (level: number) => level * 1000
  const nextLevelBaseXp = (level: number) => (level + 1) * 1000
  const getCurrentUser = (): LeaderboardEntry | null => {
    if (!leaderboard.length) return null
    const found = currentUserId ? leaderboard.find(u => u.id === currentUserId) : null
    return found || leaderboard.slice().sort((a,b) => b.xp - a.xp)[0]
  }

  const claimDailyReward = () => {
    if (!rewardAvailable) return
    const user = getCurrentUser()
    if (!user) return
    const updated = leaderboard.map(u => {
      if (u.id !== user.id) return u
      return {
        ...u,
        coins: u.coins + 50,
        gems: u.gems + 1,
        xp: u.xp + 100,
        score: u.xp + 100,
      }
    })
    setLeaderboard(updated)
    localStorage.setItem('daily_reward_claimed_date', new Date().toDateString())
    setRewardAvailable(false)

    // activity log
    addActivity({ label: 'Claimed daily reward', delta: '+100 XP • +50 coins • +1 gem' })
    // mark today visited for streak view
    markVisitedToday()
  }

  // Small presentational helpers
  const LevelRing = ({ level, progress }: { level: number; progress: number }) => {
    const size = 84
    const stroke = 8
    const radius = (size - stroke) / 2
    const circumference = 2 * Math.PI * radius
    const offset = circumference * (1 - Math.max(0, Math.min(1, progress)))
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
        <circle cx={size/2} cy={size/2} r={radius} stroke="#E5E7EB" strokeWidth={stroke} fill="none" />
        <circle
          cx={size/2}
          cy={size/2}
          r={radius}
          stroke="url(#lvlgrad)"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size/2} ${size/2})`}
        />
        <defs>
          <linearGradient id="lvlgrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className="fill-slate-900" style={{ fontSize: 14, fontWeight: 700 }}>
          Lv {level}
        </text>
      </svg>
    )
  }

  const WeeklyStreakDots = ({ days }: { days: number }) => {
    // Visualize last 7 days with active/inactive dots based on current streak length
    const count = 7
    const active = Math.min(days, count)
    return (
      <div className="flex items-center gap-1.5">
        {Array.from({ length: count }).map((_, i) => (
          <span
            key={i}
            className={`h-2.5 w-2.5 rounded-full ${i < active ? 'bg-blue-600' : 'bg-slate-300'}`}
            aria-label={i < active ? 'Active day' : 'Inactive day'}
          />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <nav className="w-full aws-header border-b border-gray-200 sticky top-0 z-40 backdrop-blur glow">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="text-lg font-bold text-slate-900">HANU-YOUTH</div>
            <div className="hidden sm:flex items-center gap-6 text-sm">
              <div className="h-4 w-16 bg-white/60 rounded animate-pulse" />
              <div className="h-4 w-20 bg-white/60 rounded animate-pulse" />
              <div className="h-4 w-24 bg-white/60 rounded animate-pulse" />
            </div>
          </div>
        </nav>
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-4">
          <div className="h-10 w-64 bg-white/70 rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-white/80 border border-gray-200 rounded animate-pulse" />
            ))}
          </div>
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-16 bg-white/80 border border-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Error state UI
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <nav className="w-full aws-header border-b border-gray-200 sticky top-0 z-40 backdrop-blur glow">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="text-lg font-bold text-slate-900">HANU-YOUTH</div>
          </div>
        </nav>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <Card className="bg-white/90 border-gray-200">
            <CardContent className="p-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Leaderboard unavailable</h2>
              <p className="text-slate-600 mb-6">{error}</p>
              <Button onClick={loadLeaderboard}>Retry</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Precompute current user and progress for render
  const me = getCurrentUser()
  const baseXpForMe = me ? levelBaseXp(me.level) : 0
  const nextXpForMe = me ? nextLevelBaseXp(me.level) : 0
  const progressMe = me ? Math.max(0, Math.min(1, (me.xp - baseXpForMe) / (nextXpForMe - baseXpForMe || 1))) : 0

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

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <header className="text-center mb-12 reveal-on-scroll">
            <div className="mb-6">
              <h1 className="text-4xl md:text-5xl font-bold mb-2 text-slate-900 flex items-center justify-center gap-3">
                <Trophy className="w-8 h-8 text-primary" />
                Leaderboards
              </h1>
              <p className="text-lg md:text-xl text-slate-600 mb-2">
                Compete globally and see where you rank among the best learners
              </p>
              <p className="text-base text-slate-600">
                Track your progress and achievements across different metrics and timeframes.
              </p>
            </div>
          </header>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 reveal-on-scroll">
            <Card className="bg-white border border-gray-200 shadow-sm rounded-md hover:shadow-md transition-all duration-200">
              <CardContent className="p-5 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalUsers.toLocaleString()}</div>
                <div className="text-sm text-gray-600 mt-1">Total Learners</div>
              </CardContent>
            </Card>
            <Card className="bg-white border border-gray-200 shadow-sm rounded-md hover:shadow-md transition-all duration-200">
              <CardContent className="p-5 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.activeToday.toLocaleString()}</div>
                <div className="text-sm text-gray-600 mt-1">Active Today</div>
              </CardContent>
            </Card>
            <Card className="bg-white border border-gray-200 shadow-sm rounded-md hover:shadow-md transition-all duration-200">
              <CardContent className="p-5 text-center">
                <div className="text-2xl font-bold text-orange-500">{stats.topScore.toLocaleString()}</div>
                <div className="text-sm text-gray-600 mt-1">Top Score</div>
              </CardContent>
            </Card>
            <Card className="bg-white border border-gray-200 shadow-sm rounded-md hover:shadow-md transition-all duration-200">
              <CardContent className="p-5 text-center">
                <div className="text-2xl font-bold text-purple-600">{Math.round(stats.averageScore)}</div>
                <div className="text-sm text-gray-600 mt-1">Average Score</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="bg-white border border-gray-200 shadow-sm rounded-md mb-6 overflow-hidden">
          <CardHeader className="bg-white border-b border-gray-200 px-5 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-medium text-gray-900">Leaderboard Filters</h3>
              </div>
              {usingFallback && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs font-medium">
                  Demo Data
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <div className="space-y-6">
              {/* Filter Section */}
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: 'global', label: 'Global', icon: Globe },
                        { value: 'national', label: 'National', icon: MapPin },
                        { value: 'friends', label: 'Friends', icon: Users }
                      ].map(({ value, label, icon: Icon }) => (
                        <button
                          key={value}
                          onClick={() => setSelectedCategory(value as any)}
                          className={`px-3.5 py-1.5 text-sm rounded-md border ${
                            selectedCategory === value
                              ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium shadow-sm'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                          } transition-all duration-150 flex items-center gap-1.5`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Sort by</label>
                    <div className="flex flex-wrap gap-2">
                      {['xp', 'coins', 'streak', 'achievements'].map((metric) => (
                        <button
                          key={metric}
                          onClick={() => setSelectedMetric(metric as any)}
                          className={`px-3.5 py-1.5 text-sm rounded-md border ${
                            selectedMetric === metric
                              ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium shadow-sm'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                          } transition-all duration-150`}
                        >
                          {metric.charAt(0).toUpperCase() + metric.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Time range</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: 'all', label: 'All time' },
                        { value: 'monthly', label: 'This month' },
                        { value: 'weekly', label: 'This week' }
                      ].map(({ value, label }) => (
                        <button
                          key={value}
                          onClick={() => setSelectedTimeframe(value as any)}
                          className={`px-3.5 py-1.5 text-sm rounded-md border ${
                            selectedTimeframe === value
                              ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium shadow-sm'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                          } transition-all duration-150`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <button 
                  onClick={() => {
                    // Reset all filters
                    setSelectedCategory('global')
                    setSelectedMetric('xp')
                    setSelectedTimeframe('all')
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Reset all filters
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* My Progress & Economy Wallet */}
        {me && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 reveal-on-scroll">
              {/* My Progress */}
              <Card className="bg-white border border-gray-200 shadow-sm rounded-md md:col-span-2">
                <CardHeader className="pb-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-slate-900 flex items-center gap-2">
                        <Award className="w-5 h-5 text-primary"/> Level Progress
                        <Badge variant="outline" className="ml-2 border-slate-300 text-slate-700">Level {me.level}</Badge>
                      </CardTitle>
                      <CardDescription className="text-slate-600">Your current XP and progress to the next level</CardDescription>
                    </div>
                    <div className="shrink-0"><LevelRing level={me.level} progress={progressMe} /></div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-1">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: `${(progressMe*100).toFixed(1)}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>{baseXpForMe.toLocaleString()} XP</span>
                    <span className="font-medium text-slate-700">{(progressMe*100).toFixed(0)}% complete</span>
                    <span>Next: {nextXpForMe.toLocaleString()} XP</span>
                  </div>
                  <div className="mt-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <Flame className="w-4 h-4 text-blue-600"/>
                        <span>Daily streak</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <WeeklyStreakDots days={me.dailyStreak} />
                        <Badge variant="outline" className="border-slate-300 text-slate-700 bg-white">{me.dailyStreak} days</Badge>
                      </div>
                    </div>
                    <div className="pt-1 rounded-md border border-slate-200 bg-slate-50 p-2">
                      <StreakHeatmap />
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <Button variant="outline" size="sm" className="justify-start text-blue-700 border-slate-300">
                      <Zap className="w-4 h-4 mr-2 text-blue-600"/> Daily +10
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start text-purple-700 border-slate-300">
                      <Zap className="w-4 h-4 mr-2 text-purple-600"/> Quiz +25
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start text-pink-700 border-slate-300">
                      <Zap className="w-4 h-4 mr-2 text-pink-600"/> Search +50
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start text-orange-700 border-slate-300">
                      <Zap className="w-4 h-4 mr-2 text-orange-600"/> Innovation +100
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Economy Wallet */}
              <Card className="bg-white border border-gray-200 shadow-sm rounded-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-slate-900 flex items-center gap-2"><CoinsIcon className="w-5 h-5 text-yellow-500"/> Economy Wallet</CardTitle>
                  <CardDescription className="text-slate-600">Track your coins and gems</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <div className="flex items-center gap-2 text-slate-700"><CoinsIcon className="w-4 h-4 text-yellow-500"/> Coins</div>
                    <div className="font-semibold text-slate-900">{me.coins.toLocaleString()}</div>
                  </div>
                  <div className="flex items-center justify-between text-sm mb-3">
                    <div className="flex items-center gap-2 text-slate-700"><Gem className="w-4 h-4 text-purple-500"/> Gems</div>
                    <div className="font-semibold text-slate-900">{me.gems.toLocaleString()}</div>
                  </div>
                  <Button size="sm" className="w-full" disabled={!rewardAvailable} onClick={claimDailyReward}>
                    <Gift className="w-4 h-4 mr-2"/>
                    {rewardAvailable ? 'Claim Daily Reward (+50 coins, +1 gem, +100 XP)' : 'Daily reward already claimed'}
                  </Button>
                </CardContent>
              </Card>
            </div>
        )}

          {/* Recent activity */}
          {activities.length > 0 && (
            <Card className="bg-white border border-gray-200 shadow-sm rounded-md mb-6 reveal-on-scroll">
              <CardHeader className="pb-2">
                <CardTitle className="text-slate-900 text-base flex items-center gap-2"><Calendar className="w-4 h-4"/> Recent activity</CardTitle>
                <CardDescription className="text-slate-600">Latest rewards and progress updates</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="divide-y divide-slate-200">
                  {activities.map(a => (
                    <li key={a.id} className="py-3 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-green-500"/>
                        <span>{a.label}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 hidden sm:inline">{a.when}</span>
                        <span className="font-medium text-slate-900">{a.delta}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Leaderboard - Temporarily hidden */}
          {false && (
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200 mb-8 overflow-hidden reveal-on-scroll">
              <CardHeader className="bg-slate-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-slate-900 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    {selectedCategory === 'global' ? 'Global' : selectedCategory === 'national' ? 'National' : 'Friends'} Leaderboard
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {usingFallback && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border border-yellow-200">Demo data</Badge>
                    )}
                    <Badge variant="outline" className="border-gray-300 text-slate-600">
                      {getMetricLabel(selectedMetric)}
                    </Badge>
                    <Badge variant="outline" className="border-gray-300 text-slate-600">
                      {selectedTimeframe === 'all' ? 'All Time' : selectedTimeframe === 'monthly' ? 'This Month' : 'This Week'}
                    </Badge>
                  </div>
                </div>
                <CardDescription className="text-slate-600">
                  Showing top {leaderboard.length} players by {getMetricLabel(selectedMetric).toLowerCase()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Current User Pinned */}
                {currentUserId && leaderboard.some(u => u.id === currentUserId) && (
                  <div className="mb-4 p-3 rounded-lg border border-blue-200 bg-blue-50 flex items-center justify-between">
                    <div className="text-sm text-blue-800">You are currently ranked by {getMetricLabel(selectedMetric).toLowerCase()}.</div>
                    <a
                      href="#me"
                      className="text-blue-700 text-sm underline"
                      onClick={(e) => {
                        e.preventDefault()
                        const el = document.getElementById('me-row')
                        el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                      }}
                    >
                      Jump to me
                    </a>
                  </div>
                )}

                <div className="space-y-2">
                  {leaderboard.length === 0 ? (
                    <div className="p-6 text-center text-slate-600">No entries yet. Start playing to appear on the leaderboard!</div>
                  ) : (
                    leaderboard
                      .sort((a, b) => getMetricRaw(b, selectedMetric) - getMetricRaw(a, selectedMetric))
                      .map((entry, idx) => (
                        <div 
                          key={entry.id}
                          className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-200 hover:shadow-md ${
                            (idx + 1) <= 3 
                              ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border border-yellow-200' 
                              : 'bg-slate-50 hover:bg-slate-100'
                          }`}
                          id={entry.id === currentUserId ? 'me-row' : undefined}
                        >
                          {/* Rank */}
                          <div className="flex items-center gap-2 w-16">
                            {getRankIcon(idx + 1)}
                          </div>
                          {/* Avatar */}
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center">
                            {entry.avatarUrl ? (
                              <img
                                src={entry.avatarUrl}
                                alt={entry.username}
                                loading="lazy"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const seed = encodeURIComponent(entry.fullName || entry.username)
                                  ;(e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${seed}&background=random`
                                }}
                              />
                            ) : (
                              <span className="text-sm font-bold text-slate-600">
                                {entry.username.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>

                          {/* User Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-900 truncate">
                                {entry.fullName || entry.username}
                              </span>
                              {entry.country && (
                                <span className="text-xs text-slate-500">
                                  {entry.country}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                              <span>Level {entry.level}</span>
                              <span>{entry.achievements} achievements</span>
                              <span>{entry.dailyStreak} day streak</span>
                            </div>
                          </div>

                          {/* Score */}
                          <div className="text-right">
                            <div className="text-lg font-bold text-primary">
                              {getMetricValue(entry, selectedMetric)}
                            </div>
                            <div className="text-xs text-slate-500">
                              {getMetricLabel(selectedMetric)}
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}
      </div>
      </div>
    </div>
  )
}