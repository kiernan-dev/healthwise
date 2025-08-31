export interface Remedy {
  id: string;
  name: string;
  type: 'herb' | 'supplement' | 'lifestyle' | 'dietary' | 'therapy';
  description: string;
  benefits: string[];
  usage: string;
  precautions: string[];
  interactions: string[];
  evidenceLevel: 'high' | 'moderate' | 'limited' | 'traditional';
  targetSymptoms: string[];
  targetConditions: string[];
}

export interface RemedyRecommendation {
  remedy: Remedy;
  relevanceScore: number;
  reasoning: string;
}

class RemedyService {
  private remedies: Remedy[] = [
    {
      id: 'turmeric',
      name: 'Turmeric (Curcumin)',
      type: 'herb',
      description: 'A powerful anti-inflammatory spice containing curcumin, known for its therapeutic properties.',
      benefits: ['Reduces inflammation', 'Pain relief', 'Antioxidant properties', 'Supports joint health'],
      usage: '500-1000mg daily with meals, or 1 tsp turmeric powder in warm milk',
      precautions: ['May increase bleeding risk', 'Can worsen acid reflux', 'Avoid before surgery'],
      interactions: ['Blood thinners', 'Diabetes medications', 'Iron supplements'],
      evidenceLevel: 'high',
      targetSymptoms: ['pain', 'inflammation', 'swelling', 'ache'],
      targetConditions: ['arthritis', 'inflammation']
    },
    {
      id: 'ginger',
      name: 'Ginger Root',
      type: 'herb',
      description: 'A warming herb with anti-inflammatory and digestive properties.',
      benefits: ['Reduces nausea', 'Anti-inflammatory', 'Digestive aid', 'Pain relief'],
      usage: '1-3g daily as tea, capsules, or fresh root',
      precautions: ['May increase bleeding risk', 'Can cause heartburn in some people'],
      interactions: ['Blood thinners', 'Diabetes medications'],
      evidenceLevel: 'high',
      targetSymptoms: ['nausea', 'vomiting', 'pain', 'inflammation', 'bloating'],
      targetConditions: ['nausea', 'inflammation']
    },
    {
      id: 'chamomile',
      name: 'Chamomile',
      type: 'herb',
      description: 'A gentle herb known for its calming and anti-inflammatory properties.',
      benefits: ['Promotes relaxation', 'Reduces anxiety', 'Anti-inflammatory', 'Digestive support'],
      usage: '1-2 cups of chamomile tea daily, or 400-1600mg extract',
      precautions: ['May cause allergic reactions in people sensitive to ragweed', 'Avoid if pregnant'],
      interactions: ['Blood thinners', 'Sedative medications'],
      evidenceLevel: 'moderate',
      targetSymptoms: ['anxiety', 'insomnia', 'inflammation', 'irritation'],
      targetConditions: ['anxiety', 'insomnia', 'inflammation']
    },
    {
      id: 'omega3',
      name: 'Omega-3 Fatty Acids',
      type: 'supplement',
      description: 'Essential fatty acids with powerful anti-inflammatory properties.',
      benefits: ['Reduces inflammation', 'Supports heart health', 'Brain function', 'Joint health'],
      usage: '1-3g daily with meals, preferably from fish oil or algae',
      precautions: ['May increase bleeding risk', 'Can cause fishy aftertaste'],
      interactions: ['Blood thinners', 'Blood pressure medications'],
      evidenceLevel: 'high',
      targetSymptoms: ['inflammation', 'pain', 'stiff'],
      targetConditions: ['arthritis', 'inflammation', 'hypertension']
    },
    {
      id: 'meditation',
      name: 'Mindfulness Meditation',
      type: 'therapy',
      description: 'A mind-body practice that can help reduce stress and manage pain.',
      benefits: ['Stress reduction', 'Pain management', 'Improved sleep', 'Emotional regulation'],
      usage: '10-20 minutes daily, guided or self-directed practice',
      precautions: ['May initially increase awareness of discomfort', 'Not suitable during acute mental health crises'],
      interactions: [],
      evidenceLevel: 'high',
      targetSymptoms: ['anxiety', 'pain', 'insomnia', 'fatigue'],
      targetConditions: ['anxiety', 'depression', 'insomnia']
    },
    {
      id: 'probiotics',
      name: 'Probiotics',
      type: 'supplement',
      description: 'Beneficial bacteria that support digestive and immune health.',
      benefits: ['Digestive health', 'Immune support', 'Mood regulation', 'Inflammation reduction'],
      usage: '1-10 billion CFU daily with or without food',
      precautions: ['May cause initial digestive upset', 'Avoid if immunocompromised'],
      interactions: ['Antibiotics (take 2 hours apart)'],
      evidenceLevel: 'moderate',
      targetSymptoms: ['bloating', 'diarrhea', 'constipation', 'fatigue'],
      targetConditions: ['digestive issues', 'inflammation']
    },
    {
      id: 'echinacea',
      name: 'Echinacea',
      type: 'herb',
      description: 'An immune-supporting herb traditionally used for respiratory health.',
      benefits: ['Immune system support', 'Reduces cold duration', 'Anti-inflammatory', 'Wound healing'],
      usage: '300-500mg three times daily at first sign of illness',
      precautions: ['Avoid if allergic to ragweed family', 'Not for long-term use', 'Avoid with autoimmune conditions'],
      interactions: ['Immunosuppressive medications', 'Caffeine'],
      evidenceLevel: 'moderate',
      targetSymptoms: ['cough', 'congestion', 'runny nose', 'sneezing'],
      targetConditions: ['cold', 'flu', 'infection']
    },
    {
      id: 'lavender',
      name: 'Lavender',
      type: 'herb',
      description: 'A calming herb known for its relaxing and sleep-promoting properties.',
      benefits: ['Promotes relaxation', 'Improves sleep quality', 'Reduces anxiety', 'Pain relief'],
      usage: 'Essential oil aromatherapy, tea, or 80-160mg capsules before bed',
      precautions: ['May cause drowsiness', 'Avoid during pregnancy', 'Can cause skin irritation'],
      interactions: ['Sedative medications', 'Blood pressure medications'],
      evidenceLevel: 'moderate',
      targetSymptoms: ['anxiety', 'insomnia', 'headache', 'irritation'],
      targetConditions: ['anxiety', 'insomnia']
    },
    {
      id: 'green_tea',
      name: 'Green Tea (EGCG)',
      type: 'dietary',
      description: 'Rich in antioxidants, particularly EGCG, with numerous health benefits.',
      benefits: ['Antioxidant properties', 'Supports metabolism', 'Brain health', 'Heart health'],
      usage: '2-3 cups daily or 300-400mg EGCG extract',
      precautions: ['Contains caffeine', 'May interfere with iron absorption', 'Avoid on empty stomach'],
      interactions: ['Blood thinners', 'Iron supplements', 'Beta-blockers'],
      evidenceLevel: 'high',
      targetSymptoms: ['fatigue', 'inflammation'],
      targetConditions: ['inflammation', 'hypertension']
    },
    {
      id: 'valerian',
      name: 'Valerian Root',
      type: 'herb',
      description: 'A traditional herb used for sleep disorders and anxiety.',
      benefits: ['Improves sleep quality', 'Reduces anxiety', 'Muscle relaxation', 'Stress relief'],
      usage: '300-600mg extract 30 minutes before bedtime',
      precautions: ['May cause drowsiness', 'Avoid with alcohol', 'Can cause vivid dreams'],
      interactions: ['Sedative medications', 'Alcohol', 'Anesthesia'],
      evidenceLevel: 'moderate',
      targetSymptoms: ['insomnia', 'anxiety', 'stiff', 'tight'],
      targetConditions: ['insomnia', 'anxiety']
    },
    {
      id: 'elderberry',
      name: 'Elderberry',
      type: 'herb',
      description: 'A berry rich in antioxidants and traditionally used for immune support.',
      benefits: ['Immune system support', 'Antiviral properties', 'Reduces cold symptoms', 'Antioxidant'],
      usage: '15ml syrup or 300-600mg extract daily during illness',
      precautions: ['Raw elderberries are toxic', 'May cause digestive upset', 'Avoid with autoimmune conditions'],
      interactions: ['Immunosuppressive medications', 'Diabetes medications'],
      evidenceLevel: 'moderate',
      targetSymptoms: ['cough', 'congestion', 'fever', 'fatigue'],
      targetConditions: ['cold', 'flu', 'infection']
    },
    {
      id: 'yoga',
      name: 'Yoga Practice',
      type: 'lifestyle',
      description: 'A mind-body practice combining physical postures, breathing, and meditation.',
      benefits: ['Improves flexibility', 'Reduces stress', 'Pain management', 'Better sleep'],
      usage: '20-60 minutes daily, adapted to your ability level',
      precautions: ['Avoid certain poses with injuries', 'Start slowly', 'Listen to your body'],
      interactions: [],
      evidenceLevel: 'high',
      targetSymptoms: ['pain', 'stiff', 'anxiety', 'insomnia'],
      targetConditions: ['arthritis', 'anxiety', 'depression', 'hypertension']
    },
    {
      id: 'magnesium',
      name: 'Magnesium',
      type: 'supplement',
      description: 'An essential mineral involved in over 300 enzymatic reactions in the body.',
      benefits: ['Muscle relaxation', 'Better sleep', 'Stress reduction', 'Heart health'],
      usage: '200-400mg daily, preferably magnesium glycinate or citrate',
      precautions: ['May cause digestive upset', 'Reduce dose if diarrhea occurs', 'Kidney disease caution'],
      interactions: ['Antibiotics', 'Diuretics', 'Proton pump inhibitors'],
      evidenceLevel: 'high',
      targetSymptoms: ['cramps', 'stiff', 'insomnia', 'headache'],
      targetConditions: ['insomnia', 'migraine', 'hypertension']
    },
    {
      id: 'acupuncture',
      name: 'Acupuncture',
      type: 'therapy',
      description: 'Traditional Chinese medicine practice involving insertion of thin needles at specific points.',
      benefits: ['Pain relief', 'Stress reduction', 'Improved sleep', 'Nausea relief'],
      usage: 'Weekly sessions with licensed acupuncturist, typically 6-12 sessions',
      precautions: ['Use licensed practitioners only', 'Risk of infection if not sterile', 'Avoid if bleeding disorders'],
      interactions: ['Blood thinners (increased bleeding risk)'],
      evidenceLevel: 'high',
      targetSymptoms: ['pain', 'nausea', 'headache', 'anxiety'],
      targetConditions: ['arthritis', 'migraine', 'anxiety', 'nausea']
    }
  ];

