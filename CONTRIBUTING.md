# Contributing to Pinpoint Accessibility Checker

Thank you for your interest in contributing to the Pinpoint Accessibility Checker project! This tool helps organizations ensure their digital content meets accessibility standards.

## Project Goals

This project aims to:
- Provide easy-to-use accessibility testing for organizations and individuals
- Deliver consistent results using industry-standard axe-core
- Maintain professional branding and standards
- Support local development and testing workflows

## How to Contribute

### Reporting Issues

If you encounter problems with the bookmarklet:

1. **Check existing issues** in the GitHub Issues tab
2. **Test on multiple browsers** and websites to isolate the problem
3. **Use the local test page** (`local-test.html`) to verify if it's a general issue
4. **Provide detailed information** when reporting:
   - Browser version and operating system
   - Website where the issue occurred
   - Steps to reproduce the problem
   - Any error messages from the browser console (F12)

### Suggesting Enhancements

We welcome suggestions for improving the tool:

1. **Search existing feature requests** to avoid duplicates
2. **Consider the target audience** (UW faculty and staff)
3. **Align with accessibility best practices** and WCAG standards
4. **Maintain compatibility** with the axe-core ecosystem

### Code Contributions

#### Prerequisites

- Basic knowledge of HTML, CSS, and JavaScript
- Understanding of web accessibility principles
- Familiarity with axe-core (helpful but not required)

#### Development Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/TestMark.git
   cd TestMark
   ```

3. **Start a local server** for testing:
   ```bash
   # Python
   python -m http.server 8000
   
   # Node.js
   npx http-server
   
   # PHP
   php -S localhost:8000
   ```

4. **Open the test environment**:
   ```
   http://localhost:8000/local-test.html
   ```

#### Making Changes

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following these guidelines:
   - **Keep it simple**: The tool should be easy to use for non-technical users
   - **Maintain UW branding**: Use the established color scheme and styling
   - **Test thoroughly**: Verify changes work across different browsers and websites
   - **Follow accessibility best practices**: The tool itself should be accessible

3. **Test your changes**:
   - Use `local-test.html` for functionality testing
   - Test the bookmarklet on various websites
   - Verify the interface works with keyboard navigation
   - Check that styling remains consistent

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "Add: brief description of your changes"
   ```

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request** on GitHub

#### Code Style Guidelines

- **HTML**: Use semantic HTML5 elements
- **CSS**: Follow BEM methodology where applicable
- **JavaScript**: 
  - Use ES5 syntax for broader browser compatibility in bookmarklets
  - Use `var` instead of `let`/`const` in bookmarklet code
  - Use traditional `function()` instead of arrow functions in bookmarklets
  - Comment complex logic clearly

#### File Structure

```
TestMark/
├── index.html              # Main installation page (keep this clean)
├── local-test.html         # Local testing environment
├── bookmarklet-simple.html # Alternative installation method
├── accessibility-checker.js # Source code for development
├── test-page.html          # Testing with intentional issues
├── bookmarklet-test.html   # Additional testing
├── README.md               # Project documentation
├── CONTRIBUTING.md         # This file
└── _config.yml             # GitHub Pages configuration
```

### Documentation

Help improve documentation by:

- **Clarifying installation instructions**
- **Adding troubleshooting tips**
- **Improving code comments**
- **Creating usage examples**

## Testing

### Required Testing

Before submitting changes:

1. **Local functionality test**: Use `local-test.html`
2. **Cross-browser testing**: Test in Chrome, Firefox, Safari, Edge
3. **Real-world testing**: Test on various websites (university sites, news sites, etc.)
4. **Accessibility testing**: Ensure the tool interface itself is accessible

### Test Cases

The tool should:
- Load properly in all modern browsers
- Display the loading spinner while axe-core downloads
- Show detailed results with proper categorization
- Allow clicking issues to highlight elements
- Handle errors gracefully (network issues, CSP blocks, etc.)
- Clean up properly when closed

## Review Process

1. **Automated checks**: GitHub Actions will run basic validation
2. **Manual review**: Maintainers will test functionality and code quality
3. **Feedback**: You may receive requests for changes
4. **Merge**: Approved changes will be merged and deployed

## University Guidelines

This project follows University of Wisconsin standards:

- **Accessibility**: All interfaces must meet WCAG 2.1 AA standards
- **Branding**: Use official UW colors and professional styling
- **Security**: No tracking, analytics, or data collection
- **Privacy**: Tool runs entirely client-side

## Questions?

If you have questions about contributing:

- **Check the README.md** for basic information
- **Review existing issues** for similar questions
- **Create an issue** for new questions
- **Contact project maintainers** through GitHub

## Recognition

Contributors will be recognized in:
- GitHub Contributors list
- Release notes for significant contributions
- Project documentation where appropriate

---

Thank you for helping improve digital accessibility at the University of Wisconsin!