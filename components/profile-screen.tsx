"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { User, Trophy, Target, BookOpen, Zap, Star, Award, TrendingUp, Settings, LogOut } from "lucide-react"
import { useClerk } from "@clerk/nextjs"

export function ProfileScreen() {
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    try {
      // Clear local storage data
      localStorage.clear();
      // Sign out from Clerk
      await signOut();
      // Redirect to landing page
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const userStats = {
    level: 12,
    xp: 2450,
    nextLevelXp: 3000,
    totalQuizzes: 47,
    averageScore: 87,
    streak: 15,
    achievements: 8,
  }

  const achievements = [
    { name: "First Quiz", description: "Complete your first quiz", earned: true, icon: Target },
    { name: "Speed Learner", description: "Complete 5 quizzes in one day", earned: true, icon: Zap },
    { name: "Perfect Score", description: "Get 100% on a quiz", earned: true, icon: Star },
    { name: "Study Streak", description: "Study for 7 days straight", earned: false, icon: TrendingUp },
  ]

  const recentActivity = [
    { action: "Completed", subject: "Physics Quiz", score: 95, xp: 150 },
    { action: "Uploaded", subject: "Chemistry Notes", score: null, xp: 50 },
    { action: "Completed", subject: "Math Quiz", score: 82, xp: 120 },
  ]

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">Learning Explorer</h2>
              <p className="text-muted-foreground">
                Level {userStats.level} • {userStats.streak} day streak
              </p>
            </div>
            <Badge className="bg-accent/20 text-accent border-accent/30">
              <Trophy className="w-3 h-3 mr-1" />
              {userStats.achievements} Achievements
            </Badge>
          </div>

          {/* XP Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Level Progress</span>
              <span>
                {userStats.xp} / {userStats.nextLevelXp} XP
              </span>
            </div>
            <Progress value={(userStats.xp / userStats.nextLevelXp) * 100} className="h-3 bg-muted" />
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-card/50 to-card/80 border-border/50">
          <CardContent className="p-4 text-center">
            <BookOpen className="w-6 h-6 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{userStats.totalQuizzes}</div>
            <div className="text-xs text-muted-foreground">Quizzes Completed</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card/50 to-card/80 border-border/50">
          <CardContent className="p-4 text-center">
            <Target className="w-6 h-6 mx-auto mb-2 text-secondary" />
            <div className="text-2xl font-bold">{userStats.averageScore}%</div>
            <div className="text-xs text-muted-foreground">Average Score</div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-accent" />
            Achievements
          </CardTitle>
          <CardDescription>Your learning milestones</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {achievements.map((achievement, index) => {
            const Icon = achievement.icon
            return (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                  achievement.earned ? "bg-accent/10 border border-accent/20" : "bg-muted/30 opacity-60"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    achievement.earned ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{achievement.name}</h4>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                </div>
                {achievement.earned && (
                  <Badge variant="secondary" className="bg-accent/20 text-accent">
                    Earned
                  </Badge>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest learning sessions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <p className="font-medium">
                  {activity.action} {activity.subject}
                </p>
                {activity.score && <p className="text-sm text-muted-foreground">Score: {activity.score}%</p>}
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                +{activity.xp} XP
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Settings Actions */}
      <div className="space-y-3">
        <Button variant="outline" className="w-full justify-start bg-transparent">
          <Settings className="w-4 h-4 mr-2" />
          Account Settings
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start text-destructive hover:text-destructive bg-transparent"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
