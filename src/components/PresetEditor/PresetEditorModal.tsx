/**
 * Preset Editor Modal component
 */

import { useState, useRef } from 'react';
import { Modal, Button } from '../ui';
import { PresetCard } from './PresetCard';
import type { EditablePreset, PresetAnimationState } from '../../types';
import type { PresetCollection } from '../../types/preset';
import {
  createEmptyPreset,
  validateAllPresets,
  getPresetWithDefaultSelection,
} from '../../utils/presetEditor';

export interface PresetEditorModalProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Handler for when presets are saved */
  onSave: (presets: PresetCollection, raw: Record<string, any>) => void;
  /** Initial presets to load */
  initialPresets?: EditablePreset[];
}

/**
 * Modal for creating and editing presets
 */
export function PresetEditorModal({
  isOpen,
  onClose,
  onSave,
  initialPresets = [],
}: PresetEditorModalProps) {
  const [presets, setPresets] = useState<EditablePreset[]>(initialPresets);
  const [isDragging, setIsDragging] = useState(false);
  const [animation, setAnimation] = useState<PresetAnimationState>({
    presetId: null,
    direction: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const downloadLinkRef = useRef<HTMLAnchorElement>(null);

  // Add a new empty preset
  const handleAddPreset = () => {
    setPresets([...presets, createEmptyPreset()]);
  };

  // Remove a preset
  const handleRemovePreset = (id: number) => {
    setPresets(presets.filter((p) => p.id !== id));
  };

  // Move preset up
  const handleMoveUp = (id: number) => {
    const index = presets.findIndex((p) => p.id === id);
    if (index > 0) {
      const newPresets = [...presets];
      [newPresets[index], newPresets[index - 1]] = [
        newPresets[index - 1],
        newPresets[index],
      ];

      // Trigger animation
      setAnimation({ presetId: id, direction: 'up' });
      setTimeout(() => setAnimation({ presetId: null, direction: null }), 600);

      setPresets(newPresets);
    }
  };

  // Move preset down
  const handleMoveDown = (id: number) => {
    const index = presets.findIndex((p) => p.id === id);
    if (index < presets.length - 1) {
      const newPresets = [...presets];
      [newPresets[index], newPresets[index + 1]] = [
        newPresets[index + 1],
        newPresets[index],
      ];

      // Trigger animation
      setAnimation({ presetId: id, direction: 'down' });
      setTimeout(() => setAnimation({ presetId: null, direction: null }), 600);

      setPresets(newPresets);
    }
  };

  // Update preset field
  const handleUpdatePreset = (
    id: number,
    field: keyof EditablePreset,
    value: string
  ) => {
    // Handle default selection logic
    if (field === 'defaultSelection' && value && value !== '') {
      const existingPreset = getPresetWithDefaultSelection(
        presets,
        value as EditablePreset['defaultSelection'],
        id
      );
      if (existingPreset) {
        alert(
          `"${value}" is already the default selection for preset "${existingPreset.name}". Each default selection type can only be used once.`
        );
        return;
      }
    }

    setPresets(presets.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  // Import presets from file
  const handleImportFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await processPresetFile(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processPresetFile = async (file: File) => {
    // Validate file is JSON
    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      alert('Please select a JSON file');
      return;
    }

    try {
      const text = await file.text();
      const jsonData = JSON.parse(text);

      // Convert imported JSON to internal format
      const importedPresets: EditablePreset[] = Object.entries(jsonData).map(
        ([name, config]: [string, any], index) => {
          // Validate default selection
          const rawDefaultSelection = config['default-selection'];
          const validDefaultSelections = ['Square', 'Landscape', 'Portrait', ''];
          const defaultSelection = validDefaultSelections.includes(rawDefaultSelection)
            ? (rawDefaultSelection as EditablePreset['defaultSelection'])
            : '';

          // Validate file size unit
          const rawFileSizeUnit = config['max-filesize-unit'];
          const validUnits = ['KB', 'MB', 'GB'];
          const maxFilesizeUnit = validUnits.includes(rawFileSizeUnit)
            ? (rawFileSizeUnit as EditablePreset['maxFilesizeUnit'])
            : 'MB';

          return {
            id: Date.now() + index,
            name,
            cropRatio: config['crop-ratio'] ? String(config['crop-ratio']) : '',
            maxWidth: config['max-width'] ? String(config['max-width']) : '',
            maxHeight: config['max-height'] ? String(config['max-height']) : '',
            maxFilesize: config['max-filesize'] ? String(config['max-filesize']) : '',
            maxFilesizeUnit,
            defaultSelection,
          };
        }
      );

      setPresets(importedPresets);
      alert(`Successfully imported ${importedPresets.length} preset(s)!`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Error importing file: ${message}`);
    }
  };

  // Export presets to file
  const handleExportFile = () => {
    // Validation pass
    const errors = validateAllPresets(presets);

    if (errors.length > 0) {
      const errorMessages = errors.map((e) => e.message).join('\n');
      alert(
        `Cannot export due to validation errors:\n\n${errorMessages}\n\nPlease fix these errors before exporting.`
      );
      return;
    }

    // Build export JSON
    const exportData: Record<string, any> = {};

    presets.forEach((preset) => {
      const config: Record<string, any> = {};

      if (preset.cropRatio.trim() !== '')
        config['crop-ratio'] = preset.cropRatio.trim();
      if (preset.maxWidth.trim() !== '')
        config['max-width'] = parseInt(preset.maxWidth);
      if (preset.maxHeight.trim() !== '')
        config['max-height'] = parseInt(preset.maxHeight);
      if (preset.maxFilesize.trim() !== '')
        config['max-filesize'] = parseFloat(preset.maxFilesize);
      if (preset.maxFilesizeUnit && preset.maxFilesize.trim() !== '')
        config['max-filesize-unit'] = preset.maxFilesizeUnit;
      if (preset.defaultSelection.trim() !== '')
        config['default-selection'] = preset.defaultSelection;

      exportData[preset.name] = config;
    });

    // Create and trigger download
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = downloadLinkRef.current;
    if (link) {
      link.href = url;
      link.download = 'presets.json';
      link.click();
    }

    URL.revokeObjectURL(url);
  };

  // Save presets and apply to converter
  const handleSaveAndApply = () => {
    // Validation pass
    const errors = validateAllPresets(presets);

    if (errors.length > 0) {
      const errorMessages = errors.map((e) => e.message).join('\n');
      alert(
        `Cannot save due to validation errors:\n\n${errorMessages}\n\nPlease fix these errors before saving.`
      );
      return;
    }

    // Convert to PresetCollection format
    const presetCollection: PresetCollection = {};
    const rawPresets: Record<string, any> = {};

    presets.forEach((preset) => {
      const config: Record<string, any> = {};

      if (preset.cropRatio.trim() !== '')
        config['crop-ratio'] = preset.cropRatio.trim();
      if (preset.maxWidth.trim() !== '')
        config['max-width'] = parseInt(preset.maxWidth);
      if (preset.maxHeight.trim() !== '')
        config['max-height'] = parseInt(preset.maxHeight);
      if (preset.maxFilesize.trim() !== '')
        config['max-filesize'] = parseFloat(preset.maxFilesize);
      if (preset.maxFilesizeUnit && preset.maxFilesize.trim() !== '')
        config['max-filesize-unit'] = preset.maxFilesizeUnit;
      if (preset.defaultSelection.trim() !== '')
        config['default-selection'] = preset.defaultSelection;

      rawPresets[preset.name] = config;

      // Parse aspect ratio
      let aspectRatio: number | null = null;
      if (preset.cropRatio.trim() !== '') {
        const ratio = preset.cropRatio.trim();
        if (ratio.includes('/')) {
          const [num, denom] = ratio.split('/').map((p) => parseFloat(p.trim()));
          aspectRatio = num / denom;
        } else {
          aspectRatio = parseFloat(ratio);
        }
      }

      presetCollection[preset.name] = aspectRatio;
    });

    onSave(presetCollection, rawPresets);
    onClose();
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const jsonFile = files.find(
      (file) => file.name.endsWith('.json') || file.type === 'application/json'
    );

    if (jsonFile) {
      await processPresetFile(jsonFile);
    } else {
      alert('Please drop a JSON file');
    }
  };

  // Default selection status
  const squarePreset = presets.find((p) => p.defaultSelection === 'Square');
  const landscapePreset = presets.find((p) => p.defaultSelection === 'Landscape');
  const portraitPreset = presets.find((p) => p.defaultSelection === 'Portrait');

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Preset Editor"
        size="xl"
        footer={
          <div className="flex justify-between gap-4">
            <div className="flex gap-2">
              <Button variant="secondary" onClick={handleExportFile}>
                💾 Export JSON
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveAndApply}>
                Save & Apply
              </Button>
            </div>
          </div>
        }
      >
        <div
          className="space-y-6"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Control buttons */}
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" onClick={handleAddPreset}>
              ➕ Add Preset
            </Button>
            <Button variant="secondary" onClick={handleImportFile}>
              📂 Import JSON
            </Button>
          </div>

          {/* Drag & drop hint */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              💡 <strong>Tip:</strong> You can drag and drop a JSON file anywhere
              on this window to import presets.
            </p>
          </div>

          {/* Default selection status */}
          {presets.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Default Selection Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { type: 'Square', preset: squarePreset },
                  { type: 'Landscape', preset: landscapePreset },
                  { type: 'Portrait', preset: portraitPreset },
                ].map(({ type, preset }) => (
                  <div
                    key={type}
                    className={`rounded-lg border p-3 ${
                      preset
                        ? 'bg-green-50 border-green-300'
                        : 'bg-gray-50 border-gray-300'
                    }`}
                  >
                    <p className="text-xs text-gray-600 mb-1">{type}</p>
                    <p
                      className={`text-sm font-medium ${
                        preset ? 'text-green-800' : 'text-gray-500'
                      }`}
                    >
                      {preset?.name || 'Not assigned'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Presets list */}
          {presets.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-500 text-lg mb-2">No presets yet</p>
              <p className="text-gray-400 text-sm">
                Click "Add Preset" or import a JSON file to get started
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {presets.map((preset, index) => (
                <PresetCard
                  key={preset.id}
                  preset={preset}
                  allPresets={presets}
                  index={index}
                  isFirst={index === 0}
                  isLast={index === presets.length - 1}
                  animationDirection={
                    animation.presetId === preset.id ? animation.direction : null
                  }
                  onUpdate={handleUpdatePreset}
                  onRemove={handleRemovePreset}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                />
              ))}
            </div>
          )}

          {/* JSON Preview */}
          {presets.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                JSON Preview
              </h3>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs">
                {JSON.stringify(
                  presets.reduce((acc, preset) => {
                    const config: Record<string, any> = {};
                    if (preset.cropRatio.trim())
                      config['crop-ratio'] = preset.cropRatio.trim();
                    if (preset.maxWidth.trim())
                      config['max-width'] = parseInt(preset.maxWidth);
                    if (preset.maxHeight.trim())
                      config['max-height'] = parseInt(preset.maxHeight);
                    if (preset.maxFilesize.trim())
                      config['max-filesize'] = parseFloat(preset.maxFilesize);
                    if (preset.maxFilesizeUnit && preset.maxFilesize.trim())
                      config['max-filesize-unit'] = preset.maxFilesizeUnit;
                    if (preset.defaultSelection.trim())
                      config['default-selection'] = preset.defaultSelection;
                    acc[preset.name || '<empty name>'] = config;
                    return acc;
                  }, {} as Record<string, any>),
                  null,
                  2
                )}
              </pre>
            </div>
          )}
        </div>
      </Modal>

      {/* Drag overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-[60] bg-blue-500 bg-opacity-20 flex items-center justify-center pointer-events-none">
          <div className="bg-blue-600 text-white p-8 rounded-lg shadow-2xl">
            <p className="text-2xl font-bold mb-2">📥 Drop JSON File Here</p>
            <p className="text-blue-100">Release to import presets</p>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Hidden download link */}
      <a ref={downloadLinkRef} className="hidden" />
    </>
  );
}
