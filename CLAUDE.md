# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WebP Converter is a client-side web application for converting images to WebP format with advanced cropping, presets, and batch processing capabilities. The project includes a dual-build strategy for the converter plus a companion preset editor tool:

- **STABLE** (`index.html`) - Production-ready converter build (v2.6.1)
- **EXPERIMENTAL** (`webp-conv-experimental.html`) - Testing build for new converter features
- **Preset Editor** (`preset-editor.html`) - Companion tool for creating and managing custom presets (v1.0.0)

All tools are **standalone single-file HTML applications** with no external dependencies beyond CDN-loaded libraries.

## Tech Stack

- React 18 (via CDN)
- Tailwind CSS (via CDN)
- Babel Standalone (for JSX transformation)
- Native Canvas API for image manipulation
- Native File API for file handling

## Development Quick Start

**No build process or server required.** Since this is a client-side application:

1. **Edit the HTML file** - All code is inline in a single HTML file
2. **Open in browser** - Simply open `index.html` or `webp-conv-experimental.html` directly (no file:// issues)
3. **Refresh to see changes** - Browser refresh applies edits immediately
4. **Use browser DevTools** - Open DevTools (F12) for debugging and console access
5. **No npm/build tools** - Everything works client-side with CDN libraries

### Key Commands

- **Testing**: No npm commands. Open the HTML file in a browser and test manually
- **Debugging**: Use browser DevTools Console (F12 → Console tab)
- **Git workflow**: Use `git commit`, `git push`, etc. for version control

## Architecture

### Single-File Application Structure

Both STABLE and EXPERIMENTAL builds follow this structure:
```html
<!DOCTYPE html>
<html>
  <head>
    <!-- CDN dependencies: React, ReactDOM, Babel, Tailwind CSS -->
  </head>
  <body>
    <div id="root"></div>
    <script type="text/babel">
      // All React code inline in a single script tag
      const BUILT_IN_PRESETS = { /* 16 presets */ };

      function WebPConverter() {
        // State management with React hooks
        // Canvas rendering and interaction
        // Image processing logic
        // Conversion pipeline
      }

      ReactDOM.render(<WebPConverter />, document.getElementById('root'));
    </script>
  </body>
</html>
```

### File Organization

**WebP Converter:**
- `index.html` - **STABLE v2.6.0** build (production)
- `webp-conv-experimental.html` - **EXPERIMENTAL** build (testing)

**Preset Editor:**
- `preset-editor.html` - **v1.0.0** Companion tool for creating and managing presets

**Documentation & Examples:**
- `presets.json` - Example custom presets for various platforms
- `example_presets.json` - Additional example presets for social media platforms
- `CHANGELOG.md` - Version history and release notes
- `README.md` - User-facing feature documentation
- `FAQ.md` - Frequently asked questions and troubleshooting
- `CLAUDE.md` - This file (developer guidance)
- `PROJECT_SUMMARY.md` - Project overview
- `LICENSE` - MIT License

### State Management

The application uses React hooks for all state. Key state categories:

1. **Image State**: `image`, `imageData`
2. **Queue State**: `imageQueue`, `currentImageIndex`, `processedImages`, `removeAfterConvert`
3. **Canvas State**: `zoomLevel`, `panX`, `panY`, `canvasWidth`, `canvasHeight`
4. **Crop State**: `cropX`, `cropY`, `cropWidth`, `cropHeight`, `aspectRatio`, `isFreestyleMode`
5. **Settings State**: `quality`, `lossless`, `maxWidth`, `maxHeight`, `webOptimize`, `targetSize`, `resamplingMethod`
6. **Preset State**: `useCustomPresets`, `customPresets`, `customPresetsRaw`, `selectedPreset`
7. **Interaction State**: `isDragging`, `dragType`, drag position tracking
8. **Optimization State**: `isOptimizing`, `optimizingProgress`, `optimizingStatus`

### Key Functions

**Image Loading & Queue:**
- `loadImage()` - Load single image from file input
- `addImagesToQueue()` - Add one or more images to queue
- `loadImageFromQueue()` - Load specific image from queue
- `loadNextImage()` / `loadPreviousImage()` - Navigate queue
- `markImageAsProcessed()` - Mark image as converted
- `removeImageFromQueue()` - Remove image from queue
- `clearQueue()` - Clear entire queue

**Canvas Interaction:**
- `handleMouseDown()` - Detect drag type (pan, move crop, resize handles)
- `handleMouseMove()` - Apply transformations during drag
- `handleMouseUp()` / `handleMouseLeave()` - Cleanup after drag
- `handleWheel()` - Zoom in/out with mouse wheel
- `detectHandle()` - Identify which crop handle is being dragged
- `isInsideCrop()` - Check if click is on crop area

**Conversion & Processing:**
- `handleConvert()` - Main conversion pipeline with quality optimization
- `resampleImage()` - Apply resampling with anti-aliasing
- `resample[Method]()` - Individual resampling methods (Bicubic, Lanczos, Bilinear, NearestNeighbor)
- `applyGaussianBlur()` - Anti-aliasing pre-filter for downsampling

**Preset Management:**
- `handlePresetFileSelect()` - Load custom presets from JSON
- `loadCustomPresets()` - Parse and process custom preset JSON
- `applyPresetSettings()` - Apply preset dimensions and constraints
- `BUILT_IN_PRESETS` - Object with 16 built-in aspect ratios

### Conversion Pipeline

1. User selects image and adjusts crop on canvas
2. Optional: Select or adjust crop preset
3. Optional: Enable Freestyle Mode to remove aspect ratio constraint
4. Optional: Set max width/height constraints or web optimization target
5. Click "Convert & Download" button
6. Processing steps:
   - Create temporary canvas with cropped region
   - Apply max width/height constraints if specified
   - If web optimization enabled: iterate quality from 100→1 until target size met
   - Apply resampling method if dimensions differ from crop
   - Apply Gaussian blur pre-filter for significant downsampling (anti-aliasing)
   - Convert to WebP blob
7. Download file with generated filename: `image-YYYY-MM-DD-WIDTHxHEIGHTpx-qQUALITY.webp`
8. If queue enabled: mark as processed, optionally remove from queue and auto-advance

### Canvas Coordinate System

The canvas uses a layered coordinate system:

```
Screen coords → Canvas coords → Image coords

// Screen to canvas (using canvas.getBoundingClientRect())
const rect = canvas.getBoundingClientRect();
const canvasX = e.clientX - rect.left;
const canvasY = e.clientY - rect.top;

// Canvas to image (accounting for zoom and pan)
const imgX = (canvasX - displayOffsetX - panX) / zoomLevel;
const imgY = (canvasY - displayOffsetY - panY) / zoomLevel;
```

### Freestyle Mode

Freestyle Mode (`isFreestyleMode`) disables aspect ratio constraints:
- Can be toggled independently without changing preset selection
- Preserves current crop area and settings when toggling
- Works with both built-in and custom presets
- Max-width/max-height constraints still apply during conversion
- Implemented in aspect ratio check: `if (aspectRatio && !isFreestyleMode)`

### Custom Presets System

JSON preset files can specify preset-specific settings:
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

When a preset is selected:
- Crop ratio sets aspect ratio constraint
- Max dimensions auto-populate constraints
- Target file size enables web optimization
- `default-selection` auto-selects preset based on image orientation (Square/Landscape/Portrait)

## Development Workflow

### Making Changes

1. **Always work in EXPERIMENTAL first** - Never modify STABLE (`index.html`) directly
   - Edit `webp-conv-experimental.html` first
   - Test thoroughly in browser
   - Once stable, copy changes to `index.html`

2. **Testing in Browser**
   - Open the HTML file directly (no server needed)
   - Use browser DevTools Console for debugging
   - Test with various image types: JPEG, PNG, GIF, WebP, etc.
   - Test edge cases: very large images, small images, various aspect ratios
   - Test queue system with 1, 5, 10, and 20+ images
   - Verify all presets work correctly

3. **Quality Assurance Checklist**
   - Image loading and display works correctly
   - Canvas interactions (zoom, pan, crop) work smoothly
   - All 16 built-in presets function properly
   - Custom preset loading works
   - Freestyle mode toggle works independently
   - Conversion produces valid WebP output
   - Filename generation includes correct metadata
   - Queue system: add, navigate, mark processed, remove
   - Auto-advance works after conversion
   - Remove After Convert feature works
   - Browser DevTools shows no errors or warnings

4. **Migration to STABLE**
   - Verify no regressions in existing features
   - Copy all changes from EXPERIMENTAL to `index.html` (STABLE)
   - Update `CHANGELOG.md` with new version entry
   - Update `README.md` with version information if needed
   - Test STABLE build on multiple browsers (Chrome, Firefox, Safari, Edge)
   - Create a single commit with all changes

5. **Version Numbering**
   - Current: **v2.6.1** (MAJOR.MINOR.PATCH format)
   - **MAJOR**: Significant features or breaking changes
   - **MINOR**: New features (presets, resampling methods, anti-aliasing)
   - **PATCH**: Bug fixes and minor improvements

## Code Patterns and Conventions

### Event Handlers

All event handlers use React synthetic events with descriptive names:
```javascript
const handleMouseDown = (e) => { /* detect drag type and start position */ };
const handleMouseMove = (e) => { /* apply transformations */ };
const handleMouseUp = (e) => { /* cleanup state */ };
const handleConvert = async () => { /* conversion pipeline */ };
const handleWheel = (e) => { /* zoom */ };
```

### State Updates with Dependencies

Always use functional updates when state depends on previous state:
```javascript
// Good - functional update
setImageQueue(prev => [...prev, ...newItems]);
setProcessedImages(prev => new Set([...prev, currentImageIndex]));

// Avoid - direct state reference
setImageQueue([...imageQueue, ...newItems]); // May use stale state
```

### Async Blob Creation

Canvas to blob conversion is always async:
```javascript
const blob = await new Promise(resolve => {
    canvas.toBlob(resolve, 'image/webp', quality / 100);
});
```

### Pixel Ratio Handling

Account for device pixel ratio for crisp rendering on high-DPI displays:
```javascript
const dpr = window.devicePixelRatio || 1;
// Scale canvas and context accordingly
```

## Debugging Tips

### Console Logging Strategy

For queue-related debugging:
```javascript
console.log('[Queue] Before conversion, index:', currentImageIndex);
console.log('[Queue] useCustomPresets:', useCustomPresets);
console.log('[Queue] After marking processed');
console.log('[Queue] removeAfterConvert:', removeAfterConvert);
```

For canvas interactions:
```javascript
console.log('[Canvas] Mouse at:', { canvasX, canvasY });
console.log('[Canvas] Drag type:', dragType);
console.log('[Crop] Position:', { cropX, cropY, cropWidth, cropHeight });
```

For conversion debugging:
```javascript
console.log('[Convert] Starting conversion');
console.log('[Convert] Web optimize:', webOptimize, 'Target:', targetSize);
console.log('[Convert] Resampling method:', resamplingMethod);
console.log('[Convert] Blob size:', blob.size, 'bytes');
```

### Browser DevTools Tips

1. **Console Tab** - View logs and errors
2. **Performance Tab** - Profile conversion performance
3. **Network Tab** - Verify CDN libraries load (React, Tailwind, Babel)
4. **Debugger Tab** - Set breakpoints in the inline script
5. **Application → Local Storage** - Check if any data is persisted

## Common Development Tasks

### Adding a New Built-in Preset

1. Find `BUILT_IN_PRESETS` object (around line 30 in both files)
2. Add entry: `"Preset Name": aspectRatioValue,` (e.g., `16/9` for landscape)
3. For aspect ratio `null`, use Freestyle: `"Freestyle": null`
4. Update UI preset selector (maps from `BUILT_IN_PRESETS` keys)
5. Test in both EXPERIMENTAL and STABLE
6. Update README.md with new preset in built-in list

### Fixing Canvas Interaction Issues

Check these functions in order:
1. `detectHandle()` - Verify handle detection logic
2. `isInsideCrop()` - Verify click detection on crop area
3. `handleMouseDown()` - Check drag type assignment
4. `handleMouseMove()` - Check transformation logic for drag type
5. `handleMouseUp()` - Check state cleanup

### Adding Quality/Performance Improvements

- **Resampling methods** are modular - add new `resample[MethodName](srcCanvas, dstCanvas)`
- **Anti-aliasing** is applied in resampling functions - modify Gaussian blur radius in `applyGaussianBlur()` if needed
- **Web optimization loop** in `handleConvert()` - modify quality iteration logic (around line 1290)

### Handling Edge Cases

1. **Very large images** - May exceed memory limits, test with 8K+ images
2. **Aspect ratio constraints** - Verify Freestyle mode disables them correctly
3. **Queue with custom presets** - Ensure preset settings apply correctly to each queue item
4. **Concurrent conversions** - App processes one image at a time, but queue handles multiple

## Known Issues and Fixed Bugs

### Freestyle Cropping (Fixed in v2.2.1)
- **Issue**: Dragging inside crop rectangle would pan image in Freestyle mode
- **Cause**: `aspectRatio === null` check in `isInsideCrop()` rejected Freestyle interactions
- **Fix**: Removed unnecessary check - only check `!image` to validate interaction
- **Status**: ✅ Fixed in both builds

### Queue Features with Custom Presets (Fixed in v2.0)
- **Issue**: Queue features (mark processed, auto-advance, remove after convert) didn't work with custom presets
- **Fix**: Ensured all code paths properly handle queue logic regardless of preset source
- **Status**: ✅ Fixed - all queue features work with built-in and custom presets

## Important Constraints

1. **Single-file architecture** - All code must remain in one HTML file per build
2. **No server required** - All processing happens 100% client-side
3. **No external dependencies beyond CDN** - React, Babel, and Tailwind loaded from unpkg.com
4. **Browser compatibility** - Requires modern browser with Canvas API and WebP support
5. **Memory constraints** - Large images (8K+) may exceed available memory
6. **No persistent storage** - App doesn't save state between sessions

## Preset Editor (preset-editor.html)

The Preset Editor is a companion tool for creating and managing custom presets without manual JSON editing.

### Features
- **Visual Interface**: User-friendly forms for all preset parameters
- **Ratio Format Support**: Accepts both ratio notation (`16/9`, `4/3`) and decimal format (`1.777`)
- **Add/Remove Presets**: Quick buttons to add new presets or remove existing ones
- **Reorder Presets**: Up/Down arrow buttons allow changing preset order
- **Import/Export**: Load existing presets.json files and export new ones
- **Drag-and-Drop**: Drop JSON files anywhere on the page to import
- **Real-time Validation**: Validates crop ratios, preset names, and detects duplicates
- **Default Selection Logic**: Enforces one preset per type (Square/Landscape/Portrait) with visual status indicator
- **JSON Preview**: Live preview of generated JSON before export

### Preset Reordering
Users can change the order of presets using the arrow buttons on each preset card:
- **Up Arrow (↑)**: Moves the preset one position up in the list
  - Disabled on the first preset (grayed out)
  - Blue color when enabled, gray when disabled
- **Down Arrow (↓)**: Moves the preset one position down in the list
  - Disabled on the last preset (grayed out)
  - Blue color when enabled, gray when disabled
- **Remove Button (−)**: Removes the preset entirely (always enabled)

The preset order is maintained when exporting to JSON, allowing you to control the order in which presets appear.

#### Animation Feedback
When a preset is moved, it displays a smooth animation:
- **Slide Animation**: The card smoothly slides up or down with a fade effect (0.4s)
- **Highlight Flash**: A blue glow briefly appears around the moved preset (0.6s)
- Together these effects provide visual feedback that the action was successful

### Reordering Functions
- `movePresetUp(id)`: Moves a preset up one position (if not already at top)
  - Triggers slide-up animation + highlight effect
  - Clears animation after 600ms
- `movePresetDown(id)`: Moves a preset down one position (if not already at bottom)
  - Triggers slide-down animation + highlight effect
  - Clears animation after 600ms
- Both functions use array swap logic and immediately update state

#### CSS Animations
Three keyframe animations provide smooth feedback:
- `slideUp`: Preset fades in while sliding upward
- `slideDown`: Preset fades in while sliding downward
- `highlight`: Blue glow effect that fades away

### Default Selection Validation
Only one preset can be assigned as the default for each image type:
- **Square**: One preset for square images (1:1)
- **Landscape**: One preset for landscape images (width > height)
- **Portrait**: One preset for portrait images (height > width)

When a user attempts to assign a default-selection that's already taken:
1. A modal alert explains which preset currently has that selection
2. The change is prevented, preserving the existing assignment
3. A status panel displays current assignments with visual indicators (green = assigned, gray = unassigned)
4. Export validation double-checks for duplicates before creating the JSON file

### Validation Functions
- `getPresetWithDefaultSelection(selection, excludeId)`: Finds which preset has a specific default-selection
- `isDefaultSelectionTaken(selection, excludeId)`: Checks if a default-selection is already assigned
- Export validation counts default selections and prevents conflicts

### Architecture
- Standalone single-file HTML application (`preset-editor.html`)
- React 18 + Tailwind CSS (via CDN)
- No build process, no server required
- Works entirely client-side with file import/export via browser APIs

### How to Use
1. Open `preset-editor.html` in a browser
2. Click "Add Preset" to create new presets, or "Import JSON" to load existing ones
3. Alternatively, drag and drop a `presets.json` file onto the page
4. Edit preset details (supports both `16/9` and `1.777` ratio formats)
5. Click "Export JSON" to download your presets file
6. Use the exported file with WebP Converter by importing it

### Preset Parameters
- **Preset Name** (required) - Unique identifier for the preset
- **Crop Ratio** (optional) - `"16/9"`, `"4/3"`, `1.777`, or other format
- **Max Width** (optional) - Maximum export width in pixels
- **Max Height** (optional) - Maximum export height in pixels
- **Max File Size** (optional) - Target file size with unit (KB/MB/GB)
- **Default Selection** (optional) - Auto-select based on image orientation (Square/Landscape/Portrait)

## Recent Changes

### v2.6.1 (November 9, 2025)
**Bug Fixes & Code Quality Improvements**

**Bug Fixes:**
- **Fixed Auto-Load Presets Bug** - Aspect ratios from JSON presets now properly parse string formats like "16/9", "4/3" (was only handling numeric decimal values)
  - Uses `parseAspectRatio()` function which supports both formats
  - Enables custom presets with ratio notation to work correctly
- **Fixed Lanczos Resampling Error** - Resolved `ReferenceError: a is not defined` when using Lanczos resampling with certain presets
  - All references to `a` variable in loop bounds now use `LANCZOS_WINDOW_SIZE` constant
  - Prevents crashes during high-quality image downsampling
- **Fixed Blob URL Memory Leak** - Download cleanup now delayed to ensure completion
  - Changed `URL.revokeObjectURL(url)` to `setTimeout(() => URL.revokeObjectURL(url), 100)`
  - Prevents premature URL revocation that could interrupt downloads

**Performance Optimizations:**
- **Memoized Preset Selection** - `getCurrentPresets()` now uses `useMemo` hook
  - Eliminates unnecessary recalculation on every render
  - Only recalculates when `useCustomPresets` or `customPresets` changes

**Code Quality Improvements:**
- **Eliminated Magic Numbers** - Created 16 named constants for better maintainability
  - UI Constants: CANVAS_PADDING, CROP_HANDLE_SIZE, HANDLE_TOLERANCE, MIN_CROP_SIZE, ZOOM_MIN, ZOOM_MAX, etc.
  - Image Processing: MIN_BLUR_RADIUS, BLUR_THRESHOLD, GAUSSIAN_KERNEL_MULTIPLIER, LANCZOS_WINDOW_SIZE, etc.
- **Removed Code Duplication** - Consolidated queue handling logic
  - Created `handlePostConversionQueue()` helper function
  - Replaced 3 duplicate instances of queue management
- **Centralized Cursor Styling** - Unified cursor map into global constant
  - Removed 2 duplicate CURSOR_MAP definitions
  - Single source of truth for all cursor type mappings
- **Consistent Naming Conventions** - Standardized throughout codebase

**Accessibility Improvements:**
- **Canvas ARIA Labels** - Added dynamic accessibility descriptions
  - Shows current crop dimensions and zoom level
  - Updates in real-time for screen readers

### v2.6.0 (Prior Release)
**Aspect Ratio String Format & Preset Editor**
- Added `parseAspectRatio()` function supporting ratio notation: `"16/9"`, `"4/3"`, `"21/9"`
- Maintains backward compatibility with decimal format: `1.777`, `1.333`
- Created new Preset Editor tool (`preset-editor.html`) for visual preset management
- Added drag-and-drop import support in Preset Editor
- Enhanced validation for crop ratios and preset names
- **Default Selection Logic**: Only one preset allowed per type (Square/Landscape/Portrait)
  - User alerts prevent conflicting assignments
  - Visual status indicator shows current assignments
  - Export validation prevents duplicate default selections

## File References for Key Locations

**Preset management**: `BUILT_IN_PRESETS` object (line ~30 in both files)
**State initialization**: `WebPConverter()` function start (line ~49 in both files)
**Canvas rendering**: Search for `<canvas ref=` in JSX
**Conversion logic**: `handleConvert()` function (line ~1180 in both files)
**Queue functions**: `loadNextImage()`, `loadPreviousImage()`, `markImageAsProcessed()`
**Resampling**: `resampleImage()` and `resample[Method]()` functions
**Anti-aliasing**: `applyGaussianBlur()` function
