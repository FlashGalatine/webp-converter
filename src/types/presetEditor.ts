/**
 * Preset Editor types
 */

/**
 * Preset for editing (internal format)
 */
export interface EditablePreset {
  /** Unique ID */
  id: number;
  /** Preset name */
  name: string;
  /** Crop ratio (e.g., "16/9" or "1.777") */
  cropRatio: string;
  /** Max width in pixels */
  maxWidth: string;
  /** Max height in pixels */
  maxHeight: string;
  /** Max file size value */
  maxFilesize: string;
  /** Max file size unit */
  maxFilesizeUnit: 'KB' | 'MB' | 'GB';
  /** Default selection type */
  defaultSelection: '' | 'Square' | 'Landscape' | 'Portrait';
}

/**
 * Animation state for preset cards
 */
export interface PresetAnimationState {
  /** ID of animating preset */
  presetId: number | null;
  /** Animation direction */
  direction: 'up' | 'down' | null;
}

/**
 * Validation error for a preset field
 */
export interface PresetValidationError {
  /** Preset ID */
  presetId: number;
  /** Field name */
  field: keyof EditablePreset;
  /** Error message */
  message: string;
}
