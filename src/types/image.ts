/**
 * Image-related type definitions
 */

/**
 * Represents an HTML Image element with loaded image data
 */
export interface ImageElement extends HTMLImageElement {
  // Extending HTMLImageElement for type safety
}

/**
 * Image file with metadata
 */
export interface ImageFile {
  /** File object from input or drag-drop */
  file: File;
  /** Data URL for preview */
  dataUrl: string;
  /** Original filename */
  name: string;
  /** File size in bytes */
  size: number;
  /** MIME type */
  type: string;
}

/**
 * Loaded image data
 */
export interface LoadedImage {
  /** HTML Image element */
  element: HTMLImageElement;
  /** Data URL */
  dataUrl: string;
  /** Image width in pixels */
  width: number;
  /** Image height in pixels */
  height: number;
  /** Original filename */
  filename: string;
}

/**
 * Image metadata for conversion
 */
export interface ImageMetadata {
  /** Original width */
  originalWidth: number;
  /** Original height */
  originalHeight: number;
  /** Crop area X position */
  cropX: number;
  /** Crop area Y position */
  cropY: number;
  /** Crop area width */
  cropWidth: number;
  /** Crop area height */
  cropHeight: number;
  /** Quality setting (0-100) */
  quality: number;
  /** Whether to use lossless compression */
  lossless: boolean;
}

/**
 * Conversion result
 */
export interface ConversionResult {
  /** Generated WebP blob */
  blob: Blob;
  /** File size in bytes */
  size: number;
  /** Final quality used */
  quality: number;
  /** Final width */
  width: number;
  /** Final height */
  height: number;
  /** Generated filename */
  filename: string;
  /** Download URL */
  downloadUrl: string;
}
