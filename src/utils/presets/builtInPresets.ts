/**
 * Built-in preset definitions
 */

import type { PresetCollection } from '../../types';

/**
 * Built-in aspect ratio presets
 * - Key: Preset name
 * - Value: Aspect ratio (width/height) or null for freestyle
 */
export const BUILT_IN_PRESETS: PresetCollection = {
  'Freestyle': null,
  'Square (1:1)': 1,
  '16:9 Landscape': 16 / 9,
  '9:16 Portrait': 9 / 16,
  '4:3 Landscape': 4 / 3,
  '3:4 Portrait': 3 / 4,
  '21:9 Ultrawide': 21 / 9,
  'Twitter Post': 16 / 9,
  'Twitter Header': 3 / 1,
  'Instagram Square': 1,
  'Instagram Portrait': 4 / 5,
  'Instagram Landscape': 1.91 / 1,
  'Facebook Post': 1.91 / 1,
  'YouTube Thumbnail': 16 / 9,
  'Discord Avatar': 1,
  'Pinterest Pin': 2 / 3,
};

/**
 * Get list of built-in preset names
 */
export function getBuiltInPresetNames(): string[] {
  return Object.keys(BUILT_IN_PRESETS);
}

/**
 * Get aspect ratio for a built-in preset
 * @param presetName - Name of the preset
 * @returns Aspect ratio or null if not found
 */
export function getBuiltInPresetRatio(presetName: string): number | null {
  return BUILT_IN_PRESETS[presetName] ?? null;
}

/**
 * Check if a preset name exists in built-in presets
 * @param presetName - Name to check
 * @returns True if preset exists
 */
export function isBuiltInPreset(presetName: string): boolean {
  return presetName in BUILT_IN_PRESETS;
}
