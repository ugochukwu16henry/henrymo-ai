'use client';

import { Card } from '@/components/ui/card';

export default function StreetsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Streets Platform
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Discover and contribute to the global street database
        </p>
      </div>

      <Card className="p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <svg
              className="h-8 w-8 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Coming Soon
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The Streets platform is currently under development. This feature will
            allow you to:
          </p>
          <ul className="text-left text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-6">
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              <span>Browse streets from around the world</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              <span>Contribute street information with photos</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              <span>Verify and earn rewards for contributions</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              <span>Explore streets by location</span>
            </li>
          </ul>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Expected release: Stage 6 (Days 21-24)
          </p>
        </div>
      </Card>
    </div>
  );
}

