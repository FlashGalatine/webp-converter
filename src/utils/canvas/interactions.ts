import { CROP_HANDLE_SIZE, HANDLE_TOLERANCE } from '../../constants/canvas';
import { CURSOR_MAP } from '../../constants/cursors';
import { CursorHandle } from '../../types';

export interface CanvasCoordinates {
  x: number;
  y: number;
}

export interface ImageCoordinates {
  x: number;
  y: number;
}

/**
 * Get cursor position relative to canvas
 */
export function getCursorPos(e: MouseEvent, canvas: HTMLCanvasElement): CanvasCoordinates {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}

/**
 * Convert canvas coordinates to image coordinates
 */
export function canvasToImage(
  canvasX: number,
  canvasY: number,
  image: HTMLImageElement,
  zoomLevel: number,
  panX: number,
  panY: number,
  canvas: HTMLCanvasElement
): ImageCoordinates {
  const displayWidth = image.width * zoomLevel;
  const displayHeight = image.height * zoomLevel;
  const imgX = (canvas.width - displayWidth) / 2 + panX;
  const imgY = (canvas.height - displayHeight) / 2 + panY;

  return {
    x: (canvasX - imgX) / zoomLevel,
    y: (canvasY - imgY) / zoomLevel
  };
}

/**
 * Detect which handle is being hovered/clicked
 */
export function detectHandle(
  canvasX: number,
  canvasY: number,
  image: HTMLImageElement | null,
  cropWidth: number,
  cropHeight: number,
  cropX: number,
  cropY: number,
  zoomLevel: number,
  panX: number,
  panY: number,
  canvas: HTMLCanvasElement
): CursorHandle | null {
  if (!image || cropWidth <= 0 || cropHeight <= 0) return null;

  const displayWidth = image.width * zoomLevel;
  const displayHeight = image.height * zoomLevel;
  const imgX = (canvas.width - displayWidth) / 2 + panX;
  const imgY = (canvas.height - displayHeight) / 2 + panY;

  const cropDisplayX = imgX + cropX * zoomLevel;
  const cropDisplayY = imgY + cropY * zoomLevel;
  const cropDisplayWidth = cropWidth * zoomLevel;
  const cropDisplayHeight = cropHeight * zoomLevel;

  const handles: Record<CursorHandle, { x: number; y: number }> = {
    'nw': { x: cropDisplayX, y: cropDisplayY },
    'n': { x: cropDisplayX + cropDisplayWidth / 2, y: cropDisplayY },
    'ne': { x: cropDisplayX + cropDisplayWidth, y: cropDisplayY },
    'e': { x: cropDisplayX + cropDisplayWidth, y: cropDisplayY + cropDisplayHeight / 2 },
    'se': { x: cropDisplayX + cropDisplayWidth, y: cropDisplayY + cropDisplayHeight },
    's': { x: cropDisplayX + cropDisplayWidth / 2, y: cropDisplayY + cropDisplayHeight },
    'sw': { x: cropDisplayX, y: cropDisplayY + cropDisplayHeight },
    'w': { x: cropDisplayX, y: cropDisplayY + cropDisplayHeight / 2 }
  };

  for (const [key, handle] of Object.entries(handles)) {
    if (Math.abs(canvasX - handle.x) <= CROP_HANDLE_SIZE / 2 + HANDLE_TOLERANCE &&
      Math.abs(canvasY - handle.y) <= CROP_HANDLE_SIZE / 2 + HANDLE_TOLERANCE) {
      return key as CursorHandle;
    }
  }

  return null;
}

/**
 * Check if cursor is inside crop rectangle
 */
export function isInsideCrop(
  canvasX: number,
  canvasY: number,
  image: HTMLImageElement | null,
  cropWidth: number,
  cropHeight: number,
  cropX: number,
  cropY: number,
  zoomLevel: number,
  panX: number,
  panY: number,
  canvas: HTMLCanvasElement
): boolean {
  if (!image) return false;

  const displayWidth = image.width * zoomLevel;
  const displayHeight = image.height * zoomLevel;
  const imgX = (canvas.width - displayWidth) / 2 + panX;
  const imgY = (canvas.height - displayHeight) / 2 + panY;

  const cropDisplayX = imgX + cropX * zoomLevel;
  const cropDisplayY = imgY + cropY * zoomLevel;
  const cropDisplayWidth = cropWidth * zoomLevel;
  const cropDisplayHeight = cropHeight * zoomLevel;

  return canvasX >= cropDisplayX && canvasX <= cropDisplayX + cropDisplayWidth &&
    canvasY >= cropDisplayY && canvasY <= cropDisplayY + cropDisplayHeight;
}

/**
 * Get cursor style based on handle or position
 */
export function getCursorStyle(handle: CursorHandle | null, isInsideCrop: boolean, isDragging: boolean): string {
  if (isDragging) {
    return handle ? CURSOR_MAP[handle] : 'grabbing';
  }
  if (handle) {
    return CURSOR_MAP[handle];
  }
  if (isInsideCrop) {
    return 'move';
  }
  return 'grab';
}

