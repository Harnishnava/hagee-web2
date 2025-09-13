"use client";

import { useState } from "react";
import { ProfileAchievementsScreen } from "@/components/profile-achievements-screen";
import { DocumentUploadScreen } from "@/components/document-upload-screen";
import { ChatScreen } from "@/components/chat-screen";
import { GeneratedQuizzesScreen } from "@/components/generated-quizzes-screen";
import { LeaderboardScreen } from "@/components/leaderboard-screen";
import { ProfileSettingsScreen } from "@/components/profile-settings-screen";
import { DashboardNavigation } from "@/components/dashboard-navigation";

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("profile-achievements");

  const renderContent = () => {
    switch (activeTab) {
      case "profile-achievements":
        return <ProfileAchievementsScreen />;
      case "upload-docs":
        return <DocumentUploadScreen />;
      case "ai-chat":
        return <ChatScreen />;
      case "generated-quizzes":
        return <GeneratedQuizzesScreen />;
      case "leaderboard":
        return <LeaderboardScreen />;
      case "profile-settings":
        return <ProfileSettingsScreen />;
      default:
        return <ProfileAchievementsScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 flex flex-col">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-border/20">
        <div className="absolute top-4 right-4 w-12 h-12 bg-secondary/20 rounded-full animate-bounce-slow"></div>
        <div className="absolute top-8 left-8 w-6 h-6 bg-accent/30 rounded-full animate-pulse"></div>
        <div className="container mx-auto p-4 px-4 md:px-8 lg:px-12 max-w-md md:max-w-6xl relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl pb-4 md:text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-gradient">
                Hagee Dashboard
              </h1>
              <p className="text-muted-foreground font-medium text-sm">
                🎮 Your Learning Journey
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-card/80 backdrop-blur-sm rounded-full px-4 py-2 border border-border/20">
                <span className="text-sm font-medium text-primary">
                  Level 3
                </span>
              </div>
              <div className="bg-gradient-to-r from-accent/20 to-secondary/20 rounded-full px-4 py-2 border border-accent/30">
                <span className="text-sm font-bold text-accent">1,250 XP</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 container mx-auto p-4 px-4 md:px-8 lg:px-12 max-w-md md:max-w-6xl pb-20 md:pb-24">
        <div className="md:flex md:gap-8 lg:gap-12">
          {/* Desktop Sidebar Navigation */}
          <div className="hidden md:block md:w-64 lg:w-80">
            <div className="sticky top-8">
              <DashboardNavigation
                activeTab={activeTab}
                onTabChange={setActiveTab}
                isDesktop={true}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 md:min-h-[600px]">{renderContent()}</div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden">
        <DashboardNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  );
}
