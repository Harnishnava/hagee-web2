"use client"

import { useState, useEffect } from "react"
import { BookOpen, Clock, RotateCcw, Trash2, Play, CheckCircle, XCircle, ArrowRight, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface QuizQuestion {
  id: string
  type: 'mcq' | 'true_false'
  question: string
  options?: string[]
  correctAnswer: string | boolean
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
}

interface StoredQuiz {
  quiz: QuizQuestion[]
  timestamp: number
  sourceFiles: string[]
}

interface QuizAttempt {
  id: string
  title: string
  questions: QuizQuestion[]
  sourceFiles: string[]
  createdAt: number
  attempts: QuizAttemptResult[]
}

interface QuizAttemptResult {
  score: number
  totalQuestions: number
  completedAt: number
  answers: { questionId: string; selectedAnswer: string | boolean; correct: boolean }[]
}

interface ActiveQuiz {
  quiz: QuizAttempt
  currentQuestionIndex: number
  answers: { questionId: string; selectedAnswer: string | boolean }[]
  startTime: number
}

export function GeneratedQuizzesScreen() {
  const [quizzes, setQuizzes] = useState<QuizAttempt[]>([])
  const [activeQuiz, setActiveQuiz] = useState<ActiveQuiz | null>(null)
  const [showResults, setShowResults] = useState<QuizAttemptResult | null>(null)

  useEffect(() => {
    loadQuizzes()
  }, [])

  const loadQuizzes = () => {
    // Load from localStorage
    const stored = localStorage.getItem('generatedQuizzes')
    if (stored) {
      try {
        const parsedQuizzes = JSON.parse(stored)
        // Convert the stored format to QuizAttempt format
        const quizAttempts: QuizAttempt[] = parsedQuizzes.map((quiz: any) => ({
          id: quiz.id,
          title: quiz.title,
          questions: quiz.questions,
          sourceFiles: [quiz.title], // Use title as source file reference
          createdAt: new Date(quiz.createdAt).getTime(),
          attempts: []
        }))
        setQuizzes(quizAttempts)
        console.log('Loaded quizzes from localStorage:', quizAttempts)
      } catch (error) {
        console.error('Failed to load quiz:', error)
      }
    } else {
      console.log('No quizzes found in localStorage')
    }
  }

  const deleteQuiz = (quizId: string) => {
    const updatedQuizzes = quizzes.filter(q => q.id !== quizId)
    setQuizzes(updatedQuizzes)
    
    // Update localStorage
    const stored = localStorage.getItem('generatedQuizzes')
    if (stored) {
      try {
        const parsedQuizzes = JSON.parse(stored)
        const filteredQuizzes = parsedQuizzes.filter((quiz: any) => quiz.id !== quizId)
        localStorage.setItem('generatedQuizzes', JSON.stringify(filteredQuizzes))
        console.log('Quiz deleted:', quizId)
      } catch (error) {
        console.error('Failed to delete quiz from localStorage:', error)
      }
    }
  }

  const startQuiz = (quiz: QuizAttempt) => {
    setActiveQuiz({
      quiz,
      currentQuestionIndex: 0,
      answers: [],
      startTime: Date.now()
    })
  }

  const selectAnswer = (answer: string | boolean) => {
    if (!activeQuiz) return
    
    const currentQuestion = activeQuiz.quiz.questions[activeQuiz.currentQuestionIndex]
    const newAnswers = [...activeQuiz.answers]
    const existingIndex = newAnswers.findIndex(a => a.questionId === currentQuestion.id)
    
    if (existingIndex >= 0) {
      newAnswers[existingIndex] = { questionId: currentQuestion.id, selectedAnswer: answer }
    } else {
      newAnswers.push({ questionId: currentQuestion.id, selectedAnswer: answer })
    }
    
    setActiveQuiz({ ...activeQuiz, answers: newAnswers })
  }

  const nextQuestion = () => {
    if (!activeQuiz) return
    
    if (activeQuiz.currentQuestionIndex < activeQuiz.quiz.questions.length - 1) {
      setActiveQuiz({ ...activeQuiz, currentQuestionIndex: activeQuiz.currentQuestionIndex + 1 })
    } else {
      finishQuiz()
    }
  }

  const prevQuestion = () => {
    if (!activeQuiz) return
    
    if (activeQuiz.currentQuestionIndex > 0) {
      setActiveQuiz({ ...activeQuiz, currentQuestionIndex: activeQuiz.currentQuestionIndex - 1 })
    }
  }

  const finishQuiz = () => {
    if (!activeQuiz) return
    
    const results = activeQuiz.answers.map(answer => {
      const question = activeQuiz.quiz.questions.find(q => q.id === answer.questionId)!
      return {
        ...answer,
        correct: answer.selectedAnswer === question.correctAnswer
      }
    })
    
    const score = results.filter(r => r.correct).length
    const result: QuizAttemptResult = {
      score,
      totalQuestions: activeQuiz.quiz.questions.length,
      completedAt: Date.now(),
      answers: results
    }
    
    setShowResults(result)
    setActiveQuiz(null)
    
    // Update quiz attempts
    const updatedQuizzes = quizzes.map(q => 
      q.id === activeQuiz.quiz.id 
        ? { ...q, attempts: [...q.attempts, result] }
        : q
    )
    setQuizzes(updatedQuizzes)
  }

  const getCurrentAnswer = () => {
    if (!activeQuiz) return undefined
    const currentQuestion = activeQuiz.quiz.questions[activeQuiz.currentQuestionIndex]
    return activeQuiz.answers.find(a => a.questionId === currentQuestion.id)?.selectedAnswer
  }

  const getQuizStatus = (quiz: QuizAttempt) => {
    return quiz.attempts.length > 0 ? 'completed' : 'pending'
  }

  const getLatestScore = (quiz: QuizAttempt) => {
    if (quiz.attempts.length === 0) return { score: 0, total: quiz.questions.length }
    const latest = quiz.attempts[quiz.attempts.length - 1]
    return { score: latest.score, total: latest.totalQuestions }
  }

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100
    if (percentage >= 90) return "from-green-500 to-emerald-500"
    if (percentage >= 70) return "from-yellow-500 to-orange-500"
    if (percentage >= 50) return "from-orange-500 to-red-500"
    return "from-red-500 to-pink-500"
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
      case "pending":
        return "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  // Show active quiz interface
  if (activeQuiz) {
    const currentQuestion = activeQuiz.quiz.questions[activeQuiz.currentQuestionIndex]
    const currentAnswer = getCurrentAnswer()
    const progress = ((activeQuiz.currentQuestionIndex + 1) / activeQuiz.quiz.questions.length) * 100

    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Taking Quiz</h2>
              <Badge variant="outline">
                Question {activeQuiz.currentQuestionIndex + 1} of {activeQuiz.quiz.questions.length}
              </Badge>
            </div>
            <Progress value={progress} className="mb-6" />
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">{currentQuestion.question}</h3>
                
                {currentQuestion.type === 'mcq' && currentQuestion.options && (
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                      <Button
                        key={index}
                        variant={currentAnswer === option ? "default" : "outline"}
                        className="w-full justify-start text-left h-auto p-4"
                        onClick={() => selectAnswer(option)}
                      >
                        <span className="font-medium mr-3">{String.fromCharCode(65 + index)}.</span>
                        {option}
                      </Button>
                    ))}
                  </div>
                )}
                
                {currentQuestion.type === 'true_false' && (
                  <div className="flex gap-4">
                    <Button
                      variant={currentAnswer === true ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => selectAnswer(true)}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      True
                    </Button>
                    <Button
                      variant={currentAnswer === false ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => selectAnswer(false)}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      False
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={prevQuestion}
                  disabled={activeQuiz.currentQuestionIndex === 0}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <Button
                  onClick={nextQuestion}
                  disabled={currentAnswer === undefined}
                >
                  {activeQuiz.currentQuestionIndex === activeQuiz.quiz.questions.length - 1 ? 'Finish' : 'Next'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show results screen
  if (showResults) {
    const percentage = (showResults.score / showResults.totalQuestions) * 100
    
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Quiz Completed!</h2>
              <p className="text-muted-foreground">Great job on finishing the quiz</p>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="text-4xl font-bold text-primary">
                {showResults.score}/{showResults.totalQuestions}
              </div>
              <div className="text-lg text-muted-foreground">
                {percentage.toFixed(1)}% Score
              </div>
              <Progress value={percentage} className="w-full" />
            </div>
            
            <div className="flex gap-4 justify-center">
              <Button onClick={() => setShowResults(null)}>
                View All Quizzes
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Take Another Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-teal-500/20 rounded-2xl p-6 border border-border/20">
        <div className="flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-blue-500" />
          <div>
            <h2 className="text-2xl font-bold text-foreground">Generated Quizzes</h2>
            <p className="text-muted-foreground">Review, retry, and track your quiz performance</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-border/20">
          <div className="text-2xl font-bold text-primary">{quizzes.length}</div>
          <div className="text-sm text-muted-foreground">Total Quizzes</div>
        </div>
        <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-border/20">
          <div className="text-2xl font-bold text-green-500">
            {quizzes.filter(q => q.attempts.length > 0).length}
          </div>
          <div className="text-sm text-muted-foreground">Completed</div>
        </div>
        <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-border/20">
          <div className="text-2xl font-bold text-yellow-500">
            {quizzes.length > 0 ? 
              Math.round(quizzes.reduce((acc, q) => {
                const latest = getLatestScore(q)
                return acc + (latest.score / latest.total * 100)
              }, 0) / quizzes.length) + '%' 
              : '0%'
            }
          </div>
          <div className="text-sm text-muted-foreground">Avg Score</div>
        </div>
      </div>

      {/* Quiz List */}
      <div className="space-y-4">
        {quizzes.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Quizzes Yet</h3>
              <p className="text-muted-foreground">Upload documents and generate quizzes to get started!</p>
            </CardContent>
          </Card>
        ) : (
          quizzes.map((quiz) => {
            const status = getQuizStatus(quiz)
            const latestScore = getLatestScore(quiz)
            
            return (
              <Card key={quiz.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-foreground mb-2">{quiz.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          {quiz.questions.length} questions
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(quiz.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <RotateCcw className="w-4 h-4" />
                          {quiz.attempts.length} attempts
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={status === 'completed' ? 'default' : 'secondary'}>
                        {status}
                      </Badge>
                    </div>
                  </div>

                  {status === "completed" && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Latest Score</span>
                        <span className={`text-lg font-bold bg-gradient-to-r ${getScoreColor(latestScore.score, latestScore.total)} bg-clip-text text-transparent`}>
                          {latestScore.score}/{latestScore.total}
                        </span>
                      </div>
                      <Progress value={(latestScore.score / latestScore.total) * 100} />
                    </div>
                  )}

                  <div className="flex gap-3">
                    {status === "pending" ? (
                      <Button 
                        className="flex-1"
                        onClick={() => startQuiz(quiz)}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start Quiz
                      </Button>
                    ) : (
                      <Button 
                        className="flex-1"
                        variant="outline"
                        onClick={() => startQuiz(quiz)}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Retry Quiz
                      </Button>
                    )}
                    <Button 
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteQuiz(quiz.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
