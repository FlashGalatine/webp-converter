/**
 * Helper function to download blob
 */
export function downloadBlob(blob: Blob, width: number, height: number, qualityValue: number | 'LL'): void {
  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    const resolution = `${Math.round(width)}x${Math.round(height)}px`;
    const qualityStr = qualityValue === 'LL' ? 'qLL' : `q${qualityValue}`;
    a.download = `image-${date}-${resolution}-${qualityStr}.webp`;
    a.href = url;
    a.click();
  } finally {
    // Delay revocation to ensure download completes
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }
}

