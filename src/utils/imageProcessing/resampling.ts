/**
 * Image resampling algorithms
 */

import type { ResamplingMethod } from '../../types';
import {
  LANCZOS_WINDOW_SIZE,
  BLUR_THRESHOLD,
  SIGNIFICANT_DOWNSAMPLE_THRESHOLD,
} from '../../constants';
import { applyGaussianBlur, calculateBlurRadius } from './antialiasing';

/**
 * Resamples an image using the specified method
 *
 * Automatically applies anti-aliasing pre-filter for downsampling
 * to prevent aliasing artifacts.
 *
 * @param sourceCanvas - Source canvas
 * @param targetWidth - Target width
 * @param targetHeight - Target height
 * @param method - Resampling method
 * @returns Resampled canvas
 */
export function resampleImage(
  sourceCanvas: HTMLCanvasElement,
  targetWidth: number,
  targetHeight: number,
  method: ResamplingMethod
): HTMLCanvasElement {
  const targetCanvas = document.createElement('canvas');
  targetCanvas.width = targetWidth;
  targetCanvas.height = targetHeight;

  // Calculate downsampling ratio
  const scaleX = targetWidth / sourceCanvas.width;
  const scaleY = targetHeight / sourceCanvas.height;
  const minScale = Math.min(scaleX, scaleY);

  // Apply anti-aliasing pre-filter if downsampling significantly
  let processedCanvas = sourceCanvas;
  if (minScale < SIGNIFICANT_DOWNSAMPLE_THRESHOLD && method !== 'nearest' && method !== 'browser') {
    const blurRadius = calculateBlurRadius(minScale);

    if (blurRadius > BLUR_THRESHOLD) {
      processedCanvas = applyGaussianBlur(sourceCanvas, blurRadius);
    }
  }

  switch (method) {
    case 'nearest':
      return resampleNearestNeighbor(processedCanvas, targetCanvas);
    case 'bilinear':
      return resampleBilinear(processedCanvas, targetCanvas);
    case 'bicubic':
      return resampleBicubic(processedCanvas, targetCanvas);
    case 'lanczos':
      return resampleLanczos(processedCanvas, targetCanvas);
    case 'browser':
    default:
      return resampleBrowser(processedCanvas, targetCanvas);
  }
}

/**
 * Nearest neighbor resampling (fast, preserves sharp edges)
 *
 * Best for pixel art and images where sharp edges are important.
 *
 * @param srcCanvas - Source canvas
 * @param dstCanvas - Destination canvas (pre-sized)
 * @returns Destination canvas
 */
export function resampleNearestNeighbor(
  srcCanvas: HTMLCanvasElement,
  dstCanvas: HTMLCanvasElement
): HTMLCanvasElement {
  const srcCtx = srcCanvas.getContext('2d');
  const dstCtx = dstCanvas.getContext('2d');

  if (!srcCtx || !dstCtx) {
    return dstCanvas;
  }

  const srcData = srcCtx.getImageData(0, 0, srcCanvas.width, srcCanvas.height);
  const dstData = dstCtx.createImageData(dstCanvas.width, dstCanvas.height);

  const xRatio = srcCanvas.width / dstCanvas.width;
  const yRatio = srcCanvas.height / dstCanvas.height;

  for (let y = 0; y < dstCanvas.height; y++) {
    for (let x = 0; x < dstCanvas.width; x++) {
      const srcX = Math.floor(x * xRatio);
      const srcY = Math.floor(y * yRatio);
      const srcIdx = (srcY * srcCanvas.width + srcX) * 4;
      const dstIdx = (y * dstCanvas.width + x) * 4;

      dstData.data[dstIdx] = srcData.data[srcIdx];
      dstData.data[dstIdx + 1] = srcData.data[srcIdx + 1];
      dstData.data[dstIdx + 2] = srcData.data[srcIdx + 2];
      dstData.data[dstIdx + 3] = srcData.data[srcIdx + 3];
    }
  }

  dstCtx.putImageData(dstData, 0, 0);
  return dstCanvas;
}

/**
 * Bilinear resampling (fast and smooth)
 *
 * Good balance between speed and quality for most use cases.
 *
 * @param srcCanvas - Source canvas
 * @param dstCanvas - Destination canvas (pre-sized)
 * @returns Destination canvas
 */
