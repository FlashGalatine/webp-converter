# WebP Converter FAQ

## General Questions

### What is WebP Converter?
WebP Converter is a free, client-side web application that converts images to WebP format. It provides advanced features like batch processing, custom presets, professional resampling methods, and intelligent optimization for web use—all without requiring any server uploads or account creation.

### Is WebP Converter free?
Yes, completely free! WebP Converter is open-source software licensed under the MIT License. There are no hidden fees, no premium features, and no ads.

### Do I need an account or to create an account?
No account is required. The app works entirely in your browser without any registration or login.

### Is WebP Converter safe?
Yes. All image processing happens **100% in your browser** on your computer. No images are uploaded to any server, and no data about you is collected. Your images never leave your device.

### Can I use WebP Converter offline?
Yes! Once you've opened the app in your browser, you can continue using it offline. The app doesn't require an internet connection for conversion—only the initial load needs internet to fetch the CDN libraries.

---

## Technical & Compatibility

### What browsers are supported?
WebP Converter works in all modern browsers that support:
- Canvas API for image manipulation
- WebP format for export
- Modern JavaScript (ES6+)

**Recommended:**
- Chrome/Chromium (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

WebP Converter does NOT work in Internet Explorer.

### Does WebP Converter work on mobile/tablets?
WebP Converter is designed primarily for desktop browsers with larger screens for the canvas drawing interface. While some mobile browsers may open it, the interface is not optimized for small screens or touch interactions. Desktop use is strongly recommended.

### What image formats can I load?
You can load these image formats:
- **JPEG/JPG**
- **PNG**
- **WebP**
- **GIF**
- **BMP**
- Any format your browser's Canvas API can render

All images are converted to WebP format on export.

### Are there any size limitations?
There are practical limits:
- **Memory**: Very large images (8K+) may exceed available browser memory
- **Canvas Size**: Some browsers limit canvas dimensions to 16K×16K pixels
- **Performance**: Extremely large images may be slow to process

For batch processing, there's no limit on the number of images you can queue.

### What are the system requirements?
- **Operating System**: Windows, macOS, Linux, or any OS with a modern web browser
- **Browser**: Chrome, Firefox, Safari, Edge (latest versions)
- **Screen**: Desktop or laptop (mobile is not recommended)
- **Internet**: Only needed to load the app initially

---

## Features & Core Functionality

### What is a preset?
A preset is a saved aspect ratio that constrains your crop to specific dimensions. Presets make it easy to crop images for specific platforms:
- **Square** (1:1) for avatars and profile pictures
- **16:9** for YouTube thumbnails and widescreen content
- **9:16** for mobile stories and portrait videos
- **Instagram**, **Twitter**, **Discord**, **Pinterest**, etc.

You can use built-in presets or create custom ones.

### How do I use presets?
1. Load an image into the converter
2. Select a preset from the "Crop Preset" dropdown
3. Adjust the crop area on the canvas (it will lock to the aspect ratio)
4. The crop area automatically positions itself based on your image
5. Convert and download

### What's the difference between lossless and lossy WebP?
- **Lossy**: Reduces file size by removing some image data. Looks great for most photos and achieves high compression. Quality setting (0-100) controls the trade-off between size and quality.
- **Lossless**: Preserves all image data. Creates larger files but perfect for graphics, text, and images where perfect reproduction is needed. Quality setting is ignored for lossless.

**Recommendation:**
- Use **Lossy** for photographs and screenshots (smaller files, imperceptible quality loss)
- Use **Lossless** for graphics, logos, text, and designs that need pixel-perfect reproduction

### What quality should I use?
- **90-100**: Excellent quality, larger files (good for high-quality exports)
- **75-89**: Very good quality, moderate file size (good balance for most uses)
- **60-74**: Good quality, smaller files (acceptable for web use)
- **40-59**: Fair quality, very small files (use only if file size is critical)
- **Below 40**: Poor quality, tiny files (not recommended)

**Recommendation:** Start at 80-85 and adjust based on your results.

### What are resampling methods?
Resampling methods determine how pixels are interpolated when resizing images. Different methods provide different quality/speed trade-offs:

- **Lanczos**: Highest quality for downscaling but slower. Best for photographs.
- **Bicubic**: Excellent quality/speed balance. Recommended for most uses.
- **Bilinear**: Faster processing with acceptable quality.
- **Nearest Neighbor**: Fastest method. Best for pixel art and graphics with sharp edges.
- **Browser Default**: Native browser resampling.

**Recommendation:** Use **Bicubic** for general photos, **Lanczos** for highest quality downscaling, and **Nearest Neighbor** for pixel art.

### What is anti-aliasing?
Anti-aliasing is an automatic quality enhancement that prevents artifacts (ringing, halos, oversharpening) when downsampling images. It applies a Gaussian blur before resampling to smooth transitions and produce natural-looking results.

**When it applies:**
- Automatically enabled when downsampling by more than 33% (reducing to less than 67% of original size)
- Works with Bicubic, Lanczos, and Bilinear resampling methods
- Does NOT apply with Nearest Neighbor or Browser Default methods
- Does NOT apply when upsampling

**You'll see:** "Applying anti-aliasing..." status message during processing

### What is the Clipboard Paste feature?
Press **Ctrl+V** (Windows/Linux) or **Cmd+V** (Mac) to paste images directly from your clipboard. Perfect for quick screenshot conversion workflows.

**Features:**
- Supports any image format your clipboard has (PNG, JPEG, WebP, etc.)
- Automatically generates timestamped filenames for pasted images
- Auto-adds to queue if multiple images are already loaded
- Works with screenshot tools and image editors

### What is Freestyle Mode?
Freestyle Mode disables aspect ratio constraints, allowing you to crop images to any dimensions you want while keeping your preset selected. Perfect for custom crops that don't fit standard presets.

**How to use:**
1. Select any preset (Square, 16:9, etc.)
2. Enable the "Freestyle Mode" checkbox below the preset selector
3. Now crop freely without aspect ratio constraints
4. Max-width/max-height constraints still apply during export

**Benefits:**
- Keep your preset settings while allowing custom crops
- Toggle on/off without changing your preset selection
- Useful for images that don't fit standard aspect ratios

### What is the Fixed Ratio feature?
The Fixed Ratio feature (link icon 🔗) automatically maintains your crop's aspect ratio when setting max width or max height. This prevents distortion when resizing.

**How to use:**
1. Set a value for **Max Width**
2. Max Height automatically calculates based on your crop's aspect ratio
3. Or enter Max Height first, and Max Width auto-calculates
4. Toggle the 🔗 button to switch between linked and unlinked modes

**Linked Mode (Default):**
- Maintains aspect ratio automatically
- Blue ring border indicates linked status
- Quick workflow for aspect-ratio-aware resizing

**Unlinked Mode:**
- Set width and height independently
- Useful for specific dimensions that don't match your crop ratio
- Shows ⛓️‍💥 icon

**Smart Behavior:**
- Automatically disables in Freestyle Mode
- Re-enables when you switch back to a preset
- Uses your current crop's aspect ratio (not the preset's)

