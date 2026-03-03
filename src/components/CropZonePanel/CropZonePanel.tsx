import type { CropZone, ExportSettings } from '../../types';
import CropZoneCard from './CropZoneCard';

interface CropZonePanelProps {
    zones: CropZone[];
    activeZoneId: string | null;
    presetOptions: { name: string; ratio: number | null }[];
    isExporting: boolean;
    exportProgress: { zoneLabel: string; status: string; overallProgress: number } | null;
    onSelectZone: (id: string | null) => void;
    onRemoveZone: (id: string) => void;
    onUpdateLabel: (id: string, label: string) => void;
    onUpdateExportSettings: (id: string, settings: Partial<ExportSettings>) => void;
    onAddZoneWithPreset: (presetName: string | null, ratio: number | null) => void;
    onExportAll: () => void;
}

export default function CropZonePanel({
    zones,
    activeZoneId,
    presetOptions,
    isExporting,
    exportProgress,
    onSelectZone,
    onRemoveZone,
    onUpdateLabel,
    onUpdateExportSettings,
    onAddZoneWithPreset,
    onExportAll,
}: CropZonePanelProps) {
    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-300">
                    Crop Zones ({zones.length})
                </h3>
            </div>

            {/* Add zone dropdown */}
            <div className="flex gap-2">
                <select
                    id="add-zone-preset"
                    onChange={(e) => {
                        const value = e.target.value;
                        if (!value) return;
                        if (value === '__freestyle__') {
                            onAddZoneWithPreset(null, null);
                        } else {
                            const option = presetOptions.find(p => p.name === value);
                            if (option) {
                                onAddZoneWithPreset(option.name, option.ratio);
                            }
                        }
                        e.target.value = ''; // reset dropdown
                    }}
                    className="flex-1 bg-gray-700 text-sm text-gray-200 rounded px-3 py-2 border border-gray-600"
                    defaultValue=""
                >
                    <option value="" disabled>+ Add zone...</option>
                    <option value="__freestyle__">Freestyle (no constraint)</option>
                    {presetOptions.map(p => (
                        <option key={p.name} value={p.name}>{p.name}</option>
                    ))}
                </select>
            </div>

            {/* Zone list */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {zones.map((zone, index) => (
                    <CropZoneCard
                        key={zone.id}
                        zone={zone}
                        index={index}
                        isActive={zone.id === activeZoneId}
                        onSelect={onSelectZone}
                        onRemove={onRemoveZone}
                        onLabelChange={onUpdateLabel}
                        onExportSettingsChange={onUpdateExportSettings}
                    />
                ))}
            </div>

            {zones.length === 0 && (
                <p className="text-xs text-gray-500 text-center py-4">
                    No crop zones yet. Select a preset above to add one.
                </p>
            )}

            {/* Export button */}
            {zones.length > 0 && (
                <button
                    onClick={onExportAll}
                    disabled={isExporting}
                    className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-gray-900 font-semibold py-2 px-4 rounded transition-colors"
                >
                    {isExporting
                        ? `Exporting... (${exportProgress?.overallProgress?.toFixed(0) ?? 0}%)`
                        : zones.length === 1
                            ? 'Export Zone'
                            : `Export All (${zones.length} zones)`
                    }
                </button>
            )}

            {/* Export progress */}
            {exportProgress && (
                <div className="text-xs text-gray-400 space-y-1">
                    <div className="flex justify-between">
                        <span>{exportProgress.zoneLabel}</span>
                    </div>
                    <div className="text-gray-500">{exportProgress.status}</div>
                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div
                            className="bg-amber-400 h-1.5 rounded-full transition-all"
                            style={{ width: `${exportProgress.overallProgress}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
