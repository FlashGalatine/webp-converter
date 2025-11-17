/**
 * Enumeration types and constants
 */

/**
 * Resampling methods enumeration
 */
export const ResamplingMethods = {
  BICUBIC: 'bicubic',
  LANCZOS: 'lanczos',
  BILINEAR: 'bilinear',
  NEAREST: 'nearest',
  BROWSER: 'browser',
} as const;

/**
 * Resampling method labels for UI
 */
export const ResamplingMethodLabels: Record<string, string> = {
  [ResamplingMethods.BICUBIC]: 'Bicubic (Recommended)',
  [ResamplingMethods.LANCZOS]: 'Lanczos (Highest Quality)',
  [ResamplingMethods.BILINEAR]: 'Bilinear (Fast & Smooth)',
  [ResamplingMethods.NEAREST]: 'Nearest Neighbor (Pixel Art)',
  [ResamplingMethods.BROWSER]: 'Browser Default',
};

/**
 * File size units enumeration
 */
export const FileSizeUnits = {
  KB: 'KB',
  MB: 'MB',
  GB: 'GB',
} as const;

/**
 * File size unit multipliers (to bytes)
 */
export const FileSizeMultipliers: Record<string, number> = {
  [FileSizeUnits.KB]: 1024,
  [FileSizeUnits.MB]: 1024 * 1024,
  [FileSizeUnits.GB]: 1024 * 1024 * 1024,
};

/**
 * Default selection types for auto-preset selection
 */
export const DefaultSelections = {
  SQUARE: 'Square',
  LANDSCAPE: 'Landscape',
  PORTRAIT: 'Portrait',
} as const;

/**
 * Queue item status enumeration
 */
export const QueueItemStatuses = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  ERROR: 'error',
} as const;

/**
 * Handle positions for crop resize
 */
export const HandlePositions = {
  NORTHWEST: 'nw',
  NORTHEAST: 'ne',
  SOUTHWEST: 'sw',
  SOUTHEAST: 'se',
  NORTH: 'n',
  SOUTH: 's',
  EAST: 'e',
  WEST: 'w',
} as const;

/**
 * Drag types for canvas interaction
 */
export const DragTypes = {
  PAN: 'pan',
  MOVE: 'move',
  RESIZE_NW: 'resize-nw',
  RESIZE_NE: 'resize-ne',
  RESIZE_SW: 'resize-sw',
  RESIZE_SE: 'resize-se',
  RESIZE_N: 'resize-n',
  RESIZE_S: 'resize-s',
  RESIZE_E: 'resize-e',
  RESIZE_W: 'resize-w',
} as const;

/**
 * Cursor styles for canvas
 */
export const CursorStyles = {
  DEFAULT: 'default',
  GRAB: 'grab',
  GRABBING: 'grabbing',
  MOVE: 'move',
  NWSE_RESIZE: 'nwse-resize',
  NESW_RESIZE: 'nesw-resize',
  NS_RESIZE: 'ns-resize',
  EW_RESIZE: 'ew-resize',
} as const;

/**
 * Keyboard event keys
 */
export const KeyboardKeys = {
  ESCAPE: 'Escape',
  ENTER: 'Enter',
  SPACE: ' ',
  DELETE: 'Delete',
  BACKSPACE: 'Backspace',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  PLUS: '+',
  MINUS: '-',
  EQUALS: '=',
} as const;

/**
 * MIME types for images
 */
export const ImageMimeTypes = {
  WEBP: 'image/webp',
  JPEG: 'image/jpeg',
  PNG: 'image/png',
  GIF: 'image/gif',
  BMP: 'image/bmp',
} as const;

/**
 * Accepted image file extensions
 */
export const ImageFileExtensions = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.bmp',
] as const;

/**
 * Error types
 */
export const ErrorTypes = {
  FILE_READ: 'FILE_READ_ERROR',
  IMAGE_DECODE: 'IMAGE_DECODE_ERROR',
  CONVERSION: 'CONVERSION_ERROR',
  PRESET_LOAD: 'PRESET_LOAD_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR',
} as const;
