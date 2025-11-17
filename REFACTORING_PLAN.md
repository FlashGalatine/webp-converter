# WebP Converter Refactoring Plan

## Executive Summary

This document outlines the plan to refactor WebP Converter from a monolithic single-file HTML application (~2,200 lines) to a modern, component-based architecture using Vite and TypeScript.

**Current State:** Single HTML file with inline React (via Babel Standalone)
**Target State:** Modular Vite + TypeScript + React application
**Primary Goals:** Improved maintainability, better developer experience, eliminate dual STABLE/EXPERIMENTAL builds

---

## Current Architecture Analysis

### Strengths
- **Zero setup required** - Just open in browser
- **No build step** - Direct file:// access works
- **Self-contained** - All dependencies via CDN
- **Proven stability** - Production-ready at v2.6.1

### Pain Points
- **Maintainability** - 2,200 lines in single file
- **Dual builds** - Must maintain STABLE and EXPERIMENTAL separately
- **No type safety** - JavaScript with no TypeScript benefits
- **Limited tooling** - No IntelliSense, linting, or formatting
- **No module system** - Everything in global scope
- **Difficult testing** - Can't unit test individual functions
- **Copy-paste updates** - Moving features from EXPERIMENTAL to STABLE

---

## Proposed Architecture

### Technology Stack

**Build System:**
- **Vite** - Fast, modern build tool with excellent DX
  - Hot Module Replacement (HMR)
  - Fast cold start
  - Optimized production builds
  - Built-in TypeScript support

**Language:**
- **TypeScript** - Type safety and better IDE support
  - Catch errors at compile time
  - Better autocomplete and IntelliSense
  - Self-documenting code with type annotations
  - Easier refactoring

**Framework:**
- **React 18** - Keep existing React code (installed via npm)
- **React Hooks** - Continue current state management approach

**Styling:**
- **Tailwind CSS** - Keep existing styling (installed via npm)
- **PostCSS** - For Tailwind processing

**Code Quality:**
- **ESLint** - Linting and code quality
- **Prettier** - Code formatting
- **TypeScript Compiler** - Type checking

---

## Project Structure

```
webp-converter/
├── legacy/                          # Archive old single-file builds
│   ├── index.html                   # v2.6.1 STABLE
│   └── webp-conv-experimental.html  # EXPERIMENTAL
│
├── public/                          # Static assets
│   ├── favicon.ico
│   └── og-image.png
│
├── src/
│   ├── main.tsx                     # Application entry point
│   ├── App.tsx                      # Root component
│   │
│   ├── components/
│   │   ├── Canvas/
│   │   │   ├── ImageCanvas.tsx      # Main canvas component
│   │   │   ├── CropOverlay.tsx      # Crop rectangle & handles
│   │   │   └── CanvasControls.tsx   # Zoom/pan controls
│   │   │
│   │   ├── Controls/
│   │   │   ├── PresetSelector.tsx   # Preset dropdown
│   │   │   ├── QualitySettings.tsx  # Quality/lossless controls
│   │   │   ├── DimensionInputs.tsx  # Max width/height
│   │   │   ├── FreestyleToggle.tsx  # Freestyle mode checkbox
│   │   │   └── ConvertButton.tsx    # Main convert button
│   │   │
│   │   ├── Queue/
│   │   │   ├── ImageQueue.tsx       # Queue panel
│   │   │   ├── QueueItem.tsx        # Individual queue item
│   │   │   └── QueueControls.tsx    # Queue navigation
│   │   │
│   │   └── Presets/
│   │       ├── PresetLoader.tsx     # Load custom presets
│   │       └── PresetInfo.tsx       # Show preset details
│   │
│   ├── hooks/
│   │   ├── useImageState.ts         # Image loading & state
│   │   ├── useCanvasState.ts        # Canvas zoom/pan state
│   │   ├── useCropState.ts          # Crop area state
│   │   ├── useQueueState.ts         # Queue management
│   │   ├── usePresetState.ts        # Preset management
│   │   ├── useCanvasInteraction.ts  # Mouse/keyboard handlers
│   │   └── useClipboard.ts          # Clipboard paste support
│   │
│   ├── utils/
│   │   ├── imageProcessing/
│   │   │   ├── resampling.ts        # Resampling algorithms
│   │   │   ├── antialiasing.ts      # Gaussian blur
│   │   │   └── conversion.ts        # WebP conversion logic
│   │   │
│   │   ├── canvas/
│   │   │   ├── coordinates.ts       # Coordinate transforms
│   │   │   ├── drawing.ts           # Canvas drawing utilities
│   │   │   └── interaction.ts       # Handle detection, etc.
│   │   │
│   │   ├── presets/
│   │   │   ├── builtInPresets.ts    # Built-in preset definitions
│   │   │   ├── presetParser.ts      # Parse JSON presets
│   │   │   └── aspectRatio.ts       # Aspect ratio utilities
│   │   │
│   │   └── files/
│   │       ├── fileNaming.ts        # Generate filenames
│   │       └── download.ts          # Download utilities
│   │
│   ├── types/
│   │   ├── image.ts                 # Image-related types
│   │   ├── preset.ts                # Preset types
│   │   ├── canvas.ts                # Canvas types
│   │   └── queue.ts                 # Queue types
│   │
│   └── constants/
│       ├── canvas.ts                # Canvas constants
│       ├── imageProcessing.ts       # Processing constants
│       └── cursors.ts               # Cursor map
│
├── preset-editor/                   # Keep separate for now
│   └── preset-editor.html
│
├── index.html                       # Vite entry point
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config
├── vite.config.ts                   # Vite config
├── tailwind.config.js               # Tailwind config
├── postcss.config.js                # PostCSS config
├── .eslintrc.json                   # ESLint config
├── .prettierrc                      # Prettier config
│
├── CHANGELOG.md
├── README.md
├── FAQ.md
├── CLAUDE.md
├── PROJECT_SUMMARY.md
└── LICENSE
```

