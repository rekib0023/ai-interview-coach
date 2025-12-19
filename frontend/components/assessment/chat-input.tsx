import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizontal, Mic } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, disabled, placeholder = "Type your answer..." }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  return (
    <div className="p-4 bg-background border-t">
      <div className="max-w-3xl mx-auto flex items-end gap-2 p-2 bg-secondary/30 rounded-xl border focus-within:ring-1 focus-within:ring-primary/50">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="min-h-[44px] max-h-[200px] w-full resize-none border-0 bg-transparent py-3 px-4 focus-visible:ring-0 shadow-none text-sm"
          disabled={disabled}
        />
        <div className="flex pb-2 pr-2 gap-1">
            <Button
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8 text-muted-foreground hover:text-foreground", disabled && "opacity-50")}
                disabled={disabled}
            >
                <Mic className="h-4 w-4" />
            </Button>
            <Button
                size="icon"
                className={cn("h-8 w-8 shrink-0", !input.trim() && "opacity-50")}
                onClick={handleSend}
                disabled={disabled || !input.trim()}
            >
                <SendHorizontal className="h-4 w-4" />
            </Button>
        </div>
      </div>
      <p className="text-center text-xs text-muted-foreground mt-2">
        AI can make mistakes. Consider checking important information.
      </p>
    </div>
  );
}
