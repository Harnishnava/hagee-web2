"use client"

import { User, Settings, Bell, Shield, Palette, LogOut } from "lucide-react"
import { useClerk } from "@clerk/nextjs"

export function ProfileSettingsScreen() {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-500/20 via-slate-500/20 to-zinc-500/20 rounded-2xl p-6 border border-border/20">
        <div className="flex items-center gap-3">
          <Settings className="w-8 h-8 text-gray-500" />
          <div>
            <h2 className="text-2xl font-bold text-foreground">Profile & Settings</h2>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>
        </div>
      </div>

      {/* Profile Section */}
      <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 border border-border/20">
        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-500" />
          Profile Information
        </h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">JD</span>
            </div>
            <div className="flex-1">
              <input
                type="text"
                defaultValue="John Doe"
                className="w-full bg-background/50 border border-border/20 rounded-lg px-4 py-2 text-foreground"
              />
              <p className="text-sm text-muted-foreground mt-1">Display name</p>
            </div>
          </div>
          <div>
            <input
              type="email"
              defaultValue="john.doe@example.com"
              className="w-full bg-background/50 border border-border/20 rounded-lg px-4 py-2 text-foreground"
            />
            <p className="text-sm text-muted-foreground mt-1">Email address</p>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-4">
        {/* Notifications */}
        <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 border border-border/20">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-yellow-500" />
            Notifications
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Quiz Reminders</p>
                <p className="text-sm text-muted-foreground">Get notified about pending quizzes</p>
              </div>
              <button className="w-12 h-6 bg-primary rounded-full relative">
                <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Achievement Alerts</p>
                <p className="text-sm text-muted-foreground">Celebrate your accomplishments</p>
              </div>
              <button className="w-12 h-6 bg-primary rounded-full relative">
                <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Leaderboard Updates</p>
                <p className="text-sm text-muted-foreground">Weekly ranking changes</p>
              </div>
              <button className="w-12 h-6 bg-muted rounded-full relative">
                <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5"></div>
              </button>
            </div>
          </div>
        </div>

        {/* Privacy */}
        <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 border border-border/20">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-500" />
            Privacy & Security
          </h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 bg-background/50 rounded-lg hover:bg-muted/50 transition-colors">
              <p className="font-medium text-foreground">Change Password</p>
              <p className="text-sm text-muted-foreground">Update your account password</p>
            </button>
            <button className="w-full text-left p-3 bg-background/50 rounded-lg hover:bg-muted/50 transition-colors">
              <p className="font-medium text-foreground">Data Export</p>
              <p className="text-sm text-muted-foreground">Download your learning data</p>
            </button>
            <button className="w-full text-left p-3 bg-background/50 rounded-lg hover:bg-muted/50 transition-colors">
              <p className="font-medium text-foreground">Delete Account</p>
              <p className="text-sm text-red-500">Permanently remove your account</p>
            </button>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 border border-border/20">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Palette className="w-5 h-5 text-purple-500" />
            Appearance
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Dark Mode</p>
                <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
              </div>
              <button className="w-12 h-6 bg-primary rounded-full relative">
                <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
              </button>
            </div>
            <div>
              <p className="font-medium text-foreground mb-2">Theme Color</p>
              <div className="flex gap-3">
                <button className="w-8 h-8 bg-blue-500 rounded-full border-2 border-white shadow-lg"></button>
                <button className="w-8 h-8 bg-green-500 rounded-full"></button>
                <button className="w-8 h-8 bg-purple-500 rounded-full"></button>
                <button className="w-8 h-8 bg-orange-500 rounded-full"></button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <button 
        onClick={handleSignOut}
        className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
      >
        <LogOut className="w-5 h-5" />
        Sign Out
      </button>
    </div>
  )
}
