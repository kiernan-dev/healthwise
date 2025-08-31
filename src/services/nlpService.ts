export interface HealthIntent {
  type: 'symptom' | 'condition' | 'general_wellness' | 'prevention' | 'unknown';
  confidence: number;
  entities: {
    symptoms: string[];
    bodyParts: string[];
    severity: 'mild' | 'moderate' | 'severe' | null;
    duration: string | null;
    triggers: string[];
    timeOfDay: string | null;
  };
}

export interface ProcessedInput {
  originalText: string;
  intent: HealthIntent;
  keywords: string[];
  medicalTerms: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
}

class NLPService {
  private symptomKeywords = [
    'pain', 'ache', 'hurt', 'sore', 'burning', 'itching', 'swelling', 'inflammation',
    'fever', 'headache', 'nausea', 'vomiting', 'diarrhea', 'constipation', 'fatigue',
    'tired', 'exhausted', 'dizzy', 'lightheaded', 'cough', 'congestion', 'runny nose',
    'sneezing', 'rash', 'irritation', 'bloating', 'cramps', 'stiff', 'tight',
    'weakness', 'numbness', 'tingling', 'throbbing', 'sharp', 'dull', 'chronic',
    'spasms', 'tension', 'pressure', 'heaviness', 'restless', 'jittery', 'shaky'
  ];

  private bodyParts = [
    'head', 'neck', 'shoulder', 'arm', 'elbow', 'wrist', 'hand', 'finger',
    'chest', 'back', 'stomach', 'abdomen', 'hip', 'leg', 'knee', 'ankle', 'foot',
    'throat', 'nose', 'eye', 'ear', 'skin', 'joint', 'muscle', 'bone',
    'spine', 'lower back', 'upper back', 'jaw', 'temple', 'forehead', 'scalp'
  ];

  private conditionKeywords = [
    'arthritis', 'diabetes', 'hypertension', 'anxiety', 'depression', 'insomnia',
    'migraine', 'asthma', 'allergies', 'cold', 'flu', 'infection', 'inflammation',
    'fibromyalgia', 'ibs', 'gerd', 'osteoporosis', 'chronic fatigue', 'lupus'
  ];

  private severityIndicators = {
    mild: ['slight', 'minor', 'little', 'mild', 'light', 'barely', 'somewhat', 'a bit'],
    moderate: ['moderate', 'medium', 'noticeable', 'bothering', 'uncomfortable', 'concerning'],
    severe: ['severe', 'intense', 'extreme', 'unbearable', 'terrible', 'awful', 'excruciating', 'debilitating', 'overwhelming']
  };

  private triggerKeywords = [
    'stress', 'weather', 'food', 'exercise', 'sitting', 'standing', 'walking',
    'sleeping', 'work', 'computer', 'phone', 'driving', 'lifting', 'bending'
  ];

  private timeIndicators = [
    'morning', 'afternoon', 'evening', 'night', 'bedtime', 'waking up',
    'after eating', 'before eating', 'during work', 'weekends'
  ];

  processInput(text: string): ProcessedInput {
    const lowerText = text.toLowerCase();
    const words = lowerText.split(/\s+/);
    
    // Extract entities
    const symptoms = this.extractSymptoms(lowerText);
    const bodyParts = this.extractBodyParts(lowerText);
    const severity = this.extractSeverity(lowerText);
    const duration = this.extractDuration(lowerText);
    const triggers = this.extractTriggers(lowerText);
    const timeOfDay = this.extractTimeOfDay(lowerText);
    
    // Determine intent
    const intent = this.determineIntent(lowerText, symptoms, bodyParts);
    
    // Extract keywords and medical terms
    const keywords = this.extractKeywords(words);
    const medicalTerms = this.extractMedicalTerms(lowerText);
    const sentiment = this.analyzeSentiment(lowerText);

    return {
      originalText: text,
      intent: {
        ...intent,
        entities: {
          symptoms,
          bodyParts,
          severity,
          duration,
          triggers,
          timeOfDay
        }
      },
      keywords,
      medicalTerms,
      sentiment
    };
  }

