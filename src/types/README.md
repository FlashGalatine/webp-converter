# Types

TypeScript type definitions and interfaces for WebP Converter.

## Type Files

### Core Data Types

- **`image.ts`** - Image-related types
  - `ImageElement`, `ImageFile`, `LoadedImage`
  - `ImageMetadata`, `ConversionResult`

- **`preset.ts`** - Preset-related types
  - `BuiltInPreset`, `CustomPresetConfig`, `ParsedPreset`
  - `PresetCollection`, `PresetState`
  - `DefaultSelection`, `FileSizeUnit`

- **`canvas.ts`** - Canvas and interaction types
  - `CropArea`, `CanvasViewport`, `CanvasTransform`
  - `DragState`, `CanvasInteractionState`, `CanvasState`
  - `HandlePosition`, `DragType`, `CursorStyle`
  - `Point`, `Rect`, `HandleBounds`

- **`queue.ts`** - Queue management types
  - `QueueItem`, `QueueState`, `QueueStats`
  - `BatchProcessingOptions`, `QueueActionResult`
  - `QueueItemStatus`, `NavigationDirection`

- **`settings.ts`** - Settings and configuration types
  - `QualitySettings`, `DimensionSettings`, `WebOptimizationSettings`
  - `ConversionSettings`, `SettingsState`
  - `OptimizationProgress`, `FilenameTemplateVars`
  - `ResamplingMethod`

### Constants and Enumerations

- **`enums.ts`** - Enumeration constants
  - `ResamplingMethods`, `ResamplingMethodLabels`
  - `FileSizeUnits`, `FileSizeMultipliers`
  - `DefaultSelections`, `QueueItemStatuses`
  - `HandlePositions`, `DragTypes`, `CursorStyles`
  - `KeyboardKeys`, `ImageMimeTypes`, `ErrorTypes`

### Barrel Export

- **`index.ts`** - Central export point for all types
  - Import any type: `import { QueueItem, CropArea } from '@/types'`

## Naming Conventions

- **Interfaces**: PascalCase (e.g., `QueueItem`, `CropArea`)
- **Types**: PascalCase for aliases (e.g., `ResamplingMethod`, `DragType`)
- **Enums**: PascalCase with `s` suffix (e.g., `ResamplingMethods`, `DragTypes`)
- **Constants**: SCREAMING_SNAKE_CASE within enums

## Type Guidelines

### Use Interfaces for Objects
```typescript
export interface QueueItem {
  id: string;
  file: File;
  status: QueueItemStatus;
}
```

### Use Types for Unions and Aliases
```typescript
export type ResamplingMethod =
  | 'bicubic'
  | 'lanczos'
  | 'bilinear'
  | 'nearest'
  | 'browser';
```

### Document Complex Types
```typescript
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
```

### Use Const Assertions for Enums
```typescript
export const ResamplingMethods = {
  BICUBIC: 'bicubic',
  LANCZOS: 'lanczos',
} as const;
```

## Import Examples

```typescript
// Import specific types
import { QueueItem, QueueState } from '@/types';

// Import enums
import { ResamplingMethods, FileSizeUnits } from '@/types';

// Import everything (not recommended)
import * as Types from '@/types';
```

## Type Coverage

All major data structures in the application are typed:
- ✅ Image loading and conversion
- ✅ Canvas state and interactions
- ✅ Crop area and transformations
- ✅ Queue management
- ✅ Settings and configuration
- ✅ Preset system (built-in and custom)
- ✅ File size optimization
- ✅ Resampling methods
- ✅ Error handling

## Benefits

- **Type Safety**: Catch errors at compile time
- **Intellisense**: Better autocomplete in IDE
- **Documentation**: Types serve as inline documentation
- **Refactoring**: Safer code changes
- **Consistency**: Enforced data structure contracts
