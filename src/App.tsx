/**
 * Main application component
 */

import './index.css';
import { Canvas, Toolbar, Presets, Controls, Queue, Button } from './components';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            WebP Converter
          </h1>
          <p className="text-lg text-gray-600">
            Vite + TypeScript + React Refactoring (v3.0.0-alpha)
          </p>
        </header>

        {/* Progress Status */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Phase 5: Components Created! ✅</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="p-3 bg-green-50 rounded border border-green-200">
              <div className="font-semibold text-green-900">Phase 1</div>
              <div className="text-green-700">Foundation Setup</div>
            </div>
            <div className="p-3 bg-green-50 rounded border border-green-200">
              <div className="font-semibold text-green-900">Phase 2</div>
              <div className="text-green-700">Type Definitions (50+ types)</div>
            </div>
            <div className="p-3 bg-green-50 rounded border border-green-200">
              <div className="font-semibold text-green-900">Phase 3</div>
              <div className="text-green-700">Utilities (2,500+ lines)</div>
            </div>
            <div className="p-3 bg-green-50 rounded border border-green-200">
              <div className="font-semibold text-green-900">Phase 4</div>
              <div className="text-green-700">Hooks (8 custom hooks)</div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-amber-50 rounded border border-amber-200">
            <h3 className="font-semibold text-amber-900 mb-2">Current Phase: Phase 5 - React Components</h3>
            <ul className="list-disc list-inside space-y-1 text-amber-800 text-sm">
              <li>✅ Canvas component (image display & cropping)</li>
              <li>✅ Toolbar component (zoom controls)</li>
              <li>✅ Presets component (aspect ratio selection)</li>
              <li>✅ Controls component (quality, dimensions, conversion)</li>
              <li>✅ Queue component (batch processing)</li>
              <li>✅ UI primitives (Button, Input, Select)</li>
            </ul>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            <strong>Next Phase:</strong> Phase 6 - Integration & Testing (wire up components with hooks and event handlers)
          </div>
        </div>

        {/* Component Showcase */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-6">Component Architecture Preview</h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Canvas & Toolbar */}
            <div className="lg:col-span-2 space-y-4">
              <Toolbar
                zoomLevel={1}
                onZoomIn={() => {}}
                onZoomOut={() => {}}
                onZoomToFit={() => {}}
                onZoomReset={() => {}}
                hasImage={false}
              />

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Canvas
                  width={800}
                  height={600}
                  image={null}
                  zoomLevel={1}
                  panX={0}
                  panY={0}
                  cropX={0}
                  cropY={0}
                  cropWidth={0}
                  cropHeight={0}
                  cursorStyle="default"
                  isDragging={false}
                />
                <p className="mt-4 text-gray-500">
                  Canvas component ready (load image to see it in action)
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="primary" fullWidth disabled>
                  📁 Load Image
                </Button>
                <Button variant="secondary" fullWidth disabled>
                  📋 Paste Image
                </Button>
              </div>
            </div>

            {/* Right Column - Controls */}
            <div className="space-y-6">
              <Presets
                presetNames={['16:9 Landscape', '9:16 Portrait', 'Square (1:1)']}
                selectedPreset="16:9 Landscape"
                useCustomPresets={false}
                customPresetsFileName=""
                isFreestyleMode={false}
                onPresetChange={() => {}}
                onCustomPresetFileSelect={() => {}}
                onClearCustomPresets={() => {}}
                onToggleFreestyle={() => {}}
              />

              <Controls
                quality={95}
                lossless={false}
                maxWidth=""
                maxHeight=""
                webOptimize={false}
                targetSize="10"
                resamplingMethod="bicubic"
                isOptimizing={false}
                optimizingProgress={0}
                optimizingStatus=""
                hasImage={false}
                onQualityChange={() => {}}
                onLosslessToggle={() => {}}
                onMaxWidthChange={() => {}}
                onMaxHeightChange={() => {}}
                onWebOptimizeToggle={() => {}}
                onTargetSizeChange={() => {}}
                onResamplingMethodChange={() => {}}
                onConvert={() => {}}
              />

              <Queue
                queue={[]}
                currentIndex={-1}
                processedImages={new Set()}
                removeAfterConvert={false}
                canGoNext={false}
                canGoPrevious={false}
                onNavigateToIndex={() => {}}
                onNext={() => {}}
                onPrevious={() => {}}
                onRemove={() => {}}
                onClear={() => {}}
                onToggleRemoveAfterConvert={() => {}}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-6 text-center text-sm text-gray-500">
          <p>
            Legacy builds available in <code className="bg-gray-100 px-2 py-1 rounded">legacy/</code> directory
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
