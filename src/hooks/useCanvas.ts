import { useState, useCallback, useEffect, useRef } from 'react';
import { CANVAS_PADDING, ZOOM_MIN, ZOOM_MAX, MIN_CROP_SIZE } from '../constants/canvas';
import { renderCanvas } from '../utils/canvas/rendering';
import { renderCanvasMultiCrop } from '../utils/canvas/multiCropRendering';
import {
  getCursorPos,
  detectHandleMulti,
  detectZoneAtPoint,
} from '../utils/canvas/interactions';
import { CURSOR_MAP } from '../constants/cursors';
import type { DragType, CropZone, CropBounds } from '../types';

export interface UseCanvasReturn {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  canvasWidth: number;
  canvasHeight: number;
  zoomLevel: number;
  panX: number;
  panY: number;
  // Active zone crop coordinates (derived from zones)
  cropX: number;
  cropY: number;
  cropWidth: number;
  cropHeight: number;
  cursorStyle: string;
  isDragging: boolean;
  handleMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  handleMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  handleMouseUp: () => void;
  handleMouseLeave: () => void;
  handleWheel: (e: React.WheelEvent<HTMLCanvasElement>) => void;
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  handleZoomReset: () => void;
  handleZoomToFit: () => void;
}

interface UseCanvasOptions {
  zones: CropZone[];
  activeZoneId: string | null;
  onSelectZone: (id: string | null) => void;
  onUpdateZoneRect: (id: string, rect: CropBounds) => void;
}

