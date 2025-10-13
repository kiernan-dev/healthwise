import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, Shield, Heart, Lightbulb } from "lucide-react";

const WelcomeMessage = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  if (isMobile) {
    return (
      <div className="flex gap-3 mb-4">
        <Avatar className="w-8 h-8 mt-1">
          <AvatarFallback className="bg-green-100">
            <Bot className="w-4 h-4 text-green-600" />
          </AvatarFallback>
        </Avatar>
        
        <Card className="bg-white border shadow-sm p-4 max-w-[85%]">
          <div className="space-y-3">
            <div>
              <h2 className="text-base font-semibold text-green-700 mb-1">
                Natural Health Assistant
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed">
                Describe your symptoms for personalized natural remedy suggestions.
              </p>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs text-yellow-800">
                <strong>Note:</strong> For educational purposes only. Consult healthcare providers for medical advice.
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-700 font-medium">How can I help?</p>
              <p className="text-xs text-gray-600 mt-1">
                Try: "headache and stress" or "sleep issues"
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="flex gap-3 mb-6">
      <Avatar className="w-8 h-8 mt-1">
        <AvatarFallback className="bg-green-100">
          <Bot className="w-4 h-4 text-green-600" />
        </AvatarFallback>
      </Avatar>
      
      <Card className="bg-white border shadow-sm p-6 max-w-[80%]">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-green-700 mb-2">
              Welcome to Your Natural Health Assistant
            </h2>
            <p className="text-gray-700 leading-relaxed">
              I'm here to help you explore natural remedies and wellness approaches for your health concerns. 
              I can provide information about herbs, supplements, lifestyle changes, and holistic therapies 
              based on traditional knowledge and current research.
            </p>
          </div>
          
          <div className="grid gap-3">
            <div className="flex items-start gap-3">
              <Heart className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-gray-800">Personalized Recommendations</p>
                <p className="text-sm text-gray-600">Describe your symptoms and I'll suggest relevant natural remedies</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-gray-800">Evidence-Based Information</p>
                <p className="text-sm text-gray-600">All suggestions include usage guidelines, precautions, and evidence levels</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-gray-800">Safety First</p>
                <p className="text-sm text-gray-600">Important interactions and precautions are always included</p>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> This information is for educational purposes only and should not replace 
              professional medical advice. Always consult with a healthcare provider for serious or persistent symptoms.
            </p>
          </div>
          
          
          <div className="pt-2">
            <p className="text-gray-700 font-medium">How can I help you today?</p>
            <p className="text-sm text-gray-600 mt-1">
              Try describing symptoms like "I have a headache and feel stressed" or 
              "I'm looking for natural ways to improve my sleep"
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default WelcomeMessage;