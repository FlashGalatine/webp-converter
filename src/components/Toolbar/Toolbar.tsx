/**
 * Toolbar component with zoom controls
 */

import { Button } from '../ui';

export interface ToolbarProps {
  /** Current zoom level */
  zoomLevel: number;
  /** Zoom in handler */
  onZoomIn: () => void;
  /** Zoom out handler */
  onZoomOut: () => void;
  /** Zoom to fit handler */
  onZoomToFit: () => void;
  /** Zoom reset (100%) handler */
  onZoomReset: () => void;
  /** Whether image is loaded */
  hasImage: boolean;
}

/**
 * Toolbar with zoom controls
 */
export function Toolbar({
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onZoomToFit,
  onZoomReset,
  hasImage,
}: ToolbarProps) {
  return (
    <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Zoom:</span>
        <Button
          size="sm"
          variant="secondary"
          onClick={onZoomOut}
          disabled={!hasImage}
          title="Zoom out (-)"
        >
          −
        </Button>
        <span className="text-sm font-mono min-w-[4rem] text-center">
          {(zoomLevel * 100).toFixed(0)}%
        </span>
        <Button
          size="sm"
          variant="secondary"
          onClick={onZoomIn}
          disabled={!hasImage}
          title="Zoom in (+)"
        >
          +
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={onZoomReset}
          disabled={!hasImage}
          title="Reset zoom (0)"
        >
          100%
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={onZoomToFit}
          disabled={!hasImage}
          title="Fit to screen (F)"
        >
          Fit
        </Button>
      </div>

      <div className="ml-auto text-xs text-gray-500">
        Keyboard: +/− to zoom, 0 to reset, F to fit, drag to pan
      </div>
    </div>
  );
}
