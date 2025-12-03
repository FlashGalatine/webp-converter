import { useCallback } from 'react';
import { useDebouncedCallback } from '../../hooks/useDebouncedCallback';
import type { ResamplingMethod } from '../../types';
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

  // WebP Options
  quality: number;
  lossless: boolean;
  onQualityChange: (value: number) => void;
  onLosslessChange: (value: boolean) => void;
  webOptimize: boolean;
  targetSize: string;
  onWebOptimizeChange: (value: boolean) => void;
  onTargetSizeChange: (value: string) => void;

  // Max Dimensions
  maxWidth: string;
  maxHeight: string;
  linkDimensions: boolean;
  isFreestyleModeActive: boolean;
  cropWidth: number;
  cropHeight: number;
  onMaxWidthChange: (value: string) => void;
  onMaxHeightChange: (value: string) => void;
  onLinkDimensionsToggle: () => void;

  // Resampling
  resamplingMethod: ResamplingMethod;
  onResamplingMethodChange: (method: ResamplingMethod) => void;

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
  finalOutputDimensions: { width: number; height: number } | null;

  // Convert
  onConvert: () => void;
  isOptimizing: boolean;
  imageQueueLength: number;
  currentImageIndex: number;
  remainingCount: number;
  isCurrentProcessed: boolean;

  // Optimization progress
  optimizingProgress: number;
  optimizingStatus: string;
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
  quality,
  lossless,
  onQualityChange,
  onLosslessChange,
  webOptimize,
  targetSize,
  onWebOptimizeChange,
  onTargetSizeChange,
  maxWidth,
  maxHeight,
  linkDimensions,
  isFreestyleModeActive,
  cropWidth,
  cropHeight,
  onMaxWidthChange,
  onMaxHeightChange,
  onLinkDimensionsToggle,
  resamplingMethod,
  onResamplingMethodChange,
  onZoomToFit,
  onZoomIn,
  onZoomReset,
  onZoomOut,
  image,
  cropWidthDisplay,
  cropHeightDisplay,
  zoomLevel,
  finalOutputDimensions,
  onConvert,
  isOptimizing,
  imageQueueLength,
  currentImageIndex,
  remainingCount,
  isCurrentProcessed,
  optimizingProgress,
  optimizingStatus
}: ControlsProps) {
  // Debounced callbacks for linked dimension updates to prevent laggy input experience
  const debouncedUpdateHeight = useDebouncedCallback((newHeight: string) => {
    onMaxHeightChange(newHeight);
  }, 150);

  const debouncedUpdateWidth = useDebouncedCallback((newWidth: string) => {
    onMaxWidthChange(newWidth);
  }, 150);

  // Handle width change with optional linked height update
  const handleWidthChange = useCallback((newWidth: string) => {
    onMaxWidthChange(newWidth);

    if (linkDimensions && !isFreestyleModeActive && newWidth && cropWidth > 0 && cropHeight > 0) {
      const parsed = parseInt(newWidth, 10);
      if (!isNaN(parsed) && parsed > 0) {
        const cropAspectRatio = cropWidth / cropHeight;
        const newHeight = Math.round(parsed / cropAspectRatio);
        debouncedUpdateHeight(newHeight.toString());
      }
    }
  }, [linkDimensions, isFreestyleModeActive, cropWidth, cropHeight, onMaxWidthChange, debouncedUpdateHeight]);

  // Handle height change with optional linked width update
  const handleHeightChange = useCallback((newHeight: string) => {
    onMaxHeightChange(newHeight);

    if (linkDimensions && !isFreestyleModeActive && newHeight && cropWidth > 0 && cropHeight > 0) {
      const parsed = parseInt(newHeight, 10);
      if (!isNaN(parsed) && parsed > 0) {
        const cropAspectRatio = cropWidth / cropHeight;
        const newWidth = Math.round(parsed * cropAspectRatio);
        debouncedUpdateWidth(newWidth.toString());
      }
    }
  }, [linkDimensions, isFreestyleModeActive, cropWidth, cropHeight, onMaxHeightChange, debouncedUpdateWidth]);

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

      {/* WebP Options */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold mb-3 text-gray-300">WebP Options</h2>

        <div className="mb-3">
          <label className="flex items-center">
            <input
              type="radio"
              checked={!lossless}
              onChange={() => onLosslessChange(false)}
              className="mr-2"
            />
            <span>Lossy</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              checked={lossless}
              onChange={() => onLosslessChange(true)}
              className="mr-2"
            />
            <span>Lossless</span>
          </label>
        </div>

        {!lossless && (
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Quality:</span>
              <span className="text-sm font-semibold text-amber-400">{quality}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={quality}
              onChange={(e) => onQualityChange(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        )}

        <div className="mt-4">
          <label className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={webOptimize}
              onChange={(e) => onWebOptimizeChange(e.target.checked)}
              className="mr-2"
            />
            <span>Optimize for Web</span>
          </label>

          {webOptimize && (
            <div className="flex items-center gap-2 ml-6">
              <label className="text-sm">Target Size:</label>
              <input
                type="number"
                value={targetSize}
                onChange={(e) => onTargetSizeChange(e.target.value)}
                className="w-16 bg-gray-700 text-white py-1 px-2 rounded"
                min="0.1"
                step="0.5"
              />
              <span className="text-sm">MB</span>
            </div>
          )}
        </div>
      </div>

      {/* Max Dimensions */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-gray-300">Max Dimensions (optional)</h2>
          <button
            onClick={onLinkDimensionsToggle}
            disabled={isFreestyleModeActive}
            title={isFreestyleModeActive ? "Link disabled in Freestyle Mode" : linkDimensions ? "Click to unlink dimensions" : "Click to link dimensions"}
            className={`text-lg transition-all ${
              isFreestyleModeActive
                ? 'opacity-50 cursor-not-allowed text-gray-500'
                : linkDimensions
                  ? 'text-blue-400 hover:text-blue-300'
                  : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {isFreestyleModeActive ? '⛓️' : linkDimensions ? '🔗' : '⛓️‍💥'}
          </button>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="text-sm w-20">Max Width:</label>
            <input
              type="number"
              value={maxWidth}
              onChange={(e) => handleWidthChange(e.target.value)}
              placeholder="pixels"
              className={`flex-1 bg-gray-700 text-white py-1 px-2 rounded ${linkDimensions && !isFreestyleModeActive ? 'ring-1 ring-blue-400' : ''}`}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm w-20">Max Height:</label>
            <input
              type="number"
              value={maxHeight}
              onChange={(e) => handleHeightChange(e.target.value)}
              placeholder="pixels"
              className={`flex-1 bg-gray-700 text-white py-1 px-2 rounded ${linkDimensions && !isFreestyleModeActive ? 'ring-1 ring-blue-400' : ''}`}
            />
          </div>
        </div>
      </div>

      {/* Resampling Method */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold mb-2 text-gray-300">Resampling Method</h2>
        <select
          value={resamplingMethod}
          onChange={(e) => onResamplingMethodChange(e.target.value as ResamplingMethod)}
          className="w-full bg-gray-700 text-white py-2 px-3 rounded"
        >
          <option value="bicubic">Bicubic (Recommended)</option>
          <option value="lanczos">Lanczos (Highest Quality)</option>
          <option value="bilinear">Bilinear (Faster)</option>
          <option value="nearest">Nearest Neighbor (Fastest)</option>
          <option value="browser">Browser Default</option>
        </select>
        <p className="text-xs text-gray-400 mt-1">
          Used when resizing images. Lanczos provides the best quality for downscaling.
        </p>
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
          {finalOutputDimensions && (
            <div className="text-amber-400">Output: {finalOutputDimensions.width} × {finalOutputDimensions.height}px</div>
          )}
          <div>Zoom: {(zoomLevel * 100).toFixed(0)}%</div>
        </div>
      )}

      {/* Convert Button */}
      <button
        onClick={onConvert}
        disabled={!image || isOptimizing}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 px-4 rounded font-semibold"
      >
        {isOptimizing
          ? 'Converting...'
          : imageQueueLength > 0
            ? `Convert & Download (${currentImageIndex + 1}/${imageQueueLength})`
            : 'Convert & Download'
        }
      </button>

      {imageQueueLength > 0 && !isOptimizing && (
        <p className="text-xs text-gray-400 mt-2 text-center">
          {isCurrentProcessed
            ? '✓ This image has been processed'
            : `${remainingCount} remaining`
          }
        </p>
      )}

      {/* Optimization Progress */}
      {isOptimizing && (
        <div className="mt-4">
          <div className="text-sm text-gray-300 mb-2">{optimizingStatus}</div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-amber-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${optimizingProgress}%` }}
            ></div>
          </div>
        </div>
      )}
    </>
  );
}

