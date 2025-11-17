/**
 * Anti-aliasing utilities for image processing
 */

import {
  MIN_BLUR_RADIUS,
  GAUSSIAN_KERNEL_MULTIPLIER,
} from '../../constants';

/**
 * Applies Gaussian blur to a canvas for anti-aliasing
 *
 * Uses a two-pass separable Gaussian blur for efficiency.
 * This is used as a pre-filter before downsampling to prevent
 * aliasing artifacts, ringing, and oversharpening.
 *
 * @param sourceCanvas - Source canvas to blur
 * @param radius - Blur radius (sigma)
 * @returns Blurred canvas
 */
export function applyGaussianBlur(
  sourceCanvas: HTMLCanvasElement,
  radius: number
): HTMLCanvasElement {
  // Skip if radius too small
  if (radius < MIN_BLUR_RADIUS) {
    return sourceCanvas;
  }

  const srcCtx = sourceCanvas.getContext('2d');
  if (!srcCtx) {
    return sourceCanvas;
  }

  const srcData = srcCtx.getImageData(
    0,
    0,
    sourceCanvas.width,
    sourceCanvas.height
  );
  const dstData = srcCtx.createImageData(sourceCanvas.width, sourceCanvas.height);

  // Generate Gaussian kernel
  const kernelSize = Math.ceil(radius * GAUSSIAN_KERNEL_MULTIPLIER) * 2 + 1;
  const kernel = generateGaussianKernel(kernelSize, radius);

  // Temporary buffer for horizontal pass
  const tempData = new Uint8ClampedArray(srcData.data.length);

  // Horizontal pass
  applyHorizontalBlur(
    srcData.data,
    tempData,
    sourceCanvas.width,
    sourceCanvas.height,
    kernel
  );

  // Vertical pass
  applyVerticalBlur(
    tempData,
    dstData.data,
    sourceCanvas.width,
    sourceCanvas.height,
    kernel
  );

  // Create new canvas with blurred data
  const blurredCanvas = document.createElement('canvas');
  blurredCanvas.width = sourceCanvas.width;
  blurredCanvas.height = sourceCanvas.height;
  const blurredCtx = blurredCanvas.getContext('2d');
  if (blurredCtx) {
    blurredCtx.putImageData(dstData, 0, 0);
  }

  return blurredCanvas;
}

/**
 * Generates a 1D Gaussian kernel
 *
 * @param size - Kernel size
 * @param sigma - Standard deviation (radius)
 * @returns Normalized kernel array
 */
function generateGaussianKernel(size: number, sigma: number): number[] {
  const kernel = new Array(size);
  let kernelSum = 0;
  const center = Math.floor(size / 2);

  // Calculate kernel values
  for (let i = 0; i < size; i++) {
    const x = i - center;
    kernel[i] = Math.exp(-(x * x) / (2 * sigma * sigma));
    kernelSum += kernel[i];
  }

  // Normalize kernel so values sum to 1
  for (let i = 0; i < size; i++) {
    kernel[i] /= kernelSum;
  }

  return kernel;
}

/**
 * Applies horizontal blur pass
 *
 * @param srcData - Source pixel data
 * @param dstData - Destination pixel data
 * @param width - Image width
 * @param height - Image height
 * @param kernel - Gaussian kernel
 */
function applyHorizontalBlur(
  srcData: Uint8ClampedArray,
  dstData: Uint8ClampedArray,
  width: number,
  height: number,
  kernel: number[]
): void {
  const kernelSize = kernel.length;
  const center = Math.floor(kernelSize / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0,
        g = 0,
        b = 0,
        a = 0;

      for (let k = 0; k < kernelSize; k++) {
        const px = Math.max(0, Math.min(width - 1, x + k - center));
        const idx = (y * width + px) * 4;
        const weight = kernel[k];

        r += srcData[idx] * weight;
        g += srcData[idx + 1] * weight;
        b += srcData[idx + 2] * weight;
        a += srcData[idx + 3] * weight;
      }

      const dstIdx = (y * width + x) * 4;
      dstData[dstIdx] = r;
      dstData[dstIdx + 1] = g;
      dstData[dstIdx + 2] = b;
      dstData[dstIdx + 3] = a;
    }
  }
}

/**
 * Applies vertical blur pass
 *
 * @param srcData - Source pixel data
 * @param dstData - Destination pixel data
 * @param width - Image width
 * @param height - Image height
 * @param kernel - Gaussian kernel
 */
function applyVerticalBlur(
  srcData: Uint8ClampedArray,
  dstData: Uint8ClampedArray,
  width: number,
  height: number,
  kernel: number[]
): void {
  const kernelSize = kernel.length;
  const center = Math.floor(kernelSize / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0,
        g = 0,
        b = 0,
        a = 0;

      for (let k = 0; k < kernelSize; k++) {
        const py = Math.max(0, Math.min(height - 1, y + k - center));
        const idx = (py * width + x) * 4;
        const weight = kernel[k];

        r += srcData[idx] * weight;
        g += srcData[idx + 1] * weight;
        b += srcData[idx + 2] * weight;
        a += srcData[idx + 3] * weight;
      }

      const dstIdx = (y * width + x) * 4;
      dstData[dstIdx] = r;
      dstData[dstIdx + 1] = g;
      dstData[dstIdx + 2] = b;
      dstData[dstIdx + 3] = a;
    }
  }
}

/**
 * Calculates optimal blur radius for downsampling
 *
 * Based on the Nyquist frequency to prevent aliasing.
 * Formula: radius = (1.0 / scale - 1.0) * 0.5
 *
 * @param scale - Scaling factor (targetSize / sourceSize)
 * @returns Optimal blur radius
 */
export function calculateBlurRadius(scale: number): number {
  if (scale >= 1.0) {
    return 0; // No blur needed for upsampling
  }

  return (1.0 / scale - 1.0) * 0.5;
}

/**
 * Determines if anti-aliasing should be applied
 *
 * @param scale - Scaling factor
 * @param threshold - Threshold for significant downsampling (default: 0.67)
 * @returns True if anti-aliasing should be applied
 */
export function shouldApplyAntialiasing(
  scale: number,
  threshold: number = 0.67
): boolean {
  return scale < threshold;
}
