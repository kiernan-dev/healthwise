export interface SymptomEntry {
  id: string;
  symptom: string;
  severity: number;
  notes: string;
  timestamp: Date;
  triggers?: string[];
  bodyPart?: string;
  duration?: string;
}

export interface SymptomPattern {
  commonSymptoms: string[];
  averageSeverity: number;
  frequentTriggers: string[];
  timePatterns: string[];
}

class SymptomStorageService {
  private storageKey = 'health-assistant-symptoms';
  private symptoms: SymptomEntry[] = [];

  constructor() {
    this.loadSymptoms();
  }

  private loadSymptoms(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.symptoms = parsed.map((s: any) => ({
          ...s,
          timestamp: new Date(s.timestamp)
        }));
      }
    } catch (error) {
      console.error('Error loading symptoms:', error);
      this.symptoms = [];
    }
  }

  private saveSymptoms(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.symptoms));
    } catch (error) {
      console.error('Error saving symptoms:', error);
    }
  }

  addSymptom(symptom: SymptomEntry): void {
    this.symptoms.unshift(symptom); // Add to beginning for chronological order
    this.saveSymptoms();
  }

  getSymptoms(limit?: number): SymptomEntry[] {
    return limit ? this.symptoms.slice(0, limit) : [...this.symptoms];
  }

  getRecentSymptoms(days: number = 7): SymptomEntry[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return this.symptoms.filter(symptom => symptom.timestamp >= cutoffDate);
  }

  getSymptomsByType(symptomType: string): SymptomEntry[] {
    return this.symptoms.filter(symptom => 
      symptom.symptom.toLowerCase().includes(symptomType.toLowerCase())
    );
  }

  analyzePatterns(): SymptomPattern {
    if (this.symptoms.length === 0) {
      return {
        commonSymptoms: [],
        averageSeverity: 0,
        frequentTriggers: [],
        timePatterns: []
      };
    }

    // Find most common symptoms
    const symptomCounts = new Map<string, number>();
    this.symptoms.forEach(entry => {
      const count = symptomCounts.get(entry.symptom) || 0;
      symptomCounts.set(entry.symptom, count + 1);
    });

    const commonSymptoms = Array.from(symptomCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([symptom]) => symptom);

    // Calculate average severity
    const totalSeverity = this.symptoms.reduce((sum, entry) => sum + entry.severity, 0);
    const averageSeverity = Math.round(totalSeverity / this.symptoms.length);

    // Find frequent triggers
    const triggerCounts = new Map<string, number>();
    this.symptoms.forEach(entry => {
      entry.triggers?.forEach(trigger => {
        const count = triggerCounts.get(trigger) || 0;
        triggerCounts.set(trigger, count + 1);
      });
    });

    const frequentTriggers = Array.from(triggerCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([trigger]) => trigger);

    // Analyze time patterns
    const hourCounts = new Map<number, number>();
    this.symptoms.forEach(entry => {
      const hour = entry.timestamp.getHours();
      const count = hourCounts.get(hour) || 0;
      hourCounts.set(hour, count + 1);
    });

    const timePatterns = this.getTimePatterns(hourCounts);

    return {
      commonSymptoms,
      averageSeverity,
      frequentTriggers,
      timePatterns
    };
  }

  private getTimePatterns(hourCounts: Map<number, number>): string[] {
    const patterns: string[] = [];
    
    // Morning (6-12)
    const morningCount = Array.from(hourCounts.entries())
      .filter(([hour]) => hour >= 6 && hour < 12)
      .reduce((sum, [, count]) => sum + count, 0);
    
    // Afternoon (12-18)
    const afternoonCount = Array.from(hourCounts.entries())
      .filter(([hour]) => hour >= 12 && hour < 18)
      .reduce((sum, [, count]) => sum + count, 0);
    
    // Evening (18-24)
    const eveningCount = Array.from(hourCounts.entries())
      .filter(([hour]) => hour >= 18 || hour < 6)
      .reduce((sum, [, count]) => sum + count, 0);

    const total = morningCount + afternoonCount + eveningCount;
    if (total === 0) return patterns;

    if (morningCount / total > 0.4) patterns.push('Morning symptoms are common');
    if (afternoonCount / total > 0.4) patterns.push('Afternoon symptoms are frequent');
    if (eveningCount / total > 0.4) patterns.push('Evening/night symptoms occur often');

    return patterns;
  }

  generateSummaryForChat(): string {
    const recentSymptoms = this.getRecentSymptoms(7);
    const patterns = this.analyzePatterns();

    if (recentSymptoms.length === 0) {
      return "No recent symptoms logged in the tracker.";
    }

    let summary = `**Recent Symptom Summary (Last 7 days):**\n\n`;
    summary += `• **Total entries:** ${recentSymptoms.length}\n`;
    
    if (patterns.commonSymptoms.length > 0) {
      summary += `• **Most common symptoms:** ${patterns.commonSymptoms.slice(0, 3).join(', ')}\n`;
    }
    
    summary += `• **Average severity:** ${patterns.averageSeverity}/10\n`;
    
    if (patterns.frequentTriggers.length > 0) {
      summary += `• **Common triggers:** ${patterns.frequentTriggers.join(', ')}\n`;
    }
    
    if (patterns.timePatterns.length > 0) {
      summary += `• **Patterns:** ${patterns.timePatterns.join(', ')}\n`;
    }

    summary += `\n**Recent entries:**\n`;
    recentSymptoms.slice(0, 3).forEach((entry, index) => {
      summary += `${index + 1}. ${entry.symptom} (${entry.severity}/10) - ${entry.timestamp.toLocaleDateString()}\n`;
    });

    return summary;
  }

  clearAllSymptoms(): void {
    this.symptoms = [];
    this.saveSymptoms();
  }
}

export const symptomStorageService = new SymptomStorageService();