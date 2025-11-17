/**
 * Presets component for selecting aspect ratios
 */

import { useRef, type ChangeEvent } from 'react';
import { Button, Select } from '../ui';

export interface PresetsProps {
  /** Available preset names */
  presetNames: string[];
  /** Selected preset name */
  selectedPreset: string;
  /** Whether using custom presets */
  useCustomPresets: boolean;
  /** Custom presets filename */
  customPresetsFileName: string;
  /** Whether freestyle mode is enabled */
  isFreestyleMode: boolean;
  /** Preset selection handler */
  onPresetChange: (presetName: string) => void;
  /** Custom preset file selection handler */
  onCustomPresetFileSelect: (file: File) => void;
  /** Clear custom presets handler */
  onClearCustomPresets: () => void;
  /** Toggle freestyle mode handler */
  onToggleFreestyle: () => void;
}

/**
 * Presets component for aspect ratio selection
 */
export function Presets({
  presetNames,
  selectedPreset,
  useCustomPresets,
  customPresetsFileName,
  isFreestyleMode,
  onPresetChange,
  onCustomPresetFileSelect,
  onClearCustomPresets,
  onToggleFreestyle,
}: PresetsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onCustomPresetFileSelect(file);
    }
  };

  const handleLoadCustomPresets = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Select
            label="Crop Preset"
            value={selectedPreset}
            onChange={(e) => onPresetChange(e.target.value)}
            disabled={isFreestyleMode}
          >
            {presetNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </Select>
        </div>

        <Button
          size="md"
          variant="secondary"
          onClick={onToggleFreestyle}
          title="Toggle freestyle mode (no aspect ratio constraint)"
        >
          {isFreestyleMode ? '🔓 Freestyle' : '🔒 Locked'}
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={handleLoadCustomPresets}
          fullWidth
        >
          📁 Load Custom Presets
        </Button>

        {useCustomPresets && (
          <Button
            size="sm"
            variant="secondary"
            onClick={onClearCustomPresets}
            title="Clear custom presets and use built-in"
          >
            ✕
          </Button>
        )}
      </div>

      {useCustomPresets && customPresetsFileName && (
        <div className="text-xs text-gray-600 bg-gray-100 px-3 py-2 rounded">
          Using: {customPresetsFileName}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
}
