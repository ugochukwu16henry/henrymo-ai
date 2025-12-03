'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  Users,
  DollarSign,
  TrendingUp,
  Activity,
  Shield,
  Mail,
  FileText,
  Settings,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Globe,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  MessageSquare,
  Image as ImageIcon,
  Map,
  Share2,
} from 'lucide-react';
import Link from 'next/link';
import { adminApi } from '@/lib/api/admin';
import { toast } from 'sonner';

interface PlatformStats {
  users: {
    total: number;
    active: number;
    byRole: Record<string, number>;
  };
  subscriptions: {
    byTier: Record<string, number>;
  };
  activity: {
    recent: number;
  };
  contributions: {
    total: number;
    verified: number;
    pending: number;
    rejected: number;
  };
}

export default function SuperAdminDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is super admin
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'super_admin' && user.role !== 'admin') {
      router.push('/dashboard');
      toast.error('Access denied. Super admin access required.');
      return;
    }
  }, [user, router]);

  useEffect(() => {
    if (user && (user.role === 'super_admin' || user.role === 'admin')) {
      loadPlatformStats();
    }
  }, [user]);

  const loadPlatformStats = async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.getPlatformAnalytics();

      if (response.success && response.data) {
        setStats(response.data);
      } else {
        toast.error(response.error || 'Failed to load platform statistics');
      }
    } catch (error) {
      toast.error('Failed to load platform statistics');
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || (user.role !== 'super_admin' && user.role !== 'admin')) {
    return null;
  }

  const quickActions = [
    {
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      icon: Users,
      href: '/dashboard/admin/users',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      hoverColor: 'hover:bg-blue-100 dark:hover:bg-blue-900/30',
    },
    {
      title: 'Invitations',
      description: 'Create and manage admin invitations',
      icon: Mail,
      href: '/dashboard/admin/invitations',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      hoverColor: 'hover:bg-purple-100 dark:hover:bg-purple-900/30',
    },
    {
      title: 'Audit Logs',
      description: 'View system activity and audit trail',
      icon: FileText,
      href: '/dashboard/admin/audit-logs',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      hoverColor: 'hover:bg-green-100 dark:hover:bg-green-900/30',
    },
    {
      title: 'Financial Dashboard',
      description: 'View payments, subscriptions, and revenue',
      icon: DollarSign,
      href: '/dashboard/finance',
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      hoverColor: 'hover:bg-yellow-100 dark:hover:bg-yellow-900/30',
    },
    {
      title: 'Analytics',
      description: 'Platform-wide analytics and insights',
      icon: BarChart3,
      href: '/dashboard/analytics',
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      hoverColor: 'hover:bg-orange-100 dark:hover:bg-orange-900/30',
    },
    {
      title: 'System Settings',
      description: 'Configure platform settings',
      icon: Settings,
      href: '/dashboard/admin/settings',
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-50 dark:bg-gray-900/20',
      hoverColor: 'hover:bg-gray-100 dark:hover:bg-gray-900/30',
    },
  ];

  const platformFeatures = [
    { name: 'ChatBoss', icon: MessageSquare, count: 'Active' },
    { name: 'Media Studio', icon: ImageIcon, count: 'Active' },
    { name: 'Streets Platform', icon: Map, count: 'Active' },
    { name: 'Social Media', icon: Share2, count: 'Active' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Super Admin Dashboard
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Welcome back, {user.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                <Shield className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-purple-600 dark:text-purple-400 capitalize">
                  {user.role.replace('_', ' ')}
                </span>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Key Metrics Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : stats ? (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Users
                  </CardTitle>
                  <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stats.users.total.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                      <CheckCircle className="h-4 w-4" />
                      <span>{stats.users.active} active</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Recent Activity
                  </CardTitle>
                  <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stats.activity.recent.toLocaleString()}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Last 7 days
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Contributions
                  </CardTitle>
                  <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Globe className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stats.contributions.total.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                      <CheckCircle className="h-4 w-4" />
                      <span>{stats.contributions.verified} verified</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Pending Reviews
                  </CardTitle>
                  <div className="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stats.contributions.pending.toLocaleString()}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Awaiting verification
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Users by Role
                  </CardTitle>
                  <CardDescription>Platform user distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats.users.byRole).map(([role, count]) => (
                      <div
                        key={role}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <span className="text-sm font-medium capitalize text-gray-900 dark:text-white">
                          {role.replace('_', ' ')}
                        </span>
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                    Subscriptions by Tier
                  </CardTitle>
                  <CardDescription>Subscription distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats.subscriptions.byTier).map(([tier, count]) => (
                      <div
                        key={tier}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <span className="text-sm font-medium capitalize text-gray-900 dark:text-white">
                          {tier}
                        </span>
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    Platform Features
                  </CardTitle>
                  <CardDescription>Active platform modules</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {platformFeatures.map((feature) => (
                      <div
                        key={feature.name}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <feature.icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {feature.name}
                          </span>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium">
                          {feature.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contribution Statistics */}
            <Card className="mb-8 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                  Contribution Statistics
                </CardTitle>
                <CardDescription>Street platform contribution overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {stats.contributions.total}
                    </div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total
                    </div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 rounded-xl border border-green-200 dark:border-green-800">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                      {stats.contributions.verified}
                    </div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Verified
                    </div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-900/10 rounded-xl border border-yellow-200 dark:border-yellow-800">
                    <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
                      {stats.contributions.pending}
                    </div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Pending
                    </div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/10 rounded-xl border border-red-200 dark:border-red-800">
                    <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
                      {stats.contributions.rejected}
                    </div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Rejected
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Quick Actions
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {quickActions.map((action, index) => (
                  <Link key={index} href={action.href}>
                    <Card
                      className={`${action.bgColor} ${action.hoverColor} border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-700 shadow-lg hover:shadow-xl transition-all cursor-pointer group`}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between mb-4">
                          <div
                            className={`w-12 h-12 rounded-xl ${action.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}
                          >
                            <action.icon className={`h-6 w-6 ${action.color}`} />
                          </div>
                          <ArrowUpRight
                            className={`h-5 w-5 ${action.color} opacity-0 group-hover:opacity-100 transition-opacity`}
                          />
                        </div>
                        <CardTitle className="text-lg text-gray-900 dark:text-white">
                          {action.title}
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400">
                          {action.description}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

            {/* Platform Info */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Platform Information
                </CardTitle>
                <CardDescription>HenryMo AI Platform Details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
                      Platform Creator
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Henry Maobughichi Ugochukwu
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
                      Platform Version
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">1.0.0</p>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Status</h3>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Operational
                      </span>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
                      Environment
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {process.env.NODE_ENV || 'development'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </div>
  );
}
