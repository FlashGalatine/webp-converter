/**
 * Cursor mappings for canvas interactions
 */

import type { HandlePosition, CursorStyle } from '../types';

/**
 * Maps handle positions to cursor styles
 */
export const CURSOR_MAP: Record<HandlePosition, CursorStyle> = {
  nw: 'nwse-resize',
  se: 'nwse-resize',
  ne: 'nesw-resize',
  sw: 'nesw-resize',
  n: 'ns-resize',
  s: 'ns-resize',
  e: 'ew-resize',
  w: 'ew-resize',
} as const;
