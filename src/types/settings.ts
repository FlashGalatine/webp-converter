/**
 * Settings-related type definitions
 */

import type { FileSizeUnit } from './preset';

/**
 * Resampling method for image scaling
 */
export type ResamplingMethod =
  | 'bicubic'
  | 'lanczos'
  | 'bilinear'
  | 'nearest'
  | 'browser';

/**
 * Quality settings for conversion
 */
export interface QualitySettings {
  /** Quality value (0-100) */
  quality: number;
  /** Whether to use lossless compression */
  lossless: boolean;
}

/**
 * Dimension constraint settings
 */
export interface DimensionSettings {
  /** Maximum width in pixels (empty string = no constraint) */
  maxWidth: string;
  /** Maximum height in pixels (empty string = no constraint) */
  maxHeight: string;
  /** Whether to link dimensions to maintain aspect ratio */
  linkDimensions: boolean;
}

/**
 * Dimension constraints for conversion utilities
 */
export interface DimensionConstraints {
  /** Maximum width in pixels (null = no constraint) */
  maxWidth: number | null;
  /** Maximum height in pixels (null = no constraint) */
  maxHeight: number | null;
}

/**
 * Result of quality optimization process
 */
export interface QualityOptimizationResult {
  /** Optimized WebP blob */
  blob: Blob;
  /** Quality used ('lossless' or 1-100) */
  quality: number | 'lossless';
  /** File size in bytes */
  size: number;
  /** Whether the target size was met */
  metTargetSize: boolean;
}

/**
 * Web optimization settings
 */
export interface WebOptimizationSettings {
  /** Whether web optimization is enabled */
  enabled: boolean;
  /** Target file size value */
  targetSize: string;
  /** Unit for target size */
  targetUnit: FileSizeUnit;
}

/**
 * Conversion settings (complete configuration)
 */
export interface ConversionSettings {
  /** Quality settings */
  quality: QualitySettings;
  /** Dimension constraints */
  dimensions: DimensionSettings;
  /** Web optimization */
  webOptimization: WebOptimizationSettings;
  /** Resampling method */
  resamplingMethod: ResamplingMethod;
}

/**
 * Optimization progress state
 */
export interface OptimizationProgress {
  /** Whether currently optimizing */
  isOptimizing: boolean;
  /** Current quality being tested (0-100) */
  currentQuality: number;
  /** Progress percentage (0-100) */
  progress: number;
  /** Status message */
  status: string;
  /** Current file size in bytes */
  currentSize?: number;
  /** Target file size in bytes */
  targetSize?: number;
}

/**
 * Application settings state
 */
export interface SettingsState {
  /** Conversion settings */
  conversion: ConversionSettings;
  /** Optimization progress */
  optimization: OptimizationProgress;
  /** Whether to auto-zoom to fit on image load */
  autoZoomToFit: boolean;
}

/**
 * Setting validation result
 */
export interface SettingValidationResult {
  /** Whether the value is valid */
  valid: boolean;
  /** Error message if invalid */
  error?: string;
  /** Corrected/coerced value */
  value?: any;
}

/**
 * Export filename template variables
 */
export interface FilenameTemplateVars {
  /** Date in YYYY-MM-DD format */
  date: string;
  /** Width in pixels */
  width: number;
  /** Height in pixels */
  height: number;
  /** Quality value or 'LL' for lossless */
  quality: string;
  /** Original filename (optional) */
  originalName?: string;
}
