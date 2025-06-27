# UW Accessibility Checker Bookmarklet

A powerful accessibility testing bookmarklet powered by axe-core for University of Wisconsin faculty and staff. This tool provides comprehensive WCAG 2.1 AA compliance testing with a detailed sidebar interface.

🔗 **Live Demo**: [Visit the UW Accessibility Checker](https://your-username.github.io/TestMark/)

## 🎯 Features

- **Comprehensive Testing**: Powered by axe-core, the industry-standard accessibility testing engine
- **Detailed Results**: Professional sidebar interface with violations, warnings, and recommendations
- **Interactive Highlighting**: Click any issue to highlight the problematic element on the page
- **WCAG 2.1 AA Compliance**: Tests against current accessibility standards
- **Fix Recommendations**: Specific guidance on how to resolve each accessibility issue
- **Impact Levels**: Issues categorized by severity (critical, serious, moderate, minor)
- **Documentation Links**: Direct links to axe-core rule documentation

## 🚀 Quick Start

### Option 1: Live Website (Recommended)
Visit the [UW Accessibility Checker](https://your-username.github.io/TestMark/) and drag the bookmarklet to your bookmarks bar.

### Option 2: Manual Installation
1. Copy the bookmarklet code from the website
2. Create a new bookmark in your browser
3. Paste the code as the URL
4. Name it "UW A11y Checker"

### Option 3: Local Development
1. Clone this repository
2. Open `local-test.html` for testing without internet dependency
3. Use `index.html` for the main installation interface

## 🔧 Troubleshooting

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

## 📊 Technical Specifications

- **Engine**: axe-core v4.8.2
- **Standards**: WCAG 2.1 Level A and AA
- **Compatibility**: Modern browsers (Chrome 60+, Firefox 55+, Safari 12+, Edge 79+)
- **Performance**: 3-5 seconds first load, 1-2 seconds subsequent loads
- **Dependencies**: axe-core loaded dynamically from jsDelivr CDN

## 🎨 Features

- **Comprehensive Testing**: Covers WCAG 2.1 AA requirements
- **Violation Detection**: Identifies definite accessibility failures
- **Manual Review Items**: Flags items requiring human judgment
- **Impact Assessment**: Categorizes issues by severity (critical, serious, moderate, minor)
- **University Branding**: Professional UW-themed interface
- **Detailed Results**: Links to axe-core rule documentation
- **Browser Console Output**: Full technical details for developers

## 📚 Files Included

- `index.html` - Comprehensive installation page with full features and instructions
- `bookmarklet-simple.html` - Simplified installation page for quick setup
- `test-page.html` - Test page with accessibility issues for debugging
- `accessibility-checker.js` - Full-featured accessibility checker (advanced users)
- `README.md` - This documentation

## 🎯 Best Practices

1. **Test Early and Often**: Run this tool on your web pages during development
2. **Fix All Violations**: Address all identified errors before publishing
3. **Review Manual Items**: Human judgment needed for flagged items
4. **Test Manually**: Use keyboard navigation and screen readers when possible
5. **Stay Updated**: Bookmark the latest version for ongoing use

## 🔗 Related Resources

- [UW System Accessibility Guidelines](https://www.wisconsin.edu/accessibility/)
- [UW-Madison Accessibility Resources](https://www.doit.wisc.edu/accessibility/)
- [axe-core Documentation](https://www.deque.com/axe/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## 🎓 About

Developed for the University of Wisconsin System to provide Faculty and Staff with professional-grade accessibility testing tools. This bookmarklet ensures consistency with industry-standard axe-based accessibility testing workflows while maintaining the professional appearance expected of university resources.

---

**University of Wisconsin System**  
Digital Accessibility Initiative  
Powered by axe-core accessibility testing engine 