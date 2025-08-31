'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Code, 
  Brain, 
  Globe, 
  Zap, 
  Timer, 
  Trophy, 
  Target,
  CheckCircle,
  XCircle,
  ArrowRight,
  Shuffle,
  Lightbulb,
  Users
} from 'lucide-react'

interface GameState {
  score: number
  level: number
  timeLeft: number
  lives: number
  isPlaying: boolean
  gameOver: boolean
}

interface CodeBlock {
  id: string
  type: 'variable' | 'function' | 'loop' | 'condition' | 'output'
  code: string
  color: string
}

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  category: 'ai' | 'un' | 'cs' | 'general'
  difficulty: 'easy' | 'medium' | 'hard'
}

interface AIFlowNode {
  id: string
  type: 'input' | 'process' | 'decision' | 'output'
  label: string
  x: number
  y: number
  connections: string[]
}

const codeBlocks: CodeBlock[] = [
  { id: '1', type: 'variable', code: 'let x = 5;', color: 'bg-blue-500' },
  { id: '2', type: 'function', code: 'function add(a, b) {', color: 'bg-green-500' },
  { id: '3', type: 'loop', code: 'for (let i = 0; i < 10; i++) {', color: 'bg-yellow-500' },
  { id: '4', type: 'condition', code: 'if (x > 0) {', color: 'bg-red-500' },
  { id: '5', type: 'output', code: 'console.log(result);', color: 'bg-purple-500' },
  { id: '6', type: 'function', code: 'return a + b;', color: 'bg-green-500' },
  { id: '7', type: 'loop', code: '}', color: 'bg-yellow-500' },
  { id: '8', type: 'condition', code: '}', color: 'bg-red-500' },
  { id: '9', type: 'function', code: '}', color: 'bg-green-500' }
]

const quizQuestions: QuizQuestion[] = [
  {
    id: '1',
    question: 'What does AI stand for?',
    options: ['Artificial Intelligence', 'Automated Intelligence', 'Advanced Intelligence', 'Applied Intelligence'],
    correctAnswer: 0,
    category: 'ai',
    difficulty: 'easy'
  },
  {
    id: '2',
    question: 'Which UN agency focuses on education?',
    options: ['UNICEF', 'UNESCO', 'WHO', 'UNDP'],
    correctAnswer: 1,
    category: 'un',
    difficulty: 'easy'
  },
  {
    id: '3',
    question: 'What is the time complexity of binary search?',
    options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
    correctAnswer: 1,
    category: 'cs',
    difficulty: 'medium'
  },
  {
    id: '4',
    question: 'When was the United Nations founded?',
    options: ['1945', '1950', '1939', '1965'],
    correctAnswer: 0,
    category: 'un',
    difficulty: 'medium'
  },
  {
    id: '5',
    question: 'What is machine learning?',
    options: ['A type of computer hardware', 'A subset of AI that enables systems to learn from data', 'A programming language', 'A type of database'],
    correctAnswer: 1,
    category: 'ai',
    difficulty: 'easy'
  }
]

const aiFlowNodes: AIFlowNode[] = [
  { id: 'input1', type: 'input', label: 'Input Data', x: 50, y: 50, connections: ['process1'] },
  { id: 'process1', type: 'process', label: 'Preprocessing', x: 200, y: 50, connections: ['decision1'] },
  { id: 'decision1', type: 'decision', label: 'Data Valid?', x: 350, y: 50, connections: ['process2', 'output1'] },
  { id: 'process2', type: 'process', label: 'Train Model', x: 350, y: 150, connections: ['output2'] },
  { id: 'output1', type: 'output', label: 'Error', x: 500, y: 50, connections: [] },
  { id: 'output2', type: 'output', label: 'Prediction', x: 500, y: 150, connections: [] }
]

