/**
 * Custom hook for managing preset state
 */

import { useState, useCallback, useMemo } from 'react';
import { BUILT_IN_PRESETS } from '../utils/presets';
import type { PresetCollection, RawCustomPresets } from '../types';

export interface UsePresetStateReturn {
  /** Currently selected preset name */
  selectedPreset: string;
  /** Whether using custom presets */
  useCustomPresets: boolean;
  /** Parsed custom presets (aspect ratios) */
  customPresets: PresetCollection;
  /** Raw custom presets (original config) */
  customPresetsRaw: RawCustomPresets;
  /** Custom presets filename */
  customPresetsFileName: string;
  /** Current active preset collection (built-in or custom) */
  currentPresets: PresetCollection;
  /** Select preset by name */
  selectPreset: (name: string) => void;
  /** Load custom presets */
  loadCustomPresets: (
    presets: PresetCollection,
    raw: RawCustomPresets,
    filename: string
  ) => void;
  /** Clear custom presets and revert to built-in */
  clearCustomPresets: () => void;
  /** Get aspect ratio for selected preset */
  getSelectedAspectRatio: () => number | null;
  /** Get all preset names */
  getPresetNames: () => string[];
  /** Check if preset name exists */
  hasPreset: (name: string) => boolean;
  /** Get selected preset settings (raw config) */
  getSelectedPresetSettings: () => Record<string, any> | null;
}

/**
 * Hook for managing preset state
 *
 * @param initialPreset - Initial preset name (default: "16:9 Landscape")
 * @returns Preset state and manipulation functions
 */
export function usePresetState(
  initialPreset: string = '16:9 Landscape'
): UsePresetStateReturn {
  const [selectedPreset, setSelectedPreset] = useState(initialPreset);
  const [useCustomPresets, setUseCustomPresets] = useState(false);
  const [customPresets, setCustomPresets] = useState<PresetCollection>({});
  const [customPresetsRaw, setCustomPresetsRaw] = useState<RawCustomPresets>({});
  const [customPresetsFileName, setCustomPresetsFileName] = useState('');

  /**
   * Current active preset collection (memoized)
   */
  const currentPresets = useMemo<PresetCollection>(() => {
    return useCustomPresets ? customPresets : BUILT_IN_PRESETS;
  }, [useCustomPresets, customPresets]);

  /**
   * Selects a preset by name
   */
  const selectPreset = useCallback(
    (name: string) => {
      const presets = useCustomPresets ? customPresets : BUILT_IN_PRESETS;
      if (name in presets) {
        setSelectedPreset(name);
      }
    },
    [useCustomPresets, customPresets]
  );

  /**
   * Loads custom presets
   */
  const loadCustomPresets = useCallback(
    (presets: PresetCollection, raw: RawCustomPresets, filename: string) => {
      setCustomPresets(presets);
      setCustomPresetsRaw(raw);
      setCustomPresetsFileName(filename);
      setUseCustomPresets(true);

      // Auto-select first preset if current selection doesn't exist
      const presetNames = Object.keys(presets);
      if (presetNames.length > 0 && !(selectedPreset in presets)) {
        setSelectedPreset(presetNames[0]);
      }
    },
    [selectedPreset]
  );

  /**
   * Clears custom presets and reverts to built-in
   */
  const clearCustomPresets = useCallback(() => {
    setUseCustomPresets(false);
    setCustomPresets({});
    setCustomPresetsRaw({});
    setCustomPresetsFileName('');

    // Reset to default built-in preset if current doesn't exist
    if (!(selectedPreset in BUILT_IN_PRESETS)) {
      setSelectedPreset('16:9 Landscape');
    }
  }, [selectedPreset]);

  /**
   * Gets aspect ratio for selected preset
   */
  const getSelectedAspectRatio = useCallback((): number | null => {
    const presets = useCustomPresets ? customPresets : BUILT_IN_PRESETS;
    return presets[selectedPreset] ?? null;
  }, [useCustomPresets, customPresets, selectedPreset]);

  /**
   * Gets all preset names
   */
  const getPresetNames = useCallback((): string[] => {
    const presets = useCustomPresets ? customPresets : BUILT_IN_PRESETS;
    return Object.keys(presets);
  }, [useCustomPresets, customPresets]);

  /**
   * Checks if preset name exists
   */
  const hasPreset = useCallback(
    (name: string): boolean => {
      const presets = useCustomPresets ? customPresets : BUILT_IN_PRESETS;
      return name in presets;
    },
    [useCustomPresets, customPresets]
  );

  /**
   * Gets the selected preset's settings (raw config)
   */
  const getSelectedPresetSettings = useCallback((): Record<string, any> | null => {
    if (!useCustomPresets) return null;
    return customPresetsRaw[selectedPreset] ?? null;
  }, [useCustomPresets, customPresetsRaw, selectedPreset]);

  return {
    selectedPreset,
    useCustomPresets,
    customPresets,
    customPresetsRaw,
    customPresetsFileName,
    currentPresets,
    selectPreset,
    loadCustomPresets,
    clearCustomPresets,
    getSelectedAspectRatio,
    getPresetNames,
    hasPreset,
    getSelectedPresetSettings,
  };
}
