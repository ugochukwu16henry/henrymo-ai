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
        <div className="text-center max-w-md px-6">
          <div className="mb-6">
            <div className="h-16 w-16 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mb-4">
              <Bot className="h-8 w-8 text-white" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Start a conversation
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Send a message to begin chatting with ChatBoss. Ask questions, get help with coding, or explore ideas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        {messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            onDelete={onDeleteMessage}
          />
        ))}
        {isLoading && (
          <div className="flex items-center gap-4 px-6 py-5">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-sm">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
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

