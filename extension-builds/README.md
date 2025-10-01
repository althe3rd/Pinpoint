# Pinpoint Accessibility Checker - Browser Extensions

This directory contains browser extension packages for the Pinpoint Accessibility Checker.

## Installation

### Chrome Extension

#### For Development:
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the `chrome-dev/` folder
4. After making changes, run `npm run build:extensions` and click the reload button

#### For Distribution:
1. Use the `pinpoint-chrome-v{version}.zip` file
2. Upload to Chrome Web Store or install manually

### Firefox Extension
1. Open Firefox and go to `about:debugging`
2. Click "This Firefox"
3. Click "Load Temporary Add-on"
4. Select the `manifest.json` file from the `firefox` folder
5. Or install the packaged `.xpi` file

### Safari Extension (macOS only)
1. Open the `safari-extension/` folder
2. Open the `.xcodeproj` file in Xcode
3. Build and run the project
4. Enable the extension in Safari preferences
5. Or use the pre-built project archive

## Usage

1. Click the Pinpoint icon in your browser toolbar
2. Click "Run Accessibility Check" 
3. Or use the keyboard shortcut: `Ctrl+Shift+A` (Windows/Linux) or `Cmd+Shift+A` (Mac)

## Features

- **WCAG 2.1 AA Testing**: Comprehensive accessibility analysis
- **Axe-core Powered**: Uses the industry-standard testing engine
- **Accessibility Score**: Get a 0-100 score for your page
- **Detailed Reports**: Technical information and actionable recommendations
- **Manual Review Support**: Track verification of items needing human review

## Version

Current version: 1.5.7

## Building

To rebuild all extensions, run:
```bash
npm run build:extensions
```

For Safari only:
```bash
npm run build:safari
```

For Safari App Store submission:
```bash
npm run build:safari:appstore
```

## Development Workflow

1. **Setup**: Load `extension-builds/chrome-dev/` as an unpacked extension in Chrome
2. **Develop**: Make changes to your source files
3. **Test**: Run `npm run build:extensions` and click reload in Chrome
4. **Repeat**: The `chrome-dev/` folder is automatically updated each build

### Safari Extension Notes

- Safari extension generation requires macOS with Xcode command line tools
- The generated Xcode project can be opened and built in Xcode
- Safari extensions must be distributed through the Mac App Store for public release
- For development, you can load the extension directly from Xcode

### App Store Submission

For App Store submission, use the dedicated build command:
```bash
npm run build:safari:appstore
```

This creates an App Store ready project with:
- Proper bundle identifiers (production vs development)
- App Store metadata and copyright
- Minimum system requirements
- Security configurations
- Automated Info.plist updates

**Submission Steps:**
1. Run `npm run build:safari:appstore`
2. Open the generated Xcode project
3. Select your Apple Developer Team
4. Archive the project (Product > Archive)
5. Submit to App Store Connect

## Support

- **Website**: https://althe3rd.github.io/Pinpoint/
- **GitHub**: https://github.com/althe3rd/Pinpoint
- **Issues**: Report bugs and feature requests on GitHub

Built with ❤️ for accessibility testing.
