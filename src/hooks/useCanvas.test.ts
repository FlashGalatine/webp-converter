import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCanvas } from './useCanvas'
import type { CropZone } from '../types'
import { DEFAULT_EXPORT_SETTINGS } from '../types'

function makeZone(overrides: Partial<CropZone> = {}): CropZone {
  return {
    id: 'zone-1',
    label: 'Test Zone',
    presetName: null,
    rect: { x: 0, y: 0, width: 100, height: 100 },
    aspectRatio: null,
    exportSettings: { ...DEFAULT_EXPORT_SETTINGS },
    ...overrides,
  }
}

const defaultOptions = {
  zones: [] as CropZone[],
  activeZoneId: null as string | null,
  onSelectZone: vi.fn(),
  onUpdateZoneRect: vi.fn(),
}

describe('useCanvas', () => {
  let mockImage: HTMLImageElement

  beforeEach(() => {
    mockImage = {
      width: 1920,
      height: 1080
    } as HTMLImageElement
    vi.clearAllMocks()
  })

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useCanvas(null, { ...defaultOptions }))

    expect(result.current.canvasWidth).toBe(1200)
    expect(result.current.canvasHeight).toBe(800)
    expect(result.current.zoomLevel).toBe(1)
    expect(result.current.panX).toBe(0)
    expect(result.current.panY).toBe(0)
    expect(result.current.cursorStyle).toBe('default')
    expect(result.current.isDragging).toBe(false)
  })

  it('should provide refs for canvas and container', () => {
    const { result } = renderHook(() => useCanvas(null, { ...defaultOptions }))

    expect(result.current.canvasRef).toBeDefined()
    expect(result.current.containerRef).toBeDefined()
  })

  it('should expose active zone crop coordinates', () => {
    const zone = makeZone({ rect: { x: 50, y: 100, width: 800, height: 600 } })
    const opts = { ...defaultOptions, zones: [zone], activeZoneId: zone.id }
    const { result } = renderHook(() => useCanvas(mockImage, opts))

    expect(result.current.cropX).toBe(50)
    expect(result.current.cropY).toBe(100)
    expect(result.current.cropWidth).toBe(800)
    expect(result.current.cropHeight).toBe(600)
  })

  it('should expose zero crop when no active zone', () => {
    const zone = makeZone()
    const opts = { ...defaultOptions, zones: [zone], activeZoneId: null }
    const { result } = renderHook(() => useCanvas(mockImage, opts))

    expect(result.current.cropX).toBe(0)
    expect(result.current.cropY).toBe(0)
    expect(result.current.cropWidth).toBe(0)
    expect(result.current.cropHeight).toBe(0)
  })

  describe('zoom controls', () => {
    it('should handle zoom in', () => {
      const { result } = renderHook(() => useCanvas(mockImage, { ...defaultOptions }))

      const initialZoom = result.current.zoomLevel

      act(() => {
        result.current.handleZoomIn()
      })

      expect(result.current.zoomLevel).toBeGreaterThan(initialZoom)
      expect(result.current.zoomLevel).toBeCloseTo(1.1, 2)
    })

    it('should handle zoom out', () => {
      const { result } = renderHook(() => useCanvas(mockImage, { ...defaultOptions }))

      const initialZoom = result.current.zoomLevel

      act(() => {
        result.current.handleZoomOut()
      })

      expect(result.current.zoomLevel).toBeLessThan(initialZoom)
      expect(result.current.zoomLevel).toBeCloseTo(0.9, 2)
    })

    it('should reset zoom and pan', () => {
      const { result } = renderHook(() => useCanvas(mockImage, { ...defaultOptions }))

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
      const { result } = renderHook(() => useCanvas(mockImage, { ...defaultOptions }))

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
      const { result } = renderHook(() => useCanvas(mockImage, { ...defaultOptions }))

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

  describe('mouse handlers', () => {
    it('should handle mouse up', () => {
      const { result } = renderHook(() => useCanvas(mockImage, { ...defaultOptions }))

      act(() => {
        result.current.handleMouseUp()
      })

      expect(result.current.isDragging).toBe(false)
    })

    it('should handle mouse leave', () => {
      const { result } = renderHook(() => useCanvas(mockImage, { ...defaultOptions }))

      act(() => {
        result.current.handleMouseLeave()
      })

      expect(result.current.cursorStyle).toBe('default')
    })
  })

  describe('zoom to fit', () => {
    it('should not crash when no image', () => {
      const { result } = renderHook(() => useCanvas(null, { ...defaultOptions }))

      act(() => {
        result.current.handleZoomToFit()
      })

      // Should not throw and zoom should remain at 1
      expect(result.current.zoomLevel).toBe(1)
    })

    it('should zoom to fit when image is provided', () => {
      const { result } = renderHook(() => useCanvas(mockImage, { ...defaultOptions }))

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
      const { result } = renderHook(() => useCanvas(null, { ...defaultOptions }))
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
      const { result } = renderHook(() => useCanvas(mockImage, { ...defaultOptions }))
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
      const { result } = renderHook(() => useCanvas(mockImage, { ...defaultOptions }))
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
      const { result } = renderHook(() => useCanvas(mockImage, { ...defaultOptions }))

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
      const { result } = renderHook(() => useCanvas(null, { ...defaultOptions }))

      const mouseEvent = {
        nativeEvent: { clientX: 100, clientY: 100 }
      } as React.MouseEvent<HTMLCanvasElement>

      act(() => {
        result.current.handleMouseDown(mouseEvent)
      })

      expect(result.current.isDragging).toBe(false)
    })

    it('should not process when no canvas ref', () => {
      const { result } = renderHook(() => useCanvas(mockImage, { ...defaultOptions }))

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
      const { result } = renderHook(() => useCanvas(null, { ...defaultOptions }))

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

  describe('canvas dimensions', () => {
    it('should have default canvas dimensions', () => {
      const { result } = renderHook(() => useCanvas(mockImage, { ...defaultOptions }))

      expect(result.current.canvasWidth).toBe(1200)
      expect(result.current.canvasHeight).toBe(800)
    })
  })

  describe('cursor style', () => {
    it('should start with default cursor', () => {
      const { result } = renderHook(() => useCanvas(mockImage, { ...defaultOptions }))

      expect(result.current.cursorStyle).toBe('default')
    })

    it('should reset cursor on mouse leave', () => {
      const { result } = renderHook(() => useCanvas(mockImage, { ...defaultOptions }))

      act(() => {
        result.current.handleMouseLeave()
      })

      expect(result.current.cursorStyle).toBe('default')
    })
  })

  describe('dragging state', () => {
    it('should start not dragging', () => {
      const { result } = renderHook(() => useCanvas(mockImage, { ...defaultOptions }))

      expect(result.current.isDragging).toBe(false)
    })

    it('should stop dragging on mouse up', () => {
      const { result } = renderHook(() => useCanvas(mockImage, { ...defaultOptions }))

      act(() => {
        result.current.handleMouseUp()
      })

      expect(result.current.isDragging).toBe(false)
    })
  })

  describe('document-level mouse events for dragging', () => {
    let mockCanvas: HTMLCanvasElement
    let mockContainer: HTMLDivElement

    const createMockContext = () => ({
      clearRect: vi.fn(),
      drawImage: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      setLineDash: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      closePath: vi.fn(),
      clip: vi.fn(),
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      globalAlpha: 1,
      globalCompositeOperation: 'source-over',
      font: '',
      textBaseline: 'top',
      measureText: vi.fn(() => ({ width: 50 })),
      fillText: vi.fn(),
      getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4), width: 1, height: 1 })),
    })

    beforeEach(() => {
      mockCanvas = document.createElement('canvas')
      mockCanvas.width = 1200
      mockCanvas.height = 800
      mockCanvas.getBoundingClientRect = () => ({
        left: 0, top: 0, right: 1200, bottom: 800,
        width: 1200, height: 800, x: 0, y: 0, toJSON: () => ({})
      })
      mockCanvas.getContext = vi.fn(() => createMockContext()) as unknown as typeof mockCanvas.getContext

      mockContainer = document.createElement('div')
      Object.defineProperty(mockContainer, 'getBoundingClientRect', {
        value: () => ({ width: 1200, height: 800 })
      })
    })

    it('should start pan drag when clicking empty area', () => {
      const onSelectZone = vi.fn()
      const zone = makeZone({ rect: { x: 0, y: 0, width: 100, height: 100 } })
      const opts = { ...defaultOptions, zones: [zone], activeZoneId: zone.id, onSelectZone }

      const { result } = renderHook(() => useCanvas(mockImage, opts))

      Object.defineProperty(result.current.canvasRef, 'current', {
        value: mockCanvas,
        writable: true
      })

      // Click outside all zones
      const mouseDownEvent = {
        nativeEvent: { clientX: 1100, clientY: 700 }
      } as React.MouseEvent<HTMLCanvasElement>

      act(() => {
        result.current.handleMouseDown(mouseDownEvent)
      })

      expect(result.current.isDragging).toBe(true)
      expect(result.current.cursorStyle).toBe('grabbing')
      expect(onSelectZone).toHaveBeenCalledWith(null) // deselect on pan

      act(() => {
        result.current.handleMouseUp()
      })

      expect(result.current.isDragging).toBe(false)
    })

    it('should handle document mouseup to stop dragging', () => {
      const zone = makeZone()
      const opts = { ...defaultOptions, zones: [zone], activeZoneId: zone.id }
      const { result } = renderHook(() => useCanvas(mockImage, opts))

      Object.defineProperty(result.current.canvasRef, 'current', {
        value: mockCanvas,
        writable: true
      })

      // Start a drag
      const mouseDownEvent = {
        nativeEvent: { clientX: 1100, clientY: 700 }
      } as React.MouseEvent<HTMLCanvasElement>

      act(() => {
        result.current.handleMouseDown(mouseDownEvent)
      })

      expect(result.current.isDragging).toBe(true)

      // Simulate document mouseup
      act(() => {
        document.dispatchEvent(new MouseEvent('mouseup'))
      })

      expect(result.current.isDragging).toBe(false)
    })

    it('should update cursor on hover when not dragging', () => {
      const zone = makeZone()
      const opts = { ...defaultOptions, zones: [zone], activeZoneId: zone.id }
      const { result } = renderHook(() => useCanvas(mockImage, opts))

      Object.defineProperty(result.current.canvasRef, 'current', {
        value: mockCanvas,
        writable: true
      })

      const mouseMoveEvent = {
        nativeEvent: { clientX: 600, clientY: 400 }
      } as React.MouseEvent<HTMLCanvasElement>

      act(() => {
        result.current.handleMouseMove(mouseMoveEvent)
      })

      // Cursor should be updated based on position
      expect(result.current.cursorStyle).toBeDefined()
    })
  })
})
