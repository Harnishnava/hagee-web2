'use client';

import { useState, useCallback } from 'react';
import { ProcessingResult } from '../services/DocumentProcessingService';
import { useDocumentProcessing } from '../contexts/DocumentProcessingContext';

interface DocumentProcessorCallbacks {
  onProcessingComplete: (result: ProcessingResult) => void;
  onProcessingError: (error: string) => void;
  onProcessingStart: () => void;
}

export function useDocumentProcessor() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { aiConfig } = useDocumentProcessing();

  const processDocument = useCallback(async (
    file: File, 
    callbacks: DocumentProcessorCallbacks
  ) => {
    if (typeof window === 'undefined') {
      callbacks.onProcessingError('Document processing is only available in the browser');
      return;
    }

    try {
      setIsProcessing(true);
      callbacks.onProcessingStart();
      
      console.log('Starting document processing for:', file.name);
      console.log('API Keys available:', {
        groq: !!process.env.NEXT_PUBLIC_GROQ_API_KEY,
        mistral: !!process.env.NEXT_PUBLIC_MISTRAL_API_KEY
      });
      
      // Dynamic import to ensure client-side only loading
      const { DocumentProcessingService } = await import('../services/DocumentProcessingService');
      const documentProcessor = new DocumentProcessingService({
        groqApiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
        mistralApiKey: process.env.NEXT_PUBLIC_MISTRAL_API_KEY,
        selectedGroqModel: aiConfig.selectedGroqModel,
        selectedMistralModel: aiConfig.selectedMistralModel
      });
      
      console.log('DocumentProcessingService created, processing file...');
      console.log('Using quiz settings:', {
        numQuestions: aiConfig.numQuestions,
        difficulty: aiConfig.difficulty,
        questionType: aiConfig.questionType
      });
      
      const result = await documentProcessor.processDocument(file, {
        generateQuiz: aiConfig.generateQuiz,
        quizOptions: {
          numQuestions: aiConfig.numQuestions,
          difficulty: aiConfig.difficulty,
          questionType: aiConfig.questionType
        }
      });
      
      console.log('Document processing result:', result);
      
      callbacks.onProcessingComplete(result);
    } catch (error) {
      console.error('Document processing error:', error);
      callbacks.onProcessingError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsProcessing(false);
    }
  }, [aiConfig]);

  return {
    processDocument,
    isProcessing
  };
}
