'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  MapPin, Package, Key, Lightbulb, 
  CheckCircle, Navigation, Star
} from 'lucide-react'

interface TreasureHuntClue {
  id: string
  clue: string
  answer: string
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
  hint?: string
  reward: {
    xp: number
    coins: number
    gems: number
  }
}

interface TreasureHuntProps {
  topic: string
  onComplete: (totalScore: number, treasuresFound: number) => void
  onSpendCoins?: (amount: number) => boolean
  availableCoins?: number
}

export default function TreasureHunt({ topic, onComplete, onSpendCoins, availableCoins = 0 }: TreasureHuntProps) {
  const [gameState, setGameState] = useState<'exploring' | 'solving' | 'completed'>('exploring')
  const [currentClue, setCurrentClue] = useState<TreasureHuntClue | null>(null)
  const [foundTreasures, setFoundTreasures] = useState<string[]>([])
  const [totalScore, setTotalScore] = useState(0)
  const [hintUsed, setHintUsed] = useState(false)
  const [userAnswer, setUserAnswer] = useState('')
  const [banner, setBanner] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null)

  const SAVE_KEY = 'treasure_hunt_state'

  const treasureClues: TreasureHuntClue[] = [
    {
      id: 'ai-basics',
      clue: 'I think and learn, but not like a human. I process data and make decisions. What am I?',
      answer: 'artificial intelligence',
      difficulty: 'easy',
      category: 'AI Basics',
      hint: 'It starts with "A" and is the core of this platform',
      reward: { xp: 50, coins: 25, gems: 1 }
    },
    {
      id: 'un-sdgs',
      clue: 'There are 17 of us, working together for a better world by 2030. We cover poverty, hunger, health, and more. What are we?',
      answer: 'sustainable development goals',
      difficulty: 'medium',
      category: 'UN Knowledge',
      hint: 'They are global goals adopted by the United Nations',
      reward: { xp: 100, coins: 50, gems: 2 }
    },
    {
      id: 'machine-learning',
      clue: 'I am a subset of AI that enables systems to learn and improve from experience without being explicitly programmed. I power recommendations and predictions. What am I?',
      answer: 'machine learning',
      difficulty: 'medium',
      category: 'AI/ML',
      hint: 'It\'s about learning from data, not just following rules',
      reward: { xp: 75, coins: 40, gems: 1 }
    },
    {
      id: 'climate-action',
      clue: 'I am SDG number 13, calling for urgent action to combat climate change and its impacts. What number am I?',
      answer: '13',
      difficulty: 'easy',
      category: 'UN SDGs',
      hint: 'It\'s an unlucky number for some, but crucial for our planet',
      reward: { xp: 30, coins: 15, gems: 0 }
    },
    {
      id: 'neural-networks',
      clue: 'I mimic the human brain, with layers of interconnected nodes. I help recognize images, understand speech, and make complex decisions. What am I?',
      answer: 'neural networks',
      difficulty: 'hard',
      category: 'Deep Learning',
      hint: 'Think about how neurons connect in the brain',
      reward: { xp: 150, coins: 75, gems: 3 }
    }
  ]

  const startTreasureHunt = () => {
    setGameState('exploring')
    setFoundTreasures([])
    setTotalScore(0)
    setCurrentClue(null)
    setHintUsed(false)
    setUserAnswer('')
    try { localStorage.removeItem(SAVE_KEY) } catch {}
  }

  const exploreForTreasure = () => {
    // Find a clue that hasn't been solved yet
    const availableClues = treasureClues.filter(clue => !foundTreasures.includes(clue.id))
    
    if (availableClues.length === 0) {
      // All treasures found!
      setGameState('completed')
      onComplete(totalScore, foundTreasures.length)
      return
    }

    const randomClue = availableClues[Math.floor(Math.random() * availableClues.length)]
    setCurrentClue(randomClue)
    setGameState('solving')
    setHintUsed(false)
    setUserAnswer('')
  }

  // Autosave: persist progress
  useEffect(() => {
    try {
      const serialized = JSON.stringify({
        gameState,
        foundTreasures,
        totalScore,
        hintUsed,
        userAnswer,
        currentClueId: currentClue?.id || null,
      })
      localStorage.setItem(SAVE_KEY, serialized)
    } catch {}
  }, [gameState, foundTreasures, totalScore, hintUsed, userAnswer, currentClue])

  // Resume saved progress on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVE_KEY)
      if (!raw) return
      const data = JSON.parse(raw)
      if (!data) return
      // Rehydrate
      setGameState(data.gameState || 'exploring')
      setFoundTreasures(Array.isArray(data.foundTreasures) ? data.foundTreasures : [])
      setTotalScore(typeof data.totalScore === 'number' ? data.totalScore : 0)
      setHintUsed(!!data.hintUsed)
      setUserAnswer(typeof data.userAnswer === 'string' ? data.userAnswer : '')
      if (data.currentClueId) {
        const clue = treasureClues.find(c => c.id === data.currentClueId) || null
        setCurrentClue(clue)
      }
      setBanner({ type: 'info', message: 'Resumed your previous Treasure Hunt progress.' })
      setTimeout(() => setBanner(null), 3000)
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const submitAnswer = () => {
    if (!currentClue || !userAnswer.trim()) return

    const isCorrect = userAnswer.trim().toLowerCase() === currentClue.answer.toLowerCase()
    
    if (isCorrect) {
      // Correct answer - found treasure!
      const newFoundTreasures = [...foundTreasures, currentClue.id]
      setFoundTreasures(newFoundTreasures)
      
      const newTotalScore = totalScore + currentClue.reward.xp
      setTotalScore(newTotalScore)
      // Show inline reward banner
      setBanner({
        type: 'success',
        message: `Treasure found! +${currentClue.reward.xp} XP, +${currentClue.reward.coins} Coins, +${currentClue.reward.gems} Gems`
      })

      // Check if all treasures found
      if (newFoundTreasures.length === treasureClues.length) {
        setGameState('completed')
        onComplete(newTotalScore, newFoundTreasures.length)
        try { localStorage.removeItem(SAVE_KEY) } catch {}
      } else {
        setGameState('exploring')
        setCurrentClue(null)
      }
    } else {
      // Wrong answer
      setBanner({ type: 'error', message: 'Not quite right! Try again or use a hint.' })
    }
  }

  const useHint = () => {
    if (currentClue && !hintUsed && currentClue.hint) {
      const cost = 10
      // If spending hook exists, charge coins; otherwise allow free
      if (onSpendCoins) {
        const ok = onSpendCoins(cost)
        if (!ok) {
          setBanner({ type: 'error', message: `You need ${cost} coins to use a hint.` })
          return
        }
      }
      setHintUsed(true)
      setBanner({ type: 'info', message: `Hint: ${currentClue.hint}` })
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 border-green-200'
      case 'medium': return 'text-yellow-600 border-yellow-200'
      case 'hard': return 'text-red-600 border-red-200'
      default: return 'text-slate-600 border-slate-200'
    }
  }

  if (gameState === 'exploring') {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-gray-200 hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-600">
            <MapPin className="w-6 h-6" />
            Knowledge Hunt
          </CardTitle>
          <CardDescription className="text-slate-600">
            Topic: {topic} • Solve riddles to discover hidden treasures!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {banner && (
              <div className={`p-3 rounded-lg border text-sm ${
                banner.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' :
                banner.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' :
                'bg-blue-50 border-blue-200 text-blue-700'
              }`}>
                {banner.message}
              </div>
            )}
            {/* Progress */}
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {foundTreasures.length}/{treasureClues.length}
              </div>
              <div className="text-sm text-slate-600">Treasures Found</div>
            </div>

            {/* Treasure Map */}
            <div className="relative h-64 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg border border-yellow-200 overflow-hidden">
              {/* Decorative map elements */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-4 left-4 w-8 h-8 border-2 border-yellow-600 rounded-full"></div>
                <div className="absolute top-12 right-8 w-6 h-6 border-2 border-yellow-600 rounded-full"></div>
                <div className="absolute bottom-8 left-16 w-10 h-10 border-2 border-yellow-600 rounded-full"></div>
                <div className="absolute bottom-16 right-12 w-4 h-4 border-2 border-yellow-600 rounded-full"></div>
                
                {/* Path lines */}
                <svg className="absolute inset-0 w-full h-full">
                  <path d="M 32 32 Q 100 80 180 60 T 280 120" stroke="#ca8a04" strokeWidth="2" fill="none" opacity="0.7"/>
                  <path d="M 64 180 Q 120 140 200 160 T 300 200" stroke="#ca8a04" strokeWidth="2" fill="none" opacity="0.7"/>
                </svg>
              </div>

              {/* Found treasures */}
              {treasureClues.map((clue, index) => {
                const isFound = foundTreasures.includes(clue.id)
                const positions = [
                  { top: '15%', left: '20%' },
                  { top: '25%', left: '70%' },
                  { top: '60%', left: '30%' },
                  { top: '70%', left: '80%' },
                  { top: '45%', left: '50%' }
                ]
                
                return (
                  <div
                    key={clue.id}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ${
                      isFound ? 'scale-100' : 'scale-0'
                    }`}
                    style={positions[index]}
                  >
                    <Package className={`w-8 h-8 ${isFound ? 'text-yellow-600' : 'text-gray-400'}`} />
                  </div>
                )
              })}

              {/* X marks the spot for current exploration */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-bounce">
                <div className="text-4xl text-red-600 font-bold">X</div>
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-2">
              <h4 className="font-semibold text-slate-900">How to Play:</h4>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Explore the map to find hidden knowledge treasures</li>
                <li>• Solve riddles and answer questions to unlock treasures</li>
                <li>• Use hints wisely if you get stuck</li>
                <li>• Collect all treasures to complete the hunt!</li>
              </ul>
            </div>

            <Button 
              onClick={exploreForTreasure}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3"
              disabled={foundTreasures.length === treasureClues.length}
            >
              {foundTreasures.length === treasureClues.length ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  All Treasures Found!
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4 mr-2" />
                  Explore for Treasure
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (gameState === 'solving' && currentClue) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-600">
            <Key className="w-6 h-6" />
            Solve the Riddle
          </CardTitle>
          <CardDescription className="text-slate-600">
            Treasure {foundTreasures.length + 1} of {treasureClues.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Clue Display */}
            <div className="p-6 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-yellow-600 mt-1 flex-shrink-0" />
                <p className="text-slate-800 text-lg leading-relaxed">{currentClue.clue}</p>
              </div>
            </div>

            {/* Difficulty and Category */}
            <div className="flex justify-between items-center">
              <Badge variant="outline" className={getDifficultyColor(currentClue.difficulty)}>
                {currentClue.difficulty}
              </Badge>
              <Badge variant="outline" className="text-primary border-primary/30">
                {currentClue.category}
              </Badge>
            </div>

            {/* Answer Input */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700">Your Answer:</label>
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-slate-900 placeholder-slate-500 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-200"
                onKeyPress={(e) => e.key === 'Enter' && submitAnswer()}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                onClick={submitAnswer}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                disabled={!userAnswer.trim()}
              >
                <Key className="w-4 h-4 mr-2" />
                Unlock Treasure
              </Button>
              
              {currentClue.hint && !hintUsed && (
                <Button 
                  onClick={useHint}
                  variant="outline"
                  className="border-primary/30 text-primary hover:bg-blue-50"
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Use Hint
                </Button>
              )}
            </div>

            {/* Reward Preview */}
            <div className="p-4 bg-slate-100 rounded-lg border border-gray-300">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Treasure Rewards:</span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm text-yellow-600">+{currentClue.reward.xp} XP</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-yellow-600">+{currentClue.reward.coins} Coins</span>
                  </div>
                  {currentClue.reward.gems > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-primary">+{currentClue.reward.gems} Gems</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (gameState === 'completed') {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Package className="w-6 h-6 text-yellow-600" />
            Treasure Hunt Complete!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="text-6xl">🏆</div>
            <div className="text-3xl font-bold text-yellow-600">{totalScore}</div>
            <div className="text-slate-600">Total XP Earned</div>
            
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{foundTreasures.length}</div>
                <div className="text-sm text-slate-600">Treasures Found</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {Math.round((foundTreasures.length / treasureClues.length) * 100)}%
                </div>
                <div className="text-sm text-slate-600">Completion</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-slate-900">Treasures Discovered:</h4>
              <div className="grid grid-cols-1 gap-2">
                {treasureClues.map(clue => (
                  <div key={clue.id} className="flex items-center gap-2 text-sm">
                    <CheckCircle className={`w-4 h-4 ${foundTreasures.includes(clue.id) ? 'text-green-600' : 'text-gray-400'}`} />
                    <span className={foundTreasures.includes(clue.id) ? 'text-slate-700' : 'text-gray-400'}>
                      {clue.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Button 
              onClick={startTreasureHunt}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Start New Hunt
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return null
}