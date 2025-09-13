"use client"

import { Users, Trophy, Medal, Award, TrendingUp } from "lucide-react"

export function LeaderboardScreen() {
  const leaderboard = [
    { rank: 1, name: "Alex Chen", xp: 2850, level: 5, avatar: "AC", streak: 15 },
    { rank: 2, name: "Sarah Johnson", xp: 2640, level: 5, avatar: "SJ", streak: 12 },
    { rank: 3, name: "Mike Rodriguez", xp: 2420, level: 4, avatar: "MR", streak: 8 },
    { rank: 4, name: "Emma Wilson", xp: 2180, level: 4, avatar: "EW", streak: 10 },
    { rank: 5, name: "David Kim", xp: 1950, level: 4, avatar: "DK", streak: 6 },
    { rank: 6, name: "Lisa Zhang", xp: 1820, level: 3, avatar: "LZ", streak: 9 },
    { rank: 7, name: "John Doe", xp: 1250, level: 3, avatar: "JD", streak: 12, isCurrentUser: true },
    { rank: 8, name: "Anna Smith", xp: 1180, level: 3, avatar: "AS", streak: 5 },
    { rank: 9, name: "Tom Brown", xp: 1050, level: 2, avatar: "TB", streak: 3 },
    { rank: 10, name: "Grace Lee", xp: 980, level: 2, avatar: "GL", streak: 7 },
  ]

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "from-yellow-500 to-orange-500"
      case 2:
        return "from-gray-400 to-gray-600"
      case 3:
        return "from-amber-600 to-yellow-600"
      default:
        return "from-blue-500 to-cyan-500"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-red-500/20 rounded-2xl p-6 border border-border/20">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-purple-500" />
          <div>
            <h2 className="text-2xl font-bold text-foreground">Leaderboard</h2>
            <p className="text-muted-foreground">Compete with learners worldwide</p>
          </div>
        </div>
      </div>

      {/* Your Rank Card */}
      <div className="bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-2xl p-6 border border-primary/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-white">JD</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Your Rank</h3>
              <p className="text-muted-foreground">Keep climbing!</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">#7</div>
            <div className="text-sm text-muted-foreground">1,250 XP</div>
          </div>
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {leaderboard.slice(0, 3).map((user, index) => (
          <div
            key={user.rank}
            className={`text-center ${index === 0 ? "order-2" : index === 1 ? "order-1" : "order-3"}`}
          >
            <div className={`relative ${index === 0 ? "scale-110" : ""}`}>
              <div
                className={`w-16 h-16 mx-auto bg-gradient-to-r ${getRankColor(user.rank)} rounded-full flex items-center justify-center mb-2`}
              >
                <span className="text-lg font-bold text-white">{user.avatar}</span>
              </div>
              <div className="absolute -top-2 -right-2">{getRankIcon(user.rank)}</div>
            </div>
            <h4 className="font-bold text-foreground text-sm">{user.name}</h4>
            <p className="text-xs text-muted-foreground">{user.xp} XP</p>
            <div
              className={`mt-2 h-12 bg-gradient-to-t ${getRankColor(user.rank)} rounded-t-lg ${
                index === 0 ? "h-16" : index === 1 ? "h-12" : "h-8"
              }`}
            ></div>
          </div>
        ))}
      </div>

      {/* Full Leaderboard */}
      <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 border border-border/20">
        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-500" />
          Full Rankings
        </h3>
        <div className="space-y-3">
          {leaderboard.map((user) => (
            <div
              key={user.rank}
              className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                user.isCurrentUser
                  ? "bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 shadow-lg"
                  : "bg-muted/30 hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center justify-center w-8">{getRankIcon(user.rank)}</div>
              <div
                className={`w-10 h-10 bg-gradient-to-r ${getRankColor(user.rank)} rounded-full flex items-center justify-center`}
              >
                <span className="text-sm font-bold text-white">{user.avatar}</span>
              </div>
              <div className="flex-1">
                <h4 className={`font-semibold ${user.isCurrentUser ? "text-primary" : "text-foreground"}`}>
                  {user.name} {user.isCurrentUser && "(You)"}
                </h4>
                <p className="text-sm text-muted-foreground">
                  Level {user.level} • {user.streak} day streak
                </p>
              </div>
              <div className="text-right">
                <div className={`font-bold ${user.isCurrentUser ? "text-primary" : "text-foreground"}`}>
                  {user.xp} XP
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
