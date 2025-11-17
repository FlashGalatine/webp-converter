/**
 * Crop resize utilities
 */

import type { HandlePosition } from '../../types';

export interface ResizeResult {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ResizeParams {
  /** Current crop X */
  cropX: number;
  /** Current crop Y */
  cropY: number;
  /** Current crop width */
  cropWidth: number;
  /** Current crop height */
  cropHeight: number;
  /** Delta X in image coordinates */
  deltaX: number;
  /** Delta Y in image coordinates */
  deltaY: number;
  /** Handle being dragged */
  handle: HandlePosition;
  /** Aspect ratio to maintain (null for freestyle) */
  aspectRatio: number | null;
  /** Image width (for clamping) */
  imageWidth: number;
  /** Image height (for clamping) */
  imageHeight: number;
  /** Minimum crop size */
  minSize?: number;
}

/**
 * Calculates new crop dimensions when resizing from a handle
 *
 * Enforces aspect ratio if provided and clamps to image bounds.
 *
 * @param params - Resize parameters
 * @returns New crop dimensions
 */
export function calculateCropResize(params: ResizeParams): ResizeResult {
  const {
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    deltaX,
    deltaY,
    handle,
    aspectRatio,
    imageWidth,
    imageHeight,
    minSize = 10,
  } = params;

  let newX = cropX;
  let newY = cropY;
  let newWidth = cropWidth;
  let newHeight = cropHeight;

  // Apply deltas based on handle position
  switch (handle) {
    case 'nw':
      newX += deltaX;
      newY += deltaY;
      newWidth -= deltaX;
      newHeight -= deltaY;
      break;
    case 'n':
      newY += deltaY;
      newHeight -= deltaY;
      break;
    case 'ne':
      newY += deltaY;
      newWidth += deltaX;
      newHeight -= deltaY;
      break;
    case 'e':
      newWidth += deltaX;
      break;
    case 'se':
      newWidth += deltaX;
      newHeight += deltaY;
      break;
    case 's':
      newHeight += deltaY;
      break;
    case 'sw':
      newX += deltaX;
      newWidth -= deltaX;
      newHeight += deltaY;
      break;
    case 'w':
      newX += deltaX;
      newWidth -= deltaX;
      break;
  }

  // Enforce aspect ratio if provided
  if (aspectRatio !== null) {
    // Determine which dimension to use as primary based on handle
    const isHorizontalHandle = handle === 'e' || handle === 'w';
    const isVerticalHandle = handle === 'n' || handle === 's';

    if (isHorizontalHandle) {
      // Width changed, adjust height
      newHeight = newWidth / aspectRatio;

      // Adjust Y position for corner handles to keep center stable
      if (handle === 'w') {
        // Keep bottom edge fixed
        newY = cropY + cropHeight - newHeight;
      }
    } else if (isVerticalHandle) {
      // Height changed, adjust width
      newWidth = newHeight * aspectRatio;

      // Adjust X position for corner handles to keep center stable
      if (handle === 'n') {
        // Keep right edge fixed
        newX = cropX + cropWidth - newWidth;
      }
    } else {
      // Corner handle - use diagonal
      // Calculate which dimension has the larger relative change
      const widthRatio = newWidth / cropWidth;
      const heightRatio = newHeight / cropHeight;

      if (Math.abs(widthRatio - 1) > Math.abs(heightRatio - 1)) {
        // Width changed more, adjust height
        newHeight = newWidth / aspectRatio;

        // Adjust Y for top handles
        if (handle === 'nw' || handle === 'ne') {
          newY = cropY + cropHeight - newHeight;
        }
      } else {
        // Height changed more, adjust width
        newWidth = newHeight * aspectRatio;

        // Adjust X for left handles
        if (handle === 'nw' || handle === 'sw') {
          newX = cropX + cropWidth - newWidth;
        }
      }
    }
  }

  // Enforce minimum size
  if (newWidth < minSize) {
    newWidth = minSize;
    if (handle === 'nw' || handle === 'w' || handle === 'sw') {
      newX = cropX + cropWidth - minSize;
    }
  }

  if (newHeight < minSize) {
    newHeight = minSize;
    if (handle === 'nw' || handle === 'n' || handle === 'ne') {
      newY = cropY + cropHeight - minSize;
    }
  }

  // Clamp to image bounds
  if (newX < 0) {
    newWidth += newX;
    newX = 0;
  }

  if (newY < 0) {
    newHeight += newY;
    newY = 0;
  }

  if (newX + newWidth > imageWidth) {
    newWidth = imageWidth - newX;
  }

  if (newY + newHeight > imageHeight) {
    newHeight = imageHeight - newY;
  }

  // Re-enforce aspect ratio after clamping if needed
  if (aspectRatio !== null) {
    const currentRatio = newWidth / newHeight;
    const ratioDiff = Math.abs(currentRatio - aspectRatio);

    // If ratio is off by more than 1%, re-adjust
    if (ratioDiff > 0.01) {
      if (newWidth / aspectRatio < newHeight) {
        // Constrained by width
        newHeight = newWidth / aspectRatio;

        // Adjust Y if needed to fit
        if (newY + newHeight > imageHeight) {
          newHeight = imageHeight - newY;
          newWidth = newHeight * aspectRatio;
        }
      } else {
        // Constrained by height
        newWidth = newHeight * aspectRatio;

        // Adjust X if needed to fit
        if (newX + newWidth > imageWidth) {
          newWidth = imageWidth - newX;
          newHeight = newWidth / aspectRatio;
        }
      }
    }
  }

  return {
    x: Math.max(0, newX),
    y: Math.max(0, newY),
    width: Math.max(minSize, newWidth),
    height: Math.max(minSize, newHeight),
  };
}
