# Components

React components for the WebP Converter UI.

## Structure

- **Canvas/** - Canvas rendering and interaction components
- **Controls/** - UI control components (buttons, inputs, sliders)
- **Queue/** - Image queue management components
- **Presets/** - Preset selection and management components

## Naming Convention

- Use PascalCase for component files: `ImageCanvas.tsx`, `QualitySettings.tsx`
- One component per file
- Export as default from component files
- Index files for barrel exports (optional)

## Component Guidelines

- Keep components focused and single-responsibility
- Use TypeScript for all components
- Document props with JSDoc comments
- Use React.memo for expensive components
- Extract reusable logic into custom hooks
