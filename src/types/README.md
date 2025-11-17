# Types

TypeScript type definitions and interfaces.

## Planned Type Files

- `image.ts` - Image, ImageData, ImageFile types
- `preset.ts` - Preset, CustomPreset, PresetConfig types
- `canvas.ts` - CanvasState, CropArea, Transform types
- `queue.ts` - QueueItem, QueueState types

## Naming Convention

- Use PascalCase for types and interfaces
- Use descriptive names
- Prefix interfaces with `I` (optional, but can help distinguish)
- Use `type` for unions and aliases
- Use `interface` for object shapes

## Type Guidelines

- **Comprehensive** - Cover all data structures
- **Well-documented** - JSDoc comments for complex types
- **Reusable** - Import and reuse across the codebase
- **Strict** - Avoid `any`, use specific types
- **Organized** - Group related types in same file

## Example

```typescript
/**
 * Represents an image in the queue
 */
export interface QueueItem {
  /** Unique identifier */
  id: string;
  /** Image file */
  file: File;
  /** Preview data URL */
  preview: string;
  /** Whether image has been processed */
  processed: boolean;
}

/**
 * Resampling method options
 */
export type ResamplingMethod =
  | 'bicubic'
  | 'lanczos'
  | 'bilinear'
  | 'nearest'
  | 'browser';
```
