import { useState, useCallback, useEffect, useRef } from 'react';
import { CANVAS_PADDING, ZOOM_MIN, ZOOM_MAX, MIN_CROP_SIZE } from '../constants/canvas';
import { renderCanvas } from '../utils/canvas/rendering';
import { getCursorPos, detectHandle, isInsideCrop, getCursorStyle } from '../utils/canvas/interactions';
import { CURSOR_MAP } from '../constants/cursors';
import type { DragType } from '../types';

export interface UseCanvasReturn {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  canvasWidth: number;
  canvasHeight: number;
  zoomLevel: number;
  panX: number;
  panY: number;
  cropX: number;
  cropY: number;
  cropWidth: number;
  cropHeight: number;
  aspectRatio: number | null;
  isFreestyleMode: boolean;
  cursorStyle: string;
  isDragging: boolean;
  setAspectRatio: (ratio: number | null) => void;
  setIsFreestyleMode: (value: boolean) => void;
  initializeCrop: (imgWidth: number, imgHeight: number, ratio: number | null) => void;
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

export function useCanvas(image: HTMLImageElement | null): UseCanvasReturn {
  const [canvasWidth, setCanvasWidth] = useState(1200);
  const [canvasHeight, setCanvasHeight] = useState(800);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [cropWidth, setCropWidth] = useState(0);
  const [cropHeight, setCropHeight] = useState(0);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [isFreestyleMode, setIsFreestyleMode] = useState(false);
  const [cursorStyle, setCursorStyle] = useState('default');
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<DragType>(null);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartCropX, setDragStartCropX] = useState(0);
  const [dragStartCropY, setDragStartCropY] = useState(0);
  const [dragStartCropWidth, setDragStartCropWidth] = useState(0);
  const [dragStartCropHeight, setDragStartCropHeight] = useState(0);
  const [dragStartPanX, setDragStartPanX] = useState(0);
  const [dragStartPanY, setDragStartPanY] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const initializeCrop = useCallback((imgWidth: number, imgHeight: number, ratio: number | null) => {
    if (!ratio) {
      setCropX(0);
      setCropY(0);
      setCropWidth(imgWidth);
      setCropHeight(imgHeight);
    } else {
      const imgRatio = imgWidth / imgHeight;
      let w: number, h: number;

      if (ratio > imgRatio) {
        w = imgWidth;
        h = imgWidth / ratio;
      } else {
        h = imgHeight;
        w = imgHeight * ratio;
      }

      setCropX((imgWidth - w) / 2);
      setCropY((imgHeight - h) / 2);
      setCropWidth(w);
      setCropHeight(h);
    }
  }, []);

