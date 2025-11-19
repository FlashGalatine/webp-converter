# WebP Converter v2.6.1

## Quick Start

### Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser to the URL shown (typically `http://localhost:5173`)

### Production Build

1. Build for production:
   ```bash
   npm run build
   ```

2. The built files will be in the `dist/` directory

3. Preview the production build:
   ```bash
   npm run preview
   ```

## Version Information

This project has been refactored to use **Vite + TypeScript + React**:

- **🟢 WebP Converter** - Main image conversion tool (route: `/`)
- **⚙️ Preset Editor** - Create and manage custom presets (route: `/preset-editor`)

**Note:** The old HTML files have been archived in the `archived/` directory. The project now uses a modern build system with TypeScript and React components.

See `CHANGELOG.md` for detailed version history.

---

## What's New in v2.6.1

### 🐛 Bug Fixes & Code Quality Improvements
**Enhanced Stability and Maintainability** - Performance improvements and critical bug fixes

- **Fixed Auto-Load Presets Bug**: Aspect ratios from JSON presets now properly parse string formats like `"16/9"` (was only handling numeric values)
- **Fixed Lanczos Resampling Error**: Resolved `ReferenceError` when using Lanczos resampling with custom presets
- **Fixed Blob URL Memory Leak**: Delayed URL revocation to ensure downloads complete before cleanup
- **Improved Error Handling**: Added comprehensive error handlers for image loading, file reading, and canvas operations
- **Added Division-by-Zero Guards**: Protected dimension calculations to prevent NaN values

### ⚡ Performance Optimizations
**Smarter State Management** - Reduced unnecessary recalculations

- **Memoized Preset Selection**: `getCurrentPresets()` now uses `useMemo` to avoid recalculation on every render
- **Improved React Imports**: Added `useMemo` and `useCallback` to React imports for future optimization opportunities

### 🎯 Code Quality Enhancements
**Better Maintainability & Clarity** - Refactored code for consistency and readability

- **Eliminated Magic Numbers**: Created 16 named constants (CANVAS_PADDING, MIN_CROP_SIZE, BLUR_THRESHOLD, LANCZOS_WINDOW_SIZE, etc.)
- **Removed Code Duplication**: Consolidated 3 instances of duplicated queue handling logic into single `handlePostConversionQueue()` helper function
- **Centralized Cursor Map**: Unified cursor styling object into global `CURSOR_MAP` constant (removed 40 lines of duplicate code)
- **Consistent Naming**: Standardized function naming conventions throughout codebase

### ♿ Accessibility Improvements
**Better Screen Reader Support** - Enhanced ARIA labels for assistive technologies

- **Canvas ARIA Labels**: Added dynamic ARIA labels to canvas element showing current crop dimensions and zoom level

These improvements maintain 100% backward compatibility while significantly enhancing code quality, reliability, and performance.

---

## Overview
WebP Converter is a powerful client-side image conversion tool with advanced features for batch processing, custom presets, professional-grade resampling, adaptive anti-aliasing, and intelligent dimension linking.

## What's New in v2.6.0

### 🎯 Aspect Ratio String Format Support
**More Readable Crop Ratios** - Define ratios using intuitive notation
- **String Format**: Use `16/9`, `4/3`, `21/9`, `3/2` instead of decimal calculations
- **Backward Compatible**: Decimal format like `1.777` still fully supported
- **In Presets**: Custom preset JSON files can now use either format: `"crop-ratio": "16/9"` or `"crop-ratio": 1.777`
- **Easier to Read**: More intuitive notation matches common industry standards
- **Validation**: Both formats are validated to ensure correct values