export function resampleBilinear(
  srcCanvas: HTMLCanvasElement,
  dstCanvas: HTMLCanvasElement
): HTMLCanvasElement {
  const srcCtx = srcCanvas.getContext('2d');
  const dstCtx = dstCanvas.getContext('2d');

  if (!srcCtx || !dstCtx) {
    return dstCanvas;
  }

  const srcData = srcCtx.getImageData(0, 0, srcCanvas.width, srcCanvas.height);
  const dstData = dstCtx.createImageData(dstCanvas.width, dstCanvas.height);

  const xRatio = (srcCanvas.width - 1) / dstCanvas.width;
  const yRatio = (srcCanvas.height - 1) / dstCanvas.height;

  const getPixel = (px: number, py: number): [number, number, number, number] => {
    const idx = (py * srcCanvas.width + px) * 4;
    return [
      srcData.data[idx],
      srcData.data[idx + 1],
      srcData.data[idx + 2],
      srcData.data[idx + 3],
    ];
  };

  for (let y = 0; y < dstCanvas.height; y++) {
    for (let x = 0; x < dstCanvas.width; x++) {
      const srcX = x * xRatio;
      const srcY = y * yRatio;
      const x1 = Math.floor(srcX);
      const y1 = Math.floor(srcY);
      const x2 = Math.min(x1 + 1, srcCanvas.width - 1);
      const y2 = Math.min(y1 + 1, srcCanvas.height - 1);
      const xWeight = srcX - x1;
      const yWeight = srcY - y1;

      const p1 = getPixel(x1, y1);
      const p2 = getPixel(x2, y1);
      const p3 = getPixel(x1, y2);
      const p4 = getPixel(x2, y2);

      const dstIdx = (y * dstCanvas.width + x) * 4;
      for (let c = 0; c < 4; c++) {
        const top = p1[c] * (1 - xWeight) + p2[c] * xWeight;
        const bottom = p3[c] * (1 - xWeight) + p4[c] * xWeight;
        dstData.data[dstIdx + c] = top * (1 - yWeight) + bottom * yWeight;
      }
    }
  }

  dstCtx.putImageData(dstData, 0, 0);
  return dstCanvas;
}

/**
 * Bicubic resampling (recommended for most uses)
 *
 * Excellent quality-to-speed ratio. Uses 4x4 pixel grid for interpolation.
 *
 * @param srcCanvas - Source canvas
 * @param dstCanvas - Destination canvas (pre-sized)
 * @returns Destination canvas
 */
export function resampleBicubic(
  srcCanvas: HTMLCanvasElement,
  dstCanvas: HTMLCanvasElement
): HTMLCanvasElement {
  const srcCtx = srcCanvas.getContext('2d');
  const dstCtx = dstCanvas.getContext('2d');

  if (!srcCtx || !dstCtx) {
    return dstCanvas;
  }

  const srcData = srcCtx.getImageData(0, 0, srcCanvas.width, srcCanvas.height);
  const dstData = dstCtx.createImageData(dstCanvas.width, dstCanvas.height);

  const xRatio = srcCanvas.width / dstCanvas.width;
  const yRatio = srcCanvas.height / dstCanvas.height;

  /**
   * Cubic interpolation kernel
   */
  const cubicInterpolate = (p: number[], x: number): number => {
    return (
      p[1] +
      0.5 *
        x *
        (p[2] -
          p[0] +
          x *
            (2.0 * p[0] -
              5.0 * p[1] +
              4.0 * p[2] -
              p[3] +
              x * (3.0 * (p[1] - p[2]) + p[3] - p[0])))
    );
  };

  const getPixel = (x: number, y: number): [number, number, number, number] => {
    x = Math.max(0, Math.min(Math.floor(x), srcCanvas.width - 1));
    y = Math.max(0, Math.min(Math.floor(y), srcCanvas.height - 1));
    const idx = (y * srcCanvas.width + x) * 4;
    return [
      srcData.data[idx],
      srcData.data[idx + 1],
      srcData.data[idx + 2],
      srcData.data[idx + 3],
    ];
  };

  for (let y = 0; y < dstCanvas.height; y++) {
    for (let x = 0; x < dstCanvas.width; x++) {
      const srcX = x * xRatio;
      const srcY = y * yRatio;
      const xFloor = Math.floor(srcX);
      const yFloor = Math.floor(srcY);
      const xFrac = srcX - xFloor;
      const yFrac = srcY - yFloor;

      // Sample 4x4 grid
      const pixels: [number, number, number, number][][] = [];
      for (let dy = -1; dy <= 2; dy++) {
        const row: [number, number, number, number][] = [];
        for (let dx = -1; dx <= 2; dx++) {
          row.push(getPixel(xFloor + dx, yFloor + dy));
        }
        pixels.push(row);
      }

      const dstIdx = (y * dstCanvas.width + x) * 4;
      for (let c = 0; c < 4; c++) {
        const col = [
          cubicInterpolate(
            [pixels[0][0][c], pixels[0][1][c], pixels[0][2][c], pixels[0][3][c]],
            xFrac
          ),
          cubicInterpolate(
            [pixels[1][0][c], pixels[1][1][c], pixels[1][2][c], pixels[1][3][c]],
            xFrac
          ),
          cubicInterpolate(
            [pixels[2][0][c], pixels[2][1][c], pixels[2][2][c], pixels[2][3][c]],
            xFrac
          ),
          cubicInterpolate(
            [pixels[3][0][c], pixels[3][1][c], pixels[3][2][c], pixels[3][3][c]],
            xFrac
          ),
        ];
        dstData.data[dstIdx + c] = Math.max(0, Math.min(255, cubicInterpolate(col, yFrac)));
      }
    }
  }

  dstCtx.putImageData(dstData, 0, 0);
  return dstCanvas;
}

