# Legacy Single-File Builds

This directory contains the original single-file HTML builds of WebP Converter (v2.6.1).

## Files

- **index.html** - STABLE v2.6.1 (Production build)
- **webp-conv-experimental.html** - EXPERIMENTAL build (Testing)

## Why These Are Here

These files represent the original monolithic architecture before the Vite + TypeScript refactoring. They are preserved for:

1. **Reference** - Understanding the original implementation
2. **Fallback** - Users can still use the simple single-file version
3. **Comparison** - Validate feature parity during refactoring
4. **Historical record** - Document the evolution of the project

## Usage

These files still work perfectly! Just open them directly in a browser:

```bash
# Open STABLE build
open legacy/index.html
# or
firefox legacy/index.html
```

**No server or build process required.**

## Features (v2.6.1)

All features from v2.6.1 are included:
- ✅ Image conversion to WebP
- ✅ Advanced cropping with 16+ presets
- ✅ Batch processing with queue
- ✅ 5 resampling methods (Lanczos, Bicubic, etc.)
- ✅ Adaptive anti-aliasing
- ✅ Web optimization (target file size)
- ✅ Custom preset support
- ✅ Clipboard paste
- ✅ Freestyle mode
- ✅ And more...

See CHANGELOG.md for complete feature list.

## Migration Status

The new Vite + TypeScript version is under active development. Once it reaches feature parity and is thoroughly tested, it will become the primary version.

**Current Status:** Legacy builds remain the production version until migration is complete.

## Advantages of Legacy Builds

- No build process needed
- No Node.js or npm required
- Works offline immediately
- Single file = easy to host anywhere
- Zero dependencies (all via CDN)

## Advantages of New Build

- Type safety with TypeScript
- Better code organization
- Easier to maintain and extend
- Modern development tools
- Unit testing capabilities
- Better developer experience

Both approaches have their merits. Choose based on your needs!

---

**Last Updated:** 2025-11-17
**Original Version:** v2.6.1
