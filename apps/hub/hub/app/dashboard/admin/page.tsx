'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
    loadPlatformStats();
  }, []);

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
    },
    {
      title: 'Invitations',
      description: 'Create and manage admin invitations',
      icon: Mail,
      href: '/dashboard/admin/invitations',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      title: 'Audit Logs',
      description: 'View system activity and audit trail',
      icon: FileText,
      href: '/dashboard/admin/audit-logs',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: 'Financial Dashboard',
      description: 'View payments, subscriptions, and revenue',
      icon: DollarSign,
      href: '/dashboard/finance',
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    },
    {
      title: 'Analytics',
      description: 'Platform-wide analytics and insights',
      icon: BarChart3,
      href: '/dashboard/analytics',
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    },
    {
      title: 'System Settings',
      description: 'Configure platform settings',
      icon: Settings,
      href: '/dashboard/admin/settings',
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-50 dark:bg-gray-900/20',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Super Admin Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Welcome back, {user.name}. Platform overview and management.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <span className="text-sm font-medium text-purple-600 dark:text-purple-400 capitalize">
            {user.role}
          </span>
        </div>
      </div>

      {/* Platform Statistics */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Loading platform statistics...</p>
        </div>
      ) : stats ? (
        <>
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.users.total}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.users.active} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activity.recent}</div>
                <p className="text-xs text-muted-foreground">
                  Last 7 days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Contributions</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.contributions.total}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.contributions.verified} verified
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.contributions.pending}</div>
                <p className="text-xs text-muted-foreground">
                  Awaiting verification
                </p>
              </CardContent>
            </Card>
          </div>

          {/* User Statistics */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Users by Role</CardTitle>
                <CardDescription>Platform user distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.users.byRole).map(([role, count]) => (
                    <div key={role} className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{role}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subscriptions by Tier</CardTitle>
                <CardDescription>Subscription distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.subscriptions.byTier).map(([tier, count]) => (
                    <div key={tier} className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{tier}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contribution Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Contribution Statistics</CardTitle>
              <CardDescription>Street platform contribution overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.contributions.total}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total</div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {stats.contributions.verified}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Verified</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {stats.contributions.pending}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Pending</div>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {stats.contributions.rejected}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Rejected</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Quick Actions
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg ${action.bgColor} flex items-center justify-center mb-4`}>
                  <action.icon className={`h-6 w-6 ${action.color}`} />
                </div>
                <CardTitle>{action.title}</CardTitle>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={action.href}>
                  <Button variant="outline" className="w-full">
                    Open {action.title}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Platform Info */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Information</CardTitle>
          <CardDescription>HenryMo AI Platform Details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Platform Creator</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Henry Maobughichi Ugochukwu
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Platform Version</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                1.0.0
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Status</h3>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Operational</span>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Environment</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {process.env.NODE_ENV || 'development'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

