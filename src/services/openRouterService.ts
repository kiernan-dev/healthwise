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
  private config: OpenRouterConfig;

  constructor() {
    this.config = {
      apiKey: import.meta.env.VITE_OPENROUTER_API_KEY || '',
      baseURL: 'https://openrouter.ai/api/v1',
      defaultModel: 'openai/gpt-4o-mini' // Cost-effective option for health queries
    };

    if (this.config.apiKey) {
      this.initializeClient();
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

  private buildUserPrompt(processedInput: ProcessedInput, userMessage: string, recentSymptoms?: string): string {
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

    } catch (error: any) {
      console.error('OpenRouter API error:', error);
      
      return {
        content: "I apologize, but I'm having trouble connecting to my knowledge base right now. Please try again in a moment, or check with a healthcare professional for urgent concerns.",
        error: error.message || 'API request failed'
      };
    }
  }

  async generateStreamingResponse(
    processedInput: ProcessedInput,
    userMessage: string,
    onChunk: (chunk: string) => void,
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
      const userPrompt = this.buildUserPrompt(processedInput, userMessage, recentSymptoms);

      const stream = await this.client.chat.completions.create({
        model: this.config.defaultModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,
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

    } catch (error: any) {
      console.error('OpenRouter streaming error:', error);
      
      return {
        content: "I apologize, but I'm having trouble connecting to my knowledge base right now. Please try again in a moment, or check with a healthcare professional for urgent concerns.",
        error: error.message || 'Streaming request failed'
      };
    }
  }

  isConfigured(): boolean {
    return !!this.config.apiKey && !!this.client;
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