/**
 * Canvas coordinate transformation utilities
 */

import type { Point, CanvasTransform } from '../../types';

/**
 * Gets cursor position relative to canvas element
 *
 * @param event - Mouse event
 * @param canvasElement - Canvas element
 * @returns Canvas coordinates
 */
export function getCursorPosition(
  event: MouseEvent,
  canvasElement: HTMLCanvasElement
): Point {
  const rect = canvasElement.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

/**
 * Converts canvas coordinates to image coordinates
 *
 * Accounts for zoom level and pan offset.
 *
 * @param canvasX - X coordinate in canvas space
 * @param canvasY - Y coordinate in canvas space
 * @param imageWidth - Original image width
 * @param imageHeight - Original image height
 * @param canvasWidth - Canvas width
 * @param canvasHeight - Canvas height
 * @param transform - Canvas transform (zoom and pan)
 * @returns Image coordinates
 */
export function canvasToImageCoordinates(
  canvasX: number,
  canvasY: number,
  imageWidth: number,
  imageHeight: number,
  canvasWidth: number,
  canvasHeight: number,
  transform: CanvasTransform
): Point {
  const { zoomLevel, panX, panY } = transform;

  const displayWidth = imageWidth * zoomLevel;
  const displayHeight = imageHeight * zoomLevel;

  // Calculate image offset (centered)
  const imgX = (canvasWidth - displayWidth) / 2 + panX;
  const imgY = (canvasHeight - displayHeight) / 2 + panY;

  return {
    x: (canvasX - imgX) / zoomLevel,
    y: (canvasY - imgY) / zoomLevel,
  };
}

/**
 * Converts image coordinates to canvas coordinates
 *
 * @param imageX - X coordinate in image space
 * @param imageY - Y coordinate in image space
 * @param imageWidth - Original image width
 * @param imageHeight - Original image height
 * @param canvasWidth - Canvas width
 * @param canvasHeight - Canvas height
 * @param transform - Canvas transform (zoom and pan)
 * @returns Canvas coordinates
 */
export function imageToCanvasCoordinates(
  imageX: number,
  imageY: number,
  imageWidth: number,
  imageHeight: number,
  canvasWidth: number,
  canvasHeight: number,
  transform: CanvasTransform
): Point {
  const { zoomLevel, panX, panY } = transform;

  const displayWidth = imageWidth * zoomLevel;
  const displayHeight = imageHeight * zoomLevel;

  // Calculate image offset (centered)
  const imgX = (canvasWidth - displayWidth) / 2 + panX;
  const imgY = (canvasHeight - displayHeight) / 2 + panY;

  return {
    x: imgX + imageX * zoomLevel,
    y: imgY + imageY * zoomLevel,
  };
}

/**
 * Calculates the display offset for centering the image
 *
 * @param imageWidth - Original image width
 * @param imageHeight - Original image height
 * @param canvasWidth - Canvas width
 * @param canvasHeight - Canvas height
 * @param transform - Canvas transform
 * @returns Display offset point
 */
export function getImageDisplayOffset(
  imageWidth: number,
  imageHeight: number,
  canvasWidth: number,
  canvasHeight: number,
  transform: CanvasTransform
): Point {
  const { zoomLevel, panX, panY } = transform;

  const displayWidth = imageWidth * zoomLevel;
  const displayHeight = imageHeight * zoomLevel;

  return {
    x: (canvasWidth - displayWidth) / 2 + panX,
    y: (canvasHeight - displayHeight) / 2 + panY,
  };
}

/**
 * Calculates crop rectangle in canvas coordinates
 *
 * @param cropX - Crop X in image coordinates
 * @param cropY - Crop Y in image coordinates
 * @param cropWidth - Crop width in image coordinates
 * @param cropHeight - Crop height in image coordinates
 * @param imageWidth - Original image width
 * @param imageHeight - Original image height
 * @param canvasWidth - Canvas width
 * @param canvasHeight - Canvas height
 * @param transform - Canvas transform
 * @returns Crop rectangle in canvas coordinates
 */
export function getCropDisplayBounds(
  cropX: number,
  cropY: number,
  cropWidth: number,
  cropHeight: number,
  imageWidth: number,
  imageHeight: number,
  canvasWidth: number,
  canvasHeight: number,
  transform: CanvasTransform
): { x: number; y: number; width: number; height: number } {
  const { zoomLevel, panX, panY } = transform;

  const displayWidth = imageWidth * zoomLevel;
  const displayHeight = imageHeight * zoomLevel;

  const imgX = (canvasWidth - displayWidth) / 2 + panX;
  const imgY = (canvasHeight - displayHeight) / 2 + panY;

  return {
    x: imgX + cropX * zoomLevel,
    y: imgY + cropY * zoomLevel,
    width: cropWidth * zoomLevel,
    height: cropHeight * zoomLevel,
  };
}

/**
 * Clamps a point to be within image bounds
 *
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param imageWidth - Image width
 * @param imageHeight - Image height
 * @returns Clamped point
 */
export function clampToImageBounds(
  x: number,
  y: number,
  imageWidth: number,
  imageHeight: number
): Point {
  return {
    x: Math.max(0, Math.min(x, imageWidth)),
    y: Math.max(0, Math.min(y, imageHeight)),
  };
}
