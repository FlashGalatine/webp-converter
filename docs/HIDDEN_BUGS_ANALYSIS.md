# Hidden Bugs & Potential Issues Analysis

> **Analysis Date:** December 3, 2025  
> **Codebase Version:** 2.6.4  
> **Analyzer:** Deep-dive code review

This document contains a comprehensive analysis of hidden bugs, edge cases, and potential issues discovered during a deep-dive code review of the WebP Converter application.

---

## Table of Contents

1. [Critical Bugs](#critical-bugs)
2. [Logic Errors](#logic-errors)
3. [Race Conditions & Timing Issues](#race-conditions--timing-issues)
4. [Memory Leaks & Resource Management](#memory-leaks--resource-management)
5. [Edge Case Handling](#edge-case-handling)
6. [Type Safety Issues](#type-safety-issues)
7. [UI/UX Bugs](#uiux-bugs)
8. [Performance Issues](#performance-issues)
9. [Recommendations](#recommendations)

---

## Critical Bugs

### 1. **Canvas Context Null Assertion Without Validation** ⚠️ HIGH

**Location:** `src/utils/canvas/rendering.ts:19`

```typescript
const ctx = canvas.getContext('2d')!;
```

**Problem:** The non-null assertion (`!`) assumes `getContext('2d')` will always succeed. This can fail in headless environments, certain mobile browsers, or when GPU memory is exhausted.

**Impact:** Application will crash with `TypeError: Cannot read properties of null` if context creation fails.

**Recommendation:**
```typescript
const ctx = canvas.getContext('2d');
if (!ctx) {
  console.error('Failed to get 2D canvas context');
  return; // or throw a user-friendly error
}
```

---

### 2. **Division by Zero in Bilinear Resampling** ⚠️ HIGH

**Location:** `src/utils/imageProcessing/resampling.ts:118-119`

```typescript
const xRatio = (srcCanvas.width - 1) / dstCanvas.width;
const yRatio = (srcCanvas.height - 1) / dstCanvas.height;
```

**Problem:** If `dstCanvas.width` or `dstCanvas.height` is 0, this causes a division by zero resulting in `Infinity` values which will corrupt the output.

**Impact:** Corrupted output or infinite loops when target dimensions are 0.

**Recommendation:** Add validation at the start of resampling functions:
```typescript
if (targetWidth <= 0 || targetHeight <= 0) {
  throw new Error('Target dimensions must be positive');
}
```

---

### 3. **Unsafe parseInt Without Radix or NaN Check** ⚠️ HIGH

**Location:** `src/components/Controls/Controls.tsx:225, 241`

```typescript
const newHeight = Math.round(parseInt(newWidth) / cropAspectRatio);
const newWidth = Math.round(parseInt(newHeight) * cropAspectRatio);
```

**Problem:** If the user enters non-numeric text, `parseInt` returns `NaN`, causing `Math.round(NaN)` to produce `NaN`, which will be set as the dimension value.

**Impact:** Invalid dimension values propagate through the system, potentially causing crashes during conversion.

**Recommendation:**
```typescript
const parsed = parseInt(newWidth, 10);
if (!isNaN(parsed) && parsed > 0) {
  const newHeight = Math.round(parsed / cropAspectRatio);
  onMaxHeightChange(newHeight.toString());
}
```

---

## Logic Errors

### 4. **Incorrect Overlay Drawing Creates Artifacts** ⚠️ MEDIUM

**Location:** `src/utils/canvas/rendering.ts:44-47`

```typescript
ctx.fillRect(0, 0, canvasWidth, cropDisplayY); // Top
ctx.fillRect(0, cropDisplayY, cropDisplayX, cropDisplayHeight); // Left
ctx.fillRect(cropDisplayX + cropDisplayWidth, cropDisplayY, canvasWidth, cropDisplayHeight); // Right ← BUG
ctx.fillRect(0, cropDisplayY + cropDisplayHeight, canvasWidth, canvasHeight); // Bottom ← BUG
```

**Problem:** The right and bottom overlay rectangles use incorrect dimensions. For `fillRect(x, y, width, height)`:
- Right overlay should use `canvasWidth - cropDisplayX - cropDisplayWidth` for width, not `canvasWidth`
- Bottom overlay should use `canvasHeight - cropDisplayY - cropDisplayHeight` for height, not `canvasHeight`

**Impact:** Visual artifacts - the overlay may extend beyond the visible canvas area (not visible to users but wastes GPU cycles) or create incorrect dark regions.

**Recommendation:**
```typescript
ctx.fillRect(cropDisplayX + cropDisplayWidth, cropDisplayY, 
             canvasWidth - cropDisplayX - cropDisplayWidth, cropDisplayHeight); // Right
ctx.fillRect(0, cropDisplayY + cropDisplayHeight, 
             canvasWidth, canvasHeight - cropDisplayY - cropDisplayHeight); // Bottom
```

---

### 5. **Unused `onImageLoad` Parameter in Dependency Array** ⚠️ LOW

**Location:** `src/hooks/useImageQueue.ts:39`

```typescript
const loadImageFromQueue = useCallback((index: number, onLoad: (file: File) => Promise<void>) => {
    // ...
}, [imageQueue, onImageLoad]); // ← onImageLoad is in deps but not used; onLoad param shadows it
```

**Problem:** The `loadImageFromQueue` function takes an `onLoad` parameter but the dependency array includes `onImageLoad` (the hook parameter). The function uses `onLoad` but depends on `onImageLoad`, which may cause stale closure issues or unnecessary re-renders.

**Impact:** Potential stale closure bugs where the wrong callback is used.

**Recommendation:** Remove `onImageLoad` from the dependency array since `onLoad` parameter is used directly.

---

### 6. **Preset Settings Not Reset When Switching to Built-in** ⚠️ MEDIUM

**Location:** `src/hooks/usePresets.ts:69-74`

```typescript
const switchToBuiltIn = useCallback(() => {
  setUseCustomPresets(false);
  setCustomPresets({});
  setCustomPresetsRaw({});
  setCustomPresetsFileName('');
}, []);
```

**Problem:** When switching from custom presets to built-in presets, the currently selected preset (stored in parent component) may not exist in built-in presets, causing undefined behavior.

**Impact:** If user is on a custom preset like "My Custom" and switches to built-in, the `selectedPreset` state still holds "My Custom" but it doesn't exist in `BUILT_IN_PRESETS`.

**Recommendation:** The `switchToBuiltIn` callback should return a signal or the parent should reset `selectedPreset` to a default built-in preset.

---

## Race Conditions & Timing Issues

### 7. **Potential Race Condition in Image Queue Auto-Load** ⚠️ MEDIUM

**Location:** `src/hooks/useImageQueue.ts:33-38`

```typescript
if (wasEmpty && newQueueItems.length > 0) {
  setTimeout(() => {
    setCurrentImageIndex(0);
    onImageLoad(newQueueItems[0].file);
  }, 0);
}
```

**Problem:** The `setTimeout(..., 0)` delays the callback but doesn't account for the case where:
1. User adds images
2. `setTimeout` is queued
3. User immediately adds more images (triggers another `setTimeout`)
4. Both callbacks execute, potentially loading images in wrong order or causing double-loads

**Impact:** Occasional image loading issues when rapidly adding files.

**Recommendation:** Use a ref to track pending loads or implement a proper loading queue with mutex.

---

### 8. **Drag State Block Timer May Fire After Unmount** ⚠️ LOW

**Location:** `src/components/Converter/WebPConverter.tsx:74-79`

```typescript
if (wasDragging && !canvas.isDragging) {
  blockPresetResetRef.current = true;
  setTimeout(() => {
    blockPresetResetRef.current = false;
  }, 100);
}
```

**Problem:** The `setTimeout` callback can fire after component unmount, though it only modifies a ref (which is technically safe but is poor practice).

**Impact:** No immediate crash, but indicates potential for more serious unmount issues.

**Recommendation:** Clean up timeout on unmount:
```typescript
useEffect(() => {
  let timeoutId: NodeJS.Timeout;
  if (wasDragging && !canvas.isDragging) {
    blockPresetResetRef.current = true;
    timeoutId = setTimeout(() => {
      blockPresetResetRef.current = false;
    }, 100);
  }
  return () => clearTimeout(timeoutId);
}, [canvas.isDragging]);
```

---

## Memory Leaks & Resource Management

### 9. **Canvas Elements Not Cleaned Up in Resampling** ⚠️ MEDIUM

**Location:** `src/utils/imageProcessing/resampling.ts` and `conversion.ts`

**Problem:** Multiple temporary canvas elements are created during image processing:
```typescript
const cropCanvas = document.createElement('canvas');
const blurredCanvas = document.createElement('canvas');
const targetCanvas = document.createElement('canvas');
```

While JavaScript's garbage collector will eventually clean these up, they remain in memory until the next GC cycle, which can cause memory pressure when processing many images quickly.

**Impact:** Memory spikes when batch processing images, potential performance degradation.

**Recommendation:** While not strictly a memory leak, consider implementing an object pool for canvas elements during batch operations.

---

### 10. **URL.createObjectURL Not Revoked on Error Path** ⚠️ LOW

**Location:** `src/utils/files/downloads.ts:9-11`

```typescript
const url = URL.createObjectURL(blob);
// ...
setTimeout(() => URL.revokeObjectURL(url), 100);
```

**Problem:** If an error occurs between `createObjectURL` and the `setTimeout` scheduling (e.g., if `a.click()` throws), the URL is never revoked.

**Impact:** Minor memory leak of blob URLs.

**Recommendation:** Use try-finally:
```typescript
const url = URL.createObjectURL(blob);
try {
  // ... download logic
} finally {
  setTimeout(() => URL.revokeObjectURL(url), 100);
}
```

---

## Edge Case Handling

### 11. **Zero Crop Dimensions Cause Rendering Issues** ⚠️ MEDIUM

**Location:** `src/utils/canvas/interactions.ts:53`

```typescript
if (!image || cropWidth <= 0 || cropHeight <= 0) return null;
```

**Problem:** While `detectHandle` handles zero dimensions, other parts of the code (like rendering) may still attempt to draw zero-size crops.

**Impact:** Potential divide-by-zero or degenerate rectangles in some calculations.

---

### 12. **Aspect Ratio of Zero or Negative Not Validated** ⚠️ MEDIUM

**Location:** `src/hooks/useCanvas.ts:78-96`

```typescript
const initializeCrop = useCallback((imgWidth: number, imgHeight: number, ratio: number | null) => {
  if (!ratio) {
    // ... full image crop
  } else {
    const imgRatio = imgWidth / imgHeight;
    let w: number, h: number;
    if (ratio > imgRatio) {
      // ...
```

**Problem:** If `ratio` is 0 or negative (which `parseAspectRatio` should prevent but might not in all edge cases), division by zero or negative dimensions could occur.

**Impact:** Corrupted crop dimensions.

**Recommendation:** Add validation:
```typescript
if (!ratio || ratio <= 0) {
  // treat as null (full image)
}
```

---

### 13. **Empty Image Queue State After Clear Not Handled in Navigation** ⚠️ LOW

**Location:** `src/components/Queue/QueuePanel.tsx:69-82`

The Previous/Next buttons only check if `currentImageIndex` is at bounds, but if the queue is cleared while on a non-existent index, clicking could cause issues.

---

### 14. **FileReader Error Handling Incomplete** ⚠️ LOW

**Location:** `src/utils/files/loaders.ts:6-21`

```typescript
reader.onload = (e) => {
  const img = new Image();
  img.onload = () => {
    resolve({ image: img, imageData: e.target?.result as string });
  };
  img.onerror = () => {
    reject(new Error('Failed to decode image file...'));
  };
  img.src = e.target?.result as string;
};
reader.onerror = () => {
  reject(new Error('Failed to read file'));
};
```

**Problem:** No handling for `reader.onabort` or for the case where `e.target?.result` is null/undefined.

**Impact:** Silent failure or undefined behavior if file reading is aborted.

---

## Type Safety Issues

### 15. **Type Assertion for ResamplingMethod May Fail** ⚠️ LOW

**Location:** `src/components/Controls/Controls.tsx:256`

```typescript
onChange={(e) => onResamplingMethodChange(e.target.value as ResamplingMethod)}
```

**Problem:** If a new option is added to the select but the type isn't updated, or if the DOM is manipulated, an invalid value could be passed.

**Impact:** Potential runtime error in resampling code.

---

### 16. **useImageProcessing Test Uses Non-Existent Resampling Method** ⚠️ INFO

**Location:** `src/hooks/useImageProcessing.test.ts:315`

```typescript
resamplingMethod: 'nearestNeighbor', // Should be 'nearest'
```

**Problem:** The test uses `'nearestNeighbor'` but the actual type is `'nearest'`. This test might pass due to fallback behavior but tests wrong functionality.

---

## UI/UX Bugs

### 17. **Preset Editor Allows Empty Preset Export** ⚠️ LOW

**Location:** `src/components/PresetEditor/PresetEditor.tsx:181-184`

```typescript
if (Object.keys(config).length > 0) {
  exportData[preset.name] = config;
}
```

**Problem:** Presets with only a name (no other fields) are silently excluded from export, but there's no warning to the user.

**Impact:** User confusion when exported file has fewer presets than expected.

---

### 18. **Linked Dimensions Don't Update on Crop Change** ⚠️ MEDIUM

**Location:** `src/components/Controls/Controls.tsx`

**Problem:** When `linkDimensions` is enabled and the user resizes the crop area (changing the aspect ratio in freestyle mode), the max width/height values don't automatically update to maintain the new ratio.

**Impact:** Confusing UX where linked dimensions show values based on old aspect ratio.

---

### 19. **No Debounce on Dimension Input Updates** ⚠️ LOW

**Location:** `src/components/Controls/Controls.tsx:215-243`

**Problem:** Every keystroke in the max width/height fields triggers recalculation and state updates, which can cause performance issues and janky UI.

**Impact:** Laggy input experience, especially on slower devices.

---

## Performance Issues

### 20. **Lanczos Resampling Has O(n²·k²) Complexity** ⚠️ INFO

**Location:** `src/utils/imageProcessing/resampling.ts:240-263`

The Lanczos implementation uses a 2D convolution kernel which has significant complexity for large images. For a 4000x3000 image downsampled with LANCZOS_WINDOW_SIZE=3, this involves:
- 12 million pixels × 25 kernel samples = 300 million operations

**Impact:** UI freeze for several seconds on large images.

**Recommendation:** Consider Web Workers for heavy resampling or add a progress callback.

---

### 21. **Unnecessary Re-renders in Queue Panel** ⚠️ LOW

**Location:** `src/components/Queue/QueuePanel.tsx`

**Problem:** The component receives `processedImages: Set<number>` as a prop. Since a new Set is created on each update, this causes unnecessary re-renders even when the content hasn't changed.

**Recommendation:** Consider using a stable reference or memoization.

---

## Recommendations

### Priority 1 (Critical - Fix Immediately)
1. Add null check for canvas context (#1)
2. Add validation for zero/negative dimensions in resampling (#2)
3. Add NaN validation for parseInt operations (#3)

### Priority 2 (High - Fix Soon)
4. Fix overlay drawing dimensions (#4)
5. Handle preset switching edge case (#6)
6. Add race condition protection for image queue (#7)

### Priority 3 (Medium - Plan for Next Sprint)
7. Implement canvas object pooling for batch processing (#9)
8. Add comprehensive error handling for file operations (#14)
9. Add debounce to dimension inputs (#19)

### Priority 4 (Low - Technical Debt)
10. Clean up timeout on unmount (#8)
11. Fix URL revocation on error path (#10)
12. Update test with correct resampling method name (#16)

---

## Appendix: Files Analyzed

- `src/App.tsx`
- `src/hooks/useCanvas.ts`
- `src/hooks/useImageProcessing.ts`
- `src/hooks/useImageQueue.ts`
- `src/hooks/usePresets.ts`
- `src/utils/canvas/interactions.ts`
- `src/utils/canvas/rendering.ts`
- `src/utils/files/downloads.ts`
- `src/utils/files/loaders.ts`
- `src/utils/imageProcessing/conversion.ts`
- `src/utils/imageProcessing/resampling.ts`
- `src/utils/presets/parser.ts`
- `src/utils/presets/validation.ts`
- `src/components/Converter/WebPConverter.tsx`
- `src/components/Canvas/Canvas.tsx`
- `src/components/Controls/Controls.tsx`
- `src/components/Queue/QueuePanel.tsx`
- `src/components/Toolbar/Toolbar.tsx`
- `src/components/PresetEditor/PresetEditor.tsx`
- `src/constants/*.ts`
- `src/types/*.ts`
- All test files in `src/hooks/*.test.ts`
