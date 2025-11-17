/**
 * Queue component for batch image processing
 */

import { Button } from '../ui';
import type { QueueItem } from '../../types';

export interface QueueProps {
  /** Queue items */
  queue: QueueItem[];
  /** Current image index */
  currentIndex: number;
  /** Set of processed image indices */
  processedImages: Set<number>;
  /** Whether remove after convert is enabled */
  removeAfterConvert: boolean;
  /** Whether can go to next */
  canGoNext: boolean;
  /** Whether can go to previous */
  canGoPrevious: boolean;
  /** Navigate to image at index */
  onNavigateToIndex: (index: number) => void;
  /** Navigate to next image */
  onNext: () => void;
  /** Navigate to previous image */
  onPrevious: () => void;
  /** Remove image from queue */
  onRemove: (index: number) => void;
  /** Clear entire queue */
  onClear: () => void;
  /** Toggle remove after convert */
  onToggleRemoveAfterConvert: () => void;
}

/**
 * Queue component for batch processing
 */
export function Queue({
  queue,
  currentIndex,
  processedImages,
  removeAfterConvert,
  canGoNext,
  canGoPrevious,
  onNavigateToIndex,
  onNext,
  onPrevious,
  onRemove,
  onClear,
  onToggleRemoveAfterConvert,
}: QueueProps) {
  if (queue.length === 0) {
    return null;
  }

  const processedCount = processedImages.size;
  const remainingCount = queue.length - processedCount;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          Queue ({currentIndex + 1} / {queue.length})
        </h3>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={onClear}>
            Clear Queue
          </Button>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={onPrevious}
          disabled={!canGoPrevious}
        >
          ← Previous
        </Button>

        <span className="flex-1 text-center text-sm text-gray-400">
          {processedCount} processed, {remainingCount} remaining
        </span>

        <Button size="sm" variant="secondary" onClick={onNext} disabled={!canGoNext}>
          Next →
        </Button>
      </div>

      {/* Options */}
      <div className="space-y-2">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={removeAfterConvert}
            onChange={onToggleRemoveAfterConvert}
            className="rounded border-gray-600 text-amber-500 focus:ring-amber-500"
          />
          <span className="text-sm text-gray-300">
            Remove images after conversion
          </span>
        </label>
      </div>

      {/* Queue Items List */}
      <div className="max-h-64 overflow-y-auto space-y-2">
        {queue.map((item, index) => {
          const isActive = index === currentIndex;
          const isProcessed = processedImages.has(index);

          return (
            <div
              key={item.id}
              className={`flex items-center gap-2 p-2 rounded border ${
                isActive
                  ? 'border-amber-500 bg-amber-900/30'
                  : 'border-gray-700 bg-gray-800'
              }`}
            >
              <button
                onClick={() => onNavigateToIndex(index)}
                className="flex-1 text-left text-sm text-white hover:text-amber-400 truncate"
                title={item.name}
              >
                <span className={isProcessed ? 'line-through text-gray-500' : ''}>
                  {index + 1}. {item.name}
                </span>
                {isProcessed && (
                  <span className="ml-2 text-xs text-green-400">✓ Processed</span>
                )}
              </button>

              <span className="text-xs text-gray-400">
                {(item.size / 1024).toFixed(1)} KB
              </span>

              <Button
                size="sm"
                variant="secondary"
                onClick={() => onRemove(index)}
                title="Remove from queue"
              >
                ×
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
