import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useImageQueue } from './useImageQueue'

describe('useImageQueue', () => {
  const mockOnImageLoad = vi.fn().mockResolvedValue(undefined)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with empty queue', () => {
    const { result } = renderHook(() => useImageQueue(mockOnImageLoad))

    expect(result.current.imageQueue).toEqual([])
    expect(result.current.currentImageIndex).toBe(-1)
    expect(result.current.processedImages.size).toBe(0)
    expect(result.current.removeAfterConvert).toBe(false)
  })

  describe('addImagesToQueue', () => {
    it('should add images to queue', async () => {
      const { result } = renderHook(() => useImageQueue(mockOnImageLoad))

      const mockFiles = createMockFileList([
        new File(['test1'], 'image1.png', { type: 'image/png' }),
        new File(['test2'], 'image2.jpg', { type: 'image/jpeg' })
      ])

      act(() => {
        result.current.addImagesToQueue(mockFiles)
      })

      expect(result.current.imageQueue).toHaveLength(2)
      expect(result.current.imageQueue[0].name).toBe('image1.png')
      expect(result.current.imageQueue[1].name).toBe('image2.jpg')
    })

    it('should filter non-image files', () => {
      const { result } = renderHook(() => useImageQueue(mockOnImageLoad))

      const mockFiles = createMockFileList([
        new File(['test1'], 'document.pdf', { type: 'application/pdf' }),
        new File(['test2'], 'image.png', { type: 'image/png' }),
        new File(['test3'], 'document.txt', { type: 'text/plain' })
      ])

      act(() => {
        result.current.addImagesToQueue(mockFiles)
      })

      expect(result.current.imageQueue).toHaveLength(1)
      expect(result.current.imageQueue[0].name).toBe('image.png')
    })

    it('should auto-load first image when queue was empty', async () => {
      const { result } = renderHook(() => useImageQueue(mockOnImageLoad))

      const mockFiles = createMockFileList([
        new File(['test'], 'image.png', { type: 'image/png' })
      ])

      act(() => {
        result.current.addImagesToQueue(mockFiles)
      })

      // Wait for the setTimeout in addImagesToQueue
      await waitFor(() => {
        expect(result.current.currentImageIndex).toBe(0)
      })

      expect(mockOnImageLoad).toHaveBeenCalled()
    })

    it('should show alert for no valid images', () => {
      const { result } = renderHook(() => useImageQueue(mockOnImageLoad))

      const mockFiles = createMockFileList([
        new File(['test'], 'document.pdf', { type: 'application/pdf' })
      ])

      act(() => {
        result.current.addImagesToQueue(mockFiles)
      })

      expect(window.alert).toHaveBeenCalledWith('No valid image files found')
    })
  })

  describe('loadImageFromQueue', () => {
    it('should load image at specific index', async () => {
      const onLoad = vi.fn().mockResolvedValue(undefined)
      const { result } = renderHook(() => useImageQueue(mockOnImageLoad))

      // First add images
      const mockFiles = createMockFileList([
        new File(['test1'], 'image1.png', { type: 'image/png' }),
        new File(['test2'], 'image2.png', { type: 'image/png' })
      ])

      act(() => {
        result.current.addImagesToQueue(mockFiles)
      })

      // Then load specific image
      act(() => {
        result.current.loadImageFromQueue(1, onLoad)
      })

      expect(result.current.currentImageIndex).toBe(1)
      expect(onLoad).toHaveBeenCalled()
    })

    it('should not load if index is out of bounds', () => {
      const onLoad = vi.fn()
      const { result } = renderHook(() => useImageQueue(mockOnImageLoad))

      act(() => {
        result.current.loadImageFromQueue(5, onLoad)
      })

      expect(onLoad).not.toHaveBeenCalled()
    })

    it('should not load if index is negative', () => {
      const onLoad = vi.fn()
      const { result } = renderHook(() => useImageQueue(mockOnImageLoad))

      act(() => {
        result.current.loadImageFromQueue(-1, onLoad)
      })

      expect(onLoad).not.toHaveBeenCalled()
    })
  })

  describe('loadNextImage / loadPreviousImage', () => {
    it('should load next image', async () => {
      const { result } = renderHook(() => useImageQueue(mockOnImageLoad))

      const mockFiles = createMockFileList([
        new File(['test1'], 'image1.png', { type: 'image/png' }),
        new File(['test2'], 'image2.png', { type: 'image/png' })
      ])

      act(() => {
        result.current.addImagesToQueue(mockFiles)
      })

      await waitFor(() => {
        expect(result.current.currentImageIndex).toBe(0)
      })

      act(() => {
        result.current.loadNextImage()
      })

      expect(result.current.currentImageIndex).toBe(1)
    })

    it('should not go past last image', async () => {
      const { result } = renderHook(() => useImageQueue(mockOnImageLoad))

      const mockFiles = createMockFileList([
        new File(['test'], 'image.png', { type: 'image/png' })
      ])

      act(() => {
        result.current.addImagesToQueue(mockFiles)
      })

      await waitFor(() => {
        expect(result.current.currentImageIndex).toBe(0)
      })

      act(() => {
        result.current.loadNextImage()
      })

      expect(result.current.currentImageIndex).toBe(0)
    })

    it('should load previous image', async () => {
      const { result } = renderHook(() => useImageQueue(mockOnImageLoad))

      const mockFiles = createMockFileList([
        new File(['test1'], 'image1.png', { type: 'image/png' }),
        new File(['test2'], 'image2.png', { type: 'image/png' })
      ])

      act(() => {
        result.current.addImagesToQueue(mockFiles)
      })

      await waitFor(() => {
        expect(result.current.currentImageIndex).toBe(0)
      })

      // Go to index 1
      act(() => {
        result.current.loadNextImage()
      })

      // Go back to index 0
      act(() => {
        result.current.loadPreviousImage()
      })

      expect(result.current.currentImageIndex).toBe(0)
    })

    it('should not go before first image', async () => {
      const { result } = renderHook(() => useImageQueue(mockOnImageLoad))

      const mockFiles = createMockFileList([
        new File(['test'], 'image.png', { type: 'image/png' })
      ])

      act(() => {
        result.current.addImagesToQueue(mockFiles)
      })

      await waitFor(() => {
        expect(result.current.currentImageIndex).toBe(0)
      })

      act(() => {
        result.current.loadPreviousImage()
      })

      expect(result.current.currentImageIndex).toBe(0)
    })
  })

  describe('markImageAsProcessed', () => {
    it('should mark current image as processed', async () => {
      const { result } = renderHook(() => useImageQueue(mockOnImageLoad))

      const mockFiles = createMockFileList([
        new File(['test'], 'image.png', { type: 'image/png' })
      ])

      act(() => {
        result.current.addImagesToQueue(mockFiles)
      })

      await waitFor(() => {
        expect(result.current.currentImageIndex).toBe(0)
      })

      act(() => {
        result.current.markImageAsProcessed()
      })

      expect(result.current.processedImages.has(0)).toBe(true)
    })

    it('should not mark if no current image', () => {
      const { result } = renderHook(() => useImageQueue(mockOnImageLoad))

      act(() => {
        result.current.markImageAsProcessed()
      })

      expect(result.current.processedImages.size).toBe(0)
    })
  })

  describe('clearQueue', () => {
    it('should clear all queue state', async () => {
      const { result } = renderHook(() => useImageQueue(mockOnImageLoad))

      const mockFiles = createMockFileList([
        new File(['test'], 'image.png', { type: 'image/png' })
      ])

      act(() => {
        result.current.addImagesToQueue(mockFiles)
      })

      await waitFor(() => {
        expect(result.current.imageQueue.length).toBe(1)
      })

      act(() => {
        result.current.markImageAsProcessed()
      })

      act(() => {
        result.current.clearQueue()
      })

      expect(result.current.imageQueue).toEqual([])
      expect(result.current.currentImageIndex).toBe(-1)
      expect(result.current.processedImages.size).toBe(0)
    })
  })

  describe('removeAfterConvert', () => {
    it('should toggle removeAfterConvert', () => {
      const { result } = renderHook(() => useImageQueue(mockOnImageLoad))

      expect(result.current.removeAfterConvert).toBe(false)

      act(() => {
        result.current.setRemoveAfterConvert(true)
      })

      expect(result.current.removeAfterConvert).toBe(true)

      act(() => {
        result.current.setRemoveAfterConvert(false)
      })

      expect(result.current.removeAfterConvert).toBe(false)
    })
  })

  describe('removeImageFromQueue', () => {
    it('should remove image and adjust indices', async () => {
      const onLoad = vi.fn().mockResolvedValue(undefined)
      const { result } = renderHook(() => useImageQueue(mockOnImageLoad))

      const mockFiles = createMockFileList([
        new File(['test1'], 'image1.png', { type: 'image/png' }),
        new File(['test2'], 'image2.png', { type: 'image/png' }),
        new File(['test3'], 'image3.png', { type: 'image/png' })
      ])

      act(() => {
        result.current.addImagesToQueue(mockFiles)
      })

      await waitFor(() => {
        expect(result.current.imageQueue.length).toBe(3)
      })

      // Remove middle image
      act(() => {
        result.current.removeImageFromQueue(1, onLoad)
      })

      expect(result.current.imageQueue).toHaveLength(2)
      expect(result.current.imageQueue[0].name).toBe('image1.png')
      expect(result.current.imageQueue[1].name).toBe('image3.png')
    })

    it('should adjust processed images indices when removing image before processed', async () => {
      const onLoad = vi.fn().mockResolvedValue(undefined)
      const { result } = renderHook(() => useImageQueue(mockOnImageLoad))

      const mockFiles = createMockFileList([
        new File(['test1'], 'image1.png', { type: 'image/png' }),
        new File(['test2'], 'image2.png', { type: 'image/png' }),
        new File(['test3'], 'image3.png', { type: 'image/png' })
      ])

      act(() => {
        result.current.addImagesToQueue(mockFiles)
      })

      await waitFor(() => {
        expect(result.current.currentImageIndex).toBe(0)
      })

      // Navigate to image 2 (index 1) and mark as processed
      act(() => {
        result.current.loadNextImage()
      })

      await waitFor(() => {
        expect(result.current.currentImageIndex).toBe(1)
      })

      act(() => {
        result.current.markImageAsProcessed()
      })

      expect(result.current.processedImages.has(1)).toBe(true)

      // Navigate to image 3 (index 2) and mark as processed
      act(() => {
        result.current.loadNextImage()
      })

      await waitFor(() => {
        expect(result.current.currentImageIndex).toBe(2)
      })

      act(() => {
        result.current.markImageAsProcessed()
      })

      expect(result.current.processedImages.has(2)).toBe(true)

      // Remove image 1 (index 0) - should adjust processed indices
      act(() => {
        result.current.removeImageFromQueue(0, onLoad)
      })

      // Processed index 1 should now be 0, processed index 2 should now be 1
      expect(result.current.processedImages.has(0)).toBe(true)
      expect(result.current.processedImages.has(1)).toBe(true)
      expect(result.current.processedImages.has(2)).toBe(false)
    })

    it('should load next image when removing current image with more images in queue', async () => {
      const onLoad = vi.fn().mockResolvedValue(undefined)
      const { result } = renderHook(() => useImageQueue(mockOnImageLoad))

      const mockFiles = createMockFileList([
        new File(['test1'], 'image1.png', { type: 'image/png' }),
        new File(['test2'], 'image2.png', { type: 'image/png' }),
        new File(['test3'], 'image3.png', { type: 'image/png' })
      ])

      act(() => {
        result.current.addImagesToQueue(mockFiles)
      })

      await waitFor(() => {
        expect(result.current.currentImageIndex).toBe(0)
      })

      // Remove current image (index 0)
      act(() => {
        result.current.removeImageFromQueue(0, onLoad)
      })

      // Should load next image (now at index 0)
      expect(result.current.currentImageIndex).toBe(0)
      expect(result.current.imageQueue[0].name).toBe('image2.png')
      expect(onLoad).toHaveBeenCalled()
    })

    it('should reset index when removing last remaining image', async () => {
      const onLoad = vi.fn().mockResolvedValue(undefined)
      const { result } = renderHook(() => useImageQueue(mockOnImageLoad))

      const mockFiles = createMockFileList([
        new File(['test1'], 'image1.png', { type: 'image/png' })
      ])

      act(() => {
        result.current.addImagesToQueue(mockFiles)
      })

      await waitFor(() => {
        expect(result.current.currentImageIndex).toBe(0)
      })

      // Remove the only image
      act(() => {
        result.current.removeImageFromQueue(0, onLoad)
      })

      // Queue should be empty, index should be -1
      expect(result.current.imageQueue.length).toBe(0)
      expect(result.current.currentImageIndex).toBe(-1)
    })

    it('should adjust currentImageIndex when removing image before current', async () => {
      const onLoad = vi.fn().mockResolvedValue(undefined)
      const { result } = renderHook(() => useImageQueue(mockOnImageLoad))

      const mockFiles = createMockFileList([
        new File(['test1'], 'image1.png', { type: 'image/png' }),
        new File(['test2'], 'image2.png', { type: 'image/png' }),
        new File(['test3'], 'image3.png', { type: 'image/png' })
      ])

      act(() => {
        result.current.addImagesToQueue(mockFiles)
      })

      await waitFor(() => {
        expect(result.current.currentImageIndex).toBe(0)
      })

      // Navigate to image 3 (index 2)
      act(() => {
        result.current.loadNextImage()
      })
      act(() => {
        result.current.loadNextImage()
      })

      await waitFor(() => {
        expect(result.current.currentImageIndex).toBe(2)
      })

      // Remove image 1 (index 0) - current index should decrease
      act(() => {
        result.current.removeImageFromQueue(0, onLoad)
      })

      // Current index should now be 1 (was 2, decreased by 1)
      expect(result.current.currentImageIndex).toBe(1)
    })

    it('should keep processed indices before removed index', async () => {
      const onLoad = vi.fn().mockResolvedValue(undefined)
      const { result } = renderHook(() => useImageQueue(mockOnImageLoad))

      const mockFiles = createMockFileList([
        new File(['test1'], 'image1.png', { type: 'image/png' }),
        new File(['test2'], 'image2.png', { type: 'image/png' }),
        new File(['test3'], 'image3.png', { type: 'image/png' })
      ])

      act(() => {
        result.current.addImagesToQueue(mockFiles)
      })

      await waitFor(() => {
        expect(result.current.currentImageIndex).toBe(0)
      })

      // Mark first image as processed
      act(() => {
        result.current.markImageAsProcessed()
      })

      expect(result.current.processedImages.has(0)).toBe(true)

      // Remove image 3 (index 2) - processed index 0 should remain
      act(() => {
        result.current.removeImageFromQueue(2, onLoad)
      })

      expect(result.current.processedImages.has(0)).toBe(true)
    })

    it('should handle removing last image when viewing it', async () => {
      const onLoad = vi.fn().mockResolvedValue(undefined)
      const { result } = renderHook(() => useImageQueue(mockOnImageLoad))

      const mockFiles = createMockFileList([
        new File(['test1'], 'image1.png', { type: 'image/png' }),
        new File(['test2'], 'image2.png', { type: 'image/png' })
      ])

      act(() => {
        result.current.addImagesToQueue(mockFiles)
      })

      await waitFor(() => {
        expect(result.current.currentImageIndex).toBe(0)
      })

      // Navigate to last image
      act(() => {
        result.current.loadNextImage()
      })

      expect(result.current.currentImageIndex).toBe(1)

      // Remove last image while viewing it
      act(() => {
        result.current.removeImageFromQueue(1, onLoad)
      })

      // Should load the new last image (index 0)
      expect(result.current.currentImageIndex).toBe(0)
      expect(result.current.imageQueue.length).toBe(1)
    })
  })
})

// Helper function to create FileList-like object
function createMockFileList(files: File[]): FileList {
  const fileList = {
    length: files.length,
    item: (index: number) => files[index] || null
  } as FileList

  files.forEach((file, index) => {
    Object.defineProperty(fileList, index, {
      value: file,
      enumerable: true
    })
  })

  // Make it iterable
  Object.defineProperty(fileList, Symbol.iterator, {
    value: function* () {
      for (let i = 0; i < files.length; i++) {
        yield files[i]
      }
    }
  })

  return fileList
}
