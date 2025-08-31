import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Info, Zap, Clock } from "lucide-react";
import { Remedy } from "@/services/remedyService";
import { cn } from "@/lib/utils";

interface RemedyCardProps {
  remedy: Remedy;
  relevanceScore?: number;
  reasoning?: string;
}

const RemedyCard = ({ remedy, relevanceScore, reasoning }: RemedyCardProps) => {
  const getTypeColor = (type: Remedy['type']) => {
    switch (type) {
      case 'herb': return 'bg-green-100 text-green-800';
      case 'supplement': return 'bg-blue-100 text-blue-800';
      case 'lifestyle': return 'bg-purple-100 text-purple-800';
      case 'dietary': return 'bg-orange-100 text-orange-800';
      case 'therapy': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEvidenceColor = (level: Remedy['evidenceLevel']) => {
    switch (level) {
      case 'high': return 'bg-emerald-100 text-emerald-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'limited': return 'bg-orange-100 text-orange-800';
      case 'traditional': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full mb-4 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold text-gray-800">
            {remedy.name}
          </CardTitle>
          <div className="flex gap-2">
            <Badge className={cn("text-xs", getTypeColor(remedy.type))}>
              {remedy.type}
            </Badge>
            <Badge className={cn("text-xs", getEvidenceColor(remedy.evidenceLevel))}>
              {remedy.evidenceLevel} evidence
            </Badge>
          </div>
        </div>
        
        {reasoning && (
          <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
            <Info className="w-4 h-4" />
            <span>{reasoning}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-gray-700 leading-relaxed">
          {remedy.description}
        </p>

        <div>
          <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4 text-green-600" />
            Benefits
          </h4>
          <div className="flex flex-wrap gap-1">
            {remedy.benefits.map((benefit, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {benefit}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            Usage Guidelines
          </h4>
          <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
            {remedy.usage}
          </p>
        </div>

        {remedy.precautions.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Precautions
            </h4>
            <ul className="text-sm text-gray-700 space-y-1">
              {remedy.precautions.map((precaution, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-amber-600 mt-1">•</span>
                  <span>{precaution}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {remedy.interactions.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              Drug Interactions
            </h4>
            <div className="bg-red-50 p-3 rounded-lg">
              <p className="text-sm text-red-800 mb-2">
                Consult your healthcare provider if taking:
              </p>
              <div className="flex flex-wrap gap-1">
                {remedy.interactions.map((interaction, index) => (
                  <Badge key={index} variant="destructive" className="text-xs">
                    {interaction}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RemedyCard;