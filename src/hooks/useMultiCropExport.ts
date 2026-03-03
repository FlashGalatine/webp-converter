import { useState, useCallback } from 'react';
import type { CropZone, ExportSettings } from '../types';
import { prepareImageForConversion } from '../utils/imageProcessing/conversion';

export interface ExportProgress {
    currentZoneIndex: number;
    totalZones: number;
    zoneLabel: string;
    status: string;
    overallProgress: number; // 0-100
}

export interface UseMultiCropExportReturn {
    isExporting: boolean;
    exportProgress: ExportProgress | null;
    exportZones: (image: HTMLImageElement, zones: CropZone[]) => Promise<void>;
}

/**
 * Generate filename for a zone export.
 * Pattern: {label}-{w}x{h}px-{qualitySuffix}.webp
 */
function generateFilename(label: string, width: number, height: number, settings: ExportSettings, effectiveQuality?: number): string {
    const sanitizedLabel = label.replace(/[<>:"/\\|?*]/g, '_');
    const resolution = `${Math.round(width)}x${Math.round(height)}px`;

    let qualitySuffix: string;
    switch (settings.qualityMode) {
        case 'lossless':
            qualitySuffix = 'lossless';
            break;
        case 'filesize':
            qualitySuffix = `max${settings.maxFilesizeKb}kb`;
            break;
        case 'quality':
        default:
            qualitySuffix = `q${effectiveQuality ?? settings.quality}`;
            break;
    }

    return `${sanitizedLabel}-${resolution}-${qualitySuffix}.webp`;
}

/**
 * Try to encode using WASM-based encoder for true lossless.
 * Falls back to canvas.toBlob if WASM fails to load.
 * The dynamic import uses a variable to prevent Vite from resolving it at build time.
 */
async function encodeLossless(canvas: HTMLCanvasElement): Promise<Blob> {
    try {
        const mod = await import('@jsquash/webp') as { encode: (data: ImageData, opts?: { lossless?: boolean }) => Promise<ArrayBuffer> };
        const ctx = canvas.getContext('2d')!;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const encoded = await mod.encode(imageData, { lossless: true });
        return new Blob([encoded], { type: 'image/webp' });
    } catch (err) {
        console.warn('[MultiCropExport] WASM lossless encoder unavailable, falling back to canvas.toBlob:', err);
        // Fallback: canvas.toBlob with quality=1.0 (max quality lossy, not truly lossless)
        return new Promise<Blob>((resolve, reject) => {
            canvas.toBlob(
                (blob) => blob ? resolve(blob) : reject(new Error('toBlob returned null')),
                'image/webp',
                1.0
            );
        });
    }
}

/**
 * Binary-search quality to fit within a filesize constraint.
 * Returns the blob and the effective quality used.
 */
async function encodeWithFilesizeConstraint(
    canvas: HTMLCanvasElement,
    maxFilesizeKb: number,
    onStatus?: (msg: string) => void,
): Promise<{ blob: Blob; quality: number }> {
    const targetBytes = maxFilesizeKb * 1024;

    // Try lossless first
    const losslessBlob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/webp', 1.0);
    });

    if (losslessBlob && losslessBlob.size <= targetBytes) {
        return { blob: losslessBlob, quality: 100 };
    }

    // Binary search for quality
    let low = 1;
    let high = 100;
    let bestBlob: Blob | null = null;
    let bestQuality = 1;

    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        onStatus?.(`Testing quality ${mid}...`);

        const blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob((b) => resolve(b), 'image/webp', mid / 100);
        });

        if (blob && blob.size <= targetBytes) {
            bestBlob = blob;
            bestQuality = mid;
            low = mid + 1; // Try higher quality
        } else {
            high = mid - 1; // Need lower quality
        }
    }

    if (bestBlob) {
        return { blob: bestBlob, quality: bestQuality };
    }

    // Couldn't meet target even at quality 1
    onStatus?.('⚠ Could not meet target size at quality 1');
    const fallback = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
            (blob) => blob ? resolve(blob) : reject(new Error('toBlob returned null')),
            'image/webp',
            0.01
        );
    });
    return { blob: fallback, quality: 1 };
}

/**
 * Encode a single zone canvas to WebP blob.
 */
