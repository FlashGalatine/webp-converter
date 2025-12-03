import { useState, useCallback, useRef } from 'react';
import type { ImageQueueItem } from '../types';

export interface UseImageQueueReturn {
  imageQueue: ImageQueueItem[];
  currentImageIndex: number;
  processedImages: Set<number>;
  removeAfterConvert: boolean;
  setRemoveAfterConvert: (value: boolean) => void;
  addImagesToQueue: (files: FileList) => void;
  loadImageFromQueue: (index: number, onLoad: (file: File) => Promise<void>) => void;
  loadNextImage: () => void;
  loadPreviousImage: () => void;
  markImageAsProcessed: () => void;
  removeImageFromQueue: (index: number, onLoad: (file: File) => Promise<void>) => void;
  clearQueue: () => void;
}

export function useImageQueue(
  onImageLoad: (file: File) => Promise<void>
): UseImageQueueReturn {
  const [imageQueue, setImageQueue] = useState<ImageQueueItem[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(-1);
  const [processedImages, setProcessedImages] = useState<Set<number>>(new Set());
  const [removeAfterConvert, setRemoveAfterConvert] = useState(false);
  
  // Ref to prevent race conditions when rapidly adding files
  const pendingAutoLoadRef = useRef<boolean>(false);

  const addImagesToQueue = useCallback((files: FileList) => {
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      alert('No valid image files found');
      return;
    }

    const newQueueItems: ImageQueueItem[] = imageFiles.map((file, index) => ({
      id: Date.now() + index,
      file: file,
      name: file.name,
      size: file.size,
      type: file.type
    }));

    const wasEmpty = imageQueue.length === 0;
    setImageQueue(prev => [...prev, ...newQueueItems]);

    // Use ref to prevent multiple auto-loads when rapidly adding files
    if (wasEmpty && newQueueItems.length > 0 && !pendingAutoLoadRef.current) {
      pendingAutoLoadRef.current = true;
      setTimeout(() => {
        setCurrentImageIndex(0);
        onImageLoad(newQueueItems[0].file);
        pendingAutoLoadRef.current = false;
      }, 0);
    }
  }, [imageQueue.length, onImageLoad]);

  // Bug #5: Removed onImageLoad from deps since onLoad parameter is used directly
  const loadImageFromQueue = useCallback((index: number, onLoad: (file: File) => Promise<void>) => {
    if (index < 0 || index >= imageQueue.length) return;
    const queueItem = imageQueue[index];
    setCurrentImageIndex(index);
    onLoad(queueItem.file);
  }, [imageQueue]);

  const loadNextImage = useCallback(() => {
    if (currentImageIndex < imageQueue.length - 1) {
      loadImageFromQueue(currentImageIndex + 1, onImageLoad);
    }
  }, [currentImageIndex, imageQueue.length, loadImageFromQueue, onImageLoad]);

  const loadPreviousImage = useCallback(() => {
    if (currentImageIndex > 0) {
      loadImageFromQueue(currentImageIndex - 1, onImageLoad);
    }
  }, [currentImageIndex, loadImageFromQueue, onImageLoad]);

  const markImageAsProcessed = useCallback(() => {
    if (currentImageIndex >= 0) {
      setProcessedImages(prev => new Set([...prev, currentImageIndex]));
    }
  }, [currentImageIndex]);

  const removeImageFromQueue = useCallback((index: number, onLoad: (file: File) => Promise<void>) => {
    const newQueue = imageQueue.filter((_, i) => i !== index);

    const newProcessed = new Set<number>();
    processedImages.forEach(i => {
      if (i < index) newProcessed.add(i);
      else if (i > index) newProcessed.add(i - 1);
    });
    setProcessedImages(newProcessed);

    if (currentImageIndex === index) {
      if (newQueue.length > 0) {
        const nextIndex = Math.min(index, newQueue.length - 1);
        setCurrentImageIndex(nextIndex);
        onLoad(newQueue[nextIndex].file);
      } else {
        setCurrentImageIndex(-1);
      }
    } else if (currentImageIndex > index) {
      setCurrentImageIndex(currentImageIndex - 1);
    }

    setImageQueue(newQueue);
  }, [imageQueue, currentImageIndex, processedImages, onImageLoad]);

  const clearQueue = useCallback(() => {
    setImageQueue([]);
    setCurrentImageIndex(-1);
    setProcessedImages(new Set());
  }, []);

  return {
    imageQueue,
    currentImageIndex,
    processedImages,
    removeAfterConvert,
    setRemoveAfterConvert,
    addImagesToQueue,
    loadImageFromQueue,
    loadNextImage,
    loadPreviousImage,
    markImageAsProcessed,
    removeImageFromQueue,
    clearQueue
  };
}

