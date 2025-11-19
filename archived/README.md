# Archived HTML Files

This directory contains the original monolithic HTML files that were refactored into a Vite + TypeScript + React project.

## Files

- `index.html` - Original STABLE build (v2.6.1)
- `webp-conv-experimental.html` - Original EXPERIMENTAL build (v2.6.1)
- `preset-editor.html` - Original Preset Editor (v1.0.0)

## Migration

These files have been replaced by:
- `src/components/Converter/WebPConverter.tsx` - Main converter component
- `src/components/PresetEditor/PresetEditor.tsx` - Preset editor component

The new implementation maintains 100% feature parity with the original HTML files while providing:
- TypeScript type safety
- Modular component architecture
- Modern build tooling (Vite)
- Better code organization and maintainability