### 🛠️ New Preset Editor Tool
**Companion Application for Preset Management** - Create presets without manual JSON editing
- **Visual Editor**: User-friendly interface for managing crop ratios and export settings
- **Add/Remove Presets**: Quick buttons to add new presets or remove existing ones
- **Reorder Presets**: Up/Down arrow buttons allow you to change preset order with smooth animations
- **Intuitive Fields**: Forms for all preset parameters (crop ratio, dimensions, file size, auto-selection)
- **Import Existing**: Load your existing `presets.json` file to edit, or try `example_presets.json` as a starting point (drag and drop supported)
- **Export JSON**: Generate valid `presets.json` files ready to use
- **Validation Built-in**: Real-time validation of crop ratios, preset names, and default selections
- **Default Selection Logic**: Only one preset allowed per type (Square, Landscape, Portrait) with visual status indicator
- **Drag-and-Drop Import**: Drop JSON files anywhere on the page to import instantly (try `example_presets.json`)
- **Smooth Animations**: Presets slide and highlight when moved for visual feedback
- **JSON Preview**: Live preview of your JSON before export

### 📋 Preset JSON Features
**Enhanced Preset Specifications** - New format support in custom presets
- **Ratio Format Support**: `"crop-ratio": "16/9"` now works alongside `"crop-ratio": 1.777`
- **All Parameters**: Full support for crop-ratio, max-width, max-height, max-filesize, max-filesize-unit, default-selection
- **Example Presets**: Create presets for social media (Twitter, Instagram, Discord, BlueSky) or custom specifications

## What's New in v2.5.0

### 📋 Clipboard Paste Support
**Quick Image Loading from Clipboard** - Paste images with a single keyboard shortcut
- **Keyboard Shortcut**: Press **Ctrl+V** (Windows/Linux) or **Cmd+V** (Mac) to paste images
- **Works with Screenshots**: Perfect for quick screenshot conversion workflows
- **Auto Filenames**: Pasted images get timestamped names like `pasted-image-2025-11-02T12-34-56.png`
- **Queue Compatible**: Pasted images automatically added to queue when multiple images are loaded
- **Direct Loading**: Pasted image loads directly if queue is empty
- **All Formats Supported**: Works with PNG, JPEG, WebP, GIF from clipboard

### 🔄 Smart Queue Integration
**Seamless Multi-Image Workflow** - Pasted images integrate naturally with batch processing
- **Queue Awareness**: Automatically detects if images are already loaded
- **Consistent Behavior**: Matches file upload and drag-and-drop behavior
- **Proper Metadata**: Pasted images tracked with filename and file size in queue
- **No Manual Steps**: No need to manually add pasted images - happens automatically

---

## What's New in v2.4.0

### 🔗 Fixed Ratio Feature
**Intelligent Dimension Linking** - Auto-maintain aspect ratio when setting max width/height
- **Link Toggle Button**: Click the 🔗 icon between max width/height fields to toggle linking mode
- **Linked Mode (Default)**: Adjust width → height auto-calculates, and vice versa
- **Unlinked Mode**: Set width and height independently without automatic adjustments
- **Smart Calculations**: Uses your current crop's aspect ratio for accurate dimension scaling
- **Freestyle Compatible**: Automatically disables when using Freestyle Mode, re-enables when switching back
- **Visual Feedback**: Blue ring border around inputs when linked, shows exact status with emoji (🔗 = linked, ⛓️‍💥 = unlinked)

### 🔍 Enhanced SEO & Discoverability
**Professional Search Engine Optimization** - Better visibility and social media sharing
- **Search Engine Keywords**: Optimized for "webp converter", "image converter", "batch convert", and more
- **Rich Meta Tags**: Improved title and description for better search results
- **Social Media Ready**: Open Graph and Twitter Card tags for beautiful previews when sharing
- **Structured Data**: JSON-LD schema markup for search engines to understand the app
- **Creator Attribution**: Links to all social profiles (GitHub, Twitter, Twitch, BlueSky, Patreon)
- **Favicon Support**: Professional SVG emoji favicon (🖼️) for browser tabs and bookmarks

## What's New in v2.3.0

### 🎨 Freestyle Toggle Switch
**Independent Freestyle Mode Control** - Disable aspect ratio constraints without changing presets
- **Flexible Toggle**: Enable Freestyle Mode as an independent option while keeping your preset selection
- **Preserve Current Crop**: Toggling Freestyle on/off maintains your current crop area and settings
- **Easy Access**: Simple checkbox control positioned right below the Crop Preset selector
- **Works with All Presets**: Compatible with both built-in and custom presets
- **Export Respects Limits**: Max-width/max-height settings still apply during export