---

## Migration Strategy

### Phase 1: Foundation Setup (Week 1)

**Goal:** Set up build system and project structure

1. **Initialize Vite + TypeScript project**
   ```bash
   npm create vite@latest . -- --template react-ts
   ```

2. **Install dependencies**
   ```bash
   npm install
   npm install -D tailwindcss postcss autoprefixer
   npm install -D eslint prettier eslint-config-prettier
   ```

3. **Configure Tailwind CSS**
   - Set up PostCSS
   - Configure Tailwind with same classes used in original

4. **Set up code quality tools**
   - ESLint with React + TypeScript rules
   - Prettier for formatting
   - Git hooks (optional)

5. **Archive legacy files**
   - Move current HTML files to `legacy/` directory
   - Keep as reference and fallback

**Deliverable:** Empty Vite project with tooling configured

---

### Phase 2: Type Definitions (Week 1-2)

**Goal:** Define TypeScript interfaces for all data structures

1. **Create type definitions**
   - `types/image.ts` - Image, ImageData, ImageFile
   - `types/preset.ts` - Preset, CustomPreset, PresetConfig
   - `types/canvas.ts` - CanvasState, CropArea, Transform
   - `types/queue.ts` - QueueItem, QueueState

2. **Define constant types**
   - Resampling methods enum
   - Cursor types
   - Drag types

**Deliverable:** Complete type system documented in `src/types/`

---

### Phase 3: Extract Utilities (Week 2)

**Goal:** Move pure functions to utility modules

1. **Canvas utilities**
   - Coordinate transformations
   - Handle detection
   - Drawing functions

2. **Image processing utilities**
   - Resampling algorithms (Bicubic, Lanczos, etc.)
   - Anti-aliasing (Gaussian blur)
   - WebP conversion

3. **Preset utilities**
   - Parse aspect ratio strings
   - Load custom presets
   - Validate presets

4. **File utilities**
   - Generate filenames
   - Download management

**Deliverable:** All pure functions extracted and tested

---

### Phase 4: Create Custom Hooks (Week 3)

**Goal:** Extract state management logic

1. **State hooks**
   - `useImageState` - Image loading and management
   - `useCanvasState` - Zoom, pan, dimensions
   - `useCropState` - Crop area and aspect ratio
   - `useQueueState` - Queue management
   - `usePresetState` - Preset selection and loading

2. **Interaction hooks**
   - `useCanvasInteraction` - Mouse/keyboard events
   - `useClipboard` - Paste support

**Deliverable:** Reusable hooks with clear interfaces

---

### Phase 5: Build Components (Week 3-4)

**Goal:** Create React components from monolithic UI

**Priority 1 - Core Components:**
1. `ImageCanvas.tsx` - Main canvas rendering
2. `CropOverlay.tsx` - Crop rectangle and handles
3. `ConvertButton.tsx` - Conversion trigger

**Priority 2 - Control Components:**
4. `PresetSelector.tsx` - Preset dropdown
5. `QualitySettings.tsx` - Quality controls
6. `DimensionInputs.tsx` - Max dimensions
7. `FreestyleToggle.tsx` - Freestyle mode

**Priority 3 - Queue Components:**
8. `ImageQueue.tsx` - Queue panel
9. `QueueItem.tsx` - Individual items
10. `QueueControls.tsx` - Navigation

**Deliverable:** Fully componentized UI

---

### Phase 6: Integration & Testing (Week 4)

**Goal:** Wire everything together and test

1. **Integrate components in App.tsx**
2. **Test all features**
   - Image loading (file, drag-drop, paste)
   - Canvas interaction (zoom, pan, crop)
   - Preset selection and application
   - Queue management
   - Conversion with all resampling methods
   - Web optimization
   - Batch processing

