/**
 * Controls component for conversion settings
 */

import { Button, Input, Select } from '../ui';
import { ResamplingMethodLabels } from '../../types';
import type { ResamplingMethod } from '../../types';

export interface ControlsProps {
  /** Quality value (0-100) */
  quality: number;
  /** Whether lossless is enabled */
  lossless: boolean;
  /** Max width constraint */
  maxWidth: string;
  /** Max height constraint */
  maxHeight: string;
  /** Whether web optimize is enabled */
  webOptimize: boolean;
  /** Target file size */
  targetSize: string;
  /** Resampling method */
  resamplingMethod: ResamplingMethod;
  /** Whether currently optimizing */
  isOptimizing: boolean;
  /** Optimization progress (0-100) */
  optimizingProgress: number;
  /** Optimization status message */
  optimizingStatus: string;
  /** Whether image is loaded */
  hasImage: boolean;
  /** Quality change handler */
  onQualityChange: (quality: number) => void;
  /** Lossless toggle handler */
  onLosslessToggle: () => void;
  /** Max width change handler */
  onMaxWidthChange: (width: string) => void;
  /** Max height change handler */
  onMaxHeightChange: (height: string) => void;
  /** Web optimize toggle handler */
  onWebOptimizeToggle: () => void;
  /** Target size change handler */
  onTargetSizeChange: (size: string) => void;
  /** Resampling method change handler */
  onResamplingMethodChange: (method: ResamplingMethod) => void;
  /** Convert button click handler */
  onConvert: () => void;
}

/**
 * Controls component for conversion settings
 */
export function Controls({
  quality,
  lossless,
  maxWidth,
  maxHeight,
  webOptimize,
  targetSize,
  resamplingMethod,
  isOptimizing,
  optimizingProgress,
  optimizingStatus,
  hasImage,
  onQualityChange,
  onLosslessToggle,
  onMaxWidthChange,
  onMaxHeightChange,
  onWebOptimizeToggle,
  onTargetSizeChange,
  onResamplingMethodChange,
  onConvert,
}: ControlsProps) {
  return (
    <div className="space-y-6">
      {/* Quality Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Quality Settings</h3>

        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={lossless}
              onChange={onLosslessToggle}
              className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Lossless Compression
            </span>
          </label>
        </div>

        {!lossless && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quality: {quality}%
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={quality}
              onChange={(e) => onQualityChange(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>
        )}
      </div>

      {/* Dimension Constraints */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Dimension Constraints
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Max Width (px)"
            type="number"
            value={maxWidth}
            onChange={(e) => onMaxWidthChange(e.target.value)}
            placeholder="Auto"
          />

          <Input
            label="Max Height (px)"
            type="number"
            value={maxHeight}
            onChange={(e) => onMaxHeightChange(e.target.value)}
            placeholder="Auto"
          />
        </div>
      </div>

      {/* Web Optimization */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="web-optimize"
            checked={webOptimize}
            onChange={onWebOptimizeToggle}
            className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
          />
          <label htmlFor="web-optimize" className="text-sm font-medium text-gray-700">
            Web Optimization (Target File Size)
          </label>
        </div>

        {webOptimize && (
          <div className="flex items-end gap-2">
            <Input
              label="Target Size"
              type="number"
              value={targetSize}
              onChange={(e) => onTargetSizeChange(e.target.value)}
              step="0.1"
            />
            <div className="pb-2">
              <span className="text-sm text-gray-600">MB</span>
            </div>
          </div>
        )}
      </div>

      {/* Resampling Method */}
      <div>
        <Select
          label="Resampling Method"
          value={resamplingMethod}
          onChange={(e) =>
            onResamplingMethodChange(e.target.value as ResamplingMethod)
          }
        >
          {Object.entries(ResamplingMethodLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>

      {/* Convert Button */}
      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={onConvert}
        disabled={!hasImage || isOptimizing}
      >
        {isOptimizing ? 'Converting...' : 'Convert & Download'}
      </Button>

      {/* Optimization Progress */}
      {isOptimizing && (
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-amber-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${optimizingProgress}%` }}
            />
          </div>
          <p className="text-sm text-center text-gray-600">{optimizingStatus}</p>
        </div>
      )}
    </div>
  );
}
