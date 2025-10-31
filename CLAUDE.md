# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WebP Converter is a client-side web application for converting images to WebP format with advanced cropping, presets, and batch processing capabilities. The project uses a dual-build strategy:

- **STABLE** (`index.html`) - Production-ready build (v2.2.1)
- **EXPERIMENTAL** (`webp-converter-web-EXPERIMENTAL.html`) - Testing build for new features

All builds are **standalone single-file HTML applications** with no external dependencies beyond CDN-loaded libraries.

## Tech Stack

- React 18 (via CDN)
- Tailwind CSS (via CDN)
- Babel Standalone (for JSX transformation)
- Native Canvas API for image manipulation
- Native File API for file handling

## Architecture

### Single-File Application Structure

Both STABLE and EXPERIMENTAL builds follow this structure:
```html
<!DOCTYPE html>
<html>
  <head>
    <!-- CDN dependencies -->
  </head>
  <body>
    <div id="root"></div>
    <script type="text/babel">
      // All React code inline
      function WebPConverter() {
        // State management with React hooks
        // Component logic
        // Event handlers
        // Rendering
      }
      ReactDOM.render(<WebPConverter />, document.getElementById('root'));
    </script>
  </body>
</html>
```

### State Management

The application uses React hooks for all state management. Key state categories:

1. **Image State**: `image`, `imageData`
2. **Queue State**: `imageQueue`, `currentImageIndex`, `processedImages`, `removeAfterConvert`
3. **Canvas State**: `zoomLevel`, `panX`, `panY`, `canvasWidth`, `canvasHeight`
4. **Crop State**: `cropX`, `cropY`, `cropWidth`, `cropHeight`, `aspectRatio`
5. **Settings State**: `quality`, `lossless`, `maxWidth`, `maxHeight`, `webOptimize`, `targetSize`, `resamplingMethod`
6. **Preset State**: `useCustomPresets`, `customPresets`, `customPresetsRaw`, `customPresetsFileName`, `selectedPreset`
7. **Interaction State**: `isDragging`, `dragType`, drag positions, `cursorStyle`
8. **Optimization State**: `isOptimizing`, `optimizingProgress`, `optimizingStatus`

### Key Functions

- **Image Loading**: `loadImage()`, `addImagesToQueue()`, `loadImageFromQueue()`
- **Queue Management**: `loadNextImage()`, `loadPreviousImage()`, `markImageAsProcessed()`, `removeImageFromQueue()`, `clearQueue()`
- **Canvas Interaction**: `handleMouseDown()`, `handleMouseMove()`, `handleMouseUp()`, `handleMouseLeave()`, `handleWheel()`
- **Conversion**: `handleConvert()` - Main conversion logic with quality optimization
- **Preset Management**: `handlePresetFileSelect()`, `loadCustomPresets()`, `applyPresetSettings()`
- **Resampling**: `resampleImage()`, `resampleBicubic()`, `resampleLanczos()`, `resampleBilinear()`, `resampleNearestNeighbor()`, `applyGaussianBlur()`

### Conversion Pipeline

1. User crops image on canvas (manual drag/resize or preset-based)
2. Click "Convert & Download"
3. Create temporary canvas with cropped region
4. Apply max width/height constraints if specified
5. If web optimization enabled:
   - Test lossless compression first
   - If too large, iterate quality from 100→1 until target size met
6. Apply resampling if dimensions changed
7. Convert to WebP blob
8. Download file with generated filename
9. Mark as processed and auto-advance to next image (or remove from queue)

### Custom Presets System

JSON preset files can specify:
```json
{
  "Preset Name": {
    "crop-ratio": 1.5,
    "max-width": 1920,
    "max-height": 1080,
    "max-filesize": 1,
    "max-filesize-unit": "MB",
    "default-selection": "Landscape"
  }
}
```

When a preset is selected, these values automatically populate the corresponding settings. The `default-selection` key is used to determine which preset should be auto-selected based on image dimensions.

## Development Workflow

### Making Changes

1. **Always work in EXPERIMENTAL first** - Never modify STABLE directly
2. Test changes thoroughly in EXPERIMENTAL build
3. Once stable and tested, copy changes to STABLE (`index.html`)
4. Update version numbers in CHANGELOG.md and README.md
5. Commit all changes with descriptive messages

### Testing

Since this is a client-side application:
- Open the HTML file directly in a browser (no server needed)
- Test with various image types (JPEG, PNG, GIF, etc.)
- Test edge cases (very large images, small images, various aspect ratios)
- Test queue system with 1, 5, 10, and 20+ images
- Use browser DevTools console for debugging

### Running the App

**No build process required** - Simply open the HTML file in a browser:
- Open `index.html` for STABLE version
- Open `webp-converter-web-EXPERIMENTAL.html` for EXPERIMENTAL version
- Changes require browser refresh to see effects

## File Structure

- `index.html` - STABLE v2.2.1 build (default/production)
- `webp-converter-web-EXPERIMENTAL.html` - EXPERIMENTAL v2.2.1 build
- `presets.json` - Example custom presets (21 presets for various platforms)
- `CHANGELOG.md` - Version history and release notes
- `README.md` - User-facing feature documentation
- `PROJECT_SUMMARY.md` - Project overview and features
- `LICENSE` - MIT License

