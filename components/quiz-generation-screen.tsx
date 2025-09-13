import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  CheckCircle,
  AlertCircle,
  FileText,
  Settings,
  Sparkles,
  Target,
  Clock,
  Zap,
  Gamepad2,
  Trophy,
} from "lucide-react"

export function QuizGenerationScreen() {
  // React Native-style inline styles object
  const styles = {
    container: "space-y-6 px-4",
    statusCard: "rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl",
    offlineCard: "border-orange-300 bg-gradient-to-br from-orange-50 to-red-50",
    onlineCard: "border-emerald-300 bg-gradient-to-br from-emerald-50 to-cyan-50",
    documentCard: "border-2 border-cyan-400 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl shadow-lg",
    selectedFile: "border-2 border-cyan-500 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-xl p-4",
    settingsCard: "bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl shadow-lg",
    questionCounter:
      "border-3 border-cyan-500 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-xl p-4 text-center shadow-md",
    typeButton: "h-14 rounded-xl font-semibold transition-all duration-300 border-2",
    selectedButton: "bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-cyan-500 shadow-lg",
    unselectedButton: "bg-white border-gray-300 text-gray-700 hover:border-cyan-400 hover:bg-cyan-50",
    generateButton:
      "w-full h-16 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-bold text-lg rounded-2xl shadow-2xl transition-all duration-500",
    quizCard: "border-l-4 border-l-cyan-500 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl shadow-md",
    xpBadge:
      "bg-gradient-to-r from-orange-500 to-emerald-500 text-white px-3 py-1 rounded-full font-bold animate-pulse",
  }

  return (
    <div className={styles.container}>
      {/* Status Cards with Game-like Design */}
      <div className="grid grid-cols-2 gap-4">
        <Card className={`${styles.statusCard} ${styles.offlineCard}`}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center shadow-lg">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm text-orange-700">⚠️ Offline Mode</p>
              <p className="text-xs text-orange-600">No model loaded</p>
            </div>
          </CardContent>
        </Card>

        <Card className={`${styles.statusCard} ${styles.onlineCard}`}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg animate-pulse">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm text-emerald-700">✅ Online Mode</p>
              <p className="text-xs text-emerald-600">API keys ready</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Document Selection with Gaming Elements */}
      <Card className={styles.documentCard}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              🎯 Generate Quiz from Documents
            </span>
          </CardTitle>
          <p className="text-sm text-gray-600 font-medium ml-11">Select a document to generate quiz using AI OCR</p>
        </CardHeader>
        <CardContent>
          <div className={styles.selectedFile}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-800">📄 Selected Document:</p>
                  <p className="text-xs text-gray-600 font-medium">Image_1755826839137.jpg</p>
                </div>
              </div>
              <div className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <Target className="w-3 h-3" />
                Ready
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quiz Settings with Game UI */}
      <Card className={styles.settingsCard}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <Settings className="w-4 h-4 text-white" />
            </div>
            <span className="text-gray-800">⚙️ Quiz Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Questions Count */}
          <div>
            <label className="text-sm font-bold mb-3 block text-gray-700">🔢 Number of Questions</label>
            <div className={styles.questionCounter}>
              <span className="text-3xl font-bold text-cyan-600">5</span>
              <p className="text-xs text-gray-600 mt-1">Perfect for quick learning!</p>
            </div>
          </div>

          {/* Question Types */}
          <div>
            <label className="text-sm font-bold mb-3 block text-gray-700">🎲 Question Type</label>
            <div className="grid grid-cols-3 gap-3">
              <button className={`${styles.typeButton} ${styles.unselectedButton}`}>
                <div className="text-center">
                  <Gamepad2 className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm">Mixed</span>
                </div>
              </button>
              <button className={`${styles.typeButton} ${styles.selectedButton}`}>
                <div className="text-center">
                  <Target className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm">MCQ</span>
                </div>
              </button>
              <button className={`${styles.typeButton} ${styles.unselectedButton}`}>
                <div className="text-center">
                  <CheckCircle className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm">T/F</span>
                </div>
              </button>
            </div>
          </div>

          {/* Processing Mode */}
          <div>
            <label className="text-sm font-bold mb-3 block text-gray-700">⚡ Processing Mode</label>
            <div className="grid grid-cols-2 gap-3">
              <button className={`${styles.typeButton} ${styles.unselectedButton}`}>
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span className="font-semibold">Offline</span>
                </div>
              </button>
              <button className={`${styles.typeButton} ${styles.selectedButton}`}>
                <div className="flex items-center justify-center gap-2">
                  <Zap className="w-5 h-5" />
                  <span className="font-semibold">Online</span>
                </div>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generate Button with Animation */}
      <button className={styles.generateButton}>
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
        <div className="flex items-center justify-center relative z-10">
          <Sparkles className="w-6 h-6 mr-3 animate-spin" />
          <span>🚀 Generate Quiz (Online Mode)</span>
          <Trophy className="w-6 h-6 ml-3 animate-bounce" />
        </div>
      </button>

      {/* Generated Quizzes with XP Rewards */}
      <Card className={styles.settingsCard}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-white" />
              </div>
              <span className="text-gray-800">🏆 Generated Quizzes (1)</span>
            </div>
            <span className={styles.xpBadge}>+100 XP</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={styles.quizCard}>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">📝 Cyber Systems Quiz</h4>
                    <p className="text-sm text-gray-600">5 questions • 22/08/2025</p>
                  </div>
                </div>
                <div className="bg-cyan-500 text-white px-2 py-1 rounded-full text-xs font-bold">online</div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">🎯 Progress</span>
                  <span className="text-cyan-600 font-bold">0/5 completed</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                    style={{ width: "0%" }}
                  ></div>
                </div>
                <div className="text-center">
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
                    🎮 Start quiz to earn XP!
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
