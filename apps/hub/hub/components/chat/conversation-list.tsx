'use client';

import { useState } from 'react';
import { Plus, MessageSquare, Trash2, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { Conversation } from '@/lib/api/conversations';

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onCreateConversation: () => void;
  onDeleteConversation: (id: string) => void;
  isLoading?: boolean;
}

export function ConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onCreateConversation,
  onDeleteConversation,
  isLoading,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter((conv) =>
    conv.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    !conv.title
  );

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No messages';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <Button
          onClick={onCreateConversation}
          className="w-full justify-start"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Conversation
        </Button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-8"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && conversations.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
            Loading conversations...
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
            {searchQuery ? 'No conversations found' : 'No conversations yet'}
          </div>
        ) : (
          <div className="p-2">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={cn(
                  'group relative flex items-start gap-3 p-3 rounded-lg cursor-pointer',
                  'hover:bg-gray-100 dark:hover:bg-gray-800',
                  'transition-colors',
                  selectedConversationId === conversation.id &&
                    'bg-primary/10 hover:bg-primary/10 dark:bg-primary/20'
                )}
                onClick={() => onSelectConversation(conversation.id)}
              >
                <MessageSquare className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {conversation.title || 'New Conversation'}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          confirm(
                            'Are you sure you want to delete this conversation?'
                          )
                        ) {
                          onDeleteConversation(conversation.id);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 dark:text-red-400 shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(conversation.lastMessageAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

