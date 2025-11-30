import { describe, it, expect } from 'vitest'
import { parseAspectRatio } from './parser'

describe('parseAspectRatio', () => {
  describe('null/undefined/empty handling', () => {
    it('should return null for null input', () => {
      expect(parseAspectRatio(null)).toBeNull()
    })

    it('should return null for undefined input', () => {
      expect(parseAspectRatio(undefined)).toBeNull()
    })

    it('should return null for empty string', () => {
      expect(parseAspectRatio('')).toBeNull()
    })
  })

  describe('number input', () => {
    it('should return the number directly for numeric input', () => {
      expect(parseAspectRatio(1.5)).toBe(1.5)
    })

    it('should return 1 for aspect ratio of 1', () => {
      expect(parseAspectRatio(1)).toBe(1)
    })

    it('should handle decimal numbers', () => {
      expect(parseAspectRatio(1.7778)).toBe(1.7778)
    })

    it('should handle very small ratios', () => {
      expect(parseAspectRatio(0.5)).toBe(0.5)
    })
  })

  describe('ratio format (e.g., "16/9")', () => {
    it('should parse "16/9" correctly', () => {
      expect(parseAspectRatio('16/9')).toBeCloseTo(1.7778, 3)
    })

    it('should parse "4/3" correctly', () => {
      expect(parseAspectRatio('4/3')).toBeCloseTo(1.3333, 3)
    })

    it('should parse "9/16" correctly (portrait)', () => {
      expect(parseAspectRatio('9/16')).toBeCloseTo(0.5625, 3)
    })

    it('should parse "1/1" as 1', () => {
      expect(parseAspectRatio('1/1')).toBe(1)
    })

    it('should parse "21/9" correctly (ultrawide)', () => {
      expect(parseAspectRatio('21/9')).toBeCloseTo(2.3333, 3)
    })

    it('should parse "3/2" correctly', () => {
      expect(parseAspectRatio('3/2')).toBe(1.5)
    })

    it('should handle whitespace in ratio format', () => {
      expect(parseAspectRatio(' 16 / 9 ')).toBeCloseTo(1.7778, 3)
    })

    it('should handle whitespace around numbers', () => {
      expect(parseAspectRatio('  4  /  3  ')).toBeCloseTo(1.3333, 3)
    })

    it('should return null for division by zero', () => {
      expect(parseAspectRatio('16/0')).toBeNull()
    })

    it('should return null for too many parts', () => {
      expect(parseAspectRatio('16/9/4')).toBeNull()
    })

    it('should return null for non-numeric numerator', () => {
      expect(parseAspectRatio('abc/9')).toBeNull()
    })

    it('should return null for non-numeric denominator', () => {
      expect(parseAspectRatio('16/def')).toBeNull()
    })

    it('should return null for completely invalid ratio', () => {
      expect(parseAspectRatio('abc/def')).toBeNull()
    })

    it('should return null for empty parts', () => {
      expect(parseAspectRatio('/9')).toBeNull()
    })

    it('should return null for missing denominator', () => {
      expect(parseAspectRatio('16/')).toBeNull()
    })
  })

  describe('decimal string format', () => {
    it('should parse "1.777" correctly', () => {
      expect(parseAspectRatio('1.777')).toBe(1.777)
    })

    it('should parse "1.333" correctly', () => {
      expect(parseAspectRatio('1.333')).toBe(1.333)
    })

    it('should parse "1" as 1', () => {
      expect(parseAspectRatio('1')).toBe(1)
    })

    it('should parse "0.5625" correctly', () => {
      expect(parseAspectRatio('0.5625')).toBe(0.5625)
    })

    it('should return null for zero', () => {
      expect(parseAspectRatio('0')).toBeNull()
    })

    it('should return null for negative numbers', () => {
      expect(parseAspectRatio('-1.5')).toBeNull()
    })

    it('should return null for non-numeric strings', () => {
      expect(parseAspectRatio('abc')).toBeNull()
    })

    it('should return null for special strings', () => {
      expect(parseAspectRatio('NaN')).toBeNull()
    })

    it('should handle whitespace in decimal format', () => {
      expect(parseAspectRatio('  1.5  ')).toBe(1.5)
    })
  })
})
