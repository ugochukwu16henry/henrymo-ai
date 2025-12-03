'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  BarChart3,
  Inbox,
  Plus,
  Loader2,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Hash,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { socialMediaApi, type SocialAccount, type SocialPost } from '@/lib/api/socialMedia';

export default function SocialMediaPage() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [scheduledPosts, setScheduledPosts] = useState<SocialPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [accountsResponse, postsResponse] = await Promise.all([
        socialMediaApi.getAccounts(),
        socialMediaApi.getScheduledPosts({ limit: 20 }),
      ]);

      if (accountsResponse.success && accountsResponse.data) {
        setAccounts(accountsResponse.data);
      }

      if (postsResponse.success && postsResponse.data) {
        setScheduledPosts(postsResponse.data);
      }
    } catch (error) {
      toast.error('Failed to load social media data');
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook':
        return <Facebook className="h-5 w-5 text-blue-600" />;
      case 'instagram':
        return <Instagram className="h-5 w-5 text-pink-600" />;
      case 'twitter':
        return <Twitter className="h-5 w-5 text-blue-400" />;
      case 'linkedin':
        return <Linkedin className="h-5 w-5 text-blue-700" />;
      default:
        return <Hash className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Social Media Management
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Manage all your social media accounts from one place
              </p>
            </div>
            <Button className="shadow-lg">
              <Plus className="h-4 w-4 mr-2" />
              Connect Account
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-6">

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="calendar">Content Calendar</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="inbox">Smart Inbox</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Connected Accounts */}
          <Card>
            <CardHeader>
              <CardTitle>Connected Accounts</CardTitle>
              <CardDescription>Your social media accounts</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                </div>
              ) : accounts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No accounts connected. Connect your first account to get started.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {accounts.map((account) => (
                    <Card key={account.id} className="border-l-4 border-l-blue-500">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          {getPlatformIcon(account.platform)}
                          <div>
                            <CardTitle className="text-lg">{account.account_name}</CardTitle>
                            <CardDescription className="capitalize">{account.platform}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Scheduled Posts */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Posts</CardTitle>
              <CardDescription>Your scheduled content</CardDescription>
            </CardHeader>
            <CardContent>
              {scheduledPosts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No scheduled posts. Create your first post to get started.
                </div>
              ) : (
                <div className="space-y-4">
                  {scheduledPosts.slice(0, 5).map((post) => (
                    <Card key={post.id} className="border-l-4 border-l-green-500">
                      <CardHeader>
                        <CardTitle className="text-base">{post.content.substring(0, 100)}...</CardTitle>
                        <CardDescription>
                          Scheduled for {post.scheduled_at ? new Date(post.scheduled_at).toLocaleString() : 'Draft'}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Content Calendar
              </CardTitle>
              <CardDescription>Visual calendar of your scheduled posts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Content calendar view coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analytics
              </CardTitle>
              <CardDescription>Performance metrics and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Analytics dashboard coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inbox">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Inbox className="h-5 w-5" />
                Smart Inbox
              </CardTitle>
              <CardDescription>All your mentions, comments, and messages in one place</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Smart inbox coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}

