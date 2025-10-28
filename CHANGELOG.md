# WebP Converter - Version Information

## Current Releases

### STABLE Build v2.2
**File:** `index.html` (default)
**Status:** Production Ready ✅
**Date:** October 28, 2025

#### All Features:
**Core Functionality:**
- ✅ Full image loading and preview
- ✅ Interactive canvas with zoom and pan
- ✅ Manual crop adjustment with handles
- ✅ Built-in aspect ratio presets
- ✅ Custom preset loading from JSON files
- ✅ Lossy and lossless WebP conversion
- ✅ Quality adjustment (0-100)
- ✅ Max dimension constraints
- ✅ Web optimization with target file size
- ✅ Drag & drop image loading
- ✅ Keyboard shortcuts (zoom, pan)
- ✅ Real-time conversion progress
- ✅ Auto-generated filenames with metadata

**From v2.0:**
- ✅ **Image Queue System** - Batch process multiple images
- ✅ **Advanced Resampling Methods** - Lanczos, Bicubic, Bilinear, Nearest Neighbor
- ✅ **Auto Zoom to Fit** - Images automatically fit canvas on load
- ✅ **Auto-load Presets** - Automatically loads presets.json if present
- ✅ **Smart Preset Selection** - Auto-selects preset based on image dimensions
- ✅ **Queue Auto-advance** - Automatically move to next image after conversion
- ✅ **Remove After Convert** - Option to auto-remove processed images from queue

**New in v2.1:**
- ✅ **Adaptive Anti-Aliasing** - Prevents oversharpening during downsampling
- ✅ **Gaussian Pre-Filter** - Applies optimal blur before resampling to eliminate artifacts
- ✅ **Smart Quality Control** - Automatically adjusts filtering based on downsampling ratio

**New in v2.2:**
- ✅ **Dynamic Canvas Sizing** - Canvas automatically adapts to screen resolution (4K support)
- ✅ **Intelligent Cursor Feedback** - Directional cursors show which way handles can be resized
- ✅ **Author Attribution** - Proper credit and links throughout all files

#### Known Issues:
- None reported

---

### EXPERIMENTAL Build
**File:** `webp-converter-web-EXPERIMENTAL.html`
**Status:** Testing & Development ⚠️
**Date:** October 28, 2025
**Version:** 2.2-EXPERIMENTAL

#### Current State:
- Contains all STABLE v2.2 features
- Currently synchronized with STABLE (no experimental features in testing)

#### Known Issues:
- None reported

---

## Version History

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
- BlueSky: [@flashgalatine.bsky.social](https://bsky.app/profile/flashgalatine.bsky.social)
- Patreon: [Project Galatine](https://www.patreon.com/ProjectGalatine)
- Blog: [blog.projectgalatine.com](https://blog.projectgalatine.com/)
