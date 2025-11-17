/**
 * File naming utilities
 */

import type { FilenameTemplateVars } from '../../types';

/**
 * Generates a filename for converted WebP image
 *
 * Format: image-YYYY-MM-DD-WIDTHxHEIGHTpx-qQUALITY.webp
 * Example: image-2025-11-17-1920x1080px-q85.webp
 *
 * @param width - Image width in pixels
 * @param height - Image height in pixels
 * @param quality - Quality value (0-100) or 'LL' for lossless
 * @param originalName - Optional original filename
 * @returns Generated filename
 */
export function generateWebPFilename(
  width: number,
  height: number,
  quality: number | 'LL',
  originalName?: string
): string {
  const date = new Date().toISOString().split('T')[0];
  const resolution = `${Math.round(width)}x${Math.round(height)}px`;
  const qualityStr = quality === 'LL' ? 'qLL' : `q${quality}`;

  if (originalName) {
    // Remove extension from original name
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
    return `${nameWithoutExt}-${date}-${resolution}-${qualityStr}.webp`;
  }

  return `image-${date}-${resolution}-${qualityStr}.webp`;
}

/**
 * Generates a filename from template variables
 *
 * @param vars - Template variables
 * @returns Generated filename
 */
export function generateFilenameFromTemplate(
  vars: FilenameTemplateVars
): string {
  const { date, width, height, quality, originalName } = vars;
  const resolution = `${width}x${height}px`;

  if (originalName) {
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
    return `${nameWithoutExt}-${date}-${resolution}-${quality}.webp`;
  }

  return `image-${date}-${resolution}-${quality}.webp`;
}

/**
 * Generates a filename for pasted images
 *
 * Format: pasted-image-TIMESTAMP.ext
 * Example: pasted-image-2025-11-17T14-30-45.png
 *
 * @param mimeType - MIME type of the image (e.g., 'image/png')
 * @returns Generated filename for pasted image
 */
export function generatePastedImageFilename(mimeType: string = 'image/png'): string {
  const timestamp = new Date()
    .toISOString()
    .replace(/:/g, '-')
    .replace(/\..+/, '');
  const extension = mimeType.split('/')[1] || 'png';
  return `pasted-image-${timestamp}.${extension}`;
}

/**
 * Sanitizes a filename by removing invalid characters
 *
 * @param filename - Filename to sanitize
 * @returns Sanitized filename
 */
export function sanitizeFilename(filename: string): string {
  // Remove invalid filename characters
  return filename
    .replace(/[<>:"/\\|?*]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Extracts filename without extension
 *
 * @param filename - Full filename
 * @returns Filename without extension
 */
export function getFilenameWithoutExtension(filename: string): string {
  return filename.replace(/\.[^/.]+$/, '');
}

/**
 * Gets file extension from filename
 *
 * @param filename - Full filename
 * @returns File extension (including dot) or empty string
 */
export function getFileExtension(filename: string): string {
  const match = filename.match(/\.[^/.]+$/);
  return match ? match[0] : '';
}