## What's New in v2.2.1

### 🐛 Bug Fix
**Fixed Freestyle Cropping** - Crop area can now be dragged in Freestyle mode
- Previously, dragging inside the crop rectangle would pan the image instead of moving the crop area
- Interaction detection now works correctly for all aspect ratio settings

## What's New in v2.2

### 🖥️ Dynamic Canvas Sizing
Responsive canvas that adapts to your screen:
- **Automatic Scaling**: Canvas fills available screen space
- **4K Ready**: Perfect for high-resolution displays and ultra-wide monitors
- **Window Resize**: Adjusts dynamically when you resize the browser
- **Minimum Size**: Maintains usable dimensions on smaller displays
- **More Space**: Up to 50% more working area on large screens

### 🎯 Intelligent Cursor Feedback
Context-aware cursors improve usability:
- **Directional Arrows**: Shows which way handles can be resized (↕, ↔, diagonals)
- **Move Cursor**: Inside crop area to reposition
- **Grab/Grabbing**: Pan the canvas when zoomed in
- **Instant Feedback**: Know exactly what each action will do

### 👤 Author Attribution
Proper credit throughout the project:
- Visible attribution in all HTML files
- Links to GitHub, social media, and support channels
- Professional project presentation

## What's New in v2.1

### 🎯 Adaptive Anti-Aliasing
Professional-grade image quality improvements for downsampling:
- **Automatic Quality Control**: Intelligent pre-filtering prevents oversharpening artifacts
- **Gaussian Pre-Filter**: Applies optimal blur before resampling based on downsampling ratio
- **No Configuration Needed**: Works automatically - you'll see "Applying anti-aliasing..." when active
- **Smart Detection**: Only applies for significant downsampling (< 67% scale)
- **Better Results**: Eliminates ringing, halos, and moiré patterns that occur with bicubic/Lanczos

**Technical Details:**
- Prevents oversharpening that naturally occurs with bicubic and Lanczos interpolation
- Uses Nyquist frequency-based blur radius calculation
- Two-pass separable Gaussian blur for efficiency
- Formula: `blurRadius = (1.0 / scale - 1.0) * 0.5`
- Examples:
  - 4K → 1080p (4x downsample): radius ≈ 1.5
  - 1080p → 720p (1.5x downsample): radius ≈ 0.25

**When It Works:**
- Applies to: Bicubic, Lanczos, and Bilinear resampling methods
- Skipped for: Nearest Neighbor and Browser Default methods
- Only active when downsampling significantly (reducing by more than 33%)

## What's New in v2.0

### 🎉 Image Queue System
- **Batch Processing**: Load and process multiple images at once
- **Multi-file Selection**: Select multiple files or drag & drop entire folders
- **Visual Queue Panel**: See all queued images with status indicators
- **Progress Tracking**: Track which images have been processed (✓)
- **Auto-advance**: Automatically move to next image after conversion
- **Remove After Convert**: Option to auto-remove images from queue after processing
- **Navigation**: Previous/Next buttons and click-to-load functionality

### 🎨 Advanced Resampling Methods
Choose the best resampling algorithm for your needs when resizing images:
- **Lanczos**: Highest quality, best for downscaling (slower)
- **Bicubic**: Recommended default, excellent quality/speed balance
- **Bilinear**: Fast with smooth results
- **Nearest Neighbor**: Fastest, preserves hard edges (ideal for pixel art)
- **Browser Default**: Native browser resampling

### ⚡ Smart Auto-Features
- **Auto Zoom to Fit**: Images automatically fit the canvas on load
- **Auto-load Presets**: Automatically loads `presets.json` if present in the same folder
- **Smart Preset Selection**: Auto-selects appropriate preset based on image dimensions (Square/Landscape/Portrait)

### 🎯 Custom Preset System
- Load custom presets from JSON files
- Switch between built-in and custom presets at any time
- Automatic application of preset-specific settings
- Platform-specific presets (BlueSky, Twitter, Discord, etc.)

