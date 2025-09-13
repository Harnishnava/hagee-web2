import { MistralOCRService, OCRResult } from './MistralOCRService';

export interface PDFProcessingResult {
  success: boolean;
  text: string;
  pageCount: number;
  processingTime: number;
  isImageBased: boolean;
  error?: string;
}

export class PDFProcessingService {
  private mistralOCR?: MistralOCRService;

  constructor(mistralApiKey?: string, selectedModel?: string) {
    if (mistralApiKey) {
      this.mistralOCR = new MistralOCRService(mistralApiKey, selectedModel);
    }
  }

  async processPDF(file: File): Promise<PDFProcessingResult> {
    const startTime = Date.now();
    
    // Use Mistral OCR for all PDF processing
    if (!this.mistralOCR) {
      return {
        success: false,
        text: '',
        pageCount: 0,
        isImageBased: true,
        processingTime: Date.now() - startTime,
        error: 'Mistral OCR service not available for PDF processing'
      };
    }

    try {
      console.log('Processing PDF with Mistral OCR...');
      const buffer = Buffer.from(await file.arrayBuffer());
      const ocrResult = await this.mistralOCR.extractTextFromImage(buffer);
      
      return {
        success: ocrResult.success,
        text: ocrResult.text,
        pageCount: 1, // Mistral processes entire PDF as one unit
        isImageBased: true,
        processingTime: Date.now() - startTime,
        error: ocrResult.error
      };
      
    } catch (error) {
      console.error('PDF OCR processing error:', error);
      return {
        success: false,
        text: '',
        pageCount: 0,
        isImageBased: true,
        processingTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private isImageBasedPDF(text: string): boolean {
    // If we get very little text relative to what we'd expect, it's likely image-based
    const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;
    return wordCount < 50; // Threshold for considering it image-based
  }
}
