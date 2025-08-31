'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Play, Clock, Trophy, Target, BookOpen,
  CheckCircle, XCircle, HelpCircle, ArrowRight, Search, Loader2
} from 'lucide-react'

interface Quiz {
  id: number
  title: string
  description: string
  category: string
  difficulty: string
  time_limit: number
  question_count: number
  xp_reward: number
  coin_reward: number
}

interface Question {
  id: number
  question_text: string
  question_type: string
  difficulty: string
  points: number
  options?: string[]
  correct_answer: string
  explanation?: string
  image_url?: string
  audio_url?: string
}

interface QuizAttempt {
  attempt_id: number
  quiz: Quiz
  questions: Question[]
  time_limit: number
  max_score: number
}

interface AnswerSubmission {
  question_id: number
  answer: string
  is_correct?: boolean
  time_spent: number
  answered_at: string
}

interface QuizResult {
  quiz_id: number
  attempt_id: number
  score: number
  max_score: number
  percentage: number
  passed: boolean
  time_taken: number
  total_questions: number
  correct_answers: number
  user_answers: AnswerSubmission[]
  completed_at: string
  xp_earned: number
  coins_earned: number
}

const ALLOWED_CATEGORIES = [
  { key: 'ai-ml', label: 'AI / ML' },
  { key: 'unesco', label: 'UNESCO' },
  { key: 'coding', label: 'Coding' },
]

