'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Trophy, 
  Flame, 
  Star, 
  Zap, 
  Users, 
  Target, 
  Gift, 
  Crown,
  Coins,
  Clock,
  TrendingUp,
  Award,
  Gamepad2,
  Shield,
  Sword,
  Gem
} from 'lucide-react'

interface UserProfile {
  username: string
  level: number
  xp: number
  xpToNext: number
  streak: number
  coins: number
  gems: number
  rank: string
  title: string
  avatar: string
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlocked: boolean
  progress: number
  maxProgress: number
}

interface PowerUp {
  id: string
  name: string
  description: string
  cost: number
  currency: 'coins' | 'gems'
  icon: string
  duration: string
  active: boolean
}

interface DailyChallenge {
  id: string
  title: string
  description: string
  reward: { coins: number; xp: number }
  completed: boolean
  difficulty: 'easy' | 'medium' | 'hard'
}

const mockUser: UserProfile = {
  username: 'CyberLearner',
  level: 12,
  xp: 2450,
  xpToNext: 3000,
  streak: 7,
  coins: 1250,
  gems: 15,
  rank: 'Silver Innovator',
  title: 'Data Wizard',
  avatar: '/api/placeholder/80/80'
}

const mockAchievements: Achievement[] = [
  {
    id: '1',
    title: 'Research Novice',
    description: 'Complete 10 research papers',
    icon: '📚',
    rarity: 'common',
    unlocked: true,
    progress: 10,
    maxProgress: 10
  },
  {
    id: '2',
    title: 'AI Explorer',
    description: 'Master 5 AI concepts',
    icon: '🤖',
    rarity: 'rare',
    unlocked: true,
    progress: 5,
    maxProgress: 5
  },
  {
    id: '3',
    title: 'Hackathon Hero',
    description: 'Win 3 hackathons',
    icon: '🏆',
    rarity: 'epic',
    unlocked: false,
    progress: 1,
    maxProgress: 3
  },
  {
    id: '4',
    title: 'Global Ambassador',
    description: 'Participate in 10 global events',
    icon: '🌍',
    rarity: 'legendary',
    unlocked: false,
    progress: 3,
    maxProgress: 10
  }
]

const mockPowerUps: PowerUp[] = [
  {
    id: '1',
    name: 'Double XP',
    description: '2x XP for 1 hour',
    cost: 100,
    currency: 'coins',
    icon: '⚡',
    duration: '1 hour',
    active: false
  },
  {
    id: '2',
    name: 'Time Freeze',
    description: 'Pause timer in challenges',
    cost: 50,
    currency: 'coins',
    icon: '⏰',
    duration: 'Single use',
    active: false
  },
  {
    id: '3',
    name: 'Hint Master',
    description: 'Get hints in quizzes',
    cost: 5,
    currency: 'gems',
    icon: '💡',
    duration: '24 hours',
    active: true
  }
]

const mockDailyChallenges: DailyChallenge[] = [
  {
    id: '1',
    title: 'Daily Research',
    description: 'Read and summarize one research paper',
    reward: { coins: 50, xp: 100 },
    completed: false,
    difficulty: 'easy'
  },
  {
    id: '2',
    title: 'AI Quiz Master',
    description: 'Complete 3 AI concept quizzes',
    reward: { coins: 100, xp: 200 },
    completed: true,
    difficulty: 'medium'
  },
  {
    id: '3',
    title: 'Innovation Sprint',
    description: 'Submit one innovation idea',
    reward: { coins: 150, xp: 300 },
    completed: false,
    difficulty: 'hard'
  }
]

const rarityColors = {
  common: 'border-gray-500/50 text-gray-400',
  rare: 'border-blue-500/50 text-blue-400',
  epic: 'border-purple-500/50 text-purple-400',
  legendary: 'border-yellow-500/50 text-yellow-400'
}

const difficultyColors = {
  easy: 'border-green-500/50 text-green-400',
  medium: 'border-yellow-500/50 text-yellow-400',
  hard: 'border-red-500/50 text-red-400'
}

