/**
 * Validate crop ratio input (supports both "16/9" and "1.777" formats)
 */
export function validateCropRatio(value: string | null): boolean {
  if (value === '' || value === null) {
    return true; // Empty is valid (optional field)
  }

  const trimmed = String(value).trim();

  // Check for ratio format
  if (trimmed.includes('/')) {
    const parts = trimmed.split('/');
    if (parts.length === 2) {
      const numerator = parseFloat(parts[0].trim());
      const denominator = parseFloat(parts[1].trim());
      return !isNaN(numerator) && !isNaN(denominator) && denominator !== 0;
    }
    return false;
  }

  // Check for decimal format
  const numValue = parseFloat(trimmed);
  return !isNaN(numValue) && numValue > 0;
}

/**
 * Validate preset name is not empty
 */
export function validatePresetName(name: string): boolean {
  return Boolean(name && name.trim() !== '');
}

