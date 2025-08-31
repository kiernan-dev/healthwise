import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Phone, MapPin, Clock } from "lucide-react";

interface EmergencyGuidanceProps {
  symptoms?: string[];
  severity?: number;
}

const EmergencyGuidance = ({ symptoms = [], severity = 0 }: EmergencyGuidanceProps) => {
  const emergencySymptoms = [
    'chest pain', 'difficulty breathing', 'severe headache', 'loss of consciousness',
    'severe bleeding', 'severe burns', 'poisoning', 'allergic reaction',
    'stroke symptoms', 'heart attack', 'seizure', 'severe abdominal pain'
  ];

  const urgentSymptoms = [
    'high fever', 'persistent vomiting', 'severe dehydration', 'severe pain',
    'difficulty swallowing', 'severe dizziness', 'confusion', 'severe weakness'
  ];

  const hasEmergencySymptoms = symptoms.some(symptom => 
    emergencySymptoms.some(emergency => 
      symptom.toLowerCase().includes(emergency) || emergency.includes(symptom.toLowerCase())
    )
  );

  const hasUrgentSymptoms = symptoms.some(symptom => 
    urgentSymptoms.some(urgent => 
      symptom.toLowerCase().includes(urgent) || urgent.includes(symptom.toLowerCase())
    )
  );

  const isSevere = severity >= 8;

  if (!hasEmergencySymptoms && !hasUrgentSymptoms && !isSevere) {
    return null;
  }

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-800">
          <AlertTriangle className="w-5 h-5" />
          {hasEmergencySymptoms ? 'Emergency Medical Attention Needed' : 'Urgent Medical Care Recommended'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasEmergencySymptoms && (
          <Alert className="border-red-300 bg-red-100">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>CALL 911 IMMEDIATELY</strong> - Your symptoms may indicate a medical emergency that requires immediate professional attention.
            </AlertDescription>
          </Alert>
        )}

        {(hasUrgentSymptoms || isSevere) && !hasEmergencySymptoms && (
          <Alert className="border-orange-300 bg-orange-100">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Seek Medical Care Soon</strong> - Your symptoms suggest you should see a healthcare provider within the next few hours.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-3">
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
            <Phone className="w-5 h-5 text-red-600" />
            <div>
              <div className="font-medium text-gray-800">Emergency Services</div>
              <div className="text-sm text-gray-600">Call 911 for immediate emergency care</div>
            </div>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => window.open('tel:911')}
            >
              Call 911
            </Button>
          </div>

          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
            <MapPin className="w-5 h-5 text-blue-600" />
            <div>
              <div className="font-medium text-gray-800">Find Nearest Hospital</div>
              <div className="text-sm text-gray-600">Locate emergency rooms near you</div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('https://maps.google.com/search/hospital+near+me', '_blank')}
            >
              Find Hospital
            </Button>
          </div>

          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
            <Clock className="w-5 h-5 text-green-600" />
            <div>
              <div className="font-medium text-gray-800">Urgent Care Centers</div>
              <div className="text-sm text-gray-600">For non-emergency urgent medical needs</div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('https://maps.google.com/search/urgent+care+near+me', '_blank')}
            >
              Find Urgent Care
            </Button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <h4 className="font-medium text-gray-800 mb-2">While Waiting for Help:</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Stay calm and try to remain still</li>
            <li>• Do not take any medications unless prescribed</li>
            <li>• Have someone stay with you if possible</li>
            <li>• Keep a list of your medications and medical conditions ready</li>
            <li>• Do not drive yourself to the hospital</li>
          </ul>
        </div>

        <div className="text-xs text-gray-600 bg-white p-3 rounded-lg border">
          <strong>Disclaimer:</strong> This guidance is for informational purposes only and should not replace professional medical judgment. When in doubt, always seek immediate medical attention.
        </div>
      </CardContent>
    </Card>
  );
};

export default EmergencyGuidance;