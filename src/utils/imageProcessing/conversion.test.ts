import { describe, it, expect, beforeEach } from 'vitest'
import { prepareImageForConversion, getOptimizationStatus } from './conversion'

describe('prepareImageForConversion', () => {
  let mockImage: HTMLImageElement

  beforeEach(() => {
    mockImage = {
      width: 1920,
      height: 1080
    } as HTMLImageElement
  })

  it('should crop without resizing when no max dimensions', () => {
    const result = prepareImageForConversion({
      image: mockImage,
      cropX: 0,
      cropY: 0,
      cropWidth: 1920,
      cropHeight: 1080,
      maxWidth: '',
      maxHeight: '',
      resamplingMethod: 'browser'
    })

    expect(result.finalWidth).toBe(1920)
    expect(result.finalHeight).toBe(1080)
    expect(result.needsResampling).toBe(false)
  })

  it('should scale down when maxWidth is exceeded', () => {
    const result = prepareImageForConversion({
      image: mockImage,
      cropX: 0,
      cropY: 0,
      cropWidth: 1920,
      cropHeight: 1080,
      maxWidth: '960',
      maxHeight: '',
      resamplingMethod: 'browser'
    })

    expect(result.finalWidth).toBe(960)
    expect(result.finalHeight).toBe(540)
    expect(result.needsResampling).toBe(true)
  })

  it('should scale down when maxHeight is exceeded', () => {
    const result = prepareImageForConversion({
      image: mockImage,
      cropX: 0,
      cropY: 0,
      cropWidth: 1920,
      cropHeight: 1080,
      maxWidth: '',
      maxHeight: '540',
      resamplingMethod: 'browser'
    })

    expect(result.finalWidth).toBe(960)
    expect(result.finalHeight).toBe(540)
    expect(result.needsResampling).toBe(true)
  })

  it('should apply both maxWidth and maxHeight constraints', () => {
    const result = prepareImageForConversion({
      image: mockImage,
      cropX: 0,
      cropY: 0,
      cropWidth: 1920,
      cropHeight: 1080,
      maxWidth: '800',
      maxHeight: '400',
      resamplingMethod: 'browser'
    })

    // First maxWidth 800 scales to 800x450
    // Then maxHeight 400 scales to ~711x400
    expect(result.finalWidth).toBe(711)
    expect(result.finalHeight).toBe(400)
    expect(result.needsResampling).toBe(true)
  })

  it('should not scale up when image is smaller than max dimensions', () => {
    const result = prepareImageForConversion({
      image: mockImage,
      cropX: 0,
      cropY: 0,
      cropWidth: 800,
      cropHeight: 600,
      maxWidth: '1920',
      maxHeight: '1080',
      resamplingMethod: 'browser'
    })

    expect(result.finalWidth).toBe(800)
    expect(result.finalHeight).toBe(600)
    expect(result.needsResampling).toBe(false)
  })

  it('should handle crop offset', () => {
    const result = prepareImageForConversion({
      image: mockImage,
      cropX: 100,
      cropY: 50,
      cropWidth: 500,
      cropHeight: 500,
      maxWidth: '',
      maxHeight: '',
      resamplingMethod: 'browser'
    })

    expect(result.finalWidth).toBe(500)
    expect(result.finalHeight).toBe(500)
    expect(result.needsResampling).toBe(false)
  })

  it('should return canvas element', () => {
    const result = prepareImageForConversion({
      image: mockImage,
      cropX: 0,
      cropY: 0,
      cropWidth: 100,
      cropHeight: 100,
      maxWidth: '',
      maxHeight: '',
      resamplingMethod: 'browser'
    })

    expect(result.canvas).toBeDefined()
    expect(result.canvas.width).toBe(100)
    expect(result.canvas.height).toBe(100)
  })

  it('should handle maxWidth only constraint', () => {
    const result = prepareImageForConversion({
      image: mockImage,
      cropX: 0,
      cropY: 0,
      cropWidth: 1000,
      cropHeight: 500,
      maxWidth: '500',
      maxHeight: '',
      resamplingMethod: 'browser'
    })

    expect(result.finalWidth).toBe(500)
    expect(result.finalHeight).toBe(250)
  })

  it('should handle maxHeight only constraint', () => {
    const result = prepareImageForConversion({
      image: mockImage,
      cropX: 0,
      cropY: 0,
      cropWidth: 1000,
      cropHeight: 500,
      maxWidth: '',
      maxHeight: '250',
      resamplingMethod: 'browser'
    })

    expect(result.finalWidth).toBe(500)
    expect(result.finalHeight).toBe(250)
  })

  it('should handle square crop', () => {
    const result = prepareImageForConversion({
      image: mockImage,
      cropX: 0,
      cropY: 0,
      cropWidth: 500,
      cropHeight: 500,
      maxWidth: '250',
      maxHeight: '',
      resamplingMethod: 'browser'
    })

    expect(result.finalWidth).toBe(250)
    expect(result.finalHeight).toBe(250)
  })

  it('should handle portrait crop', () => {
    const result = prepareImageForConversion({
      image: mockImage,
      cropX: 0,
      cropY: 0,
      cropWidth: 500,
      cropHeight: 1000,
      maxWidth: '',
      maxHeight: '500',
      resamplingMethod: 'browser'
    })

    expect(result.finalWidth).toBe(250)
    expect(result.finalHeight).toBe(500)
  })
})

