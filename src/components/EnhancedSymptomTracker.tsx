import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Leaf, Wind, Brain, Plus, X } from "lucide-react";
import { symptomStorageService, SymptomEntry } from "@/services/symptomStorageService";

interface EnhancedSymptomTrackerProps {
  onSymptomLogged?: (entry: SymptomEntry) => void;
}

const EnhancedSymptomTracker = ({ onSymptomLogged }: EnhancedSymptomTrackerProps) => {
  const [symptom, setSymptom] = useState("");
  const [severity, setSeverity] = useState([5]);
  const [notes, setNotes] = useState("");
  
  // Enhanced tracking fields
  const [triggers, setTriggers] = useState<string[]>([]);
  const [supplements, setSupplements] = useState<string[]>([]);
  const [naturalRemedies, setNaturalRemedies] = useState<string[]>([]);
  const [environmentalFactors, setEnvironmentalFactors] = useState<string[]>([]);
  const [mindfulnessPractices, setMindfulnessPractices] = useState<string[]>([]);
  const [airQuality, setAirQuality] = useState<'good' | 'moderate' | 'poor' | ''>('');
  const [weather, setWeather] = useState('');

  // Options for multi-select fields
  const triggerOptions = ["Stress", "Weather", "Food", "Exercise", "Sleep", "Work", "Travel", "Hormones"];
  const supplementOptions = ["Vitamin D", "Magnesium", "Turmeric", "Omega-3", "Probiotics", "Vitamin B12", "Zinc", "Iron"];
  const remedyOptions = ["Herbal tea", "Essential oils", "Acupuncture", "Massage", "Hot/cold therapy", "Breathing exercises", "Yoga", "Meditation"];
  const environmentalOptions = ["High pollen", "Dry air", "Humid weather", "Temperature change", "Indoor air quality", "Seasonal change", "Pollution", "Allergens"];
  const mindfulnessOptions = ["Meditation", "Deep breathing", "Yoga", "Mindful walking", "Journaling", "Progressive relaxation", "Visualization", "Gratitude practice"];

  // Helper functions
  const toggleSelection = (item: string, currentList: string[], setList: (list: string[]) => void) => {
    if (currentList.includes(item)) {
      setList(currentList.filter(i => i !== item));
    } else {
      setList([...currentList, item]);
    }
  };

  const getSeverityEmoji = (level: number) => {
    if (level <= 2) return "😊";
    if (level <= 4) return "😐";
    if (level <= 6) return "😕";
    if (level <= 8) return "😰";
    return "😫";
  };

  const getSeverityColor = (level: number) => {
    if (level <= 3) return "text-green-600";
    if (level <= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const getSeverityBgColor = (level: number) => {
    if (level <= 3) return "bg-green-100 border-green-300";
    if (level <= 6) return "bg-yellow-100 border-yellow-300";
    return "bg-red-100 border-red-300";
  };

  const getSeverityLabel = (level: number) => {
    if (level <= 3) return "Mild";
    if (level <= 6) return "Moderate";
    return "Severe";
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

    symptomStorageService.addSymptom(entry);
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

  const MultiSelectSection = ({ 
    title, 
    icon, 
    options, 
    selected, 
    onToggle, 
    color = "blue" 
  }: {
    title: string;
    icon: React.ReactNode;
    options: string[];
    selected: string[];
    onToggle: (item: string) => void;
    color?: string;
  }) => (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        {icon}
        {title}
      </Label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <Button
            key={option}
            type="button"
            variant={selected.includes(option) ? "default" : "outline"}
            size="sm"
            onClick={() => onToggle(option)}
            className={`text-xs ${selected.includes(option) ? `bg-${color}-600 hover:bg-${color}-700` : ''}`}
          >
            {option}
          </Button>
        ))}
      </div>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selected.map((item) => (
            <Badge key={item} variant="secondary" className="text-xs">
              {item}
              <X 
                className="w-3 h-3 ml-1 cursor-pointer" 
                onClick={() => onToggle(item)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Enhanced Symptom Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Symptom Info */}
        <div className="space-y-4">
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

          {/* Enhanced Severity Slider */}
          <div className={`p-4 rounded-lg border-2 ${getSeverityBgColor(severity[0])}`}>
            <Label className="flex items-center gap-2 text-lg">
              <span className="text-2xl">{getSeverityEmoji(severity[0])}</span>
              Severity: {severity[0]}/10 - {getSeverityLabel(severity[0])}
            </Label>
            <div className="mt-3">
              <Slider
                value={severity}
                onValueChange={setSeverity}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span className="flex items-center gap-1">😊 Mild</span>
                <span className="flex items-center gap-1">😐 Moderate</span>
                <span className="flex items-center gap-1">😫 Severe</span>
              </div>
            </div>
          </div>
        </div>

        {/* Natural Health Tracking Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MultiSelectSection
            title="Potential Triggers"
            icon={<TrendingUp className="w-4 h-4" />}
            options={triggerOptions}
            selected={triggers}
            onToggle={(item) => toggleSelection(item, triggers, setTriggers)}
            color="red"
          />

          <MultiSelectSection
            title="Supplements Taken"
            icon={<Leaf className="w-4 h-4" />}
            options={supplementOptions}
            selected={supplements}
            onToggle={(item) => toggleSelection(item, supplements, setSupplements)}
            color="green"
          />

          <MultiSelectSection
            title="Natural Remedies Tried"
            icon={<Leaf className="w-4 h-4" />}
            options={remedyOptions}
            selected={naturalRemedies}
            onToggle={(item) => toggleSelection(item, naturalRemedies, setNaturalRemedies)}
            color="emerald"
          />

          <MultiSelectSection
            title="Environmental Factors"
            icon={<Wind className="w-4 h-4" />}
            options={environmentalOptions}
            selected={environmentalFactors}
            onToggle={(item) => toggleSelection(item, environmentalFactors, setEnvironmentalFactors)}
            color="sky"
          />

          <MultiSelectSection
            title="Mindfulness Practices"
            icon={<Brain className="w-4 h-4" />}
            options={mindfulnessOptions}
            selected={mindfulnessPractices}
            onToggle={(item) => toggleSelection(item, mindfulnessPractices, setMindfulnessPractices)}
            color="purple"
          />

          {/* Air Quality & Weather */}
          <div className="space-y-4">
            <div>
              <Label>Air Quality</Label>
              <Select value={airQuality} onValueChange={(value: 'good' | 'moderate' | 'poor') => setAirQuality(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select air quality..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="good">🟢 Good</SelectItem>
                  <SelectItem value="moderate">🟡 Moderate</SelectItem>
                  <SelectItem value="poor">🔴 Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="weather">Weather Conditions</Label>
              <Input
                id="weather"
                value={weather}
                onChange={(e) => setWeather(e.target.value)}
                placeholder="e.g., rainy, hot, humid..."
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
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

        {/* Submit Button */}
        <Button 
          onClick={handleSubmit}
          disabled={!symptom.trim()}
          className="w-full"
          size="lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Log Symptom
        </Button>
      </CardContent>
    </Card>
  );
};

export default EnhancedSymptomTracker;