"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import {
  DocumentProcessingService,
  ProcessingResult,
  BatchProcessingResult,
  DocumentProcessingOptions,
} from "@/services/DocumentProcessingService";
import { QuizQuestion } from "@/services/GroqService";

export interface AIConfiguration {
  selectedGroqModel: string;
  selectedMistralModel: string;
  generateQuiz: boolean;
  numQuestions: number;
  difficulty: "easy" | "medium" | "hard";
  questionType: "mcq" | "true_false" | "mixed";
}

export interface ModelOption {
  id: string;
  name: string;
  description: string;
  contextLength: number;
  provider: "groq" | "mistral";
}

export interface ProcessingProgress {
  isProcessing: boolean;
  currentFile: string;
  completed: number;
  total: number;
  percentage: number;
}

interface DocumentProcessingContextType {
  // Configuration
  aiConfig: AIConfiguration;
  updateAIConfig: (config: Partial<AIConfiguration>) => void;
  availableModels: ModelOption[];

  // Processing state
  processingProgress: ProcessingProgress;
  results: ProcessingResult[];

  // Actions
  processFiles: (files: File[]) => Promise<BatchProcessingResult>;
  processSingleFile: (file: File) => Promise<ProcessingResult>;
  generateQuizFromText: (text: string) => Promise<QuizQuestion[]>;
  clearResults: () => void;

  // Service testing
  testServices: () => Promise<{ groq: boolean; mistral: boolean }>;
}

const DocumentProcessingContext = createContext<
  DocumentProcessingContextType | undefined
>(undefined);

const AVAILABLE_MODELS: ModelOption[] = [
  // Groq Models - Only the 5 specified models
  {
    id: "llama-3.3-70b-versatile",
    name: "Llama 3.3 70B Versatile",
    description: "Latest versatile Llama model (Production)",
    contextLength: 32768,
    provider: "groq",
  },
  {
    id: "openai/gpt-oss-120b",
    name: "OpenAI GPT-OSS 120B",
    description: "OpenAI's flagship open-weight model (Production)",
    contextLength: 128000,
    provider: "groq",
  },
  {
    id: "deepseek-r1-distill-llama-70b",
    name: "DeepSeek R1 Distill 70B",
    description: "Optimized reasoning model (Preview)",
    contextLength: 8192,
    provider: "groq",
  },
  {
    id: "qwen/qwen3-32b",
    name: "Qwen 3 32B",
    description: "Advanced reasoning and instruction following (Preview)",
    contextLength: 32768,
    provider: "groq",
  },
  {
    id: "moonshotai/kimi-k2-instruct",
    name: "Kimi K2 Instruct",
    description: "Moonshot AI's instruction-tuned model (Preview)",
    contextLength: 32768,
    provider: "groq",
  },
  // Mistral Models
  {
    id: "mistral-large-latest",
    name: "Mistral Large",
    description: "Most capable Mistral model",
    contextLength: 32768,
    provider: "mistral",
  },
  {
    id: "pixtral-12b-2409",
    name: "Pixtral 12B",
    description: "Vision model for OCR and image analysis",
    contextLength: 16384,
    provider: "mistral",
  },
];