describe('getOptimizationStatus', () => {
  it('should return converting message when no resampling needed', () => {
    const result = getOptimizationStatus(false, 'bicubic', 1920, 1080, 1920, 1080)
    expect(result).toBe('Converting to WebP...')
  })

  it('should return resampling message for minor downsampling', () => {
    // Scale ratio > 0.67 (SIGNIFICANT_DOWNSAMPLE_THRESHOLD)
    const result = getOptimizationStatus(true, 'bicubic', 1600, 900, 1920, 1080)
    expect(result).toBe('Resampling with bicubic...')
  })

  it('should include anti-aliasing message for significant downsampling', () => {
    // Scale ratio < 0.67 (SIGNIFICANT_DOWNSAMPLE_THRESHOLD)
    // 480/1920 = 0.25, which is < 0.67
    const result = getOptimizationStatus(true, 'lanczos', 480, 270, 1920, 1080)
    expect(result).toContain('anti-aliasing')
    expect(result).toContain('lanczos')
  })

  it('should work with different resampling methods', () => {
    const bicubicResult = getOptimizationStatus(true, 'bicubic', 960, 540, 1920, 1080)
    const lanczosResult = getOptimizationStatus(true, 'lanczos', 960, 540, 1920, 1080)
    const bilinearResult = getOptimizationStatus(true, 'bilinear', 960, 540, 1920, 1080)

    expect(bicubicResult).toContain('bicubic')
    expect(lanczosResult).toContain('lanczos')
    expect(bilinearResult).toContain('bilinear')
  })

  it('should handle upsampling (scale ratio > 1)', () => {
    // Upsampling: finalWidth > cropWidth
    const result = getOptimizationStatus(true, 'bicubic', 3840, 2160, 1920, 1080)
    expect(result).toBe('Resampling with bicubic...')
  })

  it('should handle edge case at threshold', () => {
    // Scale ratio above 0.67 threshold (SIGNIFICANT_DOWNSAMPLE_THRESHOLD)
    // 1300/1920 ≈ 0.68 which is > 0.67
    const result = getOptimizationStatus(true, 'bicubic', 1300, 730, 1920, 1080)
    // This should be just above threshold, so no anti-aliasing message
    expect(result).toBe('Resampling with bicubic...')
  })

  it('should handle browser resampling method', () => {
    const result = getOptimizationStatus(true, 'browser', 960, 540, 1920, 1080)
    expect(result).toContain('browser')
  })

  it('should handle nearest neighbor resampling', () => {
    const result = getOptimizationStatus(true, 'nearest', 960, 540, 1920, 1080)
    expect(result).toContain('nearest')
  })
})
