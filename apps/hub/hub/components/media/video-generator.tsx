'use client';

import { useState, useEffect } from 'react';
import { Video, Loader2, Download, Trash2, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { mediaApi, type GenerateVideoRequest, type GeneratedVideo } from '@/lib/api/media';
import { toast } from 'sonner';

export function VideoGenerator() {
  const [imageUrls, setImageUrls] = useState<string[]>(['']);
  const [duration, setDuration] = useState(3);
  const [fps, setFps] = useState(30);
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [transition, setTransition] = useState<GenerateVideoRequest['transition']>('fade');
  const [outputFormat, setOutputFormat] = useState<GenerateVideoRequest['outputFormat']>('mp4');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<GeneratedVideo | null>(null);
  const [recentVideos, setRecentVideos] = useState<GeneratedVideo[]>([]);

  const handleAddImageUrl = () => {
    setImageUrls([...imageUrls, '']);
  };

  const handleRemoveImageUrl = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleImageUrlChange = (index: number, value: string) => {
    const newUrls = [...imageUrls];
    newUrls[index] = value;
    setImageUrls(newUrls);
  };

  const handleGenerate = async () => {
    const validUrls = imageUrls.filter((url) => url.trim());
    if (validUrls.length === 0) {
      toast.error('Please add at least one image URL');
      return;
    }

    try {
      setIsGenerating(true);
      const response = await mediaApi.generateVideo({
        imageUrls: validUrls,
        duration,
        fps,
        width,
        height,
        transition,
        outputFormat,
      });

      if (response.success && response.data) {
        setGeneratedVideo(response.data);
        toast.success('Video generated successfully!');
        loadRecentVideos();
      } else {
        toast.error(response.error || 'Failed to generate video');
      }
    } catch (error) {
      toast.error('Failed to generate video');
      console.error('Error generating video:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const loadRecentVideos = async () => {
    try {
      const response = await mediaApi.listVideos({ limit: 6 });
      if (response.success && response.data) {
        setRecentVideos(response.data);
      }
    } catch (error) {
      console.error('Error loading recent videos:', error);
    }
  };

  const handleDelete = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      const response = await mediaApi.deleteVideo(videoId);
      if (response.success) {
        toast.success('Video deleted');
        if (generatedVideo?.id === videoId) {
          setGeneratedVideo(null);
        }
        loadRecentVideos();
      } else {
        toast.error(response.error || 'Failed to delete video');
      }
    } catch (error) {
      toast.error('Failed to delete video');
      console.error('Error deleting video:', error);
    }
  };

  const handleDownload = (videoUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    loadRecentVideos();
  }, []);

  return (
    <div className="space-y-6">
      {/* Generation Form */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Video</CardTitle>
          <CardDescription>
            Create a video slideshow from multiple images
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Image URLs */}
          <div className="space-y-2">
            <Label>Image URLs</Label>
            <div className="space-y-2">
              {imageUrls.map((url, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Enter image URL or S3 key..."
                    value={url}
                    onChange={(e) => handleImageUrlChange(index, e.target.value)}
                  />
                  {imageUrls.length > 1 && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemoveImageUrl(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddImageUrl}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Image URL
            </Button>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration per Image (seconds)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="10"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 3)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fps">Frame Rate (FPS)</Label>
              <Input
                id="fps"
                type="number"
                min="24"
                max="60"
                value={fps}
                onChange={(e) => setFps(parseInt(e.target.value) || 30)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="transition">Transition</Label>
              <select
                id="transition"
                value={transition}
                onChange={(e) =>
                  setTransition(e.target.value as GenerateVideoRequest['transition'])
                }
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              >
                <option value="fade">Fade</option>
                <option value="slide">Slide</option>
                <option value="none">None</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="width">Width</Label>
              <Input
                id="width"
                type="number"
                min="480"
                max="3840"
                value={width}
                onChange={(e) => setWidth(parseInt(e.target.value) || 1920)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="height">Height</Label>
              <Input
                id="height"
                type="number"
                min="270"
                max="2160"
                value={height}
                onChange={(e) => setHeight(parseInt(e.target.value) || 1080)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="format">Output Format</Label>
              <select
                id="format"
                value={outputFormat}
                onChange={(e) =>
                  setOutputFormat(e.target.value as GenerateVideoRequest['outputFormat'])
                }
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              >
                <option value="mp4">MP4</option>
                <option value="webm">WebM</option>
              </select>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || imageUrls.filter((url) => url.trim()).length === 0}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Video...
              </>
            ) : (
              <>
                <Video className="mr-2 h-4 w-4" />
                Generate Video
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Video */}
      {generatedVideo && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Video</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative aspect-video w-full max-w-4xl mx-auto rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
              <video
                src={generatedVideo.s3Url}
                controls
                className="w-full h-full object-contain"
              >
                Your browser does not support the video tag.
              </video>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <strong>Duration:</strong> {generatedVideo.duration.toFixed(1)}s
                </div>
                <div>
                  <strong>Resolution:</strong> {generatedVideo.width}×{generatedVideo.height}
                </div>
                <div>
                  <strong>FPS:</strong> {generatedVideo.fps || 'N/A'}
                </div>
                <div>
                  <strong>Format:</strong> {generatedVideo.format}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleDownload(
                      generatedVideo.s3Url,
                      `video-${generatedVideo.id}.${generatedVideo.format}`
                    )
                  }
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(generatedVideo.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Videos */}
      {recentVideos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Videos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentVideos.map((video) => (
                <div
                  key={video.id}
                  className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 group cursor-pointer"
                  onClick={() => setGeneratedVideo(video)}
                >
                  <video
                    src={video.s3Url}
                    className="w-full h-full object-cover"
                    muted
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(
                            video.s3Url,
                            `video-${video.id}.${video.format}`
                          );
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(video.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