  // Draw on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    renderCanvas({
      canvas,
      image,
      zoomLevel,
      panX,
      panY,
      cropX,
      cropY,
      cropWidth,
      cropHeight
    });
  }, [image, zoomLevel, panX, panY, cropX, cropY, cropWidth, cropHeight, canvasWidth, canvasHeight]);

  // Mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!image || !canvasRef.current) return;

    const pos = getCursorPos(e.nativeEvent, canvasRef.current);
    const handle = detectHandle(
      pos.x, pos.y, image, cropWidth, cropHeight, cropX, cropY,
      zoomLevel, panX, panY, canvasRef.current
    );

    if (handle) {
      setDragType(`resize-${handle}` as DragType);
      setDragStartCropX(cropX);
      setDragStartCropY(cropY);
      setDragStartCropWidth(cropWidth);
      setDragStartCropHeight(cropHeight);
      setCursorStyle(CURSOR_MAP[handle] || 'default');
    } else if (isInsideCrop(pos.x, pos.y, image, cropWidth, cropHeight, cropX, cropY, zoomLevel, panX, panY, canvasRef.current)) {
      setDragType('move');
      setDragStartCropX(cropX);
      setDragStartCropY(cropY);
      setCursorStyle('move');
    } else {
      setDragType('pan');
      setDragStartPanX(panX);
      setDragStartPanY(panY);
      setCursorStyle('grabbing');
    }

    setIsDragging(true);
    setDragStartX(pos.x);
    setDragStartY(pos.y);
  }, [image, cropX, cropY, cropWidth, cropHeight, zoomLevel, panX, panY]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!image || !canvasRef.current) return;

    const pos = getCursorPos(e.nativeEvent, canvasRef.current);

    // Update cursor on hover (only when not dragging)
    if (!isDragging) {
      const handle = detectHandle(pos.x, pos.y, image, cropWidth, cropHeight, cropX, cropY, zoomLevel, panX, panY, canvasRef.current);
      const insideCrop = isInsideCrop(pos.x, pos.y, image, cropWidth, cropHeight, cropX, cropY, zoomLevel, panX, panY, canvasRef.current);
      setCursorStyle(getCursorStyle(handle, insideCrop, false));
    }
  }, [isDragging, image, cropWidth, cropHeight, cropX, cropY, zoomLevel, panX, panY]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragType(null);
  }, []);

  const handleMouseLeave = useCallback(() => {
    // Don't stop dragging on mouse leave - allow dragging outside canvas
    setCursorStyle('default');
  }, []);

  // Add document-level mouse event listeners for proper drag handling
  useEffect(() => {
    if (isDragging) {
      const handleDocumentMouseMove = (e: MouseEvent) => {
        if (!image || !canvasRef.current) return;
        const pos = getCursorPos(e, canvasRef.current);
        const dx = pos.x - dragStartX;
        const dy = pos.y - dragStartY;

        if (dragType === 'pan') {
          setPanX(dragStartPanX + dx);
          setPanY(dragStartPanY + dy);
        } else if (dragType === 'move') {
          const dxImg = dx / zoomLevel;
          const dyImg = dy / zoomLevel;

          let newX = dragStartCropX + dxImg;
          let newY = dragStartCropY + dyImg;

          newX = Math.max(0, Math.min(newX, image.width - cropWidth));
          newY = Math.max(0, Math.min(newY, image.height - cropHeight));

          setCropX(newX);
          setCropY(newY);
        } else if (dragType && dragType.startsWith('resize-')) {
          const direction = dragType.split('-')[1] as string;
          const dxImg = dx / zoomLevel;
          const dyImg = dy / zoomLevel;

          let newX = dragStartCropX;
          let newY = dragStartCropY;
          let newWidth = dragStartCropWidth;
          let newHeight = dragStartCropHeight;

          if (direction.includes('w')) {
            newX = dragStartCropX + dxImg;
            newWidth = dragStartCropWidth - dxImg;
          }
          if (direction.includes('e')) {
            newWidth = dragStartCropWidth + dxImg;
          }
          if (direction.includes('n')) {
            newY = dragStartCropY + dyImg;
            newHeight = dragStartCropHeight - dyImg;
          }
          if (direction.includes('s')) {
            newHeight = dragStartCropHeight + dyImg;
          }

          // Maintain aspect ratio if set
          if (aspectRatio && !isFreestyleMode) {
            if (direction.includes('e') || direction.includes('w')) {
              newHeight = newWidth / aspectRatio;
              if (direction.includes('n')) {
                newY = dragStartCropY + dragStartCropHeight - newHeight;
              }
            } else {
              newWidth = newHeight * aspectRatio;
              if (direction.includes('w')) {
                newX = dragStartCropX + dragStartCropWidth - newWidth;
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
            setCropX(newX);
            setCropY(newY);
            setCropWidth(newWidth);
            setCropHeight(newHeight);
          }
        }
      };

      const handleDocumentMouseUp = () => {
        setIsDragging(false);
        setDragType(null);
      };

      document.addEventListener('mousemove', handleDocumentMouseMove);
      document.addEventListener('mouseup', handleDocumentMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleDocumentMouseMove);
        document.removeEventListener('mouseup', handleDocumentMouseUp);
      };
    }
  }, [isDragging, dragType, dragStartX, dragStartY, dragStartCropX, dragStartCropY, dragStartCropWidth, dragStartCropHeight, dragStartPanX, dragStartPanY, image, zoomLevel, cropWidth, cropHeight, aspectRatio, isFreestyleMode]);

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
    aspectRatio,
    isFreestyleMode,
    cursorStyle,
    isDragging,
    setAspectRatio,
    setIsFreestyleMode,
    initializeCrop,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    handleWheel,
    handleZoomIn,
    handleZoomOut,
    handleZoomReset,
    handleZoomToFit
  };
}

