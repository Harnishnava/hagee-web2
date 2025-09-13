import Groq from 'groq-sdk';

export interface QuizQuestion {
  id: string;
  type: 'mcq' | 'true_false';
  question: string;
  options?: string[]; // For MCQ
  correctAnswer: string | boolean;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuizOptions {
  numQuestions?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  questionType?: 'mcq' | 'true_false' | 'mixed';
}

export class GroqService {
  private client: Groq;
  private model: string;

  constructor(model: string) {
    const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY is not set in environment variables');
    }
    
    this.client = new Groq({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true,
    });
    this.model = model;
  }

  async generateQuiz(text: string, options: QuizOptions = {}): Promise<QuizQuestion[]> {
    const {
      numQuestions = 5,
      difficulty = 'medium',
      questionType = 'mixed'
    } = options;

    const prompt = this.buildQuizPrompt(text, numQuestions, difficulty, questionType);

    try {
      const response = await this.client.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an expert quiz generator. Create high-quality educational questions based on the provided content. CRITICAL: You must respond ONLY with valid JSON format. Do not include any explanatory text before or after the JSON. Start your response with { and end with }.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: this.model,
        temperature: 0.7,
        max_tokens: 8000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from Groq API');
      }

      return this.parseQuizResponse(content);
    } catch (error) {
      console.error('Quiz generation failed:', error);
      throw new Error(`Failed to generate quiz: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private buildQuizPrompt(text: string, numQuestions: number, difficulty: string, questionType: string): string {
    const typeInstruction = questionType === 'mixed' 
      ? 'Mix of multiple choice (4 options) and true/false questions'
      : questionType === 'mcq' 
        ? 'Multiple choice questions with 4 options each'
        : 'True/false questions only';

    return `
Based on the following text, generate ${numQuestions} ${difficulty} difficulty quiz questions.

Question Type: ${typeInstruction}

Text Content:
${text}

Requirements:
1. Questions should test understanding of key concepts from the text
2. For MCQ: Provide exactly 4 options (A, B, C, D) with one correct answer
3. For True/False: Create statements that can be clearly true or false based on the text
4. Include explanations for each correct answer
5. Ensure questions are ${difficulty} difficulty level

IMPORTANT: Respond ONLY with valid JSON. No additional text or explanations outside the JSON.

Response Format (JSON):
{
  "questions": [
    {
      "id": "q1",
      "type": "mcq",
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Explanation of why this is correct",
      "difficulty": "${difficulty}"
    },
    {
      "id": "q2", 
      "type": "true_false",
      "question": "Statement to evaluate",
      "correctAnswer": true,
      "explanation": "Explanation of the answer",
      "difficulty": "${difficulty}"
    }
  ]
}

Generate exactly ${numQuestions} questions following this format. Return ONLY the JSON object.`;
  }

  private parseQuizResponse(content: string): QuizQuestion[] {
    try {
      console.log('Raw AI response:', content);
      
      // Try multiple JSON extraction methods
      let jsonString = '';
      
      // Method 1: Look for JSON between ```json and ``` markers
      const codeBlockMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (codeBlockMatch) {
        jsonString = codeBlockMatch[1];
      } else {
        // Method 2: Look for the first complete JSON object
        const jsonMatch = content.match(/\{[\s\S]*?\}(?=\s*$|\s*\n\s*[^}])/);
        if (jsonMatch) {
          jsonString = jsonMatch[0];
        } else {
          // Method 3: Extract everything between first { and last }
          const firstBrace = content.indexOf('{');
          const lastBrace = content.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            jsonString = content.substring(firstBrace, lastBrace + 1);
          }
        }
      }

      if (!jsonString) {
        console.error('No JSON structure found in response');
        throw new Error('No JSON found in response');
      }

      console.log('Extracted JSON string length:', jsonString.length);

      // Robust JSON cleaning and validation
      jsonString = this.sanitizeJsonString(jsonString);

      let parsed;
      try {
        parsed = JSON.parse(jsonString);
      } catch (parseError) {
        console.log('JSON parse failed, attempting manual repair...');
        // Try to fix the specific issue with quotes in explanations
        const repairedJson = this.repairJsonQuotes(jsonString);
        parsed = JSON.parse(repairedJson);
      }
      
      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        console.error('Invalid quiz format - parsed object:', parsed);
        throw new Error('Invalid quiz format: missing questions array');
      }

      console.log('Successfully parsed questions:', parsed.questions.length);

      return parsed.questions.map((q: any, index: number) => ({
        id: q.id || `q${index + 1}`,
        type: q.type || 'mcq',
        question: q.question || '',
        options: q.options || undefined,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || '',
        difficulty: q.difficulty || 'medium'
      }));
    } catch (error) {
      console.error('Failed to parse quiz response:', error);
      console.error('Content that failed to parse:', content);
      throw new Error('Failed to parse quiz response from AI');
    }
  }

  private sanitizeJsonString(jsonString: string): string {
    // Remove non-printable characters except newlines and tabs
    let cleaned = jsonString.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '');
    
    // Fix common JSON formatting issues
    cleaned = cleaned
      .replace(/,\s*}/g, '}') // Remove trailing commas before closing braces
      .replace(/,\s*]/g, ']') // Remove trailing commas before closing brackets
      .trim();

    return cleaned;
  }

  private repairJsonQuotes(jsonString: string): string {
    // Split by lines and fix quotes in string values
    const lines = jsonString.split('\n');
    const repairedLines = lines.map(line => {
      // If line contains a string field (like "explanation": "..."), fix quotes inside the value
      if (line.includes('"explanation":') || line.includes('"question":')) {
        // Find the value part after the colon
        const colonIndex = line.indexOf(':');
        if (colonIndex !== -1) {
          const beforeColon = line.substring(0, colonIndex + 1);
          const afterColon = line.substring(colonIndex + 1).trim();
          
          // If it starts and ends with quotes, fix internal quotes
          if (afterColon.startsWith('"') && afterColon.endsWith('"') || afterColon.endsWith('",')) {
            const isLastItem = afterColon.endsWith('",');
            const valueContent = afterColon.slice(1, isLastItem ? -2 : -1);
            const fixedContent = valueContent.replace(/"/g, '\\"');
            return beforeColon + ' "' + fixedContent + '"' + (isLastItem ? ',' : '');
          }
        }
      }
      return line;
    });
    
    return repairedLines.join('\n');
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.client.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: 'Test connection - respond with "OK"'
          }
        ],
        model: this.model,
        max_tokens: 5,
      });

      return response.choices.length > 0;
    } catch (error) {
      console.error('Groq connection test failed:', error);
      return false;
    }
  }
}
