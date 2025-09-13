import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { CheckCircle, Trophy, Star, RotateCcw, Share } from "lucide-react"

export function QuizResultsScreen() {
  const questions = [
    {
      id: 1,
      question: 'What does the term "Cyber" refer to in the context of Cyber-Physical Systems?',
      options: [
        "The physical components of the system",
        "Computation, communication, and control that are discrete, logical, and switched",
        "The continuous time operation of the system",
        "The human-made systems governed by the laws of physics",
      ],
      correctAnswer: 1,
      userAnswer: 1,
      isCorrect: true,
    },
    {
      id: 2,
      question: "What type of systems are governed by the laws of physics in Cyber-Physical Systems?",
      options: [
        "Human-made systems",
        "Natural and human-made systems",
        "Discrete and logical systems",
        "Continuous time systems",
      ],
      correctAnswer: 1,
      userAnswer: 1,
      isCorrect: true,
    },
    {
      id: 3,
      question: "What is a key characteristic of Cyber-Physical Systems?",
      options: [
        "The cyber and physical systems are loosely integrated",
        "The cyber and physical systems are tightly integrated at all scales and levels",
        "The cyber system operates in continuous time",
        "The physical system is discrete and logical",
      ],
      correctAnswer: 1,
      userAnswer: 1,
      isCorrect: true,
    },
    {
      id: 4,
      question: "What is the predicted impact of Cyber-Physical Systems on human interaction?",
      options: [
        "They will reduce the amount of interaction with the physical world",
        "They will have no impact on interaction with the physical world",
        "They will transform how we interact with the physical world",
        "They will increase the complexity of interaction with the physical world",
      ],
      correctAnswer: 2,
      userAnswer: 2,
      isCorrect: true,
    },
    {
      id: 5,
      question: "According to the text, how did the Internet impact human interaction?",
      options: [
        "It reduced the amount of interaction with one another",
        "It had no impact on interaction with one another",
        "It transformed how we interact with one another",
        "It increased the complexity of interaction with one another",
      ],
      correctAnswer: 2,
      userAnswer: 2,
      isCorrect: true,
    },
  ]

  const score = questions.filter((q) => q.isCorrect).length
  const totalQuestions = questions.length
  const percentage = Math.round((score / totalQuestions) * 100)

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <Card className="bg-gradient-to-r from-green-50 to-primary/10 border-green-200 dark:from-green-950/20 dark:to-primary/10">
        <CardContent className="p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center animate-bounce-in">
              <Trophy className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Perfect Score! 🎉</h2>
          <div className="flex items-center justify-center gap-4 mb-4">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              <Star className="w-4 h-4 mr-1" />
              +200 XP
            </Badge>
            <Badge variant="outline" className="text-lg px-4 py-2 border-green-500">
              {score}/{totalQuestions} Correct
            </Badge>
          </div>
          <Progress value={percentage} className="h-3 mb-2" />
          <p className="text-sm text-muted-foreground">{percentage}% Accuracy</p>
        </CardContent>
      </Card>

      {/* Quiz Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            <span>Image_1755826839137.jpg Quiz</span>
            <Badge variant="outline">online</Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">{totalQuestions} questions • 22/08/2025</p>
        </CardHeader>
      </Card>

      {/* Questions Review */}
      <div className="space-y-4">
        {questions.map((question, index) => (
          <Card key={question.id} className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium mb-3">
                    {index + 1}. {question.question}
                  </h4>
                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className={`p-3 rounded-lg text-sm ${
                          optionIndex === question.correctAnswer
                            ? "bg-green-100 text-green-800 border border-green-300 dark:bg-green-950/30 dark:text-green-300"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <span className="font-medium mr-2">{String.fromCharCode(65 + optionIndex)}.</span>
                        {option}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      Correct Answer: {String.fromCharCode(65 + question.correctAnswer)}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" size="lg" className="h-12 bg-transparent">
          <RotateCcw className="w-4 h-4 mr-2" />
          Retake Quiz
        </Button>
        <Button size="lg" className="h-12">
          <Share className="w-4 h-4 mr-2" />
          Share Results
        </Button>
      </div>

      {/* Achievement Unlocked */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 dark:from-yellow-950/20 dark:to-orange-950/20">
        <CardContent className="p-4 text-center">
          <div className="flex justify-center mb-2">
            <Badge variant="secondary" className="animate-bounce-in">
              🏆 Achievement Unlocked!
            </Badge>
          </div>
          <p className="text-sm font-medium">Perfect Score Master</p>
          <p className="text-xs text-muted-foreground">Get 100% on any quiz</p>
        </CardContent>
      </Card>
    </div>
  )
}