  private extractSymptoms(text: string): string[] {
    const foundSymptoms = this.symptomKeywords.filter(symptom => 
      text.includes(symptom)
    );
    
    // Look for compound symptoms
    const compoundPatterns = [
      /muscle\s+(pain|ache|tension|stiffness)/g,
      /joint\s+(pain|ache|stiffness)/g,
      /stomach\s+(pain|ache|upset)/g,
      /chest\s+(pain|tightness|pressure)/g
    ];
    
    compoundPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        foundSymptoms.push(...matches);
      }
    });
    
    return [...new Set(foundSymptoms)]; // Remove duplicates
  }

  private extractBodyParts(text: string): string[] {
    return this.bodyParts.filter(part => 
      text.includes(part)
    );
  }

  private extractSeverity(text: string): 'mild' | 'moderate' | 'severe' | null {
    // Check for numeric pain scales
    const painScaleMatch = text.match(/(\d+)\s*(?:out of|\/)\s*10/);
    if (painScaleMatch) {
      const score = parseInt(painScaleMatch[1]);
      if (score <= 3) return 'mild';
      if (score <= 6) return 'moderate';
      return 'severe';
    }

    // Check for severity keywords
    for (const [level, indicators] of Object.entries(this.severityIndicators)) {
      if (indicators.some(indicator => text.includes(indicator))) {
        return level as 'mild' | 'moderate' | 'severe';
      }
    }
    return null;
  }

  private extractDuration(text: string): string | null {
    const durationPatterns = [
      /(\d+)\s*(minute|minutes|hour|hours|day|days|week|weeks|month|months|year|years)/g,
      /(yesterday|today|this morning|last night|for a while|recently|chronic|ongoing|persistent)/g,
      /(since\s+\w+)/g
    ];
    
    for (const pattern of durationPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0];
      }
    }
    return null;
  }

  private extractTriggers(text: string): string[] {
    return this.triggerKeywords.filter(trigger => 
      text.includes(trigger)
    );
  }

  private extractTimeOfDay(text: string): string | null {
    const timeMatch = this.timeIndicators.find(time => text.includes(time));
    return timeMatch || null;
  }

  private determineIntent(text: string, symptoms: string[], bodyParts: string[]): Omit<HealthIntent, 'entities'> {
    let confidence = 0;
    let type: HealthIntent['type'] = 'unknown';

    // Check for specific conditions
    const hasCondition = this.conditionKeywords.some(condition => text.includes(condition));
    if (hasCondition) {
      type = 'condition';
      confidence = 0.85;
    }
    
    // Check for symptoms
    else if (symptoms.length > 0) {
      type = 'symptom';
      confidence = Math.min(0.95, 0.6 + (symptoms.length * 0.1));
      
      // Boost confidence if body parts are mentioned
      if (bodyParts.length > 0) {
        confidence = Math.min(0.95, confidence + 0.1);
      }
    }
    
    // Check for prevention/wellness keywords
    else if (text.includes('prevent') || text.includes('wellness') || text.includes('healthy') || text.includes('maintain')) {
      type = 'prevention';
      confidence = 0.75;
    }
    
    // General wellness
    else if (text.includes('feel better') || text.includes('improve') || text.includes('boost') || text.includes('energy')) {
      type = 'general_wellness';
      confidence = 0.65;
    }

    return { type, confidence };
  }

  private extractKeywords(words: string[]): string[] {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'i', 'my', 'me', 'have', 'has', 'am', 'is', 'are', 'was', 'were', 'been', 'being',
      'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
      'can', 'this', 'that', 'these', 'those', 'it', 'its', 'he', 'she', 'they', 'them'
    ]);
    
    return words.filter(word => 
      word.length > 2 && 
      !stopWords.has(word) &&
      /^[a-zA-Z]+$/.test(word)
    );
  }

  private extractMedicalTerms(text: string): string[] {
    const allMedicalTerms = [
      ...this.symptomKeywords,
      ...this.bodyParts,
      ...this.conditionKeywords
    ];
    
    return allMedicalTerms.filter(term => text.includes(term));
  }

  private analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = ['better', 'good', 'great', 'excellent', 'improved', 'relief', 'helped', 'working'];
    const negativeWords = ['worse', 'bad', 'terrible', 'awful', 'painful', 'suffering', 'unbearable', 'frustrated'];
    
    const positiveCount = positiveWords.filter(word => text.includes(word)).length;
    const negativeCount = negativeWords.filter(word => text.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }
}

export const nlpService = new NLPService();