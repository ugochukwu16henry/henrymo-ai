'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Key,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Plus,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { apiKeysApi, type ApiKey, type ApiPlan } from '@/lib/api/apiKeys';
import { useAuthStore } from '@/store/auth-store';

export default function ApiKeysPage() {
  const { user } = useAuthStore();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [plans, setPlans] = useState<ApiPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [newKeyName, setNewKeyName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [keysResponse, plansResponse] = await Promise.all([
        apiKeysApi.getApiKeys(),
        apiKeysApi.getApiPlans(),
      ]);

      if (keysResponse.success && keysResponse.data) {
        setApiKeys(keysResponse.data);
      }

      if (plansResponse.success && plansResponse.data) {
        setPlans(plansResponse.data);
      }
    } catch (error) {
      toast.error('Failed to load API keys');
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      toast.error('Please enter a key name');
      return;
    }

    try {
      setIsCreating(true);
      const response = await apiKeysApi.createApiKey({ keyName: newKeyName.trim() });

      if (response.success && response.data) {
        toast.success('API key created successfully! Save it now - it won\'t be shown again.');
        setNewKeyName('');
        setShowCreateForm(false);
        setShowKey({ [response.data.id]: true });
        await loadData();
      } else {
        toast.error(response.error || 'Failed to create API key');
      }
    } catch (error) {
      toast.error('Failed to create API key');
      console.error('Error creating key:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await apiKeysApi.revokeApiKey(keyId);

      if (response.success) {
        toast.success('API key revoked');
        await loadData();
      } else {
        toast.error(response.error || 'Failed to revoke API key');
      }
    } catch (error) {
      toast.error('Failed to revoke API key');
      console.error('Error revoking key:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const getCurrentPlan = () => {
    return plans.find((p) => p.name === 'Free') || plans[0];
  };

  const currentPlan = getCurrentPlan();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Key className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                API Keys Management
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Create and manage API keys to integrate HenryMo AI into your applications
              </p>
            </div>
            <Button onClick={() => setShowCreateForm(!showCreateForm)} className="shadow-lg">
              <Plus className="h-4 w-4 mr-2" />
              Create API Key
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-6">
        {/* Current Plan Info */}
        {currentPlan && (
          <Card className="border-l-4 border-l-blue-500 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Current Plan: {currentPlan.name}
              </CardTitle>
              <CardDescription>
                {currentPlan.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Rate Limit</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {currentPlan.rate_limit_per_minute}/min
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Daily Limit</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {currentPlan.rate_limit_per_day.toLocaleString()}/day
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Monthly Limit</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {currentPlan.rate_limit_per_month.toLocaleString()}/month
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create Key Form */}
        {showCreateForm && (
          <Card className="shadow-lg border-2 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle>Create New API Key</CardTitle>
              <CardDescription>
                Generate a new API key for your application. Give it a descriptive name to help you identify it later.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Key Name
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Production API, Development, Mobile App"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateKey()}
                    className="max-w-md"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Choose a name that helps you identify where this key is used
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateKey} disabled={isCreating || !newKeyName.trim()}>
                    {isCreating ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Key
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setShowCreateForm(false);
                    setNewKeyName('');
                  }}>
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* API Keys List */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Your API Keys ({apiKeys.length})
          </h2>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 dark:text-gray-400 mt-4">Loading API keys...</p>
            </div>
          ) : apiKeys.length === 0 ? (
            <Card className="shadow-lg">
              <CardContent className="p-12 text-center">
                <Key className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No API Keys Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Create your first API key to start using the HenryMo AI API in your applications
                </p>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First API Key
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((key) => (
                <Card key={key.id} className="shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-3 mb-2">
                          {key.key_name}
                          {key.is_active ? (
                            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Revoked
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Created {new Date(key.created_at).toLocaleDateString()}
                          </span>
                          {key.last_used_at && (
                            <span className="flex items-center gap-1">
                              <Zap className="h-3 w-3" />
                              Last used {new Date(key.last_used_at).toLocaleDateString()}
                            </span>
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        {key.is_active && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setShowKey({ ...showKey, [key.id]: !showKey[key.id] })
                              }
                            >
                              {showKey[key.id] ? (
                                <>
                                  <EyeOff className="h-4 w-4 mr-1" />
                                  Hide
                                </>
                              ) : (
                                <>
                                  <Eye className="h-4 w-4 mr-1" />
                                  Show
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRevokeKey(key.id)}
                              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Revoke
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {showKey[key.id] && key.api_key ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                          <div className="flex items-start gap-2 mb-2">
                            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                            <div>
                              <p className="font-semibold text-yellow-900 dark:text-yellow-100">
                                Save this API key now!
                              </p>
                              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                This is the only time you'll be able to see the full key. Make sure to copy it and store it securely.
                              </p>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                            Your API Key
                          </label>
                          <div className="flex gap-2">
                            <code className="flex-1 bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-md font-mono text-sm break-all border border-gray-300 dark:border-gray-700">
                              {key.api_key}
                            </code>
                            <Button
                              variant="outline"
                              onClick={() => copyToClipboard(key.api_key!)}
                              className="shrink-0"
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copy
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-6 text-sm">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Prefix: </span>
                            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono">
                              {key.key_prefix}...
                            </code>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Rate Limit: </span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {key.rate_limit_per_minute}/min
                            </span>
                            <span className="text-gray-500 dark:text-gray-500 mx-1">•</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {key.rate_limit_per_day.toLocaleString()}/day
                            </span>
                          </div>
                        </div>
                        {key.scopes && key.scopes.length > 0 && (
                          <div>
                            <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Scopes:</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {key.scopes.map((scope) => (
                                <Badge key={scope} variant="outline" className="text-xs">
                                  {scope}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {key.expires_at && (
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            <Clock className="h-3 w-3 inline mr-1" />
                            Expires: {new Date(key.expires_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Usage Instructions */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              How to Use Your API Key
            </CardTitle>
            <CardDescription>
              Integrate HenryMo AI API into your applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 text-sm">1. Include API Key in Headers</h4>
                <code className="block bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-md text-sm">
                  X-API-Key: your_api_key_here
                </code>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-sm">2. Base URL</h4>
                <code className="block bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-md text-sm">
                  https://api.henrymo.ai/v1
                </code>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-sm">3. Example Request</h4>
                <pre className="bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-md text-sm overflow-x-auto">
{`curl -X POST https://api.henrymo.ai/v1/ai/chat \\
  -H "X-API-Key: your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'`}
                </pre>
              </div>
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                <Link href="/api">
                  <Button variant="outline" className="w-full">
                    View Full API Documentation <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

