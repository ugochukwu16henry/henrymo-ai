'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Settings,
  Zap,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';
import { motherboardApi, type Module, type SystemHealth } from '@/lib/api/motherboard';
import { superAdminControlApi } from '@/lib/api/superAdminControl';

export default function ModuleManagementPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [modules, setModules] = useState<Module[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);

  useEffect(() => {
    if (!user || (user.role !== 'super_admin' && user.role !== 'admin')) {
      router.push('/dashboard');
      toast.error('Access denied. Admin access required.');
      return;
    }
    loadData();
  }, [user, router]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [modulesResponse, healthResponse] = await Promise.all([
        motherboardApi.getAllModules(),
        motherboardApi.getSystemHealth(),
      ]);

      if (modulesResponse.success && modulesResponse.data) {
        setModules(modulesResponse.data);
      }

      if (healthResponse.success && healthResponse.data) {
        setSystemHealth(healthResponse.data);
      }
    } catch (error) {
      toast.error('Failed to load module data');
      console.error('Error loading modules:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFreeze = async (moduleName: string) => {
    if (!confirm(`Are you sure you want to freeze module "${moduleName}"?`)) {
      return;
    }

    try {
      const response = await superAdminControlApi.freezeModule(moduleName, 'Manual freeze');
      if (response.success) {
        toast.success('Module frozen');
        loadData();
      } else {
        toast.error(response.error || 'Failed to freeze module');
      }
    } catch (error) {
      toast.error('Failed to freeze module');
      console.error('Error freezing module:', error);
    }
  };

  const handleUnfreeze = async (moduleName: string) => {
    try {
      const response = await superAdminControlApi.unfreezeModule(moduleName);
      if (response.success) {
        toast.success('Module unfrozen');
        loadData();
      } else {
        toast.error(response.error || 'Failed to unfreeze module');
      }
    } catch (error) {
      toast.error('Failed to unfreeze module');
      console.error('Error unfreezing module:', error);
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'degraded':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'unhealthy':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      frozen: 'secondary',
      deprecated: 'outline',
      testing: 'secondary',
    };

    return (
      <Badge variant={variants[status] || 'outline'} className="capitalize">
        {status}
      </Badge>
    );
  };

  if (!user || (user.role !== 'super_admin' && user.role !== 'admin')) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Module Management
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Monitor and control platform modules
          </p>
        </div>
        <Button onClick={loadData} variant="outline">
          <Activity className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* System Health Overview */}
      {systemHealth && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Modules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemHealth.totalModules}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Healthy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {systemHealth.healthSummary.healthy || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Degraded</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {systemHealth.healthSummary.degraded || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Unhealthy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {systemHealth.healthSummary.unhealthy || 0}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modules List */}
      <Card>
        <CardHeader>
          <CardTitle>Registered Modules</CardTitle>
          <CardDescription>All platform modules and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="mt-2 text-gray-500">Loading modules...</p>
            </div>
          ) : modules.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No modules registered
            </div>
          ) : (
            <div className="space-y-4">
              {modules.map((module) => (
                <Card
                  key={module.id}
                  className={`border-l-4 ${
                    module.health_status === 'healthy'
                      ? 'border-l-green-500'
                      : module.health_status === 'degraded'
                      ? 'border-l-yellow-500'
                      : 'border-l-red-500'
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        {getHealthIcon(module.health_status)}
                        <div>
                          <CardTitle className="text-lg">{module.name}</CardTitle>
                          <CardDescription>
                            Version {module.version} • {module.dependencies.length} dependencies
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(module.status)}
                        {user.role === 'super_admin' && (
                          <>
                            {module.status === 'frozen' ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUnfreeze(module.name)}
                              >
                                <Zap className="h-4 w-4 mr-1" />
                                Unfreeze
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleFreeze(module.name)}
                              >
                                <Shield className="h-4 w-4 mr-1" />
                                Freeze
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedModule(module)}
                            >
                              <Settings className="h-4 w-4 mr-1" />
                              Details
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  {module.dependencies.length > 0 && (
                    <CardContent>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>Dependencies:</strong> {module.dependencies.join(', ')}
                      </p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

