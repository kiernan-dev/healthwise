import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChatSession } from "@/services/chatStorageService";
import { Search, MessageSquare } from "lucide-react";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  onSessionSelect: (sessionId: string) => void;
}

const SearchModal = ({ isOpen, onClose, sessions, onSessionSelect }: SearchModalProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSessions, setFilteredSessions] = useState<ChatSession[]>(sessions);

  useEffect(() => {
    if (searchTerm) {
      setFilteredSessions(
        sessions.filter(session =>
          session.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredSessions(sessions);
    }
  }, [searchTerm, sessions]);

  const handleSelect = (sessionId: string) => {
    onSessionSelect(sessionId);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Search Chats</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by chat title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <ScrollArea className="h-[300px] mt-4">
          <div className="flex flex-col gap-2 pr-4">
            {filteredSessions.length > 0 ? (
              filteredSessions.map(session => (
                <Button
                  key={session.id}
                  variant="ghost"
                  onClick={() => handleSelect(session.id)}
                  className="w-full flex items-center justify-start text-left"
                >
                  <MessageSquare className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{session.title}</span>
                </Button>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No chats found.
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default SearchModal;