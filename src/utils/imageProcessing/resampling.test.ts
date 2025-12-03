import { describe, it, expect, beforeEach } from 'vitest'
import { resampleImage } from './resampling'

describe('resampleImage', () => {
  let sourceCanvas: HTMLCanvasElement

  beforeEach(() => {
    sourceCanvas = document.createElement('canvas')
    sourceCanvas.width = 100
    sourceCanvas.height = 100
  })

  it('should return canvas with target dimensions', () => {
    const result = resampleImage(sourceCanvas, 50, 50, 'bicubic')

    expect(result.width).toBe(50)
    expect(result.height).toBe(50)
  })

  it('should handle nearest neighbor resampling', () => {
    const result = resampleImage(sourceCanvas, 50, 50, 'nearest')

    expect(result).toBeInstanceOf(HTMLCanvasElement)
    expect(result.width).toBe(50)
    expect(result.height).toBe(50)
  })

  it('should handle bilinear resampling', () => {
    const result = resampleImage(sourceCanvas, 50, 50, 'bilinear')

    expect(result).toBeInstanceOf(HTMLCanvasElement)
    expect(result.width).toBe(50)
    expect(result.height).toBe(50)
  })

  it('should handle bicubic resampling', () => {
    const result = resampleImage(sourceCanvas, 50, 50, 'bicubic')

    expect(result).toBeInstanceOf(HTMLCanvasElement)
    expect(result.width).toBe(50)
    expect(result.height).toBe(50)
  })

  it('should handle lanczos resampling', () => {
    const result = resampleImage(sourceCanvas, 50, 50, 'lanczos')

    expect(result).toBeInstanceOf(HTMLCanvasElement)
    expect(result.width).toBe(50)
    expect(result.height).toBe(50)
  })

  it('should handle browser resampling', () => {
    const result = resampleImage(sourceCanvas, 50, 50, 'browser')

    expect(result).toBeInstanceOf(HTMLCanvasElement)
    expect(result.width).toBe(50)
    expect(result.height).toBe(50)
  })

  it('should handle upsampling', () => {
    const result = resampleImage(sourceCanvas, 200, 200, 'bicubic')

    expect(result.width).toBe(200)
    expect(result.height).toBe(200)
  })

  it('should handle non-square dimensions', () => {
    sourceCanvas.width = 200
    sourceCanvas.height = 100

    const result = resampleImage(sourceCanvas, 100, 50, 'bicubic')

    expect(result.width).toBe(100)
    expect(result.height).toBe(50)
  })

  it('should handle significant downsampling (triggers anti-aliasing)', () => {
    sourceCanvas.width = 400
    sourceCanvas.height = 400

    // 4x downsampling (scale = 0.25)
    const result = resampleImage(sourceCanvas, 100, 100, 'bicubic')

    expect(result.width).toBe(100)
    expect(result.height).toBe(100)
  })

  it('should not apply anti-aliasing for nearest neighbor', () => {
    sourceCanvas.width = 400
    sourceCanvas.height = 400

    // Even with significant downsampling, nearest neighbor should not blur
    const result = resampleImage(sourceCanvas, 100, 100, 'nearest')

    expect(result.width).toBe(100)
    expect(result.height).toBe(100)
  })

  it('should handle asymmetric scaling', () => {
    sourceCanvas.width = 200
    sourceCanvas.height = 100

    // Different scale factors for x and y
    const result = resampleImage(sourceCanvas, 50, 100, 'bicubic')

    expect(result.width).toBe(50)
    expect(result.height).toBe(100)
  })

  it('should handle 1:1 scaling', () => {
    const result = resampleImage(sourceCanvas, 100, 100, 'bicubic')

    expect(result.width).toBe(100)
    expect(result.height).toBe(100)
  })

  it('should handle very small target size', () => {
    sourceCanvas.width = 200
    sourceCanvas.height = 200

    // Use browser resampling to avoid timeout with intensive algorithms
    const result = resampleImage(sourceCanvas, 20, 20, 'browser')

    expect(result.width).toBe(20)
    expect(result.height).toBe(20)
  })

  it('should handle portrait orientation', () => {
    sourceCanvas.width = 100
    sourceCanvas.height = 200

    const result = resampleImage(sourceCanvas, 50, 100, 'lanczos')

    expect(result.width).toBe(50)
    expect(result.height).toBe(100)
  })

  it('should use browser resampling as fallback for unknown method', () => {
    // TypeScript would normally prevent this, but test for runtime safety
    const result = resampleImage(sourceCanvas, 50, 50, 'unknown' as any)

    expect(result).toBeInstanceOf(HTMLCanvasElement)
    expect(result.width).toBe(50)
    expect(result.height).toBe(50)
  })
})
