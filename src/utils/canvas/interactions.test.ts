import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getCursorPos, canvasToImage, detectHandle, isInsideCrop, getCursorStyle } from './interactions'

describe('getCursorPos', () => {
  it('should calculate correct cursor position relative to canvas', () => {
    const mockCanvas = {
      getBoundingClientRect: () => ({ left: 100, top: 50, right: 900, bottom: 650, width: 800, height: 600, x: 100, y: 50, toJSON: () => ({}) })
    } as HTMLCanvasElement

    const mockEvent = { clientX: 150, clientY: 100 } as MouseEvent

    const result = getCursorPos(mockEvent, mockCanvas)

    expect(result.x).toBe(50)
    expect(result.y).toBe(50)
  })

  it('should handle canvas at origin', () => {
    const mockCanvas = {
      getBoundingClientRect: () => ({ left: 0, top: 0, right: 800, bottom: 600, width: 800, height: 600, x: 0, y: 0, toJSON: () => ({}) })
    } as HTMLCanvasElement

    const mockEvent = { clientX: 400, clientY: 300 } as MouseEvent

    const result = getCursorPos(mockEvent, mockCanvas)

    expect(result.x).toBe(400)
    expect(result.y).toBe(300)
  })

  it('should handle negative positions (scrolled)', () => {
    const mockCanvas = {
      getBoundingClientRect: () => ({ left: -50, top: -25, right: 750, bottom: 575, width: 800, height: 600, x: -50, y: -25, toJSON: () => ({}) })
    } as HTMLCanvasElement

    const mockEvent = { clientX: 50, clientY: 75 } as MouseEvent

    const result = getCursorPos(mockEvent, mockCanvas)

    expect(result.x).toBe(100)
    expect(result.y).toBe(100)
  })
})

describe('canvasToImage', () => {
  it('should convert canvas coordinates to image coordinates at zoom 1', () => {
    const mockCanvas = { width: 800, height: 600 } as HTMLCanvasElement
    const mockImage = { width: 800, height: 600 } as HTMLImageElement

    // At zoom 1, image fills canvas exactly (assuming same size)
    // imgX = (800 - 800) / 2 + 0 = 0
    // imgY = (600 - 600) / 2 + 0 = 0
    const result = canvasToImage(400, 300, mockImage, 1, 0, 0, mockCanvas)

    expect(result.x).toBe(400)
    expect(result.y).toBe(300)
  })

  it('should convert canvas coordinates with zoom', () => {
    const mockCanvas = { width: 800, height: 600 } as HTMLCanvasElement
    const mockImage = { width: 400, height: 300 } as HTMLImageElement

    // At zoom 2: displayWidth = 800, displayHeight = 600
    // imgX = (800 - 800) / 2 + 0 = 0
    // imgY = (600 - 600) / 2 + 0 = 0
    // Result x = (400 - 0) / 2 = 200
    // Result y = (300 - 0) / 2 = 150
    const result = canvasToImage(400, 300, mockImage, 2, 0, 0, mockCanvas)

    expect(result.x).toBe(200)
    expect(result.y).toBe(150)
  })

  it('should convert canvas coordinates with pan offset', () => {
    const mockCanvas = { width: 800, height: 600 } as HTMLCanvasElement
    const mockImage = { width: 800, height: 600 } as HTMLImageElement

    // At zoom 1 with pan (100, 50)
    // imgX = (800 - 800) / 2 + 100 = 100
    // imgY = (600 - 600) / 2 + 50 = 50
    // Result x = (400 - 100) / 1 = 300
    // Result y = (300 - 50) / 1 = 250
    const result = canvasToImage(400, 300, mockImage, 1, 100, 50, mockCanvas)

    expect(result.x).toBe(300)
    expect(result.y).toBe(250)
  })

  it('should handle small image centered in large canvas', () => {
    const mockCanvas = { width: 800, height: 600 } as HTMLCanvasElement
    const mockImage = { width: 400, height: 300 } as HTMLImageElement

    // At zoom 1: displayWidth = 400, displayHeight = 300
    // imgX = (800 - 400) / 2 + 0 = 200
    // imgY = (600 - 300) / 2 + 0 = 150
    // For click at canvas center (400, 300):
    // Result x = (400 - 200) / 1 = 200
    // Result y = (300 - 150) / 1 = 150
    const result = canvasToImage(400, 300, mockImage, 1, 0, 0, mockCanvas)

    expect(result.x).toBe(200)
    expect(result.y).toBe(150)
  })
})

