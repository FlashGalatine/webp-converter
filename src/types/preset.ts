/**
 * Preset-related type definitions
 */

/**
 * Default selection type for auto-selecting presets
 */
export type DefaultSelection = 'Square' | 'Landscape' | 'Portrait';

/**
 * File size unit for web optimization
 */
export type FileSizeUnit = 'KB' | 'MB' | 'GB';

/**
 * Built-in preset definition (simple aspect ratio)
 */
export interface BuiltInPreset {
  /** Preset name */
  name: string;
  /** Aspect ratio (width/height) or null for freestyle */
  aspectRatio: number | null;
}

/**
 * Custom preset configuration from JSON
 */
export interface CustomPresetConfig {
  /** Crop aspect ratio (e.g., "16/9", 1.777, or null) */
  'crop-ratio'?: string | number | null;
  /** Maximum width constraint in pixels */
  'max-width'?: number;
  /** Maximum height constraint in pixels */
  'max-height'?: number;
  /** Target file size for web optimization */
  'max-filesize'?: number;
  /** Unit for max file size */
  'max-filesize-unit'?: FileSizeUnit;
  /** Auto-select this preset based on image orientation */
  'default-selection'?: DefaultSelection;
}

/**
 * Parsed custom preset with normalized values
 */
export interface ParsedPreset {
  /** Preset name */
  name: string;
  /** Parsed aspect ratio as number or null */
  aspectRatio: number | null;
  /** Max width constraint */
  maxWidth?: number;
  /** Max height constraint */
  maxHeight?: number;
  /** Target file size in bytes */
  targetFileSize?: number;
  /** Default selection type */
  defaultSelection?: DefaultSelection;
}

/**
 * Collection of presets (name -> aspect ratio)
 */
export interface PresetCollection {
  [name: string]: number | null;
}

/**
 * Raw custom presets from JSON file
 */
export interface RawCustomPresets {
  [name: string]: CustomPresetConfig;
}

/**
 * Preset state
 */
export interface PresetState {
  /** Whether using custom presets */
  useCustomPresets: boolean;
  /** Currently selected preset name */
  selectedPreset: string;
  /** Custom preset collection (name -> aspect ratio) */
  customPresets: PresetCollection;
  /** Raw custom preset configs */
  customPresetsRaw: RawCustomPresets;
  /** Loaded custom preset filename */
  customPresetsFileName: string;
}

/**
 * Preset file validation result
 */
export interface PresetValidationResult {
  /** Whether the preset file is valid */
  valid: boolean;
  /** Error message if invalid */
  error?: string;
  /** Number of presets loaded */
  count?: number;
}
