import OpenAI from 'openai';
import { ProcessedInput } from './nlpService';

interface OpenRouterConfig {
  apiKey: string;
  baseURL: string;
  defaultModel: string;
}

interface AIResponse {
  content: string;
  error?: string;
}

class OpenRouterService {
  private client: OpenAI | null = null;
  private isValidated: boolean = false;
  private validationPromise: Promise<boolean> | null = null;
  private config: {
    apiKey: string;
    baseURL: string;
    defaultModel: string;
    visionModel: string;
  };

  constructor() {
    this.config = {
      apiKey: import.meta.env.VITE_OPENROUTER_API_KEY || '',
      baseURL: 'https://openrouter.ai/api/v1',
      defaultModel: 'openai/gpt-oss-120b', // #1 model for health related content
      visionModel: 'openai/gpt-4o' // Top-tier model for image analysis
    };

    if (this.config.apiKey) {
      this.initializeClient();
      // Validate API key in background
      this.validateApiKey();
    }
  }

  private initializeClient() {
    this.client = new OpenAI({
      baseURL: this.config.baseURL,
      apiKey: this.config.apiKey,
      dangerouslyAllowBrowser: true // Required for client-side usage
    });
  }

  private buildSystemPrompt(): string {
    return `You are HealthWise, a knowledgeable and empathetic natural health assistant. Your role is to provide evidence-based natural remedy suggestions and wellness guidance.

IMPORTANT SAFETY GUIDELINES:
- Always include medical disclaimers for serious symptoms
- Recommend consulting healthcare providers for persistent/severe symptoms  
- Never diagnose medical conditions
- Focus on natural remedies, lifestyle changes, and wellness practices
- Provide evidence levels for recommendations (limited, moderate, strong)

RESPONSE FORMAT:
- Be conversational and supportive
- Include specific natural remedies with usage instructions
- Mention precautions and potential interactions
- End your response with 2-3 relevant follow-up questions to help the user
- Keep responses focused and practical
- Format follow-up questions as a numbered list at the end

AREAS OF EXPERTISE:
- Natural remedies and herbal medicine
- Nutritional approaches to wellness
- Lifestyle modifications for health
- Preventive health measures
- Stress management and mental wellness
- Sleep optimization
- Exercise and movement therapy

RESPONSE STRUCTURE:
1. Acknowledge the user's concern empathetically
2. Provide natural remedy suggestions with specific usage instructions
3. Include safety disclaimers and precautions
4. End with 2-3 follow-up questions like:
   - Questions about symptom details (severity, duration, triggers)
   - Questions about current medications or treatments
   - Questions about lifestyle factors that might help

Always prioritize user safety while providing helpful natural health guidance.`;
  }

  private buildUserPrompt(processedInput: ProcessedInput, userMessage: string, recentSymptoms?: string, file?: File): string {
    if (file) {
      let prompt = `The user has uploaded a file named "${file.name}" (${file.type}).\n\n`;
      if (userMessage) {
        prompt += `The user provided the following message for context: "${userMessage}"\n\n`;
      }
      prompt += `Please analyze the contents of the file and provide natural health recommendations based on what you find. If the file is an image of a health concern (like a rash or swelling), identify what you see and suggest relevant natural remedies. If it's a document or audio file, analyze its content. Adhere strictly to all safety guidelines and response formatting rules from the system prompt.`;
      return prompt;
    }

    const { intent, originalText } = processedInput;
    const { symptoms, bodyParts, severity, duration } = intent.entities;

    let prompt = `User message: "${originalText}"\n\n`;
    
    if (symptoms.length > 0 || bodyParts.length > 0) {
      prompt += `Extracted information:\n`;
      if (symptoms.length > 0) prompt += `- Symptoms: ${symptoms.join(', ')}\n`;
      if (bodyParts.length > 0) prompt += `- Body parts: ${bodyParts.join(', ')}\n`;
      if (severity) prompt += `- Severity: ${severity}\n`;
      if (duration) prompt += `- Duration: ${duration}\n`;
      prompt += `\n`;
    }

    if (recentSymptoms) {
      prompt += `Recent symptom history:\n${recentSymptoms}\n\n`;
    }

    prompt += `Please provide natural health recommendations based on this information. Include specific remedies, usage instructions, and safety considerations.`;

    return prompt;
  }

