import { CROP_HANDLE_SIZE, HANDLE_TOLERANCE } from '../../constants/canvas';
import { CURSOR_MAP } from '../../constants/cursors';
import { CursorHandle } from '../../types';
import type { CropZone } from '../../types';

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
 * Compute the display-space rect for a crop region.
 * Shared helper to avoid duplicating the coordinate math.
 */
function computeDisplayRect(
  image: HTMLImageElement,
  cropX: number,
  cropY: number,
  cropWidth: number,
  cropHeight: number,
  zoomLevel: number,
  panX: number,
  panY: number,
  canvas: HTMLCanvasElement
) {
  const displayWidth = image.width * zoomLevel;
  const displayHeight = image.height * zoomLevel;
  const imgX = (canvas.width - displayWidth) / 2 + panX;
  const imgY = (canvas.height - displayHeight) / 2 + panY;

  return {
    cropDisplayX: imgX + cropX * zoomLevel,
    cropDisplayY: imgY + cropY * zoomLevel,
    cropDisplayWidth: cropWidth * zoomLevel,
    cropDisplayHeight: cropHeight * zoomLevel,
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

  const { cropDisplayX, cropDisplayY, cropDisplayWidth, cropDisplayHeight } =
    computeDisplayRect(image, cropX, cropY, cropWidth, cropHeight, zoomLevel, panX, panY, canvas);

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

  const { cropDisplayX, cropDisplayY, cropDisplayWidth, cropDisplayHeight } =
    computeDisplayRect(image, cropX, cropY, cropWidth, cropHeight, zoomLevel, panX, panY, canvas);

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

// ─── Multi-Zone Hit Testing ──────────────────────────────────────────────────

export interface MultiZoneHandleHit {
  zoneId: string;
  handle: CursorHandle;
}

/**
 * Detect which handle of which zone is being hovered/clicked.
 * Only checks the selected zone for handles (non-selected zones don't show handles).
 */
export function detectHandleMulti(
  canvasX: number,
  canvasY: number,
  image: HTMLImageElement | null,
  zones: CropZone[],
  activeZoneId: string | null,
  zoomLevel: number,
  panX: number,
  panY: number,
  canvas: HTMLCanvasElement
): MultiZoneHandleHit | null {
  if (!image || !activeZoneId) return null;

  const activeZone = zones.find(z => z.id === activeZoneId);
  if (!activeZone) return null;

  const handle = detectHandle(
    canvasX, canvasY, image,
    activeZone.rect.width, activeZone.rect.height,
    activeZone.rect.x, activeZone.rect.y,
    zoomLevel, panX, panY, canvas
  );

  if (handle) {
    return { zoneId: activeZoneId, handle };
  }

  return null;
}

/**
 * Detect which zone body is at a given point.
 *
 * Priority:
 * 1. The currently selected zone always wins (if the point is inside it).
 * 2. Otherwise, iterate zones in reverse order (last-created = topmost).
 *
 * Returns the zone ID or null if no zone is hit.
 */
export function detectZoneAtPoint(
  canvasX: number,
  canvasY: number,
  image: HTMLImageElement | null,
  zones: CropZone[],
  activeZoneId: string | null,
  zoomLevel: number,
  panX: number,
  panY: number,
  canvas: HTMLCanvasElement
): string | null {
  if (!image || zones.length === 0) return null;

  // Priority 1: check active zone first
  if (activeZoneId) {
    const activeZone = zones.find(z => z.id === activeZoneId);
    if (activeZone) {
      const inside = isInsideCrop(
        canvasX, canvasY, image,
        activeZone.rect.width, activeZone.rect.height,
        activeZone.rect.x, activeZone.rect.y,
        zoomLevel, panX, panY, canvas
      );
      if (inside) return activeZoneId;
    }
  }

  // Priority 2: iterate in reverse (topmost = last created)
  for (let i = zones.length - 1; i >= 0; i--) {
    const zone = zones[i];
    if (zone.id === activeZoneId) continue; // already checked
    const inside = isInsideCrop(
      canvasX, canvasY, image,
      zone.rect.width, zone.rect.height,
      zone.rect.x, zone.rect.y,
      zoomLevel, panX, panY, canvas
    );
    if (inside) return zone.id;
  }

  return null;
}

