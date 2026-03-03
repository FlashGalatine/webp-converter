# Multi-Crop Feature

## Purpose

The Multi-Crop Feature allows the user to designate multiple boxed areas of an image, each with its own preset, resampling, and export settings, and export them all at once.

## How It Works

### 1. Load an Image

Load an image onto the canvas as usual (file picker, drag-drop, or Ctrl+V).

### 2. Select Crop Zones

Select areas, either constrained by a specific aspect ratio, or freestyle.

- Each crop zone can be assigned a specific preset as defined in the `presets.json` file or any user-defined presets JSON file (such as the `example_presets.json` file).
- Each crop zone carries its own **export settings** (resampling method, quality mode, filesize limit, etc.), inherited from the preset by default but overridable per-zone.
- By default, each zone is named after the preset used in that zone.
  - If 2 or more zones use the same preset, a number is appended.
    - For example: `Instagram Portrait 1`, `Instagram Portrait 2`, etc.

### 3. Export

- The number of images produced equals the number of crop zones.
- Each zone is exported independently using its own export settings.
- The filenames contain the name of the preset.
  - Examples:
    - `Instagram Portrait-1080x1440px-q95.webp`
    - `FullHD-1920x1080px-q90.webp`
    - `Small Portrait-340x570px-qLL.webp`
    - `Discord Thumbnail-400x400px-max1024kb.webp` (filesize-constrained)
    - `Archival Full Res-3840x2160px-lossless.webp` (lossless)

---

## Implementation Approach: Web (React + TypeScript + HTML Canvas)

This feature is built into the existing web application. The `PYTHON/` folder is **deprecated** — all new development happens in the web version.

### Current Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 (functional components, hooks) |
| Language | TypeScript |
| Bundler | Vite 5 |
| Styling | Tailwind CSS 3 |
| Testing | Vitest |
| Routing | React Router DOM 6 |
| Canvas | Native HTML Canvas 2D API (no Fabric.js / Konva) |
| State | Pure React hooks (`useState`, `useRef`) — no Redux/Zustand/Context |

### Current Single-Crop Architecture

The app currently supports exactly **one crop rectangle** at a time. Key pieces:

| Module | Role |
|---|---|
| `useCanvas` hook (~400 lines) | Manages crop geometry (`cropX/Y/Width/Height`), zoom/pan, aspect ratio locking, mouse/wheel handlers, drag state |
| `Canvas.tsx` component | Renders `<canvas>`, delegates all interaction to `useCanvas` |
| `renderCanvas()` utility | Draws image → dark overlay outside crop → yellow crop border → rule-of-thirds grid → 8 resize handles |
| `usePresets` hook | Loads built-in or custom presets, maps preset names to aspect ratios |
| `useImageProcessing` hook | Crops region → resizes via custom resampling (lanczos/bicubic/bilinear/nearest/browser) → encodes to WebP via `canvas.toBlob()` → triggers download |
| `useImageQueue` hook | Multi-file queue navigation and tracking |
| `WebPConverter` component | Orchestrates all hooks, passes props to `Canvas`, `Controls`, `Toolbar`, `QueuePanel` |

### What Changes for Multi-Crop

The core challenge: **evolve from a single crop rect to an array of crop zones**, each with independent settings, while preserving the existing single-crop UX as the default mode.

---

## Data Models

### CropZone (new type)

```typescript
interface CropZone {
  id: string;                     // crypto.randomUUID()
  label: string;                  // e.g. "Instagram Portrait 1"
  presetName: string | null;      // references a preset key, null if freestyle
  rect: CropBounds;              // { x, y, width, height } in image coordinates
  aspectRatio: number | null;     // locked if preset defines one, null if freestyle
  exportSettings: ExportSettings;
  isSelected: boolean;            // currently active/focused zone
}
```

### ExportSettings (new type)

Each crop zone carries its own export profile. One zone might target a 1 MB filesize limit while another exports lossless regardless of size.

```typescript
type QualityMode = 'quality' | 'filesize' | 'lossless';

interface ExportSettings {
  resampling: ResamplingMethod;   // existing type: 'bicubic' | 'lanczos' | 'bilinear' | 'nearest' | 'browser'
  qualityMode: QualityMode;
  quality: number;                // 1-100, used when qualityMode === 'quality'
  maxFilesizeKb: number | null;   // target in KB, used when qualityMode === 'filesize'
  format: 'webp' | 'png' | 'jpeg';
}
```

### Updated Preset Schema

The existing `presets.json` keys (`max-filesize`, `max-filesize-unit`, `crop-ratio`, `max-width`, `max-height`, `default-selection`) are preserved. A new optional `export` block can be added per preset:

