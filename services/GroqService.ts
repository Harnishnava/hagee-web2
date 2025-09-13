import Groq from "groq-sdk";

export interface QuizQuestion {
  id: string;
  type: "mcq" | "true_false";
  question: string;
  options?: string[]; // For MCQ
  correctAnswer: string | boolean;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface QuizOptions {
  numQuestions?: number;
  difficulty?: "easy" | "medium" | "hard";
  questionType?: "mcq" | "true_false" | "mixed";
}

export class GroqService {
  private client: Groq;
  private model: string;

  constructor(model: string) {
    const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("GROQ_API_KEY is not set in environment variables");
    }

    this.client = new Groq({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true,
    });
    this.model = model;
  }

  async generateQuiz(
    text: string,
    options: QuizOptions = {}
  ): Promise<QuizQuestion[]> {
    const {
      numQuestions = 5,
      difficulty = "medium",
      questionType = "mixed",
    } = options;

    const prompt = this.buildQuizPrompt(
      text,
      numQuestions,
      difficulty,
      questionType
    );

    try {
      const response = await this.client.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              'You are an expert quiz generator. Create high-quality educational questions based on the provided content. CRITICAL: You must respond ONLY with valid JSON format. Do not include any explanatory text before or after the JSON. Start your response with { and end with }. Use only straight double quotes (") for JSON strings, never use curly quotes or other quote variants.',
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        model: this.model,
        temperature: 0.7,
        max_tokens: 8000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No response from Groq API");
      }

      return this.parseQuizResponse(content);
    } catch (error) {
      console.error("Quiz generation failed:", error);
      throw new Error(
        `Failed to generate quiz: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  private buildQuizPrompt(
    text: string,
    numQuestions: number,
    difficulty: string,
    questionType: string
  ): string {
    const typeInstruction =
      questionType === "mixed"
        ? "Mix of multiple choice (4 options) and true/false questions"
        : questionType === "mcq"
        ? "Multiple choice questions with 4 options each"
        : "True/false questions only";

    return `
Based on the following text, generate ${numQuestions} ${difficulty} difficulty quiz questions.

Question Type: ${typeInstruction}

Text Content:
${text}

Requirements:
1. Questions should test understanding of key concepts from the text
2. For MCQ: Provide exactly 4 options with one correct answer
3. For True/False: Create statements that can be clearly true or false based on the text
4. Include explanations for each correct answer
5. Ensure questions are ${difficulty} difficulty level
6. Use only standard double quotes (") in the JSON response
7. Escape any quotes within text content using \"

IMPORTANT: Respond ONLY with valid JSON. No additional text, code blocks, or explanations outside the JSON.

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

Generate exactly ${numQuestions} questions following this format. Return ONLY the JSON object - no code blocks, no explanatory text.`;
  }

  private parseQuizResponse(content: string): QuizQuestion[] {
    try {
      console.log("Raw AI response length:", content.length);
      console.log("Raw AI response preview:", content.substring(0, 200));

      // Clean the content first
      let cleanedContent = this.cleanResponseContent(content);
      console.log("Cleaned content length:", cleanedContent.length);

      // Extract JSON from the cleaned content
      const jsonString = this.extractJsonFromContent(cleanedContent);
      console.log("Extracted JSON preview:", jsonString.substring(0, 200));

      // Validate JSON structure before parsing
      if (!this.isValidJsonStructure(jsonString)) {
        throw new Error("Invalid JSON structure detected");
      }

      // Parse the JSON
      let parsed;
      try {
        parsed = JSON.parse(jsonString);
      } catch (parseError) {
        console.log("Initial JSON parse failed, attempting repair...");
        const repairedJson = this.repairJsonString(jsonString);
        console.log("Repaired JSON preview:", repairedJson.substring(0, 200));
        parsed = JSON.parse(repairedJson);
      }

      // Validate the parsed structure
      if (!parsed || typeof parsed !== "object") {
        throw new Error("Parsed result is not an object");
      }

      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        console.error("Invalid quiz format - parsed object:", parsed);
        throw new Error("Invalid quiz format: missing questions array");
      }

      if (parsed.questions.length === 0) {
        throw new Error("No questions found in the response");
      }

      console.log("Successfully parsed questions:", parsed.questions.length);

      // Map and validate each question
      return parsed.questions.map((q: any, index: number) => {
        // Validate required fields
        if (!q.question || typeof q.question !== "string") {
          throw new Error(`Question ${index + 1} is missing or invalid`);
        }

        return {
          id: q.id || `q${index + 1}`,
          type:
            q.type && ["mcq", "true_false"].includes(q.type) ? q.type : "mcq",
          question: q.question.trim(),
          options:
            q.type === "mcq" && Array.isArray(q.options)
              ? q.options
              : undefined,
          correctAnswer: q.correctAnswer,
          explanation:
            typeof q.explanation === "string" ? q.explanation.trim() : "",
          difficulty:
            q.difficulty && ["easy", "medium", "hard"].includes(q.difficulty)
              ? q.difficulty
              : "medium",
        };
      });
    } catch (error) {
      console.error("Failed to parse quiz response:", error);
      console.error(
        "Content that failed to parse (first 500 chars):",
        content.substring(0, 500)
      );
      throw new Error(
        `Failed to parse quiz response from AI: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  private cleanResponseContent(content: string): string {
    // Remove common markdown code block markers
    let cleaned = content.replace(/```json\s*/gi, "").replace(/```\s*/g, "");

    // Remove invisible/control characters but keep newlines and tabs
    cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, "");

    // Replace smart quotes with straight quotes
    cleaned = cleaned
      .replace(/[""]/g, '"') // Smart double quotes
      .replace(/['']/g, "'") // Smart single quotes
      .replace(/[…]/g, "...") // Ellipsis
      .replace(/[–—]/g, "-"); // En/em dashes

    // Remove any leading/trailing whitespace
    cleaned = cleaned.trim();

    return cleaned;
  }

  private extractJsonFromContent(content: string): string {
    // Try to find JSON object boundaries
    const firstBrace = content.indexOf("{");
    const lastBrace = content.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      throw new Error("No valid JSON object found in response");
    }

    // Extract the JSON portion
    const jsonString = content.substring(firstBrace, lastBrace + 1);

    // Basic validation that we have a reasonable JSON structure
    if (jsonString.length < 10) {
      throw new Error("Extracted JSON is too short to be valid");
    }

    return jsonString;
  }

  private isValidJsonStructure(jsonString: string): boolean {
    // Check basic JSON structure requirements
    if (!jsonString.startsWith("{") || !jsonString.endsWith("}")) {
      return false;
    }

    // Count braces to ensure they're balanced
    let braceCount = 0;
    let inString = false;
    let escaped = false;

    for (let i = 0; i < jsonString.length; i++) {
      const char = jsonString[i];

      if (escaped) {
        escaped = false;
        continue;
      }

      if (char === "\\") {
        escaped = true;
        continue;
      }

      if (char === '"') {
        inString = !inString;
        continue;
      }

      if (!inString) {
        if (char === "{") {
          braceCount++;
        } else if (char === "}") {
          braceCount--;
        }
      }
    }

    return braceCount === 0 && !inString;
  }

  private repairJsonString(jsonString: string): string {
    let repaired = jsonString;

    try {
      // Remove trailing commas
      repaired = repaired.replace(/,(\s*[}\]])/g, "$1");

      // Fix unescaped quotes in string values
      repaired = this.fixUnescapedQuotes(repaired);

      // Try to parse the repaired version
      JSON.parse(repaired);
      return repaired;
    } catch (error) {
      console.log("Repair attempt failed, trying alternative fixes...");

      // Last resort: try to fix common quote issues line by line
      return this.repairJsonLineByLine(jsonString);
    }
  }

  private fixUnescapedQuotes(jsonString: string): string {
    // This regex finds string values and fixes unescaped quotes inside them
    return jsonString.replace(
      /("(?:question|explanation|correctAnswer)"\s*:\s*")([^"]*(?:\\.[^"]*)*?)("(?:\s*[,}]))/g,
      (match, prefix, content, suffix) => {
        // Fix unescaped quotes in the content
        let fixedContent = content
          // First, temporarily replace properly escaped quotes
          .replace(/\\"/g, "\u0001") // Temporary marker for escaped quotes
          // Then escape any remaining unescaped quotes
          .replace(/"/g, '\\"')
          // Finally, restore the properly escaped quotes
          .replace(/\u0001/g, '\\"');

        return prefix + fixedContent + suffix;
      }
    );
  }

  private repairJsonLineByLine(jsonString: string): string {
    const lines = jsonString.split("\n");
    const repairedLines = lines.map((line) => {
      // Skip lines that don't contain string values
      if (
        !line.includes('":') ||
        (!line.includes('"question"') &&
          !line.includes('"explanation"') &&
          !line.includes('"correctAnswer"'))
      ) {
        return line;
      }

      // Find the colon that separates field name from value
      const colonIndex = line.indexOf('":');
      if (colonIndex === -1) return line;

      const beforeValue = line.substring(0, colonIndex + 2).trim();
      let afterValue = line.substring(colonIndex + 2).trim();

      // Check if this is a string value (starts with quote)
      if (!afterValue.startsWith('"')) return line;

      // Find the end of the string value
      const hasTrailingComma =
        afterValue.endsWith('",') || afterValue.endsWith('"');
      if (!hasTrailingComma) return line;

      const isCommaEnding = afterValue.endsWith('",');
      const stringContent = afterValue.slice(1, isCommaEnding ? -2 : -1);

      // Fix unescaped quotes in the string content
      const fixedContent = stringContent.replace(/(?<!\\)"/g, '\\"');

      return (
        beforeValue + ' "' + fixedContent + '"' + (isCommaEnding ? "," : "")
      );
    });

    return repairedLines.join("\n");
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.client.chat.completions.create({
        messages: [
          {
            role: "user",
            content: 'Test connection - respond with "OK"',
          },
        ],
        model: this.model,
        max_tokens: 5,
      });

      return response.choices.length > 0;
    } catch (error) {
      console.error("Groq connection test failed:", error);
      return false;
    }
  }
}
