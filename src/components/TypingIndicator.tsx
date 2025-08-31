import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot } from "lucide-react";

const TypingIndicator = () => {
  return (
    <div className="flex gap-3 mb-4">
      <Avatar className="w-8 h-8 mt-1">
        <AvatarFallback className="bg-green-100">
          <Bot className="w-4 h-4 text-green-600" />
        </AvatarFallback>
      </Avatar>
      
      <Card className="bg-white border shadow-sm p-4">
        <div className="flex items-center gap-1">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <span className="text-sm text-gray-500 ml-2">Analyzing your symptoms...</span>
        </div>
      </Card>
    </div>
  );
};

export default TypingIndicator;