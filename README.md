# Pinpoint Accessibility Checker

A bookmarklet-based accessibility testing tool powered by axe-core that provides comprehensive WCAG 2.1 AA compliance testing.

## Features

- **Accessibility Score**: 0-100 rating with color-coded visual indicator
- **Detailed Analysis**: Technical information including HTML source, line numbers, and CSS selectors
- **Click-to-Highlight**: Click any issue to highlight the problematic element
- **WCAG 2.1 AA Compliance**: Industry-standard testing using axe-core
- **Enhanced UI**: Professional sidebar with expandable details

## Development Setup

### Prerequisites
- Node.js (version 14 or higher)
- npm

### Installation
```bash
npm install
```

### Build Process

The project uses a build system to maintain clean, readable source code while generating minified bookmarklets:

- **`accessibility-checker.js`** - Main source file (human-readable)
- **`accessibility-checker.min.js`** - Minified output
- **`index.html`** - Distribution page with embedded bookmarklet

### Available Scripts

```bash
# Build once (minify and update files)
npm run build

# Watch mode (rebuild automatically on changes)
npm run watch
# or
npm run dev

# Serve locally for testing
npm run serve
```

### Development Workflow

1. **Edit** `accessibility-checker.js` with your changes
2. **Run** `npm run watch` to automatically rebuild on changes
3. **Test** by serving locally: `npm run serve`
4. **Access** your test page at `http://localhost:8000`

### Manual Build Steps

If you prefer to build manually:

1. Modify `accessibility-checker.js`
2. Run `npm run build`
3. The build process will:
   - Minify your code (typically 35-40% size reduction)
   - Update `accessibility-checker.min.js`
   - Update the embedded code in `index.html`

### Automated Deployment

The project includes a GitHub Actions workflow (`.github/workflows/build-and-deploy.yml`) that automatically:

- **Runs on every push to main branch**
- Installs dependencies and executes `npm run build`
- Deploys the built files to GitHub Pages

This ensures that:
- The deployed site always has the latest minified bookmarklet
- Manual build steps are never forgotten before deployment
- The live site reflects the current source code

**Benefits:**
- ✅ No manual build steps required before deployment
- ✅ Guaranteed fresh build on every deployment
- ✅ Automatic GitHub Pages deployment
- ✅ Clean workflow without additional commits

## File Structure

```
TestMark/
├── accessibility-checker.js         # Source code (edit this)
├── accessibility-checker.min.js     # Minified output
├── index.html                       # Distribution page
├── build.js                         # Build script
├── package.json                     # Dependencies and scripts
└── README.md                        # This file
```

## Usage

1. Open `index.html` in a browser (or serve it locally)
2. Drag the bookmarklet to your bookmarks bar
3. Visit any webpage and click the bookmark to run accessibility tests

## Configuration

The bookmarklet excludes certain axe-core rules that commonly produce false positives:

- `region` - "Ensures all page content is contained by landmarks"

The checker also automatically excludes its own UI elements from analysis:

- `#uw-a11y-panel` - The accessibility checker's main panel
- `.uw-a11y-highlight` - Temporarily highlighted elements

To modify which rules or elements are excluded, edit the `axeConfig` object in `accessibility-checker.js` and rebuild.

## Version Management & Updates

### Automatic Update Notifications
The bookmarklet includes an automatic update notification system:
- Checks for new releases on GitHub (once per browser session)
- Shows a notification banner when updates are available
- Provides direct links to release notes and the latest bookmarklet

### Creating Releases
When you're ready to release a new version:

1. **Update version**: Increment the version number in `accessibility-checker.js`:
   ```javascript
   version: '1.4.0', // Update this
   ```

2. **Build and commit**: 
   ```bash
   npm run build
   git add -A
   git commit -m "Release v1.4.0"
   ```

3. **Create release tag**:
   ```bash
   git tag v1.4.0
   git push origin v1.4.0
   ```

4. **Automatic release**: GitHub Actions will automatically create a release with the tag

### Update Methods Available to Users

1. **Automatic notification** (recommended): Users get notified in the checker UI
2. **Manual check**: Users can visit the GitHub releases page
3. **Bookmark replacement**: Users can re-drag the bookmarklet from the website
4. **Force update**: Users can delete their bookmark and recreate it

### Benefits of This System
- ✅ Non-intrusive notifications (once per session)
- ✅ Direct links to release notes and updates  
- ✅ Version tracking in the UI
- ✅ Automatic release creation via GitHub Actions

