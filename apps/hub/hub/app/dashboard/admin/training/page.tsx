'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Play,
  Pause,
  Download,
  Plus,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { trainingApi, type TrainingSession } from '@/lib/api/training';

export default function TrainingDashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'super_admin') {
      router.push('/dashboard');
      toast.error('Access denied. Super admin access required.');
      return;
    }
    loadSessions();
  }, [user, router]);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      const response = await trainingApi.listSessions();
      if (response.success && response.data) {
        setSessions(response.data);
      } else if (!response.success) {
        toast.error(response.error || 'Failed to load training sessions');
      }
    } catch (error) {
      toast.error('Failed to load training sessions');
      console.error('Error loading sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStart = async (sessionId: string) => {
    try {
      const response = await trainingApi.startTraining(sessionId);
      if (response.success) {
        toast.success('Training started');
        loadSessions();
      } else {
        toast.error(response.error || 'Failed to start training');
      }
    } catch (error) {
      toast.error('Failed to start training');
      console.error('Error starting training:', error);
    }
  };

  const handlePause = async (sessionId: string) => {
    try {
      const response = await trainingApi.pauseTraining(sessionId);
      if (response.success) {
        toast.success('Training paused');
        loadSessions();
      } else {
        toast.error(response.error || 'Failed to pause training');
      }
    } catch (error) {
      toast.error('Failed to pause training');
      console.error('Error pausing training:', error);
    }
  };

  const handleExport = async (sessionId: string) => {
    try {
      const response = await trainingApi.exportModel(sessionId);
      if (response.success) {
        toast.success('Model exported successfully');
        loadSessions();
      } else {
        toast.error(response.error || 'Failed to export model');
      }
    } catch (error) {
      toast.error('Failed to export model');
      console.error('Error exporting model:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      completed: 'default',
      active: 'secondary',
      paused: 'outline',
      failed: 'destructive',
      pending: 'outline',
    };

    const icons: Record<string, any> = {
      completed: CheckCircle,
      active: Play,
      paused: Pause,
      failed: XCircle,
      pending: Clock,
    };

    const Icon = icons[status] || Clock;

    return (
      <Badge variant={variants[status] || 'outline'} className="capitalize">
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  };

  if (!user || user.role !== 'super_admin') {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Training Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage AI training sessions and datasets
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadSessions} variant="outline">
            Refresh
          </Button>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Session
          </Button>
        </div>
      </div>

      {/* Training Sessions */}
      <div className="grid gap-4">
        {isLoading ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="mt-2 text-gray-500">Loading training sessions...</p>
              </div>
            </CardContent>
          </Card>
        ) : sessions.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-gray-500">
                No training sessions found. Create your first session to get started.
              </div>
            </CardContent>
          </Card>
        ) : (
          sessions.map((session) => (
            <Card key={session.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{session.name}</CardTitle>
                    <CardDescription>{session.objective}</CardDescription>
                  </div>
                  {getStatusBadge(session.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress */}
                {session.status === 'active' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{session.progress.toFixed(0)}%</span>
                    </div>
                    <Progress value={session.progress} className="h-2" />
                  </div>
                )}

                {/* Session Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Created</p>
                    <p className="font-medium">
                      {new Date(session.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {session.started_at && (
                    <div>
                      <p className="text-gray-500">Started</p>
                      <p className="font-medium">
                        {new Date(session.started_at).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {session.completed_at && (
                    <div>
                      <p className="text-gray-500">Completed</p>
                      <p className="font-medium">
                        {new Date(session.completed_at).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {session.model_version && (
                    <div>
                      <p className="text-gray-500">Model Version</p>
                      <p className="font-medium">{session.model_version}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {session.status === 'pending' && (
                    <Button size="sm" onClick={() => handleStart(session.id)}>
                      <Play className="h-4 w-4 mr-1" />
                      Start Training
                    </Button>
                  )}
                  {session.status === 'active' && (
                    <Button size="sm" variant="outline" onClick={() => handlePause(session.id)}>
                      <Pause className="h-4 w-4 mr-1" />
                      Pause
                    </Button>
                  )}
                  {session.status === 'completed' && (
                    <Button size="sm" variant="outline" onClick={() => handleExport(session.id)}>
                      <Download className="h-4 w-4 mr-1" />
                      Export Model
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

