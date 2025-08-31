import { AlertTriangle, ExternalLink, Key, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const AIRequiredMessage = () => {
  const handleRefresh = () => {
    window.location.reload();
  };

  const openOpenRouter = () => {
    window.open('https://openrouter.ai/keys', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
      <div className="max-w-2xl mx-auto text-center space-y-6">
        {/* Main Alert */}
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          <AlertDescription className="text-orange-800 font-medium">
            AI-Only Mode is enabled - Live AI connection required
          </AlertDescription>
        </Alert>

        {/* Main Card */}
        <Card className="text-left">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Key className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              AI Connection Required
            </CardTitle>
            <CardDescription className="text-lg text-gray-600">
              HealthWise is configured for AI-only mode to provide the highest quality personalized health guidance
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Setup Steps */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-900">Quick Setup (2 minutes)</h3>
              
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Get an OpenRouter API Key</p>
                    <p className="text-sm text-gray-600">Free tier includes $5 in credits - enough for hundreds of health queries</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={openOpenRouter}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Get API Key
                    </Button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Add to Environment File</p>
                    <p className="text-sm text-gray-600 mb-2">Add this line to your <code className="bg-gray-100 px-1 rounded">.env</code> file:</p>
                    <div className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-sm">
                      VITE_OPENROUTER_API_KEY=sk-or-v1-your-key-here
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Restart & Enjoy</p>
                    <p className="text-sm text-gray-600">Restart the development server to activate AI responses</p>
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="mt-2"
                      onClick={handleRefresh}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh Page
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Why AI-Only Mode?</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                  <span><strong>Personalized Guidance:</strong> Responses tailored to your specific symptoms and history</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                  <span><strong>Current Information:</strong> Access to the latest natural health research and remedies</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                  <span><strong>Comprehensive Responses:</strong> Detailed explanations with safety considerations</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                  <span><strong>Interactive Experience:</strong> Follow-up questions and contextual recommendations</span>
                </li>
              </ul>
            </div>

            {/* Disclaimer */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Medical Disclaimer:</strong> HealthWise provides information about natural remedies and wellness practices. 
                For serious health concerns, always consult with qualified healthcare professionals.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIRequiredMessage;