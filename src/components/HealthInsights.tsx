import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Calendar } from "lucide-react";
import { symptomStorageService, SymptomEntry } from "@/services/symptomStorageService";
import SymptomChart from "./SymptomChart";

interface HealthMetric {
  label: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'concerning';
}

const HealthInsights = () => {
  const [symptoms, setSymptoms] = useState<SymptomEntry[]>([]);
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    const allSymptoms = symptomStorageService.getSymptoms();
    const recentSymptoms = symptomStorageService.getRecentSymptoms(7);
    const patterns = symptomStorageService.analyzePatterns();
    
    setSymptoms(allSymptoms);
    
    // Calculate health metrics
    const calculatedMetrics: HealthMetric[] = [
      {
        label: "Average Severity",
        value: patterns.averageSeverity,
        trend: calculateSeverityTrend(allSymptoms),
        status: patterns.averageSeverity <= 3 ? 'good' : patterns.averageSeverity <= 6 ? 'warning' : 'concerning'
      },
      {
        label: "Symptom Frequency",
        value: recentSymptoms.length,
        trend: calculateFrequencyTrend(allSymptoms),
        status: recentSymptoms.length <= 2 ? 'good' : recentSymptoms.length <= 5 ? 'warning' : 'concerning'
      },
      {
        label: "Wellness Score",
        value: calculateWellnessScore(patterns.averageSeverity, recentSymptoms.length),
        trend: 'stable',
        status: calculateWellnessScore(patterns.averageSeverity, recentSymptoms.length) >= 70 ? 'good' : 
                calculateWellnessScore(patterns.averageSeverity, recentSymptoms.length) >= 50 ? 'warning' : 'concerning'
      }
    ];
    
    setMetrics(calculatedMetrics);
    
    // Generate insights
    const generatedInsights = generateHealthInsights(patterns, recentSymptoms, allSymptoms);
    setInsights(generatedInsights);
  }, []);

  const calculateSeverityTrend = (symptoms: SymptomEntry[]): 'up' | 'down' | 'stable' => {
    if (symptoms.length < 4) return 'stable';
    
    const recent = symptoms.slice(0, Math.floor(symptoms.length / 2));
    const older = symptoms.slice(Math.floor(symptoms.length / 2));
    
    const recentAvg = recent.reduce((sum, s) => sum + s.severity, 0) / recent.length;
    const olderAvg = older.reduce((sum, s) => sum + s.severity, 0) / older.length;
    
    if (recentAvg > olderAvg + 0.5) return 'up';
    if (recentAvg < olderAvg - 0.5) return 'down';
    return 'stable';
  };

  const calculateFrequencyTrend = (symptoms: SymptomEntry[]): 'up' | 'down' | 'stable' => {
    if (symptoms.length < 14) return 'stable';
    
    const lastWeek = symptomStorageService.getRecentSymptoms(7).length;
    const previousWeek = symptoms.filter(s => {
      const daysDiff = (Date.now() - s.timestamp.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff >= 7 && daysDiff < 14;
    }).length;
    
    if (lastWeek > previousWeek) return 'up';
    if (lastWeek < previousWeek) return 'down';
    return 'stable';
  };

  const calculateWellnessScore = (avgSeverity: number, frequency: number): number => {
    const severityScore = Math.max(0, 100 - (avgSeverity * 10));
    const frequencyScore = Math.max(0, 100 - (frequency * 15));
    return Math.round((severityScore + frequencyScore) / 2);
  };

  const generateHealthInsights = (patterns: { commonSymptoms: string[]; averageSeverity: number; frequentTriggers: string[]; timePatterns: string[] }, recent: SymptomEntry[], all: SymptomEntry[]): string[] => {
    const insights: string[] = [];
    
    if (recent.length === 0) {
      insights.push("Great job! You haven't logged any symptoms in the past week.");
      return insights;
    }
    
    if (patterns.averageSeverity <= 3) {
      insights.push("Your symptoms are generally mild, which is encouraging.");
    } else if (patterns.averageSeverity >= 7) {
      insights.push("Your symptoms tend to be severe. Consider consulting a healthcare provider.");
    }
    
    if (patterns.frequentTriggers.length > 0) {
      insights.push(`Your most common triggers are: ${patterns.frequentTriggers.join(', ')}. Consider avoiding or managing these triggers.`);
    }
    
    if (patterns.timePatterns.length > 0) {
      insights.push(`Pattern detected: ${patterns.timePatterns[0]}. This might help you prepare for and manage symptoms.`);
    }
    
    if (recent.length > 5) {
      insights.push("You've been experiencing symptoms frequently. Consider tracking potential triggers more closely.");
    }
    
    const stressRelated = recent.filter(s => s.triggers?.includes('Stress')).length;
    if (stressRelated > recent.length * 0.5) {
      insights.push("Many of your symptoms appear stress-related. Consider stress management techniques like meditation or yoga.");
    }
    
    return insights;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'concerning': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return null;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-green-500" />;
      default: return <div className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'concerning': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (symptoms.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Health Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">No Symptoms Tracked Yet</h3>
            <p className="text-gray-600">Start tracking your symptoms to see personalized health insights and patterns.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <SymptomChart symptoms={symptoms} />

      {/* Health Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Health Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {metrics.map((metric, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(metric.status)}
                    <span className="font-medium">{metric.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(metric.trend)}
                    <span className={`font-semibold ${getStatusColor(metric.status)}`}>
                      {metric.label === 'Wellness Score' ? `${metric.value}%` : metric.value}
                    </span>
                  </div>
                </div>
                {metric.label === 'Wellness Score' && (
                  <Progress value={metric.value} className="h-2" />
                )}
                {metric.label === 'Average Severity' && (
                  <Progress value={(metric.value / 10) * 100} className="h-2" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Health Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-purple-600" />
            Personalized Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 shrink-0" />
                <p className="text-sm text-purple-800">{insight}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-600" />
            Quick Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{symptoms.length}</div>
              <div className="text-sm text-blue-800">Total Entries</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {symptomStorageService.getRecentSymptoms(7).length}
              </div>
              <div className="text-sm text-green-800">This Week</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {symptomStorageService.analyzePatterns().commonSymptoms.length}
              </div>
              <div className="text-sm text-yellow-800">Unique Symptoms</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {symptoms.length > 0 ? Math.round((Date.now() - symptoms[symptoms.length - 1]?.timestamp.getTime()) / (1000 * 60 * 60 * 24)) : 0}
              </div>
              <div className="text-sm text-purple-800">Days Tracking</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthInsights;