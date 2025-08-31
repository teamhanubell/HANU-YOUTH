'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Shield, 
  Sword, 
  Users, 
  Zap, 
  Timer, 
  Trophy, 
  Target,
  Skull,
  Heart,
  Star,
  Crown,
  TrendingUp,
  Award,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'

interface Boss {
  id: string
  name: string
  title: string
  health: number
  maxHealth: number
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme'
  category: 'climate' | 'cybersecurity' | 'poverty' | 'health' | 'education'
  description: string
  rewards: { coins: number; xp: number; badges: string[] }
  weaknesses: string[]
  image: string
}

interface Team {
  id: string
  name: string
  members: number
  power: number
  leader: string
  description: string
  specialty: string
}

interface Player {
  id: string
  username: string
  level: number
  power: number
  role: string
  online: boolean
}

interface BattleAction {
  id: string
  name: string
  power: number
  description: string
  cooldown: number
  type: 'attack' | 'defense' | 'heal' | 'special'
}

const mockBosses: Boss[] = [
  {
    id: '1',
    name: 'Carbon Colossus',
    title: 'Climate Change Behemoth',
    health: 1000,
    maxHealth: 1000,
    difficulty: 'hard',
    category: 'climate',
    description: 'A massive entity feeding on carbon emissions, threatening global ecosystems.',
    rewards: { coins: 500, xp: 1000, badges: ['Climate Warrior', 'Eco Hero'] },
    weaknesses: ['Renewable Energy', 'Reforestation', 'Policy Changes'],
    image: '🌋'
  },
  {
    id: '2',
    name: 'Cyber Phantom',
    title: 'Digital Menace',
    health: 800,
    maxHealth: 800,
    difficulty: 'extreme',
    category: 'cybersecurity',
    description: 'A ghost in the machine that corrupts data and steals information.',
    rewards: { coins: 750, xp: 1500, badges: ['Cyber Guardian', 'Data Protector'] },
    weaknesses: ['Encryption', 'Firewalls', 'Security Awareness'],
    image: '👾'
  },
  {
    id: '3',
    name: 'Poverty Beast',
    title: 'Economic Terror',
    health: 1200,
    maxHealth: 1200,
    difficulty: 'medium',
    category: 'poverty',
    description: 'Feeds on inequality and economic disparity, growing stronger with each victim.',
    rewards: { coins: 400, xp: 800, badges: ['Equality Champion', 'Economic Hero'] },
    weaknesses: ['Education', 'Job Creation', 'Social Programs'],
    image: '🐉'
  },
  {
    id: '4',
    name: 'Pandemic Plague',
    title: 'Health Crisis',
    health: 900,
    maxHealth: 900,
    difficulty: 'hard',
    category: 'health',
    description: 'Spreads disease and misinformation about health solutions.',
    rewards: { coins: 600, xp: 1200, badges: ['Health Guardian', 'Life Saver'] },
    weaknesses: ['Vaccines', 'Hygiene', 'Medical Research'],
    image: '🦠'
  }
]

const mockTeams: Team[] = [
  {
    id: '1',
    name: 'Quantum Coders',
    members: 8,
    power: 2500,
    leader: 'TechMaster',
    description: 'Elite team of programmers and AI specialists',
    specialty: 'Technology & AI'
  },
  {
    id: '2',
    name: 'Green Warriors',
    members: 12,
    power: 3200,
    leader: 'EcoHero',
    description: 'Environmental activists and sustainability experts',
    specialty: 'Climate Action'
  },
  {
    id: '3',
    name: 'Global Medics',
    members: 6,
    power: 1800,
    leader: 'DrHope',
    description: 'Healthcare professionals and medical researchers',
    specialty: 'Health & Wellness'
  },
  {
    id: '4',
    name: 'Cyber Sentinels',
    members: 10,
    power: 2800,
    leader: 'NetGuardian',
    description: 'Cybersecurity experts and digital rights advocates',
    specialty: 'Digital Security'
  }
]

