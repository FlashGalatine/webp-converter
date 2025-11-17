/**
 * Custom hook for handling clipboard paste events
 */

import { useEffect, useCallback } from 'react';
import { generatePastedImageFilename } from '../utils/files';

export interface UseClipboardOptions {
  /** Whether clipboard paste is enabled */
  enabled?: boolean;
  /** Callback when image is pasted */
  onImagePasted?: (file: File) => void;
}

export interface UseClipboardReturn {
  /** Handle paste event manually */
  handlePaste: (event: ClipboardEvent) => Promise<void>;
}

/**
 * Hook for handling clipboard paste events
 *
 * Automatically attaches/detaches event listeners when enabled.
 *
 * @param options - Clipboard options
 * @returns Clipboard utilities
 */
export function useClipboard(options: UseClipboardOptions = {}): UseClipboardReturn {
  const { enabled = true, onImagePasted } = options;

  /**
   * Handles paste events
   */
  const handlePaste = useCallback(
    async (event: ClipboardEvent): Promise<void> => {
      const items = event.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        // Check if the item is an image
        if (item.type.startsWith('image/')) {
          event.preventDefault();

          try {
            const blob = item.getAsFile();
            if (!blob) continue;

            // Convert blob to File object with a generated name
            const fileName = generatePastedImageFilename(blob.type);
            const file = new File([blob], fileName, { type: blob.type });

            if (onImagePasted) {
              onImagePasted(file);
            }

            console.log('[Clipboard] Image pasted:', fileName);
          } catch (error) {
            console.error('[Clipboard] Error processing clipboard image:', error);
          }

          break; // Only process the first image
        }
      }
    },
    [onImagePasted]
  );

  /**
   * Attach/detach paste event listener
   */
  useEffect(() => {
    if (!enabled) return;

    const pasteHandler = (e: Event) => {
      handlePaste(e as ClipboardEvent);
    };

    window.addEventListener('paste', pasteHandler);
    return () => window.removeEventListener('paste', pasteHandler);
  }, [enabled, handlePaste]);

  return {
    handlePaste,
  };
}
