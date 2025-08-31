'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Code, Brain, Globe, Zap, Trophy, Clock, 
  Target, CheckCircle, XCircle, Lightbulb
} from 'lucide-react'

interface CodeBlock {
  id: string
  code: string
  language: string
  isCorrect: boolean
  explanation: string
}

interface FlowDiagramNode {
  id: string
  type: 'start' | 'process' | 'decision' | 'end'
  label: string
  x: number
  y: number
  connections: string[]
}

interface TriviaQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: string
  explanation: string
  category: string
}

interface MiniGameProps {
  gameType: 'code-blocks' | 'flow-diagram' | 'trivia-cards'
  difficulty: 'easy' | 'medium' | 'hard'
  topic: string
  onComplete: (score: number, timeSpent: number) => void
}

export default function MiniGame({ gameType, difficulty, topic, onComplete }: MiniGameProps) {
  const [gameState, setGameState] = useState<'loading' | 'playing' | 'completed'>('loading')
  const [score, setScore] = useState(0)
  const [timeSpent, setTimeSpent] = useState(0)
  const [currentLevel, setCurrentLevel] = useState(0)
  const [gameData, setGameData] = useState<any>(null)

  useEffect(() => {
    initializeGame()
  }, [gameType, difficulty, topic])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (gameState === 'playing') {
      timer = setInterval(() => {
        setTimeSpent(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [gameState])

  const initializeGame = async () => {
    setGameState('loading')
    
    // Simulate loading game data
    setTimeout(() => {
      let data
      switch (gameType) {
        case 'code-blocks':
          data = generateCodeBlocksGame()
          break
        case 'flow-diagram':
          data = generateFlowDiagramGame()
          break
        case 'trivia-cards':
          data = generateTriviaGame()
          break
      }
      setGameData(data)
      setGameState('playing')
    }, 1000)
  }

  const generateCodeBlocksGame = () => {
    const codeBlocks: CodeBlock[] = [
      {
        id: '1',
        code: 'for (let i = 0; i < 10; i++) { console.log(i); }',
        language: 'javascript',
        isCorrect: true,
        explanation: 'This is a correct for loop that prints numbers 0-9'
      },
      {
        id: '2',
        code: 'if (x > 5) { return true; } else { return false; }',
        language: 'javascript',
        isCorrect: true,
        explanation: 'Correct conditional statement'
      },
      {
        id: '3',
        code: 'function add(a, b) { return a + b; }',
        language: 'javascript',
        isCorrect: true,
        explanation: 'Correct function definition'
      }
    ]
    return { type: 'code-blocks', blocks: codeBlocks, currentBlock: 0 }
  }

  const generateFlowDiagramGame = () => {
    const nodes: FlowDiagramNode[] = [
      { id: 'start', type: 'start', label: 'Start', x: 50, y: 50, connections: ['process1'] },
      { id: 'process1', type: 'process', label: 'Initialize Variables', x: 50, y: 150, connections: ['decision1'] },
      { id: 'decision1', type: 'decision', label: 'x > 5?', x: 50, y: 250, connections: ['process2', 'process3'] },
      { id: 'process2', type: 'process', label: 'Process A', x: 20, y: 350, connections: ['end'] },
      { id: 'process3', type: 'process', label: 'Process B', x: 80, y: 350, connections: ['end'] },
      { id: 'end', type: 'end', label: 'End', x: 50, y: 450, connections: [] }
    ]
    return { type: 'flow-diagram', nodes, currentNode: 'start', placedNodes: [] }
  }

  const generateTriviaGame = () => {
    const questions: TriviaQuestion[] = [
      {
        id: '1',
        question: 'What does AI stand for?',
        options: ['Artificial Intelligence', 'Automated Intelligence', 'Advanced Integration', 'Algorithmic Interface'],
        correctAnswer: 'Artificial Intelligence',
        explanation: 'AI stands for Artificial Intelligence, which refers to systems that can perform tasks requiring human intelligence.',
        category: 'AI Basics'
      },
      {
        id: '2',
        question: 'Which UN Sustainable Development Goal focuses on quality education?',
        options: ['SDG 3', 'SDG 4', 'SDG 5', 'SDG 6'],
        correctAnswer: 'SDG 4',
        explanation: 'SDG 4 aims to ensure inclusive and equitable quality education and promote lifelong learning opportunities for all.',
        category: 'UN Knowledge'
      }
    ]
    return { type: 'trivia-cards', questions, currentQuestion: 0, userAnswers: [] }
  }

  const handleCodeBlockSelection = (blockId: string, isCorrect: boolean) => {
    if (!gameData) return

    const newScore = isCorrect ? score + 10 : Math.max(0, score - 5)
    setScore(newScore)

    const nextBlock = gameData.currentBlock + 1
    if (nextBlock >= gameData.blocks.length) {
      setGameState('completed')
      onComplete(newScore, timeSpent)
    } else {
      setGameData({
        ...gameData,
        currentBlock: nextBlock
      })
    }
  }

  const handleFlowDiagramConnection = (fromId: string, toId: string) => {
    if (!gameData) return

    const isCorrect = gameData.nodes.find(n => n.id === fromId)?.connections.includes(toId)
    const newScore = isCorrect ? score + 15 : Math.max(0, score - 5)
    setScore(newScore)

    // Move to next node
    const currentNodeIndex = gameData.nodes.findIndex(n => n.id === gameData.currentNode)
    const nextNode = gameData.nodes[currentNodeIndex + 1]

    if (!nextNode || nextNode.type === 'end') {
      setGameState('completed')
      onComplete(newScore, timeSpent)
    } else {
      setGameData({
        ...gameData,
        currentNode: nextNode.id,
        placedNodes: [...gameData.placedNodes, { from: fromId, to: toId }]
      })
    }
  }

  const handleTriviaAnswer = (answer: string) => {
    if (!gameData) return

    const currentQuestion = gameData.questions[gameData.currentQuestion]
    const isCorrect = answer === currentQuestion.correctAnswer
    const newScore = isCorrect ? score + 20 : Math.max(0, score - 5)
    setScore(newScore)

    const newAnswers = [...gameData.userAnswers, { questionId: currentQuestion.id, answer, isCorrect }]
    const nextQuestion = gameData.currentQuestion + 1

    if (nextQuestion >= gameData.questions.length) {
      setGameState('completed')
      onComplete(newScore, timeSpent)
    } else {
      setGameData({
        ...gameData,
        currentQuestion: nextQuestion,
        userAnswers: newAnswers
      })
    }
  }

  const renderGame = () => {
    if (gameState === 'loading') {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )
    }

    if (gameState === 'completed') {
      return (
        <div className="text-center p-6">
          <Trophy className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Game Completed!</h3>
          <p className="text-slate-600 mb-4">Final Score: {score}</p>
          <p className="text-slate-600 mb-4">Time: {timeSpent}s</p>
          <Button onClick={() => initializeGame()} className="bg-primary hover:bg-blue-700">
            Play Again
          </Button>
        </div>
      )
    }

    switch (gameType) {
      case 'code-blocks':
        return renderCodeBlocksGame()
      case 'flow-diagram':
        return renderFlowDiagramGame()
      case 'trivia-cards':
        return renderTriviaGame()
      default:
        return <div>Game not found</div>
    }
  }

  const renderCodeBlocksGame = () => {
    if (!gameData) return null

    const currentBlock = gameData.blocks[gameData.currentBlock]
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Badge variant="outline" className="text-primary border-primary/30">
            Level {gameData.currentBlock + 1}/{gameData.blocks.length}
          </Badge>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-600" />
            <span className="text-slate-600">{timeSpent}s</span>
          </div>
        </div>

        <div className="p-4 bg-slate-100 rounded-lg border">
          <pre className="text-green-700 text-sm overflow-x-auto">
            <code>{currentBlock.code}</code>
          </pre>
        </div>

        <p className="text-slate-700">{currentBlock.explanation}</p>

        <div className="flex gap-4">
          <Button 
            onClick={() => handleCodeBlockSelection(currentBlock.id, currentBlock.isCorrect)}
            className="bg-green-600 hover:bg-green-700 text-white flex-1"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Correct
          </Button>
          <Button 
            onClick={() => handleCodeBlockSelection(currentBlock.id, !currentBlock.isCorrect)}
            className="bg-red-600 hover:bg-red-700 text-white flex-1"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Incorrect
          </Button>
        </div>

        <Progress value={(gameData.currentBlock / gameData.blocks.length) * 100} className="h-2" />
      </div>
    )
  }

  const renderFlowDiagramGame = () => {
    if (!gameData) return null

    const currentNode = gameData.nodes.find(n => n.id === gameData.currentNode)
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Badge variant="outline" className="text-primary border-primary/30">
            Flow Diagram
          </Badge>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-600" />
            <span className="text-slate-600">{timeSpent}s</span>
          </div>
        </div>

        <div className="relative h-96 bg-slate-100 rounded-lg border border-gray-300">
          {gameData.nodes.map(node => (
            <div
              key={node.id}
              className={`absolute w-20 h-12 rounded-lg border-2 flex items-center justify-center text-xs font-medium transition-all ${
                node.id === gameData.currentNode
                  ? 'border-cyan-400 bg-cyan-400/20 text-cyan-400'
                  : node.type === 'start'
                  ? 'border-green-400 bg-green-400/20 text-green-400'
                  : node.type === 'end'
                  ? 'border-red-400 bg-red-400/20 text-red-400'
                  : 'border-gray-600 bg-gray-600/20 text-gray-400'
              }`}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
            >
              {node.label}
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <p className="text-slate-700">Connect: {currentNode?.label}</p>
          {currentNode?.connections.map(connectionId => {
            const targetNode = gameData.nodes.find(n => n.id === connectionId)
            return (
              <Button
                key={connectionId}
                onClick={() => handleFlowDiagramConnection(currentNode.id, connectionId)}
                variant="outline"
                className="w-full justify-start"
              >
                To: {targetNode?.label}
              </Button>
            )
          })}
        </div>
      </div>
    )
  }

  const renderTriviaGame = () => {
    if (!gameData) return null

    const currentQuestion = gameData.questions[gameData.currentQuestion]
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Badge variant="outline" className="text-primary border-primary/30">
            Question {gameData.currentQuestion + 1}/{gameData.questions.length}
          </Badge>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-600" />
            <span className="text-slate-600">{timeSpent}s</span>
          </div>
        </div>

        <div className="p-6 bg-slate-100 rounded-lg border">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">{currentQuestion.question}</h3>
          <div className="space-y-2">
            {currentQuestion.options.map((option, index) => (
              <Button
                key={index}
                onClick={() => handleTriviaAnswer(option)}
                variant="outline"
                className="w-full justify-start text-left"
              >
                {option}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-yellow-600" />
          <Badge variant="outline" className="text-yellow-600 border-yellow-200">
            {currentQuestion.category}
          </Badge>
        </div>

        <Progress value={(gameData.currentQuestion / gameData.questions.length) * 100} className="h-2" />
      </div>
    )
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-gray-200 hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900">
          {gameType === 'code-blocks' && <Code className="w-6 h-6 text-primary" />}
          {gameType === 'flow-diagram' && <Brain className="w-6 h-6 text-primary" />}
          {gameType === 'trivia-cards' && <Globe className="w-6 h-6 text-primary" />}
          Mini-Game: {gameType.replace('-', ' ').toUpperCase()}
        </CardTitle>
        <CardDescription className="text-slate-600">
          Topic: {topic} • Difficulty: {difficulty}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-yellow-600" />
            <span className="text-yellow-600 font-semibold">Score: {score}</span>
          </div>
          <Badge variant="outline" className={difficulty === 'easy' ? 'text-green-600 border-green-200' : difficulty === 'medium' ? 'text-yellow-600 border-yellow-200' : 'text-red-600 border-red-200'}>
            {difficulty}
          </Badge>
        </div>
        
        {renderGame()}
      </CardContent>
    </Card>
  )
}