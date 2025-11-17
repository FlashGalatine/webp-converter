/**
 * Custom hook for managing image queue state
 */

import { useState, useCallback } from 'react';
import type { QueueItem } from '../types';

export interface UseQueueStateReturn {
  /** Queue of images to process */
  imageQueue: QueueItem[];
  /** Current image index in queue (-1 if no queue) */
  currentImageIndex: number;
  /** Set of processed image indices */
  processedImages: Set<number>;
  /** Whether to remove images after conversion */
  removeAfterConvert: boolean;
  /** Add images to queue */
  addToQueue: (files: File[]) => QueueItem[];
  /** Load image from queue at index */
  loadFromQueue: (index: number) => QueueItem | null;
  /** Navigate to next image */
  goToNext: () => QueueItem | null;
  /** Navigate to previous image */
  goToPrevious: () => QueueItem | null;
  /** Mark current image as processed */
  markAsProcessed: () => void;
  /** Remove image from queue */
  removeFromQueue: (index: number) => void;
  /** Clear entire queue */
  clearQueue: () => void;
  /** Set current index */
  setCurrentIndex: (index: number) => void;
  /** Toggle remove after convert */
  toggleRemoveAfterConvert: () => void;
  /** Set remove after convert */
  setRemoveAfterConvert: (enabled: boolean) => void;
  /** Check if image at index is processed */
  isProcessed: (index: number) => boolean;
  /** Check if can go to next */
  canGoNext: boolean;
  /** Check if can go to previous */
  canGoPrevious: boolean;
  /** Get queue statistics */
  getStats: () => {
    total: number;
    processed: number;
    remaining: number;
  };
}

/**
 * Hook for managing image queue state
 *
 * @returns Queue state and manipulation functions
 */
export function useQueueState(): UseQueueStateReturn {
  const [imageQueue, setImageQueue] = useState<QueueItem[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(-1);
  const [processedImages, setProcessedImages] = useState<Set<number>>(new Set());
  const [removeAfterConvert, setRemoveAfterConvertState] = useState(false);

  /**
   * Adds images to queue
   *
   * @param files - Files to add
   * @returns Created queue items
   */
  const addToQueue = useCallback(
    (files: File[]): QueueItem[] => {
      const imageFiles = files.filter((file) => file.type.startsWith('image/'));

      if (imageFiles.length === 0) {
        return [];
      }

      // Create queue items with metadata
      const newQueueItems: QueueItem[] = imageFiles.map((file, index) => ({
        id: Date.now() + index,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
      }));

      const wasEmpty = imageQueue.length === 0;

      setImageQueue((prev) => [...prev, ...newQueueItems]);

      // If queue was empty, set index to 0
      if (wasEmpty && newQueueItems.length > 0) {
        setTimeout(() => {
          setCurrentImageIndex(0);
        }, 0);
      }

      return newQueueItems;
    },
    [imageQueue.length]
  );

  /**
   * Loads image from queue at index
   */
  const loadFromQueue = useCallback(
    (index: number): QueueItem | null => {
      if (index < 0 || index >= imageQueue.length) {
        return null;
      }

      const queueItem = imageQueue[index];
      setCurrentImageIndex(index);
      return queueItem;
    },
    [imageQueue]
  );

  /**
   * Navigates to next image
   */
  const goToNext = useCallback((): QueueItem | null => {
    if (currentImageIndex < imageQueue.length - 1) {
      const nextIndex = currentImageIndex + 1;
      return loadFromQueue(nextIndex);
    }
    return null;
  }, [currentImageIndex, imageQueue.length, loadFromQueue]);

  /**
   * Navigates to previous image
   */
  const goToPrevious = useCallback((): QueueItem | null => {
    if (currentImageIndex > 0) {
      const prevIndex = currentImageIndex - 1;
      return loadFromQueue(prevIndex);
    }
    return null;
  }, [currentImageIndex, loadFromQueue]);

  /**
   * Marks current image as processed
   */
  const markAsProcessed = useCallback(() => {
    if (currentImageIndex >= 0) {
      setProcessedImages((prev) => new Set([...prev, currentImageIndex]));
    }
  }, [currentImageIndex]);

  /**
   * Removes image from queue
   *
   * Handles index adjustments and loading next image if current is removed.
   */
  const removeFromQueue = useCallback(
    (index: number) => {
      const newQueue = imageQueue.filter((_, i) => i !== index);

      // Update processed images set (adjust indices)
      const newProcessed = new Set<number>();
      processedImages.forEach((i) => {
        if (i < index) newProcessed.add(i);
        else if (i > index) newProcessed.add(i - 1);
      });
      setProcessedImages(newProcessed);

      // Update queue
      setImageQueue(newQueue);

      // Handle current index adjustment
      if (currentImageIndex === index) {
        // Current image was removed
        if (newQueue.length > 0) {
          // Load next image at same position (or last if removing last item)
          const nextIndex = Math.min(index, newQueue.length - 1);
          setCurrentImageIndex(nextIndex);
        } else {
          // Queue is now empty
          setCurrentImageIndex(-1);
        }
      } else if (currentImageIndex > index) {
        // Adjust index if we removed an earlier image
        setCurrentImageIndex(currentImageIndex - 1);
      }
    },
    [imageQueue, currentImageIndex, processedImages]
  );

  /**
   * Clears entire queue
   */
  const clearQueue = useCallback(() => {
    setImageQueue([]);
    setCurrentImageIndex(-1);
    setProcessedImages(new Set());
  }, []);

  /**
   * Sets current index
   */
  const setCurrentIndex = useCallback((index: number) => {
    setCurrentImageIndex(index);
  }, []);

  /**
   * Toggles remove after convert
   */
  const toggleRemoveAfterConvert = useCallback(() => {
    setRemoveAfterConvertState((prev) => !prev);
  }, []);

  /**
   * Sets remove after convert
   */
  const setRemoveAfterConvert = useCallback((enabled: boolean) => {
    setRemoveAfterConvertState(enabled);
  }, []);

  /**
   * Checks if image at index is processed
   */
  const isProcessed = useCallback(
    (index: number): boolean => {
      return processedImages.has(index);
    },
    [processedImages]
  );

  /**
   * Gets queue statistics
   */
  const getStats = useCallback(() => {
    return {
      total: imageQueue.length,
      processed: processedImages.size,
      remaining: imageQueue.length - processedImages.size,
    };
  }, [imageQueue.length, processedImages.size]);

  return {
    imageQueue,
    currentImageIndex,
    processedImages,
    removeAfterConvert,
    addToQueue,
    loadFromQueue,
    goToNext,
    goToPrevious,
    markAsProcessed,
    removeFromQueue,
    clearQueue,
    setCurrentIndex,
    toggleRemoveAfterConvert,
    setRemoveAfterConvert,
    isProcessed,
    canGoNext: currentImageIndex < imageQueue.length - 1,
    canGoPrevious: currentImageIndex > 0,
    getStats,
  };
}
