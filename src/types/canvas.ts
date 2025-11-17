/**
 * Canvas-related type definitions
 */

/**
 * Handle position for crop resize
 */
export type HandlePosition =
  | 'nw' // Northwest (top-left)
  | 'ne' // Northeast (top-right)
  | 'sw' // Southwest (bottom-left)
  | 'se' // Southeast (bottom-right)
  | 'n' // North (top)
  | 's' // South (bottom)
  | 'e' // East (right)
  | 'w'; // West (left)

/**
 * Drag interaction type
 */
export type DragType =
  | 'pan' // Panning the image
  | 'move' // Moving the crop area
  | `resize-${HandlePosition}`; // Resizing crop area from a handle

/**
 * Cursor style for canvas interactions
 */
export type CursorStyle =
  | 'default'
  | 'grab'
  | 'grabbing'
  | 'move'
  | 'nwse-resize'
  | 'nesw-resize'
  | 'ns-resize'
  | 'ew-resize';

/**
 * Crop area definition
 */
export interface CropArea {
  /** X position (left) in image coordinates */
  x: number;
  /** Y position (top) in image coordinates */
  y: number;
  /** Width in pixels */
  width: number;
  /** Height in pixels */
  height: number;
  /** Aspect ratio constraint (width/height) or null for freestyle */
  aspectRatio: number | null;
}

/**
 * Canvas dimensions and viewport
 */
export interface CanvasViewport {
  /** Canvas width in pixels */
  width: number;
  /** Canvas height in pixels */
  height: number;
  /** Device pixel ratio */
  devicePixelRatio: number;
}

/**
 * Canvas transform state (zoom and pan)
 */
export interface CanvasTransform {
  /** Zoom level (1 = 100%, 2 = 200%, etc.) */
  zoomLevel: number;
  /** Pan offset X in pixels */
  panX: number;
  /** Pan offset Y in pixels */
  panY: number;
}

/**
 * Point in 2D space
 */
export interface Point {
  /** X coordinate */
  x: number;
  /** Y coordinate */
  y: number;
}

/**
 * Rectangle bounds
 */
export interface Rect {
  /** Left edge X coordinate */
  x: number;
  /** Top edge Y coordinate */
  y: number;
  /** Width */
  width: number;
  /** Height */
  height: number;
}

/**
 * Drag interaction state
 */
export interface DragState {
  /** Whether currently dragging */
  isDragging: boolean;
  /** Type of drag interaction */
  dragType: DragType | null;
  /** Starting mouse position */
  startPosition: Point;
  /** Starting crop area */
  startCrop: CropArea;
  /** Starting transform */
  startTransform: CanvasTransform;
  /** Current cursor style */
  cursorStyle: CursorStyle;
}

/**
 * Canvas interaction state
 */
export interface CanvasInteractionState {
  /** Mouse position in canvas coordinates */
  mousePosition: Point | null;
  /** Whether mouse is over canvas */
  isMouseOver: boolean;
  /** Current drag state */
  dragState: DragState;
  /** Whether freestyle mode is enabled */
  isFreestyleMode: boolean;
}

/**
 * Complete canvas state
 */
export interface CanvasState {
  /** Canvas viewport */
  viewport: CanvasViewport;
  /** Transform (zoom/pan) */
  transform: CanvasTransform;
  /** Crop area */
  crop: CropArea;
  /** Interaction state */
  interaction: CanvasInteractionState;
}

/**
 * Coordinate conversion result
 */
export interface CoordinateConversion {
  /** Canvas coordinates */
  canvas: Point;
  /** Image coordinates */
  image: Point;
  /** Screen coordinates */
  screen: Point;
}

/**
 * Handle bounds for hit detection
 */
export interface HandleBounds {
  /** Handle position identifier */
  position: HandlePosition;
  /** Bounding rectangle in canvas coordinates */
  bounds: Rect;
}