---

## Presets & Customization

### How do I load custom presets?
1. Click the **"Load Custom Presets"** button in the "Preset Source" section
2. Select your JSON preset file
3. Custom presets will appear in the "Crop Preset" dropdown
4. An info panel shows preset-specific settings

### How do I create custom presets?
Create a JSON file with this format:

```json
{
  "Preset Name": {
    "crop-ratio": 1.5,
    "max-width": 1920,
    "max-height": 1080,
    "max-filesize": 2,
    "max-filesize-unit": "MB",
    "default-selection": "Landscape"
  }
}
```

**Available properties:**
- `crop-ratio`: Aspect ratio (width/height). Use `null` for freestyle
- `max-width`: Maximum width in pixels (optional)
- `max-height`: Maximum height in pixels (optional)
- `max-filesize`: Target file size value (optional)
- `max-filesize-unit`: "KB", "MB", or "GB" (default: "MB")
- `default-selection`: Auto-select based on image orientation: "Square", "Landscape", or "Portrait"

### Can I use built-in and custom presets together?
You can switch between them using the buttons in the "Preset Source" section:
- **Use Built-in**: Switch back to built-in presets
- **Load Different**: Load a different custom preset file

### Where should I put my presets.json file?
Place `presets.json` in the same folder as the converter HTML file. The app will automatically detect and load it.

---

## Optimization & Output Quality

### What does "Optimize for Web" do?
Web optimization automatically finds the best quality setting to meet a target file size. Instead of manually testing different quality levels, you set a target size (e.g., 100KB) and the app finds the optimal quality.

