import { describe, it, expect, vi, beforeEach } from 'vitest'
import { loadImageFromFile, createFileFromBlob } from './loaders'

describe('loadImageFromFile', () => {
  it('should load an image from a file', async () => {
    const mockFile = new File(['test'], 'test.png', { type: 'image/png' })

    const result = await loadImageFromFile(mockFile)

    expect(result.image).toBeDefined()
    expect(result.imageData).toContain('data:image')
  })

  it('should reject when image fails to decode', async () => {
    // Mock Image to trigger onerror
    const OriginalImage = global.Image
    class FailingImage {
      private _src = ''
      width = 0
      height = 0
      onload: (() => void) | null = null
      onerror: ((error: Event | string) => void) | null = null

      get src() {
        return this._src
      }

      set src(value: string) {
        this._src = value
        // Trigger onerror instead of onload
        setTimeout(() => {
          if (this.onerror) this.onerror(new Event('error'))
        }, 0)
      }
    }
    global.Image = FailingImage as unknown as typeof Image

    const mockFile = new File(['invalid'], 'bad.png', { type: 'image/png' })

    await expect(loadImageFromFile(mockFile)).rejects.toThrow(
      'Failed to decode image file. Make sure it is a valid image.'
    )

    global.Image = OriginalImage
  })

  it('should reject when FileReader fails to read file', async () => {
    // Mock FileReader to trigger onerror
    const OriginalFileReader = global.FileReader
    class FailingFileReader {
      result: string | ArrayBuffer | null = null
      error: DOMException | null = null
      readyState: number = 0
      onload: ((event: ProgressEvent<FileReader>) => void) | null = null
      onerror: ((event: ProgressEvent<FileReader>) => void) | null = null
      onloadstart: ((event: ProgressEvent<FileReader>) => void) | null = null
      onloadend: ((event: ProgressEvent<FileReader>) => void) | null = null
      onprogress: ((event: ProgressEvent<FileReader>) => void) | null = null
      onabort: ((event: ProgressEvent<FileReader>) => void) | null = null

      abort = vi.fn()

      readAsDataURL() {
        this.readyState = 1
        setTimeout(() => {
          this.readyState = 2
          this.error = new DOMException('Read error', 'NotReadableError')
          if (this.onerror) {
            this.onerror({ target: this } as unknown as ProgressEvent<FileReader>)
          }
        }, 0)
      }

      addEventListener = vi.fn()
      removeEventListener = vi.fn()
      dispatchEvent = vi.fn(() => true)

      static readonly EMPTY = 0
      static readonly LOADING = 1
      static readonly DONE = 2
      readonly EMPTY = 0
      readonly LOADING = 1
      readonly DONE = 2
    }
    global.FileReader = FailingFileReader as unknown as typeof FileReader

    const mockFile = new File(['test'], 'test.png', { type: 'image/png' })

    await expect(loadImageFromFile(mockFile)).rejects.toThrow('Failed to read file')

    global.FileReader = OriginalFileReader
  })

  it('should return image with correct dimensions from mock', async () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

    const result = await loadImageFromFile(mockFile)

    // Mock Image has default width/height of 1920x1080
    expect(result.image.width).toBe(1920)
    expect(result.image.height).toBe(1080)
  })

  it('should handle different file types', async () => {
    const pngFile = new File(['test'], 'image.png', { type: 'image/png' })
    const jpgFile = new File(['test'], 'image.jpg', { type: 'image/jpeg' })
    const webpFile = new File(['test'], 'image.webp', { type: 'image/webp' })

    const [pngResult, jpgResult, webpResult] = await Promise.all([
      loadImageFromFile(pngFile),
      loadImageFromFile(jpgFile),
      loadImageFromFile(webpFile)
    ])

    expect(pngResult.image).toBeDefined()
    expect(jpgResult.image).toBeDefined()
    expect(webpResult.image).toBeDefined()
  })
})

describe('createFileFromBlob', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-15T12:30:45.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should create a File from a Blob with default name', () => {
    const blob = new Blob(['test'], { type: 'image/png' })

    const file = createFileFromBlob(blob)

    expect(file.name).toContain('pasted-image')
    expect(file.name).toContain('.png')
    expect(file.type).toBe('image/png')
  })

  it('should create a File from a Blob with custom base name', () => {
    const blob = new Blob(['test'], { type: 'image/jpeg' })

    const file = createFileFromBlob(blob, 'screenshot')

    expect(file.name).toContain('screenshot')
    expect(file.name).toContain('.jpeg')
    expect(file.type).toBe('image/jpeg')
  })

  it('should include timestamp in filename', () => {
    const blob = new Blob(['test'], { type: 'image/png' })

    const file = createFileFromBlob(blob)

    // Timestamp format: 2024-01-15T12-30-45
    expect(file.name).toMatch(/pasted-image-2024-01-15T12-30-45\.png/)
  })

  it('should handle webp type', () => {
    const blob = new Blob(['test'], { type: 'image/webp' })

    const file = createFileFromBlob(blob)

    expect(file.name).toContain('.webp')
    expect(file.type).toBe('image/webp')
  })

  it('should handle gif type', () => {
    const blob = new Blob(['test'], { type: 'image/gif' })

    const file = createFileFromBlob(blob)

    expect(file.name).toContain('.gif')
    expect(file.type).toBe('image/gif')
  })

  it('should default to png extension for unknown type', () => {
    const blob = new Blob(['test'], { type: 'image/' })

    const file = createFileFromBlob(blob)

    // When type is 'image/', split('/')[1] is empty string, so defaults to 'png' behavior
    // Actually looking at the code: extension = blob.type.split('/')[1] || 'png'
    // So for 'image/', it would be '' which is falsy, so 'png'
    expect(file.name).toContain('.png')
  })

  it('should preserve blob content', () => {
    const blobContent = 'test image content'
    const blob = new Blob([blobContent], { type: 'image/png' })

    const file = createFileFromBlob(blob)

    expect(file.size).toBe(blob.size)
  })

  it('should be instance of File', () => {
    const blob = new Blob(['test'], { type: 'image/png' })

    const file = createFileFromBlob(blob)

    expect(file).toBeInstanceOf(File)
  })
})
