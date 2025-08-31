'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Timer, Zap, Shield, Skull, Trophy, 
  TrendingUp, Brain, Target, CheckCircle
} from 'lucide-react'

interface SurvivalQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: string
  difficulty: number
  timeLimit: number
  category: string
}

interface SurvivalModeProps {
  topic: string
  onComplete: (finalScore: number, questionsAnswered: number, totalTime: number) => void
}

export default function SurvivalMode({ topic, onComplete }: SurvivalModeProps) {
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'completed'>('waiting')
  const [currentQuestion, setCurrentQuestion] = useState<SurvivalQuestion | null>(null)
  const [score, setScore] = useState(0)
  const [questionsAnswered, setQuestionsAnswered] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [totalTime, setTotalTime] = useState(0)
  const [streak, setStreak] = useState(0)
  const [lives, setLives] = useState(3)
  const [difficulty, setDifficulty] = useState(1)

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (gameState === 'playing' && timeLeft === 0) {
      handleTimeUp()
    }
  }, [gameState, timeLeft])

  useEffect(() => {
    if (gameState === 'playing') {
      const totalTimer = setInterval(() => {
        setTotalTime(prev => prev + 1)
      }, 1000)
      return () => clearInterval(totalTimer)
    }
  }, [gameState])

  const generateQuestion = (): SurvivalQuestion => {
    const baseTime = Math.max(15, 30 - difficulty * 2) // Less time as difficulty increases
    
    const questions: SurvivalQuestion[] = [
      {
        id: '1',
        question: 'What is the primary goal of artificial intelligence?',
        options: [
          'To replace human intelligence completely',
          'To augment human capabilities and solve complex problems',
          'To create autonomous robots',
          'To process data faster than humans'
        ],
        correctAnswer: 'To augment human capabilities and solve complex problems',
        difficulty,
        timeLimit: baseTime,
        category: 'AI Basics'
      },
      {
        id: '2',
        question: 'Which UN SDG focuses on climate action?',
        options: ['SDG 12', 'SDG 13', 'SDG 14', 'SDG 15'],
        correctAnswer: 'SDG 13',
        difficulty,
        timeLimit: baseTime,
        category: 'UN Knowledge'
      },
      {
        id: '3',
        question: 'What does machine learning enable computers to do?',
        options: [
          'Follow exact programming instructions',
          'Learn from data and improve performance',
          'Communicate in natural language',
          'Process visual information'
        ],
        correctAnswer: 'Learn from data and improve performance',
        difficulty,
        timeLimit: baseTime,
        category: 'AI/ML'
      }
    ]

    return questions[Math.floor(Math.random() * questions.length)]
  }

  const startGame = () => {
    setGameState('playing')
    setScore(0)
    setQuestionsAnswered(0)
    setStreak(0)
    setLives(3)
    setDifficulty(1)
    setTotalTime(0)
    nextQuestion()
  }

  const nextQuestion = () => {
    const question = generateQuestion()
    setCurrentQuestion(question)
    setTimeLeft(question.timeLimit)
  }

  const handleAnswer = (answer: string) => {
    if (!currentQuestion) return

    const isCorrect = answer === currentQuestion.correctAnswer
    const newQuestionsAnswered = questionsAnswered + 1
    setQuestionsAnswered(newQuestionsAnswered)

    if (isCorrect) {
      const newStreak = streak + 1
      const newScore = score + (10 * difficulty) + (newStreak * 2)
      setScore(newScore)
      setStreak(newStreak)

      // Increase difficulty every 3 correct answers
      if (newQuestionsAnswered % 3 === 0) {
        setDifficulty(prev => Math.min(prev + 1, 10))
      }

      // Continue to next question
      setTimeout(nextQuestion, 1000)
    } else {
      // Wrong answer - lose a life
      const newLives = lives - 1
      setLives(newLives)
      setStreak(0)

      if (newLives <= 0) {
        // Game over
        setGameState('completed')
        onComplete(score, newQuestionsAnswered, totalTime)
      } else {
        // Continue with same difficulty
        setTimeout(nextQuestion, 1500)
      }
    }
  }

  const handleTimeUp = () => {
    // Time's up - lose a life
    const newLives = lives - 1
    setLives(newLives)
    setStreak(0)

    if (newLives <= 0) {
      // Game over
      setGameState('completed')
      onComplete(score, questionsAnswered, totalTime)
    } else {
      // Continue with same difficulty
      setTimeout(nextQuestion, 1500)
    }
  }

  const getDifficultyColor = (diff: number) => {
    if (diff <= 3) return 'text-green-600 border-green-200'
    if (diff <= 6) return 'text-yellow-600 border-yellow-200'
    return 'text-red-600 border-red-200'
  }

  const getDifficultyName = (diff: number) => {
    if (diff <= 3) return 'Easy'
    if (diff <= 6) return 'Medium'
    if (diff <= 8) return 'Hard'
    return 'Extreme'
  }

  if (gameState === 'waiting') {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-gray-200 hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Skull className="w-6 h-6" />
            Survival Mode
          </CardTitle>
          <CardDescription className="text-slate-600">
            Answer questions before time runs out! Difficulty increases as you progress.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-slate-100 rounded-lg border">
                <div className="text-2xl font-bold text-red-600">3</div>
                <div className="text-sm text-slate-600">Lives</div>
              </div>
              <div className="p-4 bg-slate-100 rounded-lg border">
                <div className="text-2xl font-bold text-primary">∞</div>
                <div className="text-sm text-slate-600">Questions</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-slate-900">How to Play:</h4>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Answer questions before time runs out</li>
                <li>• Each correct answer increases your streak</li>
                <li>• Difficulty increases every 3 questions</li>
                <li>• Wrong answers or time-up costs a life</li>
                <li>• Game ends when you lose all 3 lives</li>
              </ul>
            </div>

            <Button 
              onClick={startGame}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3"
            >
              Start Survival Mode
            </Button>
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
            <Trophy className="w-6 h-6 text-yellow-600" />
            Survival Mode Complete!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="text-4xl font-bold text-yellow-600">{score}</div>
            <div className="text-slate-600">Final Score</div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xl font-bold text-primary">{questionsAnswered}</div>
                <div className="text-sm text-slate-600">Questions</div>
              </div>
              <div>
                <div className="text-xl font-bold text-green-600">{Math.floor(totalTime / 60)}:{(totalTime % 60).toString().padStart(2, '0')}</div>
                <div className="text-sm text-slate-600">Time</div>
              </div>
              <div>
                <div className="text-xl font-bold text-red-600">{difficulty}</div>
                <div className="text-sm text-slate-600">Max Difficulty</div>
              </div>
            </div>

            <Button 
              onClick={startGame}
              className="bg-red-600 hover:bg-red-700"
            >
              Play Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <Skull className="w-6 h-6" />
          Survival Mode
        </CardTitle>
        <CardDescription className="text-slate-600">
          Topic: {topic} • Question {questionsAnswered + 1}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Game Stats */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-yellow-600" />
                <span className="text-yellow-600 font-semibold">{score}</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-orange-600" />
                <span className="text-orange-600 font-semibold">{streak}x</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={getDifficultyColor(difficulty)}>
                Level {difficulty} - {getDifficultyName(difficulty)}
              </Badge>
            </div>
          </div>

          {/* Lives */}
          <div className="flex justify-center gap-2">
            {Array.from({ length: 3 }, (_, i) => (
              <Shield
                key={i}
                className={`w-6 h-6 ${i < lives ? 'text-red-600' : 'text-gray-400'}`}
              />
            ))}
          </div>

          {/* Timer */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Time Remaining</span>
              <span className={`font-mono font-bold ${timeLeft <= 5 ? 'text-red-600 animate-pulse' : 'text-primary'}`}>
                {timeLeft}s
              </span>
            </div>
            <Progress 
              value={(timeLeft / (currentQuestion?.timeLimit || 30)) * 100} 
              className="h-2"
            />
          </div>

          {/* Question */}
          {currentQuestion && (
            <div className="space-y-4">
              <div className="p-6 bg-slate-100 rounded-lg border">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  {currentQuestion.question}
                </h3>
                <div className="space-y-2">
                  {currentQuestion.options.map((option, index) => (
                    <Button
                      key={index}
                      onClick={() => handleAnswer(option)}
                      variant="outline"
                      className="w-full justify-start text-left hover:bg-blue-50"
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" />
                <Badge variant="outline" className="text-primary border-primary/30">
                  {currentQuestion.category}
                </Badge>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}