import { LANCZOS_WINDOW_SIZE, BLUR_THRESHOLD, MIN_BLUR_RADIUS, GAUSSIAN_KERNEL_MULTIPLIER } from '../../constants/processing';
import { ResamplingMethod } from '../../types';

// Gaussian blur for anti-aliasing pre-filter (inlined to avoid module resolution issues)
function applyGaussianBlur(sourceCanvas: HTMLCanvasElement, radius: number): HTMLCanvasElement {
  if (radius < MIN_BLUR_RADIUS) return sourceCanvas;

  const srcCtx = sourceCanvas.getContext('2d')!;
  const srcData = srcCtx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
  const dstData = srcCtx.createImageData(sourceCanvas.width, sourceCanvas.height);

  const kernelSize = Math.ceil(radius * GAUSSIAN_KERNEL_MULTIPLIER) * 2 + 1;
  const kernel = new Array(kernelSize);
  const sigma = radius;
  let kernelSum = 0;

  const center = Math.floor(kernelSize / 2);
  for (let i = 0; i < kernelSize; i++) {
    const x = i - center;
    kernel[i] = Math.exp(-(x * x) / (2 * sigma * sigma));
    kernelSum += kernel[i];
  }

  for (let i = 0; i < kernelSize; i++) {
    kernel[i] /= kernelSum;
  }

  const tempData = new Uint8ClampedArray(srcData.data.length);

  for (let y = 0; y < sourceCanvas.height; y++) {
    for (let x = 0; x < sourceCanvas.width; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let k = 0; k < kernelSize; k++) {
        const px = Math.max(0, Math.min(sourceCanvas.width - 1, x + k - center));
        const idx = (y * sourceCanvas.width + px) * 4;
        const weight = kernel[k];
        r += srcData.data[idx] * weight;
        g += srcData.data[idx + 1] * weight;
        b += srcData.data[idx + 2] * weight;
        a += srcData.data[idx + 3] * weight;
      }
      const dstIdx = (y * sourceCanvas.width + x) * 4;
      tempData[dstIdx] = r;
      tempData[dstIdx + 1] = g;
      tempData[dstIdx + 2] = b;
      tempData[dstIdx + 3] = a;
    }
  }

  for (let y = 0; y < sourceCanvas.height; y++) {
    for (let x = 0; x < sourceCanvas.width; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let k = 0; k < kernelSize; k++) {
        const py = Math.max(0, Math.min(sourceCanvas.height - 1, y + k - center));
        const idx = (py * sourceCanvas.width + x) * 4;
        const weight = kernel[k];
        r += tempData[idx] * weight;
        g += tempData[idx + 1] * weight;
        b += tempData[idx + 2] * weight;
        a += tempData[idx + 3] * weight;
      }
      const dstIdx = (y * sourceCanvas.width + x) * 4;
      dstData.data[dstIdx] = r;
      dstData.data[dstIdx + 1] = g;
      dstData.data[dstIdx + 2] = b;
      dstData.data[dstIdx + 3] = a;
    }
  }

  const blurredCanvas = document.createElement('canvas');
  blurredCanvas.width = sourceCanvas.width;
  blurredCanvas.height = sourceCanvas.height;
  const blurredCtx = blurredCanvas.getContext('2d')!;
  blurredCtx.putImageData(dstData, 0, 0);
  return blurredCanvas;
}

