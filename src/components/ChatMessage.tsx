import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { User, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  message: {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
  };
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={cn(
      "flex gap-3 mb-4",
      isUser ? "justify-end" : "justify-start"
    )}>
      {!isUser && (
        <Avatar className="w-8 h-8 mt-1">
          <AvatarFallback className="bg-green-100">
            <Bot className="w-4 h-4 text-green-600" />
          </AvatarFallback>
        </Avatar>
      )}
      
      <Card className={cn(
        "max-w-[80%] p-4",
        isUser 
          ? "bg-blue-600 text-white" 
          : "bg-white border shadow-sm"
      )}>
        <div className="text-sm leading-relaxed prose prose-sm max-w-none">
          {isUser ? (
            <div className="whitespace-pre-wrap">{message.content}</div>
          ) : (
            <ReactMarkdown 
              components={{
                h1: ({children}) => (
                  <h1 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    {children}
                  </h1>
                ),
                h2: ({children}) => (
                  <h2 className="text-lg font-semibold text-gray-800 mb-3 mt-4">
                    {children}
                  </h2>
                ),
                h3: ({children}) => (
                  <h3 className="text-base font-semibold text-green-700 mb-2 mt-3">
                    {children}
                  </h3>
                ),
                strong: ({children}) => {
                  return (
                    <strong className="font-semibold text-gray-900">
                      {children}
                    </strong>
                  );
                },
                ul: ({children}) => <ul className="space-y-2 my-3 pl-5">{children}</ul>,
                ol: ({children}) => (
                  <ol className="space-y-4 my-4 list-none pl-0">
                    {children}
                  </ol>
                ),
                li: ({children, ...props}) => {
                  const isNumbered = props.node?.parent?.tagName === 'ol';

                  if (isNumbered) {
                    return (
                      <li className="bg-gradient-to-r from-gray-50 to-white border border-gray-200/80 rounded-xl p-4 shadow-sm mb-4 hover:shadow-md transition-shadow duration-300 ease-in-out">
                        <div className="flex items-start gap-4">
                          <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-teal-500 text-white rounded-full flex items-center justify-center font-bold text-base flex-shrink-0 shadow-sm">
                            {props.index !== undefined ? props.index + 1 : '•'}
                          </div>
                          <div className="flex-1 pt-1">{children}</div>
                        </div>
                      </li>
                    );
                  }
                  
                  return (
                    <li className="flex items-start gap-3 text-gray-700 mb-2">
                      <span className="w-4 h-4 text-green-500 mt-1 flex-shrink-0">•</span>
                      <span className="flex-1">{children}</span>
                    </li>
                  );
                },
                p: ({children}) => <p className="leading-relaxed text-gray-700 [&:not(:last-child)]:mb-4">{children}</p>,
                code: ({children}) => (
                  <code className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md font-mono text-sm border border-gray-200">
                    {children}
                  </code>
                ),
                blockquote: ({children}) => (
                  <blockquote className="border-l-4 border-blue-400 bg-blue-50 rounded-r-lg pl-4 pr-4 py-3 my-4 text-blue-800">
                    <span className="font-bold">Tip:</span> {children}
                  </blockquote>
                )
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>
        <div className={cn(
          "text-xs mt-2 opacity-70",
          isUser ? "text-blue-100" : "text-gray-500"
        )}>
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </Card>
      
      {isUser && (
        <Avatar className="w-8 h-8 mt-1">
          <AvatarFallback className="bg-blue-100">
            <User className="w-4 h-4 text-blue-600" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default ChatMessage;