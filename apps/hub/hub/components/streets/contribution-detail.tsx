'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Clock, CheckCircle, XCircle, AlertCircle, Flag, DollarSign } from 'lucide-react';

const verdictOptions = [
  { value: 'approved', icon: CheckCircle },
  { value: 'rejected', icon: XCircle },
  { value: 'needs_review', icon: AlertCircle },
  { value: 'flagged', icon: Flag },
] as const;
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VerificationInterface } from './verification-interface';
import { contributionsApi, type Contribution, type Verification } from '@/lib/api/contributions';
import { toast } from 'sonner';
import Image from 'next/image';

interface ContributionDetailProps {
  contribution: Contribution;
  onBack: () => void;
}

const statusConfig = {
  pending: { icon: Clock, color: 'text-yellow-600 dark:text-yellow-400', label: 'Pending' },
  verified: { icon: CheckCircle, color: 'text-green-600 dark:text-green-400', label: 'Verified' },
  rejected: { icon: XCircle, color: 'text-red-600 dark:text-red-400', label: 'Rejected' },
  needs_review: { icon: AlertCircle, color: 'text-orange-600 dark:text-orange-400', label: 'Needs Review' },
  flagged: { icon: Flag, color: 'text-purple-600 dark:text-purple-400', label: 'Flagged' },
};

export function ContributionDetail({ contribution: initialContribution, onBack }: ContributionDetailProps) {
  const [contribution, setContribution] = useState<Contribution>(initialContribution);
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);

  const loadContribution = async () => {
    setIsLoading(true);
    try {
      const response = await contributionsApi.getContribution(contribution.id);
      if (response.success && response.data) {
        setContribution(response.data);
      }
    } catch (error) {
      console.error('Error loading contribution:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadVerifications = async () => {
    try {
      const response = await contributionsApi.getContributionVerifications(contribution.id);
      if (response.success && response.data) {
        setVerifications(response.data);
      }
    } catch (error) {
      console.error('Error loading verifications:', error);
    }
  };

  useEffect(() => {
    loadContribution();
    loadVerifications();
  }, [contribution.id]);

  const handleVerified = () => {
    loadContribution();
    loadVerifications();
    setShowVerification(false);
  };

  const StatusIcon = statusConfig[contribution.status]?.icon || Clock;
  const statusColor = statusConfig[contribution.status]?.color || 'text-gray-600';
  const statusLabel = statusConfig[contribution.status]?.label || contribution.status;

  // Check if user can verify (admin, moderator, verifier roles)
  const canVerify = true; // TODO: Get from auth store

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">{contribution.streetName || 'Unnamed Street'}</h2>
          <div className="flex items-center gap-4 mt-1">
            <div className={`flex items-center gap-2 ${statusColor}`}>
              <StatusIcon className="h-4 w-4" />
              <span className="text-sm font-medium">{statusLabel}</span>
            </div>
            {contribution.rewardAmount > 0 && (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm font-medium">${contribution.rewardAmount.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Images */}
      {contribution.images && contribution.images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Images ({contribution.images.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contribution.images.map((image) => (
                <div key={image.id} className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <Image
                    src={image.thumbnailUrl || image.s3Url}
                    alt="Contribution image"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="text-sm">
                {contribution.latitude.toFixed(6)}, {contribution.longitude.toFixed(6)}
              </span>
            </div>
            {contribution.streetName && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Street: {contribution.streetName}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm">
              <span className="text-gray-500 dark:text-gray-500">Uploaded:</span>{' '}
              {new Date(contribution.createdAt).toLocaleString()}
            </div>
            {contribution.verifiedAt && (
              <div className="text-sm">
                <span className="text-gray-500 dark:text-gray-500">Verified:</span>{' '}
                {new Date(contribution.verifiedAt).toLocaleString()}
              </div>
            )}
            {contribution.verificationScore !== null && (
              <div className="text-sm">
                <span className="text-gray-500 dark:text-gray-500">Verification Score:</span>{' '}
                {contribution.verificationScore.toFixed(2)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      {contribution.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 dark:text-gray-300">{contribution.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Verification Interface */}
      {canVerify && !showVerification && (
        <div>
          <Button onClick={() => setShowVerification(true)} className="w-full">
            Verify Contribution
          </Button>
        </div>
      )}

      {showVerification && (
        <VerificationInterface contribution={contribution} onVerified={handleVerified} />
      )}

      {/* Verifications History */}
      {verifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Verification History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {verifications.map((verification) => {
                const VerdictIcon = verdictOptions.find((v) => v.value === verification.verdict)?.icon || AlertCircle;
                return (
                  <div key={verification.id} className="border-l-4 border-gray-200 dark:border-gray-700 pl-4">
                    <div className="flex items-center gap-2 mb-2">
                      <VerdictIcon className="h-4 w-4" />
                      <span className="font-medium capitalize">{verification.verdict}</span>
                      {verification.verifier && (
                        <span className="text-sm text-gray-500">
                          by {verification.verifier.name}
                        </span>
                      )}
                    </div>
                    {verification.comment && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {verification.comment}
                      </p>
                    )}
                    {verification.confidenceScore !== null && (
                      <p className="text-xs text-gray-500">
                        Confidence: {verification.confidenceScore.toFixed(2)}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      {new Date(verification.createdAt).toLocaleString()}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

