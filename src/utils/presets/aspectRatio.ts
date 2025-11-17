/**
 * Aspect ratio parsing utilities
 */

/**
 * Parses aspect ratio from string or number format
 *
 * Supports:
 * - Ratio notation: "16/9", "4/3", "21/9"
 * - Decimal format: 1.777, 1.333, 2.333
 * - Numbers: 1.5, 2.0
 * - Null/undefined: returns null
 *
 * @param value - Aspect ratio as string, number, or null
 * @returns Parsed ratio as number or null
 *
 * @example
 * parseAspectRatio("16/9")  // 1.777...
 * parseAspectRatio("1.777") // 1.777
 * parseAspectRatio(1.777)   // 1.777
 * parseAspectRatio(null)    // null
 */
export function parseAspectRatio(
  value: string | number | null | undefined
): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  // If it's a number, return it directly
  if (typeof value === 'number') {
    return value > 0 ? value : null;
  }

  // Convert to string if it isn't already
  const strValue = String(value).trim();

  // Check if it's a ratio format (e.g., "16/9")
  if (strValue.includes('/')) {
    const parts = strValue.split('/');
    if (parts.length === 2) {
      const numerator = parseFloat(parts[0].trim());
      const denominator = parseFloat(parts[1].trim());

      // Validate that both are valid numbers and denominator is not zero
      if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
        return numerator / denominator;
      }
    }
    // If ratio format is invalid, return null
    return null;
  }

  // Otherwise, try to parse as decimal number
  const numValue = parseFloat(strValue);
  if (!isNaN(numValue) && numValue > 0) {
    return numValue;
  }

  return null;
}

/**
 * Formats aspect ratio as a displayable string
 *
 * @param ratio - Aspect ratio number
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string
 *
 * @example
 * formatAspectRatio(1.777777) // "1.78"
 * formatAspectRatio(1.5, 3)   // "1.500"
 */
export function formatAspectRatio(
  ratio: number | null,
  decimals: number = 2
): string {
  if (ratio === null) {
    return 'Free';
  }
  return ratio.toFixed(decimals);
}

/**
 * Checks if an aspect ratio is approximately square
 *
 * @param ratio - Aspect ratio to check
 * @param tolerance - Tolerance for square detection (default: 0.1)
 * @returns True if aspect ratio is close to 1.0
 *
 * @example
 * isSquareRatio(1.0)   // true
 * isSquareRatio(1.05)  // true (within tolerance)
 * isSquareRatio(1.5)   // false
 */
export function isSquareRatio(
  ratio: number | null,
  tolerance: number = 0.1
): boolean {
  if (ratio === null) {
    return false;
  }
  return Math.abs(ratio - 1.0) < tolerance;
}

/**
 * Determines image orientation based on aspect ratio
 *
 * @param ratio - Aspect ratio (width/height)
 * @param tolerance - Tolerance for square detection
 * @returns 'square', 'landscape', or 'portrait'
 *
 * @example
 * getOrientation(1.0)    // 'square'
 * getOrientation(1.777)  // 'landscape'
 * getOrientation(0.75)   // 'portrait'
 */
export function getOrientation(
  ratio: number | null,
  tolerance: number = 0.1
): 'square' | 'landscape' | 'portrait' {
  if (ratio === null) {
    return 'square';
  }

  if (isSquareRatio(ratio, tolerance)) {
    return 'square';
  }

  return ratio > 1 ? 'landscape' : 'portrait';
}
