import { CROP_HANDLE_SIZE } from '../../constants/canvas';

export interface RenderParams {
  canvas: HTMLCanvasElement;
  image: HTMLImageElement;
  zoomLevel: number;
  panX: number;
  panY: number;
  cropX: number;
  cropY: number;
  cropWidth: number;
  cropHeight: number;
}

/**
 * Render image and crop overlay on canvas
 */
export function renderCanvas(params: RenderParams): void {
  const { canvas, image, zoomLevel, panX, panY, cropX, cropY, cropWidth, cropHeight } = params;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.error('Failed to get 2D canvas context');
    return;
  }
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;

  // Clear canvas
  ctx.fillStyle = '#2b2b2b';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Calculate display dimensions
  const displayWidth = image.width * zoomLevel;
  const displayHeight = image.height * zoomLevel;

  // Calculate image position (centered + pan)
  const imgX = (canvasWidth - displayWidth) / 2 + panX;
  const imgY = (canvasHeight - displayHeight) / 2 + panY;

  // Draw image
  ctx.drawImage(image, imgX, imgY, displayWidth, displayHeight);

  // Draw crop overlay if image is loaded and crop area has been initialized
  if (cropWidth > 0 && cropHeight > 0) {
    // Calculate crop coordinates in display space
    const cropDisplayX = imgX + cropX * zoomLevel;
    const cropDisplayY = imgY + cropY * zoomLevel;
    const cropDisplayWidth = cropWidth * zoomLevel;
    const cropDisplayHeight = cropHeight * zoomLevel;

    // Draw darkened overlay outside crop
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvasWidth, cropDisplayY); // Top
    ctx.fillRect(0, cropDisplayY, cropDisplayX, cropDisplayHeight); // Left
    ctx.fillRect(cropDisplayX + cropDisplayWidth, cropDisplayY, canvasWidth - cropDisplayX - cropDisplayWidth, cropDisplayHeight); // Right
    ctx.fillRect(0, cropDisplayY + cropDisplayHeight, canvasWidth, canvasHeight - cropDisplayY - cropDisplayHeight); // Bottom

    // Draw crop border
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.strokeRect(cropDisplayX, cropDisplayY, cropDisplayWidth, cropDisplayHeight);

    // Draw rule of thirds grid
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
    ctx.lineWidth = 1;

    // Vertical lines
    const third1X = cropDisplayX + cropDisplayWidth / 3;
    const third2X = cropDisplayX + (2 * cropDisplayWidth) / 3;
    ctx.beginPath();
    ctx.moveTo(third1X, cropDisplayY);
    ctx.lineTo(third1X, cropDisplayY + cropDisplayHeight);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(third2X, cropDisplayY);
    ctx.lineTo(third2X, cropDisplayY + cropDisplayHeight);
    ctx.stroke();

    // Horizontal lines
    const third1Y = cropDisplayY + cropDisplayHeight / 3;
    const third2Y = cropDisplayY + (2 * cropDisplayHeight) / 3;
    ctx.beginPath();
    ctx.moveTo(cropDisplayX, third1Y);
    ctx.lineTo(cropDisplayX + cropDisplayWidth, third1Y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cropDisplayX, third2Y);
    ctx.lineTo(cropDisplayX + cropDisplayWidth, third2Y);
    ctx.stroke();

    // Draw resize handles
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;

    const handles = [
      { x: cropDisplayX, y: cropDisplayY }, // NW
      { x: cropDisplayX + cropDisplayWidth / 2, y: cropDisplayY }, // N
      { x: cropDisplayX + cropDisplayWidth, y: cropDisplayY }, // NE
      { x: cropDisplayX + cropDisplayWidth, y: cropDisplayY + cropDisplayHeight / 2 }, // E
      { x: cropDisplayX + cropDisplayWidth, y: cropDisplayY + cropDisplayHeight }, // SE
      { x: cropDisplayX + cropDisplayWidth / 2, y: cropDisplayY + cropDisplayHeight }, // S
      { x: cropDisplayX, y: cropDisplayY + cropDisplayHeight }, // SW
      { x: cropDisplayX, y: cropDisplayY + cropDisplayHeight / 2 } // W
    ];

    handles.forEach(handle => {
      ctx.fillRect(handle.x - CROP_HANDLE_SIZE / 2, handle.y - CROP_HANDLE_SIZE / 2, CROP_HANDLE_SIZE, CROP_HANDLE_SIZE);
      ctx.strokeRect(handle.x - CROP_HANDLE_SIZE / 2, handle.y - CROP_HANDLE_SIZE / 2, CROP_HANDLE_SIZE, CROP_HANDLE_SIZE);
    });
  }
}

