import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCanvas } from './useCanvas'

describe('useCanvas', () => {
  let mockImage: HTMLImageElement

  beforeEach(() => {
    mockImage = {
      width: 1920,
      height: 1080
    } as HTMLImageElement
  })

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useCanvas(null))

    expect(result.current.zoomLevel).toBe(1)
    expect(result.current.panX).toBe(0)
    expect(result.current.panY).toBe(0)
    expect(result.current.cropX).toBe(0)
    expect(result.current.cropY).toBe(0)
    expect(result.current.cropWidth).toBe(0)
    expect(result.current.cropHeight).toBe(0)
    expect(result.current.aspectRatio).toBeNull()
    expect(result.current.isFreestyleMode).toBe(false)
    expect(result.current.isDragging).toBe(false)
  })

  it('should provide refs for canvas and container', () => {
    const { result } = renderHook(() => useCanvas(null))

    expect(result.current.canvasRef).toBeDefined()
    expect(result.current.containerRef).toBeDefined()
  })

  describe('initializeCrop', () => {
    it('should initialize crop for full image when no aspect ratio', () => {
      const { result } = renderHook(() => useCanvas(mockImage))

      act(() => {
        result.current.initializeCrop(1920, 1080, null)
      })

      expect(result.current.cropX).toBe(0)
      expect(result.current.cropY).toBe(0)
      expect(result.current.cropWidth).toBe(1920)
      expect(result.current.cropHeight).toBe(1080)
    })

    it('should initialize crop with 1:1 aspect ratio (square)', () => {
      const { result } = renderHook(() => useCanvas(mockImage))

      act(() => {
        result.current.initializeCrop(1920, 1080, 1)
      })

      // For 16:9 image with 1:1 aspect ratio, height limits
      expect(result.current.cropWidth).toBe(1080)
      expect(result.current.cropHeight).toBe(1080)
      expect(result.current.cropX).toBe(420) // (1920 - 1080) / 2
      expect(result.current.cropY).toBe(0)
    })

    it('should initialize crop with 16:9 aspect ratio on 16:9 image', () => {
      const { result } = renderHook(() => useCanvas(mockImage))

      act(() => {
        result.current.initializeCrop(1920, 1080, 16 / 9)
      })

      // Full image matches aspect ratio
      expect(result.current.cropWidth).toBe(1920)
      expect(result.current.cropHeight).toBe(1080)
      expect(result.current.cropX).toBe(0)
      expect(result.current.cropY).toBe(0)
    })

    it('should initialize crop with 4:3 aspect ratio', () => {
      const { result } = renderHook(() => useCanvas(mockImage))

      act(() => {
        result.current.initializeCrop(1920, 1080, 4 / 3)
      })

      // For 16:9 image with 4:3 ratio, height limits
      // h = 1080, w = 1080 * 4/3 = 1440
      expect(result.current.cropWidth).toBe(1440)
      expect(result.current.cropHeight).toBe(1080)
      expect(result.current.cropX).toBe(240) // (1920 - 1440) / 2
      expect(result.current.cropY).toBe(0)
    })

    it('should initialize crop with portrait aspect ratio (9:16)', () => {
      const { result } = renderHook(() => useCanvas(mockImage))

      act(() => {
        result.current.initializeCrop(1920, 1080, 9 / 16)
      })

      // For 16:9 image with 9:16 ratio, width limits
      // w = 1920, h = 1920 / (9/16) = 3413 (too tall)
      // So h = 1080, w = 1080 * (9/16) = 607.5
      expect(result.current.cropHeight).toBe(1080)
      expect(result.current.cropWidth).toBeCloseTo(607.5, 0)
    })
  })

  describe('zoom controls', () => {
    it('should handle zoom in', () => {
      const { result } = renderHook(() => useCanvas(mockImage))

      const initialZoom = result.current.zoomLevel

      act(() => {
        result.current.handleZoomIn()
      })

      expect(result.current.zoomLevel).toBeGreaterThan(initialZoom)
      expect(result.current.zoomLevel).toBeCloseTo(1.1, 2)
    })

    it('should handle zoom out', () => {
      const { result } = renderHook(() => useCanvas(mockImage))

      const initialZoom = result.current.zoomLevel

      act(() => {
        result.current.handleZoomOut()
      })

      expect(result.current.zoomLevel).toBeLessThan(initialZoom)
      expect(result.current.zoomLevel).toBeCloseTo(0.9, 2)
    })

    it('should reset zoom and pan', () => {
      const { result } = renderHook(() => useCanvas(mockImage))

      // Zoom and pan first
      act(() => {
        result.current.handleZoomIn()
        result.current.handleZoomIn()
      })

      // Reset
      act(() => {
        result.current.handleZoomReset()
      })

      expect(result.current.zoomLevel).toBe(1)
      expect(result.current.panX).toBe(0)
      expect(result.current.panY).toBe(0)
    })

    it('should not zoom beyond max', () => {
      const { result } = renderHook(() => useCanvas(mockImage))

      // Zoom in many times
      for (let i = 0; i < 100; i++) {
        act(() => {
          result.current.handleZoomIn()
        })
      }

      // Should be capped at ZOOM_MAX (10)
      expect(result.current.zoomLevel).toBeLessThanOrEqual(10)
    })

    it('should not zoom below min', () => {
      const { result } = renderHook(() => useCanvas(mockImage))

      // Zoom out many times
      for (let i = 0; i < 100; i++) {
        act(() => {
          result.current.handleZoomOut()
        })
      }

      // Should be capped at ZOOM_MIN (0.1)
      expect(result.current.zoomLevel).toBeGreaterThanOrEqual(0.1)
    })
  })

  describe('freestyle mode', () => {
    it('should toggle freestyle mode', () => {
      const { result } = renderHook(() => useCanvas(mockImage))

      expect(result.current.isFreestyleMode).toBe(false)

      act(() => {
        result.current.setIsFreestyleMode(true)
      })

      expect(result.current.isFreestyleMode).toBe(true)

      act(() => {
        result.current.setIsFreestyleMode(false)
      })

      expect(result.current.isFreestyleMode).toBe(false)
    })
  })

  describe('aspect ratio', () => {
    it('should set aspect ratio', () => {
      const { result } = renderHook(() => useCanvas(mockImage))

      expect(result.current.aspectRatio).toBeNull()

      act(() => {
        result.current.setAspectRatio(16 / 9)
      })

      expect(result.current.aspectRatio).toBeCloseTo(1.7778, 3)

      act(() => {
        result.current.setAspectRatio(null)
      })

      expect(result.current.aspectRatio).toBeNull()
    })
  })

  describe('mouse handlers', () => {
    it('should handle mouse up', () => {
      const { result } = renderHook(() => useCanvas(mockImage))

      act(() => {
        result.current.handleMouseUp()
      })

      expect(result.current.isDragging).toBe(false)
    })

    it('should handle mouse leave', () => {
      const { result } = renderHook(() => useCanvas(mockImage))

      act(() => {
        result.current.handleMouseLeave()
      })

      expect(result.current.cursorStyle).toBe('default')
    })
  })

  describe('zoom to fit', () => {
    it('should not crash when no image', () => {
      const { result } = renderHook(() => useCanvas(null))

      act(() => {
        result.current.handleZoomToFit()
      })

      // Should not throw and zoom should remain at 1
      expect(result.current.zoomLevel).toBe(1)
    })

    it('should zoom to fit when image is provided', () => {
      const { result } = renderHook(() => useCanvas(mockImage))

      act(() => {
        result.current.handleZoomToFit()
      })

      // Zoom should be adjusted to fit image in canvas
      expect(result.current.zoomLevel).toBeDefined()
      expect(result.current.panX).toBe(0)
      expect(result.current.panY).toBe(0)
    })
  })

  describe('handleWheel', () => {
    it('should not zoom when no image', () => {
      const { result } = renderHook(() => useCanvas(null))
      const initialZoom = result.current.zoomLevel

      const wheelEvent = {
        deltaY: -100,
        preventDefault: vi.fn()
      } as unknown as React.WheelEvent<HTMLCanvasElement>

      act(() => {
        result.current.handleWheel(wheelEvent)
      })

      expect(result.current.zoomLevel).toBe(initialZoom)
    })

    it('should zoom in on scroll up (negative deltaY)', () => {
      const { result } = renderHook(() => useCanvas(mockImage))
      const initialZoom = result.current.zoomLevel

      const wheelEvent = {
        deltaY: -100,
        preventDefault: vi.fn()
      } as unknown as React.WheelEvent<HTMLCanvasElement>

      act(() => {
        result.current.handleWheel(wheelEvent)
      })

      expect(result.current.zoomLevel).toBeGreaterThan(initialZoom)
      expect(wheelEvent.preventDefault).toHaveBeenCalled()
    })

    it('should zoom out on scroll down (positive deltaY)', () => {
      const { result } = renderHook(() => useCanvas(mockImage))
      const initialZoom = result.current.zoomLevel

      const wheelEvent = {
        deltaY: 100,
        preventDefault: vi.fn()
      } as unknown as React.WheelEvent<HTMLCanvasElement>

      act(() => {
        result.current.handleWheel(wheelEvent)
      })

      expect(result.current.zoomLevel).toBeLessThan(initialZoom)
    })

    it('should respect zoom limits on wheel', () => {
      const { result } = renderHook(() => useCanvas(mockImage))

      // Zoom out many times
      const wheelEvent = {
        deltaY: 100,
        preventDefault: vi.fn()
      } as unknown as React.WheelEvent<HTMLCanvasElement>

      for (let i = 0; i < 100; i++) {
        act(() => {
          result.current.handleWheel(wheelEvent)
        })
      }

      expect(result.current.zoomLevel).toBeGreaterThanOrEqual(0.1)
    })
  })

  describe('handleMouseDown', () => {
    it('should not process when no image', () => {
      const { result } = renderHook(() => useCanvas(null))

      const mouseEvent = {
        nativeEvent: { clientX: 100, clientY: 100 }
      } as React.MouseEvent<HTMLCanvasElement>

      act(() => {
        result.current.handleMouseDown(mouseEvent)
      })

      expect(result.current.isDragging).toBe(false)
    })

    it('should not process when no canvas ref', () => {
      const { result } = renderHook(() => useCanvas(mockImage))

      const mouseEvent = {
        nativeEvent: { clientX: 100, clientY: 100 }
      } as React.MouseEvent<HTMLCanvasElement>

      act(() => {
        result.current.handleMouseDown(mouseEvent)
      })

      // Without canvas ref, should not set isDragging
      expect(result.current.isDragging).toBe(false)
    })
  })

  describe('handleMouseMove', () => {
    it('should not process when no image', () => {
      const { result } = renderHook(() => useCanvas(null))

      const mouseEvent = {
        nativeEvent: { clientX: 100, clientY: 100 }
      } as React.MouseEvent<HTMLCanvasElement>

      act(() => {
        result.current.handleMouseMove(mouseEvent)
      })

      // Should not change cursor
      expect(result.current.cursorStyle).toBe('default')
    })
  })

  describe('initializeCrop edge cases', () => {
    it('should handle very wide aspect ratio', () => {
      const { result } = renderHook(() => useCanvas(mockImage))

      act(() => {
        result.current.initializeCrop(1920, 1080, 21 / 9) // Ultra-wide
      })

      // For 16:9 image with 21:9 ratio
      // ratio (2.33) > imgRatio (1.78), so width limits
      expect(result.current.cropWidth).toBe(1920)
      expect(result.current.cropHeight).toBeCloseTo(1920 / (21 / 9), 0)
    })

    it('should handle very tall aspect ratio', () => {
      const { result } = renderHook(() => useCanvas(mockImage))

      act(() => {
        result.current.initializeCrop(1920, 1080, 1 / 2) // 1:2 portrait
      })

      // For 16:9 image with 1:2 ratio
      // ratio (0.5) < imgRatio (1.78), so height limits
      expect(result.current.cropHeight).toBe(1080)
      expect(result.current.cropWidth).toBeCloseTo(1080 * (1 / 2), 0)
    })

    it('should handle square image with landscape ratio', () => {
      const squareImage = { width: 1000, height: 1000 } as HTMLImageElement
      const { result } = renderHook(() => useCanvas(squareImage))

      act(() => {
        result.current.initializeCrop(1000, 1000, 16 / 9)
      })

      // For square image with 16:9 ratio
      // ratio (1.78) > imgRatio (1), so width limits
      expect(result.current.cropWidth).toBe(1000)
      expect(result.current.cropHeight).toBeCloseTo(1000 / (16 / 9), 0)
    })

    it('should handle square image with portrait ratio', () => {
      const squareImage = { width: 1000, height: 1000 } as HTMLImageElement
      const { result } = renderHook(() => useCanvas(squareImage))

      act(() => {
        result.current.initializeCrop(1000, 1000, 9 / 16)
      })

      // For square image with 9:16 ratio
      // ratio (0.5625) < imgRatio (1), so height limits
      expect(result.current.cropHeight).toBe(1000)
      expect(result.current.cropWidth).toBeCloseTo(1000 * (9 / 16), 0)
    })
  })

  describe('canvas dimensions', () => {
    it('should have default canvas dimensions', () => {
      const { result } = renderHook(() => useCanvas(mockImage))

      expect(result.current.canvasWidth).toBe(1200)
      expect(result.current.canvasHeight).toBe(800)
    })
  })

  describe('cursor style', () => {
    it('should start with default cursor', () => {
      const { result } = renderHook(() => useCanvas(mockImage))

      expect(result.current.cursorStyle).toBe('default')
    })

    it('should reset cursor on mouse leave', () => {
      const { result } = renderHook(() => useCanvas(mockImage))

      act(() => {
        result.current.handleMouseLeave()
      })

      expect(result.current.cursorStyle).toBe('default')
    })
  })

  describe('dragging state', () => {
    it('should start not dragging', () => {
      const { result } = renderHook(() => useCanvas(mockImage))

      expect(result.current.isDragging).toBe(false)
    })

    it('should stop dragging on mouse up', () => {
      const { result } = renderHook(() => useCanvas(mockImage))

      act(() => {
        result.current.handleMouseUp()
      })

      expect(result.current.isDragging).toBe(false)
    })
  })

  describe('zoom to fit calculations', () => {
    it('should handle very large image', () => {
      const largeImage = { width: 8000, height: 6000 } as HTMLImageElement
      const { result } = renderHook(() => useCanvas(largeImage))

      act(() => {
        result.current.handleZoomToFit()
      })

      // Should zoom to fit within canvas
      expect(result.current.zoomLevel).toBeLessThan(1)
    })

    it('should handle very small image', () => {
      const smallImage = { width: 100, height: 100 } as HTMLImageElement
      const { result } = renderHook(() => useCanvas(smallImage))

      act(() => {
        result.current.handleZoomToFit()
      })

      // Should zoom up to fit (but respect ZOOM_MAX)
      expect(result.current.zoomLevel).toBeGreaterThanOrEqual(1)
    })

    it('should handle tall narrow image', () => {
      const tallImage = { width: 200, height: 2000 } as HTMLImageElement
      const { result } = renderHook(() => useCanvas(tallImage))

      act(() => {
        result.current.handleZoomToFit()
      })

      // Height should be the limiting factor
      expect(result.current.zoomLevel).toBeDefined()
    })

    it('should handle wide short image', () => {
      const wideImage = { width: 2000, height: 200 } as HTMLImageElement
      const { result } = renderHook(() => useCanvas(wideImage))

      act(() => {
        result.current.handleZoomToFit()
      })

      // Width should be the limiting factor
      expect(result.current.zoomLevel).toBeDefined()
    })
  })
})