3. **Browser compatibility testing**
   - Chrome, Firefox, Safari, Edge
   - Test on different screen sizes

**Deliverable:** Working application with feature parity

---

### Phase 7: Optimization & Polish (Week 5)

**Goal:** Performance and user experience improvements

1. **Performance optimizations**
   - Memoize expensive components
   - Optimize re-renders
   - Lazy load heavy utilities

2. **Developer experience**
   - Add helpful comments
   - Document component props
   - Create component stories (optional)

3. **Build optimization**
   - Code splitting
   - Bundle size analysis
   - Production build testing

**Deliverable:** Optimized production build

---

### Phase 8: Documentation & Migration (Week 5)

**Goal:** Update documentation and deploy

1. **Update documentation**
   - Update CLAUDE.md with new architecture
   - Update README.md with new dev instructions
   - Create MIGRATION.md for users

2. **Create migration path**
   - Keep legacy builds available
   - Provide both options initially
   - Gradual transition plan

3. **Deploy**
   - Set up build/deploy process
   - Test production build
   - Update GitHub Pages or hosting

**Deliverable:** Complete documentation and deployment

---

## Benefits of Refactoring

### Developer Experience
- **Type safety** - Catch errors before runtime
- **Better tooling** - IntelliSense, autocomplete, refactoring
- **Faster development** - HMR for instant feedback
- **Code organization** - Clear separation of concerns
- **Testing** - Unit test individual components

### Maintainability
- **Single source of truth** - No more dual STABLE/EXPERIMENTAL
- **Modular architecture** - Easy to find and modify code
- **Clear dependencies** - Import/export makes relationships explicit
- **Version control** - Better diffs and code review

### Feature Development
- **Experimental features** - Use feature flags instead of separate files
- **A/B testing** - Easy to test variations
- **Plugin architecture** - Easier to add new features
- **Shared components** - Reuse across preset editor

---

## Risk Assessment

### Risks

1. **Breaking Changes**
   - **Risk:** New architecture might introduce bugs
   - **Mitigation:** Comprehensive testing, keep legacy builds

2. **User Impact**
   - **Risk:** Users relying on single-file simplicity
   - **Mitigation:** Keep legacy builds, provide both options

3. **Bundle Size**
   - **Risk:** npm packages might increase bundle size
   - **Mitigation:** Tree shaking, code splitting, bundle analysis

4. **Build Complexity**
   - **Risk:** Users need Node.js and build process
   - **Mitigation:** Provide pre-built static files, clear docs

5. **Learning Curve**
   - **Risk:** Contributors need to learn new architecture
   - **Mitigation:** Comprehensive documentation, clear examples

### Rollback Plan

- Keep legacy builds in `legacy/` directory
- Maintain both versions until new version is proven
- Document how to switch back if needed

---

## Success Metrics

### Development Metrics
- [ ] Reduce main file from 2,200 lines to <200 lines per module
- [ ] 100% TypeScript coverage
- [ ] Zero ESLint errors/warnings
- [ ] All existing features working

### User Metrics
- [ ] Same or better bundle size (gzipped)
- [ ] Same or better performance
- [ ] No regressions in existing features
- [ ] Positive feedback from early adopters

### Maintainability Metrics
- [ ] Can add new preset in <5 minutes
- [ ] Can add new resampling method in <30 minutes
- [ ] Can fix bugs without touching unrelated code
- [ ] Clear separation of concerns

---

## Next Steps

1. **Review and approve this plan**
2. **Create GitHub Project/Issues for tracking**
3. **Set up development branch**
4. **Begin Phase 1: Foundation Setup**

---

## Questions to Resolve

1. **Hosting:** Continue with GitHub Pages or explore other options?
2. **Preset Editor:** Refactor separately or integrate into main app?
3. **Feature flags:** Use environment variables or runtime config?
4. **Testing framework:** Jest? Vitest? Testing Library?
5. **CI/CD:** Set up automated builds and deployments?

---

## Timeline Estimate

**Total Duration:** 5-6 weeks (1 developer, part-time)

- Phase 1: Foundation - 3-5 days
- Phase 2: Types - 2-3 days
- Phase 3: Utilities - 5-7 days
- Phase 4: Hooks - 5-7 days
- Phase 5: Components - 7-10 days
- Phase 6: Integration - 5-7 days
- Phase 7: Optimization - 3-5 days
- Phase 8: Documentation - 2-3 days

**Note:** Timeline assumes part-time work (2-3 hours/day). Can be accelerated with full-time effort.

---

## Conclusion

This refactoring will modernize the WebP Converter codebase while preserving all existing functionality. The modular architecture will make future development faster, testing easier, and eliminate the need for dual STABLE/EXPERIMENTAL builds.

The legacy single-file builds will remain available for users who prefer the zero-setup approach, ensuring a smooth transition.

**Recommendation:** Proceed with refactoring in phases, maintaining backward compatibility throughout.
