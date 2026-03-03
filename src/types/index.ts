import { BUILT_IN_PRESETS } from '../constants/presets';
import { CURSOR_MAP } from '../constants/cursors';

export type ResamplingMethod = 'bicubic' | 'lanczos' | 'bilinear' | 'nearest' | 'browser';

export type CursorHandle = keyof typeof CURSOR_MAP;
export type DragType = 'pan' | 'move' | `resize-${CursorHandle}` | null;

export type CursorStyle = 'default' | 'grab' | 'grabbing' | 'move' | 'nwse-resize' | 'nesw-resize' | 'ns-resize' | 'ew-resize';

export type BuiltInPresetName = keyof typeof BUILT_IN_PRESETS;

export interface ImageQueueItem {
  id: number;
  file: File;
  name: string;
  size: number;
  type: string;
}

/** Per-preset export settings block (optional in presets JSON) */
export interface PresetExportConfig {
  resampling?: 'bicubic' | 'lanczos' | 'bilinear' | 'nearest' | 'browser';
  qualityMode?: 'quality' | 'filesize' | 'lossless';
  quality?: number;
  maxFilesizeKb?: number;
  format?: string; // reserved for future use, always 'webp' for now
}

export interface CustomPresetConfig {
  'crop-ratio'?: string | number | null;
  'max-width'?: number;
  'max-height'?: number;
  'max-filesize'?: number;
  'max-filesize-unit'?: 'KB' | 'MB' | 'GB';
  'default-selection'?: 'Square' | 'Landscape' | 'Portrait';
  export?: PresetExportConfig;
}

export interface CustomPresetsRaw {
  [presetName: string]: CustomPresetConfig;
}

export interface CustomPresets {
  [presetName: string]: number | null;
}

// Re-export crop zone types
export type { CropBounds, QualityMode, ExportSettings, CropZone } from './cropZone';
export { DEFAULT_EXPORT_SETTINGS } from './cropZone';

