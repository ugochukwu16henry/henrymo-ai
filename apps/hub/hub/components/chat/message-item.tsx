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
        'group flex gap-4 px-6 py-5 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors',
        isUser ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-900'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-sm',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-gradient-to-br from-purple-500 to-blue-500 text-white'
        )}
      >
        {isUser ? (
          <User className="h-5 w-5" />
        ) : (
          <Bot className="h-5 w-5" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {isUser ? 'You' : 'ChatBoss'}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {formatTime(message.createdAt)}
          </span>
        </div>

        {/* Message Content */}
        <div
          className={cn(
            'prose prose-sm dark:prose-invert max-w-none',
            'prose-pre:bg-gray-900 dark:prose-pre:bg-gray-950 prose-pre:text-gray-100',
            'prose-code:text-sm prose-code:font-mono prose-code:bg-gray-100 dark:prose-code:bg-gray-800',
            'prose-p:my-3 prose-p:leading-relaxed prose-p:text-gray-800 dark:prose-p:text-gray-200',
            'prose-ul:my-3 prose-ol:my-3',
            'prose-headings:my-4 prose-headings:text-gray-900 dark:prose-headings:text-gray-100',
            'prose-strong:text-gray-900 dark:prose-strong:text-gray-100',
            'prose-a:text-primary hover:prose-a:text-primary/80'
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
        <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-8 px-3 text-xs hover:bg-gray-100 dark:hover:bg-gray-800"
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
              className="h-8 px-3 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
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