describe('detectHandle', () => {
  const mockCanvas = { width: 800, height: 600 } as HTMLCanvasElement

  it('should return null when image is null', () => {
    const result = detectHandle(100, 100, null, 100, 100, 0, 0, 1, 0, 0, mockCanvas)
    expect(result).toBeNull()
  })

  it('should return null when crop width is zero', () => {
    const mockImage = { width: 400, height: 300 } as HTMLImageElement
    const result = detectHandle(100, 100, mockImage, 0, 100, 0, 0, 1, 0, 0, mockCanvas)
    expect(result).toBeNull()
  })

  it('should return null when crop height is zero', () => {
    const mockImage = { width: 400, height: 300 } as HTMLImageElement
    const result = detectHandle(100, 100, mockImage, 100, 0, 0, 0, 1, 0, 0, mockCanvas)
    expect(result).toBeNull()
  })

  it('should return null when crop dimensions are negative', () => {
    const mockImage = { width: 400, height: 300 } as HTMLImageElement
    const result = detectHandle(100, 100, mockImage, -100, -100, 0, 0, 1, 0, 0, mockCanvas)
    expect(result).toBeNull()
  })

  it('should detect NW handle at top-left corner of crop', () => {
    const mockImage = { width: 400, height: 300 } as HTMLImageElement
    // Image centered: imgX = (800-400)/2 = 200, imgY = (600-300)/2 = 150
    // Crop at (0,0) with size 100x100
    // cropDisplayX = 200 + 0 = 200, cropDisplayY = 150 + 0 = 150
    const result = detectHandle(200, 150, mockImage, 100, 100, 0, 0, 1, 0, 0, mockCanvas)
    expect(result).toBe('nw')
  })

  it('should detect SE handle at bottom-right corner of crop', () => {
    const mockImage = { width: 400, height: 300 } as HTMLImageElement
    // cropDisplayX + cropDisplayWidth = 200 + 100 = 300
    // cropDisplayY + cropDisplayHeight = 150 + 100 = 250
    const result = detectHandle(300, 250, mockImage, 100, 100, 0, 0, 1, 0, 0, mockCanvas)
    expect(result).toBe('se')
  })

  it('should detect N handle at top-center of crop', () => {
    const mockImage = { width: 400, height: 300 } as HTMLImageElement
    // Top center: X = 200 + 50 = 250, Y = 150
    const result = detectHandle(250, 150, mockImage, 100, 100, 0, 0, 1, 0, 0, mockCanvas)
    expect(result).toBe('n')
  })

  it('should detect E handle at right-center of crop', () => {
    const mockImage = { width: 400, height: 300 } as HTMLImageElement
    // Right center: X = 300, Y = 150 + 50 = 200
    const result = detectHandle(300, 200, mockImage, 100, 100, 0, 0, 1, 0, 0, mockCanvas)
    expect(result).toBe('e')
  })

  it('should return null when not near any handle', () => {
    const mockImage = { width: 400, height: 300 } as HTMLImageElement
    // Click at center of crop area (not near any handle)
    const result = detectHandle(250, 200, mockImage, 100, 100, 0, 0, 1, 0, 0, mockCanvas)
    expect(result).toBeNull()
  })
})