/**
 * Resample image with adaptive anti-aliasing
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
  const targetCtx = targetCanvas.getContext('2d')!;

  // Calculate downsampling ratio
  const scaleX = targetWidth / sourceCanvas.width;
  const scaleY = targetHeight / sourceCanvas.height;
  const minScale = Math.min(scaleX, scaleY);

  // Apply anti-aliasing pre-filter if downsampling significantly
  // Use adaptive radius based on downsampling ratio
  let processedCanvas = sourceCanvas;
  if (minScale < 1.0 && method !== 'nearest' && method !== 'browser') {
    // Calculate blur radius based on Nyquist frequency
    // For 2x downsampling (0.5 scale), radius ≈ 0.5
    // For 4x downsampling (0.25 scale), radius ≈ 1.5, etc.
    const blurRadius = Math.max(0, (1.0 / minScale - 1.0) * 0.5);

    if (blurRadius > BLUR_THRESHOLD) { // Only apply if meaningful
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
    default:
      // Fallback to browser's native resampling
      targetCtx.imageSmoothingEnabled = true;
      targetCtx.imageSmoothingQuality = 'high';
      targetCtx.drawImage(processedCanvas, 0, 0, targetWidth, targetHeight);
      return targetCanvas;
  }
}

function resampleNearestNeighbor(srcCanvas: HTMLCanvasElement, dstCanvas: HTMLCanvasElement): HTMLCanvasElement {
  const srcCtx = srcCanvas.getContext('2d')!;
  const dstCtx = dstCanvas.getContext('2d')!;
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

function resampleBilinear(srcCanvas: HTMLCanvasElement, dstCanvas: HTMLCanvasElement): HTMLCanvasElement {
  const srcCtx = srcCanvas.getContext('2d')!;
  const dstCtx = dstCanvas.getContext('2d')!;
  const srcData = srcCtx.getImageData(0, 0, srcCanvas.width, srcCanvas.height);
  const dstData = dstCtx.createImageData(dstCanvas.width, dstCanvas.height);

  const xRatio = (srcCanvas.width - 1) / dstCanvas.width;
  const yRatio = (srcCanvas.height - 1) / dstCanvas.height;

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

      const getPixel = (px: number, py: number): number[] => {
        const idx = (py * srcCanvas.width + px) * 4;
        return [
          srcData.data[idx],
          srcData.data[idx + 1],
          srcData.data[idx + 2],
          srcData.data[idx + 3]
        ];
      };

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

function resampleBicubic(srcCanvas: HTMLCanvasElement, dstCanvas: HTMLCanvasElement): HTMLCanvasElement {
  const srcCtx = srcCanvas.getContext('2d')!;
  const dstCtx = dstCanvas.getContext('2d')!;
  const srcData = srcCtx.getImageData(0, 0, srcCanvas.width, srcCanvas.height);
  const dstData = dstCtx.createImageData(dstCanvas.width, dstCanvas.height);

  const xRatio = srcCanvas.width / dstCanvas.width;
  const yRatio = srcCanvas.height / dstCanvas.height;

  const cubicInterpolate = (p: number[], x: number): number => {
    return p[1] + 0.5 * x * (p[2] - p[0] + x * (2.0 * p[0] - 5.0 * p[1] + 4.0 * p[2] - p[3] + x * (3.0 * (p[1] - p[2]) + p[3] - p[0])));
  };

  const getPixel = (x: number, y: number): number[] => {
    x = Math.max(0, Math.min(Math.floor(x), srcCanvas.width - 1));
    y = Math.max(0, Math.min(Math.floor(y), srcCanvas.height - 1));
    const idx = (y * srcCanvas.width + x) * 4;
    return [
      srcData.data[idx],
      srcData.data[idx + 1],
      srcData.data[idx + 2],
      srcData.data[idx + 3]
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

      const pixels: number[][][] = [];
      for (let dy = -1; dy <= 2; dy++) {
        const row: number[][] = [];
        for (let dx = -1; dx <= 2; dx++) {
          row.push(getPixel(xFloor + dx, yFloor + dy));
        }
        pixels.push(row);
      }

      const dstIdx = (y * dstCanvas.width + x) * 4;
      for (let c = 0; c < 4; c++) {
        const col = [
          cubicInterpolate([pixels[0][0][c], pixels[0][1][c], pixels[0][2][c], pixels[0][3][c]], xFrac),
          cubicInterpolate([pixels[1][0][c], pixels[1][1][c], pixels[1][2][c], pixels[1][3][c]], xFrac),
          cubicInterpolate([pixels[2][0][c], pixels[2][1][c], pixels[2][2][c], pixels[2][3][c]], xFrac),
          cubicInterpolate([pixels[3][0][c], pixels[3][1][c], pixels[3][2][c], pixels[3][3][c]], xFrac)
        ];
        dstData.data[dstIdx + c] = Math.max(0, Math.min(255, cubicInterpolate(col, yFrac)));
      }
    }
  }

  dstCtx.putImageData(dstData, 0, 0);
  return dstCanvas;
}

function resampleLanczos(srcCanvas: HTMLCanvasElement, dstCanvas: HTMLCanvasElement): HTMLCanvasElement {
  const srcCtx = srcCanvas.getContext('2d')!;
  const dstCtx = dstCanvas.getContext('2d')!;
  const srcData = srcCtx.getImageData(0, 0, srcCanvas.width, srcCanvas.height);
  const dstData = dstCtx.createImageData(dstCanvas.width, dstCanvas.height);

  const xRatio = srcCanvas.width / dstCanvas.width;
  const yRatio = srcCanvas.height / dstCanvas.height;

  const lanczos = (x: number): number => {
    if (x === 0) return 1;
    if (Math.abs(x) >= LANCZOS_WINDOW_SIZE) return 0;
    return (LANCZOS_WINDOW_SIZE * Math.sin(Math.PI * x) * Math.sin(Math.PI * x / LANCZOS_WINDOW_SIZE)) / (Math.PI * Math.PI * x * x);
  };

  const getPixel = (x: number, y: number): number[] => {
    x = Math.max(0, Math.min(Math.floor(x), srcCanvas.width - 1));
    y = Math.max(0, Math.min(Math.floor(y), srcCanvas.height - 1));
    const idx = (y * srcCanvas.width + x) * 4;
    return [
      srcData.data[idx],
      srcData.data[idx + 1],
      srcData.data[idx + 2],
      srcData.data[idx + 3]
    ];
  };

  for (let y = 0; y < dstCanvas.height; y++) {
    for (let x = 0; x < dstCanvas.width; x++) {
      const srcX = x * xRatio;
      const srcY = y * yRatio;
      const xFloor = Math.floor(srcX);
      const yFloor = Math.floor(srcY);

      let r = 0, g = 0, b = 0, alpha = 0, weight = 0;

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

