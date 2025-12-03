'use client';

import { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MessageList } from './message-list';
import { InputArea } from './input-area';
import { ConversationList } from './conversation-list';
import { ConversationSettings } from './conversation-settings';
import { conversationsApi, type Conversation, type Message } from '@/lib/api/conversations';
import { aiApi } from '@/lib/api/ai';
import { toast } from 'sonner';

interface ChatInterfaceProps {
  initialConversationId?: string | null;
}

export function ChatInterface({ initialConversationId = null }: ChatInterfaceProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(
    initialConversationId
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Load conversations
  useEffect(() => {
    loadConversations();
  }, []);

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversationId) {
      loadMessages(selectedConversationId);
    } else {
      setMessages([]);
    }
  }, [selectedConversationId]);

  const loadConversations = async () => {
    try {
      setIsLoadingConversations(true);
      const response = await conversationsApi.listConversations({
        limit: 50,
        orderBy: 'last_message_at',
        order: 'DESC',
      });

      if (response.success && response.data) {
        setConversations(response.data);
        // Auto-select first conversation if none selected
        if (!selectedConversationId && response.data.length > 0) {
          setSelectedConversationId(response.data[0].id);
        }
      }
    } catch (error) {
      toast.error('Failed to load conversations');
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      setIsLoadingMessages(true);
      const response = await conversationsApi.getMessages(conversationId, {
        limit: 100,
        order: 'ASC',
      });

      if (response.success && response.data) {
        setMessages(response.data);
      }
    } catch (error) {
      toast.error('Failed to load messages');
      console.error('Error loading messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleCreateConversation = async () => {
    try {
      // Get available providers to set default model
      const providersResponse = await aiApi.getProviders();
      let defaultProvider = 'anthropic';
      let defaultModel: string | null = null;

      if (providersResponse.success && providersResponse.data && providersResponse.data.length > 0) {
        // Prefer Anthropic if available, otherwise use first available
        const anthropic = providersResponse.data.find((p) => p.id === 'anthropic');
        const selectedProvider = anthropic || providersResponse.data[0];
        defaultProvider = selectedProvider.id;
        defaultModel = selectedProvider.models[0] || null;
      }

      const response = await conversationsApi.createConversation({
        title: null,
        mode: 'general',
        provider: defaultProvider,
        model: defaultModel,
      });

      if (response.success && response.data) {
        const newConversation = response.data;
        setConversations((prev) => [newConversation, ...prev]);
        setSelectedConversationId(newConversation.id);
        setMessages([]);
      }
    } catch (error) {
      toast.error('Failed to create conversation');
      console.error('Error creating conversation:', error);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedConversationId) {
      // Create new conversation if none selected
      await handleCreateConversation();
      // Wait a bit for conversation to be created
      await new Promise((resolve) => setTimeout(resolve, 500));
      // Retry sending message
      if (selectedConversationId) {
        await sendMessageToConversation(selectedConversationId, content);
      }
      return;
    }

    await sendMessageToConversation(selectedConversationId, content);
  };

  const sendMessageToConversation = async (conversationId: string, content: string) => {
    try {
      setIsSending(true);

      // Get conversation to get provider/model settings
      const conversation = conversations.find((c) => c.id === conversationId);
      let provider = conversation?.provider || 'anthropic';
      let model = conversation?.model || undefined;

      // If model is not set, get default model for provider
      if (!model) {
        try {
          const providersResponse = await aiApi.getProviders();
          if (providersResponse.success && providersResponse.data) {
            const selectedProvider = providersResponse.data.find((p) => p.id === provider);
            if (selectedProvider && selectedProvider.models.length > 0) {
              model = selectedProvider.models[0];
              // Update conversation with default model
              if (conversation && !conversation.model) {
                await conversationsApi.updateConversation(conversationId, {
                  model,
                });
              }
            }
          }
        } catch (error) {
          console.error('Error getting default model:', error);
        }
      }

      // Create user message
      const userMessageResponse = await conversationsApi.createMessage(conversationId, {
        role: 'user',
        content,
      });

      if (!userMessageResponse.success || !userMessageResponse.data) {
        throw new Error('Failed to create user message');
      }

      const userMessage = userMessageResponse.data;
      setMessages((prev) => [...prev, userMessage]);

      // Prepare messages for AI (convert to chat format)
      const chatMessages = [
        ...messages.map((msg) => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content,
        })),
        { role: 'user' as const, content },
      ];

      // Create placeholder for assistant message
      const assistantMessageId = `temp-${Date.now()}`;
      const assistantMessage: Message = {
        id: assistantMessageId,
        conversationId,
        role: 'assistant',
        content: '',
        tokensUsed: null,
        cost: 0,
        provider: null,
        model: null,
        metadata: {},
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsStreaming(true);
      setStreamingMessageId(assistantMessageId);

      let fullContent = '';

      // Stream AI response
      await aiApi.streamChat(
        {
          provider,
          model,
          messages: chatMessages,
          conversationId,
        },
        (chunk: string) => {
          fullContent += chunk;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: fullContent }
                : msg
            )
          );
        },
        async (usage) => {
          // Save assistant message to database
          try {
            const savedMessageResponse = await conversationsApi.createMessage(conversationId, {
              role: 'assistant',
              content: fullContent,
              tokensUsed: usage.inputTokens + usage.outputTokens,
              cost: null, // Will be calculated on backend
              provider,
              model: model || undefined,
            });

            if (savedMessageResponse.success && savedMessageResponse.data) {
              // Replace temporary message with saved one
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMessageId
                    ? savedMessageResponse.data!
                    : msg
                )
              );
            } else {
              // If save fails, keep the temporary message
              console.error('Failed to save assistant message');
            }
          } catch (error) {
            console.error('Error saving assistant message:', error);
          }

          setIsStreaming(false);
          setStreamingMessageId(null);
          await loadConversations();
        },
        (error) => {
          toast.error(`AI Error: ${error}`);
          setIsStreaming(false);
          setStreamingMessageId(null);
          // Remove failed message
          setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessageId));
        }
      );
    } catch (error) {
      toast.error('Failed to send message');
      console.error('Error sending message:', error);
      setIsStreaming(false);
      setStreamingMessageId(null);
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      const response = await conversationsApi.deleteConversation(conversationId);

      if (response.success) {
        setConversations((prev) =>
          prev.filter((conv) => conv.id !== conversationId)
        );
        if (selectedConversationId === conversationId) {
          setSelectedConversationId(null);
          setMessages([]);
        }
        toast.success('Conversation deleted');
      }
    } catch (error) {
      toast.error('Failed to delete conversation');
      console.error('Error deleting conversation:', error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!selectedConversationId) return;

    try {
      const response = await conversationsApi.deleteMessage(
        selectedConversationId,
        messageId
      );

      if (response.success) {
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
        await loadMessages(selectedConversationId);
        await loadConversations();
        toast.success('Message deleted');
      }
    } catch (error) {
      toast.error('Failed to delete message');
      console.error('Error deleting message:', error);
    }
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-80 shrink-0">
        <ConversationList
          conversations={conversations}
          selectedConversationId={selectedConversationId}
          onSelectConversation={setSelectedConversationId}
          onCreateConversation={handleCreateConversation}
          onDeleteConversation={handleDeleteConversation}
          isLoading={isLoadingConversations}
        />
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        {selectedConversationId && (
          <div className="border-b border-gray-200 dark:border-gray-800 px-4 py-2 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {conversations.find((c) => c.id === selectedConversationId)?.title ||
                  'New Conversation'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {(() => {
                  const conv = conversations.find((c) => c.id === selectedConversationId);
                  const provider = conv?.provider || 'anthropic';
                  const model = conv?.model || 'Select model';
                  return `${provider} • ${model}`;
                })()}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Messages */}
        <MessageList
          messages={messages}
          isLoading={isStreaming}
          onDeleteMessage={handleDeleteMessage}
        />

        {/* Input */}
        <InputArea
          onSend={handleSendMessage}
          isLoading={isSending || isStreaming}
          disabled={!selectedConversationId && conversations.length === 0}
        />
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <ConversationSettings
          conversation={
            selectedConversationId
              ? conversations.find((c) => c.id === selectedConversationId) || null
              : null
          }
          onUpdate={() => {
            loadConversations();
            if (selectedConversationId) {
              loadMessages(selectedConversationId);
            }
          }}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

