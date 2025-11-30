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