export function DocumentProcessingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [aiConfig, setAIConfig] = useState<AIConfiguration>({
    selectedGroqModel: "", // No default - user must select
    selectedMistralModel: "pixtral-12b-2409",
    generateQuiz: true,
    numQuestions: 5,
    difficulty: "medium",
    questionType: "mcq",
  });

  const [processingProgress, setProcessingProgress] =
    useState<ProcessingProgress>({
      isProcessing: false,
      currentFile: "",
      completed: 0,
      total: 0,
      percentage: 0,
    });

  const [results, setResults] = useState<ProcessingResult[]>([]);

  const updateAIConfig = useCallback((config: Partial<AIConfiguration>) => {
    setAIConfig((prev) => ({ ...prev, ...config }));
  }, []);

  const getDocumentService = useCallback(() => {
    return new DocumentProcessingService({
      groqApiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
      mistralApiKey: process.env.NEXT_PUBLIC_MISTRAL_API_KEY,
      selectedGroqModel: aiConfig.selectedGroqModel,
      selectedMistralModel: aiConfig.selectedMistralModel,
    });
  }, [aiConfig.selectedGroqModel, aiConfig.selectedMistralModel]);

  const processFiles = useCallback(
    async (files: File[]): Promise<BatchProcessingResult> => {
      if (files.length === 0) {
        return {
          results: [],
          totalFiles: 0,
          successfulFiles: 0,
          failedFiles: 0,
          totalProcessingTime: 0
        };
      }

      // Validate that a Groq model is selected
      if (!aiConfig.selectedGroqModel) {
        throw new Error('Please select a Groq model before processing files');
      }

      setProcessingProgress({
        isProcessing: true,
        currentFile: files[0].name,
        completed: 0,
        total: files.length,
        percentage: 0,
      });

      try {
        const service = getDocumentService();
        const batchResult = await service.processBatch(
          files,
          {
            groqApiKey: process.env.NEXTJS_PUBLIC_GROQ_API_KEY || undefined,
            mistralApiKey:
              process.env.NEXTJS_PUBLIC_MISTRAL_API_KEY || undefined,
            selectedGroqModel: aiConfig.selectedGroqModel,
            selectedMistralModel: aiConfig.selectedMistralModel,
            generateQuiz: aiConfig.generateQuiz,
            quizOptions: {
              numQuestions: aiConfig.numQuestions,
              difficulty: aiConfig.difficulty,
              questionType: aiConfig.questionType,
            },
          },
          (completed, total, currentFile) => {
            const percentage = Math.round((completed / total) * 100);
            setProcessingProgress({
              isProcessing: completed < total,
              currentFile,
              completed,
              total,
              percentage,
            });
          }
        );

        setResults((prev) => [...prev, ...batchResult.results]);

        setProcessingProgress({
          isProcessing: false,
          currentFile: "",
          completed: files.length,
          total: files.length,
          percentage: 100,
        });

        return batchResult;
      } catch (error) {
        setProcessingProgress({
          isProcessing: false,
          currentFile: "",
          completed: 0,
          total: 0,
          percentage: 0,
        });
        throw error;
      }
    },
    [getDocumentService, aiConfig]
  );

  const processSingleFile = useCallback(
    async (file: File): Promise<ProcessingResult> => {
      const service = getDocumentService();

      setProcessingProgress({
        isProcessing: true,
        currentFile: file.name,
        completed: 0,
        total: 1,
        percentage: 0,
      });

      try {
        const result = await service.processDocument(file, {
          groqApiKey: process.env.NEXTJS_PUBLIC_GROQ_API_KEY || undefined,
          mistralApiKey: process.env.NEXTJS_PUBLIC_MISTRAL_API_KEY || undefined,
          selectedGroqModel: aiConfig.selectedGroqModel,
          selectedMistralModel: aiConfig.selectedMistralModel,
          generateQuiz: aiConfig.generateQuiz,
          quizOptions: {
            numQuestions: aiConfig.numQuestions,
            difficulty: aiConfig.difficulty,
            questionType: aiConfig.questionType,
          },
        });

        setResults((prev) => [...prev, result]);

        setProcessingProgress({
          isProcessing: false,
          currentFile: "",
          completed: 1,
          total: 1,
          percentage: 100,
        });

        return result;
      } catch (error) {
        setProcessingProgress({
          isProcessing: false,
          currentFile: "",
          completed: 0,
          total: 0,
          percentage: 0,
        });
        throw error;
      }
    },
    [getDocumentService, aiConfig]
  );

  const generateQuizFromText = useCallback(
    async (text: string): Promise<QuizQuestion[]> => {
      const service = getDocumentService();
      return await service.generateQuizFromText(text, {
        numQuestions: aiConfig.numQuestions,
        difficulty: aiConfig.difficulty,
        questionType: aiConfig.questionType,
      });
    },
    [getDocumentService, aiConfig]
  );

  const clearResults = useCallback(() => {
    setResults([]);
    setProcessingProgress({
      isProcessing: false,
      currentFile: "",
      completed: 0,
      total: 0,
      percentage: 0,
    });
  }, []);

  const testServices = useCallback(async () => {
    const service = getDocumentService();
    return await service.testServices();
  }, [getDocumentService]);

  const value: DocumentProcessingContextType = {
    aiConfig,
    updateAIConfig,
    availableModels: AVAILABLE_MODELS,
    processingProgress,
    results,
    processFiles,
    processSingleFile,
    generateQuizFromText,
    clearResults,
    testServices,
  };

  return (
    <DocumentProcessingContext.Provider value={value}>
      {children}
    </DocumentProcessingContext.Provider>
  );
}

export function useDocumentProcessing() {
  const context = useContext(DocumentProcessingContext);
  if (context === undefined) {
    throw new Error(
      "useDocumentProcessing must be used within a DocumentProcessingProvider"
    );
  }
  return context;
}
