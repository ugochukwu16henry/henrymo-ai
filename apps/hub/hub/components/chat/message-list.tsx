'use client';

import { useEffect, useRef } from 'react';
import { MessageItem } from './message-item';
import type { Message } from '@/lib/api/conversations';
import { Loader2, Bot } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  onDeleteMessage?: (messageId: string) => void;
}

export function MessageList({
  messages,
  isLoading,
  onDeleteMessage,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <p className="text-lg font-medium mb-2">Start a conversation</p>
          <p className="text-sm">Send a message to begin chatting with ChatBoss</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        {messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            onDelete={onDeleteMessage}
          />
        ))}
        {isLoading && (
          <div className="flex items-center gap-4 p-4">
            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <Bot className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </div>
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ChatBoss is thinking...
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