```json
{
  "Instagram Portrait": {
    "max-width": 1080,
    "max-height": 1350,
    "crop-ratio": 0.8,
    "max-filesize": 1,
    "max-filesize-unit": "MB",
    "export": {
      "resampling": "lanczos",
      "qualityMode": "quality",
      "quality": 95,
      "format": "webp"
    }
  },
  "Discord Thumbnail": {
    "max-width": 400,
    "max-height": 400,
    "crop-ratio": 1,
    "max-filesize": 1,
    "max-filesize-unit": "MB",
    "export": {
      "resampling": "lanczos",
      "qualityMode": "filesize",
      "maxFilesizeKb": 1024,
      "format": "webp"
    }
  },
  "Archival Full Res": {
    "export": {
      "resampling": "lanczos",
      "qualityMode": "lossless",
      "format": "webp"
    }
  }
}
```

**Schema notes:**
- The `export` block is **optional**. If omitted, the zone uses global defaults.
- `max-width` / `max-height` omitted → use the crop zone's native resolution (no resize).
- `crop-ratio` omitted → freestyle / unconstrained.
- Users can **override** preset export settings per-zone in the UI without modifying the preset file.

**Global defaults** (when no `export` block is defined):

```json
{
  "resampling": "lanczos",
  "qualityMode": "quality",
  "quality": 90,
  "format": "webp"
}
```

---

## Export Settings in Detail

### Quality Modes

| Mode | Behavior | Use Case |
|---|---|---|
| `quality` | Encode at a fixed quality value (1–100) | General use, predictable output |
| `filesize` | Binary-search the quality parameter until output ≤ `maxFilesizeKb` | Platform upload limits (e.g. 1 MB for Discord, 10 MB for email) |
| `lossless` | WebP lossless encoding, ignores quality value | Archival, source-quality exports |

### Filesize-Constrained Export (Binary Search)

The app already has this pattern in `useImageProcessing` (the "web optimize" path iterates quality from 100→1). For Multi-Crop, this is refined:

1. Start with quality = 95, call `canvas.toBlob('image/webp', quality / 100)`.
2. If blob size > `maxFilesizeKb`, lower quality (binary search).
3. If blob size ≤ target, try raising quality to get closer.
4. Converge within ±1 quality step.
5. If quality 1 still exceeds the limit, warn the user and suggest reducing the zone's output resolution.

### Resampling Methods

The app already supports these via `ResamplingMethod` type and custom implementations in `src/utils/imageProcessing/resampling.ts`:

| Method | Description |
|---|---|
| `lanczos` | High-quality downscaling (default) |
| `bicubic` | Good balance of quality and speed |
| `bilinear` | Fast, acceptable quality |
| `nearest` | Pixel art, no interpolation |
| `browser` | Browser's native `drawImage` (fastest, quality varies by browser) |

---

## Architecture — New & Modified Modules

### New Files

| File | Purpose |
|---|---|
| `src/types/cropZone.ts` | `CropZone`, `ExportSettings`, `QualityMode` interfaces |
| `src/hooks/useCropZones.ts` | State management for the array of crop zones: add, remove, select, update, reorder |
| `src/hooks/useMultiCropExport.ts` | Export loop: iterates zones, crops, resizes, encodes per-zone settings, triggers download (or zip) |
| `src/components/CropZonePanel/CropZonePanel.tsx` | Sidebar listing all zones with per-zone controls |
| `src/components/CropZonePanel/CropZoneCard.tsx` | Individual zone card: label, preset dropdown, export settings |
| `src/utils/canvas/multiCropRendering.ts` | Extended `renderCanvas` that draws multiple rectangles with labels, handles, and distinct colors |

### Modified Files

| File | Change |
|---|---|
| `src/hooks/useCanvas.ts` | Refactor from single crop state to operating on the **active zone** from `useCropZones`. Mouse down on empty space creates a new zone; mouse down on existing zone selects it. |
| `src/utils/canvas/rendering.ts` | Extract shared rendering logic; `multiCropRendering.ts` extends it for multiple rects |
| `src/utils/canvas/interactions.ts` | `detectHandle` and `isInsideCrop` need to iterate over all zones, returning which zone (if any) was hit |
| `src/components/Canvas/Canvas.tsx` | Accept `cropZones` array and `activeZoneId` instead of single crop coords |
| `src/components/Converter/WebPConverter.tsx` | Add `useCropZones` hook, wire up `CropZonePanel`, add multi-export button |
| `src/hooks/usePresets.ts` | `applyPresetSettings` returns `ExportSettings` in addition to existing maxWidth/maxHeight/targetSize |
| `src/types/index.ts` | Re-export new types from `cropZone.ts` |