  async generateResponse(
    processedInput: ProcessedInput, 
    userMessage: string,
    recentSymptoms?: string
  ): Promise<AIResponse> {
    if (!this.client || !this.config.apiKey) {
      return {
        content: "I need an API key to provide personalized recommendations. Please set up OpenRouter integration to continue.",
        error: "API key not configured"
      };
    }

    try {
      const systemPrompt = this.buildSystemPrompt();
      // Note: This non-streaming function doesn't support file uploads yet.
      // The main app flow uses generateStreamingResponse.
      const userPrompt = this.buildUserPrompt(processedInput, userMessage, recentSymptoms);

      const completion = await this.client.chat.completions.create({
        model: this.config.defaultModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,
        top_p: 0.9
      });

      const content = completion.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No response content received');
      }

      return { content: content.trim() };

    } catch (error: unknown) {
      console.error('OpenRouter API error:', error);
      
      return {
        content: "I apologize, but I'm having trouble connecting to my knowledge base right now. Please try again in a moment, or check with a healthcare professional for urgent concerns.",
        error: error instanceof Error ? error.message : 'API request failed'
      };
    }
  }

  private async readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  async generateStreamingResponse(
    processedInput: ProcessedInput,
    userMessage: string,
    onChunk: (chunk: string) => void,
    recentSymptoms?: string,
    file?: File
  ): Promise<AIResponse> {
    if (!this.client || !this.config.apiKey) {
      return {
        content: "I need an API key to provide personalized recommendations. Please set up OpenRouter integration to continue.",
        error: "API key not configured"
      };
    }

    try {
      const systemPrompt = this.buildSystemPrompt();
      const userPrompt = this.buildUserPrompt(processedInput, userMessage, recentSymptoms, file);

      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt },
      ];

      if (file) {
        const dataUrl = await this.readFileAsDataURL(file);
        
        const userContent: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
          { type: 'text', text: userPrompt }
        ];

        if (file.type.startsWith('image/')) {
          userContent.push({ type: 'image_url', image_url: { url: dataUrl } });
        } else {
          // For non-image files like audio or PDF, we can pass it as a text-based data URL
          // The model needs to be capable of handling this format.
          // This is a simplification; a more robust solution might involve different content types
          // if the model supports them (e.g., 'audio_url'). For now, this is a common approach.
          userContent.push({ type: 'text', text: `Attached file content for ${file.name}:\n\n[...file content represented by data URL...]` });
        }

        messages.push({
          role: 'user',
          content: userContent,
        });
      } else {
        messages.push({ role: 'user', content: userPrompt });
      }

      const modelToUse = file ? this.config.visionModel : this.config.defaultModel;

      const stream = await this.client.chat.completions.create({
        model: modelToUse,
        messages: messages,
        temperature: 0.7,
        max_tokens: 2048, // Increased for potentially larger file content
        top_p: 0.9,
        stream: true
      });

      let fullContent = '';

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          fullContent += content;
          onChunk(content);
        }
      }

      return { content: fullContent };

    } catch (error: unknown) {
      console.error('OpenRouter streaming error:', error);
      
      return {
        content: "I apologize, but I'm having trouble connecting to my knowledge base right now. Please try again in a moment, or check with a healthcare professional for urgent concerns.",
        error: error instanceof Error ? error.message : 'Streaming request failed'
      };
    }
  }

  isConfigured(): boolean {
    return !!this.config.apiKey && !!this.client && this.isValidated;
  }
  
  async validateApiKey(): Promise<boolean> {
    if (!this.config.apiKey || !this.client) {
      this.isValidated = false;
      return false;
    }
    
    if (this.validationPromise) {
      return this.validationPromise;
    }
    
    this.validationPromise = this.performValidation();
    return this.validationPromise;
  }
  
  private async performValidation(): Promise<boolean> {
    try {
      // Make a minimal test request to validate the API key
      const response = await this.client!.chat.completions.create({
        model: this.config.defaultModel,
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 1,
        stream: false
      });
      
      this.isValidated = true;
      return true;
    } catch (error: any) {
      console.error('API key validation failed:', error);
      this.isValidated = false;
      return false;
    } finally {
      this.validationPromise = null;
    }
  }

  getModelName(): string {
    const modelId = this.config.defaultModel;
    // Extracts the user-friendly name from "vendor/model-name"
    const modelParts = modelId.split('/');
    return modelParts.length > 1 ? modelParts[1] : modelParts[0];
  }

  updateApiKey(apiKey: string) {
    this.config.apiKey = apiKey;
    if (apiKey) {
      this.initializeClient();
    } else {
      this.client = null;
    }
  }
}

export const openRouterService = new OpenRouterService();