/**
 * Canvas drawing utilities
 */

import { CROP_HANDLE_SIZE } from '../../constants';
import type { Point } from '../../types';

/**
 * Clears the canvas with a background color
 *
 * @param ctx - Canvas rendering context
 * @param width - Canvas width
 * @param height - Canvas height
 * @param color - Background color (default: dark gray)
 */
export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string = '#2b2b2b'
): void {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
}

/**
 * Draws an image on the canvas with zoom and pan
 *
 * @param ctx - Canvas rendering context
 * @param image - HTML image element
 * @param x - X position
 * @param y - Y position
 * @param width - Display width
 * @param height - Display height
 */
export function drawImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  ctx.drawImage(image, x, y, width, height);
}

/**
 * Draws the darkened overlay outside the crop area
 *
 * @param ctx - Canvas rendering context
 * @param canvasWidth - Canvas width
 * @param canvasHeight - Canvas height
 * @param cropX - Crop X in canvas coordinates
 * @param cropY - Crop Y in canvas coordinates
 * @param cropWidth - Crop width in canvas coordinates
 * @param cropHeight - Crop height in canvas coordinates
 * @param opacity - Overlay opacity (default: 0.5)
 */
export function drawCropOverlay(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  cropX: number,
  cropY: number,
  cropWidth: number,
  cropHeight: number,
  opacity: number = 0.5
): void {
  ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;

  // Top
  ctx.fillRect(0, 0, canvasWidth, cropY);

  // Left
  ctx.fillRect(0, cropY, cropX, cropHeight);

  // Right
  ctx.fillRect(cropX + cropWidth, cropY, canvasWidth, cropHeight);

  // Bottom
  ctx.fillRect(0, cropY + cropHeight, canvasWidth, canvasHeight);
}

/**
 * Draws the crop border rectangle
 *
 * @param ctx - Canvas rendering context
 * @param x - X position
 * @param y - Y position
 * @param width - Width
 * @param height - Height
 * @param color - Border color (default: amber)
 * @param lineWidth - Border width (default: 2)
 */
export function drawCropBorder(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string = '#fbbf24',
  lineWidth: number = 2
): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.strokeRect(x, y, width, height);
}

/**
 * Draws the rule of thirds grid inside crop area
 *
 * @param ctx - Canvas rendering context
 * @param x - Crop X position
 * @param y - Crop Y position
 * @param width - Crop width
 * @param height - Crop height
 * @param color - Grid color (default: semi-transparent amber)
 */
export function drawRuleOfThirdsGrid(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string = 'rgba(251, 191, 36, 0.5)'
): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;

  // Vertical lines
  const third1X = x + width / 3;
  const third2X = x + (2 * width) / 3;

  ctx.beginPath();
  ctx.moveTo(third1X, y);
  ctx.lineTo(third1X, y + height);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(third2X, y);
  ctx.lineTo(third2X, y + height);
  ctx.stroke();

  // Horizontal lines
  const third1Y = y + height / 3;
  const third2Y = y + (2 * height) / 3;

  ctx.beginPath();
  ctx.moveTo(x, third1Y);
  ctx.lineTo(x + width, third1Y);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x, third2Y);
  ctx.lineTo(x + width, third2Y);
  ctx.stroke();
}

/**
 * Draws crop resize handles
 *
 * @param ctx - Canvas rendering context
 * @param handles - Array of handle positions
 * @param fillColor - Handle fill color (default: white)
 * @param strokeColor - Handle stroke color (default: black)
 */
export function drawCropHandles(
  ctx: CanvasRenderingContext2D,
  handles: Point[],
  fillColor: string = '#ffffff',
  strokeColor: string = '#000000'
): void {
  ctx.fillStyle = fillColor;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 1;

  handles.forEach((handle) => {
    const x = handle.x - CROP_HANDLE_SIZE / 2;
    const y = handle.y - CROP_HANDLE_SIZE / 2;

    ctx.fillRect(x, y, CROP_HANDLE_SIZE, CROP_HANDLE_SIZE);
    ctx.strokeRect(x, y, CROP_HANDLE_SIZE, CROP_HANDLE_SIZE);
  });
}

/**
 * Gets handle positions for the current crop
 *
 * @param cropX - Crop X in canvas coordinates
 * @param cropY - Crop Y in canvas coordinates
 * @param cropWidth - Crop width in canvas coordinates
 * @param cropHeight - Crop height in canvas coordinates
 * @returns Array of handle positions
 */
export function getCropHandlePositions(
  cropX: number,
  cropY: number,
  cropWidth: number,
  cropHeight: number
): Point[] {
  return [
    { x: cropX, y: cropY }, // NW
    { x: cropX + cropWidth / 2, y: cropY }, // N
    { x: cropX + cropWidth, y: cropY }, // NE
    { x: cropX + cropWidth, y: cropY + cropHeight / 2 }, // E
    { x: cropX + cropWidth, y: cropY + cropHeight }, // SE
    { x: cropX + cropWidth / 2, y: cropY + cropHeight }, // S
    { x: cropX, y: cropY + cropHeight }, // SW
    { x: cropX, y: cropY + cropHeight / 2 }, // W
  ];
}

/**
 * Draws text on canvas with background
 *
 * @param ctx - Canvas rendering context
 * @param text - Text to draw
 * @param x - X position
 * @param y - Y position
 * @param options - Drawing options
 */
export function drawTextWithBackground(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  options?: {
    fontSize?: number;
    fontFamily?: string;
    textColor?: string;
    backgroundColor?: string;
    padding?: number;
  }
): void {
  const {
    fontSize = 14,
    fontFamily = 'sans-serif',
    textColor = '#ffffff',
    backgroundColor = 'rgba(0, 0, 0, 0.7)',
    padding = 4,
  } = options || {};

  ctx.font = `${fontSize}px ${fontFamily}`;
  const metrics = ctx.measureText(text);
  const textWidth = metrics.width;
  const textHeight = fontSize;

  // Draw background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(
    x - padding,
    y - textHeight - padding,
    textWidth + padding * 2,
    textHeight + padding * 2
  );

  // Draw text
  ctx.fillStyle = textColor;
  ctx.textBaseline = 'top';
  ctx.fillText(text, x, y - textHeight);
}

/**
 * Draws a loading spinner
 *
 * @param ctx - Canvas rendering context
 * @param centerX - Center X position
 * @param centerY - Center Y position
 * @param radius - Spinner radius
 * @param color - Spinner color
 * @param angleOffset - Current animation angle
 */
export function drawSpinner(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  color: string = '#fbbf24',
  angleOffset: number = 0
): void {
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(angleOffset);

  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 1.5);
  ctx.stroke();

  ctx.restore();
}
