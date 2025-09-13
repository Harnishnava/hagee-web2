"use client"

import { Trophy, Upload, BookOpen, Users, Settings, MessageCircle } from "lucide-react"

interface DashboardNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
  isDesktop?: boolean
}

export function DashboardNavigation({ activeTab, onTabChange, isDesktop = false }: DashboardNavigationProps) {
  const tabs = [
    {
      id: "profile-achievements",
      label: "Profile & Achievements",
      icon: Trophy,
      color: "from-yellow-500 to-orange-500",
    },
    {
      id: "upload-docs",
      label: "Upload Docs",
      icon: Upload,
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "ai-chat",
      label: "AI Chat",
      icon: MessageCircle,
      color: "from-indigo-500 to-purple-500",
    },
    {
      id: "generated-quizzes",
      label: "Generated Quizzes",
      icon: BookOpen,
      color: "from-green-500 to-emerald-500",
    },
    {
      id: "leaderboard",
      label: "Leaderboard",
      icon: Users,
      color: "from-purple-500 to-pink-500",
    },
    {
      id: "profile-settings",
      label: "Profile/Settings",
      icon: Settings,
      color: "from-gray-500 to-slate-500",
    },
  ]

  if (isDesktop) {
    return (
      <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 border border-border/20 shadow-lg">
        <h3 className="text-lg font-bold text-foreground mb-4">Navigation</h3>
        <div className="space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-lg transform scale-105`
                    : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground hover:scale-102"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border/20 px-4 py-2 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-all duration-300 ${
                isActive ? "text-primary transform scale-110" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className={`p-2 rounded-lg ${isActive ? `bg-gradient-to-r ${tab.color}` : "bg-transparent"}`}>
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : ""}`} />
              </div>
              <span className="text-xs font-medium truncate max-w-[60px]">{tab.label.split(" ")[0]}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
