import { useState, useCallback, useMemo } from 'react';
import type { CropZone, CropBounds, ExportSettings } from '../types';
import { DEFAULT_EXPORT_SETTINGS } from '../types';

export interface UseCropZonesReturn {
    zones: CropZone[];
    activeZoneId: string | null;
    activeZone: CropZone | null;
    addZone: (rect: CropBounds, presetName?: string | null, aspectRatio?: number | null, exportSettings?: Partial<ExportSettings>) => string;
    removeZone: (id: string) => void;
    selectZone: (id: string | null) => void;
    updateZoneRect: (id: string, rect: CropBounds) => void;
    updateZoneExportSettings: (id: string, settings: Partial<ExportSettings>) => void;
    updateZoneLabel: (id: string, label: string) => void;
    updateZonePreset: (id: string, presetName: string | null, aspectRatio: number | null, exportSettings?: Partial<ExportSettings>) => void;
    resetZones: () => void;
}

/**
 * Generate a unique label for a zone based on its preset name and existing zones.
 * - Single use of a preset → label = preset name
 * - Multiple zones with same preset → append " 1", " 2", etc.
 * - Freestyle (null preset) → "Crop 1", "Crop 2", etc.
 */
function generateLabel(presetName: string | null, existingZones: CropZone[], excludeId?: string): string {
    const filtered = excludeId
        ? existingZones.filter(z => z.id !== excludeId)
        : existingZones;

    if (!presetName) {
        // Freestyle: find next available "Crop N"
        const existingCropNumbers = filtered
            .filter(z => z.presetName === null)
            .map(z => {
                const match = z.label.match(/^Crop (\d+)$/);
                return match ? parseInt(match[1], 10) : 0;
            });
        const nextNum = existingCropNumbers.length === 0
            ? 1
            : Math.max(...existingCropNumbers) + 1;
        return `Crop ${nextNum}`;
    }

    // Count existing zones with the same preset
    const samePresetZones = filtered.filter(z => z.presetName === presetName);

    if (samePresetZones.length === 0) {
        return presetName;
    }

    // There are existing zones with this preset — need to number them
    // First, renumber the existing un-numbered zone if there's exactly one
    // (handled by the relabeling logic after addZone)
    const existingNumbers = samePresetZones
        .map(z => {
            const match = z.label.match(new RegExp(`^${escapeRegExp(presetName)} (\\d+)$`));
            return match ? parseInt(match[1], 10) : 0;
        })
        .filter(n => n > 0);

    const nextNum = existingNumbers.length === 0
        ? 2 // First duplicate gets " 2" (the original un-numbered one will become " 1")
        : Math.max(...existingNumbers) + 1;

    return `${presetName} ${nextNum}`;
}

function escapeRegExp(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Relabel all zones sharing a given preset to enforce naming convention:
 * - If only 1 zone uses the preset → label = preset name (no number)
 * - If 2+ zones use the preset → label = "preset 1", "preset 2", etc. (in creation order)
 */
function relabelZonesForPreset(zones: CropZone[], presetName: string | null): CropZone[] {
    if (!presetName) return zones; // Freestyle zones keep their "Crop N" labels

    const presetZoneIds = zones
        .filter(z => z.presetName === presetName)
        .map(z => z.id);

    if (presetZoneIds.length <= 1) {
        // Single zone with this preset — use plain preset name
        return zones.map(z =>
            z.presetName === presetName ? { ...z, label: presetName } : z
        );
    }

    // Multiple zones — number them in order
    let counter = 1;
    return zones.map(z => {
        if (z.presetName === presetName) {
            return { ...z, label: `${presetName} ${counter++}` };
        }
        return z;
    });
}

export function useCropZones(): UseCropZonesReturn {
    const [zones, setZones] = useState<CropZone[]>([]);
    const [activeZoneId, setActiveZoneId] = useState<string | null>(null);

    const activeZone = useMemo(
        () => zones.find(z => z.id === activeZoneId) ?? null,
        [zones, activeZoneId]
    );

    const addZone = useCallback((
        rect: CropBounds,
        presetName: string | null = null,
        aspectRatio: number | null = null,
        exportSettings?: Partial<ExportSettings>,
    ): string => {
        const id = crypto.randomUUID();
        const mergedSettings: ExportSettings = {
            ...DEFAULT_EXPORT_SETTINGS,
            ...exportSettings,
        };

        let newZones: CropZone[] = [];

        setZones(prev => {
            const label = generateLabel(presetName, prev);
            const newZone: CropZone = {
                id,
                label,
                presetName,
                rect,
                aspectRatio,
                exportSettings: mergedSettings,
            };

            newZones = relabelZonesForPreset([...prev, newZone], presetName);
            return newZones;
        });

        setActiveZoneId(id);
        return id;
    }, []);

    const removeZone = useCallback((id: string) => {
        setZones(prev => {
            const zone = prev.find(z => z.id === id);
            const filtered = prev.filter(z => z.id !== id);
            if (zone?.presetName) {
                return relabelZonesForPreset(filtered, zone.presetName);
            }
            return filtered;
        });

        setActiveZoneId(prev => prev === id ? null : prev);
    }, []);

    const selectZone = useCallback((id: string | null) => {
        setActiveZoneId(id);
    }, []);

    const updateZoneRect = useCallback((id: string, rect: CropBounds) => {
        setZones(prev => prev.map(z => z.id === id ? { ...z, rect } : z));
    }, []);

    const updateZoneExportSettings = useCallback((id: string, settings: Partial<ExportSettings>) => {
        setZones(prev => prev.map(z =>
            z.id === id
                ? { ...z, exportSettings: { ...z.exportSettings, ...settings } }
                : z
        ));
    }, []);

    const updateZoneLabel = useCallback((id: string, label: string) => {
        setZones(prev => prev.map(z => z.id === id ? { ...z, label } : z));
    }, []);

    const updateZonePreset = useCallback((
        id: string,
        presetName: string | null,
        aspectRatio: number | null,
        exportSettings?: Partial<ExportSettings>,
    ) => {
        setZones(prev => {
            const oldZone = prev.find(z => z.id === id);
            const oldPresetName = oldZone?.presetName ?? null;

            let updated = prev.map(z => {
                if (z.id !== id) return z;
                const label = generateLabel(presetName, prev, id);
                return {
                    ...z,
                    presetName,
                    aspectRatio,
                    label,
                    exportSettings: exportSettings
                        ? { ...z.exportSettings, ...exportSettings }
                        : z.exportSettings,
                };
            });

            // Relabel zones for both old and new presets
            if (oldPresetName) {
                updated = relabelZonesForPreset(updated, oldPresetName);
            }
            if (presetName) {
                updated = relabelZonesForPreset(updated, presetName);
            }

            return updated;
        });
    }, []);

    const resetZones = useCallback(() => {
        setZones([]);
        setActiveZoneId(null);
    }, []);

    return {
        zones,
        activeZoneId,
        activeZone,
        addZone,
        removeZone,
        selectZone,
        updateZoneRect,
        updateZoneExportSettings,
        updateZoneLabel,
        updateZonePreset,
        resetZones,
    };
}