### Unchanged Files

- `src/hooks/useImageQueue.ts` — queue management is orthogonal to multi-crop
- `src/hooks/useDebouncedCallback.ts`
- `src/components/Toolbar/` — existing toolbar works as-is (zoom controls, etc.)
- `src/constants/` — no changes needed to canvas constants or cursor maps

---

## Key Interactions

### Mode Toggle

A toggle or tab control switches between:
- **Single-Crop Mode** (current behavior, one rect, existing Controls panel)
- **Multi-Crop Mode** (multiple zones, CropZonePanel sidebar)

This ensures backward compatibility — existing users see no change unless they opt in.

### Drawing a Crop Zone (Multi-Crop Mode)
1. User selects a preset from the CropZonePanel (or "Freestyle").
2. User clicks and drags on the canvas in an empty area.
3. If a preset is selected, the rectangle constrains to that aspect ratio during drag.
4. On release, a new `CropZone` is created with the preset's export settings pre-filled and added to the zones array.

### Selecting & Manipulating Zones
- **Click on a zone** → selects it (highlighted border, handles appear).
- **Move:** Click and drag the zone body.
- **Resize:** Drag corner/edge handles (with aspect ratio lock if preset-bound).
- **Delete:** Select zone → press Delete key, or click remove button in the CropZonePanel.
- **Rename:** Editable label field in the CropZonePanel card.
- **Adjust export settings:** Per-zone controls in the CropZonePanel card.

### Visual Differentiation
- Each zone gets a **distinct border color** (cycling through a palette).
- The **selected zone** has a brighter/thicker border and visible resize handles.
- Non-selected zones show a **semi-transparent overlay** and a **label** (preset name).
- Non-selected zones have **no resize handles** (reduces visual clutter).

### Zoom & Pan
- Same as current: scroll wheel = zoom, middle-click/Ctrl+drag = pan.
- All zone coordinates map to image-space, so zoom/pan affects the viewport, not the zones.

---

## Crop Zone Panel — Per-Zone Controls

Each zone card in the sidebar:

| Control | Widget | Behavior |
|---|---|---|
| **Color swatch** | Circle | Shows the zone's border color for easy identification on canvas |
| **Preset** | Dropdown | Selecting a preset auto-fills export settings and aspect ratio |
| **Label** | Text input | Editable, auto-generated from preset name + optional number |
| **Resampling** | Dropdown | `lanczos`, `bicubic`, `bilinear`, `nearest`, `browser` |
| **Quality Mode** | Radio/toggle | `Quality` / `Filesize Limit` / `Lossless` |
| **Quality** | Slider (1–100) | Visible when mode = Quality |
| **Max Filesize** | Number input (KB) | Visible when mode = Filesize Limit |
| **Format** | Dropdown | `webp`, `png`, `jpeg` |
| **Override badge** | Icon | Shows when settings differ from the preset defaults |
| **Delete** | Button | Removes the zone |

---

## Export Process

### Single-Zone Export (unchanged)
Existing flow via `useImageProcessing` — one crop, one file, auto-download.

### Multi-Zone Export (new)
1. For each `CropZone` in order:
   1. Create an offscreen `<canvas>`, draw the cropped region at original resolution.
   2. Resize to the preset's `max-width` / `max-height` using the zone's resampling method (via existing `resampling.ts` utilities).
   3. Encode based on `qualityMode`:
      - **quality** → `canvas.toBlob('image/webp', quality / 100)`
      - **filesize** → binary-search quality until blob ≤ `maxFilesizeKb`
      - **lossless** → encode with quality = 1.0 (browser lossless WebP)
   4. Collect the blob with the generated filename.
2. If a single zone was exported → auto-download the file directly.
3. If multiple zones → bundle into a **ZIP file** (using a lightweight library like `JSZip`) and auto-download the zip.
   - Alternatively, trigger individual downloads in sequence (user preference).
4. Show a summary toast/log: each zone's filename, dimensions, filesize, effective quality.

### Export Naming Convention

| Quality Mode | Filename Pattern | Example |
|---|---|---|
| `quality` | `{label}-{w}x{h}px-q{quality}.webp` | `Instagram Portrait-1080x1350px-q95.webp` |
| `filesize` | `{label}-{w}x{h}px-max{kb}kb.webp` | `Discord Thumbnail-400x400px-max1024kb.webp` |
| `lossless` | `{label}-{w}x{h}px-lossless.webp` | `Archival Full Res-3840x2160px-lossless.webp` |

