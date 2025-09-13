"use client"

import { Home, Upload, Brain, HelpCircle, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface BottomNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
  isDesktop?: boolean
}

export function BottomNavigation({ activeTab, onTabChange, isDesktop = false }: BottomNavigationProps) {
  const tabs = [
    { id: "home", label: "Home", icon: Home },
    { id: "upload", label: "Upload", icon: Upload },
    { id: "models", label: "Models", icon: Brain },
    { id: "quiz", label: "Quiz", icon: HelpCircle },
    { id: "profile", label: "Profile", icon: User },
  ]

  if (isDesktop) {
    return (
      <div className="bg-card/50 backdrop-blur-lg border border-border/50 rounded-2xl p-4 shadow-xl">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground mb-4 px-2">Navigation</h3>
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-300 text-left",
                  isActive
                    ? "bg-gradient-to-r from-primary/20 to-primary/10 text-primary shadow-lg border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:shadow-md",
                )}
              >
                <div className={cn("relative", isActive && "animate-bounce-gentle")}>
                  <Icon className={cn("w-5 h-5", isActive && "drop-shadow-lg")} />
                  {isActive && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
                  )}
                </div>
                <span className={cn("font-medium", isActive ? "text-primary" : "text-muted-foreground")}>
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border/50 shadow-2xl">
      <div className="container mx-auto max-w-md">
        <div className="flex items-center justify-around py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 min-w-[60px]",
                  isActive
                    ? "bg-gradient-to-t from-primary/20 to-primary/10 text-primary scale-110 shadow-lg"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                )}
              >
                <div className={cn("relative", isActive && "animate-bounce-gentle")}>
                  <Icon className={cn("w-5 h-5 mb-1", isActive && "drop-shadow-lg")} />
                  {isActive && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
                  )}
                </div>
                <span className={cn("text-xs font-medium", isActive ? "text-primary" : "text-muted-foreground")}>
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
