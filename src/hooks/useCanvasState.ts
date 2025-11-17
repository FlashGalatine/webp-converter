/**
 * Custom hook for managing canvas viewport state
 */

import { useState, useCallback } from 'react';
import { ZOOM_MIN, ZOOM_MAX } from '../constants';
import type { CanvasTransform } from '../types';

export interface UseCanvasStateReturn {
  /** Canvas width in pixels */
  canvasWidth: number;
  /** Canvas height in pixels */
  canvasHeight: number;
  /** Current zoom level */
  zoomLevel: number;
  /** Pan offset X */
  panX: number;
  /** Pan offset Y */
  panY: number;
  /** Set canvas dimensions */
  setCanvasDimensions: (width: number, height: number) => void;
  /** Set zoom level (clamped to min/max) */
  setZoom: (zoom: number) => void;
  /** Adjust zoom by delta (e.g., +0.1 or -0.1) */
  adjustZoom: (delta: number) => void;
  /** Set pan offset */
  setPan: (x: number, y: number) => void;
  /** Adjust pan by delta */
  adjustPan: (deltaX: number, deltaY: number) => void;
  /** Reset zoom and pan to defaults */
  resetView: () => void;
  /** Get current transform */
  getTransform: () => CanvasTransform;
}

/**
 * Hook for managing canvas viewport (zoom, pan, dimensions)
 *
 * @param initialWidth - Initial canvas width (default: 1200)
 * @param initialHeight - Initial canvas height (default: 800)
 * @returns Canvas state and manipulation functions
 */
export function useCanvasState(
  initialWidth: number = 1200,
  initialHeight: number = 800
): UseCanvasStateReturn {
  const [canvasWidth, setCanvasWidth] = useState(initialWidth);
  const [canvasHeight, setCanvasHeight] = useState(initialHeight);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);

  /**
   * Sets canvas dimensions
   */
  const setCanvasDimensions = useCallback((width: number, height: number) => {
    setCanvasWidth(width);
    setCanvasHeight(height);
  }, []);

  /**
   * Sets zoom level (clamped to valid range)
   */
  const setZoom = useCallback((zoom: number) => {
    const clampedZoom = Math.max(ZOOM_MIN, Math.min(zoom, ZOOM_MAX));
    setZoomLevel(clampedZoom);
  }, []);

  /**
   * Adjusts zoom by delta
   */
  const adjustZoom = useCallback((delta: number) => {
    setZoomLevel((prev) => {
      const newZoom = prev + delta;
      return Math.max(ZOOM_MIN, Math.min(newZoom, ZOOM_MAX));
    });
  }, []);

  /**
   * Sets pan offset
   */
  const setPan = useCallback((x: number, y: number) => {
    setPanX(x);
    setPanY(y);
  }, []);

  /**
   * Adjusts pan by delta
   */
  const adjustPan = useCallback((deltaX: number, deltaY: number) => {
    setPanX((prev) => prev + deltaX);
    setPanY((prev) => prev + deltaY);
  }, []);

  /**
   * Resets view to defaults
   */
  const resetView = useCallback(() => {
    setZoomLevel(1);
    setPanX(0);
    setPanY(0);
  }, []);

  /**
   * Gets current transform
   */
  const getTransform = useCallback((): CanvasTransform => {
    return {
      zoomLevel,
      panX,
      panY,
    };
  }, [zoomLevel, panX, panY]);

  return {
    canvasWidth,
    canvasHeight,
    zoomLevel,
    panX,
    panY,
    setCanvasDimensions,
    setZoom,
    adjustZoom,
    setPan,
    adjustPan,
    resetView,
    getTransform,
  };
}