### Preset-Specific Settings
When using custom presets, the following settings are automatically applied:
- **Max Width/Height**: Automatically constrains output dimensions
- **Target File Size**: Automatically enables web optimization with specified target size
- **Crop Ratio**: Sets the aspect ratio for cropping
- **Default Selection**: Auto-selects preset based on image orientation

## How to Use

### Quick Start
1. Open `index.html` (STABLE) or `webp-conv-experimental.html` (EXPERIMENTAL)
2. Load an image by clicking "Select Image(s)", drag & drop, or paste from clipboard (Ctrl+V)
3. Select a crop preset or use freestyle
4. Optionally set max width/height (use the 🔗 button to link dimensions)
5. Adjust quality settings and resampling method
6. Click "Convert & Download"

### Using the Image Queue System
**Loading Multiple Images:**
- **Method 1**: Click "Select Image(s)" and hold Ctrl/Cmd to select multiple files
- **Method 2**: Drag and drop multiple images onto the canvas
- **Method 3**: Press Ctrl+V (or Cmd+V on Mac) to paste images from clipboard

**Queue Controls:**
- **Previous/Next**: Navigate between queued images
- **Click Image**: Jump to any image in the queue
- **Remove (✕)**: Remove individual images from queue
- **Clear All**: Clear entire queue
- **Remove After Convert**: Enable to auto-remove images after processing

**Status Indicators:**
- **▶** = Currently active image (amber background)
- **✓** = Already processed/converted (green checkmark)

### Choosing a Resampling Method
When resizing images (using Max Width/Height), select the appropriate resampling method:

- **Lanczos** - Best for photographs and high-quality downscaling (with anti-aliasing)
- **Bicubic** - Good all-around choice, recommended default (with anti-aliasing)
- **Bilinear** - Faster processing with acceptable quality (with anti-aliasing)
- **Nearest Neighbor** - Use for pixel art or when you want sharp edges (no anti-aliasing)
- **Browser Default** - Let the browser handle resampling (no anti-aliasing)

*Note: Resampling only applies when the output dimensions differ from the crop dimensions. Anti-aliasing is automatically applied for Lanczos, Bicubic, and Bilinear when significantly downsampling.*

### Using the Fixed Ratio Feature (NEW in v2.4.0)
**Intelligent Dimension Linking** - Automatically maintain aspect ratio when setting constraints:

**Linked Mode (Default):**
1. Look for the 🔗 icon next to "Max Dimensions" heading
2. Enter a value in **Max Width** → **Max Height** auto-calculates based on your crop's aspect ratio
3. Or enter a value in **Max Height** → **Max Width** auto-calculates automatically
4. Inputs have a blue ring border to indicate linked mode

**Unlinked Mode:**
1. Click the 🔗 icon to toggle to ⛓️‍💥 (unlinked) mode
2. Now you can set width and height independently
3. Useful when you need specific dimensions that don't match your crop ratio
4. Inputs lose the blue ring border in unlinked mode

**Smart Behavior:**
- Uses your **current crop's aspect ratio** for calculations (not the preset's ratio)
- Automatically disables when **Freestyle Mode** is active (button shows ⛓️ grayed out)
- Re-enables when you switch back to a preset mode
- **Linked by default** for intuitive workflow - you can toggle any time

**When to Use Each Mode:**
- **Linked Mode**: When you want to maintain aspect ratio while setting just one dimension
- **Unlinked Mode**: When you need specific width AND height (e.g., exact 1200x800 for a banner)

### Loading Custom Presets
1. Click the **"Load Custom Presets"** button in the "Preset Source" section
2. Select your JSON preset file (e.g., `presets.json` or `example_presets.json`)
3. The app will load all presets from the file

**Tip:** You can use `example_presets.json` as a reference, or import it into the Preset Editor to customize it further!

### Switching Between Presets
- Once loaded, custom presets appear in the **"Crop Preset"** dropdown
- An info panel shows preset-specific settings (if any) for the selected preset
- Click **"Use Built-in"** to switch back to built-in presets
- Click **"Load Different"** to load a different custom preset file