describe('isInsideCrop', () => {
  const mockCanvas = { width: 800, height: 600 } as HTMLCanvasElement

  it('should return false when image is null', () => {
    const result = isInsideCrop(100, 100, null, 100, 100, 0, 0, 1, 0, 0, mockCanvas)
    expect(result).toBe(false)
  })

  it('should return true when cursor is inside crop area', () => {
    const mockImage = { width: 400, height: 300 } as HTMLImageElement
    // Image centered: imgX = 200, imgY = 150
    // Crop at (0,0) with size 100x100
    // Crop display: 200-300 x 150-250
    // Click at 250, 200 is inside
    const result = isInsideCrop(250, 200, mockImage, 100, 100, 0, 0, 1, 0, 0, mockCanvas)
    expect(result).toBe(true)
  })

  it('should return false when cursor is outside crop area', () => {
    const mockImage = { width: 400, height: 300 } as HTMLImageElement
    // Click at 100, 100 is outside the crop display area
    const result = isInsideCrop(100, 100, mockImage, 100, 100, 0, 0, 1, 0, 0, mockCanvas)
    expect(result).toBe(false)
  })

  it('should return true when cursor is at crop edge', () => {
    const mockImage = { width: 400, height: 300 } as HTMLImageElement
    // Click at left edge of crop (200, 200)
    const result = isInsideCrop(200, 200, mockImage, 100, 100, 0, 0, 1, 0, 0, mockCanvas)
    expect(result).toBe(true)
  })

  it('should handle crop with offset', () => {
    const mockImage = { width: 400, height: 300 } as HTMLImageElement
    // Crop at (50, 50) with size 100x100
    // Crop display: 250-350 x 200-300
    const result = isInsideCrop(300, 250, mockImage, 100, 100, 50, 50, 1, 0, 0, mockCanvas)
    expect(result).toBe(true)
  })

  it('should handle zoom level', () => {
    const mockImage = { width: 400, height: 300 } as HTMLImageElement
    // At zoom 2: displayWidth = 800, displayHeight = 600
    // imgX = 0, imgY = 0
    // Crop at (0,0) with size 100x100 at zoom 2 = display 0-200 x 0-200
    const result = isInsideCrop(100, 100, mockImage, 100, 100, 0, 0, 2, 0, 0, mockCanvas)
    expect(result).toBe(true)
  })
})

describe('getCursorStyle', () => {
  it('should return resize cursor when dragging with NW handle', () => {
    expect(getCursorStyle('nw', false, true)).toBe('nwse-resize')
  })

  it('should return resize cursor when dragging with SE handle', () => {
    expect(getCursorStyle('se', false, true)).toBe('nwse-resize')
  })

  it('should return resize cursor when dragging with NE handle', () => {
    expect(getCursorStyle('ne', false, true)).toBe('nesw-resize')
  })

  it('should return resize cursor when dragging with N handle', () => {
    expect(getCursorStyle('n', false, true)).toBe('ns-resize')
  })

  it('should return resize cursor when dragging with E handle', () => {
    expect(getCursorStyle('e', false, true)).toBe('ew-resize')
  })

  it('should return grabbing when dragging without handle', () => {
    expect(getCursorStyle(null, false, true)).toBe('grabbing')
  })

  it('should return resize cursor when hovering over NW handle (not dragging)', () => {
    expect(getCursorStyle('nw', false, false)).toBe('nwse-resize')
  })

  it('should return resize cursor when hovering over E handle (not dragging)', () => {
    expect(getCursorStyle('e', false, false)).toBe('ew-resize')
  })

  it('should return move when hovering inside crop area', () => {
    expect(getCursorStyle(null, true, false)).toBe('move')
  })

  it('should return grab when not over handle or crop', () => {
    expect(getCursorStyle(null, false, false)).toBe('grab')
  })

  it('should prioritize handle cursor over inside crop', () => {
    // When on a handle AND inside crop, should show handle cursor
    expect(getCursorStyle('nw', true, false)).toBe('nwse-resize')
  })

  it('should prioritize dragging state', () => {
    expect(getCursorStyle('nw', true, true)).toBe('nwse-resize')
  })
})
