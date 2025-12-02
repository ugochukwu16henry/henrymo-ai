'use client';

import { Card } from '@/components/ui/card';

export default function MediaStudioPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Media Studio
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Generate images and videos with AI
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
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Coming Soon
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The Media Studio is currently under development. This feature will
            allow you to:
          </p>
          <ul className="text-left text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-6">
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              <span>Generate images with AI (DALL-E, Stable Diffusion)</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              <span>Create videos from images</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              <span>Manage your media library</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              <span>Download and share your creations</span>
            </li>
          </ul>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Expected release: Stage 5 (Days 17-20)
          </p>
        </div>
      </Card>
    </div>
  );
}