## Contributing

1. Make changes to `accessibility-checker.js`
2. Update the version number if creating a release
3. Run `npm run build` to update generated files
4. Test your changes
5. Submit a pull request

## License

MIT License

**Live Demo**: [Visit Pinpoint Accessibility Checker](https://your-username.github.io/TestMark/)

## Features

- **Comprehensive Testing**: Powered by axe-core, the industry-standard accessibility testing engine
- **Detailed Results**: Professional sidebar interface with violations, warnings, and recommendations
- **Interactive Highlighting**: Click any issue to highlight the problematic element on the page
- **WCAG 2.1 AA Compliance**: Tests against current accessibility standards
- **Fix Recommendations**: Specific guidance on how to resolve each accessibility issue
- **Impact Levels**: Issues categorized by severity (critical, serious, moderate, minor)
- **Documentation Links**: Direct links to axe-core rule documentation

## Quick Start

### Option 1: Live Website (Recommended)
Visit the [Pinpoint Accessibility Checker](https://your-username.github.io/TestMark/) and drag the bookmarklet to your bookmarks bar.

### Option 2: Manual Installation
1. Copy the bookmarklet code from the website
2. Create a new bookmark in your browser
3. Paste the code as the URL
4. Name it "Pinpoint A11y Checker"

### Option 3: Local Development
1. Clone this repository
2. Open `local-test.html` for testing without internet dependency
3. Use `index.html` for the main installation interface

## Troubleshooting

If you're getting errors when clicking the bookmarklet:

### Common Issues & Solutions

1. **"Script Error" or "Failed to load"**
   - Check your internet connection (bookmarklet downloads axe-core from CDN)
   - Try refreshing the page and running the bookmarklet again
   - Ensure JavaScript is enabled in your browser

2. **Nothing happens when clicking**
   - Make sure you saved the complete bookmarklet code
   - Try copying the code again from `test-page.html`
   - Check that you pasted it as the URL/location field when creating the bookmark

3. **Content Security Policy (CSP) errors**
   - Some websites block external scripts for security
   - This is expected behavior on high-security sites
   - Try testing on different websites

4. **Browser compatibility**
   - Supported: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
   - Older browsers may not work

### Debug Steps

1. **Test on the test page**: Open `test-page.html` first to verify the bookmarklet works
2. **Check browser console**: Press F12 and look for error messages
3. **Try the simple version**: Copy the exact code from `test-page.html`
4. **Test on multiple sites**: Some sites have stricter security policies

## Technical Specifications

- **Engine**: axe-core v4.8.2
- **Standards**: WCAG 2.1 Level A and AA
- **Compatibility**: Modern browsers (Chrome 60+, Firefox 55+, Safari 12+, Edge 79+)
- **Performance**: 3-5 seconds first load, 1-2 seconds subsequent loads
- **Dependencies**: axe-core loaded dynamically from jsDelivr CDN

## Features

- **Comprehensive Testing**: Covers WCAG 2.1 AA requirements
- **Violation Detection**: Identifies definite accessibility failures
- **Manual Review Items**: Flags items requiring human judgment
- **Impact Assessment**: Categorizes issues by severity (critical, serious, moderate, minor)
- **University Branding**: Professional UW-themed interface
- **Detailed Results**: Links to axe-core rule documentation
- **Browser Console Output**: Full technical details for developers

## Files Included

- `index.html` - Comprehensive installation page with full features and instructions
- `bookmarklet-simple.html` - Simplified installation page for quick setup
- `test-page.html` - Test page with accessibility issues for debugging
- `accessibility-checker.js` - Full-featured accessibility checker (advanced users)
- `README.md` - This documentation

## Best Practices

1. **Test Early and Often**: Run this tool on your web pages during development
2. **Fix All Violations**: Address all identified errors before publishing
3. **Review Manual Items**: Human judgment needed for flagged items
4. **Test Manually**: Use keyboard navigation and screen readers when possible
5. **Stay Updated**: Bookmark the latest version for ongoing use

## Related Resources

- [UW System Accessibility Guidelines](https://www.wisconsin.edu/accessibility/)
- [UW-Madison Accessibility Resources](https://www.doit.wisc.edu/accessibility/)
- [axe-core Documentation](https://www.deque.com/axe/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)


---


Powered by axe-core accessibility testing engine 