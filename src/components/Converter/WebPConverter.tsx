import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { BUILT_IN_PRESETS } from '../../constants/presets';
import { ZOOM_INITIAL_DELAY, TRANSITION_DELAY } from '../../constants/canvas';
import { ASPECT_RATIO_TOLERANCE } from '../../constants/processing';
import { loadImageFromFile, createFileFromBlob } from '../../utils/files/loaders';
import { useCanvas } from '../../hooks/useCanvas';
import { useImageQueue } from '../../hooks/useImageQueue';
import { usePresets } from '../../hooks/usePresets';
import { useImageProcessing } from '../../hooks/useImageProcessing';
import Canvas from '../Canvas/Canvas';
import Controls from '../Controls/Controls';
import QueuePanel from '../Queue/QueuePanel';
import Toolbar from '../Toolbar/Toolbar';
import type { ResamplingMethod, ImageQueueItem } from '../../types';

export default function WebPConverter() {
  // Image state
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string>("16:9 Landscape");

  // Settings state
  const [quality, setQuality] = useState(95);
  const [lossless, setLossless] = useState(false);
  const [maxWidth, setMaxWidth] = useState('');
  const [maxHeight, setMaxHeight] = useState('');
  const [linkDimensions, setLinkDimensions] = useState(true);
  const [webOptimize, setWebOptimize] = useState(false);
  const [targetSize, setTargetSize] = useState('10');
  const [resamplingMethod, setResamplingMethod] = useState<ResamplingMethod>('bicubic');

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const presetFileInputRef = useRef<HTMLInputElement>(null);

  // Hooks
  const canvas = useCanvas(image);
  const presets = usePresets();
  const imageProcessing = useImageProcessing();

  // Load image function
  const loadImage = useCallback(async (file: File, skipAutoPreset = false) => {
    try {
      const { image: img } = await loadImageFromFile(file);
      setImage(img);

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

      // Initialize crop to full image
      const currentPresets = presets.getCurrentPresets();
      const ratio = (currentPresets as Record<string, number | null>)[presetToUse] ?? null;
      canvas.initializeCrop(img.width, img.height, ratio);

      // Auto zoom to fit on load
      setTimeout(() => {
        if (canvas.canvasWidth && canvas.canvasHeight) {
          const zoomX = (canvas.canvasWidth - 40) / img.width;
          const zoomY = (canvas.canvasHeight - 40) / img.height;
          const newZoom = Math.min(zoomX, zoomY);
          canvas.handleZoomToFit();
        }
      }, ZOOM_INITIAL_DELAY);
    } catch (error) {
      console.error('[Error] Failed to load image:', error);
      alert(error instanceof Error ? error.message : 'Failed to load image');
    }
  }, [selectedPreset, presets, canvas]);

  // Image queue hook
  const imageQueue = useImageQueue(loadImage);

  // Handle preset change
  useEffect(() => {
    const currentPresets = presets.getCurrentPresets();
    const ratio = (currentPresets as Record<string, number | null>)[selectedPreset] ?? null;
    canvas.setAspectRatio(ratio);
    if (image) {
      canvas.initializeCrop(image.width, image.height, ratio);
    }

    // Apply preset-specific settings
    const settings = presets.applyPresetSettings(selectedPreset);
    setMaxWidth(settings.maxWidth);
    setMaxHeight(settings.maxHeight);
    setTargetSize(settings.targetSize);
    setWebOptimize(settings.webOptimize);
  }, [selectedPreset, presets.useCustomPresets, image, presets, canvas]);

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
              // Create a FileList-like object for addImagesToQueue
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

  // Clipboard paste handler
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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canvas]);

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

  // Convert handler
  const handleConvert = useCallback(async () => {
    if (!image) return;

    await imageProcessing.handleConvert({
      image,
      cropX: canvas.cropX,
      cropY: canvas.cropY,
      cropWidth: canvas.cropWidth,
      cropHeight: canvas.cropHeight,
      maxWidth,
      maxHeight,
      resamplingMethod,
      quality,
      lossless,
      webOptimize,
      targetSize,
      onComplete: handlePostConversionQueue
    });
  }, [image, canvas, maxWidth, maxHeight, resamplingMethod, quality, lossless, webOptimize, targetSize, imageProcessing, handlePostConversionQueue]);

  // Calculate final output dimensions for display
  const finalOutputDimensions = useMemo(() => {
    if (!maxWidth && !maxHeight) return null;
    let finalW = canvas.cropWidth;
    let finalH = canvas.cropHeight;
    const maxW = maxWidth ? parseInt(maxWidth) : null;
    const maxH = maxHeight ? parseInt(maxHeight) : null;

    if (maxW && finalW > maxW && finalW > 0) {
      const ratio = maxW / finalW;
      finalW = maxW;
      finalH = finalH * ratio;
    }
    if (maxH && finalH > maxH && finalH > 0) {
      const ratio = maxH / finalH;
      finalH = maxH;
      finalW = finalW * ratio;
    }

    return { width: Math.round(finalW), height: Math.round(finalH) };
  }, [canvas.cropWidth, canvas.cropHeight, maxWidth, maxHeight]);

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
          onDrop={handleDrop}
          onDragOver={handleDragOver}
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
          }}
          onPrevious={imageQueue.loadPreviousImage}
          onNext={imageQueue.loadNextImage}
          onToggleRemoveAfterConvert={imageQueue.setRemoveAfterConvert}
        />

        <Controls
          useCustomPresets={presets.useCustomPresets}
          customPresetsRaw={presets.customPresetsRaw}
          selectedPreset={selectedPreset}
          currentPresets={presets.currentPresets as Record<string, number | null>}
          onPresetChange={setSelectedPreset}
          onLoadCustomPresets={() => presetFileInputRef.current?.click()}
          onSwitchToBuiltIn={presets.switchToBuiltIn}
          customPresetsFileName={presets.customPresetsFileName}
          isFreestyleMode={canvas.isFreestyleMode}
          onFreestyleModeChange={canvas.setIsFreestyleMode}
          quality={quality}
          lossless={lossless}
          onQualityChange={setQuality}
          onLosslessChange={setLossless}
          webOptimize={webOptimize}
          targetSize={targetSize}
          onWebOptimizeChange={setWebOptimize}
          onTargetSizeChange={setTargetSize}
          maxWidth={maxWidth}
          maxHeight={maxHeight}
          linkDimensions={linkDimensions}
          isFreestyleModeActive={canvas.isFreestyleMode}
          cropWidth={canvas.cropWidth}
          cropHeight={canvas.cropHeight}
          onMaxWidthChange={setMaxWidth}
          onMaxHeightChange={setMaxHeight}
          onLinkDimensionsToggle={() => setLinkDimensions(!linkDimensions)}
          resamplingMethod={resamplingMethod}
          onResamplingMethodChange={setResamplingMethod}
          onZoomToFit={canvas.handleZoomToFit}
          onZoomIn={canvas.handleZoomIn}
          onZoomReset={canvas.handleZoomReset}
          onZoomOut={canvas.handleZoomOut}
          image={image}
          cropWidthDisplay={canvas.cropWidth}
          cropHeightDisplay={canvas.cropHeight}
          zoomLevel={canvas.zoomLevel}
          finalOutputDimensions={finalOutputDimensions}
          onConvert={handleConvert}
          isOptimizing={imageProcessing.isOptimizing}
          imageQueueLength={imageQueue.imageQueue.length}
          currentImageIndex={imageQueue.currentImageIndex}
          processedImagesCount={imageQueue.processedImages.size}
          remainingCount={imageQueue.imageQueue.length - imageQueue.processedImages.size}
          isCurrentProcessed={imageQueue.processedImages.has(imageQueue.currentImageIndex)}
          optimizingProgress={imageProcessing.optimizingProgress}
          optimizingStatus={imageProcessing.optimizingStatus}
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
          cropWidth={canvas.cropWidth}
          cropHeight={canvas.cropHeight}
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
              disabled={imageQueue.imageQueue.length === 0 || imageQueue.currentImageIndex <= 0 || imageProcessing.isOptimizing}
              className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white py-2 px-4 rounded"
            >
              ← Previous
            </button>
            <button
              onClick={imageQueue.loadNextImage}
              disabled={imageQueue.imageQueue.length === 0 || imageQueue.currentImageIndex >= imageQueue.imageQueue.length - 1 || imageProcessing.isOptimizing}
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