/**
 * Lanczos resampling (highest quality for downsampling)
 *
 * Best quality but slower. Uses sinc-based windowed kernel.
 *
 * @param srcCanvas - Source canvas
 * @param dstCanvas - Destination canvas (pre-sized)
 * @returns Destination canvas
 */
export function resampleLanczos(
  srcCanvas: HTMLCanvasElement,
  dstCanvas: HTMLCanvasElement
): HTMLCanvasElement {
  const srcCtx = srcCanvas.getContext('2d');
  const dstCtx = dstCanvas.getContext('2d');

  if (!srcCtx || !dstCtx) {
    return dstCanvas;
  }

  const srcData = srcCtx.getImageData(0, 0, srcCanvas.width, srcCanvas.height);
  const dstData = dstCtx.createImageData(dstCanvas.width, dstCanvas.height);

  const xRatio = srcCanvas.width / dstCanvas.width;
  const yRatio = srcCanvas.height / dstCanvas.height;

  /**
   * Lanczos kernel function
   */
  const lanczos = (x: number): number => {
    if (x === 0) return 1;
    if (Math.abs(x) >= LANCZOS_WINDOW_SIZE) return 0;
    return (
      (LANCZOS_WINDOW_SIZE *
        Math.sin(Math.PI * x) *
        Math.sin((Math.PI * x) / LANCZOS_WINDOW_SIZE)) /
      (Math.PI * Math.PI * x * x)
    );
  };

  const getPixel = (x: number, y: number): [number, number, number, number] => {
    x = Math.max(0, Math.min(Math.floor(x), srcCanvas.width - 1));
    y = Math.max(0, Math.min(Math.floor(y), srcCanvas.height - 1));
    const idx = (y * srcCanvas.width + x) * 4;
    return [
      srcData.data[idx],
      srcData.data[idx + 1],
      srcData.data[idx + 2],
      srcData.data[idx + 3],
    ];
  };

  for (let y = 0; y < dstCanvas.height; y++) {
    for (let x = 0; x < dstCanvas.width; x++) {
      const srcX = x * xRatio;
      const srcY = y * yRatio;
      const xFloor = Math.floor(srcX);
      const yFloor = Math.floor(srcY);

      let r = 0,
        g = 0,
        b = 0,
        alpha = 0,
        weight = 0;

      for (let dy = -LANCZOS_WINDOW_SIZE + 1; dy < LANCZOS_WINDOW_SIZE; dy++) {
        for (let dx = -LANCZOS_WINDOW_SIZE + 1; dx < LANCZOS_WINDOW_SIZE; dx++) {
          const pixel = getPixel(xFloor + dx, yFloor + dy);
          const w = lanczos(srcX - (xFloor + dx)) * lanczos(srcY - (yFloor + dy));
          r += pixel[0] * w;
          g += pixel[1] * w;
          b += pixel[2] * w;
          alpha += pixel[3] * w;
          weight += w;
        }
      }

      const dstIdx = (y * dstCanvas.width + x) * 4;
      dstData.data[dstIdx] = Math.max(0, Math.min(255, r / weight));
      dstData.data[dstIdx + 1] = Math.max(0, Math.min(255, g / weight));
      dstData.data[dstIdx + 2] = Math.max(0, Math.min(255, b / weight));
      dstData.data[dstIdx + 3] = Math.max(0, Math.min(255, alpha / weight));
    }
  }

  dstCtx.putImageData(dstData, 0, 0);
  return dstCanvas;
}

/**
 * Browser default resampling (uses browser's native algorithm)
 *
 * Fast and let's the browser handle it. Quality varies by browser.
 *
 * @param srcCanvas - Source canvas
 * @param dstCanvas - Destination canvas (pre-sized)
 * @returns Destination canvas
 */
export function resampleBrowser(
  srcCanvas: HTMLCanvasElement,
  dstCanvas: HTMLCanvasElement
): HTMLCanvasElement {
  const ctx = dstCanvas.getContext('2d');

  if (!ctx) {
    return dstCanvas;
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(srcCanvas, 0, 0, dstCanvas.width, dstCanvas.height);

  return dstCanvas;
}