### Duplicate Preset Naming
- If only one zone uses a preset → no number suffix.
- If multiple zones share a preset → append ` 1`, ` 2`, etc.
  - Example: `Instagram Portrait 1-1080x1350px-q95.webp`, `Instagram Portrait 2-1080x1350px-q95.webp`

---

## Project Structure (files affected)

```
src/
├── types/
│   ├── index.ts                          # Re-exports, existing types unchanged
│   ├── canvas.ts                         # CropBounds etc. (unchanged)
│   ├── presets.ts                        # PresetEditorPreset (unchanged)
│   └── cropZone.ts                       # ← NEW: CropZone, ExportSettings, QualityMode
│
├── hooks/
│   ├── useCanvas.ts                      # MODIFIED: operates on active zone from useCropZones
│   ├── useCropZones.ts                   # ← NEW: crop zones array state management
│   ├── useCropZones.test.ts              # ← NEW: tests for zone CRUD, naming, selection
│   ├── useMultiCropExport.ts             # ← NEW: multi-zone export loop
│   ├── useMultiCropExport.test.ts        # ← NEW: export logic tests
│   ├── usePresets.ts                     # MODIFIED: applyPresetSettings returns ExportSettings
│   ├── useImageProcessing.ts             # UNCHANGED (single-crop mode still uses this)
│   ├── useImageQueue.ts                  # UNCHANGED
│   └── useDebouncedCallback.ts           # UNCHANGED
│
├── components/
│   ├── Canvas/
│   │   └── Canvas.tsx                    # MODIFIED: accepts zones array + activeZoneId
│   ├── CropZonePanel/                    # ← NEW folder
│   │   ├── CropZonePanel.tsx             # Sidebar listing all zones
│   │   └── CropZoneCard.tsx              # Per-zone card with export controls
│   ├── Converter/
│   │   └── WebPConverter.tsx             # MODIFIED: mode toggle, integrates useCropZones
│   ├── Controls/                         # UNCHANGED (used in single-crop mode)
│   ├── Toolbar/                          # UNCHANGED
│   ├── Queue/                            # UNCHANGED
│   └── ...
│
├── utils/
│   ├── canvas/
│   │   ├── rendering.ts                  # MODIFIED: extract shared logic
│   │   ├── multiCropRendering.ts         # ← NEW: renders multiple zones with labels/colors
│   │   └── interactions.ts               # MODIFIED: hit-test against all zones
│   ├── imageProcessing/
│   │   ├── conversion.ts                 # UNCHANGED (used by single-crop + per-zone export)
│   │   └── resampling.ts                 # UNCHANGED
│   └── presets/                          # UNCHANGED
│
├── constants/
│   ├── canvas.ts                         # UNCHANGED
│   ├── cursors.ts                        # UNCHANGED
│   ├── presets.ts                        # UNCHANGED
│   └── cropZoneColors.ts                 # ← NEW: color palette for zone borders
│
└── App.tsx                               # UNCHANGED (routing stays the same)
```

---

## Performance Considerations for 4K+ Images

| Concern | Solution |
|---|---|
| Canvas rendering with many zones | Only draw handles for the selected zone; other zones just get a border + label. `requestAnimationFrame` batching. |
| Large image in memory | The browser handles `HTMLImageElement` natively. Only one source image at a time. |
| Export of multiple zones | Process zones sequentially to avoid memory spikes from multiple offscreen canvases. Show progress per-zone. |
| Filesize binary search | `canvas.toBlob()` into memory (no disk I/O); typically converges in 6-8 iterations. |
| ZIP bundling | `JSZip` generates the archive in-memory. For many large exports, stream to a download via `StreamSaver.js` as a future optimization. |

---

## New Dependencies

| Package | Purpose | Notes |
|---|---|---|
| `jszip` | Bundle multi-zone exports into a single ZIP download | Lightweight (~45 KB gzipped), well-maintained |

All other functionality uses existing dependencies (React, Vite, Tailwind) and browser APIs (`canvas.toBlob`, `crypto.randomUUID`).

---

## Future Enhancements (out of scope for v1)

- Batch mode: load multiple source images, apply the same crop zone layout to all
- Overlay dimming: dim areas outside all crop zones for visual clarity
- Snap-to-grid / snap-to-other-zones alignment helpers
- Undo/Redo stack for zone operations
- AVIF / JXL format support (when browser support improves)
- Export progress bar with per-zone status
- Save/load crop zone layouts as reusable templates
- Preset editor integration (edit export blocks in the existing `/preset-editor` route)
