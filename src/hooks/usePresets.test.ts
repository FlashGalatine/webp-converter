import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { usePresets } from './usePresets'
import { BUILT_IN_PRESETS } from '../constants/presets'

declare const global: typeof globalThis;

describe('usePresets', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock fetch to reject (no presets.json file)
    global.fetch = vi.fn(() => Promise.reject(new Error('No presets.json'))) as typeof fetch
  })

  it('should initialize with built-in presets when fetch fails', async () => {
    const { result } = renderHook(() => usePresets())

    // Wait for the auto-load attempt to complete
    await waitFor(() => {
      expect(result.current.useCustomPresets).toBe(false)
    })

    expect(result.current.currentPresets).toBe(BUILT_IN_PRESETS)
    expect(result.current.customPresetsFileName).toBe('')
  })

  it('should have getCurrentPresets return current presets', async () => {
    const { result } = renderHook(() => usePresets())

    await waitFor(() => {
      expect(result.current.useCustomPresets).toBe(false)
    })

    expect(result.current.getCurrentPresets()).toBe(BUILT_IN_PRESETS)
  })

  describe('switchToBuiltIn', () => {
    it('should switch to built-in presets', async () => {
      const { result } = renderHook(() => usePresets())

      await waitFor(() => {
        expect(result.current.useCustomPresets).toBe(false)
      })

      act(() => {
        result.current.switchToBuiltIn()
      })

      expect(result.current.useCustomPresets).toBe(false)
      expect(result.current.customPresetsFileName).toBe('')
      expect(result.current.currentPresets).toBe(BUILT_IN_PRESETS)
    })
  })

  describe('applyPresetSettings', () => {
    it('should return default settings for built-in presets', async () => {
      const { result } = renderHook(() => usePresets())

      await waitFor(() => {
        expect(result.current.useCustomPresets).toBe(false)
      })

      const settings = result.current.applyPresetSettings('16:9 Landscape')

      expect(settings.maxWidth).toBe('')
      expect(settings.maxHeight).toBe('')
      expect(settings.targetSize).toBe('10')
      expect(settings.webOptimize).toBe(false)
    })

    it('should return default settings for unknown preset', async () => {
      const { result } = renderHook(() => usePresets())

      await waitFor(() => {
        expect(result.current.useCustomPresets).toBe(false)
      })

      const settings = result.current.applyPresetSettings('Unknown Preset')

      expect(settings.maxWidth).toBe('')
      expect(settings.maxHeight).toBe('')
      expect(settings.targetSize).toBe('10')
      expect(settings.webOptimize).toBe(false)
    })
  })

  describe('loadCustomPresets', () => {
    it('should load custom presets from JSON file', async () => {
      const { result } = renderHook(() => usePresets())

      const customPresetsJson = JSON.stringify({
        'Custom 1': {
          'crop-ratio': '16/9',
          'max-width': 1920,
          'max-height': 1080
        },
        'Custom 2': {
          'crop-ratio': 1.5,
          'max-filesize': 1,
          'max-filesize-unit': 'MB'
        }
      })

      const file = new File([customPresetsJson], 'presets.json', { type: 'application/json' })

      // Mock FileReader to actually read the file
      const originalFileReader = global.FileReader
      class TestFileReader {
        result: string | ArrayBuffer | null = null
        onload: ((event: ProgressEvent<FileReader>) => void) | null = null

        readAsText(_blob: Blob) {
          setTimeout(() => {
            this.result = customPresetsJson
            if (this.onload) {
              this.onload({ target: this } as unknown as ProgressEvent<FileReader>)
            }
          }, 0)
        }
      }
      global.FileReader = TestFileReader as unknown as typeof FileReader

      act(() => {
        result.current.loadCustomPresets(file)
      })

      await waitFor(() => {
        expect(result.current.useCustomPresets).toBe(true)
      })

      expect(result.current.customPresetsFileName).toBe('presets.json')
      expect(result.current.customPresets['Custom 1']).toBeCloseTo(1.7778, 3)
      expect(result.current.customPresets['Custom 2']).toBe(1.5)

      global.FileReader = originalFileReader
    })

    it('should apply settings from custom presets', async () => {
      const { result } = renderHook(() => usePresets())

      const customPresetsJson = JSON.stringify({
        'Test Preset': {
          'crop-ratio': '16/9',
          'max-width': 1920,
          'max-height': 1080,
          'max-filesize': 2,
          'max-filesize-unit': 'MB'
        }
      })

      const file = new File([customPresetsJson], 'presets.json', { type: 'application/json' })

      const originalFileReader = global.FileReader
      class TestFileReader {
        result: string | ArrayBuffer | null = null
        onload: ((event: ProgressEvent<FileReader>) => void) | null = null

        readAsText() {
          setTimeout(() => {
            this.result = customPresetsJson
            if (this.onload) {
              this.onload({ target: this } as unknown as ProgressEvent<FileReader>)
            }
          }, 0)
        }
      }
      global.FileReader = TestFileReader as unknown as typeof FileReader

      act(() => {
        result.current.loadCustomPresets(file)
      })

      await waitFor(() => {
        expect(result.current.useCustomPresets).toBe(true)
      })

      const settings = result.current.applyPresetSettings('Test Preset')

      expect(settings.maxWidth).toBe('1920')
      expect(settings.maxHeight).toBe('1080')
      expect(settings.targetSize).toBe('2')
      expect(settings.webOptimize).toBe(true)

      global.FileReader = originalFileReader
    })

    it('should handle KB file size unit', async () => {
      const { result } = renderHook(() => usePresets())

      const customPresetsJson = JSON.stringify({
        'Test Preset': {
          'crop-ratio': '1/1',
          'max-filesize': 500,
          'max-filesize-unit': 'KB'
        }
      })

      const file = new File([customPresetsJson], 'presets.json', { type: 'application/json' })

      const originalFileReader = global.FileReader
      class TestFileReader {
        result: string | ArrayBuffer | null = null
        onload: ((event: ProgressEvent<FileReader>) => void) | null = null

        readAsText() {
          setTimeout(() => {
            this.result = customPresetsJson
            if (this.onload) {
              this.onload({ target: this } as unknown as ProgressEvent<FileReader>)
            }
          }, 0)
        }
      }
      global.FileReader = TestFileReader as unknown as typeof FileReader

      act(() => {
        result.current.loadCustomPresets(file)
      })

      await waitFor(() => {
        expect(result.current.useCustomPresets).toBe(true)
      })

      const settings = result.current.applyPresetSettings('Test Preset')

      // 500 KB = 500/1024 MB ≈ 0.488 MB
      expect(parseFloat(settings.targetSize)).toBeCloseTo(0.488, 2)
      expect(settings.webOptimize).toBe(true)

      global.FileReader = originalFileReader
    })

    it('should handle GB file size unit', async () => {
      const { result } = renderHook(() => usePresets())

      const customPresetsJson = JSON.stringify({
        'Test Preset': {
          'crop-ratio': '1/1',
          'max-filesize': 1,
          'max-filesize-unit': 'GB'
        }
      })

      const file = new File([customPresetsJson], 'presets.json', { type: 'application/json' })

      const originalFileReader = global.FileReader
      class TestFileReader {
        result: string | ArrayBuffer | null = null
        onload: ((event: ProgressEvent<FileReader>) => void) | null = null

        readAsText() {
          setTimeout(() => {
            this.result = customPresetsJson
            if (this.onload) {
              this.onload({ target: this } as unknown as ProgressEvent<FileReader>)
            }
          }, 0)
        }
      }
      global.FileReader = TestFileReader as unknown as typeof FileReader

      act(() => {
        result.current.loadCustomPresets(file)
      })

      await waitFor(() => {
        expect(result.current.useCustomPresets).toBe(true)
      })

      const settings = result.current.applyPresetSettings('Test Preset')

      // 1 GB = 1024 MB
      expect(settings.targetSize).toBe('1024')
      expect(settings.webOptimize).toBe(true)

      global.FileReader = originalFileReader
    })

    it('should handle preset with max-width and max-height but no crop-ratio', async () => {
      const { result } = renderHook(() => usePresets())

      const customPresetsJson = JSON.stringify({
        'Test Preset': {
          'max-width': 800,
          'max-height': 600
        }
      })

      const file = new File([customPresetsJson], 'presets.json', { type: 'application/json' })

      const originalFileReader = global.FileReader
      class TestFileReader {
        result: string | ArrayBuffer | null = null
        onload: ((event: ProgressEvent<FileReader>) => void) | null = null

        readAsText() {
          setTimeout(() => {
            this.result = customPresetsJson
            if (this.onload) {
              this.onload({ target: this } as unknown as ProgressEvent<FileReader>)
            }
          }, 0)
        }
      }
      global.FileReader = TestFileReader as unknown as typeof FileReader

      act(() => {
        result.current.loadCustomPresets(file)
      })

      await waitFor(() => {
        expect(result.current.useCustomPresets).toBe(true)
      })

      // crop-ratio should be calculated from max-width/max-height = 800/600 = 1.333
      expect(result.current.customPresets['Test Preset']).toBeCloseTo(1.333, 2)

      global.FileReader = originalFileReader
    })
  })

  describe('auto-load presets.json', () => {
    it('should auto-load presets.json on mount if available', async () => {
      const customPresetsJson = {
        'Auto Preset': {
          'crop-ratio': '4/3'
        }
      }

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(customPresetsJson)
        })
      ) as unknown as typeof fetch

      const { result } = renderHook(() => usePresets())

      await waitFor(() => {
        expect(result.current.useCustomPresets).toBe(true)
      })

      expect(result.current.customPresetsFileName).toBe('presets.json (auto-loaded)')
      expect(result.current.customPresets['Auto Preset']).toBeCloseTo(1.333, 2)
    })

    it('should auto-load preset with only max dimensions (no crop-ratio)', async () => {
      const customPresetsJson = {
        'Dimensions Only': {
          'max-width': 1920,
          'max-height': 1080
        }
      }

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(customPresetsJson)
        })
      ) as unknown as typeof fetch

      const { result } = renderHook(() => usePresets())

      await waitFor(() => {
        expect(result.current.useCustomPresets).toBe(true)
      })

      // Crop ratio should be calculated from max-width/max-height
      expect(result.current.customPresets['Dimensions Only']).toBeCloseTo(1.7778, 2)
    })

    it('should auto-load preset with no crop-ratio or dimensions (null)', async () => {
      const customPresetsJson = {
        'Empty Preset': {
          // No crop-ratio, no max-width/max-height
        }
      }

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(customPresetsJson)
        })
      ) as unknown as typeof fetch

      const { result } = renderHook(() => usePresets())

      await waitFor(() => {
        expect(result.current.useCustomPresets).toBe(true)
      })

      // Should be null (freestyle mode)
      expect(result.current.customPresets['Empty Preset']).toBeNull()
    })

    it('should not auto-load when fetch returns not ok', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({})
        })
      ) as unknown as typeof fetch

      const { result } = renderHook(() => usePresets())

      // Wait a bit to ensure the effect runs
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(result.current.useCustomPresets).toBe(false)
    })
  })

  describe('loadCustomPresets edge cases', () => {
    it('should handle preset with no crop-ratio and no dimensions (null)', async () => {
      const { result } = renderHook(() => usePresets())

      const customPresetsJson = JSON.stringify({
        'Freestyle Preset': {
          // No crop-ratio, no max-width/max-height - should be null
          'max-filesize': 5,
          'max-filesize-unit': 'MB'
        }
      })

      const file = new File([customPresetsJson], 'presets.json', { type: 'application/json' })

      const originalFileReader = global.FileReader
      class TestFileReader {
        result: string | ArrayBuffer | null = null
        onload: ((event: ProgressEvent<FileReader>) => void) | null = null

        readAsText() {
          setTimeout(() => {
            this.result = customPresetsJson
            if (this.onload) {
              this.onload({ target: this } as unknown as ProgressEvent<FileReader>)
            }
          }, 0)
        }
      }
      global.FileReader = TestFileReader as unknown as typeof FileReader

      act(() => {
        result.current.loadCustomPresets(file)
      })

      await waitFor(() => {
        expect(result.current.useCustomPresets).toBe(true)
      })

      // Crop ratio should be null (freestyle mode)
      expect(result.current.customPresets['Freestyle Preset']).toBeNull()

      global.FileReader = originalFileReader
    })

    it('should show error alert for invalid JSON', async () => {
      const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {})
      const { result } = renderHook(() => usePresets())

      const invalidJson = 'not valid json {'

      const file = new File([invalidJson], 'presets.json', { type: 'application/json' })

      const originalFileReader = global.FileReader
      class TestFileReader {
        result: string | ArrayBuffer | null = null
        onload: ((event: ProgressEvent<FileReader>) => void) | null = null

        readAsText() {
          setTimeout(() => {
            this.result = invalidJson
            if (this.onload) {
              this.onload({ target: this } as unknown as ProgressEvent<FileReader>)
            }
          }, 0)
        }
      }
      global.FileReader = TestFileReader as unknown as typeof FileReader

      act(() => {
        result.current.loadCustomPresets(file)
      })

      await waitFor(() => {
        expect(alertMock).toHaveBeenCalled()
      })

      expect(alertMock.mock.calls[0][0]).toContain('Error loading preset file')

      global.FileReader = originalFileReader
      alertMock.mockRestore()
    })

    it('should handle preset with default MB unit when no unit specified', async () => {
      const { result } = renderHook(() => usePresets())

      const customPresetsJson = JSON.stringify({
        'Test Preset': {
          'crop-ratio': '1/1',
          'max-filesize': 5
          // No max-filesize-unit - should default to MB
        }
      })

      const file = new File([customPresetsJson], 'presets.json', { type: 'application/json' })

      const originalFileReader = global.FileReader
      class TestFileReader {
        result: string | ArrayBuffer | null = null
        onload: ((event: ProgressEvent<FileReader>) => void) | null = null

        readAsText() {
          setTimeout(() => {
            this.result = customPresetsJson
            if (this.onload) {
              this.onload({ target: this } as unknown as ProgressEvent<FileReader>)
            }
          }, 0)
        }
      }
      global.FileReader = TestFileReader as unknown as typeof FileReader

      act(() => {
        result.current.loadCustomPresets(file)
      })

      await waitFor(() => {
        expect(result.current.useCustomPresets).toBe(true)
      })

      const settings = result.current.applyPresetSettings('Test Preset')

      // Should be 5 MB (default unit)
      expect(settings.targetSize).toBe('5')
      expect(settings.webOptimize).toBe(true)

      global.FileReader = originalFileReader
    })
  })
})
