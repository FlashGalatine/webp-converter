import type { ResamplingMethod } from './index';

export interface CropBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type QualityMode = 'quality' | 'filesize' | 'lossless';

export interface ExportSettings {
  resampling: ResamplingMethod;
  qualityMode: QualityMode;
  quality: number;              // 1-100, used when qualityMode === 'quality'
  maxFilesizeKb: number | null; // target in KB, used when qualityMode === 'filesize'
  maxWidth: number | null;      // output max width (from preset), null = native resolution
  maxHeight: number | null;     // output max height (from preset), null = native resolution
}

export interface CropZone {
  id: string;
  label: string;
  presetName: string | null;    // references a preset key, null if freestyle
  rect: CropBounds;
  aspectRatio: number | null;   // locked if preset defines one, null if freestyle
  exportSettings: ExportSettings;
}

export const DEFAULT_EXPORT_SETTINGS: ExportSettings = {
  resampling: 'lanczos',
  qualityMode: 'quality',
  quality: 90,
  maxFilesizeKb: null,
  maxWidth: null,
  maxHeight: null,
};
