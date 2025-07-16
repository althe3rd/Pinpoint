(function() {
    'use strict';
    
    // Prevent multiple instances
    if (window.uwAccessibilityChecker) {
        window.uwAccessibilityChecker.remove();
        return;
    }
    
            // Main accessibility checker object
        window.uwAccessibilityChecker = {
            version: '1.4.5˙', // Current version
            issues: [],
            axeLoaded: false,
            checkedItems: new Set(), // Track manually verified items
            isMinimized: false, // Track minimized state
            shadowRoot: null, // Shadow DOM root
        
        // Initialize the checker
        init: function() {
            this.setupShadowDOM();
            this.checkForUpdates();
            this.showLoadingPanel();
            this.loadAxeCore();
        },
        
        // Setup Shadow DOM container
        setupShadowDOM: function() {
            // Create container element
            const container = document.createElement('div');
            container.id = 'uw-a11y-container';
            document.body.appendChild(container);
            
            // Attach shadow root
            this.shadowRoot = container.attachShadow({ mode: 'open' });
            
            // Add global styles for highlight class (applied to main document)
            if (!document.getElementById('uw-a11y-global-styles')) {
                const globalStyle = document.createElement('style');
                globalStyle.id = 'uw-a11y-global-styles';
                globalStyle.textContent = `
                    .uw-a11y-highlight {
                        background: yellow !important;
                        border: 2px solid red !important;
                        box-shadow: 0 0 0 2px yellow !important;
                    }
                `;
                document.head.appendChild(globalStyle);
            }
        },
        
        // Show loading panel while axe-core loads
        showLoadingPanel: function() {
            this.shadowRoot.innerHTML = `
                ${this.getStyles()}
                <div id="uw-a11y-panel">
                    <div id="uw-a11y-header">
                        <div class="uw-a11y-title-container">
                            <svg viewBox="0 0 404 404" fill="none" xmlns="http://www.w3.org/2000/svg" class="uw-a11y-logo">
                                <g filter="url(#filter0_d_1_19)">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M201 349C288.261 349 359 278.261 359 191C359 103.739 288.261 33 201 33C113.739 33 43 103.739 43 191C43 278.261 113.739 349 201 349ZM201 373C301.516 373 383 291.516 383 191C383 90.4842 301.516 9 201 9C100.484 9 19 90.4842 19 191C19 291.516 100.484 373 201 373Z" fill="url(#paint0_linear_1_19)"/>
                                </g>
                                <g filter="url(#filter1_d_1_19)">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M200.5 302C262.08 302 312 252.08 312 190.5C312 128.92 262.08 79 200.5 79C138.92 79 89 128.92 89 190.5C89 252.08 138.92 302 200.5 302ZM200.5 326C275.335 326 336 265.335 336 190.5C336 115.665 275.335 55 200.5 55C125.665 55 65 115.665 65 190.5C65 265.335 125.665 326 200.5 326Z" fill="url(#paint1_linear_1_19)"/>
                                </g>
                                <defs>
                                <filter id="filter0_d_1_19" x="0.4" y="0.4" width="403.2" height="403.2" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                                <feOffset dx="1" dy="11"/>
                                <feGaussianBlur stdDeviation="9.8"/>
                                <feComposite in2="hardAlpha" operator="out"/>
                                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0"/>
                                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1_19"/>
                                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1_19" result="shape"/>
                                </filter>
                                <filter id="filter1_d_1_19" x="46.4" y="46.4" width="310.2" height="310.2" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                                <feOffset dx="1" dy="11"/>
                                <feGaussianBlur stdDeviation="9.8"/>
                                <feComposite in2="hardAlpha" operator="out"/>
                                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0"/>
                                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1_19"/>
                                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1_19" result="shape"/>
                                </filter>
                                <linearGradient id="paint0_linear_1_19" x1="78.7712" y1="51.9816" x2="324.572" y2="313.9" gradientUnits="userSpaceOnUse">
                                <stop stop-color="#35CD9C"/>
                                <stop offset="0.465" stop-color="#43FFFC"/>
                                <stop offset="0.545" stop-color="#C2F6F9"/>
                                <stop offset="1" stop-color="#33BFF1"/>
                                </linearGradient>
                                <linearGradient id="paint1_linear_1_19" x1="109.5" y1="87" x2="292.5" y2="282" gradientUnits="userSpaceOnUse">
                                <stop stop-color="#35CD9C"/>
                                <stop offset="0.465" stop-color="#43FFFC"/>
                                <stop offset="0.545" stop-color="#C2F6F9"/>
                                <stop offset="1" stop-color="#33BFF1"/>
                                </linearGradient>
                                </defs>
                            </svg>
                            <h2>Pinpoint Accessibility Checker</h2>
                        </div>
                        <button id="uw-a11y-close">✕</button>
                    </div>
                    <div id="uw-a11y-content">
                        <div style="text-align: center; padding: 2rem;">
                            <div class="uw-a11y-spinner"></div>
                            <p style="margin-top: 1rem;">Loading axe-core accessibility engine...</p>
                            <p style="font-size: 0.9rem; color: #666;">This may take a few seconds on first use.</p>
                        </div>
                    </div>
                </div>
            `;
            
            // Add event listeners
            this.shadowRoot.getElementById('uw-a11y-close').onclick = () => this.remove();
        },
        
        // Load axe-core dynamically
        loadAxeCore: function() {
            // Check if axe is already loaded
            if (window.axe) {
                this.axeLoaded = true;
                this.runAxeChecks();
                return;
            }
            
            // Load axe-core from CDN
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/axe-core@4.8.2/axe.min.js';
            script.onload = () => {
                this.axeLoaded = true;
                this.runAxeChecks();
            };
            script.onerror = () => {
                this.showError('Failed to load axe-core. Please check your internet connection and try again.');
            };
            document.head.appendChild(script);
        },
        
        // Run axe-core accessibility checks
        runAxeChecks: function() {
            if (!window.axe) {
                this.showError('axe-core failed to load properly.');
                return;
            }
            
            // Configure axe for WCAG 2.1 AA
            const axeConfig = {
                rules: {
                    // Disable the region rule which often creates false positives
                    // for "Ensures all page content is contained by landmarks"
                    'region': { enabled: false },
                    // Disable AAA-level color contrast rule (7:1 ratio) - we only want AA level (4.5:1)
                    'color-contrast-enhanced': { enabled: false }
                },
                tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
                // Exclude the accessibility checker's own UI elements from analysis
                exclude: [
                    '#uw-a11y-panel',     // Main panel container
                    '.uw-a11y-highlight'  // Highlighted elements (temporary styling)
                ]
            };
            
            // Run axe-core analysis (excluding our own UI elements)
            window.axe.run(document, axeConfig, (err, results) => {
                if (err) {
                    this.showError('Error running accessibility analysis: ' + err.message);
                    return;
                }
                
                this.processAxeResults(results);
                this.displayResults();
            });
        },
        
        // Process axe-core results into our format
        processAxeResults: function(results) {
            this.issues = [];
            
            // Load previously checked items for this session
            this.loadCheckedItems();
            
            // Process violations (errors)
            results.violations.forEach(violation => {
                violation.nodes.forEach(node => {
                    // Skip if this node is part of our accessibility checker UI
                    if (this.isOwnUIElement(node)) {
                        return;
                    }
                    
                                    this.addIssue(
                    'error',
                    violation.description,
                    this.buildDescription(violation, node),
                    this.getElementFromNode(node),
                    this.buildRecommendation(violation, node, 'error'),
                    violation.helpUrl,
                    violation.impact || 'serious',
                    violation.tags,
                    this.buildDetailedInfo(violation, node),
                    violation.id
                );
                });
            });
            
                    // Process incomplete items (warnings) with unique IDs for tracking
        console.log('Axe incomplete results:', results.incomplete);
        console.log('Number of incomplete rules:', results.incomplete.length);
        results.incomplete.forEach((incomplete, incompleteIndex) => {
            console.log(`Incomplete rule ${incompleteIndex}: ${incomplete.id} with ${incomplete.nodes.length} nodes`);
            incomplete.nodes.forEach((node, nodeIndex) => {
                // Skip if this node is part of our accessibility checker UI
                if (this.isOwnUIElement(node)) {
                    return;
                }
                
                const uniqueId = `incomplete-${incompleteIndex}-${nodeIndex}`;
                this.addIssue(
                    'warning',
                    incomplete.description,
                    'Manual review needed: ' + this.buildDescription(incomplete, node),
                    this.getElementFromNode(node),
                    this.buildRecommendation(incomplete, node, 'warning'),
                    incomplete.helpUrl,
                    incomplete.impact || 'moderate',
                    incomplete.tags,
                    this.buildDetailedInfo(incomplete, node),
                    incomplete.id
                );
                // Store the unique ID for this manual review item
                this.issues[this.issues.length - 1].uniqueId = uniqueId;
            });
        });
            
            // Store the original results for score recalculation
            this.originalAxeResults = results;
            
            // Create filtered results for accurate scoring (excluding our own UI elements)
            const filteredResults = {
                ...results,
                violations: results.violations.map(violation => ({
                    ...violation,
                    nodes: violation.nodes.filter(node => !this.isOwnUIElement(node))
                })).filter(violation => violation.nodes.length > 0),
                incomplete: results.incomplete.map(incomplete => ({
                    ...incomplete,
                    nodes: incomplete.nodes.filter(node => !this.isOwnUIElement(node))
                })).filter(incomplete => incomplete.nodes.length > 0)
            };
            
            // Add summary information and calculate score using filtered results
            this.axeResults = {
                url: results.url,
                timestamp: results.timestamp,
                toolOptions: results.toolOptions,
                violations: filteredResults.violations.length,
                passes: results.passes.length, // Passes don't need filtering
                incomplete: filteredResults.incomplete.length,
                inapplicable: results.inapplicable.length, // Inapplicable don't need filtering
                score: this.calculateAccessibilityScore(filteredResults)
            };
            
            // Store filtered results for score recalculation
            this.filteredAxeResults = filteredResults;
        },
        
        // Build description from axe result
        buildDescription: function(rule, node) {
            let description = rule.help || rule.description;
            
            if (node.failureSummary) {
                description += '\n\nDetails: ' + node.failureSummary;
            }
            
            if (node.html) {
                description += '\n\nElement: ' + node.html.substring(0, 100);
                if (node.html.length > 100) description += '...';
            }
            
            return description;
        },
        
        // Build recommendation from axe result
        buildRecommendation: function(rule, node, issueType = 'error') {
            const ruleId = rule.id;
            let recommendationText = '';
            
            if (issueType === 'warning') {
                // Manual review items need verification guidance, not fixing instructions
                const manualReviewRecommendations = this.getManualReviewRecommendations();
                if (manualReviewRecommendations[ruleId]) {
                    const rec = manualReviewRecommendations[ruleId];
                    recommendationText = typeof rec === 'function' ? rec(node, rule) : rec;
                } else {
                    // Use default manual review guidance
                    const defaultRec = manualReviewRecommendations['default'];
                    recommendationText = defaultRec(node, rule);
                }
            } else {
                // Violations need fixing instructions
                const recommendations = this.getActionableRecommendations();
                if (recommendations[ruleId]) {
                    const rec = recommendations[ruleId];
                    recommendationText = typeof rec === 'function' ? rec(node, rule) : rec;
                } else {
                    recommendationText = rule.help || 'Please refer to the help documentation for specific guidance on fixing this issue.';
                }
            }
            
            // Format the recommendation with proper code escaping
            return this.formatRecommendation(recommendationText);
        },
        
        // Format recommendation text with proper code escaping
        formatRecommendation: function(text) {
            // Escape HTML entities first
            const escapeHtml = (unsafe) => {
                return unsafe
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#039;");
            };
            
            // Find HTML code examples and wrap them in <code> tags
            // This regex looks for patterns like <tag>, <tag attr="value">, etc.
            const codePattern = /(<[^>]+>)/g;
            
            // Replace HTML code examples with properly formatted code tags
            const formatted = text.replace(codePattern, (match) => {
                return `<code>${escapeHtml(match)}</code>`;
            });
            
            // Also handle attribute examples like 'aria-label="text"'
            const attrPattern = /([\w-]+="[^"]*")/g;
            const withAttrs = formatted.replace(attrPattern, (match) => {
                // Only format if it's not already inside a code tag
                if (!match.includes('&lt;') && !match.includes('&gt;')) {
                    return `<code>${match}</code>`;
                }
                return match;
            });
            
            // Handle CSS values and specific technical terms
            // Fixed to properly handle decimal contrast ratios like 1.77:1, 4.5:1, etc.
            const cssPattern = /(\d+(?:\.\d+)?:\d+(?:\.\d+)?|tabindex="\d+"|role="[^"]*"|#[a-zA-Z0-9-]+)/g;
            const withCss = withAttrs.replace(cssPattern, (match) => {
                // Only format if not already in code tags
                if (!match.includes('&lt;') && !match.includes('&gt;')) {
                    return `<code>${match}</code>`;
                }
                return match;
            });
            
            return withCss;
        },
        
        // Escape HTML attributes (for use in HTML attributes like aria-label)
        escapeHtmlAttribute: function(unsafe) {
            if (!unsafe) return '';
            return unsafe
                .replace(/&/g, "&amp;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");
        },
        
        // Escape HTML content (for text content in HTML elements)
        escapeHtmlContent: function(unsafe) {
            if (!unsafe) return '';
            return unsafe
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");
        },
        
        // Sanitize HTML ID values
        sanitizeHtmlId: function(id) {
            if (!id) return '';
            return id.replace(/[^a-zA-Z0-9\-_:.]/g, '-');
        },
        
        // Escape JavaScript strings (for use in onclick handlers)
        escapeJavaScript: function(unsafe) {
            if (!unsafe) return '';
            return unsafe
                .replace(/\\/g, "\\\\")
                .replace(/'/g, "\\'")
                .replace(/"/g, '\\"')
                .replace(/\n/g, "\\n")
                .replace(/\r/g, "\\r")
                .replace(/\t/g, "\\t");
        },
        
        // Validate and escape URLs
        escapeUrl: function(url) {
            if (!url) return '';
            try {
                // Basic URL validation
                const urlObj = new URL(url);
                // Only allow http and https protocols
                if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
                    return '';
                }
                return this.escapeHtmlAttribute(url);
            } catch (e) {
                return '';
            }
        },
        
        // Manual review recommendations for verification guidance
        getManualReviewRecommendations: function() {
            return {
                // Color contrast items that need manual verification
                'color-contrast': (node, rule) => {
                    return 'Manually verify the contrast meets WCAG standards. Use a contrast checker tool or browser extension to measure the exact ratio. For normal text, ensure at least 4.5:1 ratio; for large text (18pt+ or 14pt+ bold), ensure at least 3:1 ratio.';
                },
                
                'color-contrast-enhanced': (node, rule) => {
                    return 'Check if enhanced AAA contrast is needed for this content. Verify if 7:1 ratio for normal text or 4.5:1 for large text is required based on your accessibility requirements.';
                },
                
                // Audio/Video content requiring manual review
                'audio-caption': (node, rule) => {
                    return 'Listen to the audio content and verify: 1) Does it contain speech or important audio information? 2) Are captions or transcripts provided if needed? 3) Are any captions accurate and properly synchronized?';
                },
                
                'video-caption': (node, rule) => {
                    return 'Watch the video content and verify: 1) Does it contain speech or important audio? 2) Are captions provided for all speech and sound effects? 3) Are captions accurate, synchronized, and properly formatted?';
                },
                
                // Link purpose verification
                'link-in-text-block': (node, rule) => {
                    return 'Check if this link is distinguishable from surrounding text without relying on color alone. Verify there are visual indicators like underlines, different font weight, or other styling that works for colorblind users.';
                },
                
                'identical-links-same-purpose': (node, rule) => {
                    return 'Review these links with identical text and verify they serve the same purpose or lead to the same destination. If they serve different purposes, make the link text more descriptive to differentiate them.';
                },
                
                // Hidden content verification  
                'hidden-content': (node, rule) => {
                    return 'Verify this hidden content is appropriately hidden and still accessible to screen readers when needed. Check that important information isn\'t hidden from all users unintentionally.';
                },
                
                // ARIA usage that needs manual verification
                'aria-hidden-focus': (node, rule) => {
                    return 'Check if this focusable element with aria-hidden="true" is intentionally hidden from screen readers. Verify this doesn\'t hide important interactive content from assistive technologies.';
                },
                
                // Complex widgets requiring manual testing
                'nested-interactive': (node, rule) => {
                    return 'Test this interactive element with keyboard navigation and screen readers. Verify all functionality is accessible and the focus order makes sense to users.';
                },
                
                // Content structure requiring human judgment
                'landmark-unique': (node, rule) => {
                    return 'Review if multiple landmarks of the same type need distinguishing labels. Consider adding aria-label or aria-labelledby if users would benefit from clearer landmark identification.';
                },
                
                'heading-structure': (node, rule) => {
                    return 'Review the heading structure for logical flow. Verify headings accurately describe the content hierarchy and help users navigate and understand the page structure.';
                },
                
                // Default for other manual review items
                'default': (node, rule) => {
                    return `Manually verify this element meets accessibility requirements. Review the content, test with assistive technologies if possible, and ensure it provides equivalent access for all users.`;
                }
            };
        },
        
        // Comprehensive mapping of actionable recommendations
        getActionableRecommendations: function() {
            return {
                // Images and Media
                'image-alt': (node, rule) => {
                    const element = this.getElementFromNode(node);
                    if (element && element.tagName === 'IMG') {
                        if (element.src && element.src.includes('decorative') || element.getAttribute('role') === 'presentation') {
                            return 'Add alt="" for decorative images, or add role="presentation" if the image is purely decorative.';
                        }
                        return 'Add descriptive alt text: <img src="..." alt="Brief description...">. Describe the content and function, not just "image of..."';
                    }
                    return 'Add appropriate alt text describing the image content and purpose.';
                },
                
                'image-redundant-alt': 'Remove redundant words like "image of", "picture of", "graphic of" from alt text. Just describe what the image shows: alt="Red sports car" instead of alt="Image of a red sports car"',
                
                // Forms
                'label': (node, rule) => {
                    const element = this.getElementFromNode(node);
                    if (element) {
                        const id = element.id || 'unique-id';
                        const type = element.type || 'text';
                        return `Add a label: <label for="${id}">Field Name</label><input type="${type}" id="${id}"> OR use aria-label: <input type="${type}" aria-label="Field Name">`;
                    }
                    return 'Associate each form control with a descriptive label using <label> or aria-label.';
                },
                
                'button-name': (node, rule) => {
                    const element = this.getElementFromNode(node);
                    if (element) {
                        if (element.innerHTML.trim() === '') {
                            return 'Add text content inside the button: <button>Submit Form</button> OR add aria-label: <button aria-label="Submit form">👍</button>';
                        }
                        return 'Ensure button has accessible text via text content, aria-label, or aria-labelledby.';
                    }
                    return 'Buttons need accessible names - add text content or aria-label.';
                },
                
                'duplicate-id': 'Make each ID unique. Find duplicate IDs in your HTML and rename them. Each ID must be used only once per page.',
                
                // Color and Contrast
                'color-contrast': (node, rule) => {
                    const colorInfo = this.extractColorContrastInfo(node);
                    if (colorInfo) {
                        return `Current contrast is ${colorInfo.contrast} or may be difficult to determine due to the use of a gradient or image background. WCAG AA requires 4.5:1 for normal text, 3:1 for large text (18pt+ or 14pt+ bold).`;
                    }
                    return 'Improve text contrast ratio. Use darker text on light backgrounds or lighter text on dark backgrounds.';
                },
                
                // Links
                'link-name': 'Make link text descriptive. Instead of "click here" or "read more", use "Download annual report" or "Read more about accessibility testing". The link text should make sense out of context.',
                
                'link-in-text-block': 'Links in text need visual distinction beyond color alone. Add underlines, bold text, or other visual indicators that work for colorblind users.',
                
                // Headings
                'heading-order': (node, rule) => {
                    const element = this.getElementFromNode(node);
                    if (element) {
                        const level = parseInt(element.tagName.charAt(1));
                        return `Fix heading sequence - don't skip levels. After H${level-2}, use H${level-1}, not H${level}. Structure should be H1→H2→H3, not H1→H3.`;
                    }
                    return 'Use headings in sequential order (H1, H2, H3...) without skipping levels. Think of headings as a document outline.';
                },
                
                'empty-heading': 'Add meaningful text inside headings. Remove empty headings or add descriptive content: <h2>Our Services</h2>',
                
                // ARIA
                'aria-allowed-attr': 'Remove unsupported ARIA attributes from this element type. Check the ARIA specification for which attributes are valid for each element.',
                
                'aria-required-attr': 'Add required ARIA attributes. For example, role="button" needs aria-label or text content. Check ARIA patterns for required attributes.',
                
                'aria-valid-attr-value': 'Fix ARIA attribute values. Use valid values like aria-expanded="true" or "false", not "yes" or other invalid values.',
                
                'button-name': 'Add accessible name to button using text content, aria-label, or aria-labelledby.',
                
                // Tables
                'table-fake-caption': 'Use proper <caption> element instead of fake caption. Move the caption text inside: <table><caption>Sales Data 2024</caption><tr>...</table>',
                
                'td-headers-attr': 'Add headers attribute to complex table cells: <td headers="row1 col2">Data</td> where "row1 col2" are IDs of header cells.',
                
                'th-has-data-cells': 'Ensure table headers (th) actually relate to data cells. Remove empty or irrelevant header cells.',
                
                // Structure
                'region': 'Add landmark regions using HTML5 elements: <main>, <nav>, <aside>, <header>, <footer>. OR use ARIA: <div role="main">, <div role="navigation">.',
                
                'page-has-heading-one': 'Add exactly one H1 heading per page. The H1 should describe the main content: <h1>Page Title</h1>',
                
                'landmark-one-main': 'Add one <main> element per page: <main><!-- main content here --></main> OR <div role="main">',
                
                // Lists
                'list': 'Use proper list markup. Wrap list items in <ul> or <ol>: <ul><li>Item 1</li><li>Item 2</li></ul>',
                
                'definition-list': 'Use proper definition list structure: <dl><dt>Term</dt><dd>Definition</dd></dl>',
                
                // Focus and Keyboard
                'focus-order-semantics': 'Use semantic HTML elements (button, a, input) instead of div/span with click handlers. This ensures proper keyboard focus order.',
                
                'tabindex': 'Remove positive tabindex values (tabindex="1", "2", etc). Use tabindex="0" to make elements focusable or tabindex="-1" to remove from tab order.',
                
                // Language
                'html-has-lang': 'Add language attribute to html element: <html lang="en"> or <html lang="es"> for Spanish, etc.',
                
                'html-lang-valid': 'Use valid language code. Examples: "en" for English, "es" for Spanish, "fr" for French. Use format like "en-US" for regional variants.',
                
                // Audio/Video
                'audio-caption': 'Add captions to audio content using <track> element with captions file, or provide transcript nearby.',
                
                'video-caption': 'Add captions: <video><track kind="captions" src="captions.vtt" srclang="en" label="English"></video>',
                
                // Meta
                'meta-refresh': 'Remove auto-refresh meta tags. Use JavaScript with user control: <button onclick="refresh()">Refresh Page</button>',
                
                'meta-viewport': 'Add viewport meta tag: <meta name="viewport" content="width=device-width, initial-scale=1.0">',
                
                // Misc
                'duplicate-id-active': 'Remove duplicate IDs from interactive elements. Each ID must be unique across the entire page.',
                
                'duplicate-id-aria': 'Fix duplicate IDs used in ARIA relationships (aria-labelledby, aria-describedby). Each referenced ID must be unique.',
                
                'frame-title': 'Add descriptive title to iframe: <iframe title="Customer feedback form" src="..."></iframe>',
                
                'object-alt': 'Add alternative text to object elements: <object data="chart.svg" type="image/svg+xml">Sales chart showing 20% increase</object>',
                
                'scope-attr-valid': 'Use valid scope attribute values on table headers: scope="col" for column headers, scope="row" for row headers.',
                
                'skip-link': 'Add skip navigation link at page start: <a href="#main" class="skip-link">Skip to main content</a>',
                
                'css-orientation-lock': 'Don\'t lock orientation in CSS. Remove or modify CSS that prevents rotation: transform: rotate() or orientation locks.'
            };
        },
        
        // Get DOM element from axe node data
        getElementFromNode: function(node) {
            if (node.target && node.target.length > 0) {
                try {
                    // Use axe's selector to find the element
                    return document.querySelector(node.target[0]);
                } catch (e) {
                    // Fallback: try to find by other means
                    return null;
                }
            }
            return null;
        },

        // Check if a node belongs to our accessibility checker UI
        isOwnUIElement: function(node) {
            // Check the CSS selector for our UI elements
            if (node.target && node.target[0]) {
                const selector = node.target[0];
                
                // Check if it's our main panel or any child element
                if (selector.includes('#uw-a11y-panel') || 
                    selector.includes('uw-a11y-')) {
                    return true;
                }
            }
            
            // Check the HTML content for our UI elements
            if (node.html) {
                if (node.html.includes('uw-a11y-') || 
                    node.html.includes('id="uw-a11y-')) {
                    return true;
                }
            }
            
            // Check the actual DOM element if available
            const element = this.getElementFromNode(node);
            if (element) {
                // Check if element is inside our panel
                const panel = document.getElementById('uw-a11y-panel');
                if (panel && (element === panel || panel.contains(element))) {
                    return true;
                }
                
                // Check if element has our CSS classes
                if (element.className && typeof element.className === 'string') {
                    if (element.className.includes('uw-a11y-')) {
                        return true;
                    }
                }
                
                // Check if element has our ID pattern
                if (element.id && element.id.includes('uw-a11y-')) {
                    return true;
                }
            }
            
            return false;
        },
        
        // Build detailed technical information about the issue
        buildDetailedInfo: function(rule, node) {
            const details = [];
            
            // Add HTML source context with line number estimation
            if (node.html) {
                details.push({
                    type: 'html',
                    label: 'HTML Source',
                    value: node.html
                });
                
                // Try to estimate line number
                const lineNumber = this.estimateLineNumber(node.html);
                if (lineNumber > 0) {
                    details.push({
                        type: 'line',
                        label: 'Approximate Line',
                        value: lineNumber
                    });
                }
            }
            
            // Add CSS selector
            if (node.target && node.target[0]) {
                details.push({
                    type: 'selector',
                    label: 'CSS Selector',
                    value: node.target[0]
                });
            }
            
            // Add specific rule-based details
            if (rule.id === 'color-contrast') {
                const colorInfo = this.extractColorContrastInfo(node);
                if (colorInfo) {
                    details.push({
                        type: 'colors',
                        label: 'Color Information',
                        value: colorInfo
                    });
                }
            }
            
            if (rule.id.includes('landmark') || rule.id.includes('region')) {
                details.push({
                    type: 'landmarks',
                    label: 'Landmark Context',
                    value: this.analyzeLandmarkContext(node)
                });
            }
            
            if (rule.id.includes('heading')) {
                details.push({
                    type: 'headings',
                    label: 'Heading Structure',
                    value: this.analyzeHeadingStructure(node)
                });
            }
            
            // Add failure summary details
            if (node.failureSummary) {
                details.push({
                    type: 'failure',
                    label: 'Technical Details',
                    value: node.failureSummary
                });
            }
            
            // Add any additional data from axe
            if (node.any && node.any.length > 0) {
                const anyDetails = node.any.map(item => item.message || item.id).filter(Boolean);
                if (anyDetails.length > 0) {
                    details.push({
                        type: 'checks',
                        label: 'Failed Checks',
                        value: anyDetails.join(', ')
                    });
                }
            }
            
            return details;
        },
        
        // Estimate line number by counting newlines in document
        estimateLineNumber: function(htmlSnippet) {
            try {
                const documentHTML = document.documentElement.outerHTML;
                const index = documentHTML.indexOf(htmlSnippet.substring(0, 50));
                if (index > -1) {
                    const beforeSnippet = documentHTML.substring(0, index);
                    return beforeSnippet.split('\n').length;
                }
            } catch (e) {
                // Fallback: return 0 if estimation fails
            }
            return 0;
        },
        
        // Extract color contrast information
        extractColorContrastInfo: function(node) {
            try {
                const element = this.getElementFromNode(node);
                if (!element) return null;
                
                const styles = window.getComputedStyle(element);
                let fgColor = styles.color;
                let bgColor = styles.backgroundColor;
                
                // Handle transparent or rgba(0,0,0,0) backgrounds by finding the effective background
                if (!bgColor || bgColor === 'transparent' || bgColor === 'rgba(0, 0, 0, 0)' || bgColor.includes('rgba(0, 0, 0, 0)')) {
                    // Walk up the DOM tree to find the first non-transparent background
                    let parent = element.parentElement;
                    while (parent && parent !== document.body) {
                        const parentStyles = window.getComputedStyle(parent);
                        const parentBg = parentStyles.backgroundColor;
                        if (parentBg && parentBg !== 'transparent' && parentBg !== 'rgba(0, 0, 0, 0)' && !parentBg.includes('rgba(0, 0, 0, 0)')) {
                            bgColor = parentBg;
                            break;
                        }
                        parent = parent.parentElement;
                    }
                    
                    // If still no background found, assume white (common default)
                    if (!bgColor || bgColor === 'transparent' || bgColor === 'rgba(0, 0, 0, 0)' || bgColor.includes('rgba(0, 0, 0, 0)')) {
                        bgColor = '#ffffff';
                    }
                }
                
                // Calculate contrast ratio if possible
                const contrast = this.calculateContrastRatio(fgColor, bgColor);
                
                return {
                    foreground: fgColor,
                    background: bgColor,
                    contrast: contrast ? contrast.toFixed(2) + ':1' : 'Unable to calculate',
                    required: 'WCAG AA requires 4.5:1 for normal text, 3:1 for large text'
                };
            } catch (e) {
                console.warn('Error extracting color contrast info:', e);
                return null;
            }
        },
        
        // WCAG compliant contrast ratio calculation
        calculateContrastRatio: function(fg, bg) {
            try {
                const fgLuminance = this.getLuminance(fg);
                const bgLuminance = this.getLuminance(bg);
                
                // Return null if we can't calculate luminance for either color
                if (fgLuminance === null || bgLuminance === null) {
                    console.warn('Could not calculate luminance for colors:', fg, bg);
                    return null;
                }
                
                // WCAG contrast ratio formula: (L1 + 0.05) / (L2 + 0.05)
                // where L1 is the lighter color and L2 is the darker color
                const lighter = Math.max(fgLuminance, bgLuminance);
                const darker = Math.min(fgLuminance, bgLuminance);
                
                const contrast = (lighter + 0.05) / (darker + 0.05);
                
                // Ensure we return a reasonable value
                if (isNaN(contrast) || !isFinite(contrast)) {
                    console.warn('Invalid contrast ratio calculated for colors:', fg, bg);
                    return null;
                }
                
                return contrast;
            } catch (e) {
                console.warn('Error calculating contrast ratio:', e);
                return null;
            }
        },
        
        // Get relative luminance (WCAG compliant)
        getLuminance: function(color) {
            try {
                let r, g, b;
                
                // Handle different color formats
                if (color.startsWith('#')) {
                    // Hex color
                    const hex = color.slice(1);
                    if (hex.length === 3) {
                        // Short hex (#rgb)
                        r = parseInt(hex[0] + hex[0], 16);
                        g = parseInt(hex[1] + hex[1], 16);
                        b = parseInt(hex[2] + hex[2], 16);
                    } else if (hex.length === 6) {
                        // Long hex (#rrggbb)
                        r = parseInt(hex.slice(0, 2), 16);
                        g = parseInt(hex.slice(2, 4), 16);
                        b = parseInt(hex.slice(4, 6), 16);
                    } else {
                        return null;
                    }
                } else if (color.startsWith('rgb')) {
                    // RGB/RGBA color
                    const values = color.match(/\d+/g);
                    if (values && values.length >= 3) {
                        r = parseInt(values[0]);
                        g = parseInt(values[1]);
                        b = parseInt(values[2]);
                    } else {
                        return null;
                    }
                } else {
                    // Named colors - basic support for common ones
                    const namedColors = {
                        'white': [255, 255, 255],
                        'black': [0, 0, 0],
                        'red': [255, 0, 0],
                        'green': [0, 128, 0],
                        'blue': [0, 0, 255],
                        'yellow': [255, 255, 0],
                        'cyan': [0, 255, 255],
                        'magenta': [255, 0, 255],
                        'silver': [192, 192, 192],
                        'gray': [128, 128, 128],
                        'grey': [128, 128, 128]
                    };
                    
                    const colorName = color.toLowerCase().trim();
                    if (namedColors[colorName]) {
                        [r, g, b] = namedColors[colorName];
                    } else {
                        return null;
                    }
                }
                
                // Apply gamma correction (sRGB to linear RGB)
                const gammaCorrect = (c) => {
                    c = c / 255;
                    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
                };
                
                const rLinear = gammaCorrect(r);
                const gLinear = gammaCorrect(g);
                const bLinear = gammaCorrect(b);
                
                // Calculate relative luminance using WCAG formula
                return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
                
            } catch (e) {
                console.warn('Error calculating luminance for color:', color, e);
                return null;
            }
        },
        
        // Analyze landmark context
        analyzeLandmarkContext: function(node) {
            try {
                const element = this.getElementFromNode(node);
                if (!element) return 'Element not found';
                
                const landmarks = document.querySelectorAll('main, nav, header, footer, aside, section[aria-label], section[aria-labelledby], [role="banner"], [role="navigation"], [role="main"], [role="contentinfo"], [role="complementary"]');
                
                return `Found ${landmarks.length} landmarks on page. Current element: ${element.tagName.toLowerCase()}${element.getAttribute('role') ? ' (role="' + element.getAttribute('role') + '")' : ''}`;
            } catch (e) {
                return 'Unable to analyze landmark context';
            }
        },
        
        // Analyze heading structure
        analyzeHeadingStructure: function(node) {
            try {
                const element = this.getElementFromNode(node);
                if (!element) return 'Element not found';
                
                const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
                const currentIndex = headings.indexOf(element);
                const currentLevel = parseInt(element.tagName.charAt(1));
                
                let context = `Current: ${element.tagName} "${element.textContent.substring(0, 50)}"`;
                
                if (currentIndex > 0) {
                    const prevHeading = headings[currentIndex - 1];
                    const prevLevel = parseInt(prevHeading.tagName.charAt(1));
                    context += `\nPrevious: ${prevHeading.tagName} (level ${prevLevel})`;
                    
                    if (currentLevel > prevLevel + 1) {
                        context += `\nIssue: Skipped from H${prevLevel} to H${currentLevel}`;
                    }
                }
                
                return context;
            } catch (e) {
                return 'Unable to analyze heading structure';
            }
        },
        
        // Calculate accessibility score (considering manually verified items)
        calculateAccessibilityScore: function(results) {
            // Weight different types of issues
            const weights = {
                critical: 10,
                serious: 7,
                moderate: 3,
                minor: 1
            };
            
            let totalDeductions = 0;
            let totalPossible = results.passes.length + results.violations.length + results.incomplete.length;
            
            // Calculate deductions for violations (errors)
            results.violations.forEach(violation => {
                const weight = weights[violation.impact] || weights.moderate;
                totalDeductions += violation.nodes.length * weight;
            });
            
            // Calculate deductions for incomplete items, considering manually verified status
            let incompleteDeductions = 0;
            let totalManualReview = 0;
            let verifiedCount = 0;
            
            results.incomplete.forEach((incomplete, incompleteIndex) => {
                incomplete.nodes.forEach((node, nodeIndex) => {
                    totalManualReview++;
                    const uniqueId = `incomplete-${incompleteIndex}-${nodeIndex}`;
                    
                    // Check if this specific item is verified OR if the entire rule is verified
                    const isRuleVerified = this.isRuleVerified(incomplete.id);
                    const isIndividuallyVerified = this.checkedItems && this.checkedItems.has(uniqueId);
                    
                    if (isIndividuallyVerified || isRuleVerified) {
                        verifiedCount++;
                        // No deduction for verified items
                    } else {
                        // Half weight for unverified manual review items
                        const weight = (weights[incomplete.impact] || weights.moderate) * 0.5;
                        incompleteDeductions += weight;
                    }
                });
            });
            
            totalDeductions += incompleteDeductions;
            
            // Calculate score (0-100)
            if (totalPossible === 0) return {
                score: 100,
                deductions: 0,
                maxPossible: 0,
                verifiedCount: 0,
                totalManualReview: 0
            };
            
            // If there are no deductions (all violations fixed and all manual items verified), give perfect score
            if (totalDeductions === 0) {
                return {
                    score: 100,
                    deductions: 0,
                    maxPossible: totalPossible * weights.critical,
                    verifiedCount: verifiedCount,
                    totalManualReview: totalManualReview,
                    details: {
                        violations: results.violations.length,
                        incomplete: results.incomplete.length,
                        passes: results.passes.length
                    }
                };
            }
            
            const maxPossibleDeductions = totalPossible * weights.critical;
            const score = Math.max(0, Math.round(100 - (totalDeductions / maxPossibleDeductions) * 100));
            
            return {
                score: score,
                deductions: totalDeductions,
                maxPossible: maxPossibleDeductions,
                verifiedCount: verifiedCount,
                totalManualReview: totalManualReview,
                details: {
                    violations: results.violations.length,
                    incomplete: results.incomplete.length,
                    passes: results.passes.length
                }
            };
        },
        
        // Show error message
        showError: function(message) {
            const panel = document.getElementById('uw-a11y-panel');
            if (panel) {
                const content = panel.querySelector('#uw-a11y-content');
                content.innerHTML = `
                    <div class="uw-a11y-issue error" style="margin: 1rem;">
                        <h4>Error Loading Accessibility Checker</h4>
                        <p>${message}</p>
                        <p><strong>Suggestions:</strong></p>
                        <ul>
                            <li>Check your internet connection</li>
                            <li>Try refreshing the page and running the bookmarklet again</li>
                            <li>Ensure your browser allows loading external scripts</li>
                        </ul>
                    </div>
                `;
            }
        },
        
        // Create and show the results panel
        createPanel: function() {
            this.shadowRoot.innerHTML = `
                ${this.getStyles()}
                <div id="uw-a11y-panel">
                    <div id="uw-a11y-header">
                        <div class="uw-a11y-title-container">
                            <svg viewBox="0 0 404 404" fill="none" xmlns="http://www.w3.org/2000/svg" class="uw-a11y-logo">
                                <g filter="url(#filter0_d_1_19)">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M201 349C288.261 349 359 278.261 359 191C359 103.739 288.261 33 201 33C113.739 33 43 103.739 43 191C43 278.261 113.739 349 201 349ZM201 373C301.516 373 383 291.516 383 191C383 90.4842 301.516 9 201 9C100.484 9 19 90.4842 19 191C19 291.516 100.484 373 201 373Z" fill="url(#paint0_linear_1_19)"/>
                                </g>
                                <g filter="url(#filter1_d_1_19)">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M200.5 302C262.08 302 312 252.08 312 190.5C312 128.92 262.08 79 200.5 79C138.92 79 89 128.92 89 190.5C89 252.08 138.92 302 200.5 302ZM200.5 326C275.335 326 336 265.335 336 190.5C336 115.665 275.335 55 200.5 55C125.665 55 65 115.665 65 190.5C65 265.335 125.665 326 200.5 326Z" fill="url(#paint1_linear_1_19)"/>
                                </g>
                                <defs>
                                <filter id="filter0_d_1_19" x="0.4" y="0.4" width="403.2" height="403.2" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                                <feOffset dx="1" dy="11"/>
                                <feGaussianBlur stdDeviation="9.8"/>
                                <feComposite in2="hardAlpha" operator="out"/>
                                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0"/>
                                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1_19"/>
                                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1_19" result="shape"/>
                                </filter>
                                <filter id="filter1_d_1_19" x="46.4" y="46.4" width="310.2" height="310.2" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                                <feOffset dx="1" dy="11"/>
                                <feGaussianBlur stdDeviation="9.8"/>
                                <feComposite in2="hardAlpha" operator="out"/>
                                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0"/>
                                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1_19"/>
                                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1_19" result="shape"/>
                                </filter>
                                <linearGradient id="paint0_linear_1_19" x1="78.7712" y1="51.9816" x2="324.572" y2="313.9" gradientUnits="userSpaceOnUse">
                                <stop stop-color="#35CD9C"/>
                                <stop offset="0.465" stop-color="#43FFFC"/>
                                <stop offset="0.545" stop-color="#C2F6F9"/>
                                <stop offset="1" stop-color="#33BFF1"/>
                                </linearGradient>
                                <linearGradient id="paint1_linear_1_19" x1="109.5" y1="87" x2="292.5" y2="282" gradientUnits="userSpaceOnUse">
                                <stop stop-color="#35CD9C"/>
                                <stop offset="0.465" stop-color="#43FFFC"/>
                                <stop offset="0.545" stop-color="#C2F6F9"/>
                                <stop offset="1" stop-color="#33BFF1"/>
                                </linearGradient>
                                </defs>
                            </svg>
                            <h2>Pinpoint Accessibility Checker</h2>
                        </div>
                        <div class="uw-a11y-header-buttons">
                            <button id="uw-a11y-minimize" title="Minimize">−</button>
                            <button id="uw-a11y-close" title="Close">✕</button>
                        </div>
                    </div>
                    <div id="uw-a11y-content">
                        <div id="uw-a11y-summary"></div>
                        <div id="uw-a11y-results"></div>
                    </div>
                </div>
            `;
            
            // Add event listeners
            this.shadowRoot.getElementById('uw-a11y-close').onclick = () => this.remove();
            this.shadowRoot.getElementById('uw-a11y-minimize').onclick = () => this.toggleMinimize();
            
            return this.shadowRoot.getElementById('uw-a11y-panel');
        },
        
        // Get CSS styles as string for Shadow DOM
        getStyles: function() {
            return `<style>
                :host {
                    all: initial;
                    font-family: "Red Hat Display", "Red Hat Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                }
                

                #uw-a11y-panel {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    width: 450px;
                    max-height: 85vh;
                    background: rgba(255,255,255,0.8);
                    border: 1px solid rgba(255,255,255,0.85);
                    border-radius: 12px;
                    backdrop-filter: blur(12px);
                    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
                    z-index: 999999;
                    font-family: "Red Hat Display", "Red Hat Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    font-size: 14px;
                    overflow: hidden;
                    transition: all 0.3s ease;
                    
                }
                
                #uw-a11y-panel.minimized {
                    bottom: -1px;
                    top: auto;
                    right: 20px;
                    width: 400px;
                    max-height: 180px;
                    border-radius: 8px 8px 0 0;
                }

                
                
                #uw-a11y-panel.minimized #uw-a11y-content {
                    max-height: 120px;
                    padding: 8px 16px;
                    display: none;
                }
                
                #uw-a11y-panel.minimized #uw-a11y-results {
                    display: none;
                }
                
                #uw-a11y-panel.minimized .uw-a11y-score-container {
                    margin: 0.5rem 0;
                    padding: 0.5rem;
                }
                
                #uw-a11y-panel.minimized .uw-a11y-score-dial {
                    width: 60px;
                    height: 60px;
                }
                
                #uw-a11y-panel.minimized .uw-a11y-score-circle {
                    width: 60px;
                    height: 60px;
                }
                
                #uw-a11y-panel.minimized .uw-a11y-score-inner {
                    width: 45px;
                    height: 45px;
                }
                
                #uw-a11y-panel.minimized .uw-a11y-score-number {
                    font-size: 16px;
                }
                
                #uw-a11y-panel.minimized .uw-a11y-score-label {
                    font-size: 8px;
                }
                
                #uw-a11y-panel.minimized h3 {
                    font-size: 14px;
                    margin-bottom: 0.5rem;
                }
                
                #uw-a11y-panel.minimized #uw-a11y-minimize {
                    transform: rotate(180deg);
                }
                #uw-a11y-panel #uw-a11y-header {
                    
                    color: #000;
                    padding: 12px 16px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                                            cursor: default;
                }
                
                #uw-a11y-panel #uw-a11y-header:active {
                   
                }
                
                #uw-a11y-panel .uw-a11y-header-buttons {
                    display: flex;
                    gap: 8px;
                }
                #uw-a11y-panel .uw-a11y-title-container {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                #uw-a11y-panel .uw-a11y-logo {
                    width: 24px;
                    height: 24px;
                    flex-shrink: 0;
                }
                
                #uw-a11y-panel.minimized .uw-a11y-logo {
                    width: 18px;
                    height: 18px;
                }
                
                #uw-a11y-panel #uw-a11y-header h2 {
                    margin: 0;
                    font-size: 16px;
                    font-weight: bold;
                }
                #uw-a11y-panel #uw-a11y-close, #uw-a11y-panel #uw-a11y-minimize {
                    background: none;
                    border: none;
                    color: black;
                    font-size: 18px;
                    cursor: pointer;
                    padding: 0;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }
                
                #uw-a11y-panel #uw-a11y-close:hover, #uw-a11y-panel #uw-a11y-minimize:hover {
                    background: rgba(255,255,255,0.2);
                }
                
                #uw-a11y-panel #uw-a11y-close:focus, #uw-a11y-panel #uw-a11y-minimize:focus {
                    outline: 2px solid #007cba;
                    outline-offset: 2px;
                    background: rgba(255,255,255,0.3);
                }
                
                #uw-a11y-panel #uw-a11y-minimize {
                    font-size: 20px;
                    font-weight: bold;
                }
                #uw-a11y-panel #uw-a11y-content {
                    max-height: calc(85vh - 60px);
                    overflow-y: auto;
                    padding: 16px;
                }
                #uw-a11y-panel #uw-a11y-summary {
                    background: #f8f9fa;
                    border: 1px solid #dee2e6;
                    border-radius: 10px;
                    padding: 10px;
                    margin-bottom: 16px;
                    
                }
                #uw-a11y-panel .uw-a11y-issue {
                    margin-bottom: 18px;
                    padding: 12px;
                    border-left: 4px solid #ffc107;
                    background: #fff3cd;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    position: relative;
                    outline: none;
                    
                }
                
                /* Hover states for different issue types */
                #uw-a11y-panel .uw-a11y-issue:hover {
                    transform: translateY(-1px);
                    border-color: rgba(0,0,0,0.15);
                }
                
                #uw-a11y-panel .uw-a11y-issue.error:hover {
                    background: #f5c2c7;
                    box-shadow: 0 4px 20px 0 rgba(211, 23, 41, 0.35);
                    border-color: rgba(220, 53, 69, 0.3);
                }
                
                #uw-a11y-panel .uw-a11y-issue.warning:hover {
                    background: #F6EBC7;
                    box-shadow: 0 4px 20px 0 rgba(211, 133, 23, 0.35);
                    border-color: rgba(255, 193, 7, 0.4);
                }
                
                #uw-a11y-panel .uw-a11y-issue.info:hover {
                    background: #b8daff;
                    box-shadow: 0 4px 20px 0 rgba(23, 104, 211, 0.35);
                    border-color: rgba(23, 162, 184, 0.3);
                }
                
                /* Focus states for keyboard accessibility */
                #uw-a11y-panel .uw-a11y-issue:focus {
                    outline: 3px solid #007cba;
                    outline-offset: 2px;
                    transform: translateY(-1px);
                    z-index: 1;
                }
                
                #uw-a11y-panel .uw-a11y-issue.error:focus {
                    outline-color: #dc3545;
                    background: #f5c2c7;
                    box-shadow: 0 4px 20px 0 rgba(211, 23, 41, 0.35);
                }
                
                #uw-a11y-panel .uw-a11y-issue.warning:focus {
                    outline-color: #ffc107;
                    background: #F6EBC7;
                    box-shadow: 0 4px 20px 0 rgba(211, 133, 23, 0.35);
                }
                
                #uw-a11y-panel .uw-a11y-issue.info:focus {
                    outline-color: #17a2b8;
                    background: #b8daff;
                    box-shadow: 0 4px 20px 0 rgba(23, 104, 211, 0.35);
                }
                
                /* Active/pressed states */
                #uw-a11y-panel .uw-a11y-issue:active {
                    transform: translateY(0px);
                    transition: transform 0.1s ease;
                }
                
                /* Enhanced checked state hover */
                #uw-a11y-panel .uw-a11y-issue.checked:hover {
                    background: #c3e6cb !important;
                    transform: translateY(-1px);
                }
                
                #uw-a11y-panel .uw-a11y-issue.checked:focus {
                    outline-color: #28a745;
                    background: #c3e6cb !important;
                }
               #uw-a11y-panel .uw-a11y-issue.error {
                    border-left-color: #dc3545;
                    background: #f8d7da;
                    box-shadow: 0 2px 10px 0 rgba(211, 23, 41, 0.22);
                }
                #uw-a11y-panel .uw-a11y-issue.warning {
                    border-left-color: #ffc107;
                    background: #fff3cd;
                    box-shadow: 0 2px 10px 0 rgba(211, 133, 23, 0.22);
                }
                #uw-a11y-panel .uw-a11y-issue.info {
                    border-left-color: #17a2b8;
                    background: #d1ecf1;
                    box-shadow: 0 2px 10px 0 rgba(23, 104, 211, 0.22);
                }
                #uw-a11y-panel .uw-a11y-issue h4 {
                    margin: 0 0 8px 0;
                    font-size: 14px;
                    font-weight: bold;
                }
                 
                 #uw-a11y-panel .uw-a11y-issue-header {
                     display: flex;
                     align-items: center;
                     gap: 8px;
                 }
                 
                 #uw-a11y-panel .uw-a11y-issue-icon {
                     width: 16px;
                     height: 16px;
                     flex-shrink: 0;
                     align-self: flex-start;
                 }
                 
                 #uw-a11y-panel .uw-a11y-error-icon {
                     color: #dc3545;
                     margin-top: 2px;
                 }
                 
                 #uw-a11y-panel .uw-a11y-warning-icon {
                     color: #856404;
                     margin-top: 2px;
                 }
                 
                 #uw-a11y-panel .uw-a11y-issue.checked .uw-a11y-warning-icon {
                     color: #155724;
                 }
                 
                 #uw-a11y-panel .uw-a11y-issue-title {
                     flex: 1;
                 }
                #uw-a11y-panel .uw-a11y-issue p {
                    margin: 4px 0;
                    line-height: 1.4;
                }
                #uw-a11y-panel .uw-a11y-issue .issue-meta {
                    font-size: 12px;
                    color: #3c3c3c;
                    margin-top: 8px;
                    padding-top: 8px;
                    border-top: 1px solid rgba(0,0,0,0.1);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                #uw-a11y-panel .uw-a11y-issue .learn-more {
                    color: #c5050c;
                   
                    font-size: 12px;
                }
                #uw-a11y-panel .uw-a11y-issue .learn-more:hover {
                    text-decoration: underline;
                }

                #uw-a11y-panel .uw-a11y-issue.error .learn-more {
                    color: #dc3545;
                }

                #uw-a11y-panel .uw-a11y-issue.warning .learn-more {
                    color: #856404;
                }

                #uw-a11y-panel .uw-a11y-issue .how-to-fix {
                    margin-top: 8px;
                    border-radius: 4px;
                    background: rgb(241, 241, 241);
                    padding: 8px;
                    font-size: 13px;
                    color: #212529;
                    font-weight: 500;
                    border-left: 4px solid rgb(51, 141, 214);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                #uw-a11y-panel .uw-a11y-issue .how-to-fix-icon {
                    align-self: flex-start;
                    margin-top: 2px;
                }

                #uw-a11y-panel .uw-a11y-issue .how-to-fix-icon svg {
                    width: 12px;
                    height: 12px;
                }

                #uw-a11y-panel .uw-a11y-issue .how-to-fix svg path {
                    fill: rgb(51, 141, 214);
        }

                
                /* Note: .uw-a11y-highlight is applied to the main document, not shadow DOM */
                #uw-a11y-panel .uw-a11y-count {
                    font-weight: bold;
                    padding: 2px 8px;
                    border-radius: 12px;
                    color: white;
                    font-size: 12px;
                    margin-right: 8px;
                }
                #uw-a11y-panel .count-error { background: #dc3545; }
                #uw-a11y-panel .count-warning { background: #ffc107; color: #212529; }
                #uw-a11y-panel .count-info { background: #17a2b8; }
                #uw-a11y-panel .count-verified { background: #28a745; }
                #uw-a11y-panel .uw-a11y-manual-check {
                    margin: 8px 0;
                    padding: 8px;
                    background: #f8f9fa;
                    border-radius: 4px;
                    border: 1px solid #dee2e6;
                }
                #uw-a11y-panel .uw-a11y-checkbox {
                    display: flex;
                    align-items: center;
                    cursor: pointer;
                    font-size: 13px;
                }
                #uw-a11y-panel .uw-a11y-checkbox input[type="checkbox"] {
                    margin-right: 8px;
                    width: 16px;
                    height: 16px;
                }
                #uw-a11y-panel .uw-a11y-issue.checked {
                    opacity: 0.7;
                    background: #d4edda !important;
                    border-left-color: #28a745 !important;
                }
                #uw-a11y-panel .uw-a11y-issue.checked .uw-a11y-manual-check {
                    background: #d4edda;
                    border-color: #c3e6cb;
                }
                #uw-a11y-panel .uw-a11y-check-label {
                    color: #155724;
                    font-weight: 500;
                }
                #uw-a11y-panel .uw-a11y-spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #c5050c;
                    border-radius: 50%;
                    animation: uw-spin 1s linear infinite;
                    margin: 0 auto;
                }
                @keyframes uw-spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                #uw-a11y-panel .axe-summary {
                    font-size: 12px;
                    color: #666;
                    border-top: 1px solid #dee2e6;
                    padding-top: 12px;
                    margin-top: 12px;
                }
                #uw-a11y-panel .uw-a11y-score-container {
                    text-align: center;
                    margin: 1rem 0;
                    padding: 1rem;
                    background: #f8f9fa;
                    border-radius: 8px;
                    border: 2px solid #e9ecef;
                }
                #uw-a11y-panel .uw-a11y-score-dial {
                    position: relative;
                    width: 120px;
                    height: 120px;
                    margin: 0 auto 1rem auto;
                }
                #uw-a11y-panel .uw-a11y-score-circle {
                    width: 120px;
                    height: 120px;
                    border-radius: 50%;
                    background: conic-gradient(from 0deg, #28a745 0deg 0deg, #e9ecef 0deg 360deg);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                }
                #uw-a11y-panel .uw-a11y-score-inner {
                    width: 90px;
                    height: 90px;
                    background: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-direction: column;
                    font-weight: bold;
                }
                #uw-a11y-panel .uw-a11y-score-number {
                    font-size: 24px;
                    color: #333;
                }
                #uw-a11y-panel .uw-a11y-score-label {
                    font-size: 10px;
                    color: #666;
                    text-transform: uppercase;
                }
                #uw-a11y-panel .uw-a11y-details {
                    margin-top: 1rem;
                    padding: 0.5rem;
                    background: #f1f3f4;
                    border-left: 3px solid #007cba;
                    border-radius: 0 4px 4px 0;
                    font-size: 12px;
                    display: none;
                }
                #uw-a11y-panel .uw-a11y-details.expanded {
                    display: block;
                }
                #uw-a11y-panel .uw-a11y-details-toggle {
                    display: block;
                    background: rgba(0,0,0,0.12);
                    border: 1px solid rgba(0,0,0,0.3);
                    border-radius: 50rem;
                    padding: 4px 8px;
                    color:rgb(28, 28, 28);
                    cursor: pointer;
                    font-size: 12px;
                    text-decoration: none;
                    backdrop-filter: saturate(250%);
                    margin-top: 0.5rem;
                }

                #uw-a11y-panel .uw-a11y-details-toggle {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }


                #uw-a11y-panel .uw-a11y-details-toggle .technical-details-icon {
                    width: 12px;
                    height: 12px;
                }

                #uw-a11y-panel .uw-a11y-details-item {
                    margin: 0.5rem 0;
                    padding: 0.5rem;
                    background: white;
                    border-radius: 3px;
                }

                #uw-a11y-panel .uw-a11y-details-label {
                    font-weight: bold;
                    color: #495057;
                }
                #uw-a11y-panel .uw-a11y-details-value {
                    font-family: monospace;
                    background: #f8f9fa;
                    padding: 0.25rem;
                    border-radius: 2px;
                    margin-top: 0.25rem;
                    word-break: break-all;
                }
                #uw-a11y-panel .uw-a11y-instance-nav {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: -12px;
                    margin-left: -12px;
                    margin-right: -12px;
                    margin-bottom: 10px;
                    padding: 8px;
                    background: rgba(0,0,0,0.1);
                    backdrop-filter: saturate(200%);
                    border-top-right-radius: 4px;
                    font-size: 12px;
                }
                #uw-a11y-panel .uw-a11y-instance-count {
                    font-weight: bold;
                    color: #495057;
                }
                #uw-a11y-panel .uw-a11y-nav-buttons {
                    display: flex;
                    gap: 4px;
                }
                #uw-a11y-panel .uw-a11y-nav-buttons button {
                    background:rgba(0,0,0,0.4);
                    backdrop-filter: saturate(200%);
                    color: white;
                    border: none;
                    padding: 4px 8px;
                    border-radius: 3px;
                    font-size: 11px;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                #uw-a11y-panel .uw-a11y-nav-buttons button:hover:not(:disabled) {
                    background:rgba(0,0,0,0.4);
                }
                                        #uw-a11y-panel .uw-a11y-nav-buttons button:disabled {
                    background:rgba(0,0,0,0.1);
                    cursor: not-allowed;
                }
                
                #uw-a11y-panel .uw-a11y-nav-buttons button:focus {
                    outline: 2px solid #007cba;
                    outline-offset: 1px;
                }
                
                /* Details toggle button focus */
                #uw-a11y-panel .uw-a11y-details-toggle:focus {
                    outline: 2px solid #007cba;
                    outline-offset: 2px;
                    background: rgba(0,0,0,0.2);
                }
                
                /* Checkbox focus states */
                #uw-a11y-panel .uw-a11y-checkbox input[type="checkbox"]:focus {
                    outline: 2px solid #007cba;
                    outline-offset: 2px;
                }
                
                /* Learn more link focus */
                #uw-a11y-panel .uw-a11y-issue .learn-more:focus {
                    outline: 2px solid #007cba;
                    outline-offset: 2px;
                    text-decoration: underline;
                }
        
        #uw-a11y-panel .how-to-fix code {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 3px;
            padding: 2px 4px;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            font-size: 12px;
            color: #e83e8c;
            font-weight: 600;
            white-space: nowrap;
        }
        
        #uw-a11y-panel .how-to-fix code:not(:last-child) {
            margin-right: 2px;
        }
        </style>`;
        },
        
        addIssue: function(type, title, description, element, recommendation, helpUrl, impact, tags, detailedInfo, ruleId) {
            const issueId = this.issues.length; // Use array index as unique ID
            this.issues.push({
                id: issueId,
                type: type,
                title: title,
                description: description,
                element: element,
                recommendation: recommendation,
                helpUrl: helpUrl,
                impact: impact,
                tags: tags || [],
                detailedInfo: detailedInfo || [],
                ruleId: ruleId || title.toLowerCase().replace(/[^a-z0-9]/g, '-')
            });
        },
        
        displayResults: function() {
            const panel = this.createPanel();
            const summary = this.shadowRoot.getElementById('uw-a11y-summary');
            const results = this.shadowRoot.getElementById('uw-a11y-results');
            
            // Load minimize state after panel is created
            this.loadMinimizeState();
            
            // Count issues by type
            const counts = {
                error: this.issues.filter(i => i.type === 'error').length,
                warning: this.issues.filter(i => i.type === 'warning' && i.uniqueId).length, // Only count manual review items with uniqueId
                warningChecked: this.issues.filter(i => i.type === 'warning' && i.uniqueId && this.checkedItems.has(i.uniqueId)).length,
                info: this.issues.filter(i => i.type === 'info').length
            };
            
            // Get accessibility score
            const scoreData = this.axeResults ? this.axeResults.score : null;
            
            // Display summary with score dial
            summary.innerHTML = `
                ${scoreData ? this.renderScoreDial(scoreData) : ''}
                <h3>axe-core Accessibility Analysis</h3>
                <p><strong>Total Issues Found:</strong> ${this.issues.length}</p>
                                    <div style="margin: 8px 0;">
                        <span class="uw-a11y-count count-error">${counts.error}</span>Violations
                        <span class="uw-a11y-count count-warning">${counts.warning}</span>Manual Review
                        ${counts.warningChecked > 0 ? `<span class="uw-a11y-count count-verified">${counts.warningChecked}</span>Verified` : ''}
                    </div>
                <p><small>Click on any issue to highlight the element on the page.</small></p>
                ${this.axeResults ? `
                    <div class="axe-summary">
                        <!--<strong>Test Summary:</strong> ${this.axeResults.violations} violations, 
                        ${this.axeResults.passes} passes, ${this.axeResults.incomplete} need review, 
                        ${this.axeResults.inapplicable} not applicable<br>-->
                        <strong>Standard:</strong> WCAG 2.1 AA | <strong>Engine:</strong> axe-core | <strong>Checker:</strong> v${this.version}
                    </div>
                ` : ''}
            `;
            
            // Display issues
            if (this.issues.length === 0) {
                results.innerHTML = `
                    <div class="uw-a11y-issue info">
                        <h4>Excellent Accessibility!</h4>
                        <p>No accessibility violations detected by axe-core. Your page meets WCAG 2.1 AA automated testing standards.</p>
                        <p><strong>Next Steps:</strong> Consider manual testing with screen readers and keyboard navigation for complete accessibility validation.</p>
                    </div>
                `;
            } else {
                // Group issues by rule for better organization
                const groupedIssues = this.groupIssuesByRule(this.issues);
                
                results.innerHTML = Object.keys(groupedIssues).map(ruleId => {
                    const issueGroup = groupedIssues[ruleId];
                    const firstIssue = issueGroup[0];
                    const isManualReview = firstIssue.type === 'warning' && firstIssue.uniqueId;
                    

                    
                    // Create navigation for multiple instances
                    const instanceNavigation = issueGroup.length > 1 ? `
                        <div class="uw-a11y-instance-nav">
                            <span class="uw-a11y-instance-count">Instance <span id="current-${this.sanitizeHtmlId(ruleId)}">1</span> of ${issueGroup.length}</span>
                            <div class="uw-a11y-nav-buttons">
                                <button onclick="window.uwAccessibilityChecker.navigateInstance('${this.escapeJavaScript(ruleId)}', -1); event.stopPropagation();" 
                                        id="prev-${this.sanitizeHtmlId(ruleId)}" disabled>‹ Prev</button>
                                <button onclick="window.uwAccessibilityChecker.navigateInstance('${this.escapeJavaScript(ruleId)}', 1); event.stopPropagation();" 
                                        id="next-${this.sanitizeHtmlId(ruleId)}">Next ›</button>
                            </div>
                        </div>
                    ` : '';
                    
                    // Create checkbox for manual review items (affects all instances of this rule)
                    const checkboxHtml = isManualReview ? 
                        `<div class="uw-a11y-manual-check">
                            <label class="uw-a11y-checkbox">
                                <input type="checkbox" 
                                       id="check-${this.sanitizeHtmlId(ruleId)}" 
                                       ${this.isRuleVerified(ruleId) ? 'checked' : ''}
                                       onchange="window.uwAccessibilityChecker.toggleRuleVerification('${this.escapeJavaScript(ruleId)}'); event.stopPropagation();">
                                <span class="uw-a11y-checkmark"></span>
                                <span class="uw-a11y-check-label">
                                    ${this.isRuleVerified(ruleId) ? `All ${issueGroup.length} instances manually verified ✓` : `Mark all ${issueGroup.length} instances as verified`}
                                </span>
                            </label>
                        </div>` : '';

                    const iconSvg = firstIssue.type === 'error' 
                        ? `<svg class="uw-a11y-issue-icon uw-a11y-error-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                           </svg>`
                        : `<svg class="uw-a11y-issue-icon uw-a11y-warning-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                           </svg>`;
                    
                    return `
                        <div class="uw-a11y-issue ${firstIssue.type} ${isManualReview && this.isRuleVerified(ruleId) ? 'checked' : ''}" 
                             onclick="window.uwAccessibilityChecker.highlightCurrentInstance('${this.escapeJavaScript(ruleId)}')" 
                             onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();window.uwAccessibilityChecker.highlightCurrentInstance('${this.escapeJavaScript(ruleId)}');}"
                             tabindex="0"
                             role="button" 
                             aria-label="Click to highlight ${this.escapeHtmlAttribute(firstIssue.title)} on the page${issueGroup.length > 1 ? ` (${issueGroup.length} instances)` : ''}"
                             id="issue-${this.sanitizeHtmlId(ruleId)}">
                             ${instanceNavigation}
                            <h4>
                                <span class="uw-a11y-issue-header">
                                    ${iconSvg}
                                    <span class="uw-a11y-issue-title">${this.escapeHtmlContent(firstIssue.title)} ${issueGroup.length > 1 ? `(${issueGroup.length} instances)` : ''}</span>
                                </span>
                            </h4>
                            <!--<p id="description-${this.sanitizeHtmlId(ruleId)}">${this.escapeHtmlContent(firstIssue.description.split('\n')[0])}</p>-->
                            <div class="how-to-fix"><div class="how-to-fix-icon"><svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="M331.8 224.1c28.29 0 54.88 10.99 74.86 30.97l19.59 19.59c40.01-17.74 71.25-53.3 81.62-96.65c5.725-23.92 5.34-47.08 .2148-68.4c-2.613-10.88-16.43-14.51-24.34-6.604l-68.9 68.9h-75.6V97.2l68.9-68.9c7.912-7.912 4.275-21.73-6.604-24.34c-21.32-5.125-44.48-5.51-68.4 .2148c-55.3 13.23-98.39 60.22-107.2 116.4C224.5 128.9 224.2 137 224.3 145l82.78 82.86C315.2 225.1 323.5 224.1 331.8 224.1zM384 278.6c-23.16-23.16-57.57-27.57-85.39-13.9L191.1 158L191.1 95.99l-127.1-95.99L0 63.1l96 127.1l62.04 .0077l106.7 106.6c-13.67 27.82-9.251 62.23 13.91 85.39l117 117.1c14.62 14.5 38.21 14.5 52.71-.0016l52.75-52.75c14.5-14.5 14.5-38.08-.0016-52.71L384 278.6zM227.9 307L168.7 247.9l-148.9 148.9c-26.37 26.37-26.37 69.08 0 95.45C32.96 505.4 50.21 512 67.5 512s34.54-6.592 47.72-19.78l119.1-119.1C225.5 352.3 222.6 329.4 227.9 307zM64 472c-13.25 0-24-10.75-24-24c0-13.26 10.75-24 24-24S88 434.7 88 448C88 461.3 77.25 472 64 472z"/></svg></div><div><strong>How to fix:</strong> <span id="recommendation-${this.sanitizeHtmlId(ruleId)}"></span></div></div>
                            
                            ${checkboxHtml}
                            ${firstIssue.detailedInfo && firstIssue.detailedInfo.length > 0 ? `
                                <button class="uw-a11y-details-toggle" onclick="window.uwAccessibilityChecker.toggleDetails('${this.escapeJavaScript(ruleId)}'); event.stopPropagation();">
                                   <div class="technical-details-icon"><svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg"><title/><g><path d="M24.8452,25.3957a6.0129,6.0129,0,0,0-8.4487.7617L1.3974,44.1563a5.9844,5.9844,0,0,0,0,7.687L16.3965,69.8422a5.9983,5.9983,0,1,0,9.21-7.687L13.8068,48l11.8-14.1554A6,6,0,0,0,24.8452,25.3957Z"/><path d="M55.1714,12.1192A6.0558,6.0558,0,0,0,48.1172,16.83L36.1179,76.8262A5.9847,5.9847,0,0,0,40.8286,83.88a5.7059,5.7059,0,0,0,1.1835.1172A5.9949,5.9949,0,0,0,47.8828,79.17L59.8821,19.1735A5.9848,5.9848,0,0,0,55.1714,12.1192Z"/><path d="M94.6026,44.1563,79.6035,26.1574a5.9983,5.9983,0,1,0-9.21,7.687L82.1932,48l-11.8,14.1554a5.9983,5.9983,0,1,0,9.21,7.687L94.6026,51.8433A5.9844,5.9844,0,0,0,94.6026,44.1563Z"/></g></svg></div>Show technical details
                                </button>
                                <div class="uw-a11y-details" id="details-${this.sanitizeHtmlId(ruleId)}">
                                    <div id="detailed-content-${this.sanitizeHtmlId(ruleId)}">
                                        ${this.renderDetailedInfo(firstIssue.detailedInfo)}
                                    </div>
                                </div>
                            ` : ''}
                            <div class="issue-meta">
                                <div><strong>Impact:</strong> ${this.escapeHtmlContent(firstIssue.impact || 'unknown')}
                                
                                </div>
                                <!--<strong>Tags:</strong> ${firstIssue.tags.join(', ')}-->
                                ${firstIssue.helpUrl ? `<br><a href="${this.escapeUrl(firstIssue.helpUrl)}" target="_blank" class="learn-more">Learn more about this rule</a>` : ''}
                            </div>
                        </div>
                    `;
                }).join('');
                
                // Initialize recommendation content after HTML is created
                Object.keys(groupedIssues).forEach(ruleId => {
                    const issueGroup = groupedIssues[ruleId];
                    const firstIssue = issueGroup[0];
                    const recElement = this.shadowRoot.getElementById(`recommendation-${ruleId}`);
                    if (recElement) {
                        recElement.innerHTML = firstIssue.recommendation;
                    }
                });
            }
        },
        

        
        // Render the accessibility score dial
        renderScoreDial: function(scoreData) {
            const score = scoreData.score;
            const percentage = (score / 100) * 360; // Convert to degrees
            const color = score >= 90 ? '#28a745' : score >= 70 ? '#ffc107' : score >= 50 ? '#fd7e14' : '#dc3545';
            
            return `
                <div class="uw-a11y-score-container">
                    <div class="uw-a11y-score-dial">
                        <div class="uw-a11y-score-circle" style="background: conic-gradient(from 0deg, ${color} 0deg ${percentage}deg, #e9ecef ${percentage}deg 360deg);">
                            <div class="uw-a11y-score-inner">
                                <div class="uw-a11y-score-number">${score}</div>
                                <div class="uw-a11y-score-label">Score</div>
                            </div>
                        </div>
                    </div>
                    <div style="font-size: 14px;">
                        <span style="font-size: 12px; color: #666;">
                            ${score >= 97 ? 'Excellent' : 
                              score >= 90 ? 'Very Good - just a few issues to address' : 
                              score >= 70 ? 'Good accessibility with room for improvement' : 
                              score >= 50 ? 'Fair accessibility - several issues to address' : 
                              'Immediate attention needed'}
                        </span>
                    </div>
                </div>
            `;
        },
        
        // Render detailed technical information
        renderDetailedInfo: function(detailedInfo) {
            return detailedInfo.map(detail => {
                let value = detail.value;
                
                // Special formatting for different types
                if (detail.type === 'colors' && typeof value === 'object') {
                    value = `
                        <div style="margin: 0.5rem 0;">
                            <div><strong>Foreground:</strong> <span style="background: ${value.foreground}; color: white; padding: 2px 6px; border-radius: 2px;">${value.foreground}</span></div>
                            <div><strong>Background:</strong> <span style="background: ${value.background}; border: 1px solid #ccc; padding: 2px 6px; border-radius: 2px;">${value.background}</span></div>
                            <div><strong>Contrast Ratio:</strong> ${value.contrast}</div>
                            <div><strong>Requirement:</strong> ${value.required}</div>
                        </div>
                    `;
                }
                
                return `
                    <div class="uw-a11y-details-item">
                        <div class="uw-a11y-details-label">${detail.label}:</div>
                        <div class="uw-a11y-details-value">${value}</div>
                    </div>
                `;
            }).join('');
        },
        
        // Group issues by rule ID for better organization
        groupIssuesByRule: function(issues) {
            const grouped = {};
            issues.forEach(issue => {
                // Create a unique key that includes both rule ID and issue type
                // This ensures errors and warnings are grouped separately
                const ruleId = issue.ruleId || issue.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
                const groupKey = `${ruleId}-${issue.type}`;
                
                if (!grouped[groupKey]) {
                    grouped[groupKey] = [];
                }
                grouped[groupKey].push(issue);
            });
            return grouped;
        },

        // Initialize current instance tracking
        currentInstances: {},

        // Navigate between instances of the same rule
        navigateInstance: function(ruleId, direction) {
            if (!this.currentInstances[ruleId]) {
                this.currentInstances[ruleId] = 0;
            }
            
            const groupedIssues = this.groupIssuesByRule(this.issues);
            const issueGroup = groupedIssues[ruleId];
            
            if (!issueGroup) return;
            
            const currentIndex = this.currentInstances[ruleId];
            const newIndex = currentIndex + direction;
            
            if (newIndex >= 0 && newIndex < issueGroup.length) {
                this.currentInstances[ruleId] = newIndex;
                this.updateInstanceDisplay(ruleId, issueGroup);
                this.highlightCurrentInstance(ruleId);
            }
        },

        // Update the display for the current instance
        updateInstanceDisplay: function(ruleId, issueGroup) {
            const currentIndex = this.currentInstances[ruleId] || 0;
            const currentIssue = issueGroup[currentIndex];
            const sanitizedRuleId = this.sanitizeHtmlId(ruleId);
            
            // Update displayed content
            const descElement = this.shadowRoot.getElementById(`description-${sanitizedRuleId}`);
            const recElement = this.shadowRoot.getElementById(`recommendation-${sanitizedRuleId}`);
            const currentSpan = this.shadowRoot.getElementById(`current-${sanitizedRuleId}`);
            const detailedContent = this.shadowRoot.getElementById(`detailed-content-${sanitizedRuleId}`);
            
            if (descElement) descElement.textContent = currentIssue.description.split('\n')[0];
            if (recElement) recElement.innerHTML = currentIssue.recommendation;
            if (currentSpan) currentSpan.textContent = currentIndex + 1;
            if (detailedContent && currentIssue.detailedInfo) {
                detailedContent.innerHTML = this.renderDetailedInfo(currentIssue.detailedInfo);
            }
            
            // Update navigation buttons
            const prevBtn = this.shadowRoot.getElementById(`prev-${sanitizedRuleId}`);
            const nextBtn = this.shadowRoot.getElementById(`next-${sanitizedRuleId}`);
            
            if (prevBtn) prevBtn.disabled = currentIndex === 0;
            if (nextBtn) nextBtn.disabled = currentIndex === issueGroup.length - 1;
        },

        // Highlight the current instance of a rule
        highlightCurrentInstance: function(ruleId) {
            // Remove previous highlights
            document.querySelectorAll('.uw-a11y-highlight').forEach(el => {
                el.classList.remove('uw-a11y-highlight');
            });
            
            const groupedIssues = this.groupIssuesByRule(this.issues);
            const issueGroup = groupedIssues[ruleId];
            
            if (!issueGroup) return;
            
            const currentIndex = this.currentInstances[ruleId] || 0;
            const currentIssue = issueGroup[currentIndex];
            
            if (currentIssue.element) {
                currentIssue.element.classList.add('uw-a11y-highlight');
                currentIssue.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Remove highlight after 3 seconds
                setTimeout(() => {
                    if (currentIssue.element) {
                        currentIssue.element.classList.remove('uw-a11y-highlight');
                    }
                }, 3000);
            }
        },

        // Check if all instances of a rule are verified
        isRuleVerified: function(ruleId) {
            const groupedIssues = this.groupIssuesByRule(this.issues);
            const issueGroup = groupedIssues[ruleId];
            
            if (!issueGroup) return false;
            
            return issueGroup.every(issue => 
                issue.uniqueId && this.checkedItems.has(issue.uniqueId)
            );
        },

        // Toggle verification for all instances of a rule
        toggleRuleVerification: function(ruleId) {
            const groupedIssues = this.groupIssuesByRule(this.issues);
            const issueGroup = groupedIssues[ruleId];
            
            if (!issueGroup) return;
            
            const isCurrentlyVerified = this.isRuleVerified(ruleId);
            
            issueGroup.forEach(issue => {
                if (issue.uniqueId) {
                    if (isCurrentlyVerified) {
                        this.checkedItems.delete(issue.uniqueId);
                    } else {
                        this.checkedItems.add(issue.uniqueId);
                    }
                }
            });
            
            // Update the UI
            const sanitizedRuleId = this.sanitizeHtmlId(ruleId);
            const checkbox = this.shadowRoot.getElementById(`check-${sanitizedRuleId}`);
            const label = checkbox?.parentNode.querySelector('.uw-a11y-check-label');
            const issueDiv = this.shadowRoot.getElementById(`issue-${sanitizedRuleId}`);
            
            const newVerificationState = this.isRuleVerified(ruleId);
            
            if (checkbox) checkbox.checked = newVerificationState;
            if (label) {
                label.textContent = newVerificationState 
                    ? `All ${issueGroup.length} instances manually verified ✓` 
                    : `Mark all ${issueGroup.length} instances as verified`;
            }
            if (issueDiv) {
                if (newVerificationState) {
                    issueDiv.classList.add('checked');
                } else {
                    issueDiv.classList.remove('checked');
                }
            }
            
            // Update score and save state
            this.updateScore();
            sessionStorage.setItem('uw-a11y-checked', JSON.stringify(Array.from(this.checkedItems)));
        },

        // Toggle detailed information display
        toggleDetails: function(ruleId) {
            const sanitizedRuleId = this.sanitizeHtmlId(ruleId);
            const detailsElement = this.shadowRoot.getElementById(`details-${sanitizedRuleId}`);
            const button = detailsElement.previousElementSibling;
            
            if (detailsElement.classList.contains('expanded')) {
                detailsElement.classList.remove('expanded');
                // Update only the text portion, preserving the icon
                this.updateButtonText(button, 'Show technical details');
            } else {
                detailsElement.classList.add('expanded');
                // Update only the text portion, preserving the icon
                this.updateButtonText(button, 'Hide technical details');
            }
        },
        
        // Helper function to update button text while preserving icon
        updateButtonText: function(button, newText) {
            // Find the text node in the button (it's the last child that's a text node)
            const childNodes = button.childNodes;
            for (let i = childNodes.length - 1; i >= 0; i--) {
                const node = childNodes[i];
                if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
                    node.textContent = newText;
                    return;
                }
            }
            
            // If no text node found, append the text (fallback)
            button.appendChild(document.createTextNode(newText));
        },

        // Toggle manual verification checkbox
        toggleManualCheck: function(uniqueId) {
            if (this.checkedItems.has(uniqueId)) {
                this.checkedItems.delete(uniqueId);
            } else {
                this.checkedItems.add(uniqueId);
            }
            
            // Update the label text
            const checkbox = this.shadowRoot.getElementById(`check-${uniqueId}`);
            const label = checkbox.parentNode.querySelector('.uw-a11y-check-label');
            const issueDiv = checkbox.closest('.uw-a11y-issue');
            
            if (this.checkedItems.has(uniqueId)) {
                label.textContent = 'Manually verified ✓';
                issueDiv.classList.add('checked');
            } else {
                label.textContent = 'Mark as manually verified';
                issueDiv.classList.remove('checked');
            }
            
            // Recalculate and update the score
            this.updateScore();
            
            // Store in sessionStorage for persistence during the session
            sessionStorage.setItem('uw-a11y-checked', JSON.stringify(Array.from(this.checkedItems)));
        },

        // Update the accessibility score display
        updateScore: function() {
            if (!this.filteredAxeResults) return;
            
            const newScore = this.calculateAccessibilityScore(this.filteredAxeResults);
            this.axeResults.score = newScore;
            
            // Update the score display
            const scoreNumber = this.shadowRoot.querySelector('.uw-a11y-score-number');
            const scoreCircle = this.shadowRoot.querySelector('.uw-a11y-score-circle');
            
            if (scoreNumber && scoreCircle) {
                scoreNumber.textContent = newScore.score;
                
                // Update color based on score
                const score = newScore.score;
                const color = score >= 90 ? '#28a745' : score >= 70 ? '#ffc107' : score >= 50 ? '#fd7e14' : '#dc3545';
                const percentage = (score / 100) * 360;
                scoreCircle.style.background = `conic-gradient(from 0deg, ${color} 0deg ${percentage}deg, #e9ecef ${percentage}deg 360deg)`;
            }
            
            // Update the counts
            const counts = {
                error: this.issues.filter(i => i.type === 'error').length,
                warning: this.issues.filter(i => i.type === 'warning' && i.uniqueId).length, // Only count manual review items with uniqueId
                warningChecked: this.issues.filter(i => i.type === 'warning' && i.uniqueId && this.checkedItems.has(i.uniqueId)).length
            };
            
            // Update count display
            const summaryDiv = this.shadowRoot.getElementById('uw-a11y-summary');
            if (summaryDiv) {
                const countDisplay = summaryDiv.querySelector('div[style*="margin: 8px 0"]');
                if (countDisplay) {
                    countDisplay.innerHTML = `
                        <span class="uw-a11y-count count-error">${counts.error}</span>Violations
                        <span class="uw-a11y-count count-warning">${counts.warning}</span>Manual Review
                        ${counts.warningChecked > 0 ? `<span class="uw-a11y-count count-verified">${counts.warningChecked}</span>Verified` : ''}
                    `;
                }
            }
        },

        // Load checked items from sessionStorage
        loadCheckedItems: function() {
            try {
                const stored = sessionStorage.getItem('uw-a11y-checked');
                if (stored) {
                    this.checkedItems = new Set(JSON.parse(stored));
                }
            } catch (e) {
                console.warn('Could not load checked items from sessionStorage:', e);
            }
        },

        // Toggle minimize state
        toggleMinimize: function() {
            const panel = this.shadowRoot.getElementById('uw-a11y-panel');
            const minimizeBtn = this.shadowRoot.getElementById('uw-a11y-minimize');
            
            if (!panel || !minimizeBtn) return;
            
            this.isMinimized = !this.isMinimized;
            
            if (this.isMinimized) {
                panel.classList.add('minimized');
                minimizeBtn.textContent = '+';
                minimizeBtn.title = 'Restore';
            } else {
                panel.classList.remove('minimized');
                minimizeBtn.textContent = '−';
                minimizeBtn.title = 'Minimize';
            }
            
            // Store minimize state in sessionStorage
            sessionStorage.setItem('uw-a11y-minimized', this.isMinimized);
        },

        // Load minimize state from sessionStorage
        loadMinimizeState: function() {
            try {
                const stored = sessionStorage.getItem('uw-a11y-minimized');
                if (stored === 'true') {
                    // Delay to ensure DOM is ready
                    setTimeout(() => {
                        this.toggleMinimize();
                    }, 100);
                }
            } catch (e) {
                console.warn('Could not load minimize state from sessionStorage:', e);
            }
        },

        // Check for updates
        checkForUpdates: function() {
            // Only check once per session to avoid spam
            if (sessionStorage.getItem('uw-a11y-update-checked')) {
                return;
            }
            
            sessionStorage.setItem('uw-a11y-update-checked', 'true');
            
            // Fetch latest version info from GitHub
            fetch('https://api.github.com/repos/althe3rd/Pinpoint/releases/latest')
                .then(response => response.json())
                .then(data => {
                    const latestVersion = data.tag_name.replace('v', '');
                    console.log('Update check - Latest:', latestVersion, 'Current:', this.version, 'Comparison:', this.compareVersions(latestVersion, this.version));
                    if (this.compareVersions(latestVersion, this.version) > 0) {
                        this.showUpdateNotification(latestVersion, data.html_url);
                    }
                })
                .catch(error => {
                    // Silently fail - don't bother users with update check errors
                    console.log('Update check failed:', error);
                });
        },

        // Compare version strings (returns 1 if a > b, -1 if a < b, 0 if equal)
        compareVersions: function(a, b) {
            const partsA = a.split('.').map(Number);
            const partsB = b.split('.').map(Number);
            
            for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
                const partA = partsA[i] || 0;
                const partB = partsB[i] || 0;
                
                if (partA > partB) return 1;
                if (partA < partB) return -1;
            }
            return 0;
        },

        // Show update notification
        showUpdateNotification: function(newVersion, releaseUrl) {
            const notification = document.createElement('div');
            notification.id = 'uw-a11y-update-notification';
            notification.innerHTML = `
                <div style="background: #56ab30; color: white; padding: 12px; border-radius: 4px; margin-bottom: 10px; font-size: 13px; position: relative;">
                    <button onclick="this.parentElement.parentElement.style.display='none'" 
                            style="position: absolute; top: 8px; right: 8px; background: none; border: none; color: white; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; opacity: 0.8; transition: opacity 0.2s;"
                            onmouseover="this.style.opacity='1'; this.style.backgroundColor='rgba(255,255,255,0.2)'"
                            onmouseout="this.style.opacity='0.8'; this.style.backgroundColor='transparent'">
                        ✕
                    </button>
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink: 0;">
                            <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
                            <circle cx="12" cy="12" r="1" fill="currentColor"/>
                        </svg>
                        <h3 style="font-size: 14px; margin: 0; font-weight: 700;">Update Available</h3>
                    </div>
                    <div style="margin-bottom: 8px;">v${this.version} → v${newVersion}</div>
                    <div style="display: flex; flex-wrap: wrap; gap: 16px;">
                        <a href="${releaseUrl}" target="_blank" style="color: #ffffff; text-decoration: underline; font-size: 12px;">
                            View release notes →
                        </a>
                        <a href="https://althe3rd.github.io/Pinpoint/" target="_blank" style="color: #ffffff; text-decoration: underline; font-size: 12px;">
                            Get latest bookmarklet →
                        </a>
                    </div>
                </div>
            `;
            
            // Insert at the top of the summary section
            setTimeout(() => {
                const summary = this.shadowRoot?.getElementById('uw-a11y-summary');
                if (summary) {
                    summary.insertBefore(notification, summary.firstChild);
                }
            }, 500);
        },


        
        remove: function() {
            // Remove the shadow DOM container
            const container = document.getElementById('uw-a11y-container');
            if (container) container.remove();
            
            // Remove global styles
            const globalStyles = document.getElementById('uw-a11y-global-styles');
            if (globalStyles) globalStyles.remove();
            
            // Remove highlights from the main document
            document.querySelectorAll('.uw-a11y-highlight').forEach(el => {
                el.classList.remove('uw-a11y-highlight');
            });
            
            delete window.uwAccessibilityChecker;
        },

        // Debug method to trigger update notification
        debugShowUpdateNotification: function() {
            this.showUpdateNotification('1.5.0', 'https://github.com/althe3rd/Pinpoint/releases/tag/v1.5.0');
        }
    };
    
    // Initialize the accessibility checker
    window.uwAccessibilityChecker.init();
})(); 