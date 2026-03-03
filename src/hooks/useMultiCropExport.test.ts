import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMultiCropExport } from './useMultiCropExport';
import type { CropZone } from '../types';
import { DEFAULT_EXPORT_SETTINGS } from '../types';

// Mock the conversion utility
vi.mock('../utils/imageProcessing/conversion', () => ({
    prepareImageForConversion: vi.fn(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(0, 0, 100, 100);
        return {
            canvas,
            finalWidth: 100,
            finalHeight: 100,
            needsResampling: false,
        };
    }),
}));

// Mock URL.createObjectURL / revokeObjectURL (jsdom doesn't have them)
const mockCreateObjectURL = vi.fn(() => 'blob:mock-url');
const mockRevokeObjectURL = vi.fn();

function makeZone(overrides: Partial<CropZone> = {}): CropZone {
    return {
        id: crypto.randomUUID(),
        label: 'Test Zone',
        presetName: null,
        rect: { x: 0, y: 0, width: 100, height: 100 },
        aspectRatio: null,
        exportSettings: { ...DEFAULT_EXPORT_SETTINGS },
        ...overrides,
    };
}

function makeImage(): HTMLImageElement {
    const img = new Image();
    Object.defineProperty(img, 'width', { value: 1920 });
    Object.defineProperty(img, 'height', { value: 1080 });
    return img;
}

describe('useMultiCropExport', () => {
    let mockClickFn: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        // Setup DOM mocks
        URL.createObjectURL = mockCreateObjectURL;
        URL.revokeObjectURL = mockRevokeObjectURL;
        mockClickFn = vi.fn();
        vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
            if (tag === 'a') {
                return { click: mockClickFn, download: '', href: '' } as unknown as HTMLAnchorElement;
            }
            if (tag === 'canvas') {
                // Use real canvas creation for offscreen canvas needs
                return Object.getPrototypeOf(document).createElement.call(document, tag);
            }
            return Object.getPrototypeOf(document).createElement.call(document, tag);
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('initial state', () => {
        it('starts with isExporting false and no progress', () => {
            const { result } = renderHook(() => useMultiCropExport());
            expect(result.current.isExporting).toBe(false);
            expect(result.current.exportProgress).toBeNull();
        });
    });

    describe('exportZones', () => {
        it('does nothing with empty zones array', async () => {
            const { result } = renderHook(() => useMultiCropExport());
            const image = makeImage();

            await act(async () => {
                await result.current.exportZones(image, []);
            });

            expect(result.current.isExporting).toBe(false);
            expect(mockClickFn).not.toHaveBeenCalled();
        });

        it('exports a single zone as direct download (no ZIP)', async () => {
            const { result } = renderHook(() => useMultiCropExport());
            const image = makeImage();
            const zone = makeZone({ label: 'Instagram Portrait' });

            await act(async () => {
                await result.current.exportZones(image, [zone]);
            });

            expect(result.current.isExporting).toBe(false);
            expect(mockClickFn).toHaveBeenCalledTimes(1);
        });

        it('generates correct filename for quality mode', async () => {
            const { result } = renderHook(() => useMultiCropExport());
            const image = makeImage();
            const zone = makeZone({
                label: 'FullHD',
                exportSettings: {
                    ...DEFAULT_EXPORT_SETTINGS,
                    quality: 95,
                    qualityMode: 'quality',
                },
            });

            await act(async () => {
                await result.current.exportZones(image, [zone]);
            });

            // Since we mock prepareImageForConversion to return 100x100 canvas,
            // the filename should be: FullHD-100x100px-q95.webp
            expect(mockClickFn).toHaveBeenCalledTimes(1);
        });

        it('generates correct filename for filesize mode', async () => {
            const { result } = renderHook(() => useMultiCropExport());
            const image = makeImage();
            const zone = makeZone({
                label: 'Discord Thumb',
                exportSettings: {
                    ...DEFAULT_EXPORT_SETTINGS,
                    qualityMode: 'filesize',
                    maxFilesizeKb: 1024,
                },
            });

            await act(async () => {
                await result.current.exportZones(image, [zone]);
            });

            expect(mockClickFn).toHaveBeenCalledTimes(1);
        });

        it('generates correct filename for lossless mode', async () => {
            const { result } = renderHook(() => useMultiCropExport());
            const image = makeImage();
            const zone = makeZone({
                label: 'Archival',
                exportSettings: {
                    ...DEFAULT_EXPORT_SETTINGS,
                    qualityMode: 'lossless',
                },
            });

            await act(async () => {
                await result.current.exportZones(image, [zone]);
            });

            expect(mockClickFn).toHaveBeenCalledTimes(1);
        });

        it('resets state after export completes', async () => {
            const { result } = renderHook(() => useMultiCropExport());
            const image = makeImage();
            const zone = makeZone();

            await act(async () => {
                await result.current.exportZones(image, [zone]);
            });

            expect(result.current.isExporting).toBe(false);
            expect(result.current.exportProgress).toBeNull();
        });
    });
});
