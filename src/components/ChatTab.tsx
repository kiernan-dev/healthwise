import { useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import TypingIndicator from "./TypingIndicator";
import WelcomeMessage from "./WelcomeMessage";
import AIRequiredMessage from "./AIRequiredMessage";
import RemedyCard from "./RemedyCard";
import EmergencyGuidance from "./EmergencyGuidance";
import ReactMarkdown from "react-markdown";
import { RemedyRecommendation } from "@/services/remedyService";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  recommendations?: RemedyRecommendation[];
  emergencySymptoms?: string[];
  severity?: number;
}

interface ChatTabProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  streamingMessage?: string;
  isStreaming?: boolean;
  showAIRequired?: boolean;
}

const ChatTab = ({ messages, isLoading, onSendMessage, streamingMessage, isStreaming, showAIRequired }: ChatTabProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, streamingMessage]);

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 && showAIRequired && <AIRequiredMessage />}
          {messages.length === 0 && !showAIRequired && <WelcomeMessage />}
          
          {messages.map((message) => (
            <div key={message.id}>
              <ChatMessage message={message} />
              
              {/* Show emergency guidance if needed */}
              {message.role === 'assistant' && (message.emergencySymptoms || message.severity) && (
                <div className="ml-11 mb-4">
                  <EmergencyGuidance 
                    symptoms={message.emergencySymptoms} 
                    severity={message.severity}
                  />
                </div>
              )}
              
              {/* Show remedy recommendations */}
              {message.recommendations && message.recommendations.length > 0 && (
                <div className="ml-11 mb-4">
                  <div className="space-y-3">
                    {message.recommendations.map((rec, index) => (
                      <RemedyCard
                        key={`${message.id}-remedy-${index}`}
                        remedy={rec.remedy}
                        relevanceScore={rec.relevanceScore}
                        reasoning={rec.reasoning}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {/* Show streaming message */}
          {isStreaming && streamingMessage && (
            <div className="flex gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                AI
              </div>
              <div className="flex-1 bg-white rounded-lg px-6 py-4 shadow-sm border border-gray-200">
                <div className="prose prose-sm max-w-none text-gray-800">
                  <ReactMarkdown 
                    components={{
                      h1: ({children}) => (
                        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mb-6 border border-green-200">
                          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2 m-0">
                            🌿 {children}
                          </h1>
                        </div>
                      ),
                      h2: ({children}) => (
                        <div className="bg-green-50 rounded-lg p-3 mb-4 border-l-4 border-green-400">
                          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 m-0">
                            💚 {children}
                          </h2>
                        </div>
                      ),
                      h3: ({children}) => (
                        <div className="bg-blue-50 rounded-md p-2 mb-3 border-l-3 border-blue-400">
                          <h3 className="text-base font-bold text-green-700 flex items-center gap-2 m-0">
                            ✨ {children}
                          </h3>
                        </div>
                      ),
                      strong: ({children}) => {
                        const text = children?.toString() || '';
                        // Add icons for common remedy names
                        const getIcon = (text: string) => {
                          if (text.includes('Peppermint')) return '🌿';
                          if (text.includes('Ginger')) return '🫚';
                          if (text.includes('Magnesium')) return '💊';
                          if (text.includes('Lavender')) return '💜';
                          if (text.includes('Usage')) return '📋';
                          if (text.includes('Evidence')) return '🔬';
                          if (text.includes('Precaution')) return '⚠️';
                          return '';
                        };
                        const icon = getIcon(text);
                        return (
                          <strong className="font-semibold text-green-800 inline-flex items-center gap-1">
                            {icon && <span>{icon}</span>}
                            {children}
                          </strong>
                        );
                      },
                      ul: ({children}) => <ul className="space-y-2 my-3">{children}</ul>,
                      ol: ({children}) => (
                        <ol className="space-y-4 my-4">
                          {children}
                        </ol>
                      ),
                      li: ({children, ...props}) => {
                        // Check if this is an ordered list item (main remedy cards)
                        const isNumbered = props.node?.parent?.tagName === 'ol';
                        
                        // Check if this is nested inside another li (sub-bullets)
                        let parentNode = props.node?.parent;
                        let isNested = false;
                        while (parentNode) {
                          if (parentNode.tagName === 'li') {
                            isNested = true;
                            break;
                          }
                          parentNode = parentNode.parent;
                        }
                        
                        if (isNumbered) {
                          // Main remedy cards - beautiful styling
                          return (
                            <li className="bg-gradient-to-r from-green-50 to-green-25 border border-green-200 rounded-xl p-5 shadow-sm mb-4 hover:shadow-md transition-shadow">
                              <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-full flex items-center justify-center font-bold text-base flex-shrink-0 shadow-sm">
                                  {props.index !== undefined ? props.index + 1 : '•'}
                                </div>
                                <div className="flex-1">{children}</div>
                              </div>
                            </li>
                          );
                        }
                        
                        if (isNested) {
                          // Nested bullets - clean, minimal styling
                          return (
                            <li className="flex items-start gap-2 text-gray-700 mb-1 ml-2">
                              <span className="text-green-500 font-medium mt-1 text-sm">•</span>
                              <span className="flex-1">{children}</span>
                            </li>
                          );
                        }
                        
                        // Check if this is a 2nd level item (Usage, Evidence Level, Precautions)
                        const parentLi = props.node?.parent?.parent;
                        const isSecondLevel = parentLi?.tagName === 'li';
                        
                        if (isSecondLevel) {
                          return (
                            <li className="flex items-start gap-2 text-gray-800 mb-1">
                              <span className="text-green-500 font-bold mt-1">•</span>
                              <span className="flex-1">{children}</span>
                            </li>
                          );
                        }
                        
                        // Check if this top-level item has sub-content
                        const hasSubItems = props.node?.children?.some(
                          (child: any) => child.tagName === 'ul'
                        );
                        
                        if (hasSubItems) {
                          // Top-level items with sub-items - hide bullet point
                          return (
                            <li className="text-gray-800 mb-3 bg-gray-50 rounded-lg p-3 border border-gray-100">
                              <div className="flex-1">{children}</div>
                            </li>
                          );
                        }
                        
                        // Regular top-level bullets - show bullet point
                        return (
                          <li className="flex items-start gap-2 text-gray-800 mb-3 bg-gray-50 rounded-lg p-3 border border-gray-100">
                            <span className="text-green-500 font-bold mt-1">•</span>
                            <span className="flex-1">{children}</span>
                          </li>
                        );
                      },
                      p: ({children}) => <p className="leading-relaxed text-gray-800 [&:not(:last-child)]:mb-4">{children}</p>,
                      code: ({children}) => (
                        <code className="bg-green-100 text-green-800 px-3 py-1 rounded-md font-mono text-sm border border-green-200 shadow-sm">
                          {children}
                        </code>
                      ),
                      blockquote: ({children}) => (
                        <blockquote className="border-l-4 border-blue-400 bg-gradient-to-r from-blue-50 to-blue-25 rounded-r-lg pl-4 pr-4 py-3 my-4 italic text-blue-800 shadow-sm">
                          💡 {children}
                        </blockquote>
                      )
                    }}
                  >
                    {streamingMessage}
                  </ReactMarkdown>
                  <span className="inline-block w-2 h-5 bg-blue-500 ml-1 animate-pulse" />
                </div>
              </div>
            </div>
          )}
          
          {isLoading && !isStreaming && <TypingIndicator />}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Chat Input */}
      <div className="bg-white border-t flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <ChatInput 
            onSendMessage={onSendMessage}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatTab;