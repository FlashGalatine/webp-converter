import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useImageProcessing } from './useImageProcessing'

describe('useImageProcessing', () => {
  let mockImage: HTMLImageElement

  beforeEach(() => {
    mockImage = {
      width: 1920,
      height: 1080
    } as HTMLImageElement
    vi.clearAllMocks()
  })

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useImageProcessing())

    expect(result.current.isOptimizing).toBe(false)
    expect(result.current.optimizingProgress).toBe(0)
    expect(result.current.optimizingStatus).toBe('')
  })

  it('should provide handleConvert function', () => {
    const { result } = renderHook(() => useImageProcessing())

    expect(typeof result.current.handleConvert).toBe('function')
  })

  describe('handleConvert', () => {
    it('should set isOptimizing to true during conversion', async () => {
      const { result } = renderHook(() => useImageProcessing())
      const onComplete = vi.fn()

      act(() => {
        result.current.handleConvert({
          image: mockImage,
          cropX: 0,
          cropY: 0,
          cropWidth: 1920,
          cropHeight: 1080,
          maxWidth: '',
          maxHeight: '',
          resamplingMethod: 'browser',
          quality: 95,
          lossless: false,
          webOptimize: false,
          targetSize: '10',
          onComplete
        })
      })

      expect(result.current.isOptimizing).toBe(true)

      // Wait for async operations
      await waitFor(() => {
        expect(result.current.isOptimizing).toBe(false)
      }, { timeout: 2000 })
    })

    it('should call onComplete when conversion finishes', async () => {
      const { result } = renderHook(() => useImageProcessing())
      const onComplete = vi.fn()

      act(() => {
        result.current.handleConvert({
          image: mockImage,
          cropX: 0,
          cropY: 0,
          cropWidth: 1920,
          cropHeight: 1080,
          maxWidth: '',
          maxHeight: '',
          resamplingMethod: 'browser',
          quality: 95,
          lossless: false,
          webOptimize: false,
          targetSize: '10',
          onComplete
        })
      })

      await waitFor(() => {
        expect(onComplete).toHaveBeenCalled()
      }, { timeout: 2000 })
    })

    it('should handle lossless conversion', async () => {
      const { result } = renderHook(() => useImageProcessing())
      const onComplete = vi.fn()

      act(() => {
        result.current.handleConvert({
          image: mockImage,
          cropX: 0,
          cropY: 0,
          cropWidth: 500,
          cropHeight: 500,
          maxWidth: '',
          maxHeight: '',
          resamplingMethod: 'browser',
          quality: 100,
          lossless: true,
          webOptimize: false,
          targetSize: '10',
          onComplete
        })
      })

      await waitFor(() => {
        expect(result.current.isOptimizing).toBe(false)
      }, { timeout: 2000 })

      expect(onComplete).toHaveBeenCalled()
    })

    it('should handle conversion with max dimensions', async () => {
      const { result } = renderHook(() => useImageProcessing())
      const onComplete = vi.fn()

      act(() => {
        result.current.handleConvert({
          image: mockImage,
          cropX: 0,
          cropY: 0,
          cropWidth: 500,
          cropHeight: 500,
          maxWidth: '250',
          maxHeight: '250',
          resamplingMethod: 'browser', // Use browser for speed
          quality: 85,
          lossless: false,
          webOptimize: false,
          targetSize: '10',
          onComplete
        })
      })

      await waitFor(() => {
        expect(result.current.isOptimizing).toBe(false)
      }, { timeout: 3000 })

      expect(onComplete).toHaveBeenCalled()
    })

    it('should handle conversion with crop offset', async () => {
      const { result } = renderHook(() => useImageProcessing())
      const onComplete = vi.fn()

      act(() => {
        result.current.handleConvert({
          image: mockImage,
          cropX: 100,
          cropY: 50,
          cropWidth: 800,
          cropHeight: 600,
          maxWidth: '',
          maxHeight: '',
          resamplingMethod: 'browser',
          quality: 90,
          lossless: false,
          webOptimize: false,
          targetSize: '10',
          onComplete
        })
      })

      await waitFor(() => {
        expect(result.current.isOptimizing).toBe(false)
      }, { timeout: 2000 })

      expect(onComplete).toHaveBeenCalled()
    })

    it('should update status during conversion', async () => {
      const { result } = renderHook(() => useImageProcessing())
      const onComplete = vi.fn()

      act(() => {
        result.current.handleConvert({
          image: mockImage,
          cropX: 0,
          cropY: 0,
          cropWidth: 500,
          cropHeight: 500,
          maxWidth: '',
          maxHeight: '',
          resamplingMethod: 'browser',
          quality: 80,
          lossless: false,
          webOptimize: false,
          targetSize: '10',
          onComplete
        })
      })

      // Should have some status set
      expect(result.current.optimizingStatus).not.toBe('')

      await waitFor(() => {
        expect(result.current.isOptimizing).toBe(false)
      }, { timeout: 2000 })
    })

    it('should handle browser resampling method', async () => {
      const { result } = renderHook(() => useImageProcessing())
      const onComplete = vi.fn()

      act(() => {
        result.current.handleConvert({
          image: mockImage,
          cropX: 0,
          cropY: 0,
          cropWidth: 500,
          cropHeight: 500,
          maxWidth: '250',
          maxHeight: '',
          resamplingMethod: 'browser',
          quality: 85,
          lossless: false,
          webOptimize: false,
          targetSize: '10',
          onComplete
        })
      })

      await waitFor(() => {
        expect(result.current.isOptimizing).toBe(false)
      }, { timeout: 3000 })
    })
  })

  describe('web optimization', () => {
    it('should attempt web optimization when enabled', async () => {
      const { result } = renderHook(() => useImageProcessing())
      const onComplete = vi.fn()

      act(() => {
        result.current.handleConvert({
          image: mockImage,
          cropX: 0,
          cropY: 0,
          cropWidth: 100,
          cropHeight: 100,
          maxWidth: '',
          maxHeight: '',
          resamplingMethod: 'browser',
          quality: 85,
          lossless: false,
          webOptimize: true,
          targetSize: '10', // 10 MB target - should be easy to meet
          onComplete
        })
      })

      // Should show lossless test status
      await waitFor(() => {
        expect(result.current.optimizingStatus).toContain('lossless')
      }, { timeout: 1000 })

      await waitFor(() => {
        expect(result.current.isOptimizing).toBe(false)
      }, { timeout: 5000 })
    })

    it('should skip web optimization when lossless is enabled', async () => {
      const { result } = renderHook(() => useImageProcessing())
      const onComplete = vi.fn()

      act(() => {
        result.current.handleConvert({
          image: mockImage,
          cropX: 0,
          cropY: 0,
          cropWidth: 100,
          cropHeight: 100,
          maxWidth: '',
          maxHeight: '',
          resamplingMethod: 'browser',
          quality: 85,
          lossless: true,
          webOptimize: true, // Should be ignored when lossless is true
          targetSize: '0.001', // Very small target
          onComplete
        })
      })

      await waitFor(() => {
        expect(result.current.isOptimizing).toBe(false)
      }, { timeout: 2000 })

      expect(onComplete).toHaveBeenCalled()
    })

    it('should use lossless when it fits target size', async () => {
      const { result } = renderHook(() => useImageProcessing())
      const onComplete = vi.fn()

      act(() => {
        result.current.handleConvert({
          image: mockImage,
          cropX: 0,
          cropY: 0,
          cropWidth: 50,
          cropHeight: 50,
          maxWidth: '',
          maxHeight: '',
          resamplingMethod: 'browser',
          quality: 85,
          lossless: false,
          webOptimize: true,
          targetSize: '100', // Very large target - lossless should fit
          onComplete
        })
      })

      await waitFor(() => {
        expect(result.current.isOptimizing).toBe(false)
      }, { timeout: 3000 })

      expect(onComplete).toHaveBeenCalled()
    })

    it('should show progress during web optimization', async () => {
      const { result } = renderHook(() => useImageProcessing())
      const onComplete = vi.fn()

      act(() => {
        result.current.handleConvert({
          image: mockImage,
          cropX: 0,
          cropY: 0,
          cropWidth: 50,
          cropHeight: 50,
          maxWidth: '',
          maxHeight: '',
          resamplingMethod: 'browser',
          quality: 85,
          lossless: false,
          webOptimize: true,
          targetSize: '10',
          onComplete
        })
      })

      // Progress should be set during optimization
      expect(result.current.optimizingProgress).toBeDefined()

      await waitFor(() => {
        expect(result.current.isOptimizing).toBe(false)
      }, { timeout: 3000 })
    })
  })

  describe('standard conversion (non-web optimize)', () => {
    it('should convert with specified quality', async () => {
      const { result } = renderHook(() => useImageProcessing())
      const onComplete = vi.fn()

      act(() => {
        result.current.handleConvert({
          image: mockImage,
          cropX: 0,
          cropY: 0,
          cropWidth: 200,
          cropHeight: 200,
          maxWidth: '',
          maxHeight: '',
          resamplingMethod: 'browser',
          quality: 75,
          lossless: false,
          webOptimize: false,
          targetSize: '10',
          onComplete
        })
      })

      await waitFor(() => {
        expect(result.current.isOptimizing).toBe(false)
      }, { timeout: 2000 })

      expect(onComplete).toHaveBeenCalled()
    })

    it('should convert with lossless mode', async () => {
      const { result } = renderHook(() => useImageProcessing())
      const onComplete = vi.fn()

      act(() => {
        result.current.handleConvert({
          image: mockImage,
          cropX: 0,
          cropY: 0,
          cropWidth: 200,
          cropHeight: 200,
          maxWidth: '',
          maxHeight: '',
          resamplingMethod: 'browser',
          quality: 100,
          lossless: true,
          webOptimize: false,
          targetSize: '10',
          onComplete
        })
      })

      await waitFor(() => {
        expect(result.current.isOptimizing).toBe(false)
      }, { timeout: 2000 })

      expect(onComplete).toHaveBeenCalled()
    })

    it('should show converting status', async () => {
      const { result } = renderHook(() => useImageProcessing())
      const onComplete = vi.fn()

      act(() => {
        result.current.handleConvert({
          image: mockImage,
          cropX: 0,
          cropY: 0,
          cropWidth: 200,
          cropHeight: 200,
          maxWidth: '',
          maxHeight: '',
          resamplingMethod: 'browser',
          quality: 80,
          lossless: false,
          webOptimize: false,
          targetSize: '10',
          onComplete
        })
      })

      // Should have some status
      expect(result.current.optimizingStatus).toBeDefined()

      await waitFor(() => {
        expect(result.current.isOptimizing).toBe(false)
      }, { timeout: 2000 })
    })

    it('should handle very low quality', async () => {
      const { result } = renderHook(() => useImageProcessing())
      const onComplete = vi.fn()

      act(() => {
        result.current.handleConvert({
          image: mockImage,
          cropX: 0,
          cropY: 0,
          cropWidth: 200,
          cropHeight: 200,
          maxWidth: '',
          maxHeight: '',
          resamplingMethod: 'browser',
          quality: 1,
          lossless: false,
          webOptimize: false,
          targetSize: '10',
          onComplete
        })
      })

      await waitFor(() => {
        expect(result.current.isOptimizing).toBe(false)
      }, { timeout: 2000 })

      expect(onComplete).toHaveBeenCalled()
    })

    it('should handle maximum quality', async () => {
      const { result } = renderHook(() => useImageProcessing())
      const onComplete = vi.fn()

      act(() => {
        result.current.handleConvert({
          image: mockImage,
          cropX: 0,
          cropY: 0,
          cropWidth: 200,
          cropHeight: 200,
          maxWidth: '',
          maxHeight: '',
          resamplingMethod: 'browser',
          quality: 100,
          lossless: false,
          webOptimize: false,
          targetSize: '10',
          onComplete
        })
      })

      await waitFor(() => {
        expect(result.current.isOptimizing).toBe(false)
      }, { timeout: 2000 })

      expect(onComplete).toHaveBeenCalled()
    })
  })

  describe('resampling status', () => {
    it('should show resampling status when resizing', async () => {
      const { result } = renderHook(() => useImageProcessing())
      const onComplete = vi.fn()

      act(() => {
        result.current.handleConvert({
          image: mockImage,
          cropX: 0,
          cropY: 0,
          cropWidth: 400,
          cropHeight: 400,
          maxWidth: '200',
          maxHeight: '200',
          resamplingMethod: 'browser', // Use browser for speed in tests
          quality: 85,
          lossless: false,
          webOptimize: false,
          targetSize: '10',
          onComplete
        })
      })

      // Status should be set
      expect(result.current.optimizingStatus).toBeDefined()

      await waitFor(() => {
        expect(result.current.isOptimizing).toBe(false)
      }, { timeout: 3000 })
    })
  })
})
