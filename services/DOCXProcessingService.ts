import mammoth from 'mammoth';
import { MistralOCRService, OCRResult } from './MistralOCRService';

export interface DOCXProcessingResult {
  success: boolean;
  text: string;
  wordCount: number;
  processingTime: number;
  error?: string;
}

export class DOCXProcessingService {
  private mistralOCR?: MistralOCRService;

  constructor(mistralApiKey?: string, mistralModel?: string) {
    if (mistralApiKey) {
      this.mistralOCR = new MistralOCRService(mistralApiKey, mistralModel);
    }
  }

  async processDOCX(file: File): Promise<DOCXProcessingResult> {
    const startTime = Date.now();
    
    try {
      // Dynamic import to ensure client-side only loading
      const mammoth = await import('mammoth');
      
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      
      // Extract images if present and process with OCR
      let imageText = '';
      if (this.mistralOCR) {
        const imageResult = await mammoth.images.imgElement(function(image) {
          return image.read("base64").then(function(imageBuffer) {
            // Store image for OCR processing
            return {
              src: imageBuffer
            };
          });
        });
        
        // Process images with OCR (simplified for now)
        // In a full implementation, you'd extract and process each image
      }
      
      const fullText = result.value + (imageText ? '\n\n--- Images ---\n' + imageText : '');
      const wordCount = this.countWords(fullText);
      
      return {
        success: true,
        text: fullText,
        wordCount,
        processingTime: Date.now() - startTime
      };
      
    } catch (error) {
      return {
        success: false,
        text: '',
        wordCount: 0,
        processingTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown DOCX processing error'
      };
    }
  }

  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }
}
