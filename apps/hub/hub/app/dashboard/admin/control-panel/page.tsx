'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Shield,
  Zap,
  Activity,
  FileText,
  Settings,
} from 'lucide-react';
import { toast } from 'sonner';
import { selfImprovementApi, type UpdateProposal } from '@/lib/api/selfImprovement';
import { superAdminControlApi } from '@/lib/api/superAdminControl';
import { sandboxApi } from '@/lib/api/sandbox';

export default function SuperAdminControlPanel() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [proposals, setProposals] = useState<UpdateProposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProposal, setSelectedProposal] = useState<UpdateProposal | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'super_admin') {
      router.push('/dashboard');
      toast.error('Access denied. Super admin access required.');
      return;
    }
    loadProposals();
  }, [user, router]);

  const loadProposals = async () => {
    try {
      setIsLoading(true);
      const response = await selfImprovementApi.getPendingProposals();
      if (response.success && response.data) {
        setProposals(response.data);
      } else if (!response.success) {
        toast.error(response.error || 'Failed to load proposals');
      }
    } catch (error) {
      toast.error('Failed to load proposals');
      console.error('Error loading proposals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (proposalId: string) => {
    try {
      const response = await superAdminControlApi.approveProposal(proposalId);
      if (response.success) {
        toast.success('Proposal approved');
        loadProposals();
      } else if (!response.success) {
        toast.error(response.error || 'Failed to approve proposal');
      }
    } catch (error) {
      toast.error('Failed to approve proposal');
      console.error('Error approving proposal:', error);
    }
  };

  const handleReject = async (proposalId: string, reason?: string) => {
    try {
      const response = await superAdminControlApi.rejectProposal(proposalId, reason);
      if (response.success) {
        toast.success('Proposal rejected');
        loadProposals();
      } else if (!response.success) {
        toast.error(response.error || 'Failed to reject proposal');
      }
    } catch (error) {
      toast.error('Failed to reject proposal');
      console.error('Error rejecting proposal:', error);
    }
  };

  const handleTest = async (proposalId: string) => {
    try {
      const response = await sandboxApi.testProposal(proposalId);
      if (response.success) {
        toast.success('Sandbox testing completed');
        loadProposals();
      } else if (!response.success) {
        toast.error(response.error || 'Failed to test proposal');
      }
    } catch (error) {
      toast.error('Failed to test proposal');
      console.error('Error testing proposal:', error);
    }
  };

  if (!user || user.role !== 'super_admin') {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Super Admin Control Panel
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Review and approve system updates
          </p>
        </div>
        <Shield className="h-8 w-8 text-purple-600 dark:text-purple-400" />
      </div>

      <Tabs defaultValue="proposals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="proposals">Update Proposals</TabsTrigger>
          <TabsTrigger value="modules">Module Control</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="proposals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Update Proposals</CardTitle>
              <CardDescription>
                Review AI-generated improvement proposals
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <Activity className="h-8 w-8 animate-spin mx-auto text-primary" />
                  <p className="mt-2 text-gray-500">Loading proposals...</p>
                </div>
              ) : proposals.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No pending proposals
                </div>
              ) : (
                <div className="space-y-4">
                  {proposals.map((proposal) => (
                    <Card key={proposal.id} className="border-l-4 border-l-blue-500">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{proposal.module_name}</CardTitle>
                            <CardDescription>
                              {proposal.proposal_type} • Safety Score: {(proposal.safety_score * 100).toFixed(0)}%
                            </CardDescription>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedProposal(proposal)}
                            >
                              View Details
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleTest(proposal.id)}
                            >
                              Test in Sandbox
                            </Button>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleApprove(proposal.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(proposal.id)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {proposal.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modules">
          <Card>
            <CardHeader>
              <CardTitle>Module Management</CardTitle>
              <CardDescription>Freeze or unfreeze modules</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Module management interface coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>View all system actions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Audit log viewer coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

