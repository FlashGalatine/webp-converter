# WebP Converter v3.0.0-alpha

**Modern React + TypeScript + Vite architecture** - Fast, type-safe, and fully integrated preset editor!

## Quick Start

### Development Mode (Recommended)

```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run dev
```

Then open http://localhost:5173 in your browser.

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

The production build outputs to `dist/` directory.

### Legacy Standalone Version

The original standalone HTML files are available in the `legacy/` directory:
- `legacy/index.html` - Legacy v2.6.1 converter (standalone, no build required)
- `legacy/webp-conv-experimental.html` - Legacy experimental build
- `preset-editor.html` - Legacy standalone preset editor (now integrated in main app)

---

## What's New in v3.0.0-alpha

### 🚀 Complete Architecture Refactor
**Modern Development Stack** - Rebuilt from the ground up with professional tooling

- **Vite + TypeScript**: Fast HMR, type safety, and modern build tooling
- **React 18**: Component-based architecture with hooks
- **Tailwind CSS**: Utility-first styling with full customization
- **Modular Codebase**: Clean separation of concerns (components, hooks, utilities, types)
- **Build Optimization**: Production builds are tree-shaken and minified
  - Bundle: 247.59 KB (77.20 KB gzipped)
  - CSS: 6.55 KB (1.68 KB gzipped)

### ✨ Integrated Preset Editor Modal (NEW!)
**No more switching between files** - Create and manage presets without leaving the converter

- **Modal Interface**: Opens directly in the main app via "Create/Edit Presets" button
- **Visual Editor**: Add, remove, reorder presets with smooth animations
- **Drag & Drop Import**: Drop JSON files anywhere on the modal to import
- **Live JSON Preview**: See the generated JSON before exporting
- **Save & Apply**: Instantly load your presets into the converter
- **Validation**: Real-time validation with error messages
- **Default Selection Status**: Visual panel shows current assignments (Square/Landscape/Portrait)
- **All Legacy Features**: Complete feature parity with `preset-editor.html`

### 🏗️ Professional Code Structure

```
src/
├── components/         # React components
│   ├── Canvas/        # Image display and crop overlay
│   ├── Controls/      # Conversion settings
│   ├── ErrorBoundary/ # Error handling
│   ├── PresetEditor/  # Integrated preset editor modal
│   ├── Presets/       # Preset selection
│   ├── Queue/         # Batch processing
│   ├── Toolbar/       # Zoom controls
│   └── ui/            # Reusable UI primitives (Button, Input, Modal, etc.)
├── containers/        # Container components with business logic
├── hooks/             # Custom React hooks (state management)
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
│   ├── canvas/        # Canvas operations
│   ├── imageProcessing/ # Conversion and resampling
│   ├── files/         # File operations
│   └── presets/       # Preset management
└── constants/         # App constants
```

### 🎨 Enhanced Features

**Phase 7 Optimizations:**
- ✅ Full 8-directional crop resize with aspect ratio enforcement
- ✅ Error boundary for graceful error handling
- ✅ Loading spinners with size variants
- ✅ Improved accessibility (ARIA labels, keyboard shortcuts)
- ✅ Keyboard shortcuts displayed in header (+/-, 0, F)

**Phase 8 Integration:**
- ✅ Preset Editor fully integrated as modal
- ✅ All validation logic (name uniqueness, crop ratio format, default selections)
- ✅ Import/Export JSON with proper type validation
- ✅ Reordering animations (slide up/down with blue glow)

### 🔧 Development Experience

- **Hot Module Replacement (HMR)**: Changes reflect instantly without page reload
- **TypeScript IntelliSense**: Full autocomplete and type checking
- **Component Isolation**: Each component is self-contained and testable
- **Consistent Patterns**: Hooks for state, props for data flow
- **No Magic**: Explicit imports, clear dependencies

---

## How to Use

### Starting the App

**Development:**
```bash
npm run dev
```
- Opens at http://localhost:5173
- Hot reload on file changes
- Development error overlays
- Source maps for debugging

