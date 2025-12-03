'use client';

import { ContributionUpload } from '@/components/streets/contribution-upload';

export default function UploadContributionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Upload Contribution
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Share street photos to help build the global street database
        </p>
      </div>

      <ContributionUpload />
    </div>
  );
}

