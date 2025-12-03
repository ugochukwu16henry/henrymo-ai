'use client';

import { useState, useEffect } from 'react';
import { Settings, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { conversationsApi, type Conversation } from '@/lib/api/conversations';
import { aiApi, type AIProvider } from '@/lib/api/ai';
import { toast } from 'sonner';

interface ConversationSettingsProps {
  conversation: Conversation | null;
  onUpdate: () => void;
  onClose: () => void;
}

export function ConversationSettings({
  conversation,
  onUpdate,
  onClose,
}: ConversationSettingsProps) {
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    title: conversation?.title || '',
    mode: conversation?.mode || 'general',
    provider: conversation?.provider || 'anthropic',
    model: conversation?.model || '',
    temperature: 1.0,
  });

  useEffect(() => {
    loadProviders();
  }, []);

  useEffect(() => {
    // Update settings when conversation changes
    if (conversation) {
      setSettings({
        title: conversation.title || '',
        mode: conversation.mode || 'general',
        provider: conversation.provider || 'anthropic',
        model: conversation.model || '',
        temperature: 1.0,
      });
    }
  }, [conversation]);

  const loadProviders = async () => {
    try {
      const response = await aiApi.getProviders();
      if (response.success && response.data) {
        setProviders(response.data);
        // Set default model if not set
        if (!settings.model && response.data.length > 0) {
          const defaultProvider = response.data.find((p) => p.id === settings.provider);
          if (defaultProvider && defaultProvider.models.length > 0) {
            const defaultModel = defaultProvider.models[0];
            setSettings((prev) => ({
              ...prev,
              model: defaultModel,
            }));
            // Also update conversation if it exists
            if (conversation && !conversation.model) {
              conversationsApi.updateConversation(conversation.id, {
                model: defaultModel,
              }).catch(console.error);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading providers:', error);
    }
  };

  const handleSave = async () => {
    if (!conversation) return;

    try {
      setIsLoading(true);
      const response = await conversationsApi.updateConversation(conversation.id, {
        title: settings.title || null,
        mode: settings.mode as any,
        provider: settings.provider,
        model: settings.model || null,
      });

      if (response.success) {
        toast.success('Settings updated');
        onUpdate();
        onClose();
      } else {
        toast.error('Failed to update settings');
      }
    } catch (error) {
      toast.error('Failed to update settings');
      console.error('Error updating settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedProvider = providers.find((p) => p.id === settings.provider);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Conversation Settings
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title
            </label>
            <Input
              value={settings.title}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Conversation title"
            />
          </div>

          {/* Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mode
            </label>
            <select
              value={settings.mode}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, mode: e.target.value as any }))
              }
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
            >
              <option value="general">General</option>
              <option value="developer">Developer</option>
              <option value="learning">Learning</option>
              <option value="business">Business</option>
            </select>
          </div>

          {/* Provider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              AI Provider
            </label>
            <select
              value={settings.provider}
              onChange={(e) => {
                const newProvider = e.target.value;
                const provider = providers.find((p) => p.id === newProvider);
                setSettings((prev) => ({
                  ...prev,
                  provider: newProvider,
                  model: provider?.models[0] || '',
                }));
              }}
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
            >
              {providers.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.name}
                </option>
              ))}
            </select>
          </div>

          {/* Model */}
          {selectedProvider && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Model
              </label>
              <select
                value={settings.model}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, model: e.target.value }))
                }
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              >
                {selectedProvider.models.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Stats */}
          {conversation && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Messages</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {conversation.messageCount}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Tokens</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {conversation.totalTokensUsed.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Cost</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    ${conversation.totalCost.toFixed(4)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading} className="flex-1">
            Save
          </Button>
        </div>
      </Card>
    </div>
  );
}

