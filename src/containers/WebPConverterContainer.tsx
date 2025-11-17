/**
 * WebP Converter Container Component
 *
 * Orchestrates all hooks and event handlers for the WebP Converter application.
 */

import { useRef, useEffect, useCallback, type ChangeEvent, type MouseEvent } from 'react';
import {
  useImageState,
  useCanvasState,
  useCropState,
  useQueueState,
  usePresetState,
  useConversionSettings,
  useCanvasInteraction,
  useClipboard,
} from '../hooks';
import { Canvas, Toolbar, Presets, Controls, Queue, Button } from '../components';
import {
  getCursorPosition,
  detectCropHandle,
  isInsideCropArea,
  calculateCropResize,
} from '../utils/canvas';
import {
  applyDimensionConstraints,
  createCroppedCanvas,
  optimizeQualityForSize,
  convertCanvasToWebP,
  needsResampling,
  parseFileSizeToBytes,
} from '../utils/imageProcessing';
import { resampleImage } from '../utils/imageProcessing';
import { loadCustomPresetsFromJSON } from '../utils/presets';
import { downloadImageBlob } from '../utils/files';
import { CURSOR_MAP, CANVAS_PADDING, ZOOM_MIN, ZOOM_MAX } from '../constants';
import type { HandlePosition } from '../types';

const ZOOM_STEP = 0.1;
const ZOOM_INITIAL_DELAY = 100;

/**
 * Main WebP Converter Container
 */
