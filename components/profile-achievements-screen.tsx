"use client"

import { Trophy, Star, Target, Zap, Award, TrendingUp } from "lucide-react"

export function ProfileAchievementsScreen() {
  const achievements = [
    {
      id: 1,
      title: "First Quiz Master",
      description: "Generated your first quiz",
      icon: Trophy,
      earned: true,
      xp: 100,
    },
    { id: 2, title: "Study Streak", description: "7 days of continuous learning", icon: Star, earned: true, xp: 200 },
    { id: 3, title: "Perfect Score", description: "Got 100% on a quiz", icon: Target, earned: false, xp: 300 },
    { id: 4, title: "Speed Learner", description: "Complete 5 quizzes in one day", icon: Zap, earned: false, xp: 250 },
    { id: 5, title: "Knowledge Seeker", description: "Upload 10 documents", icon: Award, earned: true, xp: 150 },
    {
      id: 6,
      title: "Rising Star",
      description: "Reach top 10 on leaderboard",
      icon: TrendingUp,
      earned: false,
      xp: 500,
    },
  ]

  const stats = [
    { label: "Total XP", value: "1,250", color: "from-yellow-500 to-orange-500" },
    { label: "Quizzes Completed", value: "23", color: "from-blue-500 to-cyan-500" },
    { label: "Perfect Scores", value: "7", color: "from-green-500 to-emerald-500" },
    { label: "Study Streak", value: "12 days", color: "from-purple-500 to-pink-500" },
  ]

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-2xl p-6 border border-border/20">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-white">JD</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">John Doe</h2>
            <p className="text-muted-foreground">Learning Explorer - Level 3</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="bg-background/50 rounded-full h-2 w-32">
                <div className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full w-3/4"></div>
              </div>
              <span className="text-sm text-muted-foreground">75% to Level 4</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-border/20">
            <div className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
              {stat.value}
            </div>
            <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Achievements */}
      <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 border border-border/20">
        <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Achievements
        </h3>
        <div className="grid gap-4">
          {achievements.map((achievement) => {
            const Icon = achievement.icon
            return (
              <div
                key={achievement.id}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${
                  achievement.earned
                    ? "bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30 shadow-lg"
                    : "bg-muted/30 border-border/20 opacity-60"
                }`}
              >
                <div
                  className={`p-3 rounded-full ${
                    achievement.earned ? "bg-gradient-to-r from-green-500 to-emerald-500" : "bg-muted"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${achievement.earned ? "text-white" : "text-muted-foreground"}`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">{achievement.title}</h4>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    achievement.earned
                      ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  +{achievement.xp} XP
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
