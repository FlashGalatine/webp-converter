/**
 * Custom hook for managing image state
 */

import { useState, useCallback } from 'react';
import type { LoadedImage } from '../types';

export interface UseImageStateReturn {
  /** Currently loaded image */
  image: HTMLImageElement | null;
  /** Image data URL */
  imageData: string | null;
  /** Load image from file */
  loadImage: (file: File) => Promise<LoadedImage>;
  /** Clear current image */
  clearImage: () => void;
  /** Whether an image is currently loaded */
  hasImage: boolean;
}

/**
 * Hook for managing the current image state
 *
 * Handles loading images from files and maintaining the current image.
 *
 * @returns Image state and manipulation functions
 */
export function useImageState(): UseImageStateReturn {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);

  /**
   * Loads an image from a file
   *
   * @param file - File to load
   * @returns Promise resolving to loaded image data
   */
  const loadImage = useCallback(
    (file: File): Promise<LoadedImage> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          if (!dataUrl) {
            reject(new Error('Failed to read file'));
            return;
          }

          const img = new Image();

          img.onload = () => {
            const loadedImage: LoadedImage = {
              element: img,
              dataUrl,
              width: img.width,
              height: img.height,
              filename: file.name,
            };

            setImage(img);
            setImageData(dataUrl);
            resolve(loadedImage);
          };

          img.onerror = () => {
            reject(new Error('Failed to decode image file. Make sure it is a valid image.'));
          };

          img.src = dataUrl;
        };

        reader.onerror = () => {
          reject(new Error('Failed to read file'));
        };

        reader.readAsDataURL(file);
      });
    },
    []
  );

  /**
   * Clears the current image
   */
  const clearImage = useCallback(() => {
    setImage(null);
    setImageData(null);
  }, []);

  return {
    image,
    imageData,
    loadImage,
    clearImage,
    hasImage: image !== null,
  };
}
