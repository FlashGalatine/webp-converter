/**
 * Canvas component for image display and cropping
 */

import { useRef, useEffect, type MouseEvent as ReactMouseEvent } from 'react';
import {
  clearCanvas,
  drawImage,
  drawCropOverlay,
  drawCropBorder,
  drawRuleOfThirdsGrid,
  drawCropHandles,
  getCropHandlePositions,
} from '../../utils/canvas';
import type { CursorStyle } from '../../types';

export interface CanvasProps {
  /** Canvas width */
  width: number;
  /** Canvas height */
  height: number;
  /** Image to display */
  image: HTMLImageElement | null;
  /** Zoom level */
  zoomLevel: number;
  /** Pan offset X */
  panX: number;
  /** Pan offset Y */
  panY: number;
  /** Crop X in image coordinates */
  cropX: number;
  /** Crop Y in image coordinates */
  cropY: number;
  /** Crop width in image coordinates */
  cropWidth: number;
  /** Crop height in image coordinates */
  cropHeight: number;
  /** Current cursor style */
  cursorStyle: CursorStyle;
  /** Whether currently dragging */
  isDragging: boolean;
  /** Mouse down handler */
  onMouseDown?: (e: ReactMouseEvent<HTMLCanvasElement>) => void;
  /** Mouse move handler */
  onMouseMove?: (e: ReactMouseEvent<HTMLCanvasElement>) => void;
  /** Mouse up handler */
  onMouseUp?: (e: ReactMouseEvent<HTMLCanvasElement>) => void;
  /** Mouse leave handler */
  onMouseLeave?: (e: ReactMouseEvent<HTMLCanvasElement>) => void;
  /** Wheel handler for zoom */
  onWheel?: (e: WheelEvent) => void;
}

/**
 * Canvas component for displaying and editing images
 */
export function Canvas({
  width,
  height,
  image,
  zoomLevel,
  panX,
  panY,
  cropX,
  cropY,
  cropWidth,
  cropHeight,
  cursorStyle,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onMouseLeave,
  onWheel,
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /**
   * Draw canvas content
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    clearCanvas(ctx, width, height);

    // Calculate display dimensions
    const displayWidth = image.width * zoomLevel;
    const displayHeight = image.height * zoomLevel;

    // Calculate image position (centered + pan)
    const imgX = (width - displayWidth) / 2 + panX;
    const imgY = (height - displayHeight) / 2 + panY;

    // Draw image
    drawImage(ctx, image, imgX, imgY, displayWidth, displayHeight);

    // Draw crop overlay if crop area has been initialized
    if (cropWidth > 0 && cropHeight > 0) {
      // Calculate crop coordinates in display space
      const cropDisplayX = imgX + cropX * zoomLevel;
      const cropDisplayY = imgY + cropY * zoomLevel;
      const cropDisplayWidth = cropWidth * zoomLevel;
      const cropDisplayHeight = cropHeight * zoomLevel;

      // Draw darkened overlay outside crop
      drawCropOverlay(
        ctx,
        width,
        height,
        cropDisplayX,
        cropDisplayY,
        cropDisplayWidth,
        cropDisplayHeight
      );

      // Draw crop border
      drawCropBorder(
        ctx,
        cropDisplayX,
        cropDisplayY,
        cropDisplayWidth,
        cropDisplayHeight
      );

      // Draw rule of thirds grid
      drawRuleOfThirdsGrid(
        ctx,
        cropDisplayX,
        cropDisplayY,
        cropDisplayWidth,
        cropDisplayHeight
      );

      // Draw resize handles
      const handlePositions = getCropHandlePositions(
        cropDisplayX,
        cropDisplayY,
        cropDisplayWidth,
        cropDisplayHeight
      );
      drawCropHandles(ctx, handlePositions);
    }
  }, [
    width,
    height,
    image,
    zoomLevel,
    panX,
    panY,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
  ]);

  /**
   * Attach wheel event listener
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !onWheel) return;

    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', onWheel);
  }, [onWheel]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="border border-gray-700 rounded cursor-default bg-gray-800"
      style={{ cursor: cursorStyle }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      aria-label={
        image
          ? `Image canvas: ${Math.round(cropWidth)}x${Math.round(cropHeight)}px crop area, ${zoomLevel.toFixed(2)}x zoom`
          : 'Empty canvas'
      }
    />
  );
}
