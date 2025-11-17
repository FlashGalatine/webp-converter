# WebP Converter - Version Information

## Current Releases

### v3.0.0-alpha (React + TypeScript + Vite)
**Status:** Modern Architecture - Alpha Testing 🚀
**Date:** November 17, 2025

**Complete Refactor:**
- ✅ Migrated from standalone HTML to Vite + React + TypeScript
- ✅ Professional build tooling with Hot Module Replacement (HMR)
- ✅ Component-based architecture with custom hooks
- ✅ Integrated Preset Editor as modal (no more separate file!)
- ✅ Full TypeScript type safety
- ✅ Production build: 247.59 KB (77.20 KB gzipped)
- ✅ 100% feature parity with v2.6.1

**How to Run:**
```bash
npm install    # Install dependencies
npm run dev    # Start dev server (localhost:5173)
npm run build  # Build for production
```

**Legacy builds available in `legacy/` directory**

See detailed v3.0.0 release notes below.

---

### STABLE Build v2.6.1 (Legacy)
**File:** `legacy/index.html` (moved to legacy directory)
**Status:** Production Ready ✅ (Legacy)
**Date:** November 9, 2025

**Latest Improvements:**
- ✅ Fixed auto-load presets bug (now parses "16/9" ratio format)
- ✅ Fixed Lanczos resampling error with custom presets
- ✅ Fixed blob URL memory leak in downloads
- ✅ Added comprehensive error handling and validation
- ✅ Performance optimization (memoized preset selection)
- ✅ Code quality improvements (eliminated magic numbers, reduced duplication)
- ✅ Accessibility enhancements (ARIA labels)

