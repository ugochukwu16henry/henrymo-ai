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
  TrendingUp,
  Shield,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { monitoringApi, type SystemDiagnostic, type OptimizationSuggestion } from '@/lib/api/monitoring';

export default function MonitoringDashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [healthCheck, setHealthCheck] = useState<any>(null);
  const [diagnostics, setDiagnostics] = useState<SystemDiagnostic[]>([]);
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      const [healthResponse, diagnosticsResponse, suggestionsResponse] = await Promise.all([
        monitoringApi.performHealthCheck(),
        monitoringApi.getRecentDiagnostics(20),
        monitoringApi.getOptimizationSuggestions(),
      ]);

      if (healthResponse.success && healthResponse.data) {
        setHealthCheck(healthResponse.data);
      }

      if (diagnosticsResponse.success && diagnosticsResponse.data) {
        setDiagnostics(diagnosticsResponse.data);
      }

      if (suggestionsResponse.success && suggestionsResponse.data) {
        setSuggestions(suggestionsResponse.data);
      }
    } catch (error) {
      toast.error('Failed to load monitoring data');
      console.error('Error loading monitoring data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkFixed = async (diagnosticId: string) => {
    try {
      const response = await monitoringApi.markFixed(diagnosticId);
      if (response.success) {
        toast.success('Diagnostic marked as fixed');
        loadData();
      } else if (!response.success) {
        toast.error(response.error || 'Failed to mark as fixed');
      }
    } catch (error) {
      toast.error('Failed to mark as fixed');
      console.error('Error marking diagnostic:', error);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      critical: 'destructive',
      error: 'destructive',
      warning: 'secondary',
      info: 'outline',
    };

    return (
      <Badge variant={variants[severity] || 'outline'} className="capitalize">
        {severity}
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
            System Monitoring
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Real-time system health and diagnostics
          </p>
        </div>
        <Button onClick={loadData} variant="outline">
          <Activity className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Health Check Overview */}
      {healthCheck && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {healthCheck.database?.status === 'healthy' ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span className="text-sm capitalize">{healthCheck.database?.status || 'unknown'}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Modules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {healthCheck.modules?.filter((m: any) => m.status === 'healthy').length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Issues Detected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {healthCheck.issues?.length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                {healthCheck.system?.uptime
                  ? `${Math.floor(healthCheck.system.uptime / 3600)}h ${Math.floor((healthCheck.system.uptime % 3600) / 60)}m`
                  : 'N/A'}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Optimization Suggestions */}
      {suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Optimization Suggestions
            </CardTitle>
            <CardDescription>AI-generated recommendations for system improvement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-gray-50 dark:bg-gray-800"
                >
                  <Zap className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{suggestion.module}</span>
                      <Badge
                        variant={
                          suggestion.priority === 'high'
                            ? 'destructive'
                            : suggestion.priority === 'medium'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {suggestion.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {suggestion.suggestion}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Diagnostics */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Diagnostics</CardTitle>
          <CardDescription>System issues and their resolutions</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="mt-2 text-gray-500">Loading diagnostics...</p>
            </div>
          ) : diagnostics.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No diagnostics found. System is healthy!
            </div>
          ) : (
            <div className="space-y-4">
              {diagnostics.map((diagnostic) => (
                <Card
                  key={diagnostic.id}
                  className={`border-l-4 ${
                    diagnostic.severity === 'critical'
                      ? 'border-l-red-600'
                      : diagnostic.severity === 'error'
                      ? 'border-l-red-500'
                      : diagnostic.severity === 'warning'
                      ? 'border-l-yellow-500'
                      : 'border-l-blue-500'
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getSeverityIcon(diagnostic.severity)}
                        <div>
                          <CardTitle className="text-base">{diagnostic.issue_description}</CardTitle>
                          <CardDescription>
                            {diagnostic.module_name || 'System'} • {diagnostic.diagnostic_type}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getSeverityBadge(diagnostic.severity)}
                        {!diagnostic.fix_applied && user.role === 'super_admin' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkFixed(diagnostic.id)}
                          >
                            Mark Fixed
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  {diagnostic.root_cause_analysis && (
                    <CardContent className="space-y-2">
                      <div>
                        <p className="text-sm font-medium">Root Cause:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {diagnostic.root_cause_analysis}
                        </p>
                      </div>
                      {diagnostic.recommended_fix && (
                        <div>
                          <p className="text-sm font-medium">Recommended Fix:</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {diagnostic.recommended_fix}
                          </p>
                        </div>
                      )}
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

