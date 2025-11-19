import React from 'react';

interface CanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  canvasWidth: number;
  canvasHeight: number;
  cursorStyle: string;
  image: HTMLImageElement | null;
  cropWidth: number;
  cropHeight: number;
  zoomLevel: number;
  onMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
  onWheel: (e: React.WheelEvent<HTMLCanvasElement>) => void;
}

export default function Canvas({
  canvasRef,
  canvasWidth,
  canvasHeight,
  cursorStyle,
  image,
  cropWidth,
  cropHeight,
  zoomLevel,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onMouseLeave,
  onWheel
}: CanvasProps) {
  if (!image) {
    return (
      <div className="text-center text-gray-500">
        <svg className="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-xl mb-2">No image loaded</p>
        <p className="text-sm">Click "Select Image" or drag & drop here</p>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onWheel={onWheel}
      className="border-2 border-gray-700"
      style={{ maxWidth: '100%', maxHeight: '100%', cursor: cursorStyle }}
      role="img"
      aria-label={`Image crop preview: ${Math.round(cropWidth)}x${Math.round(cropHeight)} pixels at ${(zoomLevel * 100).toFixed(0)}% zoom`}
    />
  );
}

