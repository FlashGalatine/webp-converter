/**
 * Custom preset parsing utilities
 */

import type {
  RawCustomPresets,
  PresetCollection,
  ParsedPreset,
  PresetValidationResult,
} from '../../types';
import { parseAspectRatio } from './aspectRatio';

/**
 * Parses custom presets from JSON data
 *
 * Converts JSON preset configurations to internal preset collection format.
 * Handles:
 * - crop-ratio (string or number)
 * - max-width and max-height (fallback to calculate ratio)
 * - null for freestyle
 *
 * @param jsonData - Raw JSON preset data
 * @returns Preset collection with aspect ratios
 *
 * @example
 * const json = { "16:9 HD": { "crop-ratio": "16/9" } };
 * const presets = parseCustomPresets(json);
 * // { "16:9 HD": 1.777... }
 */
export function parseCustomPresets(
  jsonData: RawCustomPresets
): PresetCollection {
  const converted: PresetCollection = {};

  for (const [name, config] of Object.entries(jsonData)) {
    if (config['crop-ratio']) {
      // Parse crop-ratio using the parseAspectRatio function
      converted[name] = parseAspectRatio(config['crop-ratio']);
    } else if (config['max-width'] && config['max-height']) {
      // Calculate crop-ratio from max dimensions if crop-ratio not defined
      converted[name] = config['max-width'] / config['max-height'];
    } else {
      converted[name] = null; // Freestyle
    }
  }

  return converted;
}

/**
 * Parses a single preset configuration into a ParsedPreset object
 *
 * @param name - Preset name
 * @param config - Raw preset configuration
 * @returns Parsed preset with all fields
 */
export function parsePreset(
  name: string,
  config: RawCustomPresets[string]
): ParsedPreset {
  let aspectRatio: number | null = null;

  if (config['crop-ratio']) {
    aspectRatio = parseAspectRatio(config['crop-ratio']);
  } else if (config['max-width'] && config['max-height']) {
    aspectRatio = config['max-width'] / config['max-height'];
  }

  const parsed: ParsedPreset = {
    name,
    aspectRatio,
  };

  if (config['max-width']) {
    parsed.maxWidth = config['max-width'];
  }

  if (config['max-height']) {
    parsed.maxHeight = config['max-height'];
  }

  if (config['max-filesize']) {
    // Convert to bytes
    const size = config['max-filesize'];
    const unit = config['max-filesize-unit'] || 'MB';

    let sizeInBytes = size;
    if (unit === 'KB') {
      sizeInBytes = size * 1024;
    } else if (unit === 'MB') {
      sizeInBytes = size * 1024 * 1024;
    } else if (unit === 'GB') {
      sizeInBytes = size * 1024 * 1024 * 1024;
    }

    parsed.targetFileSize = sizeInBytes;
  }

  if (config['default-selection']) {
    parsed.defaultSelection = config['default-selection'];
  }

  return parsed;
}

/**
 * Validates custom preset JSON data
 *
 * @param jsonData - Raw JSON data to validate
 * @returns Validation result with error message if invalid
 */
export function validateCustomPresets(
  jsonData: unknown
): PresetValidationResult {
  // Check if it's an object
  if (typeof jsonData !== 'object' || jsonData === null) {
    return {
      valid: false,
      error: 'Preset data must be a JSON object',
    };
  }

  // Check if empty
  const keys = Object.keys(jsonData);
  if (keys.length === 0) {
    return {
      valid: false,
      error: 'Preset file contains no presets',
    };
  }

  // Validate each preset
  for (const [name, config] of Object.entries(jsonData)) {
    // Check if preset name is valid
    if (!name || name.trim() === '') {
      return {
        valid: false,
        error: 'Preset names cannot be empty',
      };
    }

    // Check if config is an object
    if (typeof config !== 'object' || config === null) {
      return {
        valid: false,
        error: `Preset "${name}" must have an object configuration`,
      };
    }

    // Validate crop-ratio if present
    const cropRatio = (config as any)['crop-ratio'];
    if (cropRatio !== undefined && cropRatio !== null) {
      const parsed = parseAspectRatio(cropRatio);
      if (parsed === null && cropRatio !== null) {
        return {
          valid: false,
          error: `Preset "${name}" has invalid crop-ratio: ${cropRatio}`,
        };
      }
    }

    // Validate dimensions if present
    const maxWidth = (config as any)['max-width'];
    const maxHeight = (config as any)['max-height'];

    if (maxWidth !== undefined && (typeof maxWidth !== 'number' || maxWidth <= 0)) {
      return {
        valid: false,
        error: `Preset "${name}" has invalid max-width: ${maxWidth}`,
      };
    }

    if (maxHeight !== undefined && (typeof maxHeight !== 'number' || maxHeight <= 0)) {
      return {
        valid: false,
        error: `Preset "${name}" has invalid max-height: ${maxHeight}`,
      };
    }

    // Validate file size if present
    const maxFilesize = (config as any)['max-filesize'];
    if (maxFilesize !== undefined && (typeof maxFilesize !== 'number' || maxFilesize <= 0)) {
      return {
        valid: false,
        error: `Preset "${name}" has invalid max-filesize: ${maxFilesize}`,
      };
    }

    // Validate file size unit if present
    const filesizeUnit = (config as any)['max-filesize-unit'];
    if (filesizeUnit !== undefined && !['KB', 'MB', 'GB'].includes(filesizeUnit)) {
      return {
        valid: false,
        error: `Preset "${name}" has invalid max-filesize-unit: ${filesizeUnit}`,
      };
    }

    // Validate default selection if present
    const defaultSelection = (config as any)['default-selection'];
    if (defaultSelection !== undefined && !['Square', 'Landscape', 'Portrait'].includes(defaultSelection)) {
      return {
        valid: false,
        error: `Preset "${name}" has invalid default-selection: ${defaultSelection}`,
      };
    }
  }

  return {
    valid: true,
    count: keys.length,
  };
}

/**
 * Loads and parses custom presets from JSON text
 *
 * @param jsonText - JSON string
 * @returns Validation result and parsed presets
 */
export function loadCustomPresetsFromJSON(jsonText: string): {
  validation: PresetValidationResult;
  presets?: PresetCollection;
  raw?: RawCustomPresets;
} {
  try {
    const jsonData = JSON.parse(jsonText);
    const validation = validateCustomPresets(jsonData);

    if (!validation.valid) {
      return { validation };
    }

    const presets = parseCustomPresets(jsonData as RawCustomPresets);

    return {
      validation,
      presets,
      raw: jsonData as RawCustomPresets,
    };
  } catch (error) {
    return {
      validation: {
        valid: false,
        error: `Failed to parse JSON: ${(error as Error).message}`,
      },
    };
  }
}
