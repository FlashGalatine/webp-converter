# Constants

Application-wide constants organized by domain.

## Planned Constant Files

- `canvas.ts` - Canvas UI constants (padding, handle size, zoom limits)
- `imageProcessing.ts` - Image processing constants (blur threshold, Lanczos window)
- `cursors.ts` - Cursor type mappings

## Naming Convention

- Use SCREAMING_SNAKE_CASE for constants
- Use descriptive names
- Group related constants in objects when appropriate
- Export as named exports

## Constant Guidelines

- **Immutable** - Use `const` for all constants
- **Typed** - Include TypeScript types
- **Documented** - Explain what each constant represents
- **Centralized** - No magic numbers in code
- **Organized** - Group by domain

## Example

```typescript
/**
 * Canvas UI constants
 */

/** Padding around canvas edges (px) */
export const CANVAS_PADDING = 40;

/** Size of crop resize handles (px) */
export const CROP_HANDLE_SIZE = 10;

/** Tolerance for handle hit detection (px) */
export const HANDLE_TOLERANCE = 5;

/** Minimum crop size (px) */
export const MIN_CROP_SIZE = 10;

/** Minimum zoom level */
export const ZOOM_MIN = 0.1;

/** Maximum zoom level */
export const ZOOM_MAX = 10;

/**
 * Cursor mappings for canvas interactions
 */
export const CURSOR_MAP = {
  nw: 'nwse-resize',
  se: 'nwse-resize',
  ne: 'nesw-resize',
  sw: 'nesw-resize',
  n: 'ns-resize',
  s: 'ns-resize',
  e: 'ew-resize',
  w: 'ew-resize',
} as const;
```
