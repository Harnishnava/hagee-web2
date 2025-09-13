"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SignInButton } from '@clerk/nextjs'
import { Brain, Upload, Zap, Trophy, Target, Sparkles, BookOpen, Gamepad2, ArrowRight, Star, LogIn } from "lucide-react"

export function LandingPage() {
  const features = [
    {
      icon: Upload,
      title: "Smart Upload",
      description: "Upload any study material - PDFs, images, documents",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Brain,
      title: "AI Analysis",
      description: "Advanced AI analyzes and understands your content",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Zap,
      title: "Auto Quiz Generation",
      description: "Instantly generate personalized quizzes and questions",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: Gamepad2,
      title: "Gamified Learning",
      description: "Learn through engaging games and challenges",
      color: "from-green-500 to-emerald-500",
    },
  ]

  const stats = [
    { label: "Active Learners", value: "10K+", icon: BookOpen },
    { label: "Quizzes Generated", value: "50K+", icon: Target },
    { label: "Success Rate", value: "95%", icon: Trophy },
    { label: "Average Rating", value: "4.9", icon: Star },
  ]

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Hagee
            </span>
          </div>
          <SignInButton mode="redirect">
            <Button className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white">
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          </SignInButton>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
        <div className="space-y-8 md:space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-6 md:space-y-8">
            <div className="relative">
              <div className="absolute -top-2 -left-2 w-4 h-4 bg-accent/40 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-secondary/40 rounded-full animate-bounce-gentle"></div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Transform Learning into Adventure
              </h2>
            </div>
            <p className="text-muted-foreground text-lg md:text-xl lg:text-2xl leading-relaxed max-w-3xl mx-auto">
              Upload your study materials and let AI create personalized quizzes. Learn through games, earn XP, and
              level up your knowledge!
            </p>

            <div className="flex gap-3 justify-center flex-wrap">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                <Sparkles className="w-3 h-3 mr-1" />
                AI Powered
              </Badge>
              <Badge variant="secondary" className="bg-secondary/10 text-secondary border-secondary/20">
                <Trophy className="w-3 h-3 mr-1" />
                Gamified
              </Badge>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <Card
                  key={index}
                  className="bg-gradient-to-br from-card/50 to-card/80 border-border/50 hover:shadow-lg transition-all duration-300"
                >
                  <CardContent className="p-4 md:p-6 text-center">
                    <Icon className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 text-primary" />
                    <div className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-xs md:text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Features Section */}
          <div className="space-y-4 md:space-y-6">
            <h3 className="text-xl md:text-2xl lg:text-3xl font-semibold text-center mb-6">How Hagee Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <Card
                    key={index}
                    className="bg-gradient-to-r from-card/30 to-card/60 border-border/50 hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <CardContent className="p-4 md:p-6">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 md:w-16 md:h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg`}
                        >
                          <Icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground mb-1 text-base md:text-lg">{feature.title}</h4>
                          <p className="text-sm md:text-base text-muted-foreground">{feature.description}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          <Card className="bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 border-primary/20">
            <CardContent className="p-6 md:p-8 text-center space-y-4 md:space-y-6">
              <div className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-white animate-pulse" />
              </div>
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold">Ready to Start Learning?</h3>
              <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
                Upload your first document and experience the magic of AI-powered learning
              </p>
              <SignInButton mode="redirect">
                <Button className="w-full md:w-auto md:px-8 md:py-3 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <LogIn className="w-4 h-4 mr-2" />
                  Get Started Now
                </Button>
              </SignInButton>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
