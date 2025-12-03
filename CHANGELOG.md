# WebP Converter - Version Information

## Current Releases

### STABLE Build v2.6.5
**File:** `index.html` (default)
**Status:** Production Ready ✅
**Date:** December 3, 2025

**Latest Improvements:**
- ✅ Fixed critical canvas context null checks to prevent crashes
- ✅ Fixed overlay drawing dimensions in crop preview
- ✅ Fixed race conditions in image queue auto-load
- ✅ Added validation for zero/negative dimensions and aspect ratios
- ✅ Resolved all TypeScript build errors in test files
- ✅ Improved code robustness with comprehensive error handling

See [Version History](#version-history) for detailed release notes.

---

### STABLE Build v2.6.2
**File:** `index.html` (default)
**Status:** Production Ready ✅
**Date:** November 19, 2025

**Latest Improvements:**
- ✅ Fixed crop zone interaction (can now move and resize without snapping back)
- ✅ Fixed auto zoom-to-fit on image load
- ✅ Improved drag state management using refs
- ✅ Better synchronization between image loading and canvas rendering

See [Version History](#version-history) for detailed release notes.

---

### STABLE Build v2.6.1
**File:** `index.html` (default)
**Status:** Production Ready ✅
**Date:** November 9, 2025

**Latest Improvements:**
- ✅ Fixed auto-load presets bug (now parses "16/9" ratio format)
- ✅ Fixed Lanczos resampling error with custom presets
- ✅ Fixed blob URL memory leak in downloads
- ✅ Added comprehensive error handling and validation
- ✅ Performance optimization (memoized preset selection)
- ✅ Code quality improvements (eliminated magic numbers, reduced duplication)
- ✅ Accessibility enhancements (ARIA labels)

---

### EXPERIMENTAL Build
**File:** `webp-conv-experimental.html`
**Status:** Testing & Development ⚠️ (Synchronized with STABLE v2.6.4)

For testing new features before they reach stable. Currently identical to STABLE v2.6.4.

---

## Version History

### v2.6.5-STABLE (December 3, 2025)
**Bug Fixes & Code Robustness**

**Critical Bug Fixes:**
- **Canvas Context Null Checks** - Added null checks for `canvas.getContext('2d')` in `rendering.ts` and `resampling.ts` to prevent crashes when context creation fails (headless environments, GPU exhaustion)
- **Overlay Drawing Dimensions** - Fixed right and bottom overlay calculations in `renderCanvas()` that were using incorrect dimensions
- **Zero/Negative Dimension Validation** - Added validation in `resampleImage()` to prevent division by zero and corrupted output
- **NaN Validation** - Added radix parameter to `parseInt()` in `Controls.tsx` to prevent invalid dimension values

**Medium Priority Fixes:**
- **Stale Closure Fix** - Removed unused `onImageLoad` from `loadImageFromQueue` dependency array to prevent stale closure issues
- **Preset Switching Edge Case** - `switchToBuiltIn()` now returns default preset name to avoid undefined behavior
- **Race Condition Fix** - Added `pendingAutoLoadRef` to prevent double-loads when rapidly adding files to empty queue
- **Memory Leak Prevention** - Added proper timeout cleanup on unmount in `WebPConverter` component
- **Aspect Ratio Validation** - `initializeCrop()` now treats ratio ≤ 0 as null (full image crop)

**TypeScript Build Fixes:**
- Fixed `useDebouncedCallback` generic type to accept specific callback types
- Added global type declarations for test files
- Fixed unused variable warnings by prefixing with underscore
- Fixed fetch mock type casting in test files
- Removed unused imports across test files

**Files Modified:**
- `src/utils/canvas/rendering.ts`
- `src/utils/imageProcessing/resampling.ts`
- `src/components/Controls/Controls.tsx`
- `src/hooks/useImageQueue.ts`
- `src/hooks/usePresets.ts`
- `src/hooks/useDebouncedCallback.ts`
- `src/containers/WebPConverter.tsx`
- `src/utils/canvas/crop.ts`
- Multiple test files for TypeScript compliance

---

### v2.6.4-STABLE (November 30, 2025)
**Comprehensive Test Coverage Improvement**

**Improvements:**
- **Improved Statement Coverage** - From 83.41% to 92.62%
  - 348 tests total (up from 305)
  - 81.13% branch coverage
  - 98.92% function coverage
  - 92.59% line coverage

**New Test Coverage:**
- **Toolbar Component (100% coverage):**
  - Added button click test that verifies file input is triggered

- **useImageQueue Hook (100% coverage):**
  - Added edge case tests for removeImageFromQueue
  - Tests for processed image index adjustment
  - Tests for removing current image with queue remaining
  - Tests for removing image before current index

- **useImageProcessing Hook (86% coverage):**
  - Added tests for non-browser resampling methods (bilinear, bicubic, lanczos)
  - Added tests for web optimization quality loop
  - Tests for fallback to quality 1 when target cannot be met
  - Tests for finding optimal quality level

- **useCanvas Hook (72% coverage):**
  - Added tests for document-level mouse event handlers
  - Tests for move, pan, and resize drag operations
  - Tests for aspect ratio constraint during resize
  - Tests for crop bounds constraining
  - Tests for dynamic canvas sizing on window resize

- **Loaders (100% coverage):**
  - Added tests for image decode error handling
  - Added tests for FileReader error handling

---

### v2.6.3-STABLE (November 30, 2025)
**Testing Infrastructure & Quality Assurance**

**New Features:**
- **Comprehensive Testing Infrastructure** - Professional test suite with Vitest
  - 305 passing tests across utilities, hooks, and components
  - 83.41% statement coverage, 67.97% branch coverage
  - 89.24% function coverage, 83.2% line coverage
  - React Testing Library for component testing
  - jsdom environment for DOM simulation

**Test Coverage by Module:**
- **Utils (100% coverage):**
  - `parser.ts` - 31 tests for aspect ratio parsing
  - `validation.ts` - 30 tests for crop ratio and preset name validation
  - `interactions.ts` - 34 tests for canvas cursor and handle detection
  - `downloads.ts` - 10 tests for blob download functionality
  - `rendering.ts` - 19 tests for canvas rendering
  - `conversion.ts` - 19 tests for image conversion preparation
  - `resampling.ts` - 15 tests for all resampling methods

- **Hooks (65-93% coverage):**
  - `useCanvas.ts` - 38 tests for zoom, pan, crop initialization
  - `useImageProcessing.ts` - 19 tests for conversion workflow
  - `useImageQueue.ts` - 17 tests for queue management
  - `usePresets.ts` - 11 tests for preset loading and application

- **Components (100% coverage):**
  - `Canvas.tsx` - 15 tests for rendering and interactions
  - `QueuePanel.tsx` - 22 tests for queue UI and controls
  - `Toolbar.tsx` - 14 tests for toolbar rendering

**Test Configuration:**
- `vitest.config.ts` - Vitest configuration with coverage thresholds
- `src/test/setup.ts` - Global test setup with Canvas, FileReader, Image mocks
- `src/test/helpers/renderWithProviders.tsx` - Custom render with BrowserRouter

**New Development Commands:**
- `npm run test` - Run tests in watch mode
- `npm run test:run` - Single test run
- `npm run test:coverage` - Run with coverage report
- `npm run test:ui` - Visual test UI

**Dependencies Added:**
- vitest, @vitest/coverage-v8, @vitest/ui
- @testing-library/react, @testing-library/jest-dom, @testing-library/user-event
- jsdom

---

### v2.6.2-STABLE (November 19, 2025)
**Critical Bug Fixes - Crop Zone & Auto Zoom**

**Bug Fixes:**
- **Fixed Crop Zone Interaction** - Crop zone can now be moved and resized smoothly
  - Resolved issue where crop zone would snap back to original position after mouse release
  - Fixed inability to move or resize crop zone during drag operations
  - The crop zone would appear to resize/move during drag but snap back when mouse was released
  - Root cause: Preset change effect was running when dragging ended, resetting crop state

- **Fixed Auto Zoom-to-Fit** - Images now automatically zoom to fit when loaded
  - Added proper useEffect that watches for image and canvas dimension changes
  - Ensures zoom-to-fit only runs when both image and canvas are ready
  - Removed duplicate zoom-to-fit call from loadImage function that could run prematurely

**Technical Improvements:**
- **Improved Drag State Management** - Used refs instead of state for drag values
  - Prevents document-level mouse event handler from re-running during drag
  - Eliminates stale closure issues with drag start values
  - Added `dragStateRef` and `cropStateRef` to track drag state without triggering re-renders

- **Better Preset Change Handling** - Prevented crop reset during/after dragging
  - Added `isDraggingRef` to track current dragging state accurately
  - Added `blockPresetResetRef` to prevent immediate resets after drag ends
  - Preset change effect now only runs when preset actually changes, not on every render
  - Uses refs to track last applied preset to avoid unnecessary re-initialization

- **Improved Effect Dependencies** - Better synchronization between effects
  - Removed `canvas` and `presets` objects from dependency arrays (they change on every render)
  - Only depend on actual values that should trigger effects
  - Proper cleanup of timeouts in useEffect hooks

**Testing:**
- Verified crop zone can be moved smoothly in all directions
- Verified crop zone can be resized from all handles without snapping back
- Verified zoom-to-fit works on initial image load
- Verified zoom-to-fit works when loading images from queue
- No regressions in existing functionality
- 100% backward compatible with v2.6.1

---

### v2.6.1-STABLE (November 9, 2025)
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

**Error Handling & Robustness:**
- Added comprehensive error handlers for image loading
  - `loadImage()` now has try-catch wrapper
  - Image decode errors caught with `img.onerror` handler
  - File read errors caught with `reader.onerror` handler

- Added division-by-zero guards in dimension calculations
  - Max width/height constraints now verify dimensions are > 0 before division
  - Prevents NaN values in resampling operations

**Performance Optimizations:**
- **Memoized Preset Selection** - `getCurrentPresets()` now uses `useMemo` hook
  - Eliminates unnecessary recalculation on every render
  - Only recalculates when `useCustomPresets` or `customPresets` changes

- **Improved React Imports** - Added `useMemo` and `useCallback` for future optimizations
  - Allows for more sophisticated performance improvements
  - Prepares codebase for event handler memoization

**Code Quality Improvements:**
- **Eliminated Magic Numbers** - Created 16 named constants for better maintainability
  - UI Constants: CANVAS_PADDING, CROP_HANDLE_SIZE, HANDLE_TOLERANCE, MIN_CROP_SIZE, ZOOM_MIN, ZOOM_MAX, ZOOM_INITIAL_DELAY, TRANSITION_DELAY
  - Image Processing: MIN_BLUR_RADIUS, BLUR_THRESHOLD, GAUSSIAN_KERNEL_MULTIPLIER, LANCZOS_WINDOW_SIZE, SIGNIFICANT_DOWNSAMPLE_THRESHOLD, ASPECT_RATIO_TOLERANCE
  - Cursor Map: CURSOR_MAP object

- **Removed Code Duplication** - Consolidated queue handling logic
  - Created `handlePostConversionQueue()` helper function
  - Replaced 3 duplicate instances of queue management (lossless, quality-optimized, and default conversion paths)
  - Single source of truth for post-conversion behavior

- **Centralized Cursor Styling** - Unified cursor map into global constant
  - Removed 2 duplicate CURSOR_MAP definitions
  - Saved 40+ lines of duplicate code
  - Single reference for all cursor type mappings

- **Consistent Naming Conventions** - Standardized throughout codebase
  - Event handlers follow `handle*` pattern
  - State getters follow `get*` pattern
  - Boolean checks follow `is*` pattern

**Accessibility Improvements:**
- **Canvas ARIA Labels** - Added dynamic accessibility descriptions
  - Shows current crop dimensions and zoom level
  - Updates in real-time for screen readers
  - Improves experience for users with assistive technologies

**Testing:**
- All features tested with built-in and custom presets
- Verified with various image sizes and aspect ratios
- No regressions in existing functionality
- 100% backward compatible with v2.6.0

---

### v2.5.0-STABLE (November 2, 2025)
**Clipboard Paste Support & Queue Integration**

**New Features:**
- **Clipboard Paste Support** - Quick image loading from clipboard
  - Press Ctrl+V (Windows/Linux) or Cmd+V (Mac) to paste images
  - Automatically generates timestamped filenames for pasted images
  - Works with screenshot tools, image viewers, and any application that copies to clipboard

- **Smart Queue Integration** - Seamless multi-image workflow
  - Pasted images automatically added to queue when multiple images already loaded
  - Pasted images load directly when no images are in queue
  - Maintains consistency with file upload and drag-and-drop behavior
  - Properly tracked in queue with filename and metadata

**Improvements:**
- Faster image loading workflow for batch processing
- Better clipboard support for modern web browsers
- Enhanced user experience with multiple image sources

---

### v2.4.0-STABLE (November 1, 2025)
**Fixed Ratio & Enhanced SEO**

**New Features:**
- **Fixed Ratio Feature** - Intelligent dimension linking for aspect ratio preservation
  - Link icon button (🔗) between max width/height fields
  - Toggle between linked (auto-calculate) and unlinked (independent) modes
  - Uses current crop's aspect ratio for accurate calculations
  - Automatically disabled in Freestyle Mode
  - Visual feedback with blue ring border on linked inputs
  - Default to linked mode for intuitive workflow

- **Enhanced SEO** - Comprehensive search engine optimization
  - Improved meta description with feature highlights
  - Relevant keywords for image conversion and WebP compression
  - Open Graph tags for social media sharing (Facebook, LinkedIn, Discord)
  - Twitter Card tags with custom creator attribution
  - JSON-LD structured data for rich snippets
  - Canonical URL specification
  - Theme color and color scheme meta tags
  - SVG favicon and Apple touch icon support

**Improvements:**
- Better user workflow for setting constrained dimensions
- Simplified dimension input - no need to calculate manually
- Improved search engine visibility and rankings
- Enhanced social media preview when sharing
- Professional SEO structure for web discoverability

**SEO Technical Details:**
- `robots` meta: index, follow with image preview support
- Schema.org WebApplication markup with pricing information
- Creator details with sameAs links to all social profiles
- Optimized Open Graph image dimensions (1200x630px)
- Twitter Card with creator attribution

**Implementation Details:**
- New state variable: `linkDimensions` (default: true)
- Link toggle button with visual feedback and tooltips
- Auto-calculation on width change: `newHeight = Math.round(parseInt(newWidth) / (cropWidth / cropHeight))`
- Auto-calculation on height change: `newWidth = Math.round(parseInt(newHeight) * (cropWidth / cropHeight))`
- Enhanced meta tags in `<head>` with proper categorization
- JSON-LD structured data for proper web application identification

### v2.3.0-STABLE (October 31, 2025)
**Freestyle Control Enhancement**

**New Features:**
- **Freestyle Toggle Switch** - Independent control to disable aspect ratio constraints
  - Simple checkbox control positioned below Crop Preset selector
  - Works independently without changing preset selection
  - Preserves current crop area and settings when toggling
  - Compatible with both built-in and custom presets

**Improvements:**
- Enhanced cropping flexibility for users who need free-form cropping with preset settings
- Better workflow for users who want to switch between constrained and unconstrained cropping
- Export settings (max-width/max-height) still apply regardless of Freestyle mode

**Implementation Details:**
- New state variable: `isFreestyleMode`
- Modified aspect ratio constraint logic to check `if (aspectRatio && !isFreestyleMode)`
- UI toggle with visual indicator (🎨 emoji and descriptive text)

### v2.2.1-STABLE (October 31, 2025)
**Bug Fix Release**

**Bug Fixes:**
- **Fixed Freestyle Cropping Drag** - Crop area can now be dragged in Freestyle mode
  - Previously, dragging inside the crop rectangle would pan the image instead of moving the crop area
  - Issue was caused by `aspectRatio === null` check in `isInsideCrop()` function rejecting all Freestyle mode interactions
  - Now correctly detects cursor position inside crop area regardless of aspect ratio setting

**Improvements:**
- Better interaction detection for crop manipulation in all modes

### v2.2-STABLE (October 28, 2025)
**User Experience & Display Update**

**New Features:**
- **Dynamic Canvas Sizing** - Responsive canvas that adapts to screen resolution
  - Automatically fills available screen space
  - Perfect for 4K monitors and ultra-wide displays
  - Adjusts on window resize
  - Maintains minimum usable size for smaller displays
  - Provides 50% more working space on large screens

- **Intelligent Cursor Feedback** - Context-aware cursor changes
  - Directional resize cursors (↕, ↔, diagonal arrows)
  - Shows which direction handles can be dragged
  - Move cursor inside crop area
  - Grab/grabbing cursors for panning
  - Improves user experience and clarity

- **Author Attribution** - Proper credit throughout project
  - Added to all HTML files (visible in UI and source)
  - Added to all documentation files
  - Links to GitHub, social media, and support channels

**Improvements:**
- Better workflow on high-resolution displays
- More intuitive interaction with crop handles
- Professional project presentation

**File Structure Changes:**
- `index.html` is now the STABLE version (default file for web servers)
- Previous launcher moved to `launcher.html`
- Better organization for web hosting and GitHub Pages

### v2.1-STABLE (October 26, 2025)
**Image Quality Enhancement Update**

**New Features:**
- **Adaptive Anti-Aliasing** - Intelligent pre-filtering for downsampling
  - Gaussian blur pre-filter applied automatically when downsampling
  - Adaptive blur radius calculated based on downsampling ratio
  - Prevents oversharpening, ringing, and aliasing artifacts
  - Works with Bicubic, Lanczos, and Bilinear resampling methods
  - Triggered automatically for significant downsampling (< 67% scale)

- **Enhanced Resampling Quality**
  - Eliminates oversharpening that occurs with bicubic/Lanczos downsampling
  - Reduces ringing artifacts around sharp edges
  - Prevents moiré patterns in detailed images
  - Produces smoother, more natural-looking results
  - Matches professional image processing tools like ImageMagick

**Technical Details:**
- Two-pass separable Gaussian blur for efficiency
- Nyquist frequency-based blur radius calculation
- Formula: `blurRadius = (1.0 / scale - 1.0) * 0.5`
- Examples:
  - 2x downsampling (0.5 scale) → radius ≈ 0.5
  - 4x downsampling (0.25 scale) → radius ≈ 1.5
  - 8x downsampling (0.125 scale) → radius ≈ 3.5

**User Experience:**
- Status message shows when anti-aliasing is applied
- No configuration needed - works automatically
- No performance impact for upsampling or minimal downsampling
- Applies to all resampling methods except "Nearest Neighbor" and "Browser Default"

### v2.0-STABLE (October 25, 2025)
**Major Update - Production Release**

**New Features:**
- **Image Queue System** - Complete batch processing workflow
  - Multi-file selection and drag & drop
  - Visual queue panel with status indicators
  - Previous/Next navigation
  - Click-to-load functionality
  - Auto-advance after conversion
  - Remove after convert option
  - Individual and bulk removal
  - Progress tracking with ✓ indicators

- **Advanced Resampling Methods** - Professional-grade image resizing
  - Lanczos (highest quality, best for downscaling)
  - Bicubic (recommended default)
  - Bilinear (fast and smooth)
  - Nearest Neighbor (preserves sharp edges)
  - Browser Default (native resampling)

- **Smart Auto-Features**
  - Auto Zoom to Fit on image load
  - Auto-load presets.json from same folder
  - Smart preset selection based on image dimensions
  - Auto-advance through queue after conversion

**Bug Fixes:**
- Fixed queue features not working with custom presets
- Fixed "Optimize for Web" preventing queue removal
- Fixed early return paths missing queue management logic

**Improvements:**
- Enhanced user workflow for batch processing
- Better visual feedback with status indicators
- Improved resampling quality options
- Streamlined preset management

### v1.1-EXPERIMENTAL (October 23, 2025)
- Image Queue System (testing phase)
- Multi-image selection and drag & drop
- Visual queue management panel
- Automatic progression through images
- Processing status tracking
- Queue navigation controls
- Individual/bulk image removal

### v1.0-STABLE (October 23, 2025)
- Initial stable release
- Full feature set with custom preset support
- Comprehensive UI with all controls
- Production-ready quality

---

## Usage Recommendations

### Use STABLE if:
- You need reliable, tested functionality
- You're working on important projects
- You want the best user experience
- You need predictable behavior

### Use EXPERIMENTAL if:
- You want to test new features early
- You're willing to report bugs
- You want to provide feedback on enhancements
- You don't mind occasional issues

---

## Reporting Issues

If you encounter issues with either build:
1. Note which build you're using (STABLE or EXPERIMENTAL)
2. Document the steps to reproduce
3. Include browser information
4. Describe expected vs actual behavior

---

## Author

Created by **Flash Galatine**

- GitHub: [FlashGalatine](https://github.com/FlashGalatine)
- X/Twitter: [@AsheJunius](https://x.com/AsheJunius)
- Twitch: [flashgalatine](https://www.twitch.tv/flashgalatine)
- BlueSky: [@projectgalatine.com](https://bsky.app/profile/projectgalatine.com)
- Patreon: [Project Galatine](https://www.patreon.com/ProjectGalatine)
- Blog: [blog.projectgalatine.com](https://blog.projectgalatine.com/)
