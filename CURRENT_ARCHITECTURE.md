# Current Architecture Analysis

## Overview

This document provides a detailed analysis of the current WebP Converter architecture (v2.6.1) to guide the refactoring process.

**File:** `index.html`
**Size:** 2,199 lines
**Structure:** Single HTML file with inline React

---

## File Structure Breakdown

### Lines 1-99: HTML Head & Dependencies

**Content:**
- SEO meta tags (Open Graph, Twitter Cards)
- CDN imports:
  - React 18
  - ReactDOM 18
  - Babel Standalone (JSX transformation)
  - Tailwind CSS
- Favicon and theme configuration
- JSON-LD structured data

**Migration Target:**
- Move to `index.html` (minimal Vite template)
- SEO meta tags → `public/` folder or SSR
- CDN dependencies → `package.json` npm packages
- JSON-LD → separate component or config file

---

### Lines 100-148: Constants Definition

#### Built-in Presets (Lines 101-118)
```javascript
const BUILT_IN_PRESETS = {
    "Freestyle": null,
    "Square (1:1)": 1,
    "16:9 Landscape": 16/9,
    // ... 16 total presets
};
```

**Migration Target:** `src/constants/presets.ts` or `src/utils/presets/builtInPresets.ts`

#### UI/Canvas Constants (Lines 120-128)
```javascript
const CANVAS_PADDING = 40;
const CROP_HANDLE_SIZE = 10;
const HANDLE_TOLERANCE = 5;
const MIN_CROP_SIZE = 10;
const ZOOM_MIN = 0.1;
const ZOOM_MAX = 10;
const ZOOM_INITIAL_DELAY = 100;
const TRANSITION_DELAY = 500;
```

**Migration Target:** `src/constants/canvas.ts`

#### Image Processing Constants (Lines 130-136)
```javascript
const MIN_BLUR_RADIUS = 0.5;
const BLUR_THRESHOLD = 0.3;
const GAUSSIAN_KERNEL_MULTIPLIER = 3;
const LANCZOS_WINDOW_SIZE = 3;
const SIGNIFICANT_DOWNSAMPLE_THRESHOLD = 0.67;
const ASPECT_RATIO_TOLERANCE = 0.1;
```

**Migration Target:** `src/constants/imageProcessing.ts`

#### Cursor Map (Lines 139-148)
```javascript
const CURSOR_MAP = {
    'nw': 'nwse-resize',
    'se': 'nwse-resize',
    // ... 8 cursor mappings
};
```

**Migration Target:** `src/constants/cursors.ts`

---

### Lines 150-213: State Management (React Hooks)

#### Image State (Lines 152-153)
```javascript
const [image, setImage] = useState(null);
const [imageData, setImageData] = useState(null);
```

**Migration Target:** `src/hooks/useImageState.ts`

#### Queue State (Lines 156-159)
```javascript
const [imageQueue, setImageQueue] = useState([]);
const [currentImageIndex, setCurrentImageIndex] = useState(-1);
const [processedImages, setProcessedImages] = useState(new Set());
const [removeAfterConvert, setRemoveAfterConvert] = useState(false);
```

**Migration Target:** `src/hooks/useQueueState.ts`

#### Canvas State (Lines 162-166)
```javascript
const [canvasWidth, setCanvasWidth] = useState(1200);
const [canvasHeight, setCanvasHeight] = useState(800);
const [zoomLevel, setZoomLevel] = useState(1);
const [panX, setPanX] = useState(0);
const [panY, setPanY] = useState(0);
```

**Migration Target:** `src/hooks/useCanvasState.ts`

#### Crop State (Lines 169-174)
```javascript
const [cropX, setCropX] = useState(0);
const [cropY, setCropY] = useState(0);
const [cropWidth, setCropWidth] = useState(0);
const [cropHeight, setCropHeight] = useState(0);
const [aspectRatio, setAspectRatio] = useState(null);
const [isFreestyleMode, setIsFreestyleMode] = useState(false);
```

**Migration Target:** `src/hooks/useCropState.ts`

#### Settings State (Lines 177-188)
```javascript
const [selectedPreset, setSelectedPreset] = useState("16:9 Landscape");
const [quality, setQuality] = useState(95);
const [lossless, setLossless] = useState(false);
const [maxWidth, setMaxWidth] = useState('');
const [maxHeight, setMaxHeight] = useState('');
const [linkDimensions, setLinkDimensions] = useState(true);
const [webOptimize, setWebOptimize] = useState(false);
const [targetSize, setTargetSize] = useState('10');
const [resamplingMethod, setResamplingMethod] = useState('bicubic');
const [isOptimizing, setIsOptimizing] = useState(false);
const [optimizingProgress, setOptimizingProgress] = useState(0);
const [optimizingStatus, setOptimizingStatus] = useState('');
```

