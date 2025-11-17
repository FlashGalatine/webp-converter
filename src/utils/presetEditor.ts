/**
 * Preset Editor utilities and validation
 */

import type { EditablePreset, PresetValidationError } from '../types';

/**
 * Validates crop ratio input (supports both "16/9" and "1.777" formats)
 */
export function validateCropRatio(value: string): boolean {
  if (value === '' || value === null) {
    return true; // Empty is valid (optional field)
  }

  const trimmed = String(value).trim();

  // Check for ratio format (e.g., "16/9", "4/3")
  if (trimmed.includes('/')) {
    const parts = trimmed.split('/');
    if (parts.length === 2) {
      const numerator = parseFloat(parts[0].trim());
      const denominator = parseFloat(parts[1].trim());
      return !isNaN(numerator) && !isNaN(denominator) && denominator !== 0;
    }
    return false;
  }

  // Check for decimal format (e.g., "1.777")
  const numValue = parseFloat(trimmed);
  return !isNaN(numValue) && numValue > 0;
}

/**
 * Validates preset name is not empty
 */
export function validatePresetName(name: string): boolean {
  return !!(name && name.trim() !== '');
}

/**
 * Checks for duplicate preset names (case-insensitive)
 */
export function hasDuplicateName(
  presets: EditablePreset[],
  name: string,
  currentIndex: number
): boolean {
  return presets.some(
    (preset, index) =>
      index !== currentIndex && preset.name.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Finds preset with a specific default selection
 */
export function getPresetWithDefaultSelection(
  presets: EditablePreset[],
  selection: EditablePreset['defaultSelection'],
  excludeId?: number
): EditablePreset | undefined {
  return presets.find(
    (preset) =>
      preset.defaultSelection === selection &&
      (excludeId === undefined || preset.id !== excludeId)
  );
}

/**
 * Checks if default selection is already taken
 */
export function isDefaultSelectionTaken(
  presets: EditablePreset[],
  selection: EditablePreset['defaultSelection'],
  excludeId?: number
): boolean {
  if (!selection) return false;
  return getPresetWithDefaultSelection(presets, selection, excludeId) !== undefined;
}

/**
 * Validates all presets and returns array of errors
 */
export function validateAllPresets(
  presets: EditablePreset[]
): PresetValidationError[] {
  const errors: PresetValidationError[] = [];

  // Track default selection counts
  const defaultSelectionCounts: Record<string, number> = {
    Square: 0,
    Landscape: 0,
    Portrait: 0,
  };

  presets.forEach((preset, index) => {
    // Validate name
    if (!validatePresetName(preset.name)) {
      errors.push({
        presetId: preset.id,
        field: 'name',
        message: `Preset ${index + 1}: Name is required`,
      });
    }

    // Check for duplicate names
    if (hasDuplicateName(presets, preset.name, index)) {
      errors.push({
        presetId: preset.id,
        field: 'name',
        message: `Preset "${preset.name}": Duplicate name found`,
      });
    }

    // Validate crop ratio format
    if (preset.cropRatio && !validateCropRatio(preset.cropRatio)) {
      errors.push({
        presetId: preset.id,
        field: 'cropRatio',
        message: `Preset "${preset.name}": Invalid crop ratio format`,
      });
    }

    // Track default selections
    if (preset.defaultSelection) {
      defaultSelectionCounts[preset.defaultSelection]++;
      if (defaultSelectionCounts[preset.defaultSelection] > 1) {
        errors.push({
          presetId: preset.id,
          field: 'defaultSelection',
          message: `Multiple presets have "${preset.defaultSelection}" as default selection`,
        });
      }
    }
  });

  return errors;
}

/**
 * Creates an empty preset with default values
 */
export function createEmptyPreset(): EditablePreset {
  return {
    id: Date.now(),
    name: '',
    cropRatio: '',
    maxWidth: '',
    maxHeight: '',
    maxFilesize: '',
    maxFilesizeUnit: 'MB',
    defaultSelection: '',
  };
}

/**
 * Parses aspect ratio string to number
 */
export function parseAspectRatio(value: string): number | null {
  if (!value || value.trim() === '') return null;

  const trimmed = value.trim();

  // Try ratio format first (e.g., "16/9")
  if (trimmed.includes('/')) {
    const parts = trimmed.split('/');
    if (parts.length === 2) {
      const numerator = parseFloat(parts[0].trim());
      const denominator = parseFloat(parts[1].trim());
      if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
        return numerator / denominator;
      }
    }
    return null;
  }

  // Try decimal format (e.g., "1.777")
  const numValue = parseFloat(trimmed);
  return !isNaN(numValue) && numValue > 0 ? numValue : null;
}
