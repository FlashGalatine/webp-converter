# Custom Hooks

This directory contains custom React hooks for managing application state in the WebP Converter.

## Available Hooks

### useImageState
Manages the currently loaded image.

### useCanvasState
Manages canvas viewport (zoom, pan, dimensions).

### useCropState
Manages crop area and aspect ratio.

### useQueueState
Manages image queue for batch processing.

### usePresetState
Manages preset selection and custom presets.

### useConversionSettings
Manages conversion settings (quality, dimensions, optimization).

### useCanvasInteraction
Manages canvas interaction state (drag, cursor).

### useClipboard
Handles clipboard paste events.

## Design Principles

1. **Single Responsibility**: Each hook manages a specific aspect of state
2. **Composability**: Hooks can be used together or independently
3. **Type Safety**: Full TypeScript support with return type interfaces
4. **Encapsulation**: Internal state and logic hidden from consumers
5. **Testability**: Pure functions and clear interfaces make testing easy
