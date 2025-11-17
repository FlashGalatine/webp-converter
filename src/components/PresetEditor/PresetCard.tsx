/**
 * PresetCard component for editing a single preset
 */

import { Input, Select, Button } from '../ui';
import type { EditablePreset } from '../../types';
import {
  validatePresetName,
  validateCropRatio,
  hasDuplicateName,
  isDefaultSelectionTaken,
  getPresetWithDefaultSelection,
} from '../../utils/presetEditor';

export interface PresetCardProps {
  /** Preset to edit */
  preset: EditablePreset;
  /** All presets (for validation) */
  allPresets: EditablePreset[];
  /** Preset index in list */
  index: number;
  /** Whether this is the first preset */
  isFirst: boolean;
  /** Whether this is the last preset */
  isLast: boolean;
  /** Animation direction if animating */
  animationDirection?: 'up' | 'down' | null;
  /** Update handler */
  onUpdate: (id: number, field: keyof EditablePreset, value: string) => void;
  /** Remove handler */
  onRemove: (id: number) => void;
  /** Move up handler */
  onMoveUp: (id: number) => void;
  /** Move down handler */
  onMoveDown: (id: number) => void;
}

/**
 * Card for editing a single preset with validation
 */
export function PresetCard({
  preset,
  allPresets,
  index,
  isFirst,
  isLast,
  animationDirection,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
}: PresetCardProps) {
  // Validation checks
  const nameInvalid = !validatePresetName(preset.name);
  const nameIsDuplicate = hasDuplicateName(allPresets, preset.name, index);
  const cropRatioInvalid = preset.cropRatio && !validateCropRatio(preset.cropRatio);

  // Animation classes
  const animationClass =
    animationDirection === 'up'
      ? 'animate-move-up animate-highlight'
      : animationDirection === 'down'
        ? 'animate-move-down animate-highlight'
        : '';

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-6 transition-all duration-300 ${animationClass}`}
    >
      {/* Header with name and action buttons */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-4">
        {/* Name input */}
        <div className="flex-1">
          <Input
            label="Preset Name *"
            value={preset.name}
            onChange={(e) => onUpdate(preset.id, 'name', e.target.value)}
            placeholder="e.g., Instagram Post"
            error={
              nameInvalid
                ? 'Preset name is required'
                : nameIsDuplicate
                  ? 'Duplicate preset name'
                  : undefined
            }
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 sm:mt-7">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onMoveUp(preset.id)}
            disabled={isFirst}
            aria-label="Move preset up"
            title="Move up"
          >
            ↑
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onMoveDown(preset.id)}
            disabled={isLast}
            aria-label="Move preset down"
            title="Move down"
          >
            ↓
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onRemove(preset.id)}
            aria-label="Remove preset"
            title="Remove"
          >
            −
          </Button>
        </div>
      </div>

      {/* Fields grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Crop Ratio */}
        <Input
          label="Crop Ratio"
          value={preset.cropRatio}
          onChange={(e) => onUpdate(preset.id, 'cropRatio', e.target.value)}
          placeholder='e.g., "16/9" or "1.777"'
          helper='Format: "16/9" or decimal "1.777"'
          error={cropRatioInvalid ? 'Invalid crop ratio format' : undefined}
        />

        {/* Default Selection */}
        <Select
          label="Default Selection"
          value={preset.defaultSelection}
          onChange={(e) =>
            onUpdate(
              preset.id,
              'defaultSelection',
              e.target.value as EditablePreset['defaultSelection']
            )
          }
        >
          <option value="">None</option>
          <option
            value="Square"
            disabled={isDefaultSelectionTaken(allPresets, 'Square', preset.id)}
          >
            Square
            {isDefaultSelectionTaken(allPresets, 'Square', preset.id) &&
              ` (${getPresetWithDefaultSelection(allPresets, 'Square', preset.id)?.name})`}
          </option>
          <option
            value="Landscape"
            disabled={isDefaultSelectionTaken(allPresets, 'Landscape', preset.id)}
          >
            Landscape
            {isDefaultSelectionTaken(allPresets, 'Landscape', preset.id) &&
              ` (${getPresetWithDefaultSelection(allPresets, 'Landscape', preset.id)?.name})`}
          </option>
          <option
            value="Portrait"
            disabled={isDefaultSelectionTaken(allPresets, 'Portrait', preset.id)}
          >
            Portrait
            {isDefaultSelectionTaken(allPresets, 'Portrait', preset.id) &&
              ` (${getPresetWithDefaultSelection(allPresets, 'Portrait', preset.id)?.name})`}
          </option>
        </Select>

        {/* Max Width */}
        <Input
          label="Max Width (px)"
          type="number"
          value={preset.maxWidth}
          onChange={(e) => onUpdate(preset.id, 'maxWidth', e.target.value)}
          placeholder="e.g., 1920"
          min="1"
        />

        {/* Max Height */}
        <Input
          label="Max Height (px)"
          type="number"
          value={preset.maxHeight}
          onChange={(e) => onUpdate(preset.id, 'maxHeight', e.target.value)}
          placeholder="e.g., 1080"
          min="1"
        />

        {/* Max Filesize */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max File Size
          </label>
          <div className="flex gap-2">
            <Input
              type="number"
              value={preset.maxFilesize}
              onChange={(e) => onUpdate(preset.id, 'maxFilesize', e.target.value)}
              placeholder="e.g., 1.5"
              step="0.1"
              min="0"
              className="flex-1"
            />
            <Select
              value={preset.maxFilesizeUnit}
              onChange={(e) =>
                onUpdate(
                  preset.id,
                  'maxFilesizeUnit',
                  e.target.value as EditablePreset['maxFilesizeUnit']
                )
              }
              className="w-24"
            >
              <option value="KB">KB</option>
              <option value="MB">MB</option>
              <option value="GB">GB</option>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
