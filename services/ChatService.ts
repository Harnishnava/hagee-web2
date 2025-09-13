import Groq from 'groq-sdk';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  attachments?: ChatAttachment[];
}

export interface ChatAttachment {
  id: string;
  name: string;
  type: 'document' | 'image';
  size: number;
  content?: string; // Extracted text or analysis
  url?: string; // For images
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  documents: ChatAttachment[]; // Session-specific documents
  createdAt: Date;
  updatedAt: Date;
  model: string;
  // Future database fields (prepared but not used yet)
  userId?: string;
  isArchived?: boolean;
  tags?: string[];
}

export interface ChatConfig {
  selectedModel: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  enableDocumentContext: boolean;
  contextLimit: number; // Percentage of model limit to use (e.g., 80%)
}

export interface ChatContextLimits {
  'llama-3.1-70b-versatile': 131072;
  'llama-3.1-8b-instant': 131072;
  'llama-3.2-11b-text-preview': 8192;
  'llama-3.2-3b-preview': 8192;
  'llama-3.2-1b-preview': 8192;
  'mixtral-8x7b-32768': 32768;
  'gemma-7b-it': 8192;
  'gemma2-9b-it': 8192;
}

export class ChatService {
  private groq: Groq;
  private contextLimits: ChatContextLimits = {
    'llama-3.1-70b-versatile': 131072,
    'llama-3.1-8b-instant': 131072,
    'llama-3.2-11b-text-preview': 8192,
    'llama-3.2-3b-preview': 8192,
    'llama-3.2-1b-preview': 8192,
    'mixtral-8x7b-32768': 32768,
    'gemma-7b-it': 8192,
    'gemma2-9b-it': 8192,
  };

  constructor() {
    this.groq = new Groq({
      apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
      dangerouslyAllowBrowser: true
    });
  }

  // Session Management (localStorage for now, database-ready structure)
  createSession(title: string, model: string): ChatSession {
    const session: ChatSession = {
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: title || 'New Chat',
      messages: [],
      documents: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      model,
    };

    this.saveSession(session);
    return session;
  }

  getSessions(): ChatSession[] {
    try {
      const sessions = localStorage.getItem('chatSessions');
      return sessions ? JSON.parse(sessions) : [];
    } catch (error) {
      console.error('Error loading chat sessions:', error);
      return [];
    }
  }

  getSession(sessionId: string): ChatSession | null {
    const sessions = this.getSessions();
    return sessions.find(s => s.id === sessionId) || null;
  }

  saveSession(session: ChatSession): void {
    const sessions = this.getSessions();
    const existingIndex = sessions.findIndex(s => s.id === session.id);
    
    session.updatedAt = new Date();
    
    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.push(session);
    }