### Preset Information
When a custom preset is selected, you'll see an amber-colored info panel showing:
- Max width constraint (if specified)
- Max height constraint (if specified)
- Target file size (if specified)

## JSON Format

Your JSON preset file should follow this format:

```json
{
  "Preset Name": {
    "max-width": 1000,
    "max-height": 2000,
    "max-filesize": 1,
    "max-filesize-unit": "MB",
    "crop-ratio": 0.5,
    "default-selection": "Landscape"
  }
}
```

### Available Properties
- `max-width`: Maximum width in pixels (optional)
- `max-height`: Maximum height in pixels (optional)
- `max-filesize`: Target file size value (optional)
- `max-filesize-unit`: Unit for file size - "KB", "MB", or "GB" (default: "MB")
- `crop-ratio`: Aspect ratio (width/height) for cropping (optional, null = freestyle)
- `default-selection`: Auto-select trigger - "Square", "Landscape", or "Portrait" (optional)

### Example Presets
The included `presets.json` file contains presets for:
- **BlueSky** (various image layouts)
- **Twitter/X** (various image layouts)
- **Discord** (image layouts)
- Generic aspect ratios (Square, 16:9, 9:16, etc.)

**See Also:** Check out `example_presets.json` for additional preset examples that you can use as a reference when creating your own custom presets.

## Built-in Presets
The app includes these built-in presets:
- Freestyle
- Square (1:1)
- 16:9 Landscape
- 9:16 Portrait
- 4:3 Landscape
- 3:4 Portrait
- 21:9 Ultrawide
- Twitter Post
- Twitter Header
- Instagram Square/Portrait/Landscape
- Facebook Post
- YouTube Thumbnail
- Discord Avatar
- Pinterest Pin

## Tips & Best Practices

### Image Quality (NEW in v2.1)
- **Anti-aliasing works automatically** - no configuration needed
- For high-quality downsampling: Use **Lanczos** or **Bicubic** with anti-aliasing (default)
- Downsampling 4K to 1080p? Anti-aliasing prevents oversharpening and ringing artifacts
- Want pixel-perfect sharp edges? Use **Nearest Neighbor** (skips anti-aliasing)

### Performance
- For batch processing large images, use "Auto Zoom to Fit" and "Remove After Convert" for faster workflow
- Lanczos resampling is slower but produces the best quality for downscaling
- Use Nearest Neighbor for pixel art to preserve sharp edges
- Anti-aliasing adds minimal overhead (only applies when needed)

### Presets
- Place `presets.json` in the same folder as the converter for automatic loading
- Use `default-selection` to auto-select presets based on image orientation
- Custom presets override manual settings for max dimensions and target file size
- You can still manually adjust quality and lossless settings after preset selection
- The crop can be adjusted manually on the canvas even with presets

### Workflow
- Process similar images in batch using the queue system with the same settings
- Use "Optimize for Web" to hit specific file size targets
- Combine resampling methods with quality settings for optimal results
- Navigate queue with Previous/Next buttons or click images directly
- Watch for "Applying anti-aliasing..." status message during significant downsampling

### File Management
- Converted files are named with date, resolution, and quality: `image-2025-10-26-1920x1080px-q95.webp`
- Lossless files are marked with `qLL` in the filename
- No data leaves your computer - all processing is client-side

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Created by **Flash Galatine**

- GitHub: [FlashGalatine](https://github.com/FlashGalatine)
- X/Twitter: [@AsheJunius](https://x.com/AsheJunius)
- Twitch: [flashgalatine](https://www.twitch.tv/flashgalatine)
- Discord: [discord.gg/5VUSKTZCe5](https://discord.gg/5VUSKTZCe5)
- BlueSky: [@projectgalatine.com](https://bsky.app/profile/projectgalatine.com)
- Patreon: [Project Galatine](https://www.patreon.com/ProjectGalatine)
- Blog: [blog.projectgalatine.com](https://blog.projectgalatine.com/)
