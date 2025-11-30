import { describe, it, expect } from 'vitest'
import { validateCropRatio, validatePresetName } from './validation'

describe('validateCropRatio', () => {
  describe('empty/null values (optional field)', () => {
    it('should return true for empty string', () => {
      expect(validateCropRatio('')).toBe(true)
    })

    it('should return true for null', () => {
      expect(validateCropRatio(null)).toBe(true)
    })
  })

  describe('ratio format validation', () => {
    it('should return true for valid ratio "16/9"', () => {
      expect(validateCropRatio('16/9')).toBe(true)
    })

    it('should return true for valid ratio "4/3"', () => {
      expect(validateCropRatio('4/3')).toBe(true)
    })

    it('should return true for valid ratio "1/1"', () => {
      expect(validateCropRatio('1/1')).toBe(true)
    })

    it('should return true for valid ratio "9/16" (portrait)', () => {
      expect(validateCropRatio('9/16')).toBe(true)
    })

    it('should return true for valid ratio "21/9" (ultrawide)', () => {
      expect(validateCropRatio('21/9')).toBe(true)
    })

    it('should return false for division by zero', () => {
      expect(validateCropRatio('16/0')).toBe(false)
    })

    it('should return false for too many parts', () => {
      expect(validateCropRatio('16/9/4')).toBe(false)
    })

    it('should return false for non-numeric numerator', () => {
      expect(validateCropRatio('abc/9')).toBe(false)
    })

    it('should return false for non-numeric denominator', () => {
      expect(validateCropRatio('16/def')).toBe(false)
    })

    it('should return false for completely invalid ratio', () => {
      expect(validateCropRatio('abc/def')).toBe(false)
    })

    it('should handle whitespace in ratio format', () => {
      expect(validateCropRatio(' 16 / 9 ')).toBe(true)
    })
  })

  describe('decimal format validation', () => {
    it('should return true for valid decimal "1.777"', () => {
      expect(validateCropRatio('1.777')).toBe(true)
    })

    it('should return true for valid decimal "1.333"', () => {
      expect(validateCropRatio('1.333')).toBe(true)
    })

    it('should return true for valid integer "1"', () => {
      expect(validateCropRatio('1')).toBe(true)
    })

    it('should return true for valid decimal "0.5625"', () => {
      expect(validateCropRatio('0.5625')).toBe(true)
    })

    it('should return false for zero', () => {
      expect(validateCropRatio('0')).toBe(false)
    })

    it('should return false for negative numbers', () => {
      expect(validateCropRatio('-1.5')).toBe(false)
    })

    it('should return false for non-numeric strings', () => {
      expect(validateCropRatio('abc')).toBe(false)
    })

    it('should handle whitespace in decimal format', () => {
      expect(validateCropRatio('  1.5  ')).toBe(true)
    })
  })
})

describe('validatePresetName', () => {
  it('should return true for valid name', () => {
    expect(validatePresetName('My Preset')).toBe(true)
  })

  it('should return true for single character name', () => {
    expect(validatePresetName('A')).toBe(true)
  })

  it('should return true for name with numbers', () => {
    expect(validatePresetName('Preset 123')).toBe(true)
  })

  it('should return true for name with special characters', () => {
    expect(validatePresetName('My-Preset_v2.0')).toBe(true)
  })

  it('should return true for name with leading/trailing whitespace', () => {
    // Name has content after trimming
    expect(validatePresetName('  My Preset  ')).toBe(true)
  })

  it('should return false for empty string', () => {
    expect(validatePresetName('')).toBe(false)
  })

  it('should return false for whitespace only', () => {
    expect(validatePresetName('   ')).toBe(false)
  })

  it('should return false for tab only', () => {
    expect(validatePresetName('\t')).toBe(false)
  })

  it('should return false for newline only', () => {
    expect(validatePresetName('\n')).toBe(false)
  })
})
