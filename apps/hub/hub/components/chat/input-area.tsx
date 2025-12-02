'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface InputAreaProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export function InputArea({
  onSend,
  isLoading = false,
  disabled = false,
  placeholder = 'Type your message...',
}: InputAreaProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading && !disabled) {
      onSend(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-4">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled || isLoading}
              rows={1}
              className={cn(
                'w-full resize-none rounded-lg border border-gray-300 dark:border-gray-700',
                'bg-white dark:bg-gray-800',
                'px-4 py-3 pr-12',
                'text-sm text-gray-900 dark:text-gray-100',
                'placeholder:text-gray-500 dark:placeholder:text-gray-400',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'max-h-32 overflow-y-auto'
              )}
            />
          </div>
          <Button
            type="submit"
            disabled={!message.trim() || isLoading || disabled}
            size="icon"
            className="h-10 w-10 shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </form>
    </div>
  );
}

