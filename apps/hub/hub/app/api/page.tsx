'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Key,
  Zap,
  Shield,
  CheckCircle,
  ArrowRight,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  TrendingUp,
  Clock,
  Globe,
  Code,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiKeysApi, type ApiKey, type ApiPlan, type ApiUsageStats } from '@/lib/api/apiKeys';
import { useAuthStore } from '@/store/auth-store';
import Link from 'next/link';

export default function ApiPage() {
  const { user } = useAuthStore();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [plans, setPlans] = useState<ApiPlan[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [newKeyName, setNewKeyName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [keysResponse, plansResponse, subscriptionResponse] = await Promise.all([
        apiKeysApi.getApiKeys(),
        apiKeysApi.getApiPlans(),
        apiKeysApi.getApiSubscription(),
      ]);

      if (keysResponse.success && keysResponse.data) {
        setApiKeys(keysResponse.data);
      }

      if (plansResponse.success && plansResponse.data) {
        setPlans(plansResponse.data);
      }

      if (subscriptionResponse.success && subscriptionResponse.data) {
        setSubscription(subscriptionResponse.data);
      }
    } catch (error) {
      toast.error('Failed to load API data');
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
        toast.success('API key created successfully!');
        setNewKeyName('');
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
    if (!subscription) return plans.find((p) => p.name === 'Free') || plans[0];
    return plans.find((p) => p.id === subscription.plan_id) || plans[0];
  };

  const currentPlan = getCurrentPlan();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Hero Section */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <Sparkles className="h-12 w-12 mr-3" />
              <h1 className="text-5xl font-bold">HenryMo AI API</h1>
            </div>
            <p className="text-xl mb-8 opacity-90">
              Integrate powerful AI capabilities into your applications. Build intelligent features
              with our comprehensive API.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="#pricing">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  View Pricing <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#docs">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  View Documentation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {/* Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Powerful API Features
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="shadow-lg">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                  <Code className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle>RESTful API</CardTitle>
                <CardDescription>
                  Clean, intuitive REST endpoints. Easy to integrate with any language or framework.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle>High Performance</CardTitle>
                <CardDescription>
                  Fast response times and scalable infrastructure. Built for production workloads.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle>Secure & Reliable</CardTitle>
                <CardDescription>
                  Enterprise-grade security with API key authentication. 99.9% uptime SLA.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* API Key Management */}
        {user && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Your API Keys</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Manage your API keys and monitor usage
                </p>
              </div>
              <Button onClick={() => document.getElementById('create-key-modal')?.scrollIntoView({ behavior: 'smooth' })}>
                <Key className="h-4 w-4 mr-2" />
                Create API Key
              </Button>
            </div>

            {/* Create Key Form */}
            <Card id="create-key-modal" className="mb-6 shadow-lg">
              <CardHeader>
                <CardTitle>Create New API Key</CardTitle>
                <CardDescription>Generate a new API key for your application</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder="Enter key name (e.g., Production API, Development)"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="flex-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2"
                  />
                  <Button onClick={handleCreateKey} disabled={isCreating}>
                    {isCreating ? 'Creating...' : 'Create Key'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* API Keys List */}
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">Loading API keys...</p>
              </div>
            ) : apiKeys.length === 0 ? (
              <Card className="shadow-lg">
                <CardContent className="p-12 text-center">
                  <Key className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No API Keys Yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Create your first API key to start using the HenryMo AI API
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {apiKeys.map((key) => (
                  <Card key={key.id} className="shadow-lg">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {key.key_name}
                            {key.is_active ? (
                              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="destructive">Revoked</Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="mt-2">
                            Created {new Date(key.created_at).toLocaleDateString()}
                            {key.last_used_at && (
                              <> • Last used {new Date(key.last_used_at).toLocaleDateString()}</>
                            )}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          {key.is_active && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setShowKey({ ...showKey, [key.id]: !showKey[key.id] })
                              }
                            >
                              {showKey[key.id] ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                          {key.is_active && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRevokeKey(key.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {showKey[key.id] && key.api_key ? (
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                              Your API Key (save this - it won&apos;t be shown again)
                            </label>
                            <div className="flex gap-2">
                              <code className="flex-1 bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-md font-mono text-sm break-all">
                                {key.api_key}
                              </code>
                              <Button
                                variant="outline"
                                onClick={() => copyToClipboard(key.api_key!)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              <strong>Prefix:</strong> {key.key_prefix}...
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">
                              <strong>Rate Limit:</strong> {key.rate_limit_per_minute}/min,{' '}
                              {key.rate_limit_per_day.toLocaleString()}/day
                            </span>
                          </div>
                          {key.scopes && key.scopes.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {key.scopes.map((scope) => (
                                <Badge key={scope} variant="outline">
                                  {scope}
                                </Badge>
                              ))}
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
        )}

        {/* Pricing Section */}
        <div id="pricing" className="mb-16 scroll-mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Choose Your Plan
          </h2>
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">Loading plans...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {plans.map((plan) => {
                const isCurrentPlan = subscription && subscription.plan_id === plan.id;
                return (
                  <Card
                    key={plan.id}
                    className={`shadow-lg relative ${
                      isCurrentPlan ? 'border-2 border-blue-500 ring-2 ring-blue-500/20' : ''
                    }`}
                  >
                    {isCurrentPlan && (
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-blue-600 text-white">Current Plan</Badge>
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <div className="mt-4">
                        <span className="text-4xl font-bold text-gray-900 dark:text-white">
                          ${plan.price_monthly}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">/month</span>
                        {plan.price_yearly && (
                          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                            ${plan.price_yearly}/year (save ${plan.price_monthly * 12 - plan.price_yearly})
                          </p>
                        )}
                      </div>
                      <CardDescription className="mt-4">{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <span>
                              {plan.rate_limit_per_minute} requests/minute
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <span>
                              {plan.rate_limit_per_day.toLocaleString()} requests/day
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <span>
                              {plan.rate_limit_per_month.toLocaleString()} requests/month
                            </span>
                          </div>
                        </div>
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                          <h4 className="font-semibold mb-2 text-sm">Features:</h4>
                          <ul className="space-y-1">
                            {plan.features.map((feature, idx) => (
                              <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                        {!isCurrentPlan && (
                          <Button className="w-full mt-6" variant={plan.name === 'Pro' ? 'default' : 'outline'}>
                            {plan.price_monthly === 0 ? 'Get Started' : 'Subscribe'}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Documentation Section */}
        <div id="docs" className="scroll-mt-20">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                API Documentation
              </CardTitle>
              <CardDescription>
                Learn how to integrate HenryMo AI API into your application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Authentication</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Include your API key in the request header:
                  </p>
                  <code className="block bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-md text-sm">
                    X-API-Key: your_api_key_here
                  </code>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Or use Bearer token:
                  </p>
                  <code className="block bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-md text-sm">
                    Authorization: Bearer your_api_key_here
                  </code>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Base URL</h3>
                  <code className="block bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-md text-sm">
                    https://api.henrymo.ai/v1
                  </code>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Example Request</h3>
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

                <div>
                  <h3 className="font-semibold mb-2">Available Endpoints</h3>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">POST /ai/chat</code>{' '}
                      - Chat completion
                    </li>
                    <li>
                      <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">POST /ai/chat/stream</code>{' '}
                      - Streaming chat
                    </li>
                    <li>
                      <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">POST /media/image</code>{' '}
                      - Generate images
                    </li>
                    <li>
                      <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">POST /media/video</code>{' '}
                      - Generate videos
                    </li>
                    <li>
                      <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">GET /analytics</code>{' '}
                      - Get analytics
                    </li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                  <Button variant="outline" className="w-full">
                    View Full Documentation <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

