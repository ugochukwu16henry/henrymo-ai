'use client';

import { useState, useEffect } from 'react';
import { Image as ImageIcon, Video, Download, Trash2, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mediaApi, type GeneratedImage, type GeneratedVideo } from '@/lib/api/media';
import { toast } from 'sonner';
import Image from 'next/image';

type MediaType = 'all' | 'images' | 'videos';

export function MediaLibrary() {
  const [mediaType, setMediaType] = useState<MediaType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [videos, setVideos] = useState<GeneratedVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<
    (GeneratedImage | GeneratedVideo) | null
  >(null);

  const loadMedia = async () => {
    setIsLoading(true);
    try {
      if (mediaType === 'all' || mediaType === 'images') {
        const imagesResponse = await mediaApi.listImages({ limit: 50 });
        if (imagesResponse.success && imagesResponse.data) {
          setImages(imagesResponse.data);
        }
      }

      if (mediaType === 'all' || mediaType === 'videos') {
        const videosResponse = await mediaApi.listVideos({ limit: 50 });
        if (videosResponse.success && videosResponse.data) {
          setVideos(videosResponse.data);
        }
      }
    } catch (error) {
      console.error('Error loading media:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, [mediaType]);

  const handleDelete = async (id: string, type: 'image' | 'video') => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const response =
        type === 'image' ? await mediaApi.deleteImage(id) : await mediaApi.deleteVideo(id);
      if (response.success) {
        toast.success(`${type === 'image' ? 'Image' : 'Video'} deleted`);
        loadMedia();
        if (selectedMedia?.id === id) {
          setSelectedMedia(null);
        }
      } else {
        toast.error(response.error || 'Failed to delete');
      }
    } catch (error) {
      toast.error('Failed to delete');
      console.error('Error deleting:', error);
    }
  };

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredImages = images.filter((img) =>
    img.prompt.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredVideos = videos.filter((video) =>
    video.metadata?.prompt?.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
    searchQuery === ''
  );

  const allMedia = [
    ...filteredImages.map((img) => ({ ...img, type: 'image' as const })),
    ...filteredVideos.map((vid) => ({ ...vid, type: 'video' as const })),
  ].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Media Library</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search media..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Type Filter */}
          <div className="flex gap-2">
            <Button
              variant={mediaType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMediaType('all')}
            >
              All
            </Button>
            <Button
              variant={mediaType === 'images' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMediaType('images')}
            >
              <ImageIcon className="mr-2 h-4 w-4" />
              Images
            </Button>
            <Button
              variant={mediaType === 'videos' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMediaType('videos')}
            >
              <Video className="mr-2 h-4 w-4" />
              Videos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Media Grid */}
      {isLoading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">Loading media...</p>
          </CardContent>
        </Card>
      ) : allMedia.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">No media found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {allMedia.map((item) => (
            <div
              key={item.id}
              className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 group cursor-pointer"
              onClick={() => setSelectedMedia(item)}
            >
              {item.type === 'image' ? (
                <Image
                  src={(item as GeneratedImage).s3Url || (item as GeneratedImage).originalUrl || ''}
                  alt={(item as GeneratedImage).prompt}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <video
                  src={(item as GeneratedVideo).s3Url}
                  className="w-full h-full object-cover"
                  muted
                />
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      const url =
                        item.type === 'image'
                          ? (item as GeneratedImage).s3Url || (item as GeneratedImage).originalUrl || ''
                          : (item as GeneratedVideo).s3Url;
                      const filename =
                        item.type === 'image'
                          ? `image-${item.id}.png`
                          : `video-${item.id}.${(item as GeneratedVideo).format}`;
                      handleDownload(url, filename);
                    }}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id, item.type);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                <p className="text-white text-xs truncate">
                  {item.type === 'image'
                    ? (item as GeneratedImage).prompt
                    : 'Video'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Media Preview Modal */}
      {selectedMedia && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {selectedMedia.type === 'image' ? 'Image' : 'Video'} Preview
                </h3>
                <Button variant="ghost" size="icon" onClick={() => setSelectedMedia(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {selectedMedia.type === 'image' ? (
                <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <Image
                    src={
                      (selectedMedia as GeneratedImage).s3Url ||
                      (selectedMedia as GeneratedImage).originalUrl ||
                      ''
                    }
                    alt={(selectedMedia as GeneratedImage).prompt}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <video
                    src={(selectedMedia as GeneratedVideo).s3Url}
                    controls
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              <div className="space-y-2">
                {selectedMedia.type === 'image' && (
                  <>
                    <p>
                      <strong>Prompt:</strong> {(selectedMedia as GeneratedImage).prompt}
                    </p>
                    {(selectedMedia as GeneratedImage).revisedPrompt && (
                      <p>
                        <strong>Revised:</strong>{(selectedMedia as GeneratedImage).revisedPrompt}
                      </p>
                    )}
                    <p>
                      <strong>Style:</strong> {(selectedMedia as GeneratedImage).style}
                    </p>
                    <p>
                      <strong>Size:</strong> {(selectedMedia as GeneratedImage).size}
                    </p>
                  </>
                )}
                {selectedMedia.type === 'video' && (
                  <>
                    <p>
                      <strong>Duration:</strong> {(selectedMedia as GeneratedVideo).duration.toFixed(1)}s
                    </p>
                    <p>
                      <strong>Resolution:</strong> {(selectedMedia as GeneratedVideo).width}×
                      {(selectedMedia as GeneratedVideo).height}
                    </p>
                    <p>
                      <strong>Format:</strong> {(selectedMedia as GeneratedVideo).format}
                    </p>
                  </>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const url =
                        selectedMedia.type === 'image'
                          ? (selectedMedia as GeneratedImage).s3Url ||
                            (selectedMedia as GeneratedImage).originalUrl ||
                            ''
                          : (selectedMedia as GeneratedVideo).s3Url;
                      const filename =
                        selectedMedia.type === 'image'
                          ? `image-${selectedMedia.id}.png`
                          : `video-${selectedMedia.id}.${(selectedMedia as GeneratedVideo).format}`;
                      handleDownload(url, filename);
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleDelete(selectedMedia.id, selectedMedia.type);
                      setSelectedMedia(null);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

