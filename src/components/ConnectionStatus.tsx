import { useState, useEffect } from "react";
import { openRouterService } from "@/services/openRouterService";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, Zap, Settings } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ConnectionStatusProps {
  className?: string;
}

const ConnectionStatus = ({ className = "" }: ConnectionStatusProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isAIOnlyMode, setIsAIOnlyMode] = useState(false);

  useEffect(() => {
    const checkConnection = () => {
      setIsChecking(true);
      const connected = openRouterService.isConfigured();
      const aiOnly = import.meta.env.VITE_AI_ONLY_MODE === 'true';
      setIsConnected(connected);
      setIsAIOnlyMode(aiOnly);
      setIsChecking(false);
    };

    // Check immediately
    checkConnection();

    // Check every 30 seconds to detect env changes
    const interval = setInterval(checkConnection, 30000);

    return () => clearInterval(interval);
  }, []);

  if (isChecking) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Badge variant="secondary" className={`gap-1.5 ${className}`}>
                <Settings className="w-3 h-3 animate-spin" />
                <span className="text-xs">Checking...</span>
              </Badge>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Checking AI connection status...</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (isConnected) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Badge variant="default" className={`bg-green-500 hover:bg-green-600 gap-1.5 ${className}`}>
                <Zap className="w-3 h-3" />
                <span className="text-xs font-medium">AI Connected</span>
              </Badge>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm">
              <p className="font-medium">🤖 Live AI Responses</p>
              <p className="text-xs text-gray-300 mt-1">
                Using OpenRouter GPT-4o-mini<br />
                Real-time streaming enabled
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Show different states based on AI-only mode
  if (isAIOnlyMode && !isConnected) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Badge variant="destructive" className={`gap-1.5 ${className}`}>
                <WifiOff className="w-3 h-3" />
                <span className="text-xs font-medium">AI Required</span>
              </Badge>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm">
              <p className="font-medium">🚫 AI-Only Mode</p>
              <p className="text-xs text-gray-300 mt-1">
                Mock responses disabled<br />
                OpenRouter API key required
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <Badge variant="secondary" className={`bg-orange-100 text-orange-800 hover:bg-orange-200 gap-1.5 ${className}`}>
              <WifiOff className="w-3 h-3" />
              <span className="text-xs font-medium">Mock Mode</span>
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <p className="font-medium">📚 Mock Responses</p>
            <p className="text-xs text-gray-600 mt-1">
              Using built-in natural remedies<br />
              Add VITE_OPENROUTER_API_KEY to enable AI
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ConnectionStatus;