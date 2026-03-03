import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ZOOM_INITIAL_DELAY, TRANSITION_DELAY } from '../../constants/canvas';
import { ASPECT_RATIO_TOLERANCE } from '../../constants/processing';
import { loadImageFromFile, createFileFromBlob } from '../../utils/files/loaders';
import { useCanvas } from '../../hooks/useCanvas';
import { useCropZones } from '../../hooks/useCropZones';
import { useImageQueue } from '../../hooks/useImageQueue';
import { usePresets } from '../../hooks/usePresets';
import { useMultiCropExport } from '../../hooks/useMultiCropExport';
import Canvas from '../Canvas/Canvas';
import Controls from '../Controls/Controls';
import QueuePanel from '../Queue/QueuePanel';
import Toolbar from '../Toolbar/Toolbar';
import CropZonePanel from '../CropZonePanel/CropZonePanel';
import type { ExportSettings } from '../../types';

export default function WebPConverter() {
  // Image state
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string>("16:9 Landscape");
  const lastPresetRef = useRef<string>("16:9 Landscape");
  const lastUseCustomPresetsRef = useRef<boolean>(false);
  const isDraggingRef = useRef<boolean>(false);
  const blockPresetResetRef = useRef<boolean>(false);



  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const presetFileInputRef = useRef<HTMLInputElement>(null);

  // Hooks
  const cropZones = useCropZones();
  const canvas = useCanvas(image, {
    zones: cropZones.zones,
    activeZoneId: cropZones.activeZoneId,
    onSelectZone: cropZones.selectZone,
    onUpdateZoneRect: cropZones.updateZoneRect,
  });
  const presets = usePresets();
  const multiCropExport = useMultiCropExport();

  // Build preset options for the CropZonePanel dropdown
  const presetOptions = useMemo(() => {
    const currentPresets = presets.getCurrentPresets() as Record<string, number | null>;
    return Object.entries(currentPresets).map(([name, ratio]) => ({
      name,
      ratio,
    }));
  }, [presets]);

  // Load image function
  const loadImage = useCallback(async (file: File, skipAutoPreset = false) => {
    try {
      const { image: img } = await loadImageFromFile(file);
      setImage(img);
      cropZones.resetZones();

      // Auto-select preset based on image dimensions
      let presetToUse = selectedPreset;
      if (!skipAutoPreset && presets.useCustomPresets && presets.customPresetsRaw) {
        const imgAspectRatio = img.width / img.height;
        let targetSelection: 'Square' | 'Landscape' | 'Portrait' | null = null;

        if (Math.abs(imgAspectRatio - 1) < ASPECT_RATIO_TOLERANCE) {
          targetSelection = 'Square';
        } else if (imgAspectRatio > 1) {
          targetSelection = 'Landscape';
        } else {
          targetSelection = 'Portrait';
        }

        for (const [name, config] of Object.entries(presets.customPresetsRaw)) {
          if (config['default-selection'] === targetSelection) {
            presetToUse = name;
            setSelectedPreset(name);
            break;
          }
        }
      }

      // Create initial crop zone covering the full image  
      const currentPresets = presets.getCurrentPresets();
      const ratio = (currentPresets as Record<string, number | null>)[presetToUse] ?? null;

      // Calculate initial crop bounds
      let cropX = 0, cropY = 0, cropW = img.width, cropH = img.height;
      if (ratio && ratio > 0) {
        const imgRatio = img.width / img.height;
        if (ratio > imgRatio) {
          cropW = img.width;
          cropH = img.width / ratio;
        } else {
          cropH = img.height;
          cropW = img.height * ratio;
        }
        cropX = (img.width - cropW) / 2;
        cropY = (img.height - cropH) / 2;
      }

      // Apply preset export settings
      const presetSettings = presets.applyPresetSettings(presetToUse);
      const exportSettings: Partial<ExportSettings> = {
        maxWidth: presetSettings.maxWidth ? parseInt(presetSettings.maxWidth) : null,
        maxHeight: presetSettings.maxHeight ? parseInt(presetSettings.maxHeight) : null,
      };

      if (presetSettings.resampling) {
        exportSettings.resampling = presetSettings.resampling;
      }

      if (presetSettings.webOptimize) {
        exportSettings.qualityMode = 'filesize';
        exportSettings.maxFilesizeKb = parseFloat(presetSettings.targetSize) * 1024;
      } else if (presetSettings.lossless) {
        exportSettings.qualityMode = 'lossless';
      }

      cropZones.addZone(
        { x: cropX, y: cropY, width: cropW, height: cropH },
        presetToUse,
        ratio,
        exportSettings,
      );
    } catch (error) {
      console.error('[Error] Failed to load image:', error);
      alert(error instanceof Error ? error.message : 'Failed to load image');
    }
  }, [selectedPreset, presets, cropZones]);

  // Image queue hook
  const imageQueue = useImageQueue(loadImage);

  // Ref to track timeout ID for cleanup
  const blockPresetResetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Update dragging ref when dragging state changes
  useEffect(() => {
    const wasDragging = isDraggingRef.current;
    isDraggingRef.current = canvas.isDragging;

    if (wasDragging && !canvas.isDragging) {
      blockPresetResetRef.current = true;
      if (blockPresetResetTimeoutRef.current) {
        clearTimeout(blockPresetResetTimeoutRef.current);
      }
      blockPresetResetTimeoutRef.current = setTimeout(() => {
        blockPresetResetRef.current = false;
        blockPresetResetTimeoutRef.current = null;
      }, 100);
    }

    return () => {
      if (blockPresetResetTimeoutRef.current) {
        clearTimeout(blockPresetResetTimeoutRef.current);
      }
    };
  }, [canvas.isDragging]);

  // Handle preset change
  useEffect(() => {
    const presetChanged = selectedPreset !== lastPresetRef.current;
    const customPresetsChanged = presets.useCustomPresets !== lastUseCustomPresetsRef.current;

    if (!presetChanged && !customPresetsChanged) return;

    if (isDraggingRef.current || blockPresetResetRef.current) {
      lastPresetRef.current = selectedPreset;
      lastUseCustomPresetsRef.current = presets.useCustomPresets;
      return;
    }

    // Update the active zone's aspect ratio if there's an active zone
    if (cropZones.activeZone && image) {
      const currentPresets = presets.getCurrentPresets();
      const ratio = (currentPresets as Record<string, number | null>)[selectedPreset] ?? null;

      // Recalculate crop bounds for new aspect ratio
      let cropX = 0, cropY = 0, cropW = image.width, cropH = image.height;
      if (ratio && ratio > 0) {
        const imgRatio = image.width / image.height;
        if (ratio > imgRatio) {
          cropW = image.width;
          cropH = image.width / ratio;
        } else {
          cropH = image.height;
          cropW = image.height * ratio;
        }
        cropX = (image.width - cropW) / 2;
        cropY = (image.height - cropH) / 2;
      }

      cropZones.updateZoneRect(cropZones.activeZone.id, {
        x: cropX, y: cropY, width: cropW, height: cropH,
      });
      cropZones.updateZonePreset(cropZones.activeZone.id, selectedPreset, ratio);

      // Apply preset settings to the active zone's export settings
      const settings = presets.applyPresetSettings(selectedPreset);
      const zoneExportSettings: Partial<ExportSettings> = {
        maxWidth: settings.maxWidth ? parseInt(settings.maxWidth) : null,
        maxHeight: settings.maxHeight ? parseInt(settings.maxHeight) : null,
      };
      if (settings.resampling) {
        zoneExportSettings.resampling = settings.resampling;
      }
      if (settings.webOptimize) {
        zoneExportSettings.qualityMode = 'filesize';
        zoneExportSettings.maxFilesizeKb = parseFloat(settings.targetSize) * 1024;
      } else if (settings.lossless) {
        zoneExportSettings.qualityMode = 'lossless';
      }
      cropZones.updateZoneExportSettings(cropZones.activeZone.id, zoneExportSettings);
    }

    lastPresetRef.current = selectedPreset;
    lastUseCustomPresetsRef.current = presets.useCustomPresets;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPreset, presets.useCustomPresets]);

  // Auto zoom to fit when image loads
  useEffect(() => {
    if (!image || !canvas.canvasWidth || !canvas.canvasHeight) return;

    const timer = setTimeout(() => {
      if (image.width && image.height && canvas.canvasWidth && canvas.canvasHeight) {
        canvas.handleZoomToFit();
      }
    }, ZOOM_INITIAL_DELAY);

    return () => clearTimeout(timer);
  }, [image, canvas.canvasWidth, canvas.canvasHeight, canvas.handleZoomToFit]);

  // File upload handlers
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (files.length === 1) {
        loadImage(files[0]);
      } else {
        imageQueue.addImagesToQueue(files);
      }
    }
  }, [loadImage, imageQueue]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      if (files.length === 1 && files[0].type.startsWith('image/')) {
        loadImage(files[0]);
      } else {
        imageQueue.addImagesToQueue(files);
      }
    }
  }, [loadImage, imageQueue]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // Clipboard paste handler
  const handlePaste = useCallback(async (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        try {
          const blob = item.getAsFile();
          if (blob) {
            const file = createFileFromBlob(blob);
            if (imageQueue.imageQueue.length > 0) {
              const dataTransfer = new DataTransfer();
              dataTransfer.items.add(file);
              imageQueue.addImagesToQueue(dataTransfer.files);
            } else {
              loadImage(file);
            }
          }
        } catch (error) {
          console.error('[Paste] Error processing clipboard image:', error);
        }
        break;
      }
    }
  }, [imageQueue, loadImage]);

  useEffect(() => {
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          canvas.handleZoomIn();
        } else if (e.key === '-') {
          e.preventDefault();
          canvas.handleZoomOut();
        } else if (e.key === '0') {
          e.preventDefault();
          canvas.handleZoomReset();
        } else if (e.key === 'f' || e.key === 'F') {
          e.preventDefault();
          canvas.handleZoomToFit();
        }
        return;
      }

      // Zone shortcuts (only when not typing in an input)
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA') return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (cropZones.activeZoneId) {
          e.preventDefault();
          cropZones.removeZone(cropZones.activeZoneId);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cropZones.selectZone(null);
      } else if (e.key === 'Tab') {
        if (cropZones.zones.length > 0) {
          e.preventDefault();
          const currentIndex = cropZones.zones.findIndex(z => z.id === cropZones.activeZoneId);
          if (e.shiftKey) {
            // Previous zone
            const prevIndex = currentIndex <= 0 ? cropZones.zones.length - 1 : currentIndex - 1;
            cropZones.selectZone(cropZones.zones[prevIndex].id);
          } else {
            // Next zone
            const nextIndex = currentIndex >= cropZones.zones.length - 1 ? 0 : currentIndex + 1;
            cropZones.selectZone(cropZones.zones[nextIndex].id);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canvas, cropZones]);

  // Helper function to handle post-conversion queue operations
  const handlePostConversionQueue = useCallback(() => {
    if (imageQueue.currentImageIndex >= 0 && imageQueue.imageQueue.length > 0) {
      const indexToProcess = imageQueue.currentImageIndex;

      if (imageQueue.removeAfterConvert) {
        setTimeout(() => {
          imageQueue.removeImageFromQueue(indexToProcess, loadImage);
        }, TRANSITION_DELAY);
      } else {
        imageQueue.markImageAsProcessed();
        setTimeout(() => {
          if (indexToProcess < imageQueue.imageQueue.length - 1) {
            imageQueue.loadNextImage();
          }
        }, TRANSITION_DELAY);
      }
    }
  }, [imageQueue, loadImage]);



  // Multi-crop export handler
  const handleExportAll = useCallback(async () => {
    if (!image || cropZones.zones.length === 0) return;
    await multiCropExport.exportZones(image, cropZones.zones);
    handlePostConversionQueue();
  }, [image, cropZones.zones, multiCropExport, handlePostConversionQueue]);

  // Add zone with preset from CropZonePanel
  const handleAddZoneWithPreset = useCallback((presetName: string | null, ratio: number | null) => {
    if (!image) return;

    // Calculate initial crop bounds for the new zone
    let cropX = 0, cropY = 0, cropW = image.width, cropH = image.height;
    if (ratio && ratio > 0) {
      const imgRatio = image.width / image.height;
      if (ratio > imgRatio) {
        cropW = image.width;
        cropH = image.width / ratio;
      } else {
        cropH = image.height;
        cropW = image.height * ratio;
      }
      cropX = (image.width - cropW) / 2;
      cropY = (image.height - cropH) / 2;
    }

    // Get export settings from preset
    let exportSettings: Partial<ExportSettings> = {};
    if (presetName) {
      const settings = presets.applyPresetSettings(presetName);
      exportSettings = {
        maxWidth: settings.maxWidth ? parseInt(settings.maxWidth) : null,
        maxHeight: settings.maxHeight ? parseInt(settings.maxHeight) : null,
      };
      if (settings.resampling) {
        exportSettings.resampling = settings.resampling;
      }
      if (settings.webOptimize) {
        exportSettings.qualityMode = 'filesize';
        exportSettings.maxFilesizeKb = parseFloat(settings.targetSize) * 1024;
      } else if (settings.lossless) {
        exportSettings.qualityMode = 'lossless';
      }
    }

    cropZones.addZone(
      { x: cropX, y: cropY, width: cropW, height: cropH },
      presetName,
      ratio,
      exportSettings,
    );
  }, [image, presets, cropZones]);



  // Preset file handler
  const handlePresetFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      presets.loadCustomPresets(e.target.files[0]);
    }
  }, [presets]);

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* Left Panel - Controls */}
      <div className="w-80 bg-gray-800 p-4 overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-amber-400">WebP Converter</h1>
          <a href="https://github.com/FlashGalatine/webp-converter" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:text-blue-300 mt-2 inline-flex items-center gap-1">
            <span>GitHub Repository</span>
            <span>↗</span>
          </a>
        </div>

        <Toolbar
          fileInputRef={fileInputRef}
          presetFileInputRef={presetFileInputRef}
          onFileSelect={handleFileSelect}
          onPresetFileSelect={handlePresetFileSelect}
        />

        <QueuePanel
          imageQueue={imageQueue.imageQueue}
          currentImageIndex={imageQueue.currentImageIndex}
          processedImages={imageQueue.processedImages}
          removeAfterConvert={imageQueue.removeAfterConvert}
          onLoadImage={(index) => imageQueue.loadImageFromQueue(index, loadImage)}
          onRemoveImage={(index) => imageQueue.removeImageFromQueue(index, loadImage)}
          onClearQueue={() => {
            imageQueue.clearQueue();
            setImage(null);
            cropZones.resetZones();
          }}
          onPrevious={imageQueue.loadPreviousImage}
          onNext={imageQueue.loadNextImage}
          onToggleRemoveAfterConvert={imageQueue.setRemoveAfterConvert}
        />

        {/* Crop Zone Panel */}
        {image && (
          <div className="mb-4">
            <CropZonePanel
              zones={cropZones.zones}
              activeZoneId={cropZones.activeZoneId}
              presetOptions={presetOptions}
              isExporting={multiCropExport.isExporting}
              exportProgress={multiCropExport.exportProgress}
              onSelectZone={cropZones.selectZone}
              onRemoveZone={cropZones.removeZone}
              onUpdateLabel={cropZones.updateZoneLabel}
              onUpdateExportSettings={cropZones.updateZoneExportSettings}
              onAddZoneWithPreset={handleAddZoneWithPreset}
              onExportAll={handleExportAll}
            />
          </div>
        )}

        <Controls
          useCustomPresets={presets.useCustomPresets}
          customPresetsRaw={presets.customPresetsRaw}
          selectedPreset={selectedPreset}
          currentPresets={presets.currentPresets as Record<string, number | null>}
          onPresetChange={setSelectedPreset}
          onLoadCustomPresets={() => presetFileInputRef.current?.click()}
          onSwitchToBuiltIn={() => {
            const defaultPreset = presets.switchToBuiltIn();
            setSelectedPreset(defaultPreset);
          }}
          customPresetsFileName={presets.customPresetsFileName}
          isFreestyleMode={!cropZones.activeZone?.aspectRatio}
          onFreestyleModeChange={() => {
            // Toggle freestyle for active zone
            if (cropZones.activeZone) {
              const currentRatio = cropZones.activeZone.aspectRatio;
              cropZones.updateZonePreset(
                cropZones.activeZone.id,
                cropZones.activeZone.presetName,
                currentRatio ? null : 1, // toggle
              );
            }
          }}
          onZoomToFit={canvas.handleZoomToFit}
          onZoomIn={canvas.handleZoomIn}
          onZoomReset={canvas.handleZoomReset}
          onZoomOut={canvas.handleZoomOut}
          image={image}
          cropWidthDisplay={canvas.cropWidth}
          cropHeightDisplay={canvas.cropHeight}
          zoomLevel={canvas.zoomLevel}
        />

        {/* Attribution */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <div className="text-xs text-gray-500 text-center">
            <p className="mb-1">Created by <span className="text-gray-400 font-semibold">Flash Galatine</span></p>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              <a href="https://github.com/FlashGalatine" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">GitHub</a>
              <span className="text-gray-600">•</span>
              <a href="https://x.com/AsheJunius" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">X/Twitter</a>
              <span className="text-gray-600">•</span>
              <a href="https://www.twitch.tv/flashgalatine" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">Twitch</a>
              <span className="text-gray-600">•</span>
              <a href="https://discord.gg/5VUSKTZCe5" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">Discord</a>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-1">
              <a href="https://bsky.app/profile/projectgalatine.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">BlueSky</a>
              <span className="text-gray-600">•</span>
              <a href="https://www.patreon.com/ProjectGalatine" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">Patreon</a>
              <span className="text-gray-600">•</span>
              <a href="https://blog.projectgalatine.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">Blog</a>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Canvas */}
      <div
        ref={canvas.containerRef}
        className="flex-1 flex flex-col items-center justify-center bg-gray-900"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <Canvas
          canvasRef={canvas.canvasRef}
          canvasWidth={canvas.canvasWidth}
          canvasHeight={canvas.canvasHeight}
          cursorStyle={canvas.cursorStyle}
          image={image}
          zones={cropZones.zones}
          activeZoneId={cropZones.activeZoneId}
          zoomLevel={canvas.zoomLevel}
          onMouseDown={canvas.handleMouseDown}
          onMouseMove={canvas.handleMouseMove}
          onMouseUp={canvas.handleMouseUp}
          onMouseLeave={canvas.handleMouseLeave}
          onWheel={canvas.handleWheel}
        />

        {/* Image Navigation Buttons */}
        {image && (
          <div className="flex gap-2 mt-4 w-full px-4">
            <button
              onClick={imageQueue.loadPreviousImage}
              disabled={imageQueue.imageQueue.length === 0 || imageQueue.currentImageIndex <= 0 || multiCropExport.isExporting}
              className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white py-2 px-4 rounded"
            >
              ← Previous
            </button>
            <button
              onClick={imageQueue.loadNextImage}
              disabled={imageQueue.imageQueue.length === 0 || imageQueue.currentImageIndex >= imageQueue.imageQueue.length - 1 || multiCropExport.isExporting}
              className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white py-2 px-4 rounded"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
