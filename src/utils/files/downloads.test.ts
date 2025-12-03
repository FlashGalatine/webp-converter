import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { downloadBlob } from './downloads'

describe('downloadBlob', () => {
  let mockAnchor: {
    download: string
    href: string
    click: ReturnType<typeof vi.fn>
  }
  beforeEach(() => {
    mockAnchor = {
      download: '',
      href: '',
      click: vi.fn()
    }
    vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor as unknown as HTMLAnchorElement)
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('should create download with correct filename format', () => {
    const blob = new Blob(['test'], { type: 'image/webp' })

    downloadBlob(blob, 1920, 1080, 95)

    expect(mockAnchor.download).toMatch(/image-\d{4}-\d{2}-\d{2}-1920x1080px-q95\.webp/)
    expect(mockAnchor.click).toHaveBeenCalledTimes(1)
  })

  it('should use LL suffix for lossless quality', () => {
    const blob = new Blob(['test'], { type: 'image/webp' })

    downloadBlob(blob, 800, 600, 'LL')

    expect(mockAnchor.download).toMatch(/image-\d{4}-\d{2}-\d{2}-800x600px-qLL\.webp/)
  })

  it('should handle different dimensions', () => {
    const blob = new Blob(['test'], { type: 'image/webp' })

    downloadBlob(blob, 1280, 720, 80)

    expect(mockAnchor.download).toMatch(/1280x720px/)
    expect(mockAnchor.download).toMatch(/q80/)
  })

  it('should round decimal dimensions', () => {
    const blob = new Blob(['test'], { type: 'image/webp' })

    downloadBlob(blob, 1920.6, 1080.4, 90)

    expect(mockAnchor.download).toMatch(/1921x1080px/)
  })

  it('should set href to blob URL', () => {
    const blob = new Blob(['test'], { type: 'image/webp' })

    downloadBlob(blob, 100, 100, 80)

    expect(mockAnchor.href).toMatch(/^blob:mock-url/)
    expect(URL.createObjectURL).toHaveBeenCalledWith(blob)
  })

  it('should create anchor element', () => {
    const blob = new Blob(['test'], { type: 'image/webp' })

    downloadBlob(blob, 100, 100, 80)

    expect(document.createElement).toHaveBeenCalledWith('a')
  })

  it('should revoke object URL after delay', () => {
    const blob = new Blob(['test'], { type: 'image/webp' })

    downloadBlob(blob, 100, 100, 80)

    expect(URL.revokeObjectURL).not.toHaveBeenCalled()

    vi.advanceTimersByTime(100)

    expect(URL.revokeObjectURL).toHaveBeenCalled()
  })

  it('should handle quality value of 1', () => {
    const blob = new Blob(['test'], { type: 'image/webp' })

    downloadBlob(blob, 100, 100, 1)

    expect(mockAnchor.download).toMatch(/q1\.webp/)
  })

  it('should handle quality value of 100', () => {
    const blob = new Blob(['test'], { type: 'image/webp' })

    downloadBlob(blob, 100, 100, 100)

    expect(mockAnchor.download).toMatch(/q100\.webp/)
  })

  it('should include current date in filename', () => {
    const blob = new Blob(['test'], { type: 'image/webp' })
    const today = new Date().toISOString().split('T')[0]

    downloadBlob(blob, 100, 100, 80)

    expect(mockAnchor.download).toContain(today)
  })
})
