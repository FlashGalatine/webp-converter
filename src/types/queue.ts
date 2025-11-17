/**
 * Queue-related type definitions
 */

/**
 * Status of a queue item
 */
export type QueueItemStatus = 'pending' | 'processing' | 'completed' | 'error';

/**
 * Simple queue item (legacy-compatible)
 */
export interface QueueItem {
  /** Unique identifier for this queue item */
  id: number;
  /** Image file */
  file: File;
  /** Original filename */
  name: string;
  /** File size in bytes */
  size: number;
  /** MIME type */
  type: string;
}

/**
 * Extended queue item with additional metadata
 *
 * For future use with enhanced queue features.
 */
export interface ExtendedQueueItem extends QueueItem {
  /** Preview data URL */
  preview?: string;
  /** Processing status */
  status?: QueueItemStatus;
  /** Error message if status is 'error' */
  error?: string;
  /** Timestamp when added to queue */
  addedAt?: Date;
  /** Timestamp when processed (if completed) */
  processedAt?: Date;
}

/**
 * Queue navigation direction
 */
export type NavigationDirection = 'next' | 'previous' | 'first' | 'last';

/**
 * Queue state
 */
export interface QueueState {
  /** Array of queue items */
  items: QueueItem[];
  /** Index of currently active item (-1 if none) */
  currentIndex: number;
  /** Set of processed item IDs */
  processedIds: Set<string>;
  /** Whether to remove items after conversion */
  removeAfterConvert: boolean;
  /** Whether to auto-advance to next image after conversion */
  autoAdvance: boolean;
}

/**
 * Queue statistics
 */
export interface QueueStats {
  /** Total number of items in queue */
  total: number;
  /** Number of completed items */
  completed: number;
  /** Number of pending items */
  pending: number;
  /** Number of items with errors */
  errors: number;
  /** Current position (1-based) */
  currentPosition: number;
  /** Whether there are more items to process */
  hasMore: boolean;
  /** Whether can navigate to previous */
  canGoPrevious: boolean;
  /** Whether can navigate to next */
  canGoNext: boolean;
}

/**
 * Batch processing options
 */
export interface BatchProcessingOptions {
  /** Quality setting to use */
  quality: number;
  /** Whether to use lossless compression */
  lossless: boolean;
  /** Max width constraint */
  maxWidth?: number;
  /** Max height constraint */
  maxHeight?: number;
  /** Whether to optimize for web */
  webOptimize: boolean;
  /** Target file size for web optimization */
  targetSize?: number;
  /** Resampling method */
  resamplingMethod: string;
  /** Whether to remove after converting */
  removeAfterConvert: boolean;
}

/**
 * Queue action result
 */
export interface QueueActionResult {
  /** Whether the action was successful */
  success: boolean;
  /** Error message if unsuccessful */
  error?: string;
  /** New current index after action */
  newIndex?: number;
  /** Item that was affected */
  item?: QueueItem;
}