**Production:**
```bash
npm run build
npm run preview
```
- Optimized production build
- Opens at http://localhost:4173
- Minified and tree-shaken code

### Using the Converter

1. **Load Images**
   - Click "📁 Load Image" button
   - Drag & drop images onto canvas
   - Press **Ctrl+V** (or Cmd+V) to paste from clipboard
   - Multi-select for batch processing

2. **Adjust Crop**
   - Select a preset from dropdown or use Freestyle mode
   - Drag crop area to reposition
   - Resize from any of 8 handles
   - Zoom with mouse wheel or toolbar buttons
   - Pan by dragging outside crop area

3. **Configure Settings**
   - Adjust quality slider (1-100) or enable lossless
   - Set max width/height constraints (use 🔗 to link dimensions)
   - Choose resampling method (Lanczos, Bicubic, Bilinear, Nearest Neighbor)
   - Enable "Optimize for Web" for target file size

4. **Convert & Download**
   - Click "Convert & Download" button
   - File downloads with metadata in filename
   - For queues: auto-advances to next image

### Creating Custom Presets

**Option 1: Integrated Preset Editor (Recommended)**
1. Click **"✏️ Create/Edit Presets"** in the Presets panel
2. Click "➕ Add Preset" to create new presets
3. Fill in preset details:
   - **Name** (required, unique)
   - **Crop Ratio** (e.g., "16/9" or "1.777")
   - **Max Width/Height** (pixels)
   - **Max File Size** (with KB/MB/GB selector)
   - **Default Selection** (Square/Landscape/Portrait)
4. Use ↑/↓ arrows to reorder presets
5. Click **"Save & Apply"** to load into converter
6. Or click **"💾 Export JSON"** to save for later

**Option 2: Import JSON File**
1. Click **"📁 Load Custom Presets"** in the Presets panel
2. Select your JSON file (e.g., `presets.json` or `example_presets.json`)
3. Presets load immediately

**Drag & Drop:**
- Drag JSON files onto the Preset Editor modal
- Blue overlay appears when ready to drop
- Presets import instantly

### Image Queue System

**Loading Multiple Images:**
- Select multiple files with Ctrl/Cmd+Click
- Drag & drop multiple images
- Paste multiple images from clipboard

**Queue Controls:**
- **Previous/Next**: Navigate between images
- **Click Image**: Jump to specific image
- **Remove (✕)**: Remove individual image
- **Clear All**: Clear entire queue
- **Remove After Convert**: Auto-remove after processing

**Status Indicators:**
- **▶ Amber background**: Currently active image
- **✓ Green checkmark**: Already processed

### Keyboard Shortcuts

- **+/=**: Zoom in
- **-**: Zoom out
- **0**: Reset zoom to 100%
- **F**: Zoom to fit
- **Ctrl+V** (Cmd+V): Paste image from clipboard
- **ESC**: Close modal (when open)

---

## Resampling Methods

When resizing images using Max Width/Height constraints:

- **Lanczos**: Highest quality, best for downscaling (with anti-aliasing)
- **Bicubic**: Recommended default, excellent quality/speed balance (with anti-aliasing)
- **Bilinear**: Fast processing with acceptable quality (with anti-aliasing)
- **Nearest Neighbor**: Fastest, preserves hard edges (ideal for pixel art, no anti-aliasing)
- **Browser Default**: Native browser resampling (no anti-aliasing)

**Anti-aliasing** automatically applies for significant downsampling (< 67% scale) with Lanczos, Bicubic, and Bilinear methods to prevent oversharpening artifacts.

---

## Custom Preset JSON Format

```json
{
  "Preset Name": {
    "crop-ratio": "16/9",
    "max-width": 1920,
    "max-height": 1080,
    "max-filesize": 1.5,
    "max-filesize-unit": "MB",
    "default-selection": "Landscape"
  }
}
```

### Available Properties