**Migration Target:** `src/hooks/useSettingsState.ts` or split into multiple hooks

#### Preset State (Lines 191-194)
```javascript
const [useCustomPresets, setUseCustomPresets] = useState(false);
const [customPresets, setCustomPresets] = useState({});
const [customPresetsRaw, setCustomPresetsRaw] = useState({});
const [customPresetsFileName, setCustomPresetsFileName] = useState('');
```

**Migration Target:** `src/hooks/usePresetState.ts`

#### Interaction State (Lines 197-207)
```javascript
const [isDragging, setIsDragging] = useState(false);
const [dragType, setDragType] = useState(null);
const [dragStartX, setDragStartX] = useState(0);
const [dragStartY, setDragStartY] = useState(0);
// ... more drag state
const [cursorStyle, setCursorStyle] = useState('default');
```

**Migration Target:** `src/hooks/useCanvasInteraction.ts`

#### Refs (Lines 209-212)
```javascript
const canvasRef = useRef(null);
const fileInputRef = useRef(null);
const presetFileInputRef = useRef(null);
const containerRef = useRef(null);
```

**Migration Target:** Component-level refs in respective components

---

### Lines 215-850: Utility Functions

#### Image Loading Functions (Lines 215-400)
- `loadImage()` - Load image from file
- `addImagesToQueue()` - Add multiple images to queue
- `loadImageFromQueue()` - Load specific queue item
- `loadNextImage()` / `loadPreviousImage()` - Navigate queue
- `removeImageFromQueue()` - Remove from queue
- `clearQueue()` - Clear all queue items
- `markImageAsProcessed()` - Mark as converted

**Migration Target:**
- `src/hooks/useImageState.ts` (loading logic)
- `src/hooks/useQueueState.ts` (queue management)

#### Preset Functions (Lines 280-450)
- `getCurrentPresets()` - Get active preset collection
- `parseAspectRatio()` - Parse "16/9" or 1.777 format
- `handlePresetFileSelect()` - Load custom preset JSON
- `loadCustomPresets()` - Parse preset JSON
- `applyPresetSettings()` - Apply preset config

**Migration Target:**
- `src/utils/presets/presetParser.ts`
- `src/utils/presets/aspectRatio.ts`
- `src/hooks/usePresetState.ts`

#### Canvas Functions (Lines 450-850)
- `initializeCrop()` - Set initial crop area
- `detectHandle()` - Detect which resize handle
- `isInsideCrop()` - Check if point is inside crop
- `handleMouseDown()` - Start drag interaction
- `handleMouseMove()` - Process drag
- `handleMouseUp()` / `handleMouseLeave()` - End drag
- `handleWheel()` - Zoom with mouse wheel
- `updateCanvasDimensions()` - Responsive canvas sizing

**Migration Target:**
- `src/utils/canvas/coordinates.ts` (transforms)
- `src/utils/canvas/interaction.ts` (handle detection)
- `src/hooks/useCanvasInteraction.ts` (event handlers)

---

### Lines 850-1600: Image Processing Functions

#### Resampling Algorithms (Lines 850-1200)
- `resampleImage()` - Main resampling dispatcher
- `resampleBicubic()` - Bicubic interpolation
- `resampleLanczos()` - Lanczos3 resampling
- `resampleBilinear()` - Bilinear interpolation
- `resampleNearestNeighbor()` - Nearest neighbor

**Migration Target:** `src/utils/imageProcessing/resampling.ts`

**Key Details:**
- Each algorithm is ~100-150 lines
- Complex mathematical operations
- Performance-critical code
- Good candidates for unit testing

#### Anti-aliasing (Lines 1200-1350)
- `applyGaussianBlur()` - Two-pass Gaussian blur
- Helper functions for blur calculation

**Migration Target:** `src/utils/imageProcessing/antialiasing.ts`

#### Conversion Logic (Lines 1350-1600)
- `handleConvert()` - Main conversion pipeline
- `handlePostConversionQueue()` - Post-conversion queue logic
- Blob creation and download

**Migration Target:**
- `src/utils/imageProcessing/conversion.ts`
- `src/utils/files/download.ts`

---

### Lines 1600-1900: React useEffect Hooks

#### Canvas Rendering (Lines 1600-1750)
```javascript
useEffect(() => {
    // Render canvas with image, crop overlay, handles
}, [image, cropX, cropY, cropWidth, cropHeight, zoomLevel, panX, panY, ...]);
```