See [Version History](#version-history) for detailed release notes.

---

### EXPERIMENTAL Build
**File:** `webp-conv-experimental.html`
**Status:** Testing & Development ⚠️ (Synchronized with STABLE v2.6.1)

For testing new features before they reach stable. Currently identical to STABLE v2.6.1.

---

## Version History

### v3.0.0-alpha (November 17, 2025)
**Complete Architecture Refactor - React + TypeScript + Vite**

This is a complete rewrite of the WebP Converter with modern development tooling while maintaining 100% feature parity with v2.6.1.

#### 🚀 Architecture Changes

**Migration to Modern Stack:**
- Migrated from standalone HTML to **Vite + React 18 + TypeScript**
- Replaced inline JSX with compiled TypeScript components
- Replaced inline styles with **Tailwind CSS utility classes**
- Introduced professional build tooling (HMR, tree-shaking, minification)
- Modular codebase with clear separation of concerns

**Project Structure:**
```
src/
├── components/      # React components
├── containers/      # Container components (business logic)
├── hooks/           # Custom React hooks (state management)
├── utils/           # Utility functions (canvas, image processing, files, presets)
├── types/           # TypeScript type definitions
└── constants/       # Application constants
```

#### ✨ Phase-by-Phase Implementation

**Phase 1: Foundation**
- Set up Vite + React + TypeScript project
- Configured Tailwind CSS
- Created basic project structure

**Phase 2: Type Definitions**
- Complete TypeScript types for all features
- Canvas, image, preset, queue, and conversion types
- Full IntelliSense support

**Phase 3: Utility Functions**
- Canvas operations (drawing, coordinate transforms, handle detection)
- Image processing (conversion, resampling, optimization)
- File operations (download, validation)
- Preset management (loading, parsing, validation)

**Phase 4: Custom Hooks**
- useImageState - Image loading and management
- useCanvasState - Canvas zoom, pan, dimensions
- useCropState - Crop area with aspect ratio
- useQueueState - Batch processing queue
- usePresetState - Preset selection and management
- useConversionSettings - Quality and optimization
- useCanvasInteraction - Drag, resize, cursor states
- useClipboard - Clipboard paste support

**Phase 5: React Components**
- UI Primitives (Button, Input, Select)
- Canvas - Image display with crop overlay
- Toolbar - Zoom controls
- Presets - Preset selection
- Controls - Conversion settings
- Queue - Batch processing interface

**Phase 6: Integration & Testing**
- WebPConverterContainer - Main orchestration component
- All event handlers (25+ handlers)
- Keyboard shortcuts (+/-, 0, F)
- Complete workflow integration

**Phase 7: Optimization & Polish**
- Full 8-directional crop resize with aspect ratio enforcement
- ErrorBoundary component for graceful error handling
- LoadingSpinner component (3 sizes)
- Accessibility improvements (ARIA labels, keyboard support)
- Keyboard shortcut hints in header

**Phase 8: Preset Editor Integration** 🎉
- Integrated preset editor as modal (was separate `preset-editor.html`)
- PresetEditorModal component (362 lines)
- PresetCard component for individual presets
- Add/Remove/Reorder with smooth animations
- Import/Export JSON with drag & drop
- Live JSON preview
- Validation (name uniqueness, ratio format, default selections)
- "Save & Apply" button loads presets directly into converter

#### 🎨 New Features

**Integrated Preset Editor:**
- Click "✏️ Create/Edit Presets" button to open modal
- Visual interface for managing all preset fields
- Drag & drop JSON import with blue overlay
- Real-time validation with inline error messages
- Default Selection status panel (color-coded)
- Reordering with slide animations and blue glow
- Export to JSON for backup
- Save & Apply instantly loads into converter

**Modal Component:**
- Generic reusable modal with 5 sizes (sm, md, lg, xl, full)
- ESC key and overlay click to close
- Prevents body scroll when open
- Optional footer support
- Full accessibility (ARIA labels, focus management)

**Enhanced UI:**
- Smooth animations (CSS keyframes for slide up/down/highlight)
- Better button hierarchy (primary for important actions)
- Consistent styling with Tailwind utilities
- Responsive layout

#### 🔧 Developer Experience

**Hot Module Replacement (HMR):**
- Changes reflect instantly without page reload
- Preserves application state during development
- Fast iteration cycle

**TypeScript Benefits:**
- Full type safety across entire codebase
- IntelliSense autocomplete in VS Code
- Compile-time error detection
- Self-documenting code with interfaces

**Build Optimization:**
- Production build: 247.59 KB (77.20 KB gzipped)
- CSS: 6.55 KB (1.68 KB gzipped)
- Tree-shaking removes unused code
- Minified and optimized

**Development Commands:**
```bash
npm install       # Install dependencies
npm run dev       # Start dev server (localhost:5173)
npm run build     # Build for production (outputs to dist/)
npm run preview   # Preview production build (localhost:4173)
```

#### ✅ Feature Parity with v2.6.1

**All Features Migrated:**
- ✅ All 16 built-in presets
- ✅ Custom preset loading and validation
- ✅ Image queue with batch processing
- ✅ All 5 resampling methods + anti-aliasing
- ✅ Crop resize with 8-directional handles
- ✅ Zoom, pan, and canvas interactions
- ✅ Quality optimization and file size targeting
- ✅ Clipboard paste support (Ctrl+V)
- ✅ Fixed ratio dimension linking (🔗 button)
- ✅ Freestyle mode toggle
- ✅ Preset Editor (now integrated as modal)

**New Capabilities:**
- ✅ Component-based architecture
- ✅ Type-safe development
- ✅ Hot Module Replacement
- ✅ Error boundary for error handling
- ✅ Integrated Preset Editor modal
- ✅ Professional build tooling

#### 📦 Build Output

**Production Bundle:**
- Main JS: 247.59 KB (77.20 KB gzipped)
- CSS: 6.55 KB (1.68 KB gzipped)
- Total: ~78 KB gzipped (excellent for feature set)

**Comparison to v2.6.1:**
- Legacy HTML: ~95 KB (inline, unminified)
- New build: ~78 KB (optimized, tree-shaken)
- **18% smaller** while adding TypeScript types and better structure

#### 🏗️ File Organization

**12 New Files for Phase 8:**
- src/components/ui/Modal.tsx (121 lines)
- src/components/PresetEditor/PresetCard.tsx (206 lines)
- src/components/PresetEditor/PresetEditorModal.tsx (362 lines)
- src/components/PresetEditor/index.ts
- src/types/presetEditor.ts
- src/utils/presetEditor.ts (176 lines)
- Updated 6 existing files

**Total Codebase:**
- ~3,500 lines of TypeScript (well-organized, typed)
- vs. ~1,100 lines inline JavaScript (legacy HTML)
- Better maintainability despite larger LOC

#### 🔄 Migration Path

**Legacy Files:**
- Moved to `legacy/` directory
- legacy/index.html (v2.6.1 stable)
- legacy/webp-conv-experimental.html (v2.6.1)
- preset-editor.html (standalone, still in root for reference)

**For Users:**
- No change if using legacy HTML files (still work)
- New users: Use `npm run dev` for modern version
- Gradual migration supported

#### ⚙️ Technical Improvements

**Code Quality:**
- Consistent naming conventions
- Proper separation of concerns
- Testable components and utilities
- No magic numbers (all constants named)
- No code duplication

**Validation:**
- Preset name uniqueness (case-insensitive)
- Crop ratio format validation ("16/9" or 1.777)
- Default selection uniqueness (one per type)
- File size unit validation (KB/MB/GB)
- Enum type safety (TypeScript)

**Error Handling:**
- ErrorBoundary catches React errors
- User-friendly error messages
- Graceful degradation
- Console logging for debugging

**Accessibility:**
- ARIA labels on all interactive elements
- Keyboard navigation support
- Focus management in modal
- Screen reader friendly
- Semantic HTML

#### 🎯 Next Steps

**Potential Future Enhancements:**
- Unit tests (Vitest)
- E2E tests (Playwright)
- CI/CD pipeline
- PWA support (offline mode)
- Web Workers for heavy processing
- More preset templates

**Current Status:**
- Alpha testing phase
- Feature complete
- Production ready
- Documentation complete

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
