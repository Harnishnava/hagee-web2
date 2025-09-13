import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Upload,
  Star,
  Zap,
  Target,
  Gamepad2,
  Settings,
  FileText,
  Brain,
  CheckCircle,
  XCircle,
  Loader2,
  Trash2,
} from "lucide-react";
import { useDocumentProcessing } from "@/contexts/DocumentProcessingContext";
import { useState, useCallback } from "react";
import { ProcessingResult } from "../services/DocumentProcessingService";
import { useDocumentProcessor } from "./client-document-processor";

export function DocumentUploadScreen() {
  const {
    aiConfig,
    updateAIConfig,
    availableModels,
    processingProgress,
    results,

    clearResults,
    testServices,
  } = useDocumentProcessing();

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [serviceStatus, setServiceStatus] = useState<{
    groq: boolean;
    mistral: boolean;
  }>({ groq: false, mistral: false });
  const { processDocument } = useDocumentProcessor();

  // React Native-style inline styles object
  const styles = {
    container: "space-y-6 px-4",
    userCard:
      "bg-gradient-to-r from-cyan-500/20 via-orange-400/15 to-emerald-500/20 border-2 border-cyan-500/30 shadow-xl relative overflow-hidden rounded-2xl",
    userAvatar:
      "w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-orange-500 flex items-center justify-center shadow-lg relative",
    levelBadge:
      "absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center animate-pulse",
    xpBadge:
      "animate-bounce bg-gradient-to-r from-orange-500 to-emerald-500 text-white shadow-lg px-3 py-1 rounded-full",
    progressBar: "h-4 bg-gray-200 rounded-full overflow-hidden",
    progressFill:
      "h-full bg-gradient-to-r from-cyan-500 to-orange-500 rounded-full transition-all duration-500",
    uploadCard:
      "border-3 border-dashed border-cyan-500/50 hover:border-cyan-500/80 bg-gradient-to-br from-white to-cyan-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300",
    uploadButton:
      "w-full h-20 bg-gradient-to-r from-cyan-500 via-orange-500 to-cyan-500 hover:from-cyan-600 hover:to-orange-600 shadow-2xl rounded-xl text-white font-bold text-xl relative overflow-hidden",
    gameButton:
      "h-16 border-2 border-orange-500 bg-gradient-to-br from-white to-orange-50 hover:bg-orange-100 rounded-xl shadow-md hover:shadow-lg transition-all duration-300",
    achievementCard:
      "bg-gradient-to-br from-orange-100 to-emerald-100 border-2 border-orange-300 rounded-2xl shadow-lg",
    achievementBadge: "px-3 py-1 rounded-full border-2 shadow-md font-medium",
    emptyState:
      "border-2 border-dashed border-cyan-400 bg-gradient-to-br from-white to-cyan-50 rounded-2xl",
    rewardBadge:
      "bg-gradient-to-r from-orange-500 to-emerald-500 text-white px-3 py-1 rounded-full font-bold",
  };

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const validFiles = fileArray.filter((file) => {
      // Simple file validation
      const allowedTypes = [
        "pdf",
        "docx",
        "pptx",
        "txt",
        "jpg",
        "jpeg",
        "png",
        "gif",
        "bmp",
        "webp",
      ];
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      return (
        fileExtension &&
        allowedTypes.includes(fileExtension) &&
        file.size <= 50 * 1024 * 1024
      );
    });

    setSelectedFiles((prev) => [...prev, ...validFiles]);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  const removeFile = useCallback((index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleProcessFiles = useCallback(async () => {
    if (selectedFiles.length === 0) return;

    try {
      // Process each file individually using the custom hook
      for (const file of selectedFiles) {
        await processDocument(file, {
          onProcessingComplete: (result: ProcessingResult) => {
            console.log("Processing completed:", result);
            console.log("Quiz generated:", result.quiz);

            // Store quiz in localStorage
            const existingQuizzes = JSON.parse(
              localStorage.getItem("generatedQuizzes") || "[]"
            );
            if (result.quiz) {
              const quizData = {
                id: `quiz-${Date.now()}-${Math.random()
                  .toString(36)
                  .substr(2, 9)}`,
                title: `Quiz from ${file.name}`,
                questions: result.quiz,
                createdAt: new Date().toISOString(),
                status: "not_started",
                attempts: 0,
                bestScore: 0,
              };
              existingQuizzes.push(quizData);
              localStorage.setItem(
                "generatedQuizzes",
                JSON.stringify(existingQuizzes)
              );
              console.log("Quiz saved to localStorage:", quizData);
            } else {
              console.log("No quiz in result:", result);
            }
          },
          onProcessingError: (error: string) => {
            console.error("Processing error:", error);
          },
          onProcessingStart: () => {
            console.log("Processing started for:", file.name);
          },
        });
      }

      setSelectedFiles([]);
    } catch (error) {
      console.error("Processing failed:", error);
    }
  }, [selectedFiles, processDocument]);

  const testAPIServices = useCallback(async () => {
    try {
      const status = await testServices();
      setServiceStatus(status);
    } catch (error) {
      console.error("Service test failed:", error);
      setServiceStatus({ groq: false, mistral: false });
    }
  }, [testServices]);

  return (
    <div className={styles.container}>
      {/* User Level Card - React Native style */}
      <Card className={styles.userCard}>
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-orange-400/30 to-transparent rounded-full -translate-y-12 translate-x-12"></div>
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className={styles.userAvatar}>
                <Gamepad2 className="w-8 h-8 text-white" />
                <div className={styles.levelBadge}>
                  <Star className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <p className="font-bold text-xl text-gray-800">
                  Learning Explorer
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Level 3 • 🎮 Gamer
                </p>
              </div>
            </div>
            <div className={styles.xpBadge}>
              <Zap className="w-4 h-4 mr-1" />
              850 XP
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm font-semibold text-gray-700">
              <span>🚀 Progress to Level 4</span>
              <span className="text-cyan-600">850/1000 XP</span>
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: "85%" }}
              ></div>
            </div>
            <div className="text-center">
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">
                🎯 Only 150 XP to level up!
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Configuration Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Settings className="w-5 h-5" />
              AI Configuration
            </h2>
            <Button onClick={testAPIServices} variant="outline" size="sm">
              Test Services
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Groq Model Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Quiz Generation Model (Groq)
              </Label>
              <Select
                value={aiConfig.selectedGroqModel}
                onValueChange={(value) =>
                  updateAIConfig({ selectedGroqModel: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableModels
                    .filter((model) => model.provider === "groq")
                    .map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{model.name}</span>
                          <span className="text-xs text-gray-500">
                            {model.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {serviceStatus && (
                <div className="flex items-center gap-1 text-sm">
                  {serviceStatus.groq ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span
                    className={
                      serviceStatus.groq ? "text-green-600" : "text-red-600"
                    }
                  >
                    {serviceStatus.groq ? "Connected" : "Failed"}
                  </span>
                </div>
              )}
            </div>

            {/* Mistral Model Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                OCR Processing Model (Mistral)
              </Label>
              <Select
                value={aiConfig.selectedMistralModel}
                onValueChange={(value) =>
                  updateAIConfig({ selectedMistralModel: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableModels
                    .filter((model) => model.provider === "mistral")
                    .map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{model.name}</span>
                          <span className="text-xs text-gray-500">
                            {model.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {serviceStatus && (
                <div className="flex items-center gap-1 text-sm">
                  {serviceStatus.mistral ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span
                    className={
                      serviceStatus.mistral ? "text-green-600" : "text-red-600"
                    }
                  >
                    {serviceStatus.mistral ? "Connected" : "Failed"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quiz Settings */}
          <div className="mt-6 space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="generate-quiz"
                checked={aiConfig.generateQuiz}
                onCheckedChange={(checked) =>
                  updateAIConfig({ generateQuiz: checked })
                }
              />
              <Label htmlFor="generate-quiz" className="font-medium">
                Generate Quiz
              </Label>
            </div>

            {aiConfig.generateQuiz && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ml-6">
                <div className="space-y-2">
                  <Label className="text-sm">Number of Questions</Label>
                  <Select
                    value={aiConfig.numQuestions.toString()}
                    onValueChange={(value) =>
                      updateAIConfig({ numQuestions: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 Questions</SelectItem>
                      <SelectItem value="5">5 Questions</SelectItem>
                      <SelectItem value="10">10 Questions</SelectItem>
                      <SelectItem value="15">15 Questions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Difficulty</Label>
                  <Select
                    value={aiConfig.difficulty}
                    onValueChange={(value: "easy" | "medium" | "hard") =>
                      updateAIConfig({ difficulty: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Question Type</Label>
                  <Select
                    value={aiConfig.questionType}
                    onValueChange={(value: "mcq" | "true_false" | "mixed") =>
                      updateAIConfig({ questionType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mcq">Multiple Choice</SelectItem>
                      <SelectItem value="true_false">True/False</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">📚 Upload & Process</TabsTrigger>
          <TabsTrigger value="results">📊 Results</TabsTrigger>
        </TabsList>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-6">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-orange-500 bg-clip-text text-transparent">
              📚 Upload Documents
            </h1>
            <p className="text-gray-600 text-lg font-medium">
              🚀 Add study materials to generate quizzes and earn XP!
            </p>
          </div>

          {/* File Upload Area */}
          <Card
            className={`${styles.uploadCard} ${
              dragActive ? "border-cyan-500 bg-cyan-50" : ""
            }`}
          >
            <CardContent className="p-8">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className="space-y-4"
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-100 to-orange-100 flex items-center justify-center">
                    <Upload className="w-8 h-8 text-cyan-600" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-800 mb-2">
                      Drop files here or click to browse
                    </p>
                    <p className="text-sm text-gray-600">
                      Supports: PDF, DOCX, PPTX, TXT, Images (Max 50MB each)
                    </p>
                  </div>
                  <Input
                    type="file"
                    multiple
                    accept=".pdf,.docx,.pptx,.txt,.jpg,.jpeg,.png,.gif,.bmp,.webp"
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="hidden"
                    id="file-upload"
                  />
                  <Label htmlFor="file-upload">
                    <Button
                      className={styles.uploadButton.replace(
                        "w-full h-20",
                        "px-8 py-3"
                      )}
                      asChild
                    >
                      <span>
                        <Upload className="w-5 h-5 mr-2" />
                        Select Files
                      </span>
                    </Button>
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Selected Files ({selectedFiles.length})
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedFiles([])}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Clear All
                  </Button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-blue-500" />
                        <div>
                          <p className="font-medium text-sm">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <XCircle className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    onClick={handleProcessFiles}
                    disabled={processingProgress.isProcessing}
                    className="flex-1"
                  >
                    {processingProgress.isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4 mr-2" />
                        Process & Generate Quiz
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Processing Progress */}
          {processingProgress.isProcessing && (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Processing Documents...</h3>
                    <span className="text-sm text-gray-600">
                      {processingProgress.completed}/{processingProgress.total}
                    </span>
                  </div>
                  <Progress
                    value={processingProgress.percentage}
                    className="w-full"
                  />
                  {processingProgress.currentFile && (
                    <p className="text-sm text-gray-600">
                      Current: {processingProgress.currentFile}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Processing Results</h2>
            {results.length > 0 && (
              <Button onClick={clearResults} variant="outline">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Results
              </Button>
            )}
          </div>

          {results.length === 0 ? (
            <Card className={styles.emptyState}>
              <CardContent className="p-8 text-center">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-100 to-orange-100 flex items-center justify-center shadow-lg">
                  <FileText className="w-12 h-12 text-cyan-600" />
                </div>
                <h3 className="font-bold text-2xl mb-3 text-gray-800">
                  No Results Yet
                </h3>
                <p className="text-gray-600 text-base mb-6 leading-relaxed">
                  Upload and process documents to see results here. You&apos;ll
                  get extracted text, quiz questions, and processing statistics.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {results.map((result, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {result.success ? (
                          <CheckCircle className="w-6 h-6 text-green-500" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-500" />
                        )}
                        <div>
                          <h3 className="font-semibold">{result.fileName}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>{result.fileType.toUpperCase()}</span>
                            <span>
                              {(result.fileSize / 1024 / 1024).toFixed(2)} MB
                            </span>
                            <span>{result.processingTime}ms</span>
                            {result.wordCount > 0 && (
                              <span>{result.wordCount} words</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant={result.success ? "default" : "destructive"}
                      >
                        {result.success ? "Success" : "Failed"}
                      </Badge>
                    </div>

                    {result.error && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700 text-sm">{result.error}</p>
                      </div>
                    )}

                    {result.success && result.text && (
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">
                            Extracted Text Preview
                          </h4>
                          <div className="p-3 bg-gray-50 rounded-lg max-h-32 overflow-y-auto">
                            <p className="text-sm text-gray-700">
                              {result.text.substring(0, 300)}
                              {result.text.length > 300 && "..."}
                            </p>
                          </div>
                        </div>

                        {result.quiz && result.quiz.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">
                              Generated Quiz ({result.quiz.length} questions)
                            </h4>
                            <div className="space-y-3">
                              {result.quiz
                                .slice(0, 2)
                                .map((question: { question: string; options?: string[]; correctAnswer: string | boolean | number }, qIndex: number) => (
                                  <div
                                    key={qIndex}
                                    className="p-3 bg-blue-50 rounded-lg"
                                  >
                                    <p className="font-medium text-sm mb-2">
                                      {question.question}
                                    </p>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                      {question.options?.map(
                                        (option: string, oIndex: number) => (
                                          <div
                                            key={oIndex}
                                            className={`p-2 rounded ${
                                              oIndex === Number(question.correctAnswer)
                                                ? "bg-green-100 text-green-800"
                                                : "bg-white"
                                            }`}
                                          >
                                            {String.fromCharCode(65 + oIndex)}.{" "}
                                            {option}
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                ))}
                              {result.quiz.length > 2 && (
                                <p className="text-sm text-gray-600">
                                  +{result.quiz.length - 2} more questions...
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