    localStorage.setItem('chatSessions', JSON.stringify(sessions));
  }

  deleteSession(sessionId: string): void {
    const sessions = this.getSessions();
    const filteredSessions = sessions.filter(s => s.id !== sessionId);
    localStorage.setItem('chatSessions', JSON.stringify(filteredSessions));
  }

  // Message Management
  addMessage(sessionId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage {
    const session = this.getSession(sessionId);
    if (!session) throw new Error('Session not found');

    const newMessage: ChatMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    session.messages.push(newMessage);
    this.saveSession(session);
    
    return newMessage;
  }

  // Document Management
  addDocumentToSession(sessionId: string, document: ChatAttachment): void {
    const session = this.getSession(sessionId);
    if (!session) throw new Error('Session not found');

    session.documents.push(document);
    this.saveSession(session);
  }

  removeDocumentFromSession(sessionId: string, documentId: string): void {
    const session = this.getSession(sessionId);
    if (!session) throw new Error('Session not found');

    session.documents = session.documents.filter(d => d.id !== documentId);
    this.saveSession(session);
  }

  // Context Management
  private estimateTokenCount(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  private getContextLimit(model: string, limitPercentage: number = 80): number {
    const maxTokens = this.contextLimits[model as keyof ChatContextLimits] || 8192;
    return Math.floor(maxTokens * (limitPercentage / 100));
  }

  private buildContextFromSession(session: ChatSession, config: ChatConfig): string {
    let context = config.systemPrompt + '\n\n';
    
    // Add enhanced document context if enabled
    if (config.enableDocumentContext && session.documents.length > 0) {
      context += 'STUDENT STUDY MATERIALS:\n';
      context += 'You have access to the following documents that the student has uploaded for learning support:\n\n';
      
      session.documents.forEach((doc, index) => {
        if (doc.content) {
          // Provide more structured document context
          context += `Document ${index + 1}: "${doc.name}"\n`;
          context += `Type: ${doc.type}\n`;
          context += `Content Summary: ${doc.content.substring(0, 2000)}${doc.content.length > 2000 ? '...' : ''}\n`;
          context += `---\n\n`;
        }
      });
      
      context += 'INSTRUCTIONS FOR USING STUDY MATERIALS:\n';
      context += '- Reference specific information from these documents when answering questions\n';
      context += '- Help the student make connections between different concepts in the materials\n';
      context += '- Identify key topics and themes across the documents\n';
      context += '- Suggest study strategies based on the content type and complexity\n';
      context += '- Point out important definitions, formulas, or concepts for exam preparation\n\n';
    }

    // Add recent messages (within context limit)
    const contextLimit = this.getContextLimit(config.selectedModel, config.contextLimit);
    let currentTokens = this.estimateTokenCount(context);
    
    // Add messages in reverse order (most recent first) until we hit the limit
    const recentMessages = [...session.messages].reverse();
    const includedMessages: ChatMessage[] = [];
    
    for (const message of recentMessages) {
      const messageTokens = this.estimateTokenCount(message.content);
      if (currentTokens + messageTokens > contextLimit) {
        break;
      }
      includedMessages.unshift(message);
      currentTokens += messageTokens;
    }

    // Build conversation context
    if (includedMessages.length > 0) {
      context += 'CONVERSATION HISTORY:\n';
      includedMessages.forEach(msg => {
        context += `${msg.role === 'user' ? 'Student' : 'Tutor'}: ${msg.content}\n`;
      });
      context += '\n';
    }

    return context;
  }

  // Chat Completion
  async sendMessage(
    sessionId: string,
    userMessage: string,
    config: ChatConfig,
    onProgress?: (chunk: string) => void
  ): Promise<string> {
    const session = this.getSession(sessionId);
    if (!session) throw new Error('Session not found');

    // Check context limits and cooldown
    const contextLimit = this.getContextLimit(config.selectedModel, config.contextLimit);
    const currentContext = this.buildContextFromSession(session, config);
    const estimatedTokens = this.estimateTokenCount(currentContext + userMessage);

    if (estimatedTokens > contextLimit) {
      throw new Error(
        `Context limit exceeded. Please start a new chat session or reduce document content. Current: ${estimatedTokens}, Limit: ${contextLimit} tokens.`
      );
    }

    // Add user message to session
    this.addMessage(sessionId, {
      role: 'user',
      content: userMessage,
    });

    try {
      // Prepare messages for Groq API
      const messages = [
        {
          role: 'system' as const,
          content: config.systemPrompt + (config.enableDocumentContext && session.documents.length > 0 
            ? '\n\nYou have access to the following documents in this conversation:\n' + 
              session.documents.map(doc => `${doc.name}: ${doc.content?.substring(0, 500)}...`).join('\n')
            : '')
        },
        ...session.messages.slice(-10).map(msg => ({ // Last 10 messages to stay within limits
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }))
      ];

      const completion = await this.groq.chat.completions.create({
        messages,
        model: config.selectedModel,
        temperature: config.temperature,
        max_tokens: Math.min(config.maxTokens, 4096), // Reasonable limit
        stream: true,
      });

      let assistantResponse = '';
      
      for await (const chunk of completion) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          assistantResponse += content;
          onProgress?.(content);
        }
      }

      // Add assistant response to session
      this.addMessage(sessionId, {
        role: 'assistant',
        content: assistantResponse,
      });

      return assistantResponse;
    } catch (error) {
      console.error('Chat completion error:', error);
      throw new Error('Failed to get response from AI model. Please try again.');
    }
  }

  // Model validation
  isValidModel(model: string): boolean {
    return Object.keys(this.contextLimits).includes(model);
  }

  getAvailableModels(): Array<{id: string, name: string, contextLimit: number}> {
    return Object.entries(this.contextLimits).map(([id, limit]) => ({
      id,
      name: id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      contextLimit: limit
    }));
  }

  // Future database methods (prepared but not implemented)
  /*
  async syncSessionsToDatabase(userId: string): Promise<void> {
    // TODO: Implement when database is connected
  }

  async loadSessionsFromDatabase(userId: string): Promise<ChatSession[]> {
    // TODO: Implement when database is connected
    return [];
  }

  async saveSessionToDatabase(session: ChatSession): Promise<void> {
    // TODO: Implement when database is connected
  }
  */
}

export const chatService = new ChatService();
