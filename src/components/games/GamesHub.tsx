'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import MiniGame from './MiniGame'
import SurvivalMode from './SurvivalMode'
import TreasureHunt from './TreasureHunt'
import { 
  Gamepad2, Skull, MapPin, Trophy, 
  ArrowLeft
} from 'lucide-react'

type GameType = 'mini-games' | 'survival' | 'treasure-hunt' | null

export default function GamesHub() {
  const [selectedGame, setSelectedGame] = useState<GameType>(null)
  const [completedGames, setCompletedGames] = useState<string[]>([])
  const [totalScore, setTotalScore] = useState(0)
  const [coins, setCoins] = useState(0)
  const [banner, setBanner] = useState<string | null>(null)
  const [refreshTick, setRefreshTick] = useState(0)

  // Load rewards from localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('game_rewards') || '{}')
      if (saved) {
        setCompletedGames(Array.isArray(saved.completedGames) ? saved.completedGames : [])
        setTotalScore(typeof saved.totalScore === 'number' ? saved.totalScore : 0)
        setCoins(typeof saved.coins === 'number' ? saved.coins : 0)
      }
    } catch {}
  }, [])

  // Persist rewards
  useEffect(() => {
    const payload = { completedGames, totalScore, coins }
    try { localStorage.setItem('game_rewards', JSON.stringify(payload)) } catch {}
  }, [completedGames, totalScore, coins])

  // Daily login bonus (once per calendar day)
  useEffect(() => {
    try {
      const today = new Date();
      const yyyy = today.getFullYear()
      const mm = String(today.getMonth() + 1).padStart(2, '0')
      const dd = String(today.getDate()).padStart(2, '0')
      const key = `${yyyy}-${mm}-${dd}`
      const last = localStorage.getItem('game_last_bonus_date')
      if (last !== key) {
        setCoins(prev => prev + 20)
        localStorage.setItem('game_last_bonus_date', key)
        setBanner('+20 coins daily bonus')
        setTimeout(() => setBanner(null), 4000)
      }
    } catch {}
  }, [])

  const spendCoins = (amount: number) => {
    if (amount <= 0) return true
    if (coins < amount) {
      setBanner('Not enough coins')
      setTimeout(() => setBanner(null), 2500)
      return false
    }
    setCoins(prev => prev - amount)
    setBanner(`-${amount} coins used`)
    setTimeout(() => setBanner(null), 2000)
    return true
  }

  const clearProgress = () => {
    setCompletedGames([])
    setTotalScore(0)
    setCoins(0)
    try { localStorage.removeItem('game_rewards') } catch {}
    setBanner('Progress cleared')
    setTimeout(() => setBanner(null), 3000)
  }

  const handleGameComplete = (gameType: string, score: number, additionalData?: any) => {
    setCompletedGames(prev => Array.from(new Set([...prev, gameType])))
    setTotalScore(prev => prev + score)
    setCoins(prev => prev + Math.max(5, Math.floor(score)))
    setBanner(`+${Math.max(5, Math.floor(score))} coins • ${gameType.replace('-', ' ')} completed`)
    setTimeout(() => setBanner(null), 4000)
  }

  const renderGameSelector = () => (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="mb-1 text-2xl font-semibold text-slate-900">Interactive Learning Games</h2>
          <p className="text-sm text-slate-600">Challenge yourself with educational mini-games</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-100" onClick={() => setRefreshTick(t => t + 1)}>Refresh</Button>
          <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-100" onClick={clearProgress}>Clear Progress</Button>
        </div>
      </div>

      {banner && (
        <div className="p-3 text-center rounded-lg border border-green-200 bg-green-50 text-green-700">
          {banner}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Mini-Games Card */}
        <Card className="transition-all duration-200 border-slate-200 cursor-pointer bg-white hover:shadow-sm group"
              onClick={() => setSelectedGame('mini-games')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Gamepad2 className="w-6 h-6" />
              Mini-Games
            </CardTitle>
            <CardDescription className="text-slate-600">
              Code blocks, flow diagrams, and trivia cards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm text-slate-700">
                • Interactive coding puzzles<br/>
                • AI flow diagram challenges<br/>
                • Educational trivia cards
              </div>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-slate-700 border-slate-200">
                  3 Games
                </Badge>
                {completedGames.includes('mini-games') && (
                  <Trophy className="w-4 h-4 text-yellow-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Survival Mode Card */}
        <Card className="transition-all duration-200 border-slate-200 cursor-pointer bg-white hover:shadow-sm group"
              onClick={() => setSelectedGame('survival')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Skull className="w-6 h-6" />
              Survival Mode
            </CardTitle>
            <CardDescription className="text-slate-600">
              Timed questions with increasing difficulty
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm text-slate-700">
                • Beat the clock<br/>
                • 3 lives to survive<br/>
                • Difficulty escalates fast
              </div>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-slate-700 border-slate-200">
                  Extreme Challenge
                </Badge>
                {completedGames.includes('survival') && (
                  <Trophy className="w-4 h-4 text-yellow-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Treasure Hunt Card */}
        <Card className="transition-all duration-200 border-slate-200 cursor-pointer bg-white hover:shadow-sm group"
              onClick={() => setSelectedGame('treasure-hunt')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <MapPin className="w-6 h-6" />
              Treasure Hunt
            </CardTitle>
            <CardDescription className="text-slate-600">
              Solve riddles to discover hidden knowledge
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm text-slate-700">
                • Interactive treasure map<br/>
                • Knowledge riddles<br/>
                • Hidden rewards
              </div>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-slate-700 border-slate-200">
                  5 Treasures
                </Badge>
                {completedGames.includes('treasure-hunt') && (
                  <Trophy className="w-4 h-4 text-yellow-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rewards & Stats Overview */}
      <Card className="transition-all duration-200 border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Trophy className="w-6 h-6" />
            Your Gaming Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="p-4 text-center rounded-lg bg-slate-50">
              <div className="text-2xl font-bold text-primary">{completedGames.length}/3</div>
              <div className="text-sm text-slate-600">Games Completed</div>
            </div>
            <div className="p-4 text-center rounded-lg bg-slate-50">
              <div className="text-2xl font-bold text-yellow-600">{totalScore}</div>
              <div className="text-sm text-slate-600">Total Score</div>
            </div>
            <div className="p-4 text-center rounded-lg bg-slate-50">
              <div className="text-2xl font-bold text-green-600">
                {completedGames.length === 3 ? 'Master' : completedGames.length === 2 ? 'Expert' : completedGames.length === 1 ? 'Beginner' : 'Newcomer'}
              </div>
              <div className="text-sm text-slate-600">Skill Level</div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border bg-white">
              <div className="text-sm text-slate-600">Coins</div>
              <div className="text-2xl font-bold text-amber-600">{coins}</div>
            </div>
            <div className="p-4 rounded-lg border bg-white">
              <div className="text-sm text-slate-600">Rewards</div>
              <div className="text-slate-700">Earn coins by completing games. Redeem soon!</div>
            </div>
            <div className="p-4 rounded-lg border bg-white text-center">
              <Button variant="outline" className="border-amber-300 text-amber-700">Redeem (coming soon)</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderGame = () => {
    switch (selectedGame) {
      case 'mini-games':
        return (
          <div className="space-y-6 reveal-on-scroll">
            <div className="flex items-center gap-4">
              <Button 
                onClick={() => setSelectedGame(null)}
                variant="outline"
                className="border-gray-300 text-slate-700 hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Games
              </Button>
              <h2 className="text-2xl font-bold text-slate-900">Mini-Games Collection</h2>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <MiniGame
                gameType="code-blocks"
                difficulty="medium"
                topic="Programming Basics"
                onComplete={(score, time) => handleGameComplete('mini-games', score)}
              />
              
              <MiniGame
                gameType="flow-diagram"
                difficulty="easy"
                topic="AI Logic"
                onComplete={(score, time) => handleGameComplete('mini-games', score)}
              />
              
              <MiniGame
                gameType="trivia-cards"
                difficulty="medium"
                topic="UN Knowledge"
                onComplete={(score, time) => handleGameComplete('mini-games', score)}
              />
            </div>
          </div>
        )

      case 'survival':
        return (
          <div className="space-y-6 reveal-on-scroll">
            <div className="flex items-center gap-4">
              <Button 
                onClick={() => setSelectedGame(null)}
                variant="outline"
                className="border-gray-300 text-slate-700 hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Games
              </Button>
              <h2 className="text-2xl font-bold text-slate-900">Survival Mode</h2>
            </div>

            <SurvivalMode
              topic="AI and UN Knowledge"
              onComplete={(score, questions, time) => handleGameComplete('survival', score)}
            />
          </div>
        )

      case 'treasure-hunt':
        return (
          <div className="space-y-6 reveal-on-scroll">
            <div className="flex items-center gap-4">
              <Button 
                onClick={() => setSelectedGame(null)}
                variant="outline"
                className="border-gray-300 text-slate-700 hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Games
              </Button>
              <h2 className="text-2xl font-bold text-slate-900">Treasure Hunt</h2>
            </div>
            <TreasureHunt
              topic="AI & Tech Riddles"
              onComplete={(score, treasures) => handleGameComplete('treasure-hunt', score)}
              onSpendCoins={spendCoins}
              availableCoins={coins}
            />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-[70vh] p-4">
      <div className="max-w-6xl mx-auto">
        {selectedGame ? renderGame() : renderGameSelector()}
      </div>
    </div>
  )
}