export default function MiniGames() {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    level: 1,
    timeLeft: 60,
    lives: 3,
    isPlaying: false,
    gameOver: false
  })

  const [currentGame, setCurrentGame] = useState<string>('codeblocks')
  const [draggedBlock, setDraggedBlock] = useState<CodeBlock | null>(null)
  const [droppedBlocks, setDroppedBlocks] = useState<CodeBlock[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState<boolean>(false)
  const [connectedNodes, setConnectedNodes] = useState<string[]>([])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (gameState.isPlaying && gameState.timeLeft > 0) {
      timer = setTimeout(() => {
        setGameState(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }))
      }, 1000)
    } else if (gameState.timeLeft === 0) {
      setGameState(prev => ({ ...prev, isPlaying: false, gameOver: true }))
    }
    return () => clearTimeout(timer)
  }, [gameState.isPlaying, gameState.timeLeft])

  const startGame = (gameType: string) => {
    setCurrentGame(gameType)
    setGameState({
      score: 0,
      level: 1,
      timeLeft: 60,
      lives: 3,
      isPlaying: true,
      gameOver: false
    })
    
    if (gameType === 'quiz') {
      loadRandomQuestion()
    } else if (gameType === 'codeblocks') {
      setDroppedBlocks([])
    } else if (gameType === 'aiflow') {
      setConnectedNodes([])
    }
  }

  const loadRandomQuestion = () => {
    const randomQuestion = quizQuestions[Math.floor(Math.random() * quizQuestions.length)]
    setCurrentQuestion(randomQuestion)
    setSelectedAnswer(null)
    setShowResult(false)
  }

  const handleDragStart = (block: CodeBlock) => {
    setDraggedBlock(block)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (draggedBlock && !droppedBlocks.find(b => b.id === draggedBlock.id)) {
      setDroppedBlocks(prev => [...prev, draggedBlock])
      setGameState(prev => ({ ...prev, score: prev.score + 10 }))
    }
    setDraggedBlock(null)
  }

  const handleAnswerSelect = (answerIndex: number) => {
    if (!currentQuestion || showResult) return
    
    setSelectedAnswer(answerIndex)
    setShowResult(true)
    
    if (answerIndex === currentQuestion.correctAnswer) {
      setGameState(prev => ({ 
        ...prev, 
        score: prev.score + (currentQuestion.difficulty === 'easy' ? 10 : currentQuestion.difficulty === 'medium' ? 20 : 30)
      }))
    } else {
      setGameState(prev => ({ ...prev, lives: prev.lives - 1 }))
    }
    
    setTimeout(() => {
      if (gameState.lives > 1) {
        loadRandomQuestion()
      } else {
        setGameState(prev => ({ ...prev, isPlaying: false, gameOver: true }))
      }
    }, 2000)
  }

  const handleNodeConnect = (nodeId: string) => {
    if (!connectedNodes.includes(nodeId)) {
      setConnectedNodes(prev => [...prev, nodeId])
      setGameState(prev => ({ ...prev, score: prev.score + 5 }))
    }
  }

  const resetGame = () => {
    setGameState({
      score: 0,
      level: 1,
      timeLeft: 60,
      lives: 3,
      isPlaying: false,
      gameOver: false
    })
    setCurrentGame('codeblocks')
    setDroppedBlocks([])
    setCurrentQuestion(null)
    setSelectedAnswer(null)
    setShowResult(false)
    setConnectedNodes([])
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'border-green-500/50 text-green-400'
      case 'medium': return 'border-yellow-500/50 text-yellow-400'
      case 'hard': return 'border-red-500/50 text-red-400'
      default: return 'border-gray-500/50 text-gray-400'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ai': return <Brain className="w-4 h-4" />
      case 'un': return <Globe className="w-4 h-4" />
      case 'cs': return <Code className="w-4 h-4" />
      default: return <Target className="w-4 h-4" />
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

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Game Header */}
        <Card className="bg-black/50 backdrop-blur-sm border-cyan-500/30 shadow-2xl shadow-cyan-500/20 mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl text-cyan-400">🎮 Mini-Games Hub</CardTitle>
                <CardDescription className="text-gray-400">
                  Learn through play with our interactive educational games
                </CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-sm text-gray-400">Score</div>
                  <div className="text-xl font-bold text-yellow-400">{gameState.score}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-400">Time</div>
                  <div className="text-xl font-bold text-red-400 flex items-center gap-1">
                    <Timer className="w-4 h-4" />
                    {gameState.timeLeft}s
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-400">Lives</div>
                  <div className="text-xl font-bold text-red-400">
                    {Array.from({ length: gameState.lives }).map((_, i) => '❤️').join('')}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {!gameState.isPlaying && !gameState.gameOver && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <Card className="bg-black/30 backdrop-blur-sm border-purple-500/30 hover:border-purple-400/50 transition-all cursor-pointer">
              <CardHeader>
                <CardTitle className="text-purple-400 flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Code Blocks
                </CardTitle>
                <CardDescription>
                  Drag and drop code blocks to create working programs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => startGame('codeblocks')}
                  className="w-full bg-purple-500 hover:bg-purple-600"
                >
                  Start Coding
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-black/30 backdrop-blur-sm border-cyan-500/30 hover:border-cyan-400/50 transition-all cursor-pointer">
              <CardHeader>
                <CardTitle className="text-cyan-400 flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Speed Quiz
                </CardTitle>
                <CardDescription>
                  Test your knowledge with fast-paced quizzes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => startGame('quiz')}
                  className="w-full bg-cyan-500 hover:bg-cyan-600"
                >
                  Start Quiz
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-black/30 backdrop-blur-sm border-green-500/30 hover:border-green-400/50 transition-all cursor-pointer">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center gap-2">
                  <Shuffle className="w-5 h-5" />
                  AI Flow Diagrams
                </CardTitle>
                <CardDescription>
                  Connect nodes to build AI systems
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => startGame('aiflow')}
                  className="w-full bg-green-500 hover:bg-green-600"
                >
                  Start Flow
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {gameState.gameOver && (
          <Card className="bg-black/50 backdrop-blur-sm border-red-500/30 mb-6">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-red-400">Game Over!</CardTitle>
              <CardDescription className="text-lg">
                Final Score: <span className="text-yellow-400 font-bold">{gameState.score}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={resetGame} className="bg-cyan-500 hover:bg-cyan-600">
                Play Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Game Areas */}
        {gameState.isPlaying && (
          <div className="space-y-6">
            {currentGame === 'codeblocks' && (
              <Card className="bg-black/30 backdrop-blur-sm border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-purple-400">Code Blocks Puzzle</CardTitle>
                  <CardDescription>
                    Drag the code blocks to create a program that adds two numbers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Available Blocks</h3>
                      <div className="space-y-2">
                        {codeBlocks.filter(block => !droppedBlocks.find(d => d.id === block.id)).map((block) => (
                          <div
                            key={block.id}
                            draggable
                            onDragStart={() => handleDragStart(block)}
                            className={`p-3 rounded-lg cursor-move ${block.color} text-white font-mono text-sm hover:scale-105 transition-transform`}
                          >
                            {block.code}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Your Program</h3>
                      <div
                        onDrop={handleDrop}
                        onDragOver={(e) => e.preventDefault()}
                        className="min-h-64 p-4 border-2 border-dashed border-gray-600 rounded-lg bg-gray-900/50"
                      >
                        {droppedBlocks.length === 0 ? (
                          <p className="text-gray-500 text-center py-8">Drag code blocks here</p>
                        ) : (
                          <div className="space-y-2">
                            {droppedBlocks.map((block, index) => (
                              <div
                                key={block.id}
                                className={`p-3 rounded-lg ${block.color} text-white font-mono text-sm`}
                              >
                                {block.code}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {droppedBlocks.length >= 4 && (
                        <div className="mt-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
                          <div className="flex items-center gap-2 text-green-400">
                            <CheckCircle className="w-5 h-5" />
                            <span>Great job! You created a working program!</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentGame === 'quiz' && currentQuestion && (
              <Card className="bg-black/30 backdrop-blur-sm border-cyan-500/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-cyan-400">Speed Quiz</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        {getCategoryIcon(currentQuestion.category)}
                        <Badge variant="outline" className={getDifficultyColor(currentQuestion.difficulty)}>
                          {currentQuestion.difficulty}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">Question {gameState.score / 10 + 1}</div>
                      <div className="text-lg font-bold">Level {gameState.level}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold mb-4">{currentQuestion.question}</h3>
                    <div className="space-y-3">
                      {currentQuestion.options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleAnswerSelect(index)}
                          disabled={showResult}
                          className={`w-full p-4 text-left rounded-lg border transition-all ${
                            showResult
                              ? index === currentQuestion.correctAnswer
                                ? 'border-green-500 bg-green-500/20'
                                : selectedAnswer === index
                                ? 'border-red-500 bg-red-500/20'
                                : 'border-gray-600'
                              : 'border-gray-600 hover:border-cyan-400 hover:bg-cyan-500/10'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{option}</span>
                            {showResult && index === currentQuestion.correctAnswer && (
                              <CheckCircle className="w-5 h-5 text-green-400" />
                            )}
                            {showResult && selectedAnswer === index && index !== currentQuestion.correctAnswer && (
                              <XCircle className="w-5 h-5 text-red-400" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentGame === 'aiflow' && (
              <Card className="bg-black/30 backdrop-blur-sm border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-green-400">AI Flow Diagram</CardTitle>
                  <CardDescription>
                    Connect the nodes in the correct order to build an AI system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative bg-gray-900/50 rounded-lg p-6 min-h-96">
                    {aiFlowNodes.map((node) => (
                      <div
                        key={node.id}
                        onClick={() => handleNodeConnect(node.id)}
                        className={`absolute cursor-pointer transition-all ${
                          connectedNodes.includes(node.id)
                            ? 'bg-green-500 border-green-400'
                            : node.type === 'input'
                            ? 'bg-blue-500 border-blue-400'
                            : node.type === 'process'
                            ? 'bg-yellow-500 border-yellow-400'
                            : node.type === 'decision'
                            ? 'bg-red-500 border-red-400'
                            : 'bg-purple-500 border-purple-400'
                        } border-2 rounded-lg p-3 min-w-24 text-center text-white font-medium hover:scale-105`}
                        style={{ left: node.x, top: node.y }}
                      >
                        {node.label}
                        {connectedNodes.includes(node.id) && (
                          <CheckCircle className="w-4 h-4 mx-auto mt-1" />
                        )}
                      </div>
                    ))}
                    
                    {/* Draw connections */}
                    <svg className="absolute inset-0 pointer-events-none">
                      {connectedNodes.flatMap(nodeId => {
                        const node = aiFlowNodes.find(n => n.id === nodeId)
                        return node?.connections.map(targetId => {
                          const target = aiFlowNodes.find(n => n.id === targetId)
                          if (!target || !connectedNodes.includes(targetId)) return null
                          
                          return (
                            <line
                              key={`${nodeId}-${targetId}`}
                              x1={node.x + 50}
                              y1={node.y + 20}
                              x2={target.x + 50}
                              y2={target.y + 20}
                              stroke="#10b981"
                              strokeWidth="2"
                              markerEnd="url(#arrowhead)"
                            />
                          )
                        })
                      })}
                      <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                          <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" />
                        </marker>
                      </defs>
                    </svg>
                  </div>
                  
                  {connectedNodes.length === aiFlowNodes.length && (
                    <div className="mt-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
                      <div className="flex items-center gap-2 text-green-400">
                        <CheckCircle className="w-5 h-5" />
                        <span>Perfect! You built a complete AI system!</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}