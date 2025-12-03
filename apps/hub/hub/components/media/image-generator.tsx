'use client';

import { useState, useEffect } from 'react';
import { Wand2, Loader2, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { mediaApi, type GenerateImageRequest, type GeneratedImage } from '@/lib/api/media';
import { toast } from 'sonner';
import Image from 'next/image';

const PROMPT_SUGGESTIONS = [
  'A futuristic cityscape at sunset',
  'A serene mountain landscape with a lake',
  'A modern office space with plants',
  'A vintage coffee shop interior',
  'An abstract geometric pattern',
];

const STYLES = [
  { value: 'realistic', label: 'Realistic' },
  { value: 'artistic', label: 'Artistic' },
  { value: 'cartoon', label: 'Cartoon' },
  { value: 'abstract', label: 'Abstract' },
  { value: 'vintage', label: 'Vintage' },
] as const;

const SIZES = [
  { value: '1024x1024', label: 'Square (1024×1024)' },
  { value: '1792x1024', label: 'Landscape (1792×1024)' },
  { value: '1024x1792', label: 'Portrait (1024×1792)' },
] as const;

export function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState<GenerateImageRequest['style']>('realistic');
  const [size, setSize] = useState<GenerateImageRequest['size']>('1024x1024');
  const [quality, setQuality] = useState<GenerateImageRequest['quality']>('standard');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  const [recentImages, setRecentImages] = useState<GeneratedImage[]>([]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    try {
      setIsGenerating(true);
      const response = await mediaApi.generateImage({
        prompt: prompt.trim(),
        style,
        size,
        quality,
        addWatermark: true,
      });

      if (response.success && response.data) {
        setGeneratedImage(response.data);
        toast.success('Image generated successfully!');
        // Refresh recent images
        loadRecentImages();
      } else {
        toast.error(response.error || 'Failed to generate image');
      }
    } catch (error) {
      toast.error('Failed to generate image');
      console.error('Error generating image:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const loadRecentImages = async () => {
    try {
      const response = await mediaApi.listImages({ limit: 6 });
      if (response.success && response.data) {
        setRecentImages(response.data);
      }
    } catch (error) {
      console.error('Error loading recent images:', error);
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const response = await mediaApi.deleteImage(imageId);
      if (response.success) {
        toast.success('Image deleted');
        if (generatedImage?.id === imageId) {
          setGeneratedImage(null);
        }
        loadRecentImages();
      } else {
        toast.error(response.error || 'Failed to delete image');
      }
    } catch (error) {
      toast.error('Failed to delete image');
      console.error('Error deleting image:', error);
    }
  };

  const handleDownload = (imageUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Load recent images on mount
  useEffect(() => {
    loadRecentImages();
  }, []);

  return (
    <div className="space-y-6">
      {/* Generation Form */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Image</CardTitle>
          <CardDescription>
            Create AI-generated images using DALL-E 3
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Prompt Input */}
          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt</Label>
            <Input
              id="prompt"
              placeholder="Describe the image you want to generate..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !isGenerating) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
            />
            <div className="flex flex-wrap gap-2">
              {PROMPT_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setPrompt(suggestion)}
                  className="text-xs px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="style">Style</Label>
              <select
                id="style"
                value={style}
                onChange={(e) => setStyle(e.target.value as GenerateImageRequest['style'])}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              >
                {STYLES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Size</Label>
              <select
                id="size"
                value={size}
                onChange={(e) => setSize(e.target.value as GenerateImageRequest['size'])}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              >
                {SIZES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quality">Quality</Label>
              <select
                id="quality"
                value={quality}
                onChange={(e) => setQuality(e.target.value as GenerateImageRequest['quality'])}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              >
                <option value="standard">Standard</option>
                <option value="hd">HD</option>
              </select>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate Image
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Image */}
      {generatedImage && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative aspect-square w-full max-w-2xl mx-auto rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
              <Image
                src={generatedImage.s3Url || generatedImage.originalUrl || ''}
                alt={generatedImage.prompt}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Prompt:</strong> {generatedImage.prompt}
              </p>
              {generatedImage.revisedPrompt && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Revised:</strong> {generatedImage.revisedPrompt}
                </p>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleDownload(
                      generatedImage.s3Url || generatedImage.originalUrl || '',
                      `image-${generatedImage.id}.png`
                    )
                  }
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(generatedImage.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Images */}
      {recentImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {recentImages.map((image) => (
                <div
                  key={image.id}
                  className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 group cursor-pointer"
                  onClick={() => setGeneratedImage(image)}
                >
                  <Image
                    src={image.s3Url || image.originalUrl || ''}
                    alt={image.prompt}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(
                            image.s3Url || image.originalUrl || '',
                            `image-${image.id}.png`
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
                          handleDelete(image.id);
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