export default function GamificationDashboard() {
  const [user, setUser] = useState<UserProfile>(mockUser)
  const [achievements, setAchievements] = useState<Achievement[]>(mockAchievements)
  const [powerUps, setPowerUps] = useState<PowerUp[]>(mockPowerUps)
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>(mockDailyChallenges)

  const handlePowerUpPurchase = (powerUp: PowerUp) => {
    if (powerUp.currency === 'coins' && user.coins >= powerUp.cost) {
      setUser(prev => ({ ...prev, coins: prev.coins - powerUp.cost }))
      setPowerUps(prev => 
        prev.map(p => p.id === powerUp.id ? { ...p, active: true } : p)
      )
    } else if (powerUp.currency === 'gems' && user.gems >= powerUp.cost) {
      setUser(prev => ({ ...prev, gems: prev.gems - powerUp.cost }))
      setPowerUps(prev => 
        prev.map(p => p.id === powerUp.id ? { ...p, active: true } : p)
      )
    }
  }

  const handleChallengeComplete = (challengeId: string) => {
    const challenge = dailyChallenges.find(c => c.id === challengeId)
    if (challenge && !challenge.completed) {
      setUser(prev => ({
        ...prev,
        coins: prev.coins + challenge.reward.coins,
        xp: prev.xp + challenge.reward.xp
      }))
      setDailyChallenges(prev =>
        prev.map(c => c.id === challengeId ? { ...c, completed: true } : c)
      )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-4">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* User Profile Header */}
        <Card className="bg-black/50 backdrop-blur-sm border-cyan-500/30 shadow-2xl shadow-cyan-500/20 mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center text-2xl">
                  👤
                </div>
                <div>
                  <CardTitle className="text-2xl text-cyan-400">{user.username}</CardTitle>
                  <CardDescription className="text-lg text-purple-400">{user.title} • {user.rank}</CardDescription>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="border-yellow-500/50 text-yellow-400">
                      <Crown className="w-3 h-3 mr-1" />
                      Level {user.level}
                    </Badge>
                    <Badge className="border-orange-500/50 text-orange-400">
                      <Flame className="w-3 h-3 mr-1" />
                      {user.streak} day streak
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex items-center gap-1">
                    <Coins className="w-5 h-5 text-yellow-400" />
                    <span className="text-lg font-semibold">{user.coins}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Gem className="w-5 h-5 text-cyan-400" />
                    <span className="text-lg font-semibold">{user.gems}</span>
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  XP: {user.xp}/{user.xpToNext}
                </div>
                <Progress value={(user.xp / user.xpToNext) * 100} className="w-48 mt-1" />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Main Dashboard */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-black/50 border-cyan-500/30">
            <TabsTrigger value="overview" className="data-[state=active]:bg-cyan-500/20">
              <TrendingUp className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-purple-500/20">
              <Award className="w-4 h-4 mr-2" />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="challenges" className="data-[state=active]:bg-green-500/20">
              <Target className="w-4 h-4 mr-2" />
              Challenges
            </TabsTrigger>
            <TabsTrigger value="powerups" className="data-[state=active]:bg-yellow-500/20">
              <Zap className="w-4 h-4 mr-2" />
              Power-Ups
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="data-[state=active]:bg-red-500/20">
              <Trophy className="w-4 h-4 mr-2" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value="games" className="data-[state=active]:bg-pink-500/20">
              <Gamepad2 className="w-4 h-4 mr-2" />
              Mini-Games
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-black/30 backdrop-blur-sm border-purple-500/30 hover:border-purple-400/50 transition-all">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-purple-400">
                    <Star className="w-5 h-5" />
                    Level Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">{user.level}</div>
                  <Progress value={(user.xp / user.xpToNext) * 100} className="mb-2" />
                  <div className="text-sm text-gray-400">
                    {user.xpToNext - user.xp} XP to next level
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/30 backdrop-blur-sm border-orange-500/30 hover:border-orange-400/50 transition-all">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-orange-400">
                    <Flame className="w-5 h-5" />
                    Daily Streak
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">{user.streak} days</div>
                  <div className="text-sm text-gray-400">
                    Keep it up! 🔥
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/30 backdrop-blur-sm border-yellow-500/30 hover:border-yellow-400/50 transition-all">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-yellow-400">
                    <Coins className="w-5 h-5" />
                    Virtual Currency
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="text-2xl font-bold">{user.coins}</div>
                      <div className="text-sm text-gray-400">Coins</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{user.gems}</div>
                      <div className="text-sm text-gray-400">Gems</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/30 backdrop-blur-sm border-green-500/30 hover:border-green-400/50 transition-all">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-green-400">
                    <Target className="w-5 h-5" />
                    Daily Goals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">
                    {dailyChallenges.filter(c => c.completed).length}/{dailyChallenges.length}
                  </div>
                  <div className="text-sm text-gray-400">
                    Challenges completed
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-black/30 backdrop-blur-sm border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-cyan-400">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-cyan-500/10 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center">
                        📚
                      </div>
                      <div>
                        <div className="font-medium">Completed Research Paper</div>
                        <div className="text-sm text-gray-400">2 hours ago</div>
                      </div>
                    </div>
                    <Badge className="border-cyan-500/50 text-cyan-400">+50 XP</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-purple-500/10 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                        🏆
                      </div>
                      <div>
                        <div className="font-medium">Achievement Unlocked</div>
                        <div className="text-sm text-gray-400">AI Explorer</div>
                      </div>
                    </div>
                    <Badge className="border-purple-500/50 text-purple-400">+100 XP</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        🎯
                      </div>
                      <div>
                        <div className="font-medium">Daily Challenge</div>
                        <div className="text-sm text-gray-400">AI Quiz Master</div>
                      </div>
                    </div>
                    <Badge className="border-green-500/50 text-green-400">+200 XP</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement) => (
                <Card 
                  key={achievement.id} 
                  className={`bg-black/30 backdrop-blur-sm ${achievement.unlocked ? rarityColors[achievement.rarity] : 'border-gray-700/50'} transition-all hover:scale-105`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="text-3xl">{achievement.icon}</div>
                      <Badge variant="outline" className={rarityColors[achievement.rarity]}>
                        {achievement.rarity}
                      </Badge>
                    </div>
                    <CardTitle className={achievement.unlocked ? 'text-white' : 'text-gray-500'}>
                      {achievement.title}
                    </CardTitle>
                    <CardDescription className={achievement.unlocked ? 'text-gray-300' : 'text-gray-600'}>
                      {achievement.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{achievement.progress}/{achievement.maxProgress}</span>
                      </div>
                      <Progress value={(achievement.progress / achievement.maxProgress) * 100} />
                      {achievement.unlocked && (
                        <div className="text-center text-green-400 text-sm font-medium mt-2">
                          ✅ Unlocked!
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="challenges" className="space-y-6">
            <Card className="bg-black/30 backdrop-blur-sm border-green-500/30">
              <CardHeader>
                <CardTitle className="text-green-400">Daily Challenges</CardTitle>
                <CardDescription>
                  Complete daily challenges to earn rewards and maintain your streak!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dailyChallenges.map((challenge) => (
                    <div 
                      key={challenge.id} 
                      className={`p-4 rounded-lg border ${challenge.completed ? 'border-green-500/50 bg-green-500/10' : difficultyColors[challenge.difficulty]}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{challenge.title}</h3>
                        <Badge variant="outline" className={difficultyColors[challenge.difficulty]}>
                          {challenge.difficulty}
                        </Badge>
                      </div>
                      <p className="text-gray-300 mb-3">{challenge.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Coins className="w-4 h-4 text-yellow-400" />
                            {challenge.reward.coins}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-purple-400" />
                            {challenge.reward.xp} XP
                          </span>
                        </div>
                        <Button 
                          onClick={() => handleChallengeComplete(challenge.id)}
                          disabled={challenge.completed}
                          size="sm"
                          className={challenge.completed ? 'bg-green-600' : 'bg-green-500 hover:bg-green-600'}
                        >
                          {challenge.completed ? 'Completed' : 'Start Challenge'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="powerups" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {powerUps.map((powerUp) => (
                <Card 
                  key={powerUp.id} 
                  className={`bg-black/30 backdrop-blur-sm border-yellow-500/30 ${powerUp.active ? 'ring-2 ring-yellow-500' : ''}`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="text-3xl">{powerUp.icon}</div>
                      {powerUp.active && (
                        <Badge className="bg-yellow-500 text-black">Active</Badge>
                      )}
                    </div>
                    <CardTitle className="text-yellow-400">{powerUp.name}</CardTitle>
                    <CardDescription>{powerUp.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Duration:</span>
                        <span className="text-sm">{powerUp.duration}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Cost:</span>
                        <div className="flex items-center gap-1">
                          {powerUp.currency === 'coins' ? (
                            <Coins className="w-4 h-4 text-yellow-400" />
                          ) : (
                            <Gem className="w-4 h-4 text-cyan-400" />
                          )}
                          <span className="font-medium">{powerUp.cost}</span>
                        </div>
                      </div>
                      <Button 
                        onClick={() => handlePowerUpPurchase(powerUp)}
                        disabled={powerUp.active || 
                          (powerUp.currency === 'coins' && user.coins < powerUp.cost) ||
                          (powerUp.currency === 'gems' && user.gems < powerUp.cost)
                        }
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                        size="sm"
                      >
                        {powerUp.active ? 'Active' : 'Purchase'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-6">
            <Card className="bg-black/30 backdrop-blur-sm border-red-500/30">
              <CardHeader>
                <CardTitle className="text-red-400">Global Leaderboard</CardTitle>
                <CardDescription>
                  Compete with learners worldwide for the top spot!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { rank: 1, username: 'QuantumCoder', level: 25, xp: 8900, country: '🇺🇸' },
                    { rank: 2, username: 'AIAvatar', level: 23, xp: 7650, country: '🇬🇧' },
                    { rank: 3, username: 'DataWizard', level: 22, xp: 7200, country: '🇯🇵' },
                    { rank: 4, username: 'CyberLearner', level: 20, xp: 6800, country: '🇩🇪' },
                    { rank: 5, username: 'TechNinja', level: 19, xp: 6450, country: '🇰🇷' },
                    { rank: 15, username: 'You', level: user.level, xp: user.xp, country: '🌍', isCurrentUser: true }
                  ].map((player) => (
                    <div 
                      key={player.rank} 
                      className={`flex items-center justify-between p-3 rounded-lg ${player.isCurrentUser ? 'bg-cyan-500/20 border border-cyan-500/50' : 'bg-gray-800/50'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          player.rank <= 3 ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-white'
                        }`}>
                          {player.rank}
                        </div>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {player.username}
                            {player.isCurrentUser && <Badge className="bg-cyan-500">You</Badge>}
                          </div>
                          <div className="text-sm text-gray-400">
                            Level {player.level} • {player.country}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{player.xp.toLocaleString()} XP</div>
                        <div className="text-sm text-gray-400">Global Rank #{player.rank}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="games" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="bg-black/30 backdrop-blur-sm border-purple-500/30 hover:border-purple-400/50 transition-all cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-purple-400">Code Blocks</CardTitle>
                  <CardDescription>
                    Drag and drop code blocks to solve programming puzzles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl mb-3">🧩</div>
                  <Button className="w-full bg-purple-500 hover:bg-purple-600">
                    Play Now
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-black/30 backdrop-blur-sm border-cyan-500/30 hover:border-cyan-400/50 transition-all cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-cyan-400">AI Flow Diagrams</CardTitle>
                  <CardDescription>
                    Connect AI concepts to build intelligent systems
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl mb-3">🤖</div>
                  <Button className="w-full bg-cyan-500 hover:bg-cyan-600">
                    Play Now
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-black/30 backdrop-blur-sm border-green-500/30 hover:border-green-400/50 transition-all cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-green-400">UN Trivia Cards</CardTitle>
                  <CardDescription>
                    Test your knowledge of global affairs and UN initiatives
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl mb-3">🌍</div>
                  <Button className="w-full bg-green-500 hover:bg-green-600">
                    Play Now
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-black/30 backdrop-blur-sm border-red-500/30 hover:border-red-400/50 transition-all cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-red-400">Speed Quiz</CardTitle>
                  <CardDescription>
                    Fast-paced quiz with increasing difficulty
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl mb-3">⚡</div>
                  <Button className="w-full bg-red-500 hover:bg-red-600">
                    Play Now
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-black/30 backdrop-blur-sm border-yellow-500/30 hover:border-yellow-400/50 transition-all cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-yellow-400">Treasure Hunt</CardTitle>
                  <CardDescription>
                    Solve riddles to unlock hidden knowledge treasures
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl mb-3">💎</div>
                  <Button className="w-full bg-yellow-500 hover:bg-yellow-600">
                    Play Now
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-black/30 backdrop-blur-sm border-pink-500/30 hover:border-pink-400/50 transition-all cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-pink-400">Boss Battle</CardTitle>
                  <CardDescription>
                    Team up to defeat global challenges
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl mb-3">👾</div>
                  <Button className="w-full bg-pink-500 hover:bg-pink-600">
                    Play Now
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}