export function useCanvas(
  image: HTMLImageElement | null,
  options: UseCanvasOptions
): UseCanvasReturn {
  const { zones, activeZoneId, onSelectZone, onUpdateZoneRect } = options;

  const [canvasWidth, setCanvasWidth] = useState(1200);
  const [canvasHeight, setCanvasHeight] = useState(800);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [cursorStyle, setCursorStyle] = useState('default');
  const [isDragging, setIsDragging] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use refs to store drag values to avoid effect re-runs during dragging
  const dragStateRef = useRef({
    dragType: null as DragType,
    dragZoneId: null as string | null,
    dragStartX: 0,
    dragStartY: 0,
    dragStartCropX: 0,
    dragStartCropY: 0,
    dragStartCropWidth: 0,
    dragStartCropHeight: 0,
    dragStartPanX: 0,
    dragStartPanY: 0,
    dragZoneAspectRatio: null as number | null,
  });

  // Derive active zone crop coordinates
  const activeZone = zones.find(z => z.id === activeZoneId);
  const cropX = activeZone?.rect.x ?? 0;
  const cropY = activeZone?.rect.y ?? 0;
  const cropWidth = activeZone?.rect.width ?? 0;
  const cropHeight = activeZone?.rect.height ?? 0;

  // Draw on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    if (zones.length === 0) {
      // No zones — use single-crop renderer with zero crop (just show image)
      renderCanvas({
        canvas, image, zoomLevel, panX, panY,
        cropX: 0, cropY: 0, cropWidth: 0, cropHeight: 0
      });
    } else {
      renderCanvasMultiCrop({
        canvas, image, zoomLevel, panX, panY, zones, activeZoneId,
      });
    }
  }, [image, zoomLevel, panX, panY, zones, activeZoneId, canvasWidth, canvasHeight]);

  // Mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!image || !canvasRef.current) return;

    const pos = getCursorPos(e.nativeEvent, canvasRef.current);

    // Check for handle hit on active zone
    const handleHit = detectHandleMulti(
      pos.x, pos.y, image, zones, activeZoneId,
      zoomLevel, panX, panY, canvasRef.current
    );

    if (handleHit) {
      const zone = zones.find(z => z.id === handleHit.zoneId)!;
      const dragType = `resize-${handleHit.handle}` as DragType;
      dragStateRef.current = {
        dragType,
        dragZoneId: handleHit.zoneId,
        dragStartX: pos.x,
        dragStartY: pos.y,
        dragStartCropX: zone.rect.x,
        dragStartCropY: zone.rect.y,
        dragStartCropWidth: zone.rect.width,
        dragStartCropHeight: zone.rect.height,
        dragStartPanX: panX,
        dragStartPanY: panY,
        dragZoneAspectRatio: zone.aspectRatio,
      };
      setCursorStyle(CURSOR_MAP[handleHit.handle] || 'default');
      setIsDragging(true);
      return;
    }

    // Check for zone body hit
    const hitZoneId = detectZoneAtPoint(
      pos.x, pos.y, image, zones, activeZoneId,
      zoomLevel, panX, panY, canvasRef.current
    );

    if (hitZoneId) {
      const zone = zones.find(z => z.id === hitZoneId)!;
      onSelectZone(hitZoneId);
      dragStateRef.current = {
        dragType: 'move',
        dragZoneId: hitZoneId,
        dragStartX: pos.x,
        dragStartY: pos.y,
        dragStartCropX: zone.rect.x,
        dragStartCropY: zone.rect.y,
        dragStartCropWidth: zone.rect.width,
        dragStartCropHeight: zone.rect.height,
        dragStartPanX: panX,
        dragStartPanY: panY,
        dragZoneAspectRatio: zone.aspectRatio,
      };
      setCursorStyle('move');
      setIsDragging(true);
      return;
    }

    // Empty area — pan
    dragStateRef.current = {
      dragType: 'pan',
      dragZoneId: null,
      dragStartX: pos.x,
      dragStartY: pos.y,
      dragStartCropX: 0,
      dragStartCropY: 0,
      dragStartCropWidth: 0,
      dragStartCropHeight: 0,
      dragStartPanX: panX,
      dragStartPanY: panY,
      dragZoneAspectRatio: null,
    };
    setCursorStyle('grabbing');
    onSelectZone(null);
    setIsDragging(true);
  }, [image, zones, activeZoneId, zoomLevel, panX, panY, onSelectZone]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!image || !canvasRef.current) return;

    const pos = getCursorPos(e.nativeEvent, canvasRef.current);

    // Update cursor on hover (only when not dragging)
    if (!isDragging) {
      const handleHit = detectHandleMulti(
        pos.x, pos.y, image, zones, activeZoneId,
        zoomLevel, panX, panY, canvasRef.current
      );

      if (handleHit) {
        setCursorStyle(CURSOR_MAP[handleHit.handle] || 'default');
        return;
      }

      const hitZoneId = detectZoneAtPoint(
        pos.x, pos.y, image, zones, activeZoneId,
        zoomLevel, panX, panY, canvasRef.current
      );
      setCursorStyle(hitZoneId ? 'move' : 'grab');
    }
  }, [isDragging, image, zones, activeZoneId, zoomLevel, panX, panY]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    dragStateRef.current.dragType = null;
  }, []);

  const handleMouseLeave = useCallback(() => {
    setCursorStyle('default');
  }, []);

  // Document-level mouse event listeners for proper drag handling
  useEffect(() => {
    if (isDragging) {
      const handleDocumentMouseMove = (e: MouseEvent) => {
        if (!image || !canvasRef.current) return;
        const pos = getCursorPos(e, canvasRef.current);
        const dragState = dragStateRef.current;
        const dx = pos.x - dragState.dragStartX;
        const dy = pos.y - dragState.dragStartY;

        if (dragState.dragType === 'pan') {
          setPanX(dragState.dragStartPanX + dx);
          setPanY(dragState.dragStartPanY + dy);
        } else if (dragState.dragType === 'move' && dragState.dragZoneId) {
          const dxImg = dx / zoomLevel;
          const dyImg = dy / zoomLevel;

          let newX = dragState.dragStartCropX + dxImg;
          let newY = dragState.dragStartCropY + dyImg;

          newX = Math.max(0, Math.min(newX, image.width - dragState.dragStartCropWidth));
          newY = Math.max(0, Math.min(newY, image.height - dragState.dragStartCropHeight));

          onUpdateZoneRect(dragState.dragZoneId, {
            x: newX,
            y: newY,
            width: dragState.dragStartCropWidth,
            height: dragState.dragStartCropHeight,
          });
        } else if (dragState.dragType?.startsWith('resize-') && dragState.dragZoneId) {
          const direction = dragState.dragType.split('-')[1] as string;
          const dxImg = dx / zoomLevel;
          const dyImg = dy / zoomLevel;

          let newX = dragState.dragStartCropX;
          let newY = dragState.dragStartCropY;
          let newWidth = dragState.dragStartCropWidth;
          let newHeight = dragState.dragStartCropHeight;

          if (direction.includes('w')) {
            newX = dragState.dragStartCropX + dxImg;
            newWidth = dragState.dragStartCropWidth - dxImg;
          }
          if (direction.includes('e')) {
            newWidth = dragState.dragStartCropWidth + dxImg;
          }
          if (direction.includes('n')) {
            newY = dragState.dragStartCropY + dyImg;
            newHeight = dragState.dragStartCropHeight - dyImg;
          }
          if (direction.includes('s')) {
            newHeight = dragState.dragStartCropHeight + dyImg;
          }

          // Maintain aspect ratio if set
          const aspectRatio = dragState.dragZoneAspectRatio;
          if (aspectRatio) {
            if (direction.includes('e') || direction.includes('w')) {
              newHeight = newWidth / aspectRatio;
              if (direction.includes('n')) {
                newY = dragState.dragStartCropY + dragState.dragStartCropHeight - newHeight;
              }
            } else {
              newWidth = newHeight * aspectRatio;
              if (direction.includes('w')) {
                newX = dragState.dragStartCropX + dragState.dragStartCropWidth - newWidth;
              }
            }
          }

          // Constrain to image bounds
          if (newX < 0) {
            newWidth += newX;
            newX = 0;
          }
          if (newY < 0) {
            newHeight += newY;
            newY = 0;
          }
          if (newX + newWidth > image.width) {
            newWidth = image.width - newX;
          }
          if (newY + newHeight > image.height) {
            newHeight = image.height - newY;
          }

          if (newWidth > MIN_CROP_SIZE && newHeight > MIN_CROP_SIZE) {
            onUpdateZoneRect(dragState.dragZoneId, {
              x: newX,
              y: newY,
              width: newWidth,
              height: newHeight,
            });
          }
        }
      };

      const handleDocumentMouseUp = () => {
        setIsDragging(false);
        dragStateRef.current.dragType = null;
      };

      document.addEventListener('mousemove', handleDocumentMouseMove);
      document.addEventListener('mouseup', handleDocumentMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleDocumentMouseMove);
        document.removeEventListener('mouseup', handleDocumentMouseUp);
      };
    }
  }, [isDragging, image, zoomLevel, onUpdateZoneRect]);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!image) return;

    const delta = e.deltaY;
    const zoomFactor = delta > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(ZOOM_MIN, Math.min(zoomLevel * zoomFactor, ZOOM_MAX));
    setZoomLevel(newZoom);
  }, [image, zoomLevel]);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    setZoomLevel(Math.min(zoomLevel * 1.1, ZOOM_MAX));
  }, [zoomLevel]);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(Math.max(zoomLevel * 0.9, ZOOM_MIN));
  }, [zoomLevel]);

  const handleZoomReset = useCallback(() => {
    setZoomLevel(1);
    setPanX(0);
    setPanY(0);
  }, []);

  const handleZoomToFit = useCallback(() => {
    if (!image) return;
    const zoomX = (canvasWidth - CANVAS_PADDING) / image.width;
    const zoomY = (canvasHeight - CANVAS_PADDING) / image.height;
    const newZoom = Math.min(zoomX, zoomY);
    setZoomLevel(Math.max(ZOOM_MIN, Math.min(newZoom, ZOOM_MAX)));
    setPanX(0);
    setPanY(0);
  }, [image, canvasWidth, canvasHeight]);

  // Dynamic canvas sizing
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCanvasWidth(Math.max(800, rect.width - CANVAS_PADDING));
        setCanvasHeight(Math.max(600, rect.height - CANVAS_PADDING));
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    const timer = setTimeout(updateCanvasSize, 100);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      clearTimeout(timer);
    };
  }, []);

  return {
    canvasRef,
    containerRef,
    canvasWidth,
    canvasHeight,
    zoomLevel,
    panX,
    panY,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    cursorStyle,
    isDragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    handleWheel,
    handleZoomIn,
    handleZoomOut,
    handleZoomReset,
    handleZoomToFit,
  };
}
