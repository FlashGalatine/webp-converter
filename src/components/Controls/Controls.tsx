import type { CustomPresetsRaw } from '../../types';

interface ControlsProps {
  // Preset state
  useCustomPresets: boolean;
  customPresetsRaw: CustomPresetsRaw;
  selectedPreset: string;
  currentPresets: Record<string, number | null>;
  onPresetChange: (preset: string) => void;
  onLoadCustomPresets: () => void;
  onSwitchToBuiltIn: () => void;
  customPresetsFileName: string;

  // Freestyle
  isFreestyleMode: boolean;
  onFreestyleModeChange: (value: boolean) => void;

  // Zoom
  onZoomToFit: () => void;
  onZoomIn: () => void;
  onZoomReset: () => void;
  onZoomOut: () => void;

  // Info
  image: HTMLImageElement | null;
  cropWidthDisplay: number;
  cropHeightDisplay: number;
  zoomLevel: number;
}

export default function Controls({
  useCustomPresets,
  customPresetsRaw,
  selectedPreset,
  currentPresets,
  onPresetChange,
  onLoadCustomPresets,
  onSwitchToBuiltIn,
  customPresetsFileName,
  isFreestyleMode,
  onFreestyleModeChange,
  onZoomToFit,
  onZoomIn,
  onZoomReset,
  onZoomOut,
  image,
  cropWidthDisplay,
  cropHeightDisplay,
  zoomLevel,
}: ControlsProps) {
  return (
    <>
      {/* Custom Preset Loader UI */}
      {!useCustomPresets ? (
        <div className="mb-6">
          <button
            onClick={onLoadCustomPresets}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded"
          >
            Load Custom Presets
          </button>
          <p className="text-xs text-gray-400 mt-2">Using built-in presets</p>
        </div>
      ) : (
        <div className="mb-6">
          <div className="bg-gray-700 p-3 rounded mb-2">
            <p className="text-xs text-amber-400 font-semibold mb-1">Custom Presets Loaded</p>
            <p className="text-xs text-gray-300 break-all">{customPresetsFileName}</p>
            <p className="text-xs text-gray-400 mt-1">{Object.keys(customPresetsRaw).length} presets available</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onLoadCustomPresets}
              className="bg-purple-600 hover:bg-purple-700 text-white py-1.5 px-3 rounded text-sm"
            >
              Load Different
            </button>
            <button
              onClick={onSwitchToBuiltIn}
              className="bg-gray-600 hover:bg-gray-500 text-white py-1.5 px-3 rounded text-sm"
            >
              Use Built-in
            </button>
          </div>
        </div>
      )}

      {/* Preset Selection */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold mb-2 text-gray-300">Crop Preset</h2>
        <select
          value={selectedPreset}
          onChange={(e) => onPresetChange(e.target.value)}
          className="w-full bg-gray-700 text-white py-2 px-3 rounded"
        >
          {Object.keys(currentPresets).map(preset => (
            <option key={preset} value={preset}>{preset}</option>
          ))}
        </select>
        {useCustomPresets && customPresetsRaw[selectedPreset] && (
          <div className="mt-2 text-xs text-amber-400 bg-gray-700 p-2 rounded">
            <p className="font-semibold mb-1">📋 Preset includes:</p>
            {customPresetsRaw[selectedPreset]['max-width'] && (
              <p>• Max width: {customPresetsRaw[selectedPreset]['max-width']}px</p>
            )}
            {customPresetsRaw[selectedPreset]['max-height'] && (
              <p>• Max height: {customPresetsRaw[selectedPreset]['max-height']}px</p>
            )}
            {customPresetsRaw[selectedPreset]['max-filesize'] && (
              <p>• Target size: {customPresetsRaw[selectedPreset]['max-filesize']}{customPresetsRaw[selectedPreset]['max-filesize-unit'] || 'MB'}</p>
            )}
          </div>
        )}
      </div>

      {/* Freestyle Toggle */}
      <div className="mb-6">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isFreestyleMode}
            onChange={(e) => onFreestyleModeChange(e.target.checked)}
            className="mr-3 w-4 h-4"
          />
          <span className="text-sm font-semibold text-gray-300">🎨 Freestyle Mode</span>
        </label>
        <p className="text-xs text-gray-400 mt-1 ml-7">Disable aspect ratio constraints for free cropping</p>
      </div>

      {/* Zoom Controls */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold mb-3 text-gray-300">Zoom Controls</h2>

        <button
          onClick={onZoomToFit}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded mb-2"
        >
          Zoom to Fit
        </button>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={onZoomIn}
            className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded"
          >
            Zoom In
          </button>
          <button
            onClick={onZoomReset}
            className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded"
          >
            Reset
          </button>
          <button
            onClick={onZoomOut}
            className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded"
          >
            Zoom Out
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-2">
          Ctrl+F (fit) • Ctrl+0 (reset) • Wheel (zoom)
        </p>
      </div>

      {/* Info */}
      {image && (
        <div className="mb-6 text-xs text-gray-400">
          <div>Image: {image.width} × {image.height}px</div>
          <div>Crop: {Math.round(cropWidthDisplay)} × {Math.round(cropHeightDisplay)}px</div>
          <div>Zoom: {(zoomLevel * 100).toFixed(0)}%</div>
        </div>
      )}
    </>
  );
}
