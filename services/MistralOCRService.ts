import { Mistral } from '@mistralai/mistralai';

export interface OCRResult {
  success: boolean;
  text: string;
  confidence: number;
  processingTime: number;
  error?: string;
}

export class MistralOCRService {
  private client: Mistral;
  private model: string;

  constructor(apiKey: string, model: string = 'pixtral-12b-2409') {
    this.client = new Mistral({
      apiKey: apiKey,
    });
    this.model = model;
  }

  async extractTextFromImage(imageBuffer: Buffer): Promise<OCRResult> {
    const startTime = Date.now();
    
    try {
      const base64Image = imageBuffer.toString('base64');
      
      const response = await this.client.chat.complete({
        model: this.model,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extract all text from this image. Return only the text content, maintaining the original structure and formatting as much as possible.'
              },
              {
                type: 'image_url',
                imageUrl: `data:image/jpeg;base64,${base64Image}`
              }
            ]
          }
        ],
        maxTokens: 16000,
      });

      const extractedText = typeof response.choices[0]?.message?.content === 'string' 
        ? response.choices[0].message.content 
        : '';
      
      return {
        success: true,
        text: extractedText,
        confidence: 0.95, // Mistral typically has high confidence
        processingTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        text: '',
        confidence: 0,
        processingTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown OCR error'
      };
    }
  }

  async extractTextFromPDFPages(pdfPages: Buffer[]): Promise<OCRResult> {
    const startTime = Date.now();
    const extractedTexts: string[] = [];
    
    try {
      for (const pageBuffer of pdfPages) {
        const pageResult = await this.extractTextFromImage(pageBuffer);
        if (pageResult.success) {
          extractedTexts.push(pageResult.text);
        }
      }

      return {
        success: extractedTexts.length > 0,
        text: extractedTexts.join('\n\n--- Page Break ---\n\n'),
        confidence: 0.95,
        processingTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        text: '',
        confidence: 0,
        processingTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown PDF OCR error'
      };
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      // Create a simple test image (1x1 pixel base64)
      const testImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      
      const response = await this.client.chat.complete({
        model: this.model,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Test connection'
              },
              {
                type: 'image_url',
                imageUrl: `data:image/png;base64,${testImage}`
              }
            ]
          }
        ],
        maxTokens: 10,
      });

      return response.choices.length > 0;
    } catch (error) {
      console.error('Mistral OCR connection test failed:', error);
      return false;
    }
  }
}
