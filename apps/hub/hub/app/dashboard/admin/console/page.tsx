'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Terminal,
  Play,
  FileText,
  Cpu,
  HardDrive,
  Activity,
  Loader2,
  Copy,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { consoleApi, type ConsoleCommand, type SystemResources } from '@/lib/api/console';

export default function DeveloperConsolePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [command, setCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<ConsoleCommand[]>([]);
  const [output, setOutput] = useState<string>('');
  const [commandType, setCommandType] = useState<'terminal' | 'database' | 'system' | 'module'>('terminal');
  const [systemResources, setSystemResources] = useState<SystemResources | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || user.role !== 'super_admin') {
      router.push('/dashboard');
      toast.error('Access denied. Super admin access required.');
      return;
    }
    loadCommandHistory();
    loadSystemResources();
  }, [user, router]);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const loadCommandHistory = async () => {
    try {
      const response = await consoleApi.getCommandHistory({ limit: 50 });
      if (response.success && response.data) {
        setCommandHistory(response.data);
      }
    } catch (error) {
      console.error('Error loading command history:', error);
    }
  };

  const loadSystemResources = async () => {
    try {
      const response = await consoleApi.getSystemResources();
      if (response.success && response.data) {
        setSystemResources(response.data);
      }
    } catch (error) {
      console.error('Error loading system resources:', error);
    }
  };

  const handleExecute = async () => {
    if (!command.trim()) {
      toast.error('Please enter a command');
      return;
    }

    try {
      setIsExecuting(true);
      setOutput('');
      const response = await consoleApi.executeCommand({
        command: command.trim(),
        commandType,
      });

      if (response.success && response.data) {
        setOutput(response.data.output || 'Command executed successfully');
        setCommand('');
        loadCommandHistory();
      } else if (!response.success) {
        setOutput(response.error || 'Command execution failed');
      }
    } catch (error: any) {
      setOutput(error.message || 'Command execution failed');
      toast.error('Failed to execute command');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleExecute();
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (!user || user.role !== 'super_admin') {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Developer Console
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Execute commands and monitor system resources
          </p>
        </div>
        <Terminal className="h-8 w-8 text-purple-600 dark:text-purple-400" />
      </div>

      <Tabs defaultValue="terminal" className="space-y-4">
        <TabsList>
          <TabsTrigger value="terminal">Terminal</TabsTrigger>
          <TabsTrigger value="resources">System Resources</TabsTrigger>
          <TabsTrigger value="history">Command History</TabsTrigger>
        </TabsList>

        <TabsContent value="terminal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Command Execution</CardTitle>
              <CardDescription>Execute terminal, database, or system commands</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <select
                  value={commandType}
                  onChange={(e) =>
                    setCommandType(
                      e.target.value as 'terminal' | 'database' | 'system' | 'module'
                    )
                  }
                  className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                >
                  <option value="terminal">Terminal</option>
                  <option value="database">Database</option>
                  <option value="system">System</option>
                  <option value="module">Module</option>
                </select>
                <Input
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Enter ${commandType} command...`}
                  className="flex-1"
                />
                <Button onClick={handleExecute} disabled={isExecuting || !command.trim()}>
                  {isExecuting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Execute
                </Button>
              </div>

              {output && (
                <Card className="bg-gray-900 text-green-400 font-mono text-sm">
                  <CardContent className="p-4">
                    <div
                      ref={outputRef}
                      className="max-h-96 overflow-y-auto whitespace-pre-wrap"
                    >
                      {output}
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          {systemResources && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cpu className="h-5 w-5" />
                    CPU
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Cores:</span>
                      <span className="font-medium">{systemResources.cpu.cores}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>User:</span>
                      <span className="font-medium">
                        {Math.round(systemResources.cpu.usage.user / 1000)}ms
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>System:</span>
                      <span className="font-medium">
                        {Math.round(systemResources.cpu.usage.system / 1000)}ms
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HardDrive className="h-5 w-5" />
                    Memory
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total:</span>
                      <span className="font-medium">{formatBytes(systemResources.memory.total)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Used:</span>
                      <span className="font-medium">{formatBytes(systemResources.memory.used)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Free:</span>
                      <span className="font-medium">{formatBytes(systemResources.memory.free)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Process:</span>
                      <span className="font-medium">
                        {formatBytes(systemResources.memory.process.heapUsed)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Uptime
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>System:</span>
                      <span className="font-medium">
                        {Math.floor(systemResources.uptime.system / 3600)}h{' '}
                        {Math.floor((systemResources.uptime.system % 3600) / 60)}m
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Process:</span>
                      <span className="font-medium">
                        {Math.floor(systemResources.uptime.process / 3600)}h{' '}
                        {Math.floor((systemResources.uptime.process % 3600) / 60)}m
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Platform
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span className="font-medium">{systemResources.platform.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Platform:</span>
                      <span className="font-medium">{systemResources.platform.platform}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Architecture:</span>
                      <span className="font-medium">{systemResources.platform.arch}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hostname:</span>
                      <span className="font-medium">{systemResources.platform.hostname}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Command History</CardTitle>
              <CardDescription>Recent command executions</CardDescription>
            </CardHeader>
            <CardContent>
              {commandHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No command history
                </div>
              ) : (
                <div className="space-y-2">
                  {commandHistory.map((cmd) => (
                    <Card key={cmd.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-xs">
                                {cmd.command_type}
                              </Badge>
                              {cmd.exit_code === 0 ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                            </div>
                            <p className="font-mono text-sm mb-2">{cmd.command}</p>
                            {cmd.output && (
                              <div className="bg-gray-900 text-green-400 font-mono text-xs p-2 rounded max-h-32 overflow-y-auto">
                                {cmd.output.substring(0, 200)}
                                {cmd.output.length > 200 && '...'}
                              </div>
                            )}
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(cmd.executed_at).toLocaleString()}
                              {cmd.execution_time_ms && ` • ${cmd.execution_time_ms}ms`}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

