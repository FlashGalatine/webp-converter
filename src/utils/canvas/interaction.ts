/**
 * Canvas interaction utilities
 */

import type { HandlePosition, Point, HandleBounds } from '../../types';
import { CROP_HANDLE_SIZE, HANDLE_TOLERANCE } from '../../constants';
import { getCropDisplayBounds } from './coordinates';

/**
 * Detects which crop handle is at the given canvas position
 *
 * @param canvasX - X coordinate in canvas space
 * @param canvasY - Y coordinate in canvas space
 * @param cropX - Crop X in image coordinates
 * @param cropY - Crop Y in image coordinates
 * @param cropWidth - Crop width
 * @param cropHeight - Crop height
 * @param imageWidth - Image width
 * @param imageHeight - Image height
 * @param canvasWidth - Canvas width
 * @param canvasHeight - Canvas height
 * @param zoomLevel - Zoom level
 * @param panX - Pan X offset
 * @param panY - Pan Y offset
 * @returns Handle position or null if no handle detected
 */
export function detectCropHandle(
  canvasX: number,
  canvasY: number,
  cropX: number,
  cropY: number,
  cropWidth: number,
  cropHeight: number,
  imageWidth: number,
  imageHeight: number,
  canvasWidth: number,
  canvasHeight: number,
  zoomLevel: number,
  panX: number,
  panY: number
): HandlePosition | null {
  if (cropWidth <= 0 || cropHeight <= 0) {
    return null;
  }

  const crop = getCropDisplayBounds(
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    imageWidth,
    imageHeight,
    canvasWidth,
    canvasHeight,
    { zoomLevel, panX, panY }
  );

  // Define handle positions
  const handles: Record<HandlePosition, Point> = {
    nw: { x: crop.x, y: crop.y },
    n: { x: crop.x + crop.width / 2, y: crop.y },
    ne: { x: crop.x + crop.width, y: crop.y },
    e: { x: crop.x + crop.width, y: crop.y + crop.height / 2 },
    se: { x: crop.x + crop.width, y: crop.y + crop.height },
    s: { x: crop.x + crop.width / 2, y: crop.y + crop.height },
    sw: { x: crop.x, y: crop.y + crop.height },
    w: { x: crop.x, y: crop.y + crop.height / 2 },
  };

  // Check each handle
  for (const [position, handle] of Object.entries(handles)) {
    if (
      Math.abs(canvasX - handle.x) <= CROP_HANDLE_SIZE / 2 + HANDLE_TOLERANCE &&
      Math.abs(canvasY - handle.y) <= CROP_HANDLE_SIZE / 2 + HANDLE_TOLERANCE
    ) {
      return position as HandlePosition;
    }
  }

  return null;
}

/**
 * Checks if a canvas point is inside the crop rectangle
 *
 * @param canvasX - X coordinate in canvas space
 * @param canvasY - Y coordinate in canvas space
 * @param cropX - Crop X in image coordinates
 * @param cropY - Crop Y in image coordinates
 * @param cropWidth - Crop width
 * @param cropHeight - Crop height
 * @param imageWidth - Image width
 * @param imageHeight - Image height
 * @param canvasWidth - Canvas width
 * @param canvasHeight - Canvas height
 * @param zoomLevel - Zoom level
 * @param panX - Pan X offset
 * @param panY - Pan Y offset
 * @returns True if point is inside crop
 */
export function isInsideCropArea(
  canvasX: number,
  canvasY: number,
  cropX: number,
  cropY: number,
  cropWidth: number,
  cropHeight: number,
  imageWidth: number,
  imageHeight: number,
  canvasWidth: number,
  canvasHeight: number,
  zoomLevel: number,
  panX: number,
  panY: number
): boolean {
  const crop = getCropDisplayBounds(
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    imageWidth,
    imageHeight,
    canvasWidth,
    canvasHeight,
    { zoomLevel, panX, panY }
  );

  return (
    canvasX >= crop.x &&
    canvasX <= crop.x + crop.width &&
    canvasY >= crop.y &&
    canvasY <= crop.y + crop.height
  );
}

/**
 * Gets all crop handle bounds for hit testing
 *
 * @param cropX - Crop X in image coordinates
 * @param cropY - Crop Y in image coordinates
 * @param cropWidth - Crop width
 * @param cropHeight - Crop height
 * @param imageWidth - Image width
 * @param imageHeight - Image height
 * @param canvasWidth - Canvas width
 * @param canvasHeight - Canvas height
 * @param zoomLevel - Zoom level
 * @param panX - Pan X offset
 * @param panY - Pan Y offset
 * @returns Array of handle bounds
 */
export function getCropHandleBounds(
  cropX: number,
  cropY: number,
  cropWidth: number,
  cropHeight: number,
  imageWidth: number,
  imageHeight: number,
  canvasWidth: number,
  canvasHeight: number,
  zoomLevel: number,
  panX: number,
  panY: number
): HandleBounds[] {
  const crop = getCropDisplayBounds(
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    imageWidth,
    imageHeight,
    canvasWidth,
    canvasHeight,
    { zoomLevel, panX, panY }
  );

  const handleSize = CROP_HANDLE_SIZE;

  return [
    {
      position: 'nw',
      bounds: {
        x: crop.x - handleSize / 2,
        y: crop.y - handleSize / 2,
        width: handleSize,
        height: handleSize,
      },
    },
    {
      position: 'n',
      bounds: {
        x: crop.x + crop.width / 2 - handleSize / 2,
        y: crop.y - handleSize / 2,
        width: handleSize,
        height: handleSize,
      },
    },
    {
      position: 'ne',
      bounds: {
        x: crop.x + crop.width - handleSize / 2,
        y: crop.y - handleSize / 2,
        width: handleSize,
        height: handleSize,
      },
    },
    {
      position: 'e',
      bounds: {
        x: crop.x + crop.width - handleSize / 2,
        y: crop.y + crop.height / 2 - handleSize / 2,
        width: handleSize,
        height: handleSize,
      },
    },
    {
      position: 'se',
      bounds: {
        x: crop.x + crop.width - handleSize / 2,
        y: crop.y + crop.height - handleSize / 2,
        width: handleSize,
        height: handleSize,
      },
    },
    {
      position: 's',
      bounds: {
        x: crop.x + crop.width / 2 - handleSize / 2,
        y: crop.y + crop.height - handleSize / 2,
        width: handleSize,
        height: handleSize,
      },
    },
    {
      position: 'sw',
      bounds: {
        x: crop.x - handleSize / 2,
        y: crop.y + crop.height - handleSize / 2,
        width: handleSize,
        height: handleSize,
      },
    },
    {
      position: 'w',
      bounds: {
        x: crop.x - handleSize / 2,
        y: crop.y + crop.height / 2 - handleSize / 2,
        width: handleSize,
        height: handleSize,
      },
    },
  ];
}

/**
 * Checks if two rectangles intersect
 *
 * @param rect1 - First rectangle
 * @param rect2 - Second rectangle
 * @returns True if rectangles intersect
 */
export function rectanglesIntersect(
  rect1: { x: number; y: number; width: number; height: number },
  rect2: { x: number; y: number; width: number; height: number }
): boolean {
  return !(
    rect1.x + rect1.width < rect2.x ||
    rect2.x + rect2.width < rect1.x ||
    rect1.y + rect1.height < rect2.y ||
    rect2.y + rect2.height < rect1.y
  );
}

/**
 * Calculates distance between two points
 *
 * @param p1 - First point
 * @param p2 - Second point
 * @returns Distance
 */
export function pointDistance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}