**How it works:**
1. Enable "Optimize for Web"
2. Set your target file size and unit (KB, MB, GB)
3. Click "Convert & Download"
4. The app iterates quality from 100 down to 1 until it meets your target

**Example:** Target 200KB for a 4K image:
- The app automatically finds quality 60-70 produces a file ≤200KB
- You get the best quality at or below your target size

### Why is my converted file still large?
Several factors affect file size:
1. **Image content**: Detailed, complex images are harder to compress
2. **Resolution**: Larger images naturally have larger files
3. **Quality setting**: Higher quality = larger files
4. **Image type**: Photographs compress better than graphics with text
5. **WebP support**: Some old content compresses better with PNG/JPEG

**Tips to reduce size:**
- Lower the quality setting (start at 75-80)
- Enable "Optimize for Web" with a smaller target
- Reduce dimensions using Max Width/Max Height
- Use Lanczos or Bicubic resampling (better than Browser Default)
- Lossy compression (lossy WebP vs lossless)

### What quality setting should I use for different purposes?
- **Web images/photos**: 75-85 (good balance of quality and size)
- **Social media**: 75-80 (smaller for faster uploads)
- **High-quality exports**: 90-95 (larger files, imperceptible quality loss)
- **Tiny thumbnails**: 60-70 (okay for small previews)
- **Maximum compatibility**: Lossless (larger but perfect reproduction)

### Why does conversion take so long?
Processing time depends on:
1. **Image size**: Larger images take longer
2. **Resampling method**: Lanczos is slower than Bilinear
3. **Web optimization**: Iterating through quality levels adds time
4. **Device performance**: Older devices are slower
5. **Browser**: Some browsers are faster than others

**Normal times:**
- Small images (< 1MB): < 1 second
- Medium images (1-5MB): 1-3 seconds
- Large images (5-10MB): 3-10 seconds
- Very large images (10MB+): 10+ seconds

---

## Batch Processing & Queue

### How do I batch process multiple images?
Three methods:

**Method 1: File Selection**
1. Click "Select Image(s)"
2. Hold Ctrl/Cmd and click multiple files
3. Click "Open"

**Method 2: Drag & Drop**
1. Select multiple files from your file explorer
2. Drag them onto the canvas
3. All files are added to the queue

**Method 3: Paste from Clipboard**
1. Copy an image (Ctrl+C or Cmd+C)
2. Press Ctrl+V or Cmd+V in the converter
3. Image is added to queue or loaded directly

### How does the queue system work?
The queue displays all loaded images:
- **▶ (Amber)**: Currently active image
- **✓ (Green)**: Already converted
- **Empty**: Not yet processed

**Queue controls:**
- **Previous/Next**: Navigate between images
- **Click an image**: Jump to that image
- **Remove (✕)**: Remove individual image
- **Clear All**: Clear entire queue

### Can I remove images from the queue?
Yes, two ways:
1. **Individual**: Click the ✕ button next to an image
2. **Bulk**: Enable "Remove After Convert" to auto-remove after processing

### What is "Remove After Convert"?
When enabled, images are automatically removed from the queue after conversion and download. Useful for processing large batches where you don't need to keep queued images.

**Workflow:**
1. Load multiple images
2. Enable "Remove After Convert"
3. Convert & Download an image
4. Image is automatically removed from queue
5. Next image auto-loads
6. Repeat for all images

### What is "Auto Zoom to Fit"?
When enabled, images automatically zoom to fit the canvas when loaded. Disabling it preserves your previous zoom/pan settings.

---

## Troubleshooting

### Why won't my image load?
**Check these:**
1. **File format**: Is it a supported image format? (JPEG, PNG, WebP, GIF, BMP)
2. **File size**: Is it under your browser's memory limit? (Try a smaller image)
3. **Browser**: Try a different browser or clear cache
4. **Corruption**: The image file might be corrupted. Try another image.

**In the browser console (F12 → Console), you may see error messages that help diagnose the issue.**

### I pressed Ctrl+V but nothing happened
**Try these:**
1. **Copy first**: Make sure you've copied an image to clipboard (Ctrl+C or Cmd+C)
2. **Click on canvas**: Click the canvas area first, then paste
3. **Browser support**: Clipboard paste may not work in all browsers (test in Chrome/Firefox)
4. **Permissions**: Your browser may have blocked clipboard access. Check permissions settings.

