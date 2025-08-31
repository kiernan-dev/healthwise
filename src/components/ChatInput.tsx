import { useState, useRef, DragEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Paperclip, X, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ChatInputProps {
  onSendMessage: (message: string, file?: File) => void;
  isLoading: boolean;
  disabled?: boolean;
}

const ChatInput = ({ onSendMessage, isLoading, disabled }: ChatInputProps) => {
  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((input.trim() || file) && !isLoading && !disabled) {
      onSendMessage(input.trim(), file || undefined);
      setInput("");
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      // Clear the file input in case the user wants to re-upload the same file
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div 
      className="p-4 border-t bg-white relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="absolute inset-0 bg-green-50 bg-opacity-80 backdrop-blur-sm flex flex-col items-center justify-center z-10 border-4 border-dashed border-green-400 rounded-lg pointer-events-none">
          <UploadCloud className="w-12 h-12 text-green-600" />
          <p className="mt-2 text-lg font-semibold text-green-700">Drop file to upload</p>
        </div>
      )}
      {file && (
        <div className="mb-2 flex items-center">
          <Badge variant="secondary" className="flex items-center gap-2">
            <span>{file.name}</span>
            <Button
              size="icon"
              variant="ghost"
              className="h-4 w-4"
              onClick={handleRemoveFile}
              aria-label="Remove file"
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative w-full">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your symptoms, health concern, or drop a file..."
            className="min-h-[60px] max-h-[120px] resize-none pr-12"
            disabled={disabled || isLoading}
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,audio/*,application/pdf"
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="absolute bottom-2 right-2"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || disabled}
            aria-label="Attach file"
          >
            <Paperclip className="w-4 h-4" />
          </Button>
        </div>
        <Button
          type="submit"
          size="icon"
          disabled={(!input.trim() && !file) || isLoading || disabled}
          className={cn(
            "h-[60px] w-[60px] shrink-0",
            "bg-green-600 hover:bg-green-700"
          )}
          aria-label="Send message"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </form>
    </div>
  );
};

export default ChatInput;