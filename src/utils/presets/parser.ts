/**
 * Parse aspect ratio from string (e.g., "16/9" or "1.777") or number
 */
export function parseAspectRatio(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  // If it's a number, return it directly
  if (typeof value === 'number') {
    return value;
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

