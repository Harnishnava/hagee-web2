"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import {
  MessageCircle,
  Send,
  Plus,
  Settings,
  Paperclip,
  FileText,
  Image as ImageIcon,
  Trash2,
  AlertTriangle,
  Loader2,
  Bot,
  User,
  X,
  Copy,
} from "lucide-react";
import { useDocumentProcessing } from "@/contexts/DocumentProcessingContext";
import {
  chatService,
  ChatSession,
  ChatMessage,
  ChatConfig,
  ChatAttachment,
} from "@/services/ChatService";

export function ChatScreen() {
  const { availableModels, processFiles: processDocuments } =
    useDocumentProcessing();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [processingFiles, setProcessingFiles] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get model-specific system prompt
  const getSystemPromptForModel = (modelId: string): string => {
    const basePrompt =
      "You are an expert educational tutor and learning guide for students. Your role is to help students understand their study materials and learn effectively.";

    if (
      modelId.includes("llama-3.1-70b") ||
      modelId.includes("llama-3.3-70b")
    ) {
      return `${basePrompt}

COMMUNICATION STYLE:
- Be conversational, encouraging, and supportive
- Use a warm, teacher-like tone
- Ask follow-up questions to check understanding
- Provide examples and analogies when helpful
- Break down complex topics into digestible parts

TEACHING APPROACH:
- Always explain concepts clearly and step-by-step
- Relate new information to what students already know
- Encourage critical thinking with guiding questions
- Provide practical applications and real-world examples
- Celebrate student progress and understanding

When students upload documents, analyze them thoroughly and help students:
- Understand key concepts and main ideas
- Make connections between different topics
- Prepare for exams and assessments
- Develop study strategies
- Answer questions about the material`;
    } else {
      // For non-chat optimized models, be more structured and instructional
      return `${basePrompt}

INSTRUCTION FORMAT:
You must respond as an educational tutor. Structure your responses as follows:

1. DIRECT ANSWER: Provide a clear, concise answer to the student's question
2. EXPLANATION: Break down the concept in simple terms
3. CONTEXT: Relate to the uploaded study materials when relevant
4. STUDY TIP: Offer a practical learning strategy or memory aid
5. CHECK UNDERSTANDING: End with a question to verify comprehension

TEACHING PRINCIPLES:
- Use clear, academic language appropriate for students
- Provide structured, organized explanations
- Reference specific sections of uploaded documents
- Offer study techniques and learning strategies
- Encourage active learning and self-assessment

When analyzing uploaded documents:
- Identify key concepts, definitions, and important facts
- Explain relationships between different topics
- Suggest study methods for the material type
- Create mental frameworks for understanding
- Point out likely exam topics and important details`;
    }
  };

  // Chat configuration
  const [chatConfig, setChatConfig] = useState<ChatConfig>({
    selectedModel: "llama-3.1-70b-versatile",
    temperature: 0.7,
    maxTokens: 2048,
    systemPrompt: getSystemPromptForModel("llama-3.1-70b-versatile"),
    enableDocumentContext: true,
    contextLimit: 80, // Use 80% of model's context limit
  });

  // Load sessions on component mount
  useEffect(() => {
    const loadedSessions = chatService.getSessions();
    setSessions(loadedSessions);

    if (loadedSessions.length > 0 && !activeSessionId) {
      setActiveSessionId(loadedSessions[0].id);
    }
  }, [activeSessionId]);

  // Load messages when active session changes
  useEffect(() => {
    if (activeSessionId) {
      const session = chatService.getSession(activeSessionId);
      if (session) {
        setMessages(session.messages);
      }
    }
  }, [activeSessionId]);

  // Update system prompt when model changes
  useEffect(() => {
    setChatConfig((prev) => ({
      ...prev,
      systemPrompt: getSystemPromptForModel(prev.selectedModel),
    }));
  }, [chatConfig.selectedModel]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingMessage]);

  const createNewSession = useCallback(() => {
    const session = chatService.createSession(
      "New Chat",
      chatConfig.selectedModel
    );
    setSessions((prev) => [session, ...prev]);
    setActiveSessionId(session.id);
    setMessages([]);
  }, [chatConfig.selectedModel]);

  const deleteSession = useCallback(
    (sessionId: string) => {
      chatService.deleteSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));

      if (activeSessionId === sessionId) {
        const remainingSessions = sessions.filter((s) => s.id !== sessionId);
        if (remainingSessions.length > 0) {
          setActiveSessionId(remainingSessions[0].id);
        } else {
          setActiveSessionId(null);
          setMessages([]);
        }
      }
    },
    [activeSessionId, sessions]
  );

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const validFiles = fileArray.filter((file) => {
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

  const removeFile = useCallback((index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const processFiles = useCallback(async () => {
    if (!activeSessionId || selectedFiles.length === 0) return;

    setProcessingFiles(true);
    try {
      // Process files using the comprehensive document processing service
      const batchResult = await processDocuments(selectedFiles);

      for (const result of batchResult.results) {
        let content = "";
        let type: "document" | "image" = "document";

        // Determine file type
        const fileExtension = result.fileName.split(".").pop()?.toLowerCase();
        const imageTypes = ["jpg", "jpeg", "png", "gif", "bmp", "webp"];

        if (imageTypes.includes(fileExtension || "")) {
          type = "image";
        }

        if (result.success && result.text) {
          // Enhanced content with metadata for better context
          content = `DOCUMENT ANALYSIS:
File: ${result.fileName}
Type: ${result.fileType.toUpperCase()}
Word Count: ${result.wordCount}
Processing Time: ${result.processingTime}ms

EXTRACTED CONTENT:
${result.text}

${result.metadata?.pageCount ? `Pages: ${result.metadata.pageCount}\n` : ""}
${result.metadata?.slideCount ? `Slides: ${result.metadata.slideCount}\n` : ""}
${
  result.metadata?.ocrUsed
    ? "Note: OCR was used to extract text from images\n"
    : ""
}
${
  result.quiz
    ? `\nQUIZ AVAILABLE: ${result.quiz.length} questions generated\n`
    : ""
}
${result.error ? `\nProcessing Notes: ${result.error}\n` : ""}`;
        } else {
          content = `Failed to process ${result.fileName}: ${
            result.error || "Unknown error"
          }`;
        }

        const attachment: ChatAttachment = {
          id: `attachment-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}`,
          name: result.fileName,
          type,
          size: result.fileSize,
          content,
        };

        chatService.addDocumentToSession(activeSessionId, attachment);
      }

      // Add a system message about the processed documents
      const processedCount = batchResult.results.filter(
        (r) => r.success
      ).length;
      const failedCount = batchResult.results.length - processedCount;

      let statusMessage = `📚 Processed ${processedCount} document(s) successfully`;
      if (failedCount > 0) {
        statusMessage += ` (${failedCount} failed)`;
      }
      statusMessage +=
        ". I can now help you understand and study these materials!";

      chatService.addMessage(activeSessionId, {
        role: "assistant",
        content: statusMessage,
      });

      // Refresh session data
      const updatedSession = chatService.getSession(activeSessionId);
      if (updatedSession) {
        setMessages([...updatedSession.messages]);
      }

      setSelectedFiles([]);
    } catch (error) {
      console.error("File processing error:", error);

      // Add error message to chat
      if (activeSessionId) {
        chatService.addMessage(activeSessionId, {
          role: "assistant",
          content: `❌ Sorry, I encountered an error processing your files: ${
            error instanceof Error ? error.message : "Unknown error"
          }. Please try again or contact support if the issue persists.`,
        });

        const updatedSession = chatService.getSession(activeSessionId);
        if (updatedSession) {
          setMessages([...updatedSession.messages]);
        }
      }
    } finally {
      setProcessingFiles(false);
    }
  }, [activeSessionId, selectedFiles, processDocuments]);

  const sendMessage = useCallback(async () => {
    if (!inputMessage.trim() || !activeSessionId || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    setIsLoading(true);
    setStreamingMessage("");

    try {
      // Add user message to UI immediately
      const userMsg = chatService.addMessage(activeSessionId, {
        role: "user",
        content: userMessage,
      });
      setMessages((prev) => [...prev, userMsg]);

      // Send to AI and stream response
      await chatService.sendMessage(
        activeSessionId,
        userMessage,
        chatConfig,
        (chunk) => {
          setStreamingMessage((prev) => prev + chunk);
        }
      );

      // Refresh messages after completion
      const updatedSession = chatService.getSession(activeSessionId);
      if (updatedSession) {
        setMessages(updatedSession.messages);
      }
      setStreamingMessage("");
    } catch (error) {
      console.error("Send message error:", error);
      // Add error message
      const errorMsg = chatService.addMessage(activeSessionId, {
        role: "assistant",
        content: `Error: ${
          error instanceof Error ? error.message : "Failed to send message"
        }`,
      });
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [inputMessage, activeSessionId, isLoading, chatConfig]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  const copyMessage = useCallback((content: string) => {
    navigator.clipboard.writeText(content);
  }, []);

  const activeSession = activeSessionId
    ? chatService.getSession(activeSessionId)
    : null;

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            💬 AI Chat Assistant
          </h1>
          <p className="text-muted-foreground">
            Chat with AI and upload documents for context
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="w-4 h-4 mr-1" />
            Settings
          </Button>
          <Button onClick={createNewSession}>
            <Plus className="w-4 h-4 mr-1" />
            New Chat
          </Button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0">
        {/* Chat Sessions Sidebar */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Chat Sessions
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      activeSessionId === session.id
                        ? "bg-primary/10 border border-primary/20"
                        : "bg-muted/50 hover:bg-muted"
                    }`}
                    onClick={() => setActiveSessionId(session.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {session.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {session.messages.length} messages
                        </p>
                        {session.documents.length > 0 && (
                          <p className="text-xs text-primary">
                            📎 {session.documents.length} docs
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSession(session.id);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                {sessions.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No chat sessions yet</p>
                    <p className="text-xs">Create your first chat!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Chat Area */}
        <div className="lg:col-span-3 flex flex-col min-h-0">
          {/* Settings Panel */}
          {showSettings && (
            <Card className="mb-4">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Model</Label>
                    <Select
                      value={chatConfig.selectedModel}
                      onValueChange={(value) =>
                        setChatConfig((prev) => ({
                          ...prev,
                          selectedModel: value,
                        }))
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
                              {model.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-1 mt-1">
                      <AlertTriangle className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs text-yellow-600">
                        Changing model may affect chat quality
                      </span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Temperature</Label>
                    <Select
                      value={chatConfig.temperature.toString()}
                      onValueChange={(value) =>
                        setChatConfig((prev) => ({
                          ...prev,
                          temperature: parseFloat(value),
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.1">0.1 (Focused)</SelectItem>
                        <SelectItem value="0.5">0.5 (Balanced)</SelectItem>
                        <SelectItem value="0.7">0.7 (Creative)</SelectItem>
                        <SelectItem value="1.0">1.0 (Very Creative)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Context Limit</Label>
                    <Select
                      value={chatConfig.contextLimit.toString()}
                      onValueChange={(value) =>
                        setChatConfig((prev) => ({
                          ...prev,
                          contextLimit: parseInt(value),
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="60">60% (Conservative)</SelectItem>
                        <SelectItem value="80">80% (Recommended)</SelectItem>
                        <SelectItem value="90">90% (Aggressive)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="document-context"
                      checked={chatConfig.enableDocumentContext}
                      onCheckedChange={(checked) =>
                        setChatConfig((prev) => ({
                          ...prev,
                          enableDocumentContext: checked,
                        }))
                      }
                    />
                    <Label htmlFor="document-context">
                      Enable Document Context
                    </Label>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">System Prompt</Label>
                    <Textarea
                      value={chatConfig.systemPrompt}
                      onChange={(e) =>
                        setChatConfig((prev) => ({
                          ...prev,
                          systemPrompt: e.target.value,
                        }))
                      }
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Chat Messages */}
          <Card className="flex-1 flex flex-col min-h-0">
            <CardContent className="p-4 flex flex-col h-full min-h-0">
              {activeSession ? (
                <>
                  {/* Session Documents */}
                  {activeSession.documents.length > 0 && (
                    <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Paperclip className="w-4 h-4" />
                        Session Documents ({activeSession.documents.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {activeSession.documents.map((doc) => (
                          <Badge
                            key={doc.id}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {doc.type === "image" ? (
                              <ImageIcon className="w-3 h-3" />
                            ) : (
                              <FileText className="w-3 h-3" />
                            )}
                            {doc.name}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 ml-1"
                              onClick={() =>
                                chatService.removeDocumentFromSession(
                                  activeSessionId!,
                                  doc.id
                                )
                              }
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
                    {messages.length === 0 && (
                      <div className="text-center text-muted-foreground py-12">
                        <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <h3 className="font-semibold mb-2">
                          Start a conversation
                        </h3>
                        <p className="text-sm">
                          Ask me anything or upload documents for context!
                        </p>
                      </div>
                    )}

                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${
                          message.role === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        {message.role === "assistant" && (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-primary" />
                          </div>
                        )}

                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <div className="whitespace-pre-wrap text-sm">
                            {message.content}
                          </div>
                          <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                            <span>
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => copyMessage(message.content)}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        {message.role === "user" && (
                          <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-secondary" />
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Streaming Message */}
                    {streamingMessage && (
                      <div className="flex gap-3 justify-start">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-primary" />
                        </div>
                        <div className="max-w-[80%] rounded-lg p-3 bg-muted">
                          <div className="whitespace-pre-wrap text-sm">
                            {streamingMessage}
                            <span className="animate-pulse">▋</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* File Upload Area */}
                  {selectedFiles.length > 0 && (
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium">Selected Files</h4>
                        <Button
                          onClick={processFiles}
                          disabled={processingFiles}
                          size="sm"
                        >
                          {processingFiles ? (
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          ) : (
                            <Paperclip className="w-4 h-4 mr-1" />
                          )}
                          {processingFiles ? "Processing..." : "Add to Chat"}
                        </Button>
                      </div>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {selectedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-muted/50 rounded"
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              <span className="text-sm">{file.name}</span>
                              <span className="text-xs text-muted-foreground">
                                ({(file.size / 1024 / 1024).toFixed(2)} MB)
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Message Input */}
                  <div className="border-t pt-4">
                    <div className="flex gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept=".pdf,.docx,.pptx,.txt,.jpg,.jpeg,.png,.gif,.bmp,.webp"
                        onChange={(e) => handleFileSelect(e.target.files)}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading}
                      >
                        <Paperclip className="w-4 h-4" />
                      </Button>
                      <div className="flex-1 relative">
                        <Textarea
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Type your message... (Shift+Enter for new line)"
                          className="min-h-[60px] pr-12 resize-none"
                          disabled={isLoading}
                        />
                        <Button
                          onClick={sendMessage}
                          disabled={!inputMessage.trim() || isLoading}
                          className="absolute bottom-2 right-2"
                          size="sm"
                        >
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">
                      No Chat Selected
                    </h3>
                    <p className="text-sm mb-4">
                      Create a new chat session to get started
                    </p>
                    <Button onClick={createNewSession}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create New Chat
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
