# Utils

Pure utility functions organized by domain.

## Structure

- **imageProcessing/** - Image conversion, resampling, anti-aliasing
- **canvas/** - Canvas coordinate transforms, drawing utilities
- **presets/** - Preset parsing, validation, built-in presets
- **files/** - File naming, download management

## Naming Convention

- Use camelCase for function names
- Use descriptive names that indicate what the function does
- Group related functions in same file
- Export as named exports

## Utility Guidelines

- **Pure functions only** - No side effects, same input = same output
- **Well-documented** - JSDoc comments for all functions
- **Type-safe** - Full TypeScript coverage
- **Testable** - Easy to unit test
- **Single responsibility** - Each function does one thing well

## Example

```typescript
/**
 * Parses aspect ratio from string or number format
 * @param value - Aspect ratio as "16/9" or 1.777
 * @returns Parsed ratio as number or null
 */
export function parseAspectRatio(value: string | number | null): number | null {
  // Implementation
}
```