export function WebPConverterContainer() {
  // Hooks
  const imageState = useImageState();
  const canvasState = useCanvasState(1200, 800);
  const cropState = useCropState();
  const queueState = useQueueState();
  const presetState = usePresetState('16:9 Landscape');
  const conversionSettings = useConversionSettings();
  const interaction = useCanvasInteraction();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ========================================
  // Image Loading Handlers
  // ========================================

  const handleFileSelect = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      if (files.length === 1) {
        // Single file - load directly
        try {
          const loadedImage = await imageState.loadImage(files[0]);

          // Initialize crop based on current preset
          const aspectRatio = presetState.getSelectedAspectRatio();
          cropState.initializeCrop(
            loadedImage.width,
            loadedImage.height,
            aspectRatio
          );

          // Auto zoom to fit
          setTimeout(() => {
            const zoomX =
              (canvasState.canvasWidth - CANVAS_PADDING) / loadedImage.width;
            const zoomY =
              (canvasState.canvasHeight - CANVAS_PADDING) / loadedImage.height;
            const newZoom = Math.min(zoomX, zoomY);
            canvasState.setZoom(Math.max(ZOOM_MIN, Math.min(newZoom, ZOOM_MAX)));
            canvasState.setPan(0, 0);
          }, ZOOM_INITIAL_DELAY);
        } catch (error) {
          console.error('[Error] Failed to load image:', error);
          alert('Failed to load image. Please try again.');
        }
      } else {
        // Multiple files - add to queue
        queueState.addToQueue(Array.from(files));
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [
      imageState,
      cropState,
      presetState,
      queueState,
      canvasState.canvasWidth,
      canvasState.canvasHeight,
    ]
  );

  const handleLoadImage = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Clipboard paste handler
  useClipboard({
    enabled: true,
    onImagePasted: async (file: File) => {
      if (queueState.imageQueue.length > 0) {
        // Add to queue if queue has items
        queueState.addToQueue([file]);
      } else {
        // Load directly if no queue
        try {
          const loadedImage = await imageState.loadImage(file);
          const aspectRatio = presetState.getSelectedAspectRatio();
          cropState.initializeCrop(
            loadedImage.width,
            loadedImage.height,
            aspectRatio
          );
        } catch (error) {
          console.error('[Clipboard] Failed to load pasted image:', error);
        }
      }
    },
  });

  // ========================================
  // Canvas Interaction Handlers
  // ========================================

  const handleCanvasMouseDown = useCallback(
    (e: MouseEvent<HTMLCanvasElement>) => {
      if (!imageState.image) return;

      const canvas = e.currentTarget;
      const pos = getCursorPosition(e.nativeEvent, canvas);

      // Detect what was clicked
      const handle = detectCropHandle(
        pos.x,
        pos.y,
        cropState.cropX,
        cropState.cropY,
        cropState.cropWidth,
        cropState.cropHeight,
        imageState.image.width,
        imageState.image.height,
        canvasState.canvasWidth,
        canvasState.canvasHeight,
        canvasState.zoomLevel,
        canvasState.panX,
        canvasState.panY
      );

      if (handle) {
        // Start resizing crop
        interaction.startDrag(
          `resize-${handle}` as any,
          pos,
          {
            x: cropState.cropX,
            y: cropState.cropY,
            width: cropState.cropWidth,
            height: cropState.cropHeight,
          },
          { x: canvasState.panX, y: canvasState.panY }
        );
      } else if (
        isInsideCropArea(
          pos.x,
          pos.y,
          cropState.cropX,
          cropState.cropY,
          cropState.cropWidth,
          cropState.cropHeight,
          imageState.image.width,
          imageState.image.height,
          canvasState.canvasWidth,
          canvasState.canvasHeight,
          canvasState.zoomLevel,
          canvasState.panX,
          canvasState.panY
        )
      ) {
        // Start moving crop
        interaction.startDrag(
          'move',
          pos,
          {
            x: cropState.cropX,
            y: cropState.cropY,
            width: cropState.cropWidth,
            height: cropState.cropHeight,
          },
          { x: canvasState.panX, y: canvasState.panY }
        );
      } else {
        // Start panning
        interaction.startDrag(
          'pan',
          pos,
          {
            x: cropState.cropX,
            y: cropState.cropY,
            width: cropState.cropWidth,
            height: cropState.cropHeight,
          },
          { x: canvasState.panX, y: canvasState.panY }
        );
      }
    },
    [imageState.image, cropState, canvasState, interaction]
  );

  const handleCanvasMouseMove = useCallback(
    (e: MouseEvent<HTMLCanvasElement>) => {
      if (!imageState.image) return;

      const canvas = e.currentTarget;
      const pos = getCursorPosition(e.nativeEvent, canvas);

      if (!interaction.isDragging) {
        // Update cursor based on hover
        const handle = detectCropHandle(
          pos.x,
          pos.y,
          cropState.cropX,
          cropState.cropY,
          cropState.cropWidth,
          cropState.cropHeight,
          imageState.image.width,
          imageState.image.height,
          canvasState.canvasWidth,
          canvasState.canvasHeight,
          canvasState.zoomLevel,
          canvasState.panX,
          canvasState.panY
        );

        if (handle) {
          interaction.setCursor(CURSOR_MAP[handle as HandlePosition]);
        } else if (
          isInsideCropArea(
            pos.x,
            pos.y,
            cropState.cropX,
            cropState.cropY,
            cropState.cropWidth,
            cropState.cropHeight,
            imageState.image.width,
            imageState.image.height,
            canvasState.canvasWidth,
            canvasState.canvasHeight,
            canvasState.zoomLevel,
            canvasState.panX,
            canvasState.panY
          )
        ) {
          interaction.setCursor('move');
        } else {
          interaction.setCursor('default');
        }
      } else {
        // Handle drag
        const deltaX = pos.x - interaction.dragStartState.canvasX;
        const deltaY = pos.y - interaction.dragStartState.canvasY;

        if (interaction.dragType === 'pan') {
          canvasState.setPan(
            interaction.dragStartState.panX + deltaX,
            interaction.dragStartState.panY + deltaY
          );
        } else if (interaction.dragType === 'move') {
          const deltaImgX = deltaX / canvasState.zoomLevel;
          const deltaImgY = deltaY / canvasState.zoomLevel;

          let newX = interaction.dragStartState.cropX + deltaImgX;
          let newY = interaction.dragStartState.cropY + deltaImgY;

          // Clamp to image bounds
          newX = Math.max(
            0,
            Math.min(newX, imageState.image.width - cropState.cropWidth)
          );
          newY = Math.max(
            0,
            Math.min(newY, imageState.image.height - cropState.cropHeight)
          );

          cropState.updateCropPosition(newX, newY);
        } else if (interaction.dragType?.startsWith('resize-')) {
          // Handle resize
          const handle = interaction.dragType.replace('resize-', '') as HandlePosition;
          const deltaImgX = deltaX / canvasState.zoomLevel;
          const deltaImgY = deltaY / canvasState.zoomLevel;

          const result = calculateCropResize({
            cropX: interaction.dragStartState.cropX,
            cropY: interaction.dragStartState.cropY,
            cropWidth: interaction.dragStartState.cropWidth,
            cropHeight: interaction.dragStartState.cropHeight,
            deltaX: deltaImgX,
            deltaY: deltaImgY,
            handle,
            aspectRatio: cropState.isFreestyleMode ? null : cropState.aspectRatio,
            imageWidth: imageState.image.width,
            imageHeight: imageState.image.height,
          });

          cropState.setCropArea(result.x, result.y, result.width, result.height);
        }
      }
    },
    [imageState.image, cropState, canvasState, interaction]
  );

  const handleCanvasMouseUp = useCallback(() => {
    interaction.endDrag();
  }, [interaction]);

  const handleCanvasMouseLeave = useCallback(() => {
    interaction.endDrag();
    interaction.resetCursor();
  }, [interaction]);

  const handleCanvasWheel = useCallback(
    (e: WheelEvent) => {
      if (!imageState.image) return;

      e.preventDefault();
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      canvasState.adjustZoom(delta);
    },
    [imageState.image, canvasState]
  );

  // ========================================
  // Zoom Handlers
  // ========================================

  const handleZoomIn = useCallback(() => {
    canvasState.adjustZoom(ZOOM_STEP);
  }, [canvasState]);

  const handleZoomOut = useCallback(() => {
    canvasState.adjustZoom(-ZOOM_STEP);
  }, [canvasState]);

  const handleZoomReset = useCallback(() => {
    canvasState.setZoom(1);
  }, [canvasState]);

  const handleZoomToFit = useCallback(() => {
    if (!imageState.image) return;

    const zoomX = (canvasState.canvasWidth - CANVAS_PADDING) / imageState.image.width;
    const zoomY =
      (canvasState.canvasHeight - CANVAS_PADDING) / imageState.image.height;
    const newZoom = Math.min(zoomX, zoomY);
    canvasState.setZoom(Math.max(ZOOM_MIN, Math.min(newZoom, ZOOM_MAX)));
    canvasState.setPan(0, 0);
  }, [imageState.image, canvasState]);

  // ========================================
  // Preset Handlers
  // ========================================

  const handlePresetChange = useCallback(
    (presetName: string) => {
      presetState.selectPreset(presetName);

      if (imageState.image) {
        const aspectRatio = presetState.currentPresets[presetName];
        cropState.setAspectRatio(aspectRatio);
        cropState.initializeCrop(
          imageState.image.width,
          imageState.image.height,
          aspectRatio
        );
      }
    },
    [presetState, imageState.image, cropState]
  );

  const handleCustomPresetFileSelect = useCallback(
    async (file: File) => {
      try {
        // Read file as text
        const text = await file.text();
        const result = loadCustomPresetsFromJSON(text);

        if (!result.validation.valid) {
          alert(`Invalid preset file: ${result.validation.error}`);
          return;
        }

        if (!result.presets || !result.raw) {
          alert('Failed to parse presets');
          return;
        }

        presetState.loadCustomPresets(result.presets, result.raw, file.name);

        // Select first preset
        const presetNames = Object.keys(result.presets);
        if (presetNames.length > 0) {
          handlePresetChange(presetNames[0]);
        }
      } catch (error) {
        console.error('[Presets] Failed to load custom presets:', error);
        alert('Failed to load custom presets. Please check the file format.');
      }
    },
    [presetState, handlePresetChange]
  );

  const handleClearCustomPresets = useCallback(() => {
    presetState.clearCustomPresets();
    handlePresetChange('16:9 Landscape');
  }, [presetState, handlePresetChange]);

  const handleToggleFreestyle = useCallback(() => {
    cropState.toggleFreestyle();
  }, [cropState]);

  // ========================================
  // Conversion Handler
  // ========================================

  const handleConvert = useCallback(async () => {
    if (!imageState.image) return;

    conversionSettings.setOptimizationState(true, 0, 'Cropping image...');

    try {
      // Create cropped canvas
      const croppedCanvas = createCroppedCanvas(
        imageState.image,
        cropState.cropX,
        cropState.cropY,
        cropState.cropWidth,
        cropState.cropHeight
      );

      // Apply dimension constraints
      const constraints = {
        maxWidth: conversionSettings.maxWidth
          ? parseInt(conversionSettings.maxWidth)
          : null,
        maxHeight: conversionSettings.maxHeight
          ? parseInt(conversionSettings.maxHeight)
          : null,
      };

      const finalDimensions = applyDimensionConstraints(
        cropState.cropWidth,
        cropState.cropHeight,
        constraints
      );

      // Resample if needed
      let finalCanvas = croppedCanvas;
      if (
        needsResampling(
          cropState.cropWidth,
          cropState.cropHeight,
          finalDimensions.width,
          finalDimensions.height
        )
      ) {
        conversionSettings.setOptimizationState(
          true,
          0,
          `Resampling with ${conversionSettings.resamplingMethod}...`
        );

        finalCanvas = resampleImage(
          croppedCanvas,
          finalDimensions.width,
          finalDimensions.height,
          conversionSettings.resamplingMethod
        );
      }

      // Convert based on settings
      if (conversionSettings.webOptimize && !conversionSettings.lossless) {
        // Web optimization
        const targetSizeBytes = parseFileSizeToBytes(
          parseFloat(conversionSettings.targetSize),
          'MB'
        );

        const result = await optimizeQualityForSize(
          finalCanvas,
          targetSizeBytes,
          (quality, current, total) => {
            const progress = (current / total) * 100;
            conversionSettings.setOptimizationState(
              true,
              progress,
              `Testing quality ${quality}... (${current}/${total})`
            );
          }
        );

        conversionSettings.setOptimizationState(
          true,
          100,
          result.metTargetSize
            ? `✓ Quality ${result.quality} achieves target`
            : '⚠ Could not meet target size'
        );

        // Download
        await new Promise((resolve) => setTimeout(resolve, 800));
        downloadImageBlob(
          result.blob,
          finalCanvas.width,
          finalCanvas.height,
          typeof result.quality === 'number' ? result.quality : 'LL'
        );
      } else {
        // Standard conversion
        conversionSettings.setOptimizationState(true, 50, 'Converting to WebP...');

        const quality = conversionSettings.lossless
          ? 'lossless'
          : conversionSettings.quality;

        const blob = await convertCanvasToWebP(finalCanvas, quality);

        conversionSettings.setOptimizationState(true, 100, 'Complete!');

        // Download
        await new Promise((resolve) => setTimeout(resolve, 500));
        downloadImageBlob(
          blob,
          finalCanvas.width,
          finalCanvas.height,
          conversionSettings.lossless ? 'LL' : conversionSettings.quality
        );
      }

      // Handle queue after conversion
      if (queueState.currentImageIndex >= 0) {
        queueState.markAsProcessed();

        setTimeout(() => {
          if (queueState.removeAfterConvert) {
            queueState.removeFromQueue(queueState.currentImageIndex);
          } else if (queueState.canGoNext) {
            const nextItem = queueState.goToNext();
            if (nextItem) {
              imageState.loadImage(nextItem.file);
            }
          }
        }, 500);
      }
    } catch (error) {
      console.error('[Conversion] Error:', error);
      alert('Conversion failed. Please try again.');
    } finally {
      conversionSettings.setOptimizationState(false, 0, '');
    }
  }, [imageState, cropState, conversionSettings, queueState]);

  // ========================================
  // Queue Handlers
  // ========================================

  const handleQueueNavigateToIndex = useCallback(
    (index: number) => {
      const item = queueState.loadFromQueue(index);
      if (item) {
        imageState.loadImage(item.file);
      }
    },
    [queueState, imageState]
  );

  const handleQueueNext = useCallback(() => {
    const nextItem = queueState.goToNext();
    if (nextItem) {
      imageState.loadImage(nextItem.file);
    }
  }, [queueState, imageState]);

  const handleQueuePrevious = useCallback(() => {
    const prevItem = queueState.goToPrevious();
    if (prevItem) {
      imageState.loadImage(prevItem.file);
    }
  }, [queueState, imageState]);

  const handleQueueRemove = useCallback(
    (index: number) => {
      queueState.removeFromQueue(index);
    },
    [queueState]
  );

  const handleQueueClear = useCallback(() => {
    queueState.clearQueue();
    imageState.clearImage();
  }, [queueState, imageState]);

  // ========================================
  // Keyboard Shortcuts
  // ========================================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if not typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === '=' || e.key === '+') {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === '-') {
        e.preventDefault();
        handleZoomOut();
      } else if (e.key === '0') {
        e.preventDefault();
        handleZoomReset();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        handleZoomToFit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleZoomIn, handleZoomOut, handleZoomReset, handleZoomToFit]);

  // ========================================
  // Render
  // ========================================

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">WebP Converter</h1>
          <p className="text-lg text-gray-600">
            Vite + TypeScript + React (v3.0.0-alpha)
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Keyboard shortcuts: +/- (zoom), 0 (reset), F (fit)
          </p>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" role="main">
          {/* Left Column - Canvas & Toolbar */}
          <div className="lg:col-span-2 space-y-4">
            <Toolbar
              zoomLevel={canvasState.zoomLevel}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onZoomToFit={handleZoomToFit}
              onZoomReset={handleZoomReset}
              hasImage={imageState.hasImage}
            />

            <Canvas
              width={canvasState.canvasWidth}
              height={canvasState.canvasHeight}
              image={imageState.image}
              zoomLevel={canvasState.zoomLevel}
              panX={canvasState.panX}
              panY={canvasState.panY}
              cropX={cropState.cropX}
              cropY={cropState.cropY}
              cropWidth={cropState.cropWidth}
              cropHeight={cropState.cropHeight}
              cursorStyle={interaction.cursorStyle}
              isDragging={interaction.isDragging}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseLeave}
              onWheel={handleCanvasWheel}
            />

            <div className="flex gap-2">
              <Button variant="primary" fullWidth onClick={handleLoadImage}>
                📁 Load Image
              </Button>
              <Button variant="secondary" fullWidth disabled>
                📋 Paste (Ctrl+V)
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileSelect}
              aria-label="Select image files"
            />
          </div>

          {/* Right Column - Controls */}
          <div className="space-y-6">
            <Presets
              presetNames={presetState.getPresetNames()}
              selectedPreset={presetState.selectedPreset}
              useCustomPresets={presetState.useCustomPresets}
              customPresetsFileName={presetState.customPresetsFileName}
              isFreestyleMode={cropState.isFreestyleMode}
              onPresetChange={handlePresetChange}
              onCustomPresetFileSelect={handleCustomPresetFileSelect}
              onClearCustomPresets={handleClearCustomPresets}
              onToggleFreestyle={handleToggleFreestyle}
            />

            <Controls
              quality={conversionSettings.quality}
              lossless={conversionSettings.lossless}
              maxWidth={conversionSettings.maxWidth}
              maxHeight={conversionSettings.maxHeight}
              webOptimize={conversionSettings.webOptimize}
              targetSize={conversionSettings.targetSize}
              resamplingMethod={conversionSettings.resamplingMethod}
              isOptimizing={conversionSettings.isOptimizing}
              optimizingProgress={conversionSettings.optimizingProgress}
              optimizingStatus={conversionSettings.optimizingStatus}
              hasImage={imageState.hasImage}
              onQualityChange={conversionSettings.setQuality}
              onLosslessToggle={conversionSettings.toggleLossless}
              onMaxWidthChange={conversionSettings.setMaxWidth}
              onMaxHeightChange={conversionSettings.setMaxHeight}
              onWebOptimizeToggle={conversionSettings.toggleWebOptimize}
              onTargetSizeChange={conversionSettings.setTargetSize}
              onResamplingMethodChange={conversionSettings.setResamplingMethod}
              onConvert={handleConvert}
            />

            {queueState.imageQueue.length > 0 && (
              <Queue
                queue={queueState.imageQueue}
                currentIndex={queueState.currentImageIndex}
                processedImages={queueState.processedImages}
                removeAfterConvert={queueState.removeAfterConvert}
                canGoNext={queueState.canGoNext}
                canGoPrevious={queueState.canGoPrevious}
                onNavigateToIndex={handleQueueNavigateToIndex}
                onNext={handleQueueNext}
                onPrevious={handleQueuePrevious}
                onRemove={handleQueueRemove}
                onClear={handleQueueClear}
                onToggleRemoveAfterConvert={queueState.toggleRemoveAfterConvert}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-6 text-center text-sm text-gray-500">
          <p>
            Legacy builds available in{' '}
            <code className="bg-gray-100 px-2 py-1 rounded">legacy/</code> directory
          </p>
        </footer>
      </div>
    </div>
  );
}
