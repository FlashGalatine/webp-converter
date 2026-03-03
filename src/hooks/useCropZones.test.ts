import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCropZones } from './useCropZones';
import type { CropBounds } from '../types';

const makeRect = (x = 0, y = 0, width = 100, height = 100): CropBounds => ({
    x, y, width, height,
});

describe('useCropZones', () => {
    describe('initial state', () => {
        it('starts with empty zones and no active zone', () => {
            const { result } = renderHook(() => useCropZones());
            expect(result.current.zones).toEqual([]);
            expect(result.current.activeZoneId).toBeNull();
            expect(result.current.activeZone).toBeNull();
        });
    });

    describe('addZone', () => {
        it('adds a freestyle zone with auto-generated label', () => {
            const { result } = renderHook(() => useCropZones());

            act(() => {
                result.current.addZone(makeRect());
            });

            expect(result.current.zones).toHaveLength(1);
            expect(result.current.zones[0].label).toBe('Crop 1');
            expect(result.current.zones[0].presetName).toBeNull();
        });

        it('auto-selects the newly added zone', () => {
            const { result } = renderHook(() => useCropZones());

            let id: string = '';
            act(() => {
                id = result.current.addZone(makeRect());
            });

            expect(result.current.activeZoneId).toBe(id);
            expect(result.current.activeZone?.id).toBe(id);
        });

        it('adds a preset zone with the preset name as label', () => {
            const { result } = renderHook(() => useCropZones());

            act(() => {
                result.current.addZone(makeRect(), 'Instagram Portrait', 0.8);
            });

            expect(result.current.zones[0].label).toBe('Instagram Portrait');
            expect(result.current.zones[0].presetName).toBe('Instagram Portrait');
            expect(result.current.zones[0].aspectRatio).toBe(0.8);
        });

        it('numbers zones when duplicate presets are used', () => {
            const { result } = renderHook(() => useCropZones());

            act(() => {
                result.current.addZone(makeRect(), 'Instagram Portrait');
            });
            act(() => {
                result.current.addZone(makeRect(10, 10), 'Instagram Portrait');
            });

            expect(result.current.zones).toHaveLength(2);
            expect(result.current.zones[0].label).toBe('Instagram Portrait 1');
            expect(result.current.zones[1].label).toBe('Instagram Portrait 2');
        });

        it('numbers freestyle zones sequentially', () => {
            const { result } = renderHook(() => useCropZones());

            act(() => {
                result.current.addZone(makeRect());
            });
            act(() => {
                result.current.addZone(makeRect(10, 10));
            });

            expect(result.current.zones[0].label).toBe('Crop 1');
            expect(result.current.zones[1].label).toBe('Crop 2');
        });

        it('applies custom export settings merged with defaults', () => {
            const { result } = renderHook(() => useCropZones());

            act(() => {
                result.current.addZone(makeRect(), null, null, {
                    quality: 80,
                    maxWidth: 1920,
                });
            });

            const settings = result.current.zones[0].exportSettings;
            expect(settings.quality).toBe(80);
            expect(settings.maxWidth).toBe(1920);
            expect(settings.resampling).toBe('lanczos'); // default
            expect(settings.qualityMode).toBe('quality'); // default
        });
    });

    describe('removeZone', () => {
        it('removes a zone by id', () => {
            const { result } = renderHook(() => useCropZones());

            let id = '';
            act(() => {
                id = result.current.addZone(makeRect());
            });
            act(() => {
                result.current.removeZone(id);
            });

            expect(result.current.zones).toHaveLength(0);
        });

        it('clears activeZoneId when the active zone is removed', () => {
            const { result } = renderHook(() => useCropZones());

            let id = '';
            act(() => {
                id = result.current.addZone(makeRect());
            });
            act(() => {
                result.current.removeZone(id);
            });

            expect(result.current.activeZoneId).toBeNull();
        });

        it('preserves activeZoneId when a non-active zone is removed', () => {
            const { result } = renderHook(() => useCropZones());

            let id1 = '';
            let id2 = '';
            act(() => {
                id1 = result.current.addZone(makeRect());
            });
            act(() => {
                id2 = result.current.addZone(makeRect(10, 10));
            });
            // id2 is now active

            act(() => {
                result.current.removeZone(id1);
            });

            expect(result.current.activeZoneId).toBe(id2);
        });

        it('removes numbering when only one zone of a preset remains', () => {
            const { result } = renderHook(() => useCropZones());

            let id1 = '';
            act(() => {
                id1 = result.current.addZone(makeRect(), 'FullHD');
            });
            act(() => {
                result.current.addZone(makeRect(10, 10), 'FullHD');
            });

            // Both should be numbered
            expect(result.current.zones[0].label).toBe('FullHD 1');
            expect(result.current.zones[1].label).toBe('FullHD 2');

            act(() => {
                result.current.removeZone(id1);
            });

            // Only one left — should drop the number
            expect(result.current.zones).toHaveLength(1);
            expect(result.current.zones[0].label).toBe('FullHD');
        });
    });

    describe('selectZone', () => {
        it('selects a zone by id', () => {
            const { result } = renderHook(() => useCropZones());

            let id1 = '';
            act(() => {
                id1 = result.current.addZone(makeRect());
            });
            act(() => {
                result.current.addZone(makeRect(10, 10));
            });

            act(() => {
                result.current.selectZone(id1);
            });

            expect(result.current.activeZoneId).toBe(id1);
        });

        it('deselects all when null is passed', () => {
            const { result } = renderHook(() => useCropZones());

            act(() => {
                result.current.addZone(makeRect());
            });

            act(() => {
                result.current.selectZone(null);
            });

            expect(result.current.activeZoneId).toBeNull();
        });
    });

    describe('updateZoneRect', () => {
        it('updates the rect of a zone', () => {
            const { result } = renderHook(() => useCropZones());

            let id = '';
            act(() => {
                id = result.current.addZone(makeRect());
            });

            const newRect = makeRect(50, 50, 200, 200);
            act(() => {
                result.current.updateZoneRect(id, newRect);
            });

            expect(result.current.zones[0].rect).toEqual(newRect);
        });
    });

    describe('updateZoneExportSettings', () => {
        it('merges partial export settings', () => {
            const { result } = renderHook(() => useCropZones());

            let id = '';
            act(() => {
                id = result.current.addZone(makeRect());
            });

            act(() => {
                result.current.updateZoneExportSettings(id, {
                    qualityMode: 'lossless',
                });
            });

            expect(result.current.zones[0].exportSettings.qualityMode).toBe('lossless');
            expect(result.current.zones[0].exportSettings.resampling).toBe('lanczos'); // unchanged
        });
    });

    describe('updateZoneLabel', () => {
        it('allows manual label override', () => {
            const { result } = renderHook(() => useCropZones());

            let id = '';
            act(() => {
                id = result.current.addZone(makeRect(), 'Instagram Portrait');
            });

            act(() => {
                result.current.updateZoneLabel(id, 'My Custom Name');
            });

            expect(result.current.zones[0].label).toBe('My Custom Name');
        });
    });

    describe('updateZonePreset', () => {
        it('changes a zone preset and relabels correctly', () => {
            const { result } = renderHook(() => useCropZones());

            let id1 = '';
            act(() => {
                id1 = result.current.addZone(makeRect(), 'FullHD');
            });
            act(() => {
                result.current.addZone(makeRect(10, 10), 'FullHD');
            });

            // Both numbered
            expect(result.current.zones[0].label).toBe('FullHD 1');
            expect(result.current.zones[1].label).toBe('FullHD 2');

            // Change first zone to different preset
            act(() => {
                result.current.updateZonePreset(id1, 'Square', 1);
            });

            expect(result.current.zones[0].presetName).toBe('Square');
            expect(result.current.zones[0].label).toBe('Square');
            // Second zone should lose its number since it's now the only FullHD
            expect(result.current.zones[1].label).toBe('FullHD');
        });
    });

    describe('resetZones', () => {
        it('clears all zones and active selection', () => {
            const { result } = renderHook(() => useCropZones());

            act(() => {
                result.current.addZone(makeRect());
            });
            act(() => {
                result.current.addZone(makeRect(10, 10));
            });

            act(() => {
                result.current.resetZones();
            });

            expect(result.current.zones).toEqual([]);
            expect(result.current.activeZoneId).toBeNull();
        });
    });

    describe('activeZone computed value', () => {
        it('returns the active zone object', () => {
            const { result } = renderHook(() => useCropZones());

            act(() => {
                result.current.addZone(makeRect(), 'Instagram Portrait', 0.8);
            });

            expect(result.current.activeZone).not.toBeNull();
            expect(result.current.activeZone?.presetName).toBe('Instagram Portrait');
        });

        it('returns null when no zone is selected', () => {
            const { result } = renderHook(() => useCropZones());

            act(() => {
                result.current.addZone(makeRect());
            });
            act(() => {
                result.current.selectZone(null);
            });

            expect(result.current.activeZone).toBeNull();
        });
    });
});
