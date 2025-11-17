/**
 * Custom hook for managing canvas interaction state
 */

import { useState, useCallback } from 'react';
import type { DragType, CursorStyle, Point } from '../types';

export interface DragStartState {
  /** Drag start canvas X */
  canvasX: number;
  /** Drag start canvas Y */
  canvasY: number;
  /** Drag start crop X */
  cropX: number;
  /** Drag start crop Y */
  cropY: number;
  /** Drag start crop width */
  cropWidth: number;
  /** Drag start crop height */
  cropHeight: number;
  /** Drag start pan X */
  panX: number;
  /** Drag start pan Y */
  panY: number;
}

export interface UseCanvasInteractionReturn {
  /** Whether currently dragging */
  isDragging: boolean;
  /** Type of drag operation */
  dragType: DragType | null;
  /** Drag start state */
  dragStartState: DragStartState;
  /** Current cursor style */
  cursorStyle: CursorStyle;
  /** Start drag operation */
  startDrag: (
    type: DragType,
    canvasPos: Point,
    cropArea: { x: number; y: number; width: number; height: number },
    panOffset: { x: number; y: number }
  ) => void;
  /** End drag operation */
  endDrag: () => void;
  /** Set cursor style */
  setCursor: (cursor: CursorStyle) => void;
  /** Reset cursor to default */
  resetCursor: () => void;
}

/**
 * Hook for managing canvas interaction state
 *
 * @returns Interaction state and manipulation functions
 */
export function useCanvasInteraction(): UseCanvasInteractionReturn {
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<DragType | null>(null);
  const [dragStartState, setDragStartState] = useState<DragStartState>({
    canvasX: 0,
    canvasY: 0,
    cropX: 0,
    cropY: 0,
    cropWidth: 0,
    cropHeight: 0,
    panX: 0,
    panY: 0,
  });
  const [cursorStyle, setCursorStyle] = useState<CursorStyle>('default');

  /**
   * Starts a drag operation
   */
  const startDrag = useCallback(
    (
      type: DragType,
      canvasPos: Point,
      cropArea: { x: number; y: number; width: number; height: number },
      panOffset: { x: number; y: number }
    ) => {
      setIsDragging(true);
      setDragType(type);
      setDragStartState({
        canvasX: canvasPos.x,
        canvasY: canvasPos.y,
        cropX: cropArea.x,
        cropY: cropArea.y,
        cropWidth: cropArea.width,
        cropHeight: cropArea.height,
        panX: panOffset.x,
        panY: panOffset.y,
      });
    },
    []
  );

  /**
   * Ends drag operation
   */
  const endDrag = useCallback(() => {
    setIsDragging(false);
    setDragType(null);
  }, []);

  /**
   * Sets cursor style
   */
  const setCursor = useCallback((cursor: CursorStyle) => {
    setCursorStyle(cursor);
  }, []);

  /**
   * Resets cursor to default
   */
  const resetCursor = useCallback(() => {
    setCursorStyle('default');
  }, []);

  return {
    isDragging,
    dragType,
    dragStartState,
    cursorStyle,
    startDrag,
    endDrag,
    setCursor,
    resetCursor,
  };
}
