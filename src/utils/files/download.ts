/**
 * File download utilities
 */

/**
 * Downloads a blob as a file
 *
 * Creates a temporary download link and triggers download.
 * Automatically revokes object URL after download.
 *
 * @param blob - Blob to download
 * @param filename - Desired filename
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.download = filename;
  a.href = url;
  a.click();

  // Delay revocation to ensure download completes
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * Downloads image blob with generated filename
 *
 * @param blob - Image blob
 * @param width - Image width
 * @param height - Image height
 * @param quality - Quality value or 'LL' for lossless
 */
export function downloadImageBlob(
  blob: Blob,
  width: number,
  height: number,
  quality: number | 'LL'
): void {
  const date = new Date().toISOString().split('T')[0];
  const resolution = `${Math.round(width)}x${Math.round(height)}px`;
  const qualityStr = quality === 'LL' ? 'qLL' : `q${quality}`;
  const filename = `image-${date}-${resolution}-${qualityStr}.webp`;

  downloadBlob(blob, filename);
}

/**
 * Creates a download URL from blob
 *
 * @param blob - Blob to create URL for
 * @returns Object URL string
 */
export function createDownloadUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}

/**
 * Revokes a download URL
 *
 * @param url - Object URL to revoke
 */
export function revokeDownloadUrl(url: string): void {
  URL.revokeObjectURL(url);
}

/**
 * Downloads text content as a file
 *
 * @param content - Text content
 * @param filename - Desired filename
 * @param mimeType - MIME type (default: text/plain)
 */
export function downloadTextFile(
  content: string,
  filename: string,
  mimeType: string = 'text/plain'
): void {
  const blob = new Blob([content], { type: mimeType });
  downloadBlob(blob, filename);
}

/**
 * Downloads JSON data as a file
 *
 * @param data - Data to serialize as JSON
 * @param filename - Desired filename
 */
export function downloadJSON(data: unknown, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  downloadTextFile(json, filename, 'application/json');
}