const mockPlayers: Player[] = [
  { id: '1', username: 'CodeNinja', level: 25, power: 450, role: 'Damage Dealer', online: true },
  { id: '2', username: 'HealerPro', level: 22, power: 380, role: 'Support', online: true },
  { id: '3', username: 'TankMaster', level: 28, power: 520, role: 'Tank', online: false },
  { id: '4', username: 'StrategyKing', level: 24, power: 410, role: 'Strategist', online: true },
  { id: '5', username: 'SpeedDemon', level: 20, power: 350, role: 'Scout', online: true }
]

const battleActions: BattleAction[] = [
  { id: '1', name: 'Knowledge Strike', power: 50, description: 'Attack with research and data', cooldown: 0, type: 'attack' },
  { id: '2', name: 'Innovation Shield', power: 30, description: 'Defend with creative solutions', cooldown: 0, type: 'defense' },
  { id: '3', name: 'Team Heal', power: 40, description: 'Restore team morale and health', cooldown: 3, type: 'heal' },
  { id: '4', name: 'AI Overdrive', power: 80, description: 'Unleash AI-powered special attack', cooldown: 5, type: 'special' }
]

export default function BossBattles() {
  const [selectedBoss, setSelectedBoss] = useState<Boss | null>(null)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [battleState, setBattleState] = useState<'idle' | 'preparing' | 'fighting' | 'victory' | 'defeat'>('idle')
  const [bossHealth, setBossHealth] = useState(0)
  const [teamHealth, setTeamHealth] = useState(100)
  const [battleTime, setBattleTime] = useState(0)
  const [playerContributions, setPlayerContributions] = useState<{[key: string]: number}>({})
  const [actionCooldowns, setActionCooldowns] = useState<{[key: string]: number}>({})
  const [battleLog, setBattleLog] = useState<string[]>([])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (battleState === 'fighting') {
      timer = setInterval(() => {
        setBattleTime(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [battleState])

  useEffect(() => {
    let cooldownTimer: NodeJS.Timeout
    if (battleState === 'fighting') {
      cooldownTimer = setInterval(() => {
        setActionCooldowns(prev => {
          const updated = { ...prev }
          Object.keys(updated).forEach(key => {
            if (updated[key] > 0) updated[key]--
          })
          return updated
        })
      }, 1000)
    }
    return () => clearInterval(cooldownTimer)
  }, [battleState])

  const startBattle = () => {
    if (!selectedBoss || !selectedTeam) return
    
    setBattleState('preparing')
    setBossHealth(selectedBoss.health)
    setTeamHealth(100)
    setBattleTime(0)
    setPlayerContributions({})
    setActionCooldowns({})
    setBattleLog([])
    
    setTimeout(() => {
      setBattleState('fighting')
      addBattleLog(`Battle started against ${selectedBoss.name}!`)
      addBattleLog(`${selectedTeam.name} team assembled and ready!`)
    }, 3000)
  }

  const performAction = (action: BattleAction) => {
    if (battleState !== 'fighting' || actionCooldowns[action.id] > 0) return
    
    // Set cooldown
    setActionCooldowns(prev => ({ ...prev, [action.id]: action.cooldown }))
    
    // Calculate damage/effect
    const basePower = action.power + Math.floor(Math.random() * 20)
    const actualPower = action.type === 'attack' ? basePower : basePower / 2
    
    if (action.type === 'attack') {
      const newBossHealth = Math.max(0, bossHealth - actualPower)
      setBossHealth(newBossHealth)
      addBattleLog(`Team used ${action.name} for ${actualPower} damage!`)
      
      // Update player contributions (simplified)
      setPlayerContributions(prev => ({
        ...prev,
        'player1': (prev['player1'] || 0) + actualPower
      }))
      
      // Check for victory
      if (newBossHealth <= 0) {
        setBattleState('victory')
        addBattleLog(`Victory! ${selectedBoss?.name} defeated!`)
        return
      }
    } else if (action.type === 'heal') {
      const newTeamHealth = Math.min(100, teamHealth + actualPower)
      setTeamHealth(newTeamHealth)
      addBattleLog(`Team healed for ${actualPower} health!`)
    }
    
    // Boss counter-attack
    setTimeout(() => {
      const bossDamage = Math.floor(Math.random() * 30) + 20
      const newTeamHealth = Math.max(0, teamHealth - bossDamage)
      setTeamHealth(newTeamHealth)
      addBattleLog(`${selectedBoss?.name} counter-attacked for ${bossDamage} damage!`)
      
      if (newTeamHealth <= 0) {
        setBattleState('defeat')
        addBattleLog(`Defeat! Team was overwhelmed by ${selectedBoss?.name}!`)
      }
    }, 1000)
  }

  const addBattleLog = (message: string) => {
    setBattleLog(prev => [...prev.slice(-9), message])
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'border-green-500/50 text-green-400'
      case 'medium': return 'border-yellow-500/50 text-yellow-400'
      case 'hard': return 'border-red-500/50 text-red-400'
      case 'extreme': return 'border-purple-500/50 text-purple-400'
      default: return 'border-gray-500/50 text-gray-400'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'climate': return 'border-green-500/50 text-green-400'
      case 'cybersecurity': return 'border-blue-500/50 text-blue-400'
      case 'poverty': return 'border-yellow-500/50 text-yellow-400'
      case 'health': return 'border-red-500/50 text-red-400'
      case 'education': return 'border-purple-500/50 text-purple-400'
      default: return 'border-gray-500/50 text-gray-400'
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-4">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <Card className="bg-black/50 backdrop-blur-sm border-red-500/30 shadow-2xl shadow-red-500/20 mb-6">
          <CardHeader>
            <CardTitle className="text-3xl text-red-400 flex items-center gap-3">
              <Skull className="w-8 h-8" />
              Boss Battles & Team Competitions
            </CardTitle>
            <CardDescription className="text-lg text-gray-300">
              Team up with other learners to defeat global challenges and save the world!
            </CardDescription>
          </CardHeader>
        </Card>

        <Tabs defaultValue="bosses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-black/50 border-red-500/30">
            <TabsTrigger value="bosses" className="data-[state=active]:bg-red-500/20">
              <Skull className="w-4 h-4 mr-2" />
              Boss Battles
            </TabsTrigger>
            <TabsTrigger value="teams" className="data-[state=active]:bg-blue-500/20">
              <Users className="w-4 h-4 mr-2" />
              Teams
            </TabsTrigger>
            <TabsTrigger value="arena" className="data-[state=active]:bg-purple-500/20">
              <Sword className="w-4 h-4 mr-2" />
              Battle Arena
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bosses" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {mockBosses.map((boss) => (
                <Card 
                  key={boss.id} 
                  className={`bg-black/30 backdrop-blur-sm ${getCategoryColor(boss.category)} hover:scale-105 transition-all cursor-pointer ${selectedBoss?.id === boss.id ? 'ring-2 ring-red-500' : ''}`}
                  onClick={() => setSelectedBoss(boss)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-4xl">{boss.image}</div>
                        <div>
                          <CardTitle className="text-xl">{boss.name}</CardTitle>
                          <CardDescription className="text-sm">{boss.title}</CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline" className={getDifficultyColor(boss.difficulty)}>
                        {boss.difficulty}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 mb-4">{boss.description}</p>
                    
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Health</span>
                        <span>{boss.health.toLocaleString()}/{boss.maxHealth.toLocaleString()}</span>
                      </div>
                      <Progress value={(boss.health / boss.maxHealth) * 100} className="h-2" />
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2 text-sm">Weaknesses:</h4>
                      <div className="flex flex-wrap gap-1">
                        {boss.weaknesses.map((weakness, index) => (
                          <Badge key={index} variant="outline" className="text-xs border-yellow-500/50 text-yellow-400">
                            {weakness}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-700 pt-3">
                      <h4 className="font-semibold mb-2 text-sm">Rewards:</h4>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Trophy className="w-4 h-4 text-yellow-400" />
                          {boss.rewards.coins} coins
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-purple-400" />
                          {boss.rewards.xp} XP
                        </span>
                        <span className="flex items-center gap-1">
                          <Award className="w-4 h-4 text-cyan-400" />
                          {boss.rewards.badges.length} badges
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="teams" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {mockTeams.map((team) => (
                <Card 
                  key={team.id} 
                  className={`bg-black/30 backdrop-blur-sm border-blue-500/30 hover:border-blue-400/50 transition-all cursor-pointer ${selectedTeam?.id === team.id ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => setSelectedTeam(team)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl text-blue-400">{team.name}</CardTitle>
                        <CardDescription>Leader: {team.leader}</CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-400">{team.power}</div>
                        <div className="text-sm text-gray-400">Team Power</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 mb-4">{team.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-xl font-bold text-green-400">{team.members}</div>
                        <div className="text-sm text-gray-400">Members</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-purple-400">{team.specialty}</div>
                        <div className="text-sm text-gray-400">Specialty</div>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-700 pt-3">
                      <h4 className="font-semibold mb-2 text-sm">Online Members:</h4>
                      <div className="flex flex-wrap gap-2">
                        {mockPlayers.slice(0, 3).map((player) => (
                          <div key={player.id} className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${player.online ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                            <span className="text-xs">{player.username}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="arena" className="space-y-6">
            {battleState === 'idle' && (
              <Card className="bg-black/50 backdrop-blur-sm border-purple-500/30">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl text-purple-400">Battle Arena</CardTitle>
                  <CardDescription>
                    Select a boss and team to start your epic battle!
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                    <div className={`p-4 rounded-lg border-2 ${selectedBoss ? 'border-red-500 bg-red-500/10' : 'border-gray-600'}`}>
                      <h3 className="font-semibold mb-2">Selected Boss</h3>
                      {selectedBoss ? (
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{selectedBoss.image}</div>
                          <div>
                            <div className="font-medium">{selectedBoss.name}</div>
                            <div className="text-sm text-gray-400">{selectedBoss.title}</div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500">No boss selected</p>
                      )}
                    </div>
                    
                    <div className={`p-4 rounded-lg border-2 ${selectedTeam ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600'}`}>
                      <h3 className="font-semibold mb-2">Selected Team</h3>
                      {selectedTeam ? (
                        <div>
                          <div className="font-medium">{selectedTeam.name}</div>
                          <div className="text-sm text-gray-400">Power: {selectedTeam.power}</div>
                        </div>
                      ) : (
                        <p className="text-gray-500">No team selected</p>
                      )}
                    </div>
                  </div>
                  
                  <Button 
                    onClick={startBattle}
                    disabled={!selectedBoss || !selectedTeam}
                    className="bg-purple-500 hover:bg-purple-600 px-8 py-3 text-lg"
                  >
                    Start Battle
                  </Button>
                </CardContent>
              </Card>
            )}

            {(battleState === 'preparing' || battleState === 'fighting' || battleState === 'victory' || battleState === 'defeat') && (
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Battle Area */}
                <div className="lg:col-span-2">
                  <Card className="bg-black/50 backdrop-blur-sm border-purple-500/30">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-purple-400">Battle Arena</CardTitle>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatTime(battleTime)}</span>
                          </div>
                          {battleState === 'victory' && (
                            <Badge className="bg-green-500">Victory!</Badge>
                          )}
                          {battleState === 'defeat' && (
                            <Badge className="bg-red-500">Defeat</Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {battleState === 'preparing' && (
                        <div className="text-center py-8">
                          <div className="text-4xl mb-4">⚔️</div>
                          <h3 className="text-xl font-semibold mb-2">Preparing for Battle...</h3>
                          <p className="text-gray-400">Get ready to face {selectedBoss?.name}!</p>
                        </div>
                      )}
                      
                      {(battleState === 'fighting' || battleState === 'victory' || battleState === 'defeat') && (
                        <div className="space-y-6">
                          {/* Boss Health */}
                          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="text-2xl">{selectedBoss?.image}</div>
                              <div className="flex-1">
                                <div className="flex justify-between items-center">
                                  <h3 className="font-semibold">{selectedBoss?.name}</h3>
                                  <span className="text-sm">{bossHealth}/{selectedBoss?.maxHealth}</span>
                                </div>
                                <Progress value={(bossHealth / (selectedBoss?.maxHealth || 1)) * 100} className="h-3" />
                              </div>
                            </div>
                          </div>
                          
                          {/* Team Health */}
                          <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="text-2xl">🛡️</div>
                              <div className="flex-1">
                                <div className="flex justify-between items-center">
                                  <h3 className="font-semibold">{selectedTeam?.name}</h3>
                                  <span className="text-sm">{teamHealth}/100</span>
                                </div>
                                <Progress value={teamHealth} className="h-3" />
                              </div>
                            </div>
                          </div>
                          
                          {/* Battle Actions */}
                          {battleState === 'fighting' && (
                            <div>
                              <h4 className="font-semibold mb-3">Battle Actions</h4>
                              <div className="grid grid-cols-2 gap-3">
                                {battleActions.map((action) => (
                                  <Button
                                    key={action.id}
                                    onClick={() => performAction(action)}
                                    disabled={actionCooldowns[action.id] > 0}
                                    className={`p-3 h-auto flex-col ${
                                      action.type === 'attack' ? 'bg-red-500 hover:bg-red-600' :
                                      action.type === 'defense' ? 'bg-blue-500 hover:bg-blue-600' :
                                      action.type === 'heal' ? 'bg-green-500 hover:bg-green-600' :
                                      'bg-purple-500 hover:bg-purple-600'
                                    }`}
                                  >
                                    <span className="font-medium">{action.name}</span>
                                    <span className="text-xs opacity-80">{action.description}</span>
                                    {actionCooldowns[action.id] > 0 && (
                                      <span className="text-xs mt-1">
                                        Cooldown: {actionCooldowns[action.id]}s
                                      </span>
                                    )}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Battle Results */}
                          {(battleState === 'victory' || battleState === 'defeat') && (
                            <div className={`text-center p-6 rounded-lg ${
                              battleState === 'victory' ? 'bg-green-500/20 border border-green-500/50' : 'bg-red-500/20 border border-red-500/50'
                            }`}>
                              <div className="text-4xl mb-3">
                                {battleState === 'victory' ? '🏆' : '💀'}
                              </div>
                              <h3 className="text-xl font-semibold mb-2">
                                {battleState === 'victory' ? 'Victory Achieved!' : 'Battle Lost'}
                              </h3>
                              <p className="text-gray-300 mb-4">
                                {battleState === 'victory' 
                                  ? `You defeated ${selectedBoss?.name} and saved the world!`
                                  : `${selectedBoss?.name} was too powerful this time.`
                                }
                              </p>
                              {battleState === 'victory' && selectedBoss && (
                                <div className="space-y-2 text-sm">
                                  <p>Rewards Earned:</p>
                                  <div className="flex justify-center gap-4">
                                    <span className="flex items-center gap-1">
                                      <Trophy className="w-4 h-4 text-yellow-400" />
                                      {selectedBoss.rewards.coins} coins
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Star className="w-4 h-4 text-purple-400" />
                                      {selectedBoss.rewards.xp} XP
                                    </span>
                                  </div>
                                </div>
                              )}
                              <Button 
                                onClick={() => setBattleState('idle')}
                                className="mt-4 bg-purple-500 hover:bg-purple-600"
                              >
                                Return to Arena
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                {/* Battle Log and Info */}
                <div className="space-y-4">
                  {/* Battle Log */}
                  <Card className="bg-black/30 backdrop-blur-sm border-gray-600/30">
                    <CardHeader>
                      <CardTitle className="text-sm">Battle Log</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1 max-h-64 overflow-y-auto">
                        {battleLog.length === 0 ? (
                          <p className="text-gray-500 text-sm">No battle events yet</p>
                        ) : (
                          battleLog.map((log, index) => (
                            <div key={index} className="text-sm p-2 bg-gray-800/50 rounded">
                              {log}
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Team Members */}
                  <Card className="bg-black/30 backdrop-blur-sm border-blue-500/30">
                    <CardHeader>
                      <CardTitle className="text-sm">Team Members</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {mockPlayers.slice(0, 3).map((player) => (
                          <div key={player.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${player.online ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                              <span>{player.username}</span>
                            </div>
                            <div className="text-gray-400">
                              Lv.{player.level} • {player.role}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}