### The aspect ratio won't change
**This might be:**
1. **Freestyle Mode disabled**: Enable "Freestyle Mode" to crop freely
2. **Fixed Ratio enabled**: Click the 🔗 icon to switch between linked/unlinked modes
3. **Preset locked**: Select "Freestyle" preset for free aspect ratio
4. **Max Width/Height constraints**: Adjust or disable constraints

### Why can't I drag the crop box?
**Try these:**
1. **Click inside the crop area**: Drag inside the white crop rectangle to move it
2. **Check cursor**: The cursor should be a hand/move icon inside the crop area
3. **Zoom level**: Try zooming in if the image is too small to interact with
4. **Drag handles**: If you're on the edge (handles), you'll resize instead of move

**In Freestyle Mode:**
1. Make sure "Freestyle Mode" is enabled
2. The image drag should work anywhere inside the crop rectangle

### My converted image looks blurry
**Possible causes:**
1. **Downsampling too much**: Anti-aliasing adds blur when downsampling (intended to prevent artifacts)
2. **Bilinear resampling**: This method is faster but softer. Try Lanczos or Bicubic
3. **Low quality setting**: Increasing quality may help
4. **Upsampling**: Enlarging images always looks blurry. Avoid if possible.

**Solutions:**
- Use Lanczos or Bicubic resampling
- Try quality 85-90 instead of lower values
- Avoid upsampling (enlarging)

### My image looks oversharpened or has artifacts
**Possible causes:**
1. **No anti-aliasing**: Try Bicubic or Lanczos for significant downsampling
2. **Nearest Neighbor**: This method doesn't apply anti-aliasing (by design)
3. **Browser Default**: Native resampling may not be optimal

**Solutions:**
- Switch to Bicubic or Lanczos (includes anti-aliasing)
- The "Applying anti-aliasing..." message means it's working correctly
- Anti-aliasing prevents these artifacts—you should see better quality

### Why are custom presets not loading?
**Check these:**
1. **JSON syntax**: Is your JSON file valid? Use a JSON validator
2. **File location**: Place `presets.json` in the same folder as the HTML file
3. **Button click**: Click "Load Custom Presets" explicitly to select the file
4. **File format**: Make sure it's a .json file, not .txt

**Example valid JSON:**
```json
{
  "Instagram Square": {
    "crop-ratio": 1
  }
}
```

---

## File & Output

