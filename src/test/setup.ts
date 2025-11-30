import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock canvas context
class MockCanvasRenderingContext2D {
  fillStyle = ''
  strokeStyle = ''
  lineWidth = 1
  lineCap: CanvasLineCap = 'butt'
  lineJoin: CanvasLineJoin = 'miter'
  globalAlpha = 1
  globalCompositeOperation: GlobalCompositeOperation = 'source-over'
  imageSmoothingEnabled = true
  imageSmoothingQuality: ImageSmoothingQuality = 'high'
  font = '10px sans-serif'
  textAlign: CanvasTextAlign = 'start'
  textBaseline: CanvasTextBaseline = 'alphabetic'
  shadowBlur = 0
  shadowColor = 'rgba(0, 0, 0, 0)'
  shadowOffsetX = 0
  shadowOffsetY = 0

  canvas = {
    width: 800,
    height: 600,
  }

  fillRect = vi.fn()
  strokeRect = vi.fn()
  clearRect = vi.fn()
  drawImage = vi.fn()

  getImageData = vi.fn((x: number, y: number, width: number, height: number) => ({
    data: new Uint8ClampedArray(width * height * 4),
    width,
    height,
    colorSpace: 'srgb' as PredefinedColorSpace,
  }))

  createImageData = vi.fn((width: number, height: number) => ({
    data: new Uint8ClampedArray(width * height * 4),
    width,
    height,
    colorSpace: 'srgb' as PredefinedColorSpace,
  }))

  putImageData = vi.fn()

  beginPath = vi.fn()
  closePath = vi.fn()
  moveTo = vi.fn()
  lineTo = vi.fn()
  arc = vi.fn()
  arcTo = vi.fn()
  rect = vi.fn()
  stroke = vi.fn()
  fill = vi.fn()
  clip = vi.fn()

  save = vi.fn()
  restore = vi.fn()
  scale = vi.fn()
  rotate = vi.fn()
  translate = vi.fn()
  transform = vi.fn()
  setTransform = vi.fn()
  resetTransform = vi.fn()

  measureText = vi.fn(() => ({
    width: 100,
    actualBoundingBoxLeft: 0,
    actualBoundingBoxRight: 100,
    fontBoundingBoxAscent: 10,
    fontBoundingBoxDescent: 2,
    actualBoundingBoxAscent: 10,
    actualBoundingBoxDescent: 2,
    emHeightAscent: 10,
    emHeightDescent: 2,
    hangingBaseline: 8,
    alphabeticBaseline: 0,
    ideographicBaseline: -2,
  }))

  fillText = vi.fn()
  strokeText = vi.fn()

  createLinearGradient = vi.fn(() => ({
    addColorStop: vi.fn(),
  }))

  createRadialGradient = vi.fn(() => ({
    addColorStop: vi.fn(),
  }))

  createPattern = vi.fn()

  isPointInPath = vi.fn(() => false)
  isPointInStroke = vi.fn(() => false)

  getLineDash = vi.fn(() => [])
  setLineDash = vi.fn()

  quadraticCurveTo = vi.fn()
  bezierCurveTo = vi.fn()
  ellipse = vi.fn()
  roundRect = vi.fn()
}

// Mock HTMLCanvasElement
HTMLCanvasElement.prototype.getContext = vi.fn(function(
  this: HTMLCanvasElement,
  contextId: string
) {
  if (contextId === '2d') {
    const ctx = new MockCanvasRenderingContext2D()
    ctx.canvas = { width: this.width, height: this.height }
    return ctx as unknown as CanvasRenderingContext2D
  }
  return null
}) as typeof HTMLCanvasElement.prototype.getContext

HTMLCanvasElement.prototype.toBlob = vi.fn(function(
  this: HTMLCanvasElement,
  callback: BlobCallback,
  type?: string,
  quality?: number
) {
  const blob = new Blob(['test-image-data'], { type: type || 'image/webp' })
  setTimeout(() => callback(blob), 0)
})

HTMLCanvasElement.prototype.toDataURL = vi.fn(function(
  this: HTMLCanvasElement,
  type?: string,
  quality?: number
) {
  return 'data:image/png;base64,mockImageData'
})

// Mock URL.createObjectURL and revokeObjectURL
const originalCreateObjectURL = URL.createObjectURL
const originalRevokeObjectURL = URL.revokeObjectURL

URL.createObjectURL = vi.fn((obj: Blob | MediaSource) => 'blob:mock-url-' + Math.random())
URL.revokeObjectURL = vi.fn()

// Mock FileReader
class MockFileReader {
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

  readAsDataURL(blob: Blob) {
    this.readyState = 1
    setTimeout(() => {
      this.readyState = 2
      this.result = 'data:image/png;base64,mockImageData'
      if (this.onload) {
        this.onload({ target: this } as unknown as ProgressEvent<FileReader>)
      }
    }, 0)
  }

  readAsText(blob: Blob) {
    this.readyState = 1
    setTimeout(() => {
      this.readyState = 2
      this.result = '{}'
      if (this.onload) {
        this.onload({ target: this } as unknown as ProgressEvent<FileReader>)
      }
    }, 0)
  }

  readAsArrayBuffer(blob: Blob) {
    this.readyState = 1
    setTimeout(() => {
      this.readyState = 2
      this.result = new ArrayBuffer(0)
      if (this.onload) {
        this.onload({ target: this } as unknown as ProgressEvent<FileReader>)
      }
    }, 0)
  }

  readAsBinaryString(blob: Blob) {
    this.readyState = 1
    setTimeout(() => {
      this.readyState = 2
      this.result = ''
      if (this.onload) {
        this.onload({ target: this } as unknown as ProgressEvent<FileReader>)
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

global.FileReader = MockFileReader as unknown as typeof FileReader

// Mock Image
class MockImage {
  private _src = ''
  width = 1920
  height = 1080
  naturalWidth = 1920
  naturalHeight = 1080
  complete = true
  onload: (() => void) | null = null
  onerror: ((error: Event | string) => void) | null = null

  get src() {
    return this._src
  }

  set src(value: string) {
    this._src = value
    if (this.onload) {
      setTimeout(() => {
        if (this.onload) this.onload()
      }, 0)
    }
  }

  decode = vi.fn(() => Promise.resolve())
  addEventListener = vi.fn()
  removeEventListener = vi.fn()
}

global.Image = MockImage as unknown as typeof Image

// Mock window.alert
window.alert = vi.fn()

// Mock fetch for preset loading
global.fetch = vi.fn(() =>
  Promise.reject(new Error('No presets.json found'))
) as typeof fetch

// Cleanup after each test
afterEach(() => {
  vi.clearAllMocks()
})
