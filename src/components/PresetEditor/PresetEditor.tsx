import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { validateCropRatio, validatePresetName } from '../../utils/presets/validation';
import type { PresetEditorPreset, DefaultSelection } from '../../types/presets';
import type { CustomPresetsRaw } from '../../types';

export default function PresetEditor() {
  const [presets, setPresets] = useState<PresetEditorPreset[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [animatingPresetId, setAnimatingPresetId] = useState<number | null>(null);
  const [animationDirection, setAnimationDirection] = useState<'up' | 'down' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const downloadLinkRef = useRef<HTMLAnchorElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Check for duplicate preset names
  const hasDuplicateName = (name: string, currentIndex: number): boolean => {
    return presets.some((preset, index) =>
      index !== currentIndex && preset.name.toLowerCase() === name.toLowerCase()
    );
  };

  // Find preset with a specific default selection
  const getPresetWithDefaultSelection = (selection: 'Square' | 'Landscape' | 'Portrait', excludeId: number | null): PresetEditorPreset | undefined => {
    return presets.find(preset =>
      preset.defaultSelection === selection && preset.id !== excludeId
    );
  };

  // Check if default selection is already taken
  const isDefaultSelectionTaken = (selection: DefaultSelection, excludeId: number | null): boolean => {
    if (!selection) return false;
    if (selection === 'Square' || selection === 'Landscape' || selection === 'Portrait') {
      return getPresetWithDefaultSelection(selection, excludeId) !== undefined;
    }
    return false;
  };

  // Add a new empty preset
  const addPreset = () => {
    const newPreset: PresetEditorPreset = {
      id: Date.now(),
      name: '',
      cropRatio: '',
      maxWidth: '',
      maxHeight: '',
      maxFilesize: '',
      maxFilesizeUnit: 'MB',
      defaultSelection: ''
    };
    setPresets([...presets, newPreset]);
  };

  // Remove a preset
  const removePreset = (id: number) => {
    setPresets(presets.filter(preset => preset.id !== id));
  };

  // Move a preset up in the list
  const movePresetUp = (id: number) => {
    const index = presets.findIndex(preset => preset.id === id);
    if (index > 0) {
      const newPresets = [...presets];
      [newPresets[index], newPresets[index - 1]] = [newPresets[index - 1], newPresets[index]];

      setAnimatingPresetId(id);
      setAnimationDirection('up');

      setTimeout(() => {
        setAnimatingPresetId(null);
        setAnimationDirection(null);
      }, 600);

      setPresets(newPresets);
    }
  };

  // Move a preset down in the list
  const movePresetDown = (id: number) => {
    const index = presets.findIndex(preset => preset.id === id);
    if (index < presets.length - 1) {
      const newPresets = [...presets];
      [newPresets[index], newPresets[index + 1]] = [newPresets[index + 1], newPresets[index]];

      setAnimatingPresetId(id);
      setAnimationDirection('down');

      setTimeout(() => {
        setAnimatingPresetId(null);
        setAnimationDirection(null);
      }, 600);

      setPresets(newPresets);
    }
  };

  // Update a preset field
  const updatePreset = (id: number, field: keyof PresetEditorPreset, value: string | 'KB' | 'MB' | 'GB') => {
    if (field === 'defaultSelection') {
      const selection = value as DefaultSelection;
      if (selection === 'Square' || selection === 'Landscape' || selection === 'Portrait') {
        const existingPreset = getPresetWithDefaultSelection(selection, id);
        if (existingPreset) {
          alert(`"${selection}" is already the default selection for preset "${existingPreset.name}". Each default selection type can only be used once.`);
          return;
        }
      }
    }

    setPresets(presets.map(preset =>
      preset.id === id ? { ...preset, [field]: value } : preset
    ));
  };

  // Process JSON file (shared by input and drag-and-drop)
  const processPresetFile = (file: File) => {
    if (!file) return;

    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      alert('Please select a JSON file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target?.result as string) as CustomPresetsRaw;

        const importedPresets: PresetEditorPreset[] = Object.entries(jsonData).map((entry, index) => {
          const [name, config] = entry;
          return {
            id: Date.now() + index,
            name: name,
            cropRatio: config['crop-ratio'] ? String(config['crop-ratio']) : '',
            maxWidth: config['max-width'] ? String(config['max-width']) : '',
            maxHeight: config['max-height'] ? String(config['max-height']) : '',
            maxFilesize: config['max-filesize'] ? String(config['max-filesize']) : '',
            maxFilesizeUnit: config['max-filesize-unit'] || 'MB',
            defaultSelection: (config['default-selection'] as DefaultSelection) || ''
          };
        });

        setPresets(importedPresets);
        alert(`Successfully imported ${importedPresets.length} preset(s)!`);
      } catch (error) {
        alert(`Error importing file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };
    reader.readAsText(file);
  };

  // Import presets from file input
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processPresetFile(file);
      e.target.value = '';
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    const jsonFile = Array.from(files).find(file =>
      file.name.endsWith('.json') || file.type === 'application/json'
    );

    if (jsonFile) {
      processPresetFile(jsonFile);
    } else {
      alert('Please drop a JSON file');
    }
  };

  // Export presets to JSON file
  const handleExportFile = () => {
    const errors: string[] = [];
    const defaultSelectionCounts: Record<string, number> = { Square: 0, Landscape: 0, Portrait: 0 };

    presets.forEach((preset, index) => {
      if (!validatePresetName(preset.name)) {
        errors.push(`Preset ${index + 1}: Name is required`);
      }
      if (hasDuplicateName(preset.name, index)) {
        errors.push(`Preset "${preset.name}": Duplicate preset name`);
      }
      if (preset.cropRatio && !validateCropRatio(preset.cropRatio)) {
        errors.push(`Preset "${preset.name}": Invalid crop ratio format`);
      }
      if (preset.defaultSelection === 'Square' || preset.defaultSelection === 'Landscape' || preset.defaultSelection === 'Portrait') {
        defaultSelectionCounts[preset.defaultSelection]++;
        if (defaultSelectionCounts[preset.defaultSelection] > 1) {
          errors.push(`Multiple presets have "${preset.defaultSelection}" as default selection. Only one preset per type is allowed.`);
        }
      }
    });

    if (errors.length > 0) {
      alert(`Cannot export due to validation errors:\n\n${errors.join('\n')}`);
      return;
    }

    if (presets.length === 0) {
      alert('No presets to export');
      return;
    }

    const exportData: CustomPresetsRaw = {};
    presets.forEach(preset => {
      const config: any = {};

      if (preset.cropRatio.trim() !== '') {
        config['crop-ratio'] = preset.cropRatio;
      }
      if (preset.maxWidth.trim() !== '') {
        config['max-width'] = parseInt(preset.maxWidth);
      }
      if (preset.maxHeight.trim() !== '') {
        config['max-height'] = parseInt(preset.maxHeight);
      }
      if (preset.maxFilesize.trim() !== '') {
        config['max-filesize'] = parseFloat(preset.maxFilesize);
      }
      if (preset.maxFilesizeUnit && Object.keys(config).some(k => k.startsWith('max-filesize'))) {
        config['max-filesize-unit'] = preset.maxFilesizeUnit;
      }
      if (preset.defaultSelection && preset.defaultSelection.trim() !== '') {
        config['default-selection'] = preset.defaultSelection;
      }

      if (Object.keys(config).length > 0) {
        exportData[preset.name] = config;
      }
    });

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = downloadLinkRef.current;
    if (link) {
      link.href = url;
      link.download = 'presets.json';
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Generate JSON preview
  const jsonPreview = (): string => {
    const preview: CustomPresetsRaw = {};
    presets.forEach(preset => {
      const config: any = {};
      if (preset.cropRatio.trim() !== '') {
        config['crop-ratio'] = preset.cropRatio;
      }
      if (preset.maxWidth.trim() !== '') {
        config['max-width'] = parseInt(preset.maxWidth);
      }
      if (preset.maxHeight.trim() !== '') {
        config['max-height'] = parseInt(preset.maxHeight);
      }
      if (preset.maxFilesize.trim() !== '') {
        config['max-filesize'] = parseFloat(preset.maxFilesize);
      }
      if (preset.maxFilesizeUnit && Object.keys(config).some(k => k.startsWith('max-filesize'))) {
        config['max-filesize-unit'] = preset.maxFilesizeUnit;
      }
      if (preset.defaultSelection && preset.defaultSelection.trim() !== '') {
        config['default-selection'] = preset.defaultSelection;
      }
      if (Object.keys(config).length > 0) {
        preview[preset.name] = config;
      }
    });
    return JSON.stringify(preview, null, 2);
  };

  return (
    <div
      className="min-h-screen bg-gray-900 text-gray-100 py-8 px-4"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drop Zone Overlay */}
      {isDragging && (
        <div
          ref={dropZoneRef}
          className="fixed inset-0 bg-blue-900 bg-opacity-50 flex items-center justify-center z-50 pointer-events-none"
        >
          <div className="bg-blue-800 border-4 border-blue-400 rounded-lg p-8 text-center">
            <p className="text-2xl font-bold text-blue-100 mb-2">📥 Drop JSON File Here</p>
            <p className="text-blue-200">Release to import presets</p>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Preset Editor</h1>
          <p className="text-gray-400">Create and manage custom presets for WebP Converter</p>
          <Link to="/" className="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-block">
            ← Back to Converter
          </Link>
        </div>

        {/* Controls */}
        <div className="flex gap-3 mb-8 flex-wrap">
          <button
            onClick={addPreset}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded flex items-center gap-2"
          >
            <span>+</span> Add Preset
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded flex items-center gap-2"
          >
            📥 Import JSON
          </button>

          <button
            onClick={handleExportFile}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded flex items-center gap-2"
          >
            💾 Export JSON
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportFile}
            style={{ display: 'none' }}
          />
          <a ref={downloadLinkRef} style={{ display: 'none' }} />
        </div>

        {/* Drag-and-Drop Hint */}
        <div className="mb-8 p-4 bg-blue-900 bg-opacity-30 border border-blue-700 rounded-lg">
          <p className="text-blue-300 text-sm">
            💡 <strong>Tip:</strong> You can also drag and drop a JSON file anywhere on this page to import presets instantly!
          </p>
        </div>

        {/* Default Selection Status */}
        {presets.length > 0 && (
          <div className="mb-8 p-4 bg-gray-800 border border-gray-700 rounded-lg">
            <p className="text-sm font-semibold text-gray-300 mb-3">Default Selection Status:</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(['Square', 'Landscape', 'Portrait'] as const).map(selection => {
                const preset = getPresetWithDefaultSelection(selection, null);
                return (
                  <div
                    key={selection}
                    className={`p-3 rounded ${preset ? 'bg-green-900 border border-green-700' : 'bg-gray-700 border border-gray-600'}`}
                  >
                    <p className="text-xs text-gray-300">{selection}</p>
                    <p className={`text-sm font-semibold ${preset ? 'text-green-300' : 'text-gray-500'}`}>
                      {preset?.name || 'Not assigned'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Presets List */}
        {presets.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <p className="text-gray-400 mb-4">No presets yet. Click "Add Preset" to create one, click "Import JSON" to load an existing file, or drag and drop a JSON file anywhere on this page.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {presets.map((preset, index) => (
              <div
                key={preset.id}
                className={`bg-gray-800 rounded-lg p-6 border border-gray-700 preset-card ${
                  animatingPresetId === preset.id
                    ? animationDirection === 'up'
                      ? 'animate-move-up animate-highlight'
                      : 'animate-move-down animate-highlight'
                    : ''
                }`}
              >
                {/* Preset Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-300 mb-1">
                      Preset Name *
                    </label>
                    <input
                      type="text"
                      value={preset.name}
                      onChange={(e) => updatePreset(preset.id, 'name', e.target.value)}
                      placeholder="e.g., Twitter Post"
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                    {!validatePresetName(preset.name) && (
                      <p className="text-red-400 text-xs mt-1">Preset name is required</p>
                    )}
                    {hasDuplicateName(preset.name, index) && (
                      <p className="text-red-400 text-xs mt-1">Duplicate preset name</p>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => movePresetUp(preset.id)}
                      disabled={index === 0}
                      className={`font-semibold py-2 px-3 rounded ${
                        index === 0
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                      title="Move up"
                    >
                      ↑
                    </button>

                    <button
                      onClick={() => movePresetDown(preset.id)}
                      disabled={index === presets.length - 1}
                      className={`font-semibold py-2 px-3 rounded ${
                        index === presets.length - 1
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                      title="Move down"
                    >
                      ↓
                    </button>

                    <button
                      onClick={() => removePreset(preset.id)}
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 rounded"
                    >
                      −
                    </button>
                  </div>
                </div>

                {/* Fields Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Crop Ratio */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-1">
                      Crop Ratio (optional)
                    </label>
                    <input
                      type="text"
                      value={preset.cropRatio}
                      onChange={(e) => updatePreset(preset.id, 'cropRatio', e.target.value)}
                      placeholder="e.g., 16/9 or 1.777"
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                    <p className="text-gray-500 text-xs mt-1">
                      Enter as ratio (16/9, 4/3) or decimal (1.777)
                    </p>
                    {preset.cropRatio && !validateCropRatio(preset.cropRatio) && (
                      <p className="text-red-400 text-xs mt-1">Invalid crop ratio format</p>
                    )}
                  </div>

                  {/* Max Width */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-1">
                      Max Width (optional)
                    </label>
                    <input
                      type="number"
                      value={preset.maxWidth}
                      onChange={(e) => updatePreset(preset.id, 'maxWidth', e.target.value)}
                      placeholder="e.g., 1920"
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                    <p className="text-gray-500 text-xs mt-1">Pixels</p>
                  </div>

                  {/* Max Height */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-1">
                      Max Height (optional)
                    </label>
                    <input
                      type="number"
                      value={preset.maxHeight}
                      onChange={(e) => updatePreset(preset.id, 'maxHeight', e.target.value)}
                      placeholder="e.g., 1080"
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                    <p className="text-gray-500 text-xs mt-1">Pixels</p>
                  </div>

                  {/* Max Filesize */}
                  <div className="md:col-span-1">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-gray-300 mb-1">
                          Max File Size (optional)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={preset.maxFilesize}
                          onChange={(e) => updatePreset(preset.id, 'maxFilesize', e.target.value)}
                          placeholder="e.g., 1"
                          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="w-24">
                        <label className="block text-sm font-semibold text-gray-300 mb-1">
                          Unit
                        </label>
                        <select
                          value={preset.maxFilesizeUnit}
                          onChange={(e) => updatePreset(preset.id, 'maxFilesizeUnit', e.target.value as 'KB' | 'MB' | 'GB')}
                          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                        >
                          <option>KB</option>
                          <option>MB</option>
                          <option>GB</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Default Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-1">
                      Default Selection (optional)
                    </label>
                    <select
                      value={preset.defaultSelection || ''}
                      onChange={(e) => updatePreset(preset.id, 'defaultSelection', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="">None</option>
                      <option value="Square">
                        Square{isDefaultSelectionTaken('Square' as DefaultSelection, preset.id) ? ' (already in use)' : ''}
                      </option>
                      <option value="Landscape">
                        Landscape{isDefaultSelectionTaken('Landscape' as DefaultSelection, preset.id) ? ' (already in use)' : ''}
                      </option>
                      <option value="Portrait">
                        Portrait{isDefaultSelectionTaken('Portrait' as DefaultSelection, preset.id) ? ' (already in use)' : ''}
                      </option>
                    </select>
                    {(preset.defaultSelection === 'Square' || preset.defaultSelection === 'Landscape' || preset.defaultSelection === 'Portrait') && (
                      <p className="text-green-400 text-xs mt-1">
                        ✓ Set as default for {preset.defaultSelection} images
                      </p>
                    )}
                    <p className="text-gray-500 text-xs mt-1">
                      Only one preset per type (Square, Landscape, Portrait)
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* JSON Preview */}
        {presets.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">JSON Preview</h2>
            <pre className="bg-gray-800 border border-gray-700 rounded p-4 overflow-auto max-h-96 text-sm">
              {jsonPreview()}
            </pre>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="text-center mb-6">
            <p className="text-gray-400 text-sm mb-4">
              For more information and to use these presets, visit the <Link to="/" className="text-blue-400 hover:text-blue-300 underline">WebP Converter</Link>
            </p>
          </div>

          <div className="flex justify-center flex-wrap gap-6 mb-8">
            <a href="https://github.com/FlashGalatine" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" title="GitHub">
              <span className="text-lg">🐙</span> GitHub
            </a>
            <a href="https://x.com/AsheJunius" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" title="X/Twitter">
              <span className="text-lg">𝕏</span> X/Twitter
            </a>
            <a href="https://www.twitch.tv/flashgalatine" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" title="Twitch">
              <span className="text-lg">📺</span> Twitch
            </a>
            <a href="https://discord.gg/5VUSKTZCe5" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" title="Discord">
              <span className="text-lg">💬</span> Discord
            </a>
            <a href="https://bsky.app/profile/projectgalatine.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" title="BlueSky">
              <span className="text-lg">🦋</span> BlueSky
            </a>
            <a href="https://www.patreon.com/ProjectGalatine" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" title="Patreon">
              <span className="text-lg">❤️</span> Patreon
            </a>
            <a href="https://blog.projectgalatine.com/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" title="Blog">
              <span className="text-lg">📝</span> Blog
            </a>
          </div>

          <div className="text-center text-gray-600 text-xs">
            <p>Created by Flash Galatine | Preset Editor for WebP Converter</p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes highlight {
          0% {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.8);
          }
          100% {
            box-shadow: 0 0 0 rgba(59, 130, 246, 0);
          }
        }

        .animate-move-up {
          animation: slideUp 0.4s ease-out;
        }

        .animate-move-down {
          animation: slideDown 0.4s ease-out;
        }

        .animate-highlight {
          animation: highlight 0.6s ease-out;
        }

        .preset-card {
          transition: all 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
