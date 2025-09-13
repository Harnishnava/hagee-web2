import { XMLParser } from 'fast-xml-parser';
import { MistralOCRService } from './MistralOCRService';

export interface PPTXProcessingResult {
  success: boolean;
  text: string;
  slideCount: number;
  processingTime: number;
  error?: string;
}

export class PPTXProcessingService {
  private mistralOCR?: MistralOCRService;
  private xmlParser: XMLParser;

  constructor(mistralApiKey?: string, mistralModel?: string) {
    if (mistralApiKey) {
      this.mistralOCR = new MistralOCRService(mistralApiKey, mistralModel);
    }
    
    this.xmlParser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_"
    });
  }

  async processPPTX(file: File): Promise<PPTXProcessingResult> {
    const startTime = Date.now();
    
    try {
      // Dynamic imports to ensure client-side only loading
      const JSZip = (await import('jszip')).default;
      
      const arrayBuffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);
      
      const slideTexts: string[] = [];
      let slideCount = 0;
      
      // Extract text from slides
      const slideFiles = Object.keys(zip.files).filter(name => 
        name.startsWith('ppt/slides/slide') && name.endsWith('.xml')
      );
      
      slideCount = slideFiles.length;
      
      for (const slideFile of slideFiles) {
        const slideXml = await zip.files[slideFile].async('text');
        const slideText = this.extractTextFromSlideXML(slideXml);
        
        if (slideText.trim()) {
          slideTexts.push(`--- Slide ${slideFiles.indexOf(slideFile) + 1} ---\n${slideText}`);
        }
      }
      
      // Extract images and process with OCR if available
      const imageTexts: string[] = [];
      if (this.mistralOCR) {
        const imageFiles = Object.keys(zip.files).filter(name => 
          name.startsWith('ppt/media/') && /\.(jpg|jpeg|png|gif)$/i.test(name)
        );
        
        for (const imageFile of imageFiles.slice(0, 5)) { // Limit to 5 images
          try {
            const imageBuffer = await zip.files[imageFile].async('nodebuffer');
            const ocrResult = await this.mistralOCR.extractTextFromImage(imageBuffer);
            
            if (ocrResult.success && ocrResult.text.trim()) {
              imageTexts.push(`--- Image: ${imageFile} ---\n${ocrResult.text}`);
            }
          } catch (error) {
            console.warn(`Failed to process image ${imageFile}:`, error);
          }
        }
      }
      
      const fullText = [...slideTexts, ...imageTexts].join('\n\n');
      
      return {
        success: true,
        text: fullText,
        slideCount,
        processingTime: Date.now() - startTime
      };
      
    } catch (error) {
      return {
        success: false,
        text: '',
        slideCount: 0,
        processingTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown PPTX processing error'
      };
    }
  }

  private extractTextFromSlideXML(xmlContent: string): string {
    try {
      // Create XML parser
      const parsed = this.xmlParser.parse(xmlContent);
      const texts: string[] = [];
      
      // Recursively extract text from XML structure
      this.extractTextRecursive(parsed, texts);
      
      return texts.join(' ').replace(/\s+/g, ' ').trim();
    } catch (error) {
      console.warn('Failed to parse slide XML:', error);
      return '';
    }
  }

  private extractTextRecursive(obj: any, texts: string[]): void {
    if (typeof obj === 'string') {
      texts.push(obj);
      return;
    }
    
    if (typeof obj !== 'object' || obj === null) {
      return;
    }
    
    // Look for text elements
    if (obj['a:t']) {
      if (typeof obj['a:t'] === 'string') {
        texts.push(obj['a:t']);
      }
    }
    
    // Recursively process all properties
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (Array.isArray(obj[key])) {
          obj[key].forEach((item: any) => this.extractTextRecursive(item, texts));
        } else {
          this.extractTextRecursive(obj[key], texts);
        }
      }
    }
  }
}
