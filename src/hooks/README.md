# Hooks

Custom React hooks for state management and side effects.

## Planned Hooks

- `useImageState.ts` - Image loading and management
- `useCanvasState.ts` - Canvas dimensions, zoom, pan
- `useCropState.ts` - Crop area with aspect ratio
- `useQueueState.ts` - Queue management
- `usePresetState.ts` - Preset selection and loading
- `useSettingsState.ts` - Quality, dimensions, optimization settings
- `useCanvasInteraction.ts` - Mouse/keyboard event handlers
- `useClipboard.ts` - Clipboard paste support

## Naming Convention

- Prefix all hooks with `use`
- Use camelCase: `useImageState`, `useCanvasInteraction`
- One hook per file
- Export as named export

## Hook Guidelines

- Keep hooks focused on one concern
- Document parameters and return values
- Use TypeScript for type safety
- Avoid side effects in hooks (unless that's their purpose)
- Return stable references (use useCallback/useMemo)
