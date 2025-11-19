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

export interface CustomPresetConfig {
  'crop-ratio'?: string | number | null;
  'max-width'?: number;
  'max-height'?: number;
  'max-filesize'?: number;
  'max-filesize-unit'?: 'KB' | 'MB' | 'GB';
  'default-selection'?: 'Square' | 'Landscape' | 'Portrait';
}

export interface CustomPresetsRaw {
  [presetName: string]: CustomPresetConfig;
}

export interface CustomPresets {
  [presetName: string]: number | null;
}

