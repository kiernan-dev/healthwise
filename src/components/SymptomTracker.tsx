import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, X, TrendingUp, BarChart3, Trash2, Leaf, Wind, Brain } from "lucide-react";
import { symptomStorageService, SymptomEntry } from "@/services/symptomStorageService";

interface SymptomTrackerProps {
  onSymptomLogged?: (entry: SymptomEntry) => void;
}

const SymptomTracker = ({ onSymptomLogged }: SymptomTrackerProps) => {
  const [symptom, setSymptom] = useState("");
  const [severity, setSeverity] = useState([5]);
  const [notes, setNotes] = useState("");
  const [triggers, setTriggers] = useState<string[]>([]);
  const [newTrigger, setNewTrigger] = useState("");
  const [recentEntries, setRecentEntries] = useState<SymptomEntry[]>([]);
  const [showPatterns, setShowPatterns] = useState(false);
  
  // Natural health tracking states
  const [supplements, setSupplements] = useState<string[]>([]);
  const [naturalRemedies, setNaturalRemedies] = useState<string[]>([]);
  const [environmentalFactors, setEnvironmentalFactors] = useState<string[]>([]);
  const [mindfulnessPractices, setMindfulnessPractices] = useState<string[]>([]);
  const [airQuality, setAirQuality] = useState<'good' | 'moderate' | 'poor' | ''>('');
  const [weather, setWeather] = useState('');

  const commonTriggers = [
    "Stress", "Weather", "Food", "Exercise", "Sleep", "Work", "Travel", "Hormones"
  ];

  const commonSupplements = [
    "Vitamin D", "Magnesium", "Turmeric", "Omega-3", "Probiotics", "Vitamin B12", "Zinc", "Iron"
  ];

  const commonRemedies = [
    "Herbal tea", "Essential oils", "Acupuncture", "Massage", "Hot/cold therapy", "Breathing exercises", "Yoga", "Meditation"
  ];

  const environmentalOptions = [
    "High pollen", "Dry air", "Humid weather", "Temperature change", "Indoor air quality", "Seasonal change", "Pollution", "Allergens"
  ];

  const mindfulnessOptions = [
    "Meditation", "Deep breathing", "Yoga", "Mindful walking", "Journaling", "Progressive relaxation", "Visualization", "Gratitude practice"
  ];

  useEffect(() => {
    // Load recent entries on component mount
    setRecentEntries(symptomStorageService.getSymptoms(5));
  }, []);

  const handleAddTrigger = (trigger: string) => {
    if (trigger && !triggers.includes(trigger)) {
      setTriggers([...triggers, trigger]);
    }
    setNewTrigger("");
  };

  const handleRemoveTrigger = (trigger: string) => {
    setTriggers(triggers.filter(t => t !== trigger));
  };

  // Helper functions for multi-select fields
  const toggleSelection = (item: string, currentList: string[], setList: (list: string[]) => void) => {
    if (currentList.includes(item)) {
      setList(currentList.filter(i => i !== item));
    } else {
      setList([...currentList, item]);
    }
  };

  const addCustomItem = (item: string, currentList: string[], setList: (list: string[]) => void) => {
    if (item.trim() && !currentList.includes(item.trim())) {
      setList([...currentList, item.trim()]);
    }
  };

  const handleSubmit = () => {
    if (!symptom.trim()) return;

    const entry: SymptomEntry = {
      id: Date.now().toString(),
      symptom: symptom.trim(),
      severity: severity[0],
      notes: notes.trim(),
      timestamp: new Date(),
      triggers: triggers.length > 0 ? triggers : undefined,
      supplements: supplements.length > 0 ? supplements : undefined,
      naturalRemedies: naturalRemedies.length > 0 ? naturalRemedies : undefined,
      environmentalFactors: environmentalFactors.length > 0 ? environmentalFactors : undefined,
      mindfulnessPractices: mindfulnessPractices.length > 0 ? mindfulnessPractices : undefined,
      airQuality: airQuality || undefined,
      weather: weather.trim() || undefined,
    };

    // Save to persistent storage
    symptomStorageService.addSymptom(entry);
    
    // Update local state
    setRecentEntries(symptomStorageService.getSymptoms(5));
    
    // Notify parent component
    onSymptomLogged?.(entry);

    // Reset form
    setSymptom("");
    setSeverity([5]);
    setNotes("");
    setTriggers([]);
    setSupplements([]);
    setNaturalRemedies([]);
    setEnvironmentalFactors([]);
    setMindfulnessPractices([]);
    setAirQuality('');
    setWeather('');
  };

  const getSeverityColor = (level: number) => {
    if (level <= 3) return "text-green-600";
    if (level <= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const getSeverityLabel = (level: number) => {
    if (level <= 3) return "Mild";
    if (level <= 6) return "Moderate";
    return "Severe";
  };

  const getSeverityEmoji = (level: number) => {
    if (level <= 2) return "😊";
    if (level <= 4) return "😐";
    if (level <= 6) return "😕";
    if (level <= 8) return "😰";
    return "😫";
  };

  const getSeverityBgColor = (level: number) => {
    if (level <= 3) return "bg-green-100 border-green-300";
    if (level <= 6) return "bg-yellow-100 border-yellow-300";
    return "bg-red-100 border-red-300";
  };

  const handleClearHistory = () => {
    symptomStorageService.clearAllSymptoms();
    setRecentEntries([]);
  };

  const patterns = symptomStorageService.analyzePatterns();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Track Your Symptoms
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="symptom">What are you experiencing?</Label>
            <Input
              id="symptom"
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              placeholder="e.g., headache, back pain, nausea..."
              className="mt-1"
            />
          </div>

          <div>
            <Label>Severity Level: {severity[0]}/10 - {getSeverityLabel(severity[0])}</Label>
            <div className="mt-2 px-2">
              <Slider
                value={severity}
                onValueChange={setSeverity}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Mild (1-3)</span>
                <span>Moderate (4-6)</span>
                <span>Severe (7-10)</span>
              </div>
            </div>
          </div>

          <div>
            <Label>Possible Triggers</Label>
            <div className="flex flex-wrap gap-2 mt-2 mb-3">
              {commonTriggers.map((trigger) => (
                <Button
                  key={trigger}
                  variant={triggers.includes(trigger) ? "default" : "outline"}
                  size="sm"
                  onClick={() => 
                    triggers.includes(trigger) 
                      ? handleRemoveTrigger(trigger)
                      : handleAddTrigger(trigger)
                  }
                >
                  {trigger}
                </Button>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Input
                value={newTrigger}
                onChange={(e) => setNewTrigger(e.target.value)}
                placeholder="Add custom trigger..."
                onKeyPress={(e) => e.key === 'Enter' && handleAddTrigger(newTrigger)}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleAddTrigger(newTrigger)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {triggers.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {triggers.map((trigger) => (
                  <Badge key={trigger} variant="secondary" className="flex items-center gap-1">
                    {trigger}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => handleRemoveTrigger(trigger)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional details about your symptoms..."
              className="mt-1"
              rows={3}
            />
          </div>

          <Button onClick={handleSubmit} className="w-full" disabled={!symptom.trim()}>
            Log Symptom
          </Button>
        </CardContent>
      </Card>

      {/* Patterns Analysis */}
      {recentEntries.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                Symptom Patterns
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPatterns(!showPatterns)}
              >
                {showPatterns ? 'Hide' : 'Show'} Analysis
              </Button>
            </div>
          </CardHeader>
          {showPatterns && (
            <CardContent>
              <div className="space-y-3">
                {patterns.commonSymptoms.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Most Common Symptoms</h4>
                    <div className="flex flex-wrap gap-1">
                      {patterns.commonSymptoms.map((symptom) => (
                        <Badge key={symptom} variant="outline">{symptom}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Average Severity</h4>
                  <div className={`text-lg font-semibold ${getSeverityColor(patterns.averageSeverity)}`}>
                    {patterns.averageSeverity}/10 - {getSeverityLabel(patterns.averageSeverity)}
                  </div>
                </div>

                {patterns.frequentTriggers.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Common Triggers</h4>
                    <div className="flex flex-wrap gap-1">
                      {patterns.frequentTriggers.map((trigger) => (
                        <Badge key={trigger} variant="secondary">{trigger}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {patterns.timePatterns.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Time Patterns</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {patterns.timePatterns.map((pattern, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-purple-600 mt-1">•</span>
                          <span>{pattern}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Recent Entries */}
      {recentEntries.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-600" />
                Recent Entries ({recentEntries.length})
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearHistory}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Clear History
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentEntries.map((entry) => (
                <div key={entry.id} className="border-l-4 border-blue-200 pl-4 py-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{entry.symptom}</span>
                    <span className={`text-sm font-medium ${getSeverityColor(entry.severity)}`}>
                      {entry.severity}/10
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    {entry.timestamp.toLocaleString()}
                  </div>
                  {entry.triggers && entry.triggers.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {entry.triggers.map((trigger) => (
                        <Badge key={trigger} variant="outline" className="text-xs">
                          {trigger}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {entry.notes && (
                    <p className="text-sm text-gray-700">{entry.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SymptomTracker;