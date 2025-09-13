import { PDFProcessingService, PDFProcessingResult } from './PDFProcessingService';
import { DOCXProcessingService, DOCXProcessingResult } from './DOCXProcessingService';
import { PPTXProcessingService, PPTXProcessingResult } from './PPTXProcessingService';
import { MistralOCRService, OCRResult } from './MistralOCRService';
import { GroqService, QuizQuestion, QuizOptions } from './GroqService';

export interface DocumentProcessingOptions {
  groqApiKey?: string;
  mistralApiKey?: string;
  selectedGroqModel?: string;
  selectedMistralModel?: string;
  generateQuiz?: boolean;
  quizOptions?: {
    numQuestions?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    questionType?: 'mcq' | 'true_false' | 'mixed';
  };
}

export interface ProcessingResult {
  success: boolean;
  text: string;
  wordCount: number;
  processingTime: number;
  fileType: string;
  fileName: string;
  fileSize: number;
  quiz?: QuizQuestion[];
  error?: string;
  quizError?: string;
  metadata?: {
    pageCount?: number;
    slideCount?: number;
    isImageBased?: boolean;
    ocrUsed?: boolean;
  };
}

export interface BatchProcessingResult {
  results: ProcessingResult[];
  totalFiles: number;
  successfulFiles: number;
  failedFiles: number;
  totalProcessingTime: number;
}

export class DocumentProcessingService {
  private pdfService: PDFProcessingService;
  private docxService: DOCXProcessingService;
  private pptxService: PPTXProcessingService;
  private mistralOCR?: MistralOCRService;
  private groqService?: GroqService;

  constructor(options: DocumentProcessingOptions = {}) {
    this.pdfService = new PDFProcessingService(options.mistralApiKey, options.selectedMistralModel);
    this.docxService = new DOCXProcessingService(options.mistralApiKey, options.selectedMistralModel);
    this.pptxService = new PPTXProcessingService(options.mistralApiKey, options.selectedMistralModel);
    
    if (options.mistralApiKey) {
      this.mistralOCR = new MistralOCRService(options.mistralApiKey, options.selectedMistralModel);
    }
    
    if (options.groqApiKey) {
      this.groqService = new GroqService(options.selectedGroqModel || 'llama-3.3-70b-versatile');
    }
  }

  async processDocument(file: File, options: DocumentProcessingOptions = {}): Promise<ProcessingResult> {
    const startTime = Date.now();
    
    const result: ProcessingResult = {
      success: false,
      text: '',
      wordCount: 0,
      processingTime: 0,
      fileType: this.getFileType(file.name),
      fileName: file.name,
      fileSize: file.size,
      metadata: {}
    };

    try {
      // Process based on file type
      switch (result.fileType.toLowerCase()) {
        case 'pdf':
          const pdfResult = await this.pdfService.processPDF(file);
          result.text = pdfResult.text;
          result.success = pdfResult.success;
          result.metadata = {
            pageCount: pdfResult.pageCount,
            isImageBased: pdfResult.isImageBased,
            ocrUsed: pdfResult.isImageBased
          };
          if (pdfResult.error) result.error = pdfResult.error;
          break;
          
        case 'docx':
          const docxResult = await this.docxService.processDOCX(file);
          result.text = docxResult.text;
          result.success = docxResult.success;
          result.wordCount = docxResult.wordCount;
          if (docxResult.error) result.error = docxResult.error;
          break;
          
        case 'pptx':
          const pptxResult = await this.pptxService.processPPTX(file);
          result.text = pptxResult.text;
          result.success = pptxResult.success;
          result.metadata = {
            slideCount: pptxResult.slideCount,
            ocrUsed: true // PPTX processing includes image OCR
          };
          if (pptxResult.error) result.error = pptxResult.error;
          break;
          
        case 'txt':
          result.text = await file.text();
          result.success = true;
          break;
          
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'bmp':
        case 'webp':
          if (this.mistralOCR) {
            const imageBuffer = Buffer.from(await file.arrayBuffer());
            const ocrResult = await this.mistralOCR.extractTextFromImage(imageBuffer);
            result.text = ocrResult.text;
            result.success = ocrResult.success;
            result.metadata = {
              ocrUsed: true
            };
            if (ocrResult.error) result.error = ocrResult.error;
          } else {
            throw new Error('OCR service not available for image processing');
          }
          break;
          
        default:
          throw new Error(`Unsupported file type: ${result.fileType}`);
      }

      // Calculate word count if not already set
      if (result.wordCount === 0) {
        result.wordCount = this.countWords(result.text);
      }

      // Generate quiz if requested and text extraction was successful
      if (options.generateQuiz && result.success && result.text.trim().length > 0) {
        try {
          console.log('Generating quiz from extracted text...');
          console.log('Text length:', result.text.length, 'characters');
          
          // Truncate text if too long (keep first 20000 characters for context)
          let textForQuiz = result.text;
          if (textForQuiz.length > 20000) {
            textForQuiz = textForQuiz.substring(0, 20000) + '\n\n[Content truncated for quiz generation]';
            console.log('Text truncated to 20000 characters for quiz generation');
          }
          
          result.quiz = await this.generateQuizFromText(textForQuiz, options.quizOptions, options.selectedGroqModel);
          console.log('Quiz generated successfully:', result.quiz);
        } catch (quizError) {
          console.error('Quiz generation failed:', quizError);
          result.quizError = quizError instanceof Error ? quizError.message : 'Quiz generation failed';
        }
      }

      result.processingTime = Date.now() - startTime;
      
    } catch (error) {
      result.success = false;
      result.error = error instanceof Error ? error.message : 'Unknown error';
      result.processingTime = Date.now() - startTime;
    }

    return result;
  }

