'use client';

import { useState } from 'react';
import { Upload, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContributionList } from '@/components/streets/contribution-list';
import { ContributionDetail } from '@/components/streets/contribution-detail';
import { type Contribution } from '@/lib/api/contributions';
import Link from 'next/link';

export default function ContributionsPage() {
  const [selectedContribution, setSelectedContribution] = useState<Contribution | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            My Contributions
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            View and manage your street contributions
          </p>
        </div>
        <Link href="/dashboard/streets/upload">
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Upload Contribution
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={statusFilter === '' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('')}
        >
          All
        </Button>
        <Button
          variant={statusFilter === 'pending' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('pending')}
        >
          Pending
        </Button>
        <Button
          variant={statusFilter === 'verified' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('verified')}
        >
          Verified
        </Button>
        <Button
          variant={statusFilter === 'rejected' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('rejected')}
        >
          Rejected
        </Button>
      </div>

      {/* Content */}
      {selectedContribution ? (
        <ContributionDetail
          contribution={selectedContribution}
          onBack={() => setSelectedContribution(null)}
        />
      ) : (
        <ContributionList
          status={statusFilter || undefined}
          onContributionClick={setSelectedContribution}
        />
      )}
    </div>
  );
}