### Where are my converted files saved?
Files are saved to your **Downloads folder** (or your browser's default download location). File locations depend on your operating system and browser settings.

### How are filenames generated?
Filenames follow this pattern:
```
image-YYYY-MM-DD-WIDTHxHEIGHTpx-qQUALITY.webp
```

**Example:** `image-2025-11-02-1920x1080px-q85.webp`

**For lossless:** `image-2025-11-02-1920x1080px-qLL.webp` (LL = Lossless)

**For pasted images:** `pasted-image-TIMESTAMP.png`

### Can I edit the converted image after download?
The WebP file is the final output. To make further edits:
1. Load it back into the converter
2. Use an image editor (GIMP, Photoshop, Paint.NET, etc.)
3. Re-export as WebP

### What's the difference between lossless and lossy filenames?
- **Lossy**: `q85` (quality number 0-100)
- **Lossless**: `qLL` (no quality number, all data preserved)

---

## Data & Privacy

### Where is my image data processed?
**100% in your browser on your computer.** All image manipulation happens client-side using your device's Canvas API. No data is sent to servers.

### Is my image uploaded to a server?
**No.** WebP Converter does not upload images anywhere. Your images never leave your device.

### Does the app collect data about me?
**No.** The app does not:
- Collect personal information
- Track usage statistics
- Send telemetry data
- Use cookies or local storage (beyond what's necessary)
- Know who you are

### Are my images stored after conversion?
**No.** Images are only in memory during conversion and are immediately forgotten after you download the result. Nothing is saved on servers or your device (except the downloaded file in your Downloads folder).

---

## Builds & Versions

### What's the difference between STABLE and EXPERIMENTAL?
- **STABLE** (`index.html`): Production-ready, fully tested, recommended for important work
- **EXPERIMENTAL** (`webp-conv-experimental.html`): Testing new features, may have issues

**Use STABLE unless you want to test unreleased features.**

### Which version should I use?
- **Default**: Use STABLE (`index.html`)
- **New features**: Try EXPERIMENTAL to test upcoming features early
- **Important work**: Always use STABLE

### How often are updates released?
Updates are released when new features are ready and tested. There's no fixed schedule, but the app has been actively maintained with regular improvements.

### How do I check the current version?
Look at the title or README—it shows the version number (e.g., "v2.5.0").

---

## Developer & Advanced Questions

### Can I use this on my website?
Yes! The app is open-source and licensed under MIT:
1. Download the HTML file
2. Host it on your web server
3. Users can open it directly in their browser
4. Customize it as needed (within MIT license terms)

### Is the source code available?
Yes! The source code is available on [GitHub](https://github.com/FlashGalatine/webp-converter). You can:
- Review the code
- Modify it for your needs
- Host your own version
- Contribute improvements

### Can I modify it for my needs?
Yes, under the MIT License:
- Modify the code freely
- Host your own version
- Use in commercial projects
- Create derivative works

**Requirements:**
- Include the MIT License with your modifications
- Provide attribution to the original author
- Be transparent about changes

### What's the license?
WebP Converter is licensed under the **MIT License**—one of the most permissive open-source licenses. You can use, modify, and distribute it freely as long as you include the license and credit the original author.

### How can I contribute or report bugs?
Visit the [GitHub repository](https://github.com/FlashGalatine) to:
- Report bugs
- Suggest features
- Submit pull requests
- Discuss improvements

---

## Performance & Optimization

### Why is conversion slow on my computer?
**Possible reasons:**
1. **Old device**: Older computers are slower
2. **Large image**: Downsampling 4K images takes longer
3. **Low disk space**: Can slow down file operations
4. **Background apps**: Other programs using CPU/memory
5. **Browser performance**: Some browsers are faster than others

**Solutions:**
- Try a smaller image first
- Close other applications
- Use Bilinear instead of Lanczos (faster)
- Try a different browser
- Enable "Remove After Convert" for batch processing

### How can I speed up batch processing?
**Tips:**
1. Use Bilinear or Bicubic resampling (faster than Lanczos)
2. Set lower quality to skip web optimization iterations
3. Enable "Remove After Convert" to maintain fast workflow
4. Process smaller images
5. Close other applications

### Does the app use GPU acceleration?
The Canvas API may use GPU acceleration depending on your browser and system. WebP Converter doesn't explicitly request GPU use, but modern browsers may automatically offload Canvas operations to the GPU for better performance.

---

## Getting Help

### Where can I get support?
- **GitHub Issues**: Report bugs or request features on [GitHub](https://github.com/FlashGalatine/webp-converter/issues)
- **Discord**: Join the community at [discord.gg/5VUSKTZCe5](https://discord.gg/5VUSKTZCe5)
- **Twitter/X**: Message [@AsheJunius](https://x.com/AsheJunius)
- **Patreon**: Support and updates at [patreon.com/ProjectGalatine](https://www.patreon.com/ProjectGalatine)

### How can I support the project?
- Star the [GitHub repository](https://github.com/FlashGalatine/webp-converter)
- Share with others who might find it useful
- Report bugs and suggest features
- Support on [Patreon](https://www.patreon.com/ProjectGalatine)
- Contribute code via GitHub

---

## Common Use Cases

### Converting screenshots for social media
1. Take a screenshot (Ctrl+PrtScn or Cmd+Shift+4)
2. Paste into converter (Ctrl+V or Cmd+V)
3. Select appropriate preset (Twitter, Instagram, Discord, etc.)
4. Set quality to 80-85
5. Click "Convert & Download"

### Batch processing for a website
1. Select multiple product photos
2. Load into queue
3. Select "Instagram Square" preset or custom preset
4. Enable "Remove After Convert"
5. Convert each image (auto-advances)
6. All images converted and properly named

### Creating optimized images for web
1. Load image
2. Set "Optimize for Web"
3. Target size 100-200KB (depends on image)
4. Click "Convert & Download"
5. Result meets your size requirement with best possible quality

### Resizing for specific platforms
1. Load image
2. Select platform preset (Twitter, Discord, Pinterest, etc.)
3. Adjust crop as needed
4. Optionally enable Freestyle Mode for custom crop
5. Convert and download

---

**Last Updated:** November 4, 2025 | Version 2.5.0
