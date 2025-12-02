'use client';

import { useState } from 'react';
import { Copy, Check, Trash2, User, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Message } from '@/lib/api/conversations';

interface MessageItemProps {
  message: Message;
  onDelete?: (messageId: string) => void;
}

export function MessageItem({ message, onDelete }: MessageItemProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = () => {
    if (onDelete && confirm('Are you sure you want to delete this message?')) {
      onDelete(message.id);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      className={cn(
        'group flex gap-4 p-4',
        isUser ? 'bg-gray-50 dark:bg-gray-800/50' : 'bg-white dark:bg-gray-900'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
        )}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {isUser ? 'You' : 'ChatBoss'}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatTime(message.createdAt)}
          </span>
        </div>

        {/* Message Content */}
        <div
          className={cn(
            'prose prose-sm dark:prose-invert max-w-none',
            'prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800',
            'prose-code:text-sm prose-code:font-mono',
            'prose-p:my-2 prose-p:leading-relaxed',
            'prose-ul:my-2 prose-ol:my-2',
            'prose-headings:my-3'
          )}
        >
          {isAssistant ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code: ({ node, inline, className, children, ...props }: any) => {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <pre className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  ) : (
                    <code
                      className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          ) : (
            <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
              {message.content}
            </p>
          )}
        </div>

        {/* Message Actions */}
        <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 px-2 text-xs"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 mr-1" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </>
            )}
          </Button>
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-7 px-2 text-xs text-red-600 hover:text-red-700 dark:text-red-400"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Delete
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

