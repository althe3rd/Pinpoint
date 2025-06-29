# TestMark Development Guide

## Enhanced Development Workflow

This project now includes an enhanced development workflow that makes testing accessibility checker changes much faster and more convenient.

## Quick Start

1. **Start watch mode** for automatic rebuilds:
   ```bash
   npm run watch
   ```

2. **Open the test page** in your browser:
   ```bash
   open test-page.html
   # or navigate to: http://localhost:8000/test-page.html if serving locally
   ```

3. **Make changes** to `accessibility-checker.js`

4. **Test instantly** - Just refresh the test page and click the "📋 Test Latest Bookmarklet" button!

## Development Cycle

### The Fast Way (Recommended)
1. Edit `accessibility-checker.js`
2. Code is automatically minified and test page is updated (if using `npm run watch`)
3. Refresh `test-page.html` in browser
4. Click the blue "Test Latest Bookmarklet" button
5. See your changes immediately!

### The Traditional Way
1. Edit `accessibility-checker.js`
2. Run `npm run build`
3. Drag bookmarklet from `index.html` to bookmarks bar
4. Navigate to any page and click bookmark

## Test Page Features

The `test-page.html` includes:

- **🚀 Quick Test Bookmarklet**: Automatically updated with your latest code
- **Multiple violation types**: Critical, serious, moderate, and minor issues
- **Real accessibility problems**: Actual WCAG violations your tool should detect
- **Edge cases**: Complex scenarios like custom controls, ARIA misuse, etc.
- **Expected results**: Clear documentation of what violations should be found

## Build Process

The enhanced build process now updates both files:

```bash
npm run build
```

This will:
1. ✅ Minify `accessibility-checker.js` → `accessibility-checker.min.js`
2. ✅ Update bookmarklet code in `index.html`
3. ✅ Update test bookmarklet in `test-page.html`

## Watch Mode

For continuous development:

```bash
npm run watch
# or
npm run dev
```

This automatically rebuilds whenever you save changes to `accessibility-checker.js`.

## Testing Strategy

### 1. Automated Testing with Test Page
- Use the built-in test page for consistent, repeatable testing
- Verify all expected violation categories are detected
- Test the click-to-highlight functionality
- Check scoring and severity classification

### 2. Real-World Testing
- Test on actual websites
- Use the main bookmarklet from `index.html`
- Test on various page types (forms, tables, media, etc.)

### 3. Cross-Browser Testing
- Test in different browsers
- Verify bookmarklet works in various environments
- Check for console errors

## File Structure

```
TestMark/
├── accessibility-checker.js      # ← Edit this (source code)
├── accessibility-checker.min.js  # ← Generated (minified)
├── index.html                    # ← Production bookmarklet page
├── test-page.html               # ← Development testing page
├── build.js                     # ← Build script
└── DEVELOPMENT.md              # ← This file
```

## Troubleshooting

### Test bookmarklet not working?
1. Make sure you ran `npm run build` or have `npm run watch` running
2. Refresh the test page after building
3. Check browser console for errors

### Build errors?
1. Check that `accessibility-checker.js` has valid JavaScript syntax
2. Ensure all dependencies are installed: `npm install`
3. Check file permissions

### Watch mode not updating?
1. Stop and restart watch mode
2. Check that `accessibility-checker.js` is being saved properly
3. Verify file system permissions

## Tips for Efficient Development

1. **Use watch mode** - Set it and forget it
2. **Keep test page open** - Just refresh to get latest changes
3. **Use browser dev tools** - Check console for errors and network requests
4. **Test incrementally** - Make small changes and test frequently
5. **Use the built-in examples** - The test page has comprehensive violation examples

## Production Deployment

When ready to deploy:

1. **Build the final version**:
   ```bash
   npm run build
   ```

2. **Test thoroughly** using both test page and real websites

3. **Update version** in `accessibility-checker.js` if needed

4. **Deploy** - The `index.html` will have the latest minified bookmarklet

## Contributing

When submitting changes:
1. Test using the test page
2. Verify the build process works
3. Include any new test cases in the test page if needed
4. Update this documentation if workflow changes

---

**Happy coding!** 🚀 The enhanced development workflow should make testing your accessibility checker changes much faster and more enjoyable. 