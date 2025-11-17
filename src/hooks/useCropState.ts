/**
 * Custom hook for managing crop state
 */

import { useState, useCallback } from 'react';
import type { CropArea } from '../types';

export interface UseCropStateReturn {
  /** Crop X position in image coordinates */
  cropX: number;
  /** Crop Y position in image coordinates */
  cropY: number;
  /** Crop width in image coordinates */
  cropWidth: number;
  /** Crop height in image coordinates */
  cropHeight: number;
  /** Current aspect ratio (null for freestyle) */
  aspectRatio: number | null;
  /** Whether freestyle mode is enabled */
  isFreestyleMode: boolean;
  /** Set crop area */
  setCropArea: (x: number, y: number, width: number, height: number) => void;
  /** Set aspect ratio */
  setAspectRatio: (ratio: number | null) => void;
  /** Toggle freestyle mode */
  toggleFreestyle: () => void;
  /** Set freestyle mode */
  setFreestyle: (enabled: boolean) => void;
  /** Initialize crop based on image dimensions and aspect ratio */
  initializeCrop: (imageWidth: number, imageHeight: number, ratio?: number | null) => void;
  /** Update crop position */
  updateCropPosition: (x: number, y: number) => void;
  /** Update crop size */
  updateCropSize: (width: number, height: number) => void;
  /** Get crop area as object */
  getCropArea: () => CropArea;
}

/**
 * Hook for managing crop state
 *
 * @returns Crop state and manipulation functions
 */
export function useCropState(): UseCropStateReturn {
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [cropWidth, setCropWidth] = useState(0);
  const [cropHeight, setCropHeight] = useState(0);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [isFreestyleMode, setIsFreestyleMode] = useState(false);

  /**
   * Sets the crop area
   */
  const setCropArea = useCallback((x: number, y: number, width: number, height: number) => {
    setCropX(x);
    setCropY(y);
    setCropWidth(width);
    setCropHeight(height);
  }, []);

  /**
   * Updates crop position
   */
  const updateCropPosition = useCallback((x: number, y: number) => {
    setCropX(x);
    setCropY(y);
  }, []);

  /**
   * Updates crop size
   */
  const updateCropSize = useCallback((width: number, height: number) => {
    setCropWidth(width);
    setCropHeight(height);
  }, []);

  /**
   * Toggles freestyle mode
   */
  const toggleFreestyle = useCallback(() => {
    setIsFreestyleMode((prev) => !prev);
  }, []);

  /**
   * Sets freestyle mode
   */
  const setFreestyle = useCallback((enabled: boolean) => {
    setIsFreestyleMode(enabled);
  }, []);

  /**
   * Initializes crop based on image dimensions and aspect ratio
   *
   * If no aspect ratio is provided (or null), crops to full image.
   * Otherwise, fits the aspect ratio within the image bounds.
   *
   * @param imageWidth - Image width
   * @param imageHeight - Image height
   * @param ratio - Aspect ratio (width/height) or null for full image
   */
  const initializeCrop = useCallback(
    (imageWidth: number, imageHeight: number, ratio?: number | null) => {
      if (!ratio) {
        // No aspect ratio - crop to full image
        setCropX(0);
        setCropY(0);
        setCropWidth(imageWidth);
        setCropHeight(imageHeight);
      } else {
        // Fit aspect ratio within image bounds
        const imgRatio = imageWidth / imageHeight;
        let w: number, h: number;

        if (ratio > imgRatio) {
          // Aspect ratio is wider than image - fit to width
          w = imageWidth;
          h = imageWidth / ratio;
        } else {
          // Aspect ratio is taller than image - fit to height
          h = imageHeight;
          w = imageHeight * ratio;
        }

        // Center crop
        setCropX((imageWidth - w) / 2);
        setCropY((imageHeight - h) / 2);
        setCropWidth(w);
        setCropHeight(h);
      }
    },
    []
  );

  /**
   * Gets crop area as object
   */
  const getCropArea = useCallback((): CropArea => {
    return {
      x: cropX,
      y: cropY,
      width: cropWidth,
      height: cropHeight,
      aspectRatio,
    };
  }, [cropX, cropY, cropWidth, cropHeight, aspectRatio]);

  return {
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    aspectRatio,
    isFreestyleMode,
    setCropArea,
    setAspectRatio,
    toggleFreestyle,
    setFreestyle,
    initializeCrop,
    updateCropPosition,
    updateCropSize,
    getCropArea,
  };
}
