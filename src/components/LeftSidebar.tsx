import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatSession } from "@/services/chatStorageService";
import { Plus, MessageSquare, Search, BarChart3, TrendingUp, Settings, PanelLeftClose, PanelLeftOpen, Trash2, MoreHorizontal, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import SearchModal from "./SearchModal";
import ConnectionStatus from "./ConnectionStatus";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

interface LeftSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  onNewChat: () => void;
  onNavigate: (view: 'chat' | 'tracker' | 'insights' | 'settings') => void;
  onDeleteSession: (sessionId: string) => void;
  onUpdateSessionTitle: (sessionId: string, newTitle: string) => void;
  activeView: 'chat' | 'tracker' | 'insights' | 'settings';
}

const LeftSidebar = ({
  isCollapsed,
  setIsCollapsed,
  sessions,
  currentSessionId,
  onSessionSelect,
  onNewChat,
  onNavigate,
  onDeleteSession,
  onUpdateSessionTitle,
  activeView
}: LeftSidebarProps) => {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingSessionId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [editingSessionId]);

  const handleRenameSubmit = () => {
    if (editingSessionId && renameValue.trim()) {
      onUpdateSessionTitle(editingSessionId, renameValue.trim());
    }
    setEditingSessionId(null);
  };

  interface NavButtonProps {
    view: string;
    activeView?: 'chat' | 'tracker' | 'insights' | 'settings';
    onNavigate: (view: 'chat' | 'tracker' | 'insights' | 'settings') => void;
    children: React.ReactNode;
    tooltipText: string;
  }

  const NavButton = ({ view, activeView, onNavigate, children, tooltipText }: NavButtonProps) => {
    const isActive = activeView === view;
    const button = (
      <Button
        variant="ghost"
        onClick={() => onNavigate(view)}
        className={cn(
          "w-full flex items-center", 
          isCollapsed ? "justify-center" : "justify-start",
          isActive
            ? "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 font-semibold hover:bg-green-100 dark:hover:bg-green-900/40"
            : "hover:bg-gray-200 dark:hover:bg-gray-800"
        )}
      >
        {children}
      </Button>
    );

    if (isCollapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent side="right"><p>{tooltipText}</p></TooltipContent>
        </Tooltip>
      );
    }
    return button;
  };

  return (
    <>
      <div className="flex flex-col bg-gray-100 dark:bg-gray-900 border-r h-full relative z-50">
        <div className="p-2 flex-shrink-0">
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className="group relative mx-auto flex h-12 w-12 md:h-10 md:w-10 cursor-pointer items-center justify-center rounded-full touch-manipulation"
                  onClick={() => setIsCollapsed(false)}
                >
                  <div className="flex h-12 w-12 md:h-10 md:w-10 items-center justify-center rounded-full bg-green-100 group-hover:hidden">
                    <span className="text-xl md:text-lg font-semibold text-green-600">🌿</span>
                  </div>
                  <div className="hidden h-12 w-12 md:h-10 md:w-10 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800 group-hover:flex">
                    <PanelLeftOpen className="h-6 w-6 md:h-5 md:w-5" />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right"><p>Expand</p></TooltipContent>
            </Tooltip>
          ) : (
            <div className="flex items-center justify-between">
              <div className="ml-2 flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <span className="text-lg font-semibold text-green-600">🌿</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(true)} className="h-10 w-10">
                <PanelLeftClose className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>

        <div className="p-2 flex-shrink-0">
          <NavButton view="new-chat" onNavigate={onNewChat} tooltipText="New Chat">
            <Plus className="w-4 h-4" />
            {!isCollapsed && <span className="ml-2">New Chat</span>}
          </NavButton>
        </div>

        <div className="p-2 flex-shrink-0">
          <NavButton view="search" onNavigate={() => setIsSearchModalOpen(true)} tooltipText="Search chats...">
            <Search className="w-4 h-4" />
            {!isCollapsed && <span className="ml-2 text-muted-foreground font-normal">Search chats...</span>}
          </NavButton>
        </div>
        
        <nav className="flex flex-col p-2 gap-1 flex-shrink-0">
          <NavButton view="tracker" activeView={activeView} onNavigate={onNavigate} tooltipText="Tracker">
            <TrendingUp className="w-4 h-4" />
            {!isCollapsed && <span className="ml-2">Tracker</span>}
          </NavButton>
          <NavButton view="insights" activeView={activeView} onNavigate={onNavigate} tooltipText="Insights">
            <BarChart3 className="w-4 h-4" />
            {!isCollapsed && <span className="ml-2">Insights</span>}
          </NavButton>
        </nav>

        {!isCollapsed && (
          <>
            <h2 className="px-4 pt-2 text-sm font-semibold text-muted-foreground">Chats</h2>
            <ScrollArea className="flex-grow p-2">
              <div className="flex flex-col gap-1">
                {sessions.map(session => (
                  <div key={session.id} className="group relative">
                    <Button
                      variant="ghost"
                      onClick={() => onSessionSelect(session.id)}
                      className={cn(
                        "w-full flex items-center justify-start text-left truncate pr-8",
                        currentSessionId === session.id && activeView === 'chat'
                          ? "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 font-semibold hover:bg-green-100 dark:hover:bg-green-900/40"
                          : "hover:bg-gray-200 dark:hover:bg-gray-800"
                      )}
                    >
                      <MessageSquare className="w-4 h-4 flex-shrink-0" />
                      {editingSessionId === session.id ? (
                        <Input
                          ref={renameInputRef}
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onBlur={handleRenameSubmit}
                          onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit()}
                          className="h-7 ml-2"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span className="ml-2 truncate">{session.title}</span>
                      )}
                    </Button>
                    {editingSessionId !== session.id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1 h-7 w-7 opacity-0 group-hover:opacity-100"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onSelect={() => {
                              setEditingSessionId(session.id);
                              setRenameValue(session.title);
                            }}
                          >
                            <Pencil className="w-4 h-4 mr-2" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onSelect={() => onDeleteSession(session.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </>
        )}
        
        {/* Settings */}
        <div className="p-2 flex-shrink-0 border-t">
          <NavButton view="settings" activeView={activeView} onNavigate={onNavigate} tooltipText="Settings">
            <Settings className={cn("w-4 h-4", isCollapsed && "w-6 h-6 md:w-4 md:h-4")} />
            {!isCollapsed && <span className="ml-2">Settings</span>}
          </NavButton>
        </div>
        
        {/* Connection Status - ABSOLUTE BOTTOM */}
        {isCollapsed && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center md:hidden">
            <ConnectionStatus className="" />
          </div>
        )}
      </div>
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        sessions={sessions}
        onSessionSelect={onSessionSelect}
      />
    </>
  );
};

export default LeftSidebar;