**Migration Target:** `src/components/Canvas/ImageCanvas.tsx`

#### Auto-load Presets (Lines 1750-1850)
```javascript
useEffect(() => {
    // Auto-load presets.json from same directory
}, []);
```

**Migration Target:** `src/hooks/usePresetState.ts`

#### Clipboard Support (Lines 1850-1900)
```javascript
useEffect(() => {
    // Handle Ctrl+V / Cmd+V for paste
}, []);
```

**Migration Target:** `src/hooks/useClipboard.ts`

---

### Lines 1900-2190: JSX UI Rendering

#### Main Layout (Lines 1900-1950)
```jsx
return (
    <div className="container">
        {/* Header */}
        {/* Canvas Area */}
        {/* Controls */}
        {/* Queue */}
        {/* Footer */}
    </div>
);
```

**Migration Target:** `src/App.tsx` (layout) + individual components

#### Control Sections Breakdown:

**File Input (Lines 1950-1980)**
- Select image(s) button
- Drag & drop support

**Migration Target:** `src/components/Controls/FileInput.tsx`

**Canvas Area (Lines 1980-2010)**
- Canvas element with ref
- Status display

**Migration Target:** `src/components/Canvas/ImageCanvas.tsx`

**Preset Controls (Lines 2010-2050)**
- Preset source selector (Built-in/Custom)
- Preset dropdown
- Freestyle mode toggle

**Migration Target:**
- `src/components/Controls/PresetSelector.tsx`
- `src/components/Controls/FreestyleToggle.tsx`
- `src/components/Presets/PresetLoader.tsx`

**Quality Settings (Lines 2050-2080)**
- Quality slider
- Lossless checkbox
- Resampling method dropdown

**Migration Target:** `src/components/Controls/QualitySettings.tsx`

**Dimension Constraints (Lines 2080-2110)**
- Max width input
- Max height input
- Link dimensions toggle

**Migration Target:** `src/components/Controls/DimensionInputs.tsx`

**Web Optimization (Lines 2110-2140)**
- Enable checkbox
- Target size input
- Unit selector (KB/MB/GB)

**Migration Target:** `src/components/Controls/WebOptimization.tsx`

**Convert Button (Lines 2140-2160)**
- Main convert & download button
- Shows optimization progress

**Migration Target:** `src/components/Controls/ConvertButton.tsx`

**Queue Panel (Lines 2160-2190)**
- Queue item list
- Navigation controls
- Auto-advance toggle
- Remove after convert checkbox

**Migration Target:**
- `src/components/Queue/ImageQueue.tsx`
- `src/components/Queue/QueueItem.tsx`
- `src/components/Queue/QueueControls.tsx`

---

## Dependency Map

### Current Implicit Dependencies

Due to the monolithic structure, dependencies are implicit. Here's a mapping:

```
Canvas Rendering
├── image (state)
├── cropX, cropY, cropWidth, cropHeight (state)
├── zoomLevel, panX, panY (state)
├── canvasWidth, canvasHeight (state)
└── canvasRef (ref)

Crop Interaction
├── handleMouseDown → detectHandle, isInsideCrop
├── handleMouseMove → cursor updates
└── handleMouseUp → state cleanup

Conversion
├── handleConvert
│   ├── image, cropX, cropY, cropWidth, cropHeight
│   ├── quality, lossless, webOptimize
│   ├── maxWidth, maxHeight, resamplingMethod
│   ├── resampleImage → resampleBicubic/Lanczos/etc.
│   ├── applyGaussianBlur
│   └── handlePostConversionQueue
└── File download

Queue Management
├── imageQueue (state)
├── currentImageIndex (state)
├── processedImages (state)
├── loadImageFromQueue → loadImage
└── Navigation functions

Preset System
├── BUILT_IN_PRESETS (const)
├── customPresets (state)
├── parseAspectRatio (util)
├── loadCustomPresets (function)
└── applyPresetSettings (function)
```

**Migration Strategy:** Make these dependencies explicit through imports and function parameters.

---

## State Management Complexity

### Current Approach: Multiple useState Hooks

**Pros:**
- Simple and straightforward
- Easy to understand
- React-standard approach

**Cons:**
- 30+ state variables in one component
- Easy to create stale closures
- Difficult to track state flow

### Refactoring Approach: Custom Hooks

Split state into logical domains:

1. **useImageState** - Image loading and management
2. **useCanvasState** - Canvas dimensions, zoom, pan
3. **useCropState** - Crop area with aspect ratio
4. **useQueueState** - Queue management
5. **usePresetState** - Preset selection and loading
6. **useSettingsState** - Quality, dimensions, optimization
7. **useCanvasInteraction** - Mouse/keyboard interactions

Each hook encapsulates related state and logic.

**Future consideration:** Could migrate to useReducer or Zustand for complex state.

---

## Performance Considerations

### Current Performance Characteristics

**Strengths:**
- Canvas rendering is efficient with proper dependencies
- Memoized preset selection (v2.6.1)
- Efficient resampling algorithms

**Opportunities for Improvement:**
- Heavy re-renders due to many state updates
- No memoization on expensive calculations
- Canvas renders on every state change (even unrelated)
- Large function re-creation on each render

### Refactoring Performance Gains

1. **React.memo** on components that don't need frequent updates
2. **useMemo** for expensive calculations (resampling, blur)
3. **useCallback** for event handlers passed to children
4. **Code splitting** - Load resampling algorithms on demand
5. **Web Workers** - Move heavy processing off main thread (future)

---

## Testing Strategy for Migration

### Current Testing: Manual Only
- No unit tests
- No integration tests
- Manual browser testing only

### Post-Refactoring Testing Approach

#### Unit Tests (Vitest)
- Utility functions (resampling, aspect ratio parsing)
- Pure functions (coordinate transforms)
- Constants validation

#### Integration Tests (React Testing Library)
- Component interactions
- State management flows
- Event handling

#### E2E Tests (Playwright - optional)
- Full user workflows
- Browser compatibility
- Visual regression testing

---

## Code Quality Metrics

### Current State

**Complexity:**
- Single file: 2,199 lines
- Cyclomatic complexity: High (many nested conditions)
- Function length: Some functions >100 lines

**Maintainability Index:**
- Estimated: 40-50 (Poor to Fair)
- Due to: File size, coupling, lack of modularity

**TypeScript Coverage:** 0% (Pure JavaScript)

### Target Metrics Post-Refactor

**Complexity:**
- Max file size: <200 lines per module
- Average function length: <50 lines
- Cyclomatic complexity: <10 per function

**Maintainability Index:**
- Target: 70-85 (Good to Excellent)
- Through: Modularity, clear separation, documentation

**TypeScript Coverage:** 100%

---

## Migration Checklist

### Features to Preserve (100% Parity Required)

- [ ] Image loading (file select, drag-drop, paste)
- [ ] Canvas interaction (zoom, pan, crop)
- [ ] Crop handles (8 resize handles + move)
- [ ] Preset system (built-in + custom)
- [ ] Freestyle mode
- [ ] Quality settings (quality slider, lossless)
- [ ] Resampling methods (all 5 methods)
- [ ] Anti-aliasing (automatic Gaussian blur)
- [ ] Dimension constraints (max width/height, linked)
- [ ] Web optimization (target file size)
- [ ] Image queue (add, remove, navigate)
- [ ] Queue features (auto-advance, remove after convert)
- [ ] Auto-load presets.json
- [ ] Auto-select preset by image orientation
- [ ] Filename generation
- [ ] Download management
- [ ] Responsive canvas sizing
- [ ] Clipboard paste support
- [ ] All 16 built-in presets
- [ ] All cursor feedback
- [ ] All status messages

### Features to Improve

- [ ] Add loading states
- [ ] Better error handling
- [ ] Progress indicators for long operations
- [ ] Undo/redo functionality (future)
- [ ] Keyboard shortcuts (future)
- [ ] Batch conversion automation (future)

---

## Key Insights for Refactoring

1. **The canvas rendering logic is well-isolated** - Can be extracted cleanly to a component
2. **Resampling algorithms are pure functions** - Perfect for separate utility modules
3. **State management is already hook-based** - Can be split into custom hooks easily
4. **Preset system is well-defined** - Clear interface for migration
5. **Queue logic is independent** - Can be extracted to a separate hook/context
6. **No external dependencies beyond React** - Migration to npm packages is straightforward

---

## Conclusion

The current architecture has served the project well, reaching v2.6.1 with comprehensive features. However, the 2,200-line single-file structure has reached its limits for maintainability.

The code is well-organized within the single file, with clear sections for:
- Constants
- State
- Utility functions
- Effects
- UI rendering

This organization will make extraction to modules straightforward. The refactoring to Vite + TypeScript + modular components is a natural evolution that will:

- **Preserve** all existing functionality
- **Improve** code maintainability and testability
- **Enable** faster future development
- **Eliminate** the dual STABLE/EXPERIMENTAL build burden

The migration can proceed incrementally, ensuring feature parity at each phase.