## Code Patterns and Conventions

### Event Handlers

All event handlers use React synthetic events and follow the pattern `handle[EventName]`:
```javascript
const handleMouseDown = (e) => { /* ... */ };
const handleConvert = async () => { /* ... */ };
```

### Canvas Coordinate Conversion

Convert between screen coordinates and image coordinates:
```javascript
// Screen to canvas
const rect = canvas.getBoundingClientRect();
const canvasX = e.clientX - rect.left;
const canvasY = e.clientY - rect.top;

// Canvas to image coordinates
const imgX = (canvasX - displayOffsetX - panX) / zoomLevel;
const imgY = (canvasY - displayOffsetY - panY) / zoomLevel;
```

### State Updates with Dependencies

When updating state that depends on previous state, always use functional updates:
```javascript
setImageQueue(prev => [...prev, ...newItems]);
setProcessedImages(prev => new Set([...prev, currentImageIndex]));
```

### Async Blob Creation

Canvas to blob conversion is always async:
```javascript
const blob = await new Promise(resolve => {
    canvas.toBlob(resolve, 'image/webp', quality / 100);
});
```

## Important Constraints

1. **Single-file architecture** - All code must remain in one HTML file per build
2. **No server required** - All processing happens client-side
3. **No NPM/build tools** - Must work with CDN libraries and inline code
4. **Browser compatibility** - Requires modern browser with Canvas and WebP support
5. **Memory constraints** - Large images (4K+) load full resolution into memory

## Migration Path: EXPERIMENTAL → STABLE

Before migrating features from EXPERIMENTAL to STABLE:
1. Test thoroughly in EXPERIMENTAL build with various images
2. Verify no regressions in existing features
3. Copy all changes to `index.html` (STABLE)
4. Update CHANGELOG.md with new version entry
5. Update README.md with version information
6. Test STABLE build on multiple browsers (Chrome, Firefox, Safari, Edge)
7. Create a single commit with all changes

**Example workflow for a bug fix:**
```
1. Apply fix to webp-converter-web-EXPERIMENTAL.html
2. Test in browser - verify fix works
3. Copy fix to index.html
4. Update CHANGELOG.md with bug fix entry
5. Update README.md version/date if needed
6. Commit: "Fix [issue] in both STABLE and EXPERIMENTAL builds"
```

## Known Issues and Debugging

### Freestyle Cropping (Fixed in v2.2.1)
- Previously: Dragging inside crop rectangle would pan image in Freestyle mode
- Cause: `aspectRatio === null` check in `isInsideCrop()` function
- Fix: Removed `aspectRatio === null` check - only check `!image`
- Files affected: Both `index.html` and `webp-converter-web-EXPERIMENTAL.html`

### Queue Features with Custom Presets (Status: Working)
- All queue features (mark as processed, auto-advance, remove after convert) work correctly with both built-in and custom presets
- Fixed in v2.0

### Console Logging Strategy for Debugging

For debugging queue-related issues:
```javascript
console.log('[Queue] Before conversion, index:', currentImageIndex);
console.log('[Queue] useCustomPresets:', useCustomPresets);
console.log('[Queue] After marking processed');
console.log('[Queue] removeAfterConvert:', removeAfterConvert);
```

For debugging canvas interactions:
```javascript
console.log('[Canvas] Mouse at:', { canvasX, canvasY });
console.log('[Crop] Position:', { cropX, cropY, cropWidth, cropHeight });
```

## Common Development Tasks

### Adding a New Built-in Preset

1. Find `BUILT_IN_PRESETS` object (line ~30 in EXPERIMENTAL, ~19 in STABLE)
2. Add new entry:
   ```javascript
   "Preset Name": aspectRatioValue, // e.g., 16/9 for landscape
   ```
3. For aspect ratio `null`, use Freestyle: `"Freestyle": null`
4. Test in both EXPERIMENTAL and STABLE
5. Update README.md if it's a notable preset

### Fixing Canvas Interaction Issues

1. Check `detectHandle()` function - handles detection logic
2. Check `isInsideCrop()` function - determines if click is on crop area
3. Check `handleMouseDown()` - sets drag type and initial state
4. Check `handleMouseMove()` - applies transformations based on drag type
5. Check `handleMouseUp()` - cleanup and state reset

### Adding Quality/Performance Improvements

- Resampling methods are modular - add new method as `resample[MethodName](srcCanvas, dstCanvas)`
- Anti-aliasing is applied in `resampleImage()` - modify blur radius calculation if needed
- Web optimization loop is in `handleConvert()` - quality iteration logic around line 1290

## Version Numbering

Current: **v2.2.1**

Format: `MAJOR.MINOR.PATCH`
- **MAJOR**: Significant feature additions or breaking changes
- **MINOR**: New features (resampling, queue system, anti-aliasing)
- **PATCH**: Bug fixes and minor improvements

## Recent Changes (v2.2.1)

- Fixed freestyle cropping drag bug in `isInsideCrop()` function
- Removed unnecessary `aspectRatio === null` check that blocked Freestyle mode interactions
- Applied fix to both STABLE and EXPERIMENTAL builds
- Updated CHANGELOG.md and README.md with v2.2.1 information
- Renamed `webp-converter-web.html` to `index.html` for web hosting convention