async function encodeZone(
    canvas: HTMLCanvasElement,
    settings: ExportSettings,
    onStatus?: (msg: string) => void,
): Promise<{ blob: Blob; effectiveQuality?: number }> {
    switch (settings.qualityMode) {
        case 'lossless': {
            onStatus?.('Encoding lossless...');
            const blob = await encodeLossless(canvas);
            return { blob };
        }
        case 'filesize': {
            if (!settings.maxFilesizeKb) {
                throw new Error('maxFilesizeKb is required for filesize quality mode');
            }
            onStatus?.('Finding optimal quality for filesize target...');
            const result = await encodeWithFilesizeConstraint(canvas, settings.maxFilesizeKb, onStatus);
            return { blob: result.blob, effectiveQuality: result.quality };
        }
        case 'quality':
        default: {
            onStatus?.(`Encoding at quality ${settings.quality}...`);
            const blob = await new Promise<Blob>((resolve, reject) => {
                canvas.toBlob(
                    (b) => b ? resolve(b) : reject(new Error('toBlob returned null')),
                    'image/webp',
                    settings.quality / 100
                );
            });
            return { blob, effectiveQuality: settings.quality };
        }
    }
}

/**
 * Trigger a single file download.
 */
function downloadSingleFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    try {
        const a = document.createElement('a');
        a.download = filename;
        a.href = url;
        a.click();
    } finally {
        setTimeout(() => URL.revokeObjectURL(url), 100);
    }
}

/**
 * Bundle multiple files into a ZIP and download.
 * JSZip is lazy-loaded to avoid upfront bundle cost.
 */
async function downloadAsZip(files: { name: string; blob: Blob }[]): Promise<void> {
    const mod = await import('jszip') as { default: new () => { file: (name: string, data: Blob) => void; generateAsync: (opts: { type: string }) => Promise<Blob> } };
    const zip = new mod.default();

    for (const file of files) {
        zip.file(file.name, file.blob);
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const date = new Date().toISOString().split('T')[0];
    downloadSingleFile(zipBlob, `export-${date}.zip`);
}

export function useMultiCropExport(): UseMultiCropExportReturn {
    const [isExporting, setIsExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null);

    const exportZones = useCallback(async (image: HTMLImageElement, zones: CropZone[]) => {
        if (zones.length === 0) return;

        setIsExporting(true);
        const exportedFiles: { name: string; blob: Blob }[] = [];

        try {
            for (let i = 0; i < zones.length; i++) {
                const zone = zones[i];

                setExportProgress({
                    currentZoneIndex: i,
                    totalZones: zones.length,
                    zoneLabel: zone.label,
                    status: 'Cropping...',
                    overallProgress: (i / zones.length) * 100,
                });

                // Step 1: Crop and resize using existing conversion pipeline
                const result = prepareImageForConversion({
                    image,
                    cropX: zone.rect.x,
                    cropY: zone.rect.y,
                    cropWidth: zone.rect.width,
                    cropHeight: zone.rect.height,
                    maxWidth: zone.exportSettings.maxWidth?.toString() ?? '',
                    maxHeight: zone.exportSettings.maxHeight?.toString() ?? '',
                    resamplingMethod: zone.exportSettings.resampling,
                });

                // Step 2: Encode based on quality mode
                const { blob, effectiveQuality } = await encodeZone(
                    result.canvas,
                    zone.exportSettings,
                    (status) => {
                        setExportProgress(prev => prev ? { ...prev, status } : null);
                    },
                );

                // Step 3: Generate filename
                const filename = generateFilename(
                    zone.label,
                    result.finalWidth,
                    result.finalHeight,
                    zone.exportSettings,
                    effectiveQuality,
                );

                exportedFiles.push({ name: filename, blob });

                setExportProgress({
                    currentZoneIndex: i,
                    totalZones: zones.length,
                    zoneLabel: zone.label,
                    status: `✓ ${filename} (${(blob.size / 1024).toFixed(1)} KB)`,
                    overallProgress: ((i + 1) / zones.length) * 100,
                });
            }

            // Step 4: Download
            if (exportedFiles.length === 1) {
                downloadSingleFile(exportedFiles[0].blob, exportedFiles[0].name);
            } else {
                setExportProgress(prev => prev ? { ...prev, status: 'Creating ZIP archive...' } : null);
                await downloadAsZip(exportedFiles);
            }
        } catch (error) {
            console.error('[MultiCropExport] Export failed:', error);
        } finally {
            setIsExporting(false);
            setExportProgress(null);
        }
    }, []);

    return {
        isExporting,
        exportProgress,
        exportZones,
    };
}
