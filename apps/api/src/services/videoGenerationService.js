/**
 * Video Generation Service
 * Handles video creation from images and basic video editing
 * 
 * @author Henry Maobughichi Ugochukwu
 */

const s3Service = require('./s3Service');
const logger = require('../utils/logger');
const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

const execAsync = promisify(exec);

class VideoGenerationService {
  constructor() {
    this.tempDir = path.join(os.tmpdir(), 'henmo-videos');
    this.ensureTempDir();
  }

  /**
   * Ensure temp directory exists
   */
  async ensureTempDir() {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      logger.warn('Failed to create temp directory', { error: error.message });
    }
  }

  /**
   * Check if ffmpeg is available
   */
  async isFFmpegAvailable() {
    try {
      await execAsync('ffmpeg -version');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Create video from images (slideshow)
   * @param {Array<string>} imageUrls - Array of image URLs or S3 keys
   * @param {Object} options - Video options
   * @returns {Promise<Object>} Video file path and metadata
   */
  async createVideoFromImages(imageUrls, options = {}) {
    const {
      duration = 3, // seconds per image
      fps = 30,
      width = 1920,
      height = 1080,
      transition = 'fade', // fade, slide, none
      outputFormat = 'mp4',
    } = options;

    const ffmpegAvailable = await this.isFFmpegAvailable();

    if (!ffmpegAvailable) {
      // Fallback: Create a placeholder video or return error
      throw new Error('FFmpeg is not installed. Video generation requires FFmpeg to be installed on the server.');
    }

    try {
      const videoId = `video-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const outputPath = path.join(this.tempDir, `${videoId}.${outputFormat}`);

      // Download images to temp directory
      const imagePaths = [];
      for (let i = 0; i < imageUrls.length; i++) {
        const imageUrl = imageUrls[i];
        const imagePath = path.join(this.tempDir, `image-${i}.jpg`);
        
        // Download image (if URL) or copy from S3
        if (imageUrl.startsWith('http')) {
          const https = require('https');
          const http = require('http');
          const url = require('url');
          
          await new Promise((resolve, reject) => {
            const parsedUrl = new URL(imageUrl);
            const client = parsedUrl.protocol === 'https:' ? https : http;
            
            client.get(parsedUrl, (response) => {
              if (response.statusCode !== 200) {
                reject(new Error(`Failed to download image: ${response.statusCode}`));
                return;
              }
              
              const fileStream = require('fs').createWriteStream(imagePath);
              response.pipe(fileStream);
              fileStream.on('finish', () => {
                fileStream.close();
                resolve();
              });
              fileStream.on('error', reject);
            }).on('error', reject);
          });
        } else {
          // Assume it's an S3 key - download directly
          const imageBuffer = await s3Service.getFile(imageUrl);
          await fs.writeFile(imagePath, imageBuffer);
        }
        
        imagePaths.push(imagePath);
      }

      // Create video using ffmpeg
      // Build ffmpeg command for slideshow
      let ffmpegCommand = `ffmpeg -y -framerate ${1 / duration} -pattern_type glob -i "${path.join(this.tempDir, 'image-*.jpg')}"`;
      
      // Add transitions if specified
      if (transition === 'fade') {
        ffmpegCommand += ` -vf "fade=t=in:st=0:d=0.5,fade=t=out:st=${duration - 0.5}:d=0.5"`;
      }
      
      ffmpegCommand += ` -c:v libx264 -pix_fmt yuv420p -r ${fps} -s ${width}x${height} "${outputPath}"`;

      await execAsync(ffmpegCommand);

      // Clean up downloaded images
      for (const imagePath of imagePaths) {
        try {
          await fs.unlink(imagePath);
        } catch (e) {
          // Ignore cleanup errors
        }
      }

      // Read video file
      const videoBuffer = await fs.readFile(outputPath);

      // Clean up temp video file
      try {
        await fs.unlink(outputPath);
      } catch (e) {
        // Ignore cleanup errors
      }

      return {
        buffer: videoBuffer,
        format: outputFormat,
        width,
        height,
        fps,
        duration: imageUrls.length * duration,
        frameCount: imageUrls.length,
      };
    } catch (error) {
      logger.error('Error creating video from images', {
        error: error.message,
        imageCount: imageUrls.length,
      });
      throw error;
    }
  }

  /**
   * Create video and store in S3
   * @param {string} userId - User ID
   * @param {Array<string>} imageUrls - Array of image URLs or S3 keys
   * @param {Object} options - Video options
   * @returns {Promise<Object>} Video record with S3 URL
   */
  async generateAndStoreVideo(userId, imageUrls, options = {}) {
    try {
      // Generate video
      const videoResult = await this.createVideoFromImages(imageUrls, options);

      // Upload to S3
      const filename = `generated-${Date.now()}.${videoResult.format}`;
      const s3Key = s3Service.generateKey(userId, filename, 'videos/generated');
      
      const s3Result = await s3Service.uploadFile(
        videoResult.buffer,
        s3Key,
        `video/${videoResult.format}`,
        {
          userId,
          imageCount: imageUrls.length,
          duration: videoResult.duration,
          width: videoResult.width,
          height: videoResult.height,
          fps: videoResult.fps,
          generatedAt: new Date().toISOString(),
        }
      );

      return {
        s3Key,
        s3Url: s3Result.url,
        format: videoResult.format,
        width: videoResult.width,
        height: videoResult.height,
        fps: videoResult.fps,
        duration: videoResult.duration,
        frameCount: videoResult.frameCount,
        buffer: videoResult.buffer,
      };
    } catch (error) {
      logger.error('Error generating and storing video', {
        error: error.message,
        userId,
      });
      throw error;
    }
  }

  /**
   * Get video metadata
   * @param {Buffer} videoBuffer - Video buffer
   * @returns {Promise<Object>} Video metadata
   */
  async getVideoMetadata(videoBuffer) {
    const ffmpegAvailable = await this.isFFmpegAvailable();

    if (!ffmpegAvailable) {
      return {
        duration: 0,
        width: 0,
        height: 0,
        fps: 0,
        format: 'unknown',
      };
    }

    try {
      const tempPath = path.join(this.tempDir, `temp-${Date.now()}.mp4`);
      await fs.writeFile(tempPath, videoBuffer);

      const { stdout } = await execAsync(
        `ffprobe -v quiet -print_format json -show_format -show_streams "${tempPath}"`
      );

      await fs.unlink(tempPath);

      const metadata = JSON.parse(stdout);
      const videoStream = metadata.streams?.find(s => s.codec_type === 'video');

      return {
        duration: parseFloat(metadata.format?.duration || 0),
        width: videoStream?.width || 0,
        height: videoStream?.height || 0,
        fps: parseFloat(videoStream?.r_frame_rate?.split('/')[0] / videoStream?.r_frame_rate?.split('/')[1] || 0),
        format: metadata.format?.format_name || 'unknown',
        size: parseInt(metadata.format?.size || 0),
      };
    } catch (error) {
      logger.warn('Error getting video metadata', { error: error.message });
      return {
        duration: 0,
        width: 0,
        height: 0,
        fps: 0,
        format: 'unknown',
      };
    }
  }
}

module.exports = new VideoGenerationService();

