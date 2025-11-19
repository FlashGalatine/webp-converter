import { useState, useCallback } from 'react';
import { TRANSITION_DELAY } from '../constants/canvas';
import { prepareImageForConversion, getOptimizationStatus } from '../utils/imageProcessing/conversion';
import { downloadBlob } from '../utils/files/downloads';
import type { ResamplingMethod } from '../types';

export interface UseImageProcessingReturn {
  isOptimizing: boolean;
  optimizingProgress: number;
  optimizingStatus: string;
  handleConvert: (params: {
    image: HTMLImageElement;
    cropX: number;
    cropY: number;
    cropWidth: number;
    cropHeight: number;
    maxWidth: string;
    maxHeight: string;
    resamplingMethod: ResamplingMethod;
    quality: number;
    lossless: boolean;
    webOptimize: boolean;
    targetSize: string;
    onComplete: () => void;
  }) => Promise<void>;
}

export function useImageProcessing(): UseImageProcessingReturn {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizingProgress, setOptimizingProgress] = useState(0);
  const [optimizingStatus, setOptimizingStatus] = useState('');

  const handleConvert = useCallback(async (params: {
    image: HTMLImageElement;
    cropX: number;
    cropY: number;
    cropWidth: number;
    cropHeight: number;
    maxWidth: string;
    maxHeight: string;
    resamplingMethod: ResamplingMethod;
    quality: number;
    lossless: boolean;
    webOptimize: boolean;
    targetSize: string;
    onComplete: () => void;
  }) => {
    const {
      image,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      maxWidth,
      maxHeight,
      resamplingMethod,
      quality,
      lossless,
      webOptimize,
      targetSize,
      onComplete
    } = params;

    setIsOptimizing(true);
    setOptimizingProgress(0);
    setOptimizingStatus('Cropping image...');

    const result = prepareImageForConversion({
      image,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      maxWidth,
      maxHeight,
      resamplingMethod
    });

    if (result.needsResampling && resamplingMethod !== 'browser') {
      setOptimizingStatus(getOptimizationStatus(
        result.needsResampling,
        resamplingMethod,
        result.finalWidth,
        result.finalHeight,
        cropWidth,
        cropHeight
      ));
    }

    let finalQuality = quality;
    let usedLossless = lossless;

    // Web optimization
    if (webOptimize && !lossless) {
      setOptimizingStatus('Testing lossless compression...');
      setOptimizingProgress(0);

      const targetSizeBytes = parseFloat(targetSize) * 1024 * 1024;

      // Try lossless first
      const losslessBlob = await new Promise<Blob | null>(resolve => {
        result.canvas.toBlob((blob) => resolve(blob), 'image/webp', 1);
      });

      if (losslessBlob && losslessBlob.size <= targetSizeBytes) {
        setOptimizingStatus('✓ Lossless fits within target!');
        setOptimizingProgress(100);
        usedLossless = true;

        await new Promise(resolve => setTimeout(resolve, 800));
        downloadBlob(losslessBlob, result.canvas.width, result.canvas.height, 'LL');
        onComplete();
        setIsOptimizing(false);
        return;
      }

      // Try quality levels from 100 down to 1
      setOptimizingStatus('Finding optimal quality level...');

      for (let q = 100; q >= 1; q--) {
        setOptimizingProgress(((100 - q) / 100) * 100);
        setOptimizingStatus(`Testing quality ${q}... (${100 - q + 1}/100)`);

        const blob = await new Promise<Blob | null>(resolve => {
          result.canvas.toBlob(resolve, 'image/webp', q / 100);
        });

        if (blob && blob.size <= targetSizeBytes) {
          setOptimizingStatus(`✓ Quality ${q} achieves ${(blob.size / 1024 / 1024).toFixed(2)}MB`);
          setOptimizingProgress(100);

          await new Promise(resolve => setTimeout(resolve, 1000));
          downloadBlob(blob, result.canvas.width, result.canvas.height, q);
          onComplete();
          setIsOptimizing(false);
          return;
        }
      }

      setOptimizingStatus('⚠ Could not meet target size. Using quality 1.');
      finalQuality = 1;
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // Standard conversion
    setOptimizingStatus('Converting to WebP...');
    const qualityValue = usedLossless ? 1 : finalQuality / 100;

    result.canvas.toBlob((blob: Blob | null) => {
      if (blob) {
        downloadBlob(blob, result.canvas.width, result.canvas.height, usedLossless ? 'LL' : finalQuality);
        onComplete();
      }
      setIsOptimizing(false);
    }, 'image/webp', qualityValue);
  }, []);

  return {
    isOptimizing,
    optimizingProgress,
    optimizingStatus,
    handleConvert
  };
}