  getRecommendations(symptoms: string[], conditions: string[], severity: string | null): RemedyRecommendation[] {
    const recommendations: RemedyRecommendation[] = [];

    for (const remedy of this.remedies) {
      let relevanceScore = 0;
      let reasoning = '';

      // Score based on symptom matches
      const symptomMatches = symptoms.filter(symptom => 
        remedy.targetSymptoms.some(target => 
          target.includes(symptom) || symptom.includes(target)
        )
      );
      
      if (symptomMatches.length > 0) {
        relevanceScore += symptomMatches.length * 0.4;
        reasoning += `Targets symptoms: ${symptomMatches.join(', ')}. `;
      }

      // Score based on condition matches
      const conditionMatches = conditions.filter(condition =>
        remedy.targetConditions.some(target =>
          target.includes(condition) || condition.includes(target)
        )
      );

      if (conditionMatches.length > 0) {
        relevanceScore += conditionMatches.length * 0.5;
        reasoning += `Effective for: ${conditionMatches.join(', ')}. `;
      }

      // Boost score based on evidence level
      const evidenceBoost = {
        'high': 0.3,
        'moderate': 0.2,
        'limited': 0.1,
        'traditional': 0.05
      };
      relevanceScore += evidenceBoost[remedy.evidenceLevel];

      // Adjust for severity
      if (severity === 'severe' && remedy.type === 'lifestyle') {
        relevanceScore *= 0.7; // Lifestyle changes may be less immediately effective for severe symptoms
      }

      if (relevanceScore > 0.2) { // Lowered threshold to include more options
        recommendations.push({
          remedy,
          relevanceScore,
          reasoning: reasoning.trim()
        });
      }
    }

    return recommendations
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 6); // Increased to top 6 recommendations
  }

  getRemedyById(id: string): Remedy | undefined {
    return this.remedies.find(remedy => remedy.id === id);
  }

  getRemediesByType(type: Remedy['type']): Remedy[] {
    return this.remedies.filter(remedy => remedy.type === type);
  }

  searchRemedies(query: string): Remedy[] {
    const lowerQuery = query.toLowerCase();
    return this.remedies.filter(remedy => 
      remedy.name.toLowerCase().includes(lowerQuery) ||
      remedy.description.toLowerCase().includes(lowerQuery) ||
      remedy.benefits.some(benefit => benefit.toLowerCase().includes(lowerQuery)) ||
      remedy.targetSymptoms.some(symptom => symptom.toLowerCase().includes(lowerQuery))
    );
  }
}

export const remedyService = new RemedyService();