/**
 * Custom hook for managing conversion settings
 */

import { useState, useCallback } from 'react';
import type { ResamplingMethod, FileSizeUnit } from '../types';

export interface UseConversionSettingsReturn {
  /** Quality value (0-100) */
  quality: number;
  /** Whether lossless compression is enabled */
  lossless: boolean;
  /** Max width constraint (empty string = no constraint) */
  maxWidth: string;
  /** Max height constraint (empty string = no constraint) */
  maxHeight: string;
  /** Whether dimensions are linked (maintain aspect ratio) */
  linkDimensions: boolean;
  /** Whether web optimization is enabled */
  webOptimize: boolean;
  /** Target file size value */
  targetSize: string;
  /** Target file size unit */
  targetSizeUnit: FileSizeUnit;
  /** Resampling method */
  resamplingMethod: ResamplingMethod;
  /** Whether currently optimizing */
  isOptimizing: boolean;
  /** Optimization progress (0-100) */
  optimizingProgress: number;
  /** Optimization status message */
  optimizingStatus: string;
  /** Set quality */
  setQuality: (quality: number) => void;
  /** Toggle lossless */
  toggleLossless: () => void;
  /** Set lossless */
  setLossless: (enabled: boolean) => void;
  /** Set max width */
  setMaxWidth: (width: string) => void;
  /** Set max height */
  setMaxHeight: (height: string) => void;
  /** Toggle link dimensions */
  toggleLinkDimensions: () => void;
  /** Set link dimensions */
  setLinkDimensions: (linked: boolean) => void;
  /** Toggle web optimize */
  toggleWebOptimize: () => void;
  /** Set web optimize */
  setWebOptimize: (enabled: boolean) => void;
  /** Set target size */
  setTargetSize: (size: string) => void;
  /** Set target size unit */
  setTargetSizeUnit: (unit: FileSizeUnit) => void;
  /** Set resampling method */
  setResamplingMethod: (method: ResamplingMethod) => void;
  /** Set optimization state */
  setOptimizationState: (isOptimizing: boolean, progress?: number, status?: string) => void;
  /** Reset to defaults */
  resetToDefaults: () => void;
}

const DEFAULT_SETTINGS = {
  quality: 95,
  lossless: false,
  maxWidth: '',
  maxHeight: '',
  linkDimensions: true,
  webOptimize: false,
  targetSize: '10',
  targetSizeUnit: 'MB' as FileSizeUnit,
  resamplingMethod: 'bicubic' as ResamplingMethod,
};

/**
 * Hook for managing conversion settings
 *
 * @returns Conversion settings and manipulation functions
 */
export function useConversionSettings(): UseConversionSettingsReturn {
  const [quality, setQuality] = useState(DEFAULT_SETTINGS.quality);
  const [lossless, setLosslessState] = useState(DEFAULT_SETTINGS.lossless);
  const [maxWidth, setMaxWidth] = useState(DEFAULT_SETTINGS.maxWidth);
  const [maxHeight, setMaxHeight] = useState(DEFAULT_SETTINGS.maxHeight);
  const [linkDimensions, setLinkDimensionsState] = useState(DEFAULT_SETTINGS.linkDimensions);
  const [webOptimize, setWebOptimizeState] = useState(DEFAULT_SETTINGS.webOptimize);
  const [targetSize, setTargetSize] = useState(DEFAULT_SETTINGS.targetSize);
  const [targetSizeUnit, setTargetSizeUnit] = useState(DEFAULT_SETTINGS.targetSizeUnit);
  const [resamplingMethod, setResamplingMethod] = useState(DEFAULT_SETTINGS.resamplingMethod);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizingProgress, setOptimizingProgress] = useState(0);
  const [optimizingStatus, setOptimizingStatus] = useState('');

  /**
   * Toggles lossless compression
   */
  const toggleLossless = useCallback(() => {
    setLosslessState((prev) => !prev);
  }, []);

  /**
   * Sets lossless compression
   */
  const setLossless = useCallback((enabled: boolean) => {
    setLosslessState(enabled);
  }, []);

  /**
   * Toggles dimension linking
   */
  const toggleLinkDimensions = useCallback(() => {
    setLinkDimensionsState((prev) => !prev);
  }, []);

  /**
   * Sets dimension linking
   */
  const setLinkDimensions = useCallback((linked: boolean) => {
    setLinkDimensionsState(linked);
  }, []);

  /**
   * Toggles web optimization
   */
  const toggleWebOptimize = useCallback(() => {
    setWebOptimizeState((prev) => !prev);
  }, []);

  /**
   * Sets web optimization
   */
  const setWebOptimize = useCallback((enabled: boolean) => {
    setWebOptimizeState(enabled);
  }, []);

  /**
   * Sets optimization state
   */
  const setOptimizationState = useCallback(
    (optimizing: boolean, progress: number = 0, status: string = '') => {
      setIsOptimizing(optimizing);
      setOptimizingProgress(progress);
      setOptimizingStatus(status);
    },
    []
  );

  /**
   * Resets all settings to defaults
   */
  const resetToDefaults = useCallback(() => {
    setQuality(DEFAULT_SETTINGS.quality);
    setLosslessState(DEFAULT_SETTINGS.lossless);
    setMaxWidth(DEFAULT_SETTINGS.maxWidth);
    setMaxHeight(DEFAULT_SETTINGS.maxHeight);
    setLinkDimensionsState(DEFAULT_SETTINGS.linkDimensions);
    setWebOptimizeState(DEFAULT_SETTINGS.webOptimize);
    setTargetSize(DEFAULT_SETTINGS.targetSize);
    setTargetSizeUnit(DEFAULT_SETTINGS.targetSizeUnit);
    setResamplingMethod(DEFAULT_SETTINGS.resamplingMethod);
  }, []);

  return {
    quality,
    lossless,
    maxWidth,
    maxHeight,
    linkDimensions,
    webOptimize,
    targetSize,
    targetSizeUnit,
    resamplingMethod,
    isOptimizing,
    optimizingProgress,
    optimizingStatus,
    setQuality,
    toggleLossless,
    setLossless,
    setMaxWidth,
    setMaxHeight,
    toggleLinkDimensions,
    setLinkDimensions,
    toggleWebOptimize,
    setWebOptimize,
    setTargetSize,
    setTargetSizeUnit,
    setResamplingMethod,
    setOptimizationState,
    resetToDefaults,
  };
}
