# WebP Converter - Project Files

## 📁 File Structure

```
├── index.html                              [Launcher - choose your version]
├── webp-converter-web-STABLE.html         [🟢 Production version]
├── webp-converter-web-EXPERIMENTAL.html   [🟠 Testing version]
├── presets.json                           [Sample custom presets]
├── README.md                              [Feature documentation]
├── VERSION_INFO.md                        [Version history & details]
└── PROJECT_SUMMARY.md                     [This file]
```

## 🚀 Quick Start

1. **Open `index.html`** to choose between STABLE or EXPERIMENTAL
2. **Load an image** using "Select Image" or drag & drop
3. **Choose a preset** from built-in options
4. **Or load custom presets** from a JSON file
5. **Adjust settings** (quality, dimensions, optimization)
6. **Convert & Download** your WebP image!

## 📌 Version Strategy

### STABLE Build (Recommended)
- **Purpose:** Production use
- **Status:** Fully tested, zero known issues
- **Updates:** Only critical bug fixes
- **Best for:** Important work, reliable results

### EXPERIMENTAL Build
- **Purpose:** Testing new features
- **Status:** Development & testing  
- **Updates:** Frequent, may have bugs
- **Best for:** Early adopters, feature testing, feedback
- **Current Version:** 1.1-EXPERIMENTAL

**New in EXPERIMENTAL:**
- 🎉 **Image Queue System** - Batch process multiple images
  - Multi-file selection and drag & drop
  - Visual queue panel with status tracking
  - Previous/Next navigation
  - Auto-advance after conversion
  - Individual/bulk removal
  - Progress indicators

## ✨ Current Features (STABLE)

### Core Functionality
- ✅ Interactive canvas with zoom/pan
- ✅ Manual crop with draggable handles
- ✅ Aspect ratio presets (built-in)
- ✅ Custom preset system (JSON)
- ✅ WebP conversion (lossy/lossless)
- ✅ Quality control (0-100)
- ✅ Dimension constraints
- ✅ File size optimization

### User Experience
- ✅ Drag & drop loading
- ✅ Keyboard shortcuts
- ✅ Real-time preview
- ✅ Progress indicators
- ✅ Smart filename generation
- ✅ Visual feedback
- ✅ Preset-specific settings

### Custom Presets
- ✅ Load from JSON files
- ✅ Auto-apply dimensions
- ✅ Auto-apply file size targets
- ✅ Platform-specific presets (BlueSky, Twitter, Discord, etc.)
- ✅ Switch between built-in/custom
- ✅ Visual preset information

## 🎨 Custom Preset Format

```json
{
  "Preset Name": {
    "crop-ratio": 1.5,           // Aspect ratio (optional)
    "max-width": 1920,           // Max width in pixels (optional)
    "max-height": 1080,          // Max height in pixels (optional)
    "max-filesize": 1,           // Target file size (optional)
    "max-filesize-unit": "MB"    // Unit: KB, MB, or GB (optional)
  }
}
```

## 🎯 Development Workflow

### Making Changes
1. **Test in EXPERIMENTAL first**
2. **Verify all features work**
3. **Fix any bugs**
4. **Update STABLE when ready**

### Adding Features
1. **Implement in EXPERIMENTAL**
2. **Test thoroughly**
3. **Document in README**
4. **Merge to STABLE when stable**

### Bug Fixes
- **Critical bugs:** Fix in both STABLE and EXPERIMENTAL
- **Minor bugs:** Fix in EXPERIMENTAL, test, then STABLE
- **Experimental bugs:** Fix in EXPERIMENTAL only

## 📊 Statistics

- **Total Lines of Code:** ~1000+ per build
- **Presets Included:** 15+ built-in, 21 in sample JSON
- **File Size:** ~44KB HTML (single file, no dependencies)
- **Supported Image Formats:** All browser-supported formats
- **Output Format:** WebP only

## 🔧 Technical Details

### Dependencies
- React 18 (via CDN)
- Tailwind CSS (via CDN)
- Babel Standalone (for JSX)
- Native Canvas API
- Native File API

### Browser Requirements
- Modern browser with Canvas support
- JavaScript enabled
- File API support
- WebP encoding support

### Performance
- Client-side processing (no server required)
- Efficient canvas operations
- Progressive quality optimization
- Memory-conscious design

## 📝 Notes

- Both builds are standalone HTML files
- No installation or build process required
- Works offline (after initial CDN load)
- No data leaves your computer
- Privacy-focused design

## 🎓 Learning Resources

- **README.md** - Feature guide and usage
- **VERSION_INFO.md** - Version details and history
- **presets.json** - Example preset configurations
- **Code comments** - Inline documentation

## 🤝 Contributing Ideas

Want to suggest features for EXPERIMENTAL?
- Additional preset templates
- Batch processing
- More output formats
- Advanced filters
- Metadata editing
- Export presets
- Preset sharing

## 📜 License & Credits

This is a standalone web application created by Flash Galatine.
Uses React, Tailwind CSS, and modern web standards.

**Created by:** Flash Galatine
- GitHub: [FlashGalatine](https://github.com/FlashGalatine)
- X/Twitter: [@AsheJunius](https://x.com/AsheJunius)
- Twitch: [flashgalatine](https://www.twitch.tv/flashgalatine)
- BlueSky: [@flashgalatine.bsky.social](https://bsky.app/profile/flashgalatine.bsky.social)
- Patreon: [Project Galatine](https://www.patreon.com/ProjectGalatine)
- Blog: [blog.projectgalatine.com](https://blog.projectgalatine.com/)

---

**Last Updated:** October 28, 2025
**Current Version:** 2.1-STABLE
