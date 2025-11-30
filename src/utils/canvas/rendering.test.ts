import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderCanvas, RenderParams } from './rendering'

describe('renderCanvas', () => {
  let canvas: HTMLCanvasElement
  let mockImage: HTMLImageElement
  let mockCtx: {
    fillStyle: string
    strokeStyle: string
    lineWidth: number
    fillRect: ReturnType<typeof vi.fn>
    strokeRect: ReturnType<typeof vi.fn>
    drawImage: ReturnType<typeof vi.fn>
    beginPath: ReturnType<typeof vi.fn>
    moveTo: ReturnType<typeof vi.fn>
    lineTo: ReturnType<typeof vi.fn>
    stroke: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    // Create mock context with spies
    mockCtx = {
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      drawImage: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn()
    }

    // Create canvas with mocked getContext
    canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 600
    vi.spyOn(canvas, 'getContext').mockReturnValue(mockCtx as unknown as CanvasRenderingContext2D)

    mockImage = {
      width: 1920,
      height: 1080
    } as HTMLImageElement
  })

  it('should clear canvas with dark background', () => {
    const params: RenderParams = {
      canvas,
      image: mockImage,
      zoomLevel: 1,
      panX: 0,
      panY: 0,
      cropX: 0,
      cropY: 0,
      cropWidth: 0,
      cropHeight: 0
    }

    renderCanvas(params)

    expect(mockCtx.fillStyle).toBe('#2b2b2b')
    expect(mockCtx.fillRect).toHaveBeenCalledWith(0, 0, 800, 600)
  })

  it('should draw image centered on canvas', () => {
    const params: RenderParams = {
      canvas,
      image: mockImage,
      zoomLevel: 1,
      panX: 0,
      panY: 0,
      cropX: 0,
      cropY: 0,
      cropWidth: 0,
      cropHeight: 0
    }

    renderCanvas(params)

    // Image should be drawn at centered position
    // imgX = (800 - 1920) / 2 = -560
    // imgY = (600 - 1080) / 2 = -240
    expect(mockCtx.drawImage).toHaveBeenCalledWith(mockImage, -560, -240, 1920, 1080)
  })

  it('should apply zoom level to image dimensions', () => {
    const params: RenderParams = {
      canvas,
      image: mockImage,
      zoomLevel: 0.5,
      panX: 0,
      panY: 0,
      cropX: 0,
      cropY: 0,
      cropWidth: 0,
      cropHeight: 0
    }

    renderCanvas(params)

    // Display dimensions at 0.5x zoom
    // displayWidth = 1920 * 0.5 = 960
    // displayHeight = 1080 * 0.5 = 540
    // imgX = (800 - 960) / 2 = -80
    // imgY = (600 - 540) / 2 = 30
    expect(mockCtx.drawImage).toHaveBeenCalledWith(mockImage, -80, 30, 960, 540)
  })

  it('should apply pan offset to image position', () => {
    const params: RenderParams = {
      canvas,
      image: mockImage,
      zoomLevel: 1,
      panX: 100,
      panY: 50,
      cropX: 0,
      cropY: 0,
      cropWidth: 0,
      cropHeight: 0
    }

    renderCanvas(params)

    // With pan offset
    // imgX = (800 - 1920) / 2 + 100 = -460
    // imgY = (600 - 1080) / 2 + 50 = -190
    expect(mockCtx.drawImage).toHaveBeenCalledWith(mockImage, -460, -190, 1920, 1080)
  })

  it('should not draw crop overlay when crop dimensions are zero', () => {
    const params: RenderParams = {
      canvas,
      image: mockImage,
      zoomLevel: 1,
      panX: 0,
      panY: 0,
      cropX: 0,
      cropY: 0,
      cropWidth: 0,
      cropHeight: 0
    }

    renderCanvas(params)

    // Only one fillRect call (background clear), no crop overlay
    expect(mockCtx.fillRect).toHaveBeenCalledTimes(1)
  })

  it('should draw crop overlay when crop dimensions are positive', () => {
    const params: RenderParams = {
      canvas,
      image: mockImage,
      zoomLevel: 1,
      panX: 0,
      panY: 0,
      cropX: 100,
      cropY: 100,
      cropWidth: 500,
      cropHeight: 400
    }

    renderCanvas(params)

    // Should draw: background + 4 overlay rectangles + 8 handles = 13 fillRect calls
    expect(mockCtx.fillRect).toHaveBeenCalledTimes(13)
  })

  it('should draw crop border with amber color', () => {
    const params: RenderParams = {
      canvas,
      image: mockImage,
      zoomLevel: 1,
      panX: 0,
      panY: 0,
      cropX: 100,
      cropY: 100,
      cropWidth: 500,
      cropHeight: 400
    }

    renderCanvas(params)

    // Crop border should be drawn
    expect(mockCtx.strokeRect).toHaveBeenCalled()
  })

  it('should draw rule of thirds grid lines', () => {
    const params: RenderParams = {
      canvas,
      image: mockImage,
      zoomLevel: 1,
      panX: 0,
      panY: 0,
      cropX: 0,
      cropY: 0,
      cropWidth: 900,
      cropHeight: 600
    }

    renderCanvas(params)

    // Should draw 4 grid lines (2 vertical + 2 horizontal)
    expect(mockCtx.beginPath).toHaveBeenCalled()
    expect(mockCtx.moveTo).toHaveBeenCalled()
    expect(mockCtx.lineTo).toHaveBeenCalled()
    expect(mockCtx.stroke).toHaveBeenCalled()
  })

  it('should draw 8 resize handles', () => {
    const params: RenderParams = {
      canvas,
      image: mockImage,
      zoomLevel: 1,
      panX: 0,
      panY: 0,
      cropX: 100,
      cropY: 100,
      cropWidth: 500,
      cropHeight: 400
    }

    renderCanvas(params)

    // 8 handles * 2 calls each (fillRect + strokeRect)
    // Plus background (1) + crop border (1) = 2
    // Total strokeRect calls: 1 (crop border) + 8 (handles) = 9
    expect(mockCtx.strokeRect).toHaveBeenCalledTimes(9)
  })

  it('should scale crop overlay with zoom level', () => {
    const params: RenderParams = {
      canvas,
      image: mockImage,
      zoomLevel: 2,
      panX: 0,
      panY: 0,
      cropX: 100,
      cropY: 100,
      cropWidth: 200,
      cropHeight: 200
    }

    renderCanvas(params)

    // Crop should be drawn at scaled dimensions
    // At 2x zoom, crop display dimensions = 400x400
    expect(mockCtx.strokeRect).toHaveBeenCalled()
  })

  it('should handle small crop area', () => {
    const params: RenderParams = {
      canvas,
      image: mockImage,
      zoomLevel: 1,
      panX: 0,
      panY: 0,
      cropX: 0,
      cropY: 0,
      cropWidth: 50,
      cropHeight: 50
    }

    renderCanvas(params)

    // Should still draw overlay and handles for small crop
    expect(mockCtx.strokeRect).toHaveBeenCalled()
  })

  it('should handle large zoom level', () => {
    const params: RenderParams = {
      canvas,
      image: mockImage,
      zoomLevel: 5,
      panX: 0,
      panY: 0,
      cropX: 0,
      cropY: 0,
      cropWidth: 1920,
      cropHeight: 1080
    }

    renderCanvas(params)

    // At 5x zoom
    // displayWidth = 1920 * 5 = 9600
    // displayHeight = 1080 * 5 = 5400
    expect(mockCtx.drawImage).toHaveBeenCalledWith(mockImage, -4400, -2400, 9600, 5400)
  })

  it('should handle small zoom level', () => {
    const params: RenderParams = {
      canvas,
      image: mockImage,
      zoomLevel: 0.1,
      panX: 0,
      panY: 0,
      cropX: 0,
      cropY: 0,
      cropWidth: 1920,
      cropHeight: 1080
    }

    renderCanvas(params)

    // At 0.1x zoom
    // displayWidth = 1920 * 0.1 = 192
    // displayHeight = 1080 * 0.1 = 108
    expect(mockCtx.drawImage).toHaveBeenCalledWith(mockImage, 304, 246, 192, 108)
  })

  it('should handle negative pan values', () => {
    const params: RenderParams = {
      canvas,
      image: mockImage,
      zoomLevel: 1,
      panX: -200,
      panY: -100,
      cropX: 0,
      cropY: 0,
      cropWidth: 0,
      cropHeight: 0
    }

    renderCanvas(params)

    // imgX = (800 - 1920) / 2 + (-200) = -760
    // imgY = (600 - 1080) / 2 + (-100) = -340
    expect(mockCtx.drawImage).toHaveBeenCalledWith(mockImage, -760, -340, 1920, 1080)
  })

  it('should handle crop area at image edges', () => {
    const params: RenderParams = {
      canvas,
      image: mockImage,
      zoomLevel: 1,
      panX: 0,
      panY: 0,
      cropX: 0,
      cropY: 0,
      cropWidth: 1920,
      cropHeight: 1080
    }

    renderCanvas(params)

    // Full image crop should still draw overlay and handles
    expect(mockCtx.strokeRect).toHaveBeenCalled()
  })

  it('should draw darkened overlay outside crop area', () => {
    const params: RenderParams = {
      canvas,
      image: mockImage,
      zoomLevel: 1,
      panX: 0,
      panY: 0,
      cropX: 200,
      cropY: 200,
      cropWidth: 400,
      cropHeight: 300
    }

    renderCanvas(params)

    // Should have 13 fillRect calls: 1 background + 4 overlay regions + 8 handles
    expect(mockCtx.fillRect).toHaveBeenCalledTimes(13)
  })

  it('should handle square image', () => {
    const squareImage = {
      width: 1000,
      height: 1000
    } as HTMLImageElement

    const params: RenderParams = {
      canvas,
      image: squareImage,
      zoomLevel: 1,
      panX: 0,
      panY: 0,
      cropX: 0,
      cropY: 0,
      cropWidth: 1000,
      cropHeight: 1000
    }

    renderCanvas(params)

    // imgX = (800 - 1000) / 2 = -100
    // imgY = (600 - 1000) / 2 = -200
    expect(mockCtx.drawImage).toHaveBeenCalledWith(squareImage, -100, -200, 1000, 1000)
  })

  it('should handle portrait image', () => {
    const portraitImage = {
      width: 1080,
      height: 1920
    } as HTMLImageElement

    const params: RenderParams = {
      canvas,
      image: portraitImage,
      zoomLevel: 1,
      panX: 0,
      panY: 0,
      cropX: 0,
      cropY: 0,
      cropWidth: 1080,
      cropHeight: 1920
    }

    renderCanvas(params)

    // imgX = (800 - 1080) / 2 = -140
    // imgY = (600 - 1920) / 2 = -660
    expect(mockCtx.drawImage).toHaveBeenCalledWith(portraitImage, -140, -660, 1080, 1920)
  })

  it('should combine zoom and pan correctly', () => {
    const params: RenderParams = {
      canvas,
      image: mockImage,
      zoomLevel: 2,
      panX: 50,
      panY: -30,
      cropX: 0,
      cropY: 0,
      cropWidth: 0,
      cropHeight: 0
    }

    renderCanvas(params)

    // At 2x zoom with pan
    // displayWidth = 1920 * 2 = 3840
    // displayHeight = 1080 * 2 = 2160
    // imgX = (800 - 3840) / 2 + 50 = -1470
    // imgY = (600 - 2160) / 2 + (-30) = -810
    expect(mockCtx.drawImage).toHaveBeenCalledWith(mockImage, -1470, -810, 3840, 2160)
  })
})
