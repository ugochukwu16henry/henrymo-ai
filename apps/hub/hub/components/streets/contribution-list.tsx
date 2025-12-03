'use client';

import { useState, useEffect } from 'react';
import { MapPin, Clock, CheckCircle, XCircle, AlertCircle, Flag, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { contributionsApi, type Contribution } from '@/lib/api/contributions';
import { toast } from 'sonner';
import Image from 'next/image';

interface ContributionListProps {
  userId?: string;
  streetId?: string;
  status?: string;
  onContributionClick?: (contribution: Contribution) => void;
}

const statusConfig = {
  pending: { icon: Clock, color: 'text-yellow-600 dark:text-yellow-400', label: 'Pending' },
  verified: { icon: CheckCircle, color: 'text-green-600 dark:text-green-400', label: 'Verified' },
  rejected: { icon: XCircle, color: 'text-red-600 dark:text-red-400', label: 'Rejected' },
  needs_review: { icon: AlertCircle, color: 'text-orange-600 dark:text-orange-400', label: 'Needs Review' },
  flagged: { icon: Flag, color: 'text-purple-600 dark:text-purple-400', label: 'Flagged' },
};

export function ContributionList({ userId, streetId, status, onContributionClick }: ContributionListProps) {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const loadContributions = async (customOffset = 0) => {
    setIsLoading(true);
    try {
      const response = await contributionsApi.listContributions({
        userId,
        streetId,
        status,
        limit,
        offset: customOffset,
      });

      if (response.success && response.data) {
        setContributions(response.data.contributions);
        setTotal(response.data.pagination.total);
        setOffset(customOffset);
      } else if (!response.success) {
        toast.error(response.error || 'Failed to load contributions');
      }
    } catch (error) {
      toast.error('Failed to load contributions');
      console.error('Error loading contributions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadContributions(0);
  }, [userId, streetId, status]);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">Loading contributions...</p>
      </div>
    );
  }

  if (contributions.length === 0) {
    return (
      <div className="text-center py-8">
        <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500 dark:text-gray-400">No contributions found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contributions.map((contribution) => {
          const StatusIcon = statusConfig[contribution.status]?.icon || Clock;
          const statusColor = statusConfig[contribution.status]?.color || 'text-gray-600';
          const statusLabel = statusConfig[contribution.status]?.label || contribution.status;

          return (
            <Card
              key={contribution.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => onContributionClick?.(contribution)}
            >
              <CardContent className="p-4">
                {/* Thumbnail */}
                {contribution.thumbnailImage && (
                  <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 mb-3">
                    <Image
                      src={contribution.thumbnailImage.thumbnailUrl || contribution.thumbnailImage.s3Url}
                      alt="Contribution"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}

                {/* Street Name */}
                <h3 className="font-semibold text-lg mb-2 truncate">
                  {contribution.streetName || 'Unnamed Street'}
                </h3>

                {/* Status */}
                <div className="flex items-center gap-2 mb-2">
                  <StatusIcon className={`h-4 w-4 ${statusColor}`} />
                  <span className={`text-sm font-medium ${statusColor}`}>{statusLabel}</span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500 mb-2">
                  <MapPin className="h-3 w-3" />
                  <span>
                    {contribution.latitude.toFixed(4)}, {contribution.longitude.toFixed(4)}
                  </span>
                </div>

                {/* Reward */}
                {contribution.rewardAmount > 0 && (
                  <div className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">
                    ${contribution.rewardAmount.toFixed(2)} reward
                  </div>
                )}

                {/* Date */}
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  {new Date(contribution.createdAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pagination */}
      {total > limit && (
        <div className="flex items-center justify-between pt-4">
          <Button
            variant="outline"
            onClick={() => loadContributions(Math.max(0, offset - limit))}
            disabled={offset === 0}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Showing {offset + 1} - {Math.min(offset + limit, total)} of {total}
          </span>
          <Button
            variant="outline"
            onClick={() => loadContributions(offset + limit)}
            disabled={offset + limit >= total}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

