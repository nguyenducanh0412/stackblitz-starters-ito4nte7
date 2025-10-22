# Local Script Loading Setup

## Overview

This project has been configured to load all scripts and CSS files locally from the `/assets` directory instead of using CDN URLs. This improves reliability and offline capabilities.

## File Structure

### JavaScript Files
All JavaScript files are stored in `src/assets/js/`:

- `jquery.min.js` - jQuery library
- `filereader.js` - File reader utility for PPTX viewer
- `jszip.min.js` - Library to handle ZIP files (PPTX files are ZIP archives)
- `d3.min.js` - Data visualization library used by PPTX viewer
- `nv.d3.min.js` - NVD3 extension for D3
- `pptxjs.js` - Main PPTX viewer library
- `divs2slides.js` - Utility for slide navigation

### CSS Files
All CSS files are stored in `src/assets/css/`:

- `pptxjs.css` - Styles for PPTX viewer
- `nv.d3.min.css` - Styles for NVD3 charts

## How to Update

If you need to update any of these libraries:

1. Download the updated file
2. Replace the corresponding file in the assets directory
3. The `ScriptLoaderService` will automatically use the updated file

## Script Loading

The script loading is handled by the `ScriptLoaderService` which dynamically loads JavaScript files when needed. This ensures that scripts are only loaded when they're required, improving initial page load performance.

## CSS Loading

CSS files are loaded directly in `index.html` to ensure they're available before the application renders.