import type { ImageQueueItem } from '../../types';

interface QueuePanelProps {
  imageQueue: ImageQueueItem[];
  currentImageIndex: number;
  processedImages: Set<number>;
  removeAfterConvert: boolean;
  onLoadImage: (index: number) => void;
  onRemoveImage: (index: number) => void;
  onClearQueue: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onToggleRemoveAfterConvert: (value: boolean) => void;
}

export default function QueuePanel({
  imageQueue,
  currentImageIndex,
  processedImages,
  removeAfterConvert,
  onLoadImage,
  onRemoveImage,
  onClearQueue,
  onPrevious,
  onNext,
  onToggleRemoveAfterConvert
}: QueuePanelProps) {
  if (imageQueue.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-gray-300">
          Image Queue ({processedImages.size}/{imageQueue.length})
        </h2>
        <button
          onClick={onClearQueue}
          className="text-xs text-red-400 hover:text-red-300"
        >
          Clear All
        </button>
      </div>

      <div className="bg-gray-700 rounded-lg p-3 mb-3">
        <div className="max-h-48 overflow-y-auto space-y-1.5">
          {imageQueue.map((item, index) => (
            <div
              key={item.id}
              onClick={() => onLoadImage(index)}
              className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                index === currentImageIndex ? 'bg-amber-600 text-white' : 'bg-gray-600 hover:bg-gray-500'
              }`}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {processedImages.has(index) && (
                  <span className="text-green-400 flex-shrink-0">✓</span>
                )}
                {index === currentImageIndex && (
                  <span className="flex-shrink-0">▶</span>
                )}
                <span className="text-xs truncate">{item.name}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveImage(index);
                }}
                className="ml-2 text-red-300 hover:text-red-200 flex-shrink-0"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onPrevious}
          disabled={currentImageIndex <= 0}
          className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white py-2 px-3 rounded text-sm"
        >
          ← Previous
        </button>
        <button
          onClick={onNext}
          disabled={currentImageIndex >= imageQueue.length - 1}
          className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white py-2 px-3 rounded text-sm"
        >
          Next →
        </button>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-600">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={removeAfterConvert}
            onChange={(e) => onToggleRemoveAfterConvert(e.target.checked)}
            className="mr-2 w-4 h-4 cursor-pointer"
          />
          <span className="text-xs text-gray-300">
            Remove from queue after converting
          </span>
        </label>
      </div>
    </div>
  );
}

