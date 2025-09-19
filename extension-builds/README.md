# Pinpoint Accessibility Checker - Browser Extensions

This directory contains browser extension packages for the Pinpoint Accessibility Checker.

## Installation

### Chrome Extension
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the `chrome` folder
4. Or install the packaged `.zip` file

### Firefox Extension
1. Open Firefox and go to `about:debugging`
2. Click "This Firefox"
3. Click "Load Temporary Add-on"
4. Select the `manifest.json` file from the `firefox` folder
5. Or install the packaged `.xpi` file

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

Current version: 1.5.4

## Building

To rebuild the extensions, run:
```bash
npm run build:extensions
```

## Support

- **Website**: https://althe3rd.github.io/Pinpoint/
- **GitHub**: https://github.com/althe3rd/Pinpoint
- **Issues**: Report bugs and feature requests on GitHub

Built with ❤️ for accessibility testing.