export default function QuizSystem() {
  // State for quiz list and filtering
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for quiz attempt
  const [quizAttempt, setQuizAttempt] = useState<QuizAttempt | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<AnswerSubmission[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [quizActive, setQuizActive] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [quizResults, setQuizResults] = useState<QuizResult | null>(null);

  // Filter and paginate quizzes based on search and category
  const { filteredQuizzes, visibleQuizzes } = useMemo(() => {
    // Filter by search query and category
    const filtered = quizzes.filter(quiz => {
      const matchesSearch = searchQuery === '' || 
        quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        quiz.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || quiz.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
    
    // Paginate results (first 15 items)
    const visible = filtered.slice(0, 15);
    
    return { filteredQuizzes: filtered, visibleQuizzes: visible };
  }, [quizzes, selectedCategory, searchQuery]);
  
  // Load quizzes on component mount
  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Use mock data for now
        setQuizzes(MOCK_QUIZZES);
      } catch (err) {
        setError('Failed to load quizzes. Please try again later.');
        console.error('Error loading quizzes:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadQuizzes();
  }, [setIsLoading, setError, setQuizzes]);
  
  // Handle starting a quiz
  const handleStartQuiz = async (quiz: Quiz) => {
    try {
      setIsLoading(true);
      const attempt: QuizAttempt = {
        attempt_id: Date.now(),
        quiz,
        questions: MOCK_QUESTIONS[quiz.id] || [],
        time_limit: quiz.time_limit * 60,
        max_score: 100
      };
      setQuizAttempt(attempt);
      setCurrentQuestionIndex(0);
      setUserAnswers([]);
      setTimeRemaining(attempt.time_limit);
      setQuizActive(true);
      setShowResults(false);
      setQuizResults(null);
    } catch (error) {
      console.error('Error starting quiz:', error);
      setError('Failed to start quiz. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle quiz submission
  const handleSubmitQuiz = useCallback(() => {
    if (!quizAttempt) return;
    
    // Update answers with correctness before submission
    const updatedAnswers = userAnswers.map(answer => {
      const question = quizAttempt.questions.find(q => q.id === answer.question_id);
      return {
        ...answer,
        is_correct: question ? question.correct_answer === answer.answer : false
      };
    });
    
    // Calculate score
    const correctAnswers = updatedAnswers.filter(answer => answer.is_correct).length;
    const totalQuestions = quizAttempt.questions.length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = score >= 70; // Passing score of 70%
    
    // Create result
    const result: QuizResult = {
      quiz_id: quizAttempt.quiz.id,
      attempt_id: quizAttempt.attempt_id,
      score,
      max_score: 100,
      percentage: score,
      passed,
      time_taken: quizAttempt.time_limit - timeRemaining,
      total_questions: totalQuestions,
      correct_answers: correctAnswers,
      user_answers: updatedAnswers,
      completed_at: new Date().toISOString(),
      xp_earned: passed ? 50 : 10, // More XP for passing
      coins_earned: passed ? 20 : 5, // More coins for passing
    };
    
    setQuizResults(result);
    setShowResults(true);
    setQuizActive(false);
  }, [quizAttempt, timeRemaining, userAnswers]);
  
  // Handle answer selection
  const handleAnswerSelect = useCallback((questionId: number, answer: string, timeSpent: number) => {
    if (!quizAttempt) return;
    
    const question = quizAttempt.questions.find(q => q.id === questionId);
    if (!question) return;
    
    const newAnswer: AnswerSubmission = {
      question_id: questionId,
      answer,
      is_correct: answer === question.correct_answer,
      time_spent: timeSpent,
      answered_at: new Date().toISOString(),
    };
    
    setUserAnswers(prevAnswers => {
      const existingAnswerIndex = prevAnswers.findIndex(a => a.question_id === questionId);
      if (existingAnswerIndex >= 0) {
        const updated = [...prevAnswers];
        updated[existingAnswerIndex] = newAnswer;
        return updated;
      }
      return [...prevAnswers, newAnswer];
    });
  }, [quizAttempt, setUserAnswers]);

  // Handle next question
  const handleNextQuestion = useCallback(() => {
    if (!quizAttempt) return;
    
    if (currentQuestionIndex < quizAttempt.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleSubmitQuiz();
    }
  }, [currentQuestionIndex, quizAttempt, handleSubmitQuiz]);
  
  // Handle previous question
  const handlePrevQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  }, [currentQuestionIndex]);

  // Handle quiz selection
  const handleSelectQuiz = useCallback((quiz: Quiz) => {
    // Scroll to the quiz details section
    document.getElementById('quiz-details')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Handle quiz start button click
  const handleStartButtonClick = (quiz: Quiz, e: React.MouseEvent) => {
    e.stopPropagation();
    handleStartQuiz(quiz);
  };


  // Render quiz grid
  const renderQuizGrid = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuizzes.length > 0 ? (
          filteredQuizzes.map((quiz) => (
            <div key={quiz.id} className="group relative bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer overflow-hidden hover:border-blue-200">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {quiz.title}
                  </h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {quiz.category}
                  </span>
                </div>
                
                <p className="text-sm text-slate-600 mb-4">{quiz.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-800">
                    <Trophy className="w-3 h-3 mr-1 text-yellow-500" />
                    {quiz.xp_reward} XP
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-800">
                    <Clock className="w-3 h-3 mr-1 text-slate-500" />
                    {quiz.time_limit} min
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-800">
                    <HelpCircle className="w-3 h-3 mr-1 text-blue-500" />
                    {quiz.question_count} Qs
                  </span>
                </div>
                
                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    quiz.difficulty.toLowerCase() === 'beginner' ? 'bg-green-100 text-green-800' :
                    quiz.difficulty.toLowerCase() === 'intermediate' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {quiz.difficulty}
                  </span>
                  <button 
                    type="button"
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    onClick={(e) => handleStartButtonClick(quiz, e)}
                  >
                    Start Quiz
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {/* Hover effect */}
              <div className="absolute inset-0 pointer-events-none border-2 border-transparent group-hover:border-blue-200 rounded-lg transition-all duration-200"></div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="mx-auto h-12 w-12 text-slate-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">No quizzes found</h3>
            <p className="text-slate-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Quiz System</h1>
          <p className="text-slate-600">Test your knowledge and earn rewards</p>
        </div>
        
        {renderQuizGrid()}
      </div>
    </div>
  );
}

// ====== MOCK DATA FOR PROTOTYPE ======
// Mock quizzes
export const MOCK_QUIZZES: Quiz[] = [
  {
    id: 1,
    title: 'Introduction to Machine Learning',
    description: 'Test your knowledge of basic ML concepts',
    category: 'ai-ml',
    difficulty: 'easy',
    time_limit: 10,
    question_count: 5,
    xp_reward: 50,
    coin_reward: 20
  },
  {
    id: 2,
    title: 'UNESCO World Heritage',
    description: 'How well do you know UNESCO World Heritage sites?',
    category: 'unesco',
    difficulty: 'medium',
    time_limit: 15,
    question_count: 10,
    xp_reward: 100,
    coin_reward: 30
  },
  {
    id: 3,
    title: 'JavaScript Fundamentals',
    description: 'Test your JavaScript knowledge',
    category: 'coding',
    difficulty: 'hard',
    time_limit: 20,
    question_count: 15,
    xp_reward: 150,
    coin_reward: 50
  }
];

// Mock questions for each quiz
export const MOCK_QUESTIONS: Record<number, Question[]> = {
  1: [
    {
      id: 1,
      question_text: 'What is the capital of France?',
      question_type: 'multiple_choice',
      difficulty: 'easy',
      points: 10,
      options: ['London', 'Paris', 'Berlin', 'Madrid'],
      correct_answer: 'Paris'
    },
    {
      id: 2,
      question_text: 'What is 2 + 2?',
      question_type: 'multiple_choice',
      difficulty: 'easy',
      points: 10,
      options: ['3', '4', '5', '6'],
      correct_answer: '4'
    }
  ],
  2: [
    {
      id: 3,
      question_text: 'Which of these is a UNESCO World Heritage site?',
      question_type: 'multiple_choice',
      difficulty: 'medium',
      points: 15,
      options: ['Eiffel Tower', 'Great Wall of China', 'Statue of Liberty', 'Sydney Opera House'],
      correct_answer: 'Great Wall of China'
    }
  ],
  3: [
    {
      id: 4,
      question_text: 'What does JSON stand for?',
      question_type: 'short_answer',
      difficulty: 'easy',
      points: 5,
      correct_answer: 'JavaScript Object Notation'
    }
  ]
};

// ====== END MOCK DATA ======