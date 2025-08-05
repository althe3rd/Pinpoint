# Pinpoint Browser Extensions

This document explains how to use and develop the Pinpoint Accessibility Checker browser extensions for Chrome and Firefox.

## 🚀 Quick Start

### Chrome Extension
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `extension/chrome/` folder
5. The Pinpoint icon should appear in your toolbar

### Firefox Extension
1. Open Firefox and navigate to `about:debugging`
2. Click "This Firefox" 
3. Click "Load Temporary Add-on"
4. Select the `manifest.json` file from the `extension/firefox/` folder
5. The Pinpoint icon should appear in your toolbar

## 🎯 Usage

### Running Accessibility Checks
1. **Toolbar Button**: Click the Pinpoint icon in your browser toolbar
2. **Popup Interface**: Click "Run Accessibility Check" in the popup
3. **Keyboard Shortcut**: Press `Ctrl+Shift+A` (Windows/Linux) or `Cmd+Shift+A` (Mac)
4. **Context Menu**: Right-click on any page and select "Check accessibility with Pinpoint"

### Features
- **Comprehensive Analysis**: WCAG 2.1 AA compliance testing using axe-core
- **Accessibility Score**: Get a 0-100 score for any webpage
- **Detailed Reports**: Technical information including CSS selectors, line numbers, and color contrast data
- **Actionable Recommendations**: Specific guidance on how to fix each issue
- **Manual Review Tracking**: Mark items as verified that require human judgment
- **Visual Highlighting**: Click any issue to highlight the problematic element on the page

## 🏗️ Building Extensions

### Requirements
- Node.js (v14 or higher)
- npm or yarn

### Build Commands
```bash
# Build both Chrome and Firefox extensions
npm run build:extensions

# Or use the shell script
./build-extensions.sh
```

### What Gets Built
The build process creates:
- `extension-builds/pinpoint-chrome-v{version}.zip` - Chrome extension package
- `extension-builds/pinpoint-firefox-v{version}.xpi` - Firefox extension package
- `extension-builds/README.md` - Installation instructions

## 📁 Project Structure

```
extension/
├── chrome/                 # Chrome extension (Manifest V3)
│   ├── manifest.json      # Extension configuration
│   ├── content-script.js  # Injected into web pages
│   ├── popup.html         # Extension popup UI
│   ├── popup.css          # Popup styles
│   ├── popup.js           # Popup functionality
│   ├── background.js      # Service worker
│   ├── accessibility-checker.js  # Main checker logic
│   └── icons/             # Extension icons
├── firefox/               # Firefox extension (Manifest V2)
│   └── [same structure as Chrome]
└── builds/               # Generated extension packages
```

## 🔧 Development

### File Descriptions

#### `manifest.json`
- **Chrome**: Uses Manifest V3 with service workers
- **Firefox**: Uses Manifest V2 with background scripts
- Defines permissions, content scripts, and UI elements

#### `content-script.js`
- Runs on all web pages
- Listens for messages from popup/background
- Injects the accessibility checker when requested
- Handles keyboard shortcuts

#### `popup.html/css/js`
- Extension popup interface when clicking toolbar icon
- Provides "Run Check" button and status information
- Shows keyboard shortcuts and links

#### `background.js`
- **Chrome**: Service worker for extension lifecycle
- **Firefox**: Background script for extension events
- Handles installation, toolbar clicks, context menu
- Shows welcome messages and status badges

#### `accessibility-checker.js`
- Core accessibility testing logic (copied from main project)
- Uses axe-core for WCAG testing
- Renders results in shadow DOM sidebar
- Handles scoring and manual review tracking

### Testing Extensions

1. Load the extension in developer mode
2. Navigate to any webpage
3. Click the extension icon or use keyboard shortcut
4. Verify the accessibility checker loads and functions correctly

### Key Differences Between Chrome and Firefox

| Feature | Chrome (V3) | Firefox (V2) |
|---------|-------------|--------------|
| Background | Service Worker | Background Script |
| API | `chrome.*` | `browser.*` (with chrome fallback) |
| Action | `chrome.action` | `chrome.browserAction` |
| Permissions | More restrictive | More permissive |

## 🚨 Troubleshooting

### Extension Not Loading
- Check browser console for errors
- Verify all required files are present
- Ensure manifest.json is valid JSON
- Check file permissions

### Accessibility Checker Not Running
- Refresh the page and try again
- Check if page URL is restricted (chrome://, about:, etc.)
- Verify content script is injected (check browser console)
- Try keyboard shortcut instead of toolbar button

### Permission Issues
- Some pages (chrome://, moz-extension://) are restricted by browser security
- Extensions cannot run on browser internal pages
- File:// URLs may have additional restrictions

## 📋 Publishing Extensions

### Chrome Web Store
1. Create a developer account at [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
2. Upload the built `.zip` file
3. Fill out store listing information
4. Submit for review

### Firefox Add-ons (AMO)
1. Create an account at [addons.mozilla.org](https://addons.mozilla.org/developers/)
2. Upload the built `.xpi` file
3. Complete the listing information
4. Submit for review

### Distribution
- Extensions can also be distributed directly as `.zip`/`.xpi` files
- Enterprise deployments can use policy-based installation
- Developer mode allows local installation for testing

## 🔍 Permissions Explained

### Chrome Extension Permissions
- `activeTab`: Access current tab when extension is invoked
- `storage`: Store user preferences and verification states
- `<all_urls>`: Inject content script on all websites

### Firefox Extension Permissions
- `activeTab`: Access current tab when extension is invoked  
- `storage`: Store user preferences and verification states
- `<all_urls>`: Inject content script on all websites

All permissions are required for core functionality and are used responsibly.

## 🤝 Contributing

1. Make changes to source files in `extension/chrome/` or `extension/firefox/`
2. Test changes by loading unpacked extension
3. Run build script to create packages
4. Submit pull request with description of changes

## 📞 Support

- **GitHub Issues**: [Report bugs and feature requests](https://github.com/althe3rd/Pinpoint/issues)
- **Website**: [https://althe3rd.github.io/Pinpoint/](https://althe3rd.github.io/Pinpoint/)
- **Documentation**: See project README.md for bookmarklet version

---

Built with ❤️ for making the web more accessible.