import type { CropZone, ExportSettings, QualityMode } from '../../types';
import type { ResamplingMethod } from '../../types';
import { DEFAULT_EXPORT_SETTINGS } from '../../types';
import { getZoneColor } from '../../constants/cropZoneColors';

interface CropZoneCardProps {
    zone: CropZone;
    index: number;
    isActive: boolean;
    onSelect: (id: string) => void;
    onRemove: (id: string) => void;
    onLabelChange: (id: string, label: string) => void;
    onExportSettingsChange: (id: string, settings: Partial<ExportSettings>) => void;
}

export default function CropZoneCard({
    zone,
    index,
    isActive,
    onSelect,
    onRemove,
    onLabelChange,
    onExportSettingsChange,
}: CropZoneCardProps) {
    const color = getZoneColor(index);

    return (
        <div
            className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${isActive
                    ? 'border-amber-400 bg-gray-700'
                    : 'border-gray-600 bg-gray-750 hover:border-gray-500'
                }`}
            onClick={() => onSelect(zone.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect(zone.id);
                }
            }}
        >
            {/* Header: Color swatch + label + delete */}
            <div className="flex items-center gap-2 mb-2">
                <div
                    className="w-4 h-4 rounded-full border border-gray-500 flex-shrink-0"
                    style={{ backgroundColor: color }}
                    aria-label={`Zone color: ${color}`}
                />
                <input
                    type="text"
                    value={zone.label}
                    onChange={(e) => onLabelChange(zone.id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 bg-transparent text-sm text-gray-200 border-b border-transparent hover:border-gray-500 focus:border-amber-400 focus:outline-none px-1"
                />
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove(zone.id);
                    }}
                    className="text-gray-500 hover:text-red-400 transition-colors text-sm p-1"
                    aria-label={`Remove ${zone.label}`}
                >
                    ✕
                </button>
            </div>

            {/* Dimensions display */}
            <div className="text-xs text-gray-400 mb-2">
                {Math.round(zone.rect.width)} × {Math.round(zone.rect.height)} px
                {zone.presetName && <span className="ml-2 text-gray-500">({zone.presetName})</span>}
            </div>

            {/* Export settings (collapsible, only shown when active) */}
            {isActive && (
                <div className="mt-2 pt-2 border-t border-gray-600 space-y-2" onClick={(e) => e.stopPropagation()}>
                    {/* Resampling */}
                    <div className="flex items-center justify-between">
                        <label className="text-xs text-gray-400">Resampling</label>
                        <select
                            value={zone.exportSettings.resampling}
                            onChange={(e) => onExportSettingsChange(zone.id, {
                                resampling: e.target.value as ResamplingMethod,
                            })}
                            className="bg-gray-600 text-xs text-gray-200 rounded px-2 py-1 border border-gray-500"
                        >
                            <option value="lanczos">Lanczos</option>
                            <option value="bicubic">Bicubic</option>
                            <option value="bilinear">Bilinear</option>
                            <option value="nearest">Nearest</option>
                            <option value="browser">Browser</option>
                        </select>
                    </div>

                    {/* Quality Mode */}
                    <div className="flex items-center justify-between">
                        <label className="text-xs text-gray-400">Mode</label>
                        <div className="flex gap-1">
                            {(['quality', 'filesize', 'lossless'] as QualityMode[]).map(mode => (
                                <button
                                    key={mode}
                                    onClick={() => onExportSettingsChange(zone.id, { qualityMode: mode })}
                                    className={`text-xs px-2 py-1 rounded ${zone.exportSettings.qualityMode === mode
                                            ? 'bg-amber-500 text-gray-900'
                                            : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                        }`}
                                >
                                    {mode === 'quality' ? 'Quality' : mode === 'filesize' ? 'Filesize' : 'Lossless'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quality slider (shown when mode = quality) */}
                    {zone.exportSettings.qualityMode === 'quality' && (
                        <div className="flex items-center gap-2">
                            <label className="text-xs text-gray-400 w-16">Quality</label>
                            <input
                                type="range"
                                min={1}
                                max={100}
                                value={zone.exportSettings.quality}
                                onChange={(e) => onExportSettingsChange(zone.id, {
                                    quality: parseInt(e.target.value),
                                })}
                                className="flex-1"
                            />
                            <span className="text-xs text-gray-300 w-8 text-right">{zone.exportSettings.quality}</span>
                        </div>
                    )}

                    {/* Filesize input (shown when mode = filesize) */}
                    {zone.exportSettings.qualityMode === 'filesize' && (
                        <div className="flex items-center gap-2">
                            <label className="text-xs text-gray-400 w-16">Max KB</label>
                            <input
                                type="number"
                                min={1}
                                value={zone.exportSettings.maxFilesizeKb ?? 1024}
                                onChange={(e) => onExportSettingsChange(zone.id, {
                                    maxFilesizeKb: parseInt(e.target.value) || 1024,
                                })}
                                className="flex-1 bg-gray-600 text-xs text-gray-200 rounded px-2 py-1 border border-gray-500"
                            />
                        </div>
                    )}

                    {/* Max dimensions */}
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-400 w-16">Max W</label>
                        <input
                            type="number"
                            min={1}
                            placeholder="None"
                            value={zone.exportSettings.maxWidth ?? ''}
                            onChange={(e) => onExportSettingsChange(zone.id, {
                                maxWidth: e.target.value ? parseInt(e.target.value) : null,
                            })}
                            className="flex-1 bg-gray-600 text-xs text-gray-200 rounded px-2 py-1 border border-gray-500"
                        />
                        <label className="text-xs text-gray-400 w-8">Max H</label>
                        <input
                            type="number"
                            min={1}
                            placeholder="None"
                            value={zone.exportSettings.maxHeight ?? ''}
                            onChange={(e) => onExportSettingsChange(zone.id, {
                                maxHeight: e.target.value ? parseInt(e.target.value) : null,
                            })}
                            className="flex-1 bg-gray-600 text-xs text-gray-200 rounded px-2 py-1 border border-gray-500"
                        />
                    </div>

                    {/* Override badge */}
                    {JSON.stringify(zone.exportSettings) !== JSON.stringify(DEFAULT_EXPORT_SETTINGS) && (
                        <div className="text-xs text-amber-400 flex items-center gap-1">
                            <span>⚙</span> Custom export settings
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
