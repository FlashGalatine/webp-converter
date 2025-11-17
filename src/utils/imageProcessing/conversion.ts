/**
 * Image conversion utilities
 */

import type { DimensionConstraints, QualityOptimizationResult } from '../../types';

/**
 * Applies max width and height constraints to dimensions
 *
 * Maintains aspect ratio while respecting constraints.
 *
 * @param width - Current width
 * @param height - Current height
 * @param constraints - Max width and height constraints
 * @returns Constrained dimensions
 */
export function applyDimensionConstraints(
  width: number,
  height: number,
  constraints: DimensionConstraints
): { width: number; height: number } {
  let finalWidth = width;
  let finalHeight = height;

  const { maxWidth, maxHeight } = constraints;

  // Apply max width constraint
  if (maxWidth && finalWidth > maxWidth && finalWidth > 0) {
    const ratio = maxWidth / finalWidth;
    finalWidth = maxWidth;
    finalHeight = finalHeight * ratio;
  }

  // Apply max height constraint
  if (maxHeight && finalHeight > maxHeight && finalHeight > 0) {
    const ratio = maxHeight / finalHeight;
    finalHeight = maxHeight;
    finalWidth = finalWidth * ratio;
  }

  return {
    width: Math.round(finalWidth),
    height: Math.round(finalHeight),
  };
}

/**
 * Creates a canvas with the cropped region from an image
 *
 * @param image - Source image element
 * @param cropX - Crop X position
 * @param cropY - Crop Y position
 * @param cropWidth - Crop width
 * @param cropHeight - Crop height
 * @returns Canvas with cropped region
 */
export function createCroppedCanvas(
  image: HTMLImageElement,
  cropX: number,
  cropY: number,
  cropWidth: number,
  cropHeight: number
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = cropWidth;
  canvas.height = cropHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas 2D context');
  }

  // Draw the cropped portion at original size
  ctx.drawImage(image, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

  return canvas;
}

/**
 * Converts a canvas to WebP blob
 *
 * @param canvas - Source canvas
 * @param quality - Quality (0-100) or 'lossless'
 * @returns Promise resolving to WebP blob
 */
export async function convertCanvasToWebP(
  canvas: HTMLCanvasElement,
  quality: number | 'lossless'
): Promise<Blob> {
  const qualityValue = quality === 'lossless' ? 1 : quality / 100;

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/webp', qualityValue);
  });

  if (!blob) {
    throw new Error('Failed to convert canvas to WebP blob');
  }

  return blob;
}

/**
 * Finds optimal quality level to meet target file size
 *
 * Iterates from quality 100 down to 1, testing each level.
 *
 * @param canvas - Source canvas
 * @param targetSizeBytes - Target file size in bytes
 * @param onProgress - Progress callback (quality, current, total)
 * @returns Promise resolving to optimization result
 */
export async function optimizeQualityForSize(
  canvas: HTMLCanvasElement,
  targetSizeBytes: number,
  onProgress?: (quality: number, current: number, total: number) => void
): Promise<QualityOptimizationResult> {
  // Try lossless first
  const losslessBlob = await convertCanvasToWebP(canvas, 'lossless');

  if (losslessBlob.size <= targetSizeBytes) {
    return {
      blob: losslessBlob,
      quality: 'lossless',
      size: losslessBlob.size,
      metTargetSize: true,
    };
  }

  // Try quality levels from 100 down to 1
  for (let q = 100; q >= 1; q--) {
    if (onProgress) {
      onProgress(q, 100 - q + 1, 100);
    }

    const blob = await convertCanvasToWebP(canvas, q);

    if (blob.size <= targetSizeBytes) {
      return {
        blob,
        quality: q,
        size: blob.size,
        metTargetSize: true,
      };
    }
  }

  // If even quality 1 is too large, return quality 1 anyway
  const minQualityBlob = await convertCanvasToWebP(canvas, 1);

  return {
    blob: minQualityBlob,
    quality: 1,
    size: minQualityBlob.size,
    metTargetSize: false,
  };
}

/**
 * Checks if resampling is needed based on dimensions
 *
 * @param sourceWidth - Source width
 * @param sourceHeight - Source height
 * @param targetWidth - Target width
 * @param targetHeight - Target height
 * @returns True if resampling is needed
 */
export function needsResampling(
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number
): boolean {
  return (
    Math.round(targetWidth) !== Math.round(sourceWidth) ||
    Math.round(targetHeight) !== Math.round(sourceHeight)
  );
}

/**
 * Calculates downsampling ratio
 *
 * @param sourceWidth - Source width
 * @param sourceHeight - Source height
 * @param targetWidth - Target width
 * @param targetHeight - Target height
 * @returns Downsampling ratio (< 1 for downsampling, >= 1 for upsampling)
 */
export function calculateDownsamplingRatio(
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number
): number {
  return Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight);
}

/**
 * Parses file size string to bytes
 *
 * @param size - Size value (e.g., 1.5)
 * @param unit - Unit (KB, MB, GB)
 * @returns Size in bytes
 */
export function parseFileSizeToBytes(size: number, unit: 'KB' | 'MB' | 'GB'): number {
  const multipliers = {
    KB: 1024,
    MB: 1024 * 1024,
    GB: 1024 * 1024 * 1024,
  };

  return size * multipliers[unit];
}

/**
 * Formats bytes to human-readable file size
 *
 * @param bytes - Size in bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}