- **crop-ratio**: Aspect ratio as string ("16/9") or decimal (1.777) - optional
- **max-width**: Maximum width in pixels - optional
- **max-height**: Maximum height in pixels - optional
- **max-filesize**: Target file size value - optional
- **max-filesize-unit**: "KB", "MB", or "GB" (default: "MB") - optional
- **default-selection**: "Square", "Landscape", or "Portrait" - optional

**Validation Rules:**
- Preset names must be unique (case-insensitive)
- Crop ratio must be valid format ("16/9" or decimal)
- Only ONE preset per default-selection type
- File size unit must be KB, MB, or GB

---

## Built-in Presets

- Freestyle (no aspect ratio constraint)
- Square (1:1)
- 16:9 Landscape / 9:16 Portrait
- 4:3 Landscape / 3:4 Portrait
- 21:9 Ultrawide
- Twitter Post / Twitter Header
- Instagram Square / Portrait / Landscape
- Facebook Post
- YouTube Thumbnail
- Discord Avatar
- Pinterest Pin

---

## Tips & Best Practices

### Development
- Use `npm run dev` for fast iteration with HMR
- TypeScript catches errors before runtime
- Component isolation makes testing easier
- Vite build is optimized for production

### Image Quality
- Anti-aliasing works automatically for downsampling
- Use **Lanczos** or **Bicubic** for high-quality photos
- Use **Nearest Neighbor** for pixel art (no blur)
- Quality 85-95 is optimal for most photos

### Performance
- Batch processing: Use queue with "Remove After Convert"
- Lanczos is slower but produces best quality
- HMR makes development extremely fast
- Production build is optimized and minified

### Presets
- Use Integrated Preset Editor for visual management
- Place `presets.json` in project root for auto-loading
- Export presets from editor for backup
- Use `example_presets.json` as reference

### Workflow
- Process similar images in batch with same settings
- Use "Optimize for Web" for file size targets
- Combine resampling + quality for optimal results
- Keyboard shortcuts speed up workflow significantly

---

## Project Structure

### Key Directories

- **src/components/**: React components (Canvas, Controls, Presets, etc.)
- **src/containers/**: Container components with business logic
- **src/hooks/**: Custom React hooks for state management
- **src/utils/**: Utility functions (canvas, image processing, files)
- **src/types/**: TypeScript type definitions
- **src/constants/**: Application constants
- **legacy/**: Original standalone HTML files (v2.6.1)
- **dist/**: Production build output (generated)

### Configuration Files

- **vite.config.ts**: Vite configuration
- **tsconfig.json**: TypeScript compiler options
- **tailwind.config.js**: Tailwind CSS customization
- **package.json**: Dependencies and scripts

---

## npm Scripts

```bash
npm run dev      # Start development server (localhost:5173)
npm run build    # Build for production (outputs to dist/)
npm run preview  # Preview production build (localhost:4173)
```

---

## Migration from Legacy Version

The v3.0.0 refactor maintains **100% feature parity** with v2.6.1:

**Migrated Features:**
- ✅ All 16 built-in presets
- ✅ Custom preset loading and validation
- ✅ Image queue with batch processing
- ✅ All 5 resampling methods + anti-aliasing
- ✅ Crop resize with 8-directional handles
- ✅ Zoom, pan, and canvas interactions
- ✅ Quality optimization and file size targeting
- ✅ Clipboard paste support
- ✅ Fixed ratio dimension linking
- ✅ Freestyle mode toggle
- ✅ **Preset Editor (now integrated as modal)**

**New in v3.0.0:**
- ✅ TypeScript type safety
- ✅ Component-based architecture
- ✅ Hot Module Replacement (HMR)
- ✅ Error boundary for error handling
- ✅ Integrated Preset Editor modal
- ✅ Professional build tooling
- ✅ Accessibility improvements

**Legacy Files:**
- Available in `legacy/` directory
- No build required (standalone HTML)
- v2.6.1 feature set preserved

---

## Browser Compatibility

Requires modern browser with:
- ES2020+ JavaScript support
- Canvas API
- WebP support
- File API

**Tested on:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

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