  async generateQuizFromText(text: string, options: QuizOptions = {}, selectedModel?: string): Promise<QuizQuestion[]> {
    if (text.trim().length < 100) {
      throw new Error('Insufficient content for quiz generation');
    }

    // Create a new GroqService instance with the selected model if provided
    const groqService = selectedModel 
      ? new GroqService(selectedModel)
      : this.groqService;

    if (!groqService) {
      throw new Error('Groq API key required for quiz generation');
    }

    return await groqService.generateQuiz(text, options);
  }

  async generateQuizFromDocuments(results: ProcessingResult[], options: QuizOptions = {}, selectedModel?: string): Promise<QuizQuestion[]> {
    // Combine all successful document texts
    const combinedText = results
      .filter(r => r.success && r.text.trim().length > 0)
      .map(r => r.text)
      .join('\n\n--- Document Separator ---\n\n');

    if (combinedText.trim().length < 100) {
      throw new Error('Insufficient content from documents for quiz generation');
    }

    return await this.generateQuizFromText(combinedText, options, selectedModel);
  }

  async processBatch(
    files: File[], 
    options: DocumentProcessingOptions = {},
    onProgress?: (completed: number, total: number, currentFile: string) => void
  ): Promise<BatchProcessingResult> {
    const startTime = Date.now();
    const results: ProcessingResult[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (onProgress) {
        onProgress(i, files.length, file.name);
      }
      
      try {
        const result = await this.processDocument(file, options);
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          text: '',
          wordCount: 0,
          processingTime: 0,
          fileType: this.getFileType(file.name),
          fileName: file.name,
          fileSize: file.size,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    if (onProgress) {
      onProgress(files.length, files.length, '');
    }

    const successfulFiles = results.filter(r => r.success).length;
    const failedFiles = results.length - successfulFiles;

    return {
      results,
      totalFiles: files.length,
      successfulFiles,
      failedFiles,
      totalProcessingTime: Date.now() - startTime
    };
  }

  async testServices(): Promise<{
    groq: boolean;
    mistral: boolean;
  }> {
    const results = {
      groq: false,
      mistral: false
    };

    if (this.groqService) {
      try {
        results.groq = await this.groqService.testConnection();
      } catch (error) {
        console.error('Groq test failed:', error);
      }
    }

    if (this.mistralOCR) {
      try {
        results.mistral = await this.mistralOCR.testConnection();
      } catch (error) {
        console.error('Mistral test failed:', error);
      }
    }

    return results;
  }

  private getFileType(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();
    return extension || 'unknown';
  }

  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  static getSupportedFileTypes(): string[] {
    return ['pdf', 'docx', 'pptx', 'txt', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
  }

  static isFileTypeSupported(filename: string): boolean {
    const extension = filename.split('.').pop()?.toLowerCase();
    return this.getSupportedFileTypes().includes(extension || '');
  }

  static getMaxFileSize(): number {
    return 50 * 1024 * 1024; // 50MB
  }

  static validateFile(file: File): { isValid: boolean; error?: string } {
    if (!this.isFileTypeSupported(file.name)) {
      return {
        isValid: false,
        error: `Unsupported file type. Supported types: ${this.getSupportedFileTypes().join(', ')}`
      };
    }

    if (file.size > this.getMaxFileSize()) {
      return {
        isValid: false,
        error: `File too large. Maximum size: ${this.getMaxFileSize() / (1024 * 1024)}MB`
      };
    }

    return { isValid: true };
  }
}
