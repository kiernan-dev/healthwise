import { ProcessedInput } from './nlpService';
import { RemedyRecommendation, remedyService } from './remedyService';
import { openRouterService } from './openRouterService';

export interface ChatResponse {
  content: string;
  followUpQuestions?: string[];
  recommendations?: RemedyRecommendation[];
}

class ResponseService {
  private isAIOnlyMode(): boolean {
    return import.meta.env.VITE_AI_ONLY_MODE === 'true';
  }

  async generateResponse(processedInput: ProcessedInput, recentSymptoms?: string): Promise<ChatResponse> {
    // Check if OpenRouter is configured, if so use AI response
    if (openRouterService.isConfigured()) {
      return await this.generateAIResponse(processedInput, recentSymptoms);
    }

    // If AI-only mode is enabled and no API key, return error response
    if (this.isAIOnlyMode()) {
      return this.generateAIRequiredResponse();
    }

    // Fallback to mock response system
    return this.generateMockResponse(processedInput);
  }

  async generateStreamingResponse(
    processedInput: ProcessedInput, 
    onChunk: (chunk: string) => void,
    recentSymptoms?: string,
    file?: File
  ): Promise<ChatResponse> {
    // Check if OpenRouter is configured, if so use streaming AI response
    if (openRouterService.isConfigured()) {
      return await this.generateStreamingAIResponse(processedInput, onChunk, recentSymptoms, file);
    }

    // If AI-only mode is enabled and no API key, return error response with streaming effect
    if (this.isAIOnlyMode()) {
      const response = this.generateAIRequiredResponse();
      
      // Simulate streaming for the error message
      const words = response.content.split(' ');
      for (let i = 0; i < words.length; i++) {
        onChunk(words[i] + (i < words.length - 1 ? ' ' : ''));
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      return response;
    }

    // Fallback to non-streaming mock response
    const response = this.generateMockResponse(processedInput);
    
    // Simulate streaming for mock responses
    const words = response.content.split(' ');
    let currentText = '';
    
    for (let i = 0; i < words.length; i++) {
      currentText += (i > 0 ? ' ' : '') + words[i];
      onChunk(words[i] + (i < words.length - 1 ? ' ' : ''));
      
      // Small delay to simulate typing
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    return response;
  }

  private async generateStreamingAIResponse(
    processedInput: ProcessedInput, 
    onChunk: (chunk: string) => void,
    recentSymptoms?: string,
    file?: File
  ): Promise<ChatResponse> {
    try {
      const aiResponse = await openRouterService.generateStreamingResponse(
        processedInput,
        processedInput.originalText,
        onChunk,
        recentSymptoms,
        file
      );

      // AI handles everything in the streaming response
      return {
        content: aiResponse.content,
        // AI includes follow-ups and recommendations in the main content
        followUpQuestions: undefined,
        recommendations: undefined
      };

    } catch (error) {
      console.error('Streaming AI response generation failed, falling back to mock:', error);
      return this.generateMockResponse(processedInput);
    }
  }

  private async generateAIResponse(processedInput: ProcessedInput, recentSymptoms?: string): Promise<ChatResponse> {
    const { originalText } = processedInput;

    try {
      const aiResponse = await openRouterService.generateResponse(
        processedInput, 
        originalText,
        recentSymptoms
      );

      // AI handles everything - content, follow-ups, and recommendations are all in the response
      // We could parse out follow-up questions if they're formatted consistently, but for now
      // the AI includes them in the main content
      
      return {
        content: aiResponse.content,
        // Let AI handle follow-ups within the content itself
        followUpQuestions: undefined,
        // Let AI handle recommendations within the content itself  
        recommendations: undefined
      };

    } catch (error) {
      console.error('AI response generation failed, falling back to mock:', error);
      return this.generateMockResponse(processedInput);
    }
  }

  private generateMockResponse(processedInput: ProcessedInput): ChatResponse {
    const { intent, originalText } = processedInput;
    const { symptoms, bodyParts, severity, duration } = intent.entities;

    const recommendations = remedyService.getRecommendations(symptoms, [], severity);

    let content = '';
    let followUpQuestions: string[] = [];

    switch (intent.type) {
      case 'symptom':
        content = this.generateSymptomResponse(symptoms, bodyParts, severity, duration, recommendations);
        followUpQuestions = this.generateSymptomFollowUps(symptoms, severity);
        break;
      case 'condition':
        content = this.generateConditionResponse(originalText, recommendations);
        followUpQuestions = this.generateConditionFollowUps();
        break;
      case 'general_wellness':
        content = this.generateWellnessResponse(recommendations);
        followUpQuestions = this.generateWellnessFollowUps();
        break;
      case 'prevention':
        content = this.generatePreventionResponse(recommendations);
        break;
      default:
        content = this.generateUnknownResponse();
        followUpQuestions = this.generateGeneralFollowUps();
    }

    return {
      content,
      followUpQuestions: followUpQuestions.length > 0 ? followUpQuestions : undefined,
      recommendations: recommendations.length > 0 ? recommendations : undefined
    };
  }

  private generateAIRequiredResponse(): ChatResponse {
    return {
      content: `I'm sorry, but HealthWise is currently configured to operate in AI-only mode, which requires a live AI connection to provide personalized health guidance.

**To enable AI responses:**

1. **Get an OpenRouter API Key**
   - Visit https://openrouter.ai/keys
   - Sign up and create a new API key

2. **Configure Your Environment**
   - Add \`VITE_OPENROUTER_API_KEY=your-api-key\` to your .env file
   - Restart the application

**Why AI-Only Mode?**
This mode ensures you receive the most current, personalized, and comprehensive natural health guidance possible. Mock responses have been disabled to maintain the highest quality of health information.

For immediate assistance with serious health concerns, please consult with a qualified healthcare professional.`,
      followUpQuestions: undefined,
      recommendations: undefined
    };
  }

  private generateSymptomResponse(
    symptoms: string[], 
    bodyParts: string[], 
    severity: string | null, 
    duration: string | null,
    recommendations: RemedyRecommendation[]
  ): string {
    let response = "I understand you're experiencing ";
    
    if (symptoms.length > 0) {
      response += `${symptoms.join(', ')}`;
      if (bodyParts.length > 0) {
        response += ` in your ${bodyParts.join(', ')}`;
      }
    } else if (bodyParts.length > 0) {
      response += `discomfort in your ${bodyParts.join(', ')}`;
    } else {
      response += "some health concerns";
    }

    if (severity) {
      response += `. The ${severity} nature of your symptoms`;
    }

    if (duration) {
      response += ` lasting ${duration}`;
    }

    response += " suggests several natural approaches that may help provide relief.\n\n";

    response += "**Important Medical Disclaimer:** While natural remedies can be beneficial, persistent or severe symptoms should be evaluated by a healthcare professional. The following suggestions are for informational purposes and should not replace professional medical advice.\n\n";

    if (recommendations.length > 0) {
      response += "**Recommended Natural Remedies:**\n\n";
      
      recommendations.forEach((rec, index) => {
        const { remedy } = rec;
        response += `**${index + 1}. ${remedy.name}**\n`;
        response += `${remedy.description}\n\n`;
        response += `*Benefits:* ${remedy.benefits.join(', ')}\n`;
        response += `*Usage:* ${remedy.usage}\n`;
        
        if (remedy.precautions.length > 0) {
          response += `*Precautions:* ${remedy.precautions.join(', ')}\n`;
        }
        
        if (remedy.interactions.length > 0) {
          response += `*Interactions:* Consult your healthcare provider if taking ${remedy.interactions.join(', ')}\n`;
        }
        
        response += `*Evidence Level:* ${remedy.evidenceLevel.charAt(0).toUpperCase() + remedy.evidenceLevel.slice(1)}\n\n`;
      });
    }

    response += "**General Recommendations:**\n";
    response += "• Stay well-hydrated with water\n";
    response += "• Ensure adequate rest and sleep\n";
    response += "• Consider gentle movement or stretching if appropriate\n";
    response += "• Monitor your symptoms and seek medical attention if they worsen\n\n";

    return response;
  }

  private generateConditionResponse(originalText: string, recommendations: RemedyRecommendation[]): string {
    return "Thank you for sharing information about your health condition. Managing chronic conditions often benefits from a comprehensive approach that includes both conventional medical care and complementary natural therapies.\n\n**Important:** Please ensure you're working with a qualified healthcare provider for proper diagnosis and treatment of any medical condition. Natural remedies should complement, not replace, professional medical care.";
  }

  private generateWellnessResponse(recommendations: RemedyRecommendation[]): string {
    return "It's wonderful that you're taking a proactive approach to your health and wellness! Maintaining optimal health involves a holistic approach that addresses physical, mental, and emotional well-being.";
  }

  private generatePreventionResponse(recommendations: RemedyRecommendation[]): string {
    return "Prevention is indeed the best medicine! A proactive approach to health can help you maintain vitality and reduce the risk of various health issues.";
  }

  private generateUnknownResponse(): string {
    return "I'd be happy to help you with health and wellness information! Could you please provide more specific details about:\n\n• Any symptoms you're experiencing\n• The area of your body affected\n• How long you've been experiencing this\n• The severity of your concern\n\nThis will help me provide more targeted natural remedy suggestions for your situation.";
  }

  private generateSymptomFollowUps(symptoms: string[], severity: string | null): string[] {
    const questions = [];
    
    if (!severity) {
      questions.push("How would you rate the severity of your symptoms on a scale of 1-10?");
    }
    
    if (symptoms.length > 0) {
      questions.push("How long have you been experiencing these symptoms?");
      questions.push("Have you noticed any triggers that make the symptoms worse or better?");
    }
    
    questions.push("Are you currently taking any medications or supplements?");
    
    return questions.slice(0, 2);
  }

  private generateConditionFollowUps(): string[] {
    return [
      "Are you currently working with a healthcare provider for this condition?",
      "What specific aspects of your condition would you like natural support for?"
    ];
  }

  private generateWellnessFollowUps(): string[] {
    return [
      "What specific area of wellness would you like to focus on?",
      "Are there any particular health goals you're working toward?"
    ];
  }

  private generateGeneralFollowUps(): string[] {
    return [
      "What specific health concern would you like guidance on?",
      "Are you looking for preventive measures or addressing current symptoms?"
    ];
  }
}

export const responseService = new ResponseService();