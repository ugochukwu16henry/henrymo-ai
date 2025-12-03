'use client';

import { useState } from 'react';
import { Image as ImageIcon, Video, Library } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ImageGenerator } from '@/components/media/image-generator';
import { VideoGenerator } from '@/components/media/video-generator';
import { MediaLibrary } from '@/components/media/media-library';

type Tab = 'images' | 'videos' | 'library';

export default function MediaStudioPage() {
  const [activeTab, setActiveTab] = useState<Tab>('images');

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

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800">
        <Button
          variant={activeTab === 'images' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('images')}
          className="rounded-b-none"
        >
          <ImageIcon className="mr-2 h-4 w-4" />
          Generate Image
        </Button>
        <Button
          variant={activeTab === 'videos' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('videos')}
          className="rounded-b-none"
        >
          <Video className="mr-2 h-4 w-4" />
          Generate Video
        </Button>
        <Button
          variant={activeTab === 'library' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('library')}
          className="rounded-b-none"
        >
          <Library className="mr-2 h-4 w-4" />
          Media Library
        </Button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'images' && <ImageGenerator />}
        {activeTab === 'videos' && <VideoGenerator />}
        {activeTab === 'library' && <MediaLibrary />}
      </div>
    </div>
  );
}
