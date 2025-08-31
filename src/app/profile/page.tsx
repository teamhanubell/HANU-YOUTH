'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  User, Edit, Camera, Save, X, Trophy, Star, 
  Calendar, MapPin, Award, Settings, Sparkles, MessageCircle
} from 'lucide-react'

interface UserProfile {
  id: string
  username: string
  fullName?: string
  email: string
  country?: string
  bio?: string
  avatarUrl?: string
  level: number
  xp: number
  coins: number
  gems: number
  dailyStreak: number
  totalSearches: number
  totalQuizzes: number
  totalInnovations: number
  createdAt: string
  joinedAt: string
}

interface AvatarOption {
  id: string
  name: string
  url: string
  cost: { coins: number; gems: number }
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  owned: boolean
}

interface Stats {
  totalAchievements: number
  totalPlayTime: number // in hours
  joinDate: string
  lastActive: string
}

export default function ProfilePage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [avatarOptions, setAvatarOptions] = useState<AvatarOption[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({})
  const [showAvatarSelector, setShowAvatarSelector] = useState(false)
  const [loading, setLoading] = useState(true)

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

  useEffect(() => {
    loadUserProfile()
    loadStats()
    loadAvatarOptions()
  }, [])

  const loadUserProfile = async () => {
    try {
      // Mock API call
      const mockProfile: UserProfile = {
        id: 'user1',
        username: 'AlexChen',
        fullName: 'Alex Chen',
        email: 'alex.chen@example.com',
        country: 'United States',
        bio: 'Passionate about AI and making a positive impact through technology. Always learning and exploring new frontiers.',
        avatarUrl: '',
        level: 45,
        xp: 15420,
        coins: 2850,
        gems: 45,
        dailyStreak: 127,
        totalSearches: 342,
        totalQuizzes: 189,
        totalInnovations: 23,
        createdAt: '2024-01-15',
        joinedAt: '2024-01-15'
      }
      setUserProfile(mockProfile)
      setEditedProfile(mockProfile)
    } catch (error) {
      console.error('Error loading user profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      // Mock API call
      const mockStats: Stats = {
        totalAchievements: 89,
        totalPlayTime: 156,
        joinDate: '2024-01-15',
        lastActive: new Date().toISOString()
      }
      setStats(mockStats)
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const loadAvatarOptions = async () => {
    try {
      // Mock API call
      const mockAvatars: AvatarOption[] = [
        {
          id: 'avatar_default',
          name: 'Default Avatar',
          url: '',
          cost: { coins: 0, gems: 0 },
          rarity: 'common',
          owned: true
        },
        {
          id: 'avatar_cyber_ninja',
          name: 'Cyber Ninja',
          url: '',
          cost: { coins: 500, gems: 0 },
          rarity: 'rare',
          owned: true
        },
        {
          id: 'avatar_space_explorer',
          name: 'Space Explorer',
          url: '',
          cost: { coins: 750, gems: 0 },
          rarity: 'rare',
          owned: false
        },
        {
          id: 'avatar_ai_assistant',
          name: 'AI Assistant',
          url: '',
          cost: { coins: 1000, gems: 5 },
          rarity: 'epic',
          owned: false
        },
        {
          id: 'avatar_un_diplomat',
          name: 'UN Diplomat',
          url: '',
          cost: { coins: 1200, gems: 10 },
          rarity: 'legendary',
          owned: false
        }
      ]
      setAvatarOptions(mockAvatars)
    } catch (error) {
      console.error('Error loading avatar options:', error)
    }
  }

  const saveProfile = async () => {
    try {
      // Mock API call
      setUserProfile(prev => prev ? { ...prev, ...editedProfile } as UserProfile : null)
      setIsEditing(false)
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Failed to update profile')
    }
  }

  const selectAvatar = async (avatar: AvatarOption) => {
    try {
      if (!avatar.owned) {
        // Purchase avatar
        if (userProfile && userProfile.coins >= avatar.cost.coins && userProfile.gems >= avatar.cost.gems) {
          // Mock purchase
          setUserProfile(prev => prev ? {
            ...prev,
            coins: prev.coins - avatar.cost.coins,
            gems: prev.gems - avatar.cost.gems
          } : null)
          
          // Mark as owned
          setAvatarOptions(prev => prev.map(av => 
            av.id === avatar.id ? { ...av, owned: true } : av
          ))
        } else {
          alert('Insufficient currency!')
          return
        }
      }

      // Set avatar
      setUserProfile(prev => prev ? { ...prev, avatarUrl: avatar.url } : null)
      setEditedProfile(prev => ({ ...prev, avatarUrl: avatar.url }))
      setShowAvatarSelector(false)
      alert('Avatar updated successfully!')
    } catch (error) {
      console.error('Error selecting avatar:', error)
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-500/50 text-gray-400'
      case 'rare': return 'border-blue-500/50 text-blue-400'
      case 'epic': return 'border-purple-500/50 text-purple-400'
      case 'legendary': return 'border-yellow-500/50 text-yellow-400'
      default: return 'border-gray-500/50 text-gray-400'
    }
  }

  const getLevelProgress = (xp: number) => {
    const baseXP = 1000
    const levelMultiplier = 1.5
    const currentLevelXP = baseXP * Math.pow(levelMultiplier, userProfile?.level || 1)
    const nextLevelXP = baseXP * Math.pow(levelMultiplier, (userProfile?.level || 1) + 1)
    const progress = ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100
    return Math.min(Math.max(progress, 0), 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Card className="bg-white/80 backdrop-blur-sm border-red-200">
          <CardContent className="p-6">
            <p className="text-red-600">Failed to load profile</p>
          </CardContent>
        </Card>
      </div>
    )
  }

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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="text-center mb-12 reveal-on-scroll">
            <div className="mb-6">
              <h1 className="text-4xl md:text-5xl font-bold mb-2 text-slate-900 flex items-center justify-center gap-3">
                <User className="w-8 h-8 text-primary" />
                My Profile
              </h1>
              <p className="text-lg md:text-xl text-slate-600 mb-2">
                Customize your profile and track your progress
              </p>
              <p className="text-base text-slate-600">
                Manage your account settings, achievements, and personal information.
              </p>
            </div>
          </header>

        {/* Profile Overview */}
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200 mb-6 reveal-on-scroll">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <User className="w-6 h-6" />
                Profile Information
              </CardTitle>
              {!isEditing ? (
                <Button 
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={saveProfile} className="bg-green-600 hover:bg-green-700">
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button 
                    onClick={() => {
                      setIsEditing(false)
                      setEditedProfile(userProfile)
                    }}
                    variant="outline"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Avatar Section */}
              <div className="text-center space-y-4">
                <div className="relative">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center">
                    {userProfile.avatarUrl ? (
                      <img 
                        src={userProfile.avatarUrl} 
                        alt={userProfile.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-white">
                        {userProfile.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <Button 
                    onClick={() => setShowAvatarSelector(true)}
                    size="sm"
                    variant="outline"
                    className="mt-2"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Change Avatar
                  </Button>
                </div>

                {/* Level Progress */}
                <div className="space-y-2">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">Level {userProfile.level}</div>
                    <div className="text-sm text-slate-600">{userProfile.xp.toLocaleString()} XP</div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-primary to-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getLevelProgress(userProfile.xp)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-slate-500">
                    {Math.round(getLevelProgress(userProfile.xp))}% to next level
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="space-y-4">
                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-1 block">Username</label>
                      <Input
                        value={editedProfile.username || ''}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, username: e.target.value }))}
                        className="bg-white border-gray-300 text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-1 block">Full Name</label>
                      <Input
                        value={editedProfile.fullName || ''}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, fullName: e.target.value }))}
                        className="bg-white border-gray-300 text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-1 block">Country</label>
                      <Input
                        value={editedProfile.country || ''}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, country: e.target.value }))}
                        className="bg-white border-gray-300 text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-1 block">Bio</label>
                      <Textarea
                        value={editedProfile.bio || ''}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, bio: e.target.value }))}
                        className="bg-white border-gray-300 text-slate-900"
                        rows={3}
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-slate-500">Username</div>
                      <div className="font-medium text-slate-900">{userProfile.username}</div>
                    </div>
                    {userProfile.fullName && (
                      <div>
                        <div className="text-sm text-slate-500">Full Name</div>
                        <div className="font-medium text-slate-900">{userProfile.fullName}</div>
                      </div>
                    )}
                    {userProfile.country && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-500" />
                        <span className="font-medium text-slate-900">{userProfile.country}</span>
                      </div>
                    )}
                    {userProfile.bio && (
                      <div>
                        <div className="text-sm text-slate-500">Bio</div>
                        <div className="text-slate-700 text-sm">{userProfile.bio}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 reveal-on-scroll">
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{userProfile.dailyStreak}</div>
              <div className="text-sm text-slate-600">Day Streak</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{userProfile.totalQuizzes}</div>
              <div className="text-sm text-slate-600">Quizzes Taken</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{userProfile.totalSearches}</div>
              <div className="text-sm text-slate-600">Searches</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{userProfile.totalInnovations}</div>
              <div className="text-sm text-slate-600">Innovations</div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        {stats && (
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200 mb-6 reveal-on-scroll">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Trophy className="w-6 h-6" />
                Achievement Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{stats.totalAchievements}</div>
                  <div className="text-sm text-slate-600">Achievements</div>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats.totalPlayTime}h</div>
                  <div className="text-sm text-slate-600">Play Time</div>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {Math.floor((Date.now() - new Date(stats.joinDate).getTime()) / (1000 * 60 * 60 * 24))}
                  </div>
                  <div className="text-sm text-slate-600">Days Member</div>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-cyan-600">
                    {userProfile.coins + userProfile.gems * 10}
                  </div>
                  <div className="text-sm text-slate-600">Total Wealth</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Avatar Selector Modal */}
        {showAvatarSelector && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="bg-white/95 backdrop-blur-sm border-gray-200 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-slate-900">
                    <Camera className="w-6 h-6" />
                    Choose Avatar
                  </CardTitle>
                  <Button 
                    onClick={() => setShowAvatarSelector(false)}
                    variant="outline"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {avatarOptions.map(avatar => (
                    <div 
                      key={avatar.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
                        userProfile.avatarUrl === avatar.url 
                          ? 'border-primary bg-primary/10' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => selectAvatar(avatar)}
                    >
                      <div className="text-center space-y-3">
                        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-xl font-bold text-white">
                            {avatar.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 text-sm">{avatar.name}</div>
                          <Badge variant="outline" className="text-xs mt-1">
                            {avatar.rarity}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-yellow-600">{avatar.cost.coins}</span>
                          </div>
                          {avatar.cost.gems > 0 && (
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-cyan-600">{avatar.cost.gems}</span>
                            </div>
                          )}
                        </div>
                        {avatar.owned ? (
                          <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                            Owned
                          </Badge>
                        ) : (
                          <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
                            Purchase
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200 reveal-on-scroll">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Settings className="w-6 h-6" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <Button variant="outline" className="justify-start">
                <Sparkles className="w-4 h-4 mr-2" />
                Customize Theme
              </Button>
              <Button variant="outline" className="justify-start">
                <Award className="w-4 h-4 mr-2" />
                View Achievements
              </Button>
              <Button variant="outline" className="justify-start">
                <Star className="w-4 h-4 mr-2" />
                Progress Report
              </Button>
              <Button variant="outline" className="justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Activity History
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  )
}