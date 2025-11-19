import { ResamplingMethod } from '../../types';
import { resampleImage } from './resampling';
import { SIGNIFICANT_DOWNSAMPLE_THRESHOLD } from '../../constants/processing';

export interface ConversionParams {
  image: HTMLImageElement;
  cropX: number;
  cropY: number;
  cropWidth: number;
  cropHeight: number;
  maxWidth: string;
  maxHeight: string;
  resamplingMethod: ResamplingMethod;
}

export interface ConversionResult {
  canvas: HTMLCanvasElement;
  finalWidth: number;
  finalHeight: number;
  needsResampling: boolean;
}

/**
 * Crop and optionally resize image
 */
export function prepareImageForConversion(params: ConversionParams): ConversionResult {
  const { image, cropX, cropY, cropWidth, cropHeight, maxWidth, maxHeight, resamplingMethod } = params;

  // Calculate final dimensions
  let finalWidth = cropWidth;
  let finalHeight = cropHeight;

  // Apply max dimensions if specified
  const maxW = maxWidth ? parseInt(maxWidth) : null;
  const maxH = maxHeight ? parseInt(maxHeight) : null;

  if (maxW && finalWidth > maxW && finalWidth > 0) {
    const ratio = maxW / finalWidth;
    finalWidth = maxW;
    finalHeight = finalHeight * ratio;
  }

  if (maxH && finalHeight > maxH && finalHeight > 0) {
    const ratio = maxH / finalHeight;
    finalHeight = maxH;
    finalWidth = finalWidth * ratio;
  }

  // Create a canvas with the cropped region at original size
  const cropCanvas = document.createElement('canvas');
  cropCanvas.width = cropWidth;
  cropCanvas.height = cropHeight;
  const cropCtx = cropCanvas.getContext('2d')!;

  // Draw the cropped portion at original size
  cropCtx.drawImage(
    image,
    cropX, cropY, cropWidth, cropHeight,
    0, 0, cropWidth, cropHeight
  );

  // Check if resampling is needed
  const needsResampling = Math.round(finalWidth) !== cropWidth || Math.round(finalHeight) !== cropHeight;

  let tempCanvas: HTMLCanvasElement;
  if (needsResampling && resamplingMethod !== 'browser') {
    tempCanvas = resampleImage(cropCanvas, Math.round(finalWidth), Math.round(finalHeight), resamplingMethod);
  } else {
    // Use browser's native resampling
    tempCanvas = document.createElement('canvas');
    tempCanvas.width = Math.round(finalWidth);
    tempCanvas.height = Math.round(finalHeight);
    const ctx = tempCanvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(cropCanvas, 0, 0, Math.round(finalWidth), Math.round(finalHeight));
  }

  return {
    canvas: tempCanvas,
    finalWidth: Math.round(finalWidth),
    finalHeight: Math.round(finalHeight),
    needsResampling
  };
}

/**
 * Get optimization status message
 */
export function getOptimizationStatus(
  needsResampling: boolean,
  resamplingMethod: ResamplingMethod,
  finalWidth: number,
  finalHeight: number,
  cropWidth: number,
  cropHeight: number
): string {
  if (!needsResampling) {
    return 'Converting to WebP...';
  }

  const scaleRatio = Math.min(finalWidth / cropWidth, finalHeight / cropHeight);
  const isDownsampling = scaleRatio < 1.0;

  if (isDownsampling && scaleRatio < SIGNIFICANT_DOWNSAMPLE_THRESHOLD) {
    return `Applying anti-aliasing and resampling with ${resamplingMethod}...`;
  } else {
    return `Resampling with ${resamplingMethod}...`;
  }
}

