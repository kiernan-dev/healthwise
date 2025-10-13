import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import ChatTab from "./ChatTab";
import TrackerTab from "./TrackerTab";
import InsightsTab from "./InsightsTab";
import { DataManagement } from "./DataManagement";
import LeftSidebar from "./LeftSidebar";
import { nlpService } from "@/services/nlpService";
import { responseService } from "@/services/responseService";
import { symptomStorageService, SymptomEntry } from "@/services/symptomStorageService";
import { chatStorageService, StoredMessage, ChatSession } from "@/services/chatStorageService";
import { RemedyRecommendation } from "@/services/remedyService";
import { showError, showSuccess } from "@/utils/toast";
import { History } from "lucide-react";
import ConnectionStatus from "./ConnectionStatus";
import AIRequiredMessage from "./AIRequiredMessage";
import { openRouterService } from "@/services/openRouterService";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { ImperativePanelHandle } from "react-resizable-panels";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  recommendations?: RemedyRecommendation[];
  emergencySymptoms?: string[];
  severity?: number;
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeView, setActiveView] = useState<'chat' | 'tracker' | 'insights' | 'settings'>('chat');
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Collapse sidebar by default on mobile screens
    return window.innerWidth < 768;
  });
  const [apiValidationStatus, setApiValidationStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const sidebarRef = useRef<ImperativePanelHandle>(null);

  const isAIOnlyMode = () => {
    return import.meta.env.VITE_AI_ONLY_MODE === 'true';
  };

  const isAIRequired = () => {
    return isAIOnlyMode() && apiValidationStatus === 'failed';
  };

  useEffect(() => {
    const sidebar = sidebarRef.current;
    if (sidebar) {
      if (isCollapsed) {
        sidebar.collapse();
      } else {
        sidebar.expand();
      }
    }
  }, [isCollapsed]);

  // Handle window resize to auto-collapse sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      if (isMobile && !isCollapsed) {
        setIsCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isCollapsed]);

  // Perform initial API handshake
  useEffect(() => {
    const performHandshake = async () => {
      if (!openRouterService.isConfigured()) {
        setApiValidationStatus('failed');
        return;
      }
      
      try {
        const isValid = await openRouterService.validateApiKey();
        setApiValidationStatus(isValid ? 'success' : 'failed');
      } catch {
        setApiValidationStatus('failed');
      }
    };

    performHandshake();
  }, []);

  // Load sessions and current session on mount
  useEffect(() => {
    const allSessions = chatStorageService.getAllSessions();
    setSessions(allSessions);

    let session = chatStorageService.getCurrentSession();
    if (!session && allSessions.length > 0) {
      session = allSessions[0];
      chatStorageService.setCurrentSession(session.id);
    } else if (!session && allSessions.length === 0) {
      session = chatStorageService.createNewSession();
      setSessions([session]);
    }
    
    if (session) {
      setCurrentSession(session);
      setMessages(session.messages);
    }
  }, []);

  const loadSession = (sessionId: string) => {
    const session = chatStorageService.getSession(sessionId);
    if (session) {
      setCurrentSession(session);
      setMessages(session.messages);
      chatStorageService.setCurrentSession(sessionId);
      setActiveView('chat');
    }
  };

  const saveMessageToHistory = (message: Message) => {
    const storedMessage: StoredMessage = {
      id: message.id,
      content: message.content,
      role: message.role,
      timestamp: message.timestamp,
      recommendations: message.recommendations,
      emergencySymptoms: message.emergencySymptoms,
      severity: message.severity
    };
    chatStorageService.saveMessage(storedMessage);
    // Refresh sessions list
    setSessions(chatStorageService.getAllSessions());
  };

  const handleSendMessage = async (content: string, file?: File) => {
    if (!content.trim() && !file) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content,
      role: 'user',
      timestamp: new Date(),
      // We can add file metadata here if needed
    };

    setMessages(prev => [...prev, userMessage]);
    saveMessageToHistory(userMessage);
    setIsLoading(true);

    try {
      const isHistoryRequest = !file && (content.toLowerCase().includes('history') || 
                             content.toLowerCase().includes('tracked') ||
                             content.toLowerCase().includes('logged') ||
                             content.toLowerCase().includes('pattern'));
      
      await new Promise(resolve => setTimeout(resolve, 500)); // Shorter delay

      let response;
      let assistantMessage: Message;
      
      if (isHistoryRequest) {
        const historySummary = symptomStorageService.generateSummaryForChat();
        assistantMessage = {
          id: (Date.now() + 1).toString(),
          content: `Here's your symptom tracking history:\n\n${historySummary}\n\nBased on this data, I can provide more targeted recommendations. Would you like me to analyze any specific patterns or suggest remedies for your most common symptoms?`,
          role: 'assistant',
          timestamp: new Date()
        };
      } else {
        const processedInput = nlpService.processInput(content || "Image analysis request");
        const emergencySymptoms = processedInput.intent.entities.symptoms;
        const severity = processedInput.intent.entities.severity === 'severe' ? 9 : 
                        processedInput.intent.entities.severity === 'moderate' ? 5 : 3;
        
        const recentSymptoms = symptomStorageService.getRecentSymptoms(7);
        const recentSymptomsText = recentSymptoms.length > 0 
          ? recentSymptoms.slice(0, 3).map(entry => 
              `${entry.symptom} (${entry.severity}/10) on ${entry.timestamp.toLocaleDateString()}`
            ).join(', ')
          : undefined;
        
        setIsStreaming(true);
        setStreamingMessage('');
        
        const streamingResponse = await responseService.generateStreamingResponse(
          processedInput,
          (chunk: string) => {
            setStreamingMessage(prev => prev + chunk);
          },
          recentSymptomsText,
          file
        );
        
        setIsStreaming(false);
        response = streamingResponse;
        
        if (!file && recentSymptoms.length > 0 && processedInput.intent.type === 'symptom') {
          const relatedHistory = recentSymptoms.filter(entry => 
            processedInput.intent.entities.symptoms.some(symptom => 
              entry.symptom.toLowerCase().includes(symptom.toLowerCase())
            )
          );
          
          if (relatedHistory.length > 0) {
            response.content += `\n\n**Based on your symptom history:**\nI notice you've logged similar symptoms before. Your recent entries show:\n`;
            relatedHistory.slice(0, 2).forEach((entry, index) => {
              response.content += `• ${entry.symptom} (${entry.severity}/10) on ${entry.timestamp.toLocaleDateString()}\n`;
            });
            response.content += `\nThis pattern information helps me provide more personalized recommendations.`;
          }
        }
        
        assistantMessage = {
          id: (Date.now() + 1).toString(),
          content: response.content,
          role: 'assistant',
          timestamp: new Date(),
          recommendations: response.recommendations,
          emergencySymptoms: emergencySymptoms,
          severity: severity
        };
      }

      setMessages(prev => [...prev, assistantMessage]);
      saveMessageToHistory(assistantMessage);
      
      setStreamingMessage('');
      setIsStreaming(false);

      if (response && response.followUpQuestions && response.followUpQuestions.length > 0) {
        setTimeout(() => {
          const followUpMessage: Message = {
            id: (Date.now() + 2).toString(),
            content: `**Follow-up questions to help me provide better recommendations:**\n\n${response.followUpQuestions!.map((q, i) => `${i + 1}. ${q}`).join('\n')}`,
            role: 'assistant',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, followUpMessage]);
          saveMessageToHistory(followUpMessage);
        }, 1000);
      }

      if (!isHistoryRequest) {
        showSuccess("I've analyzed your message and found relevant recommendations!");
      }

    } catch (error) {
      console.error('Error processing message:', error);
      showError('Sorry, I encountered an error processing your message. Please try again.');
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I apologize, but I encountered an error processing your request. Please try rephrasing your question or contact support if the issue persists.",
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      saveMessageToHistory(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSymptomLogged = (entry: SymptomEntry) => {
    showSuccess("Symptom logged successfully!");
    setActiveView('chat');
    
    let symptomMessage = `I just logged a symptom in my tracker:\n\n`;
    symptomMessage += `**Symptom:** ${entry.symptom}\n`;
    symptomMessage += `**Severity:** ${entry.severity}/10\n`;
    symptomMessage += `**Time:** ${entry.timestamp.toLocaleString()}\n`;
    
    if (entry.triggers && entry.triggers.length > 0) {
      symptomMessage += `**Triggers:** ${entry.triggers.join(', ')}\n`;
    }
    
    if (entry.notes) {
      symptomMessage += `**Notes:** ${entry.notes}\n`;
    }
    
    symptomMessage += `\nCan you provide recommendations for this symptom and check if there are any patterns with my previous entries?`;
    
    handleSendMessage(symptomMessage);
  };

  const handleShowHistory = () => {
    const symptomSummary = symptomStorageService.generateSummaryForChat();
    const historyMessage = `Please analyze my symptom history and identify any patterns, trends, or insights:\n\n${symptomSummary}`;
    setActiveView('chat');
    handleSendMessage(historyMessage);
  };

  const startNewChat = () => {
    const newSession = chatStorageService.createNewSession();
    setSessions(chatStorageService.getAllSessions());
    setCurrentSession(newSession);
    setMessages([]);
    setActiveView('chat');
    showSuccess("Started new chat");
  };

  const handleDeleteSession = (sessionId: string) => {
    chatStorageService.deleteSession(sessionId);
    const remainingSessions = chatStorageService.getAllSessions();
    setSessions(remainingSessions);

    if (currentSession?.id === sessionId) {
      if (remainingSessions.length > 0) {
        loadSession(remainingSessions[0].id);
      } else {
        startNewChat();
      }
    }
    showSuccess("Chat deleted");
  };

  const handleUpdateSessionTitle = (sessionId: string, newTitle: string) => {
    chatStorageService.updateSessionTitle(sessionId, newTitle);
    setSessions(chatStorageService.getAllSessions());
    if (currentSession?.id === sessionId) {
      setCurrentSession(prev => prev ? { ...prev, title: newTitle } : null);
    }
    showSuccess("Chat renamed");
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'tracker':
        return <TrackerTab onSymptomLogged={handleSymptomLogged} />;
      case 'insights':
        return <InsightsTab />;
      case 'settings':
        return (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <DataManagement />
            </div>
          </div>
        );
      case 'chat':
      default:
        if (apiValidationStatus === 'loading') {
          return (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Connecting to AI service...</p>
              </div>
            </div>
          );
        }
        return (
          <ChatTab 
            messages={messages}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            streamingMessage={streamingMessage}
            isStreaming={isStreaming}
            showAIRequired={isAIRequired()}
          />
        );
    }
  };

  const symptomCount = symptomStorageService.getSymptoms().length;

  return (
    <div className="relative">
      {/* Mobile overlay when sidebar is expanded */}
      {!isCollapsed && window.innerWidth < 768 && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}
      
      <ResizablePanelGroup direction="horizontal" className="h-screen md:h-screen w-full bg-gray-50" style={{ height: '100vh', minHeight: '100vh' }}>
      <ResizablePanel
        ref={sidebarRef}
        collapsible
        collapsedSize={4}
        defaultSize={window.innerWidth < 768 ? 4 : 20}
        minSize={15}
        maxSize={50}
        onCollapse={() => setIsCollapsed(true)}
        onExpand={() => setIsCollapsed(false)}
        className={cn("min-w-[64px]", isCollapsed && "transition-all duration-300 ease-in-out")}
      >
        <LeftSidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          sessions={sessions}
          currentSessionId={currentSession?.id || null}
          onSessionSelect={loadSession}
          onNewChat={startNewChat}
          onNavigate={setActiveView}
          onDeleteSession={handleDeleteSession}
          onUpdateSessionTitle={handleUpdateSessionTitle}
          activeView={activeView}
        />
      </ResizablePanel>
      <ResizableHandle withHandle className="hidden md:flex" />
      <ResizablePanel defaultSize={window.innerWidth < 768 ? 96 : 80}>
        <div className="flex flex-col h-full">
          {/* Header - Hidden on mobile */}
          <div className="hidden md:block bg-white border-b px-4 md:px-6 py-3 md:py-4 shadow-sm flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 md:gap-3">
                  <h1 className="text-lg md:text-xl font-semibold text-gray-800">HealthWise</h1>
                  <div className="hidden md:block">
                    <ConnectionStatus />
                  </div>
                </div>
                <p className="text-xs md:text-sm text-gray-600">
                  {currentSession && activeView === 'chat' ? currentSession.title : "Your natural health assistant"}
                  {symptomCount > 0 && (
                    <span className="ml-2 text-blue-600">• {symptomCount} symptoms tracked</span>
                  )}
                </p>
              </div>
              
              <div className="flex gap-2">
                {symptomCount > 0 && (
                  <Button variant="outline" size="sm" onClick={handleShowHistory} className="hidden sm:flex">
                    <History className="w-4 h-4 mr-1" />
                    Analyze History
                  </Button>
                )}
                {symptomCount > 0 && (
                  <Button variant="outline" size="sm" onClick={handleShowHistory} className="sm:hidden">
                    <History className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <main className="flex-1 flex flex-col min-h-0">
            {renderActiveView()}
          </main>
        </div>
      </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default ChatInterface;