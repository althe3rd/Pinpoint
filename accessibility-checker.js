(function() {
    'use strict';
    
    // Prevent multiple instances
    if (window.uwAccessibilityChecker) {
        window.uwAccessibilityChecker.remove();
        return;
    }
    
            // Main accessibility checker object
        window.uwAccessibilityChecker = {
            version: '1.3.1', // Current version
            issues: [],
            axeLoaded: false,
            checkedItems: new Set(), // Track manually verified items
            isMinimized: false, // Track minimized state
        
        // Initialize the checker
        init: function() {
            this.checkForUpdates();
            this.showLoadingPanel();
            this.loadAxeCore();
        },
        
        // Show loading panel while axe-core loads
        showLoadingPanel: function() {
            const panel = document.createElement('div');
            panel.id = 'uw-a11y-panel';
            panel.innerHTML = `
                <div id="uw-a11y-header">
                    <h2>Pinpoint Accessibility Checker</h2>
                    <button id="uw-a11y-close">✕</button>
                </div>
                <div id="uw-a11y-content">
                    <div style="text-align: center; padding: 2rem;">
                        <div class="uw-a11y-spinner"></div>
                        <p style="margin-top: 1rem;">Loading axe-core accessibility engine...</p>
                        <p style="font-size: 0.9rem; color: #666;">This may take a few seconds on first use.</p>
                    </div>
                </div>
            `;
            
            this.addStyles();
            document.body.appendChild(panel);
            
            // Add event listeners
            document.getElementById('uw-a11y-close').onclick = () => this.remove();
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
                    'region': { enabled: false }
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
                        this.buildRecommendation(violation),
                        violation.helpUrl,
                        violation.impact || 'serious',
                        violation.tags,
                        this.buildDetailedInfo(violation, node),
                        violation.id
                    );
                });
            });
            
                    // Process incomplete items (warnings) with unique IDs for tracking
        results.incomplete.forEach((incomplete, incompleteIndex) => {
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
                    this.buildRecommendation(incomplete),
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
        buildRecommendation: function(rule) {
            if (rule.help) {
                return rule.help;
            }
            return 'Please refer to the help documentation for specific guidance on fixing this issue.';
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
                const fgColor = styles.color;
                const bgColor = styles.backgroundColor;
                
                // Calculate contrast ratio if possible
                const contrast = this.calculateContrastRatio(fgColor, bgColor);
                
                return {
                    foreground: fgColor,
                    background: bgColor,
                    contrast: contrast ? contrast.toFixed(2) + ':1' : 'Unable to calculate',
                    required: 'WCAG AA requires 4.5:1 for normal text, 3:1 for large text'
                };
            } catch (e) {
                return null;
            }
        },
        
        // Simple contrast ratio calculation
        calculateContrastRatio: function(fg, bg) {
            try {
                // This is a simplified version - in practice you'd want a more robust color parser
                const fgLuminance = this.getLuminance(fg);
                const bgLuminance = this.getLuminance(bg);
                
                if (fgLuminance === null || bgLuminance === null) return null;
                
                const lighter = Math.max(fgLuminance, bgLuminance);
                const darker = Math.min(fgLuminance, bgLuminance);
                
                return (lighter + 0.05) / (darker + 0.05);
            } catch (e) {
                return null;
            }
        },
        
        // Get relative luminance (simplified)
        getLuminance: function(color) {
            // This is a very simplified version - would need more robust color parsing for production
            try {
                if (color.startsWith('rgb')) {
                    const values = color.match(/\d+/g);
                    if (values && values.length >= 3) {
                        const r = parseInt(values[0]) / 255;
                        const g = parseInt(values[1]) / 255;
                        const b = parseInt(values[2]) / 255;
                        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
                    }
                }
            } catch (e) {
                // Return null if calculation fails
            }
            return null;
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
                    
                    // If item is manually verified, don't count it as a deduction
                    if (this.checkedItems && this.checkedItems.has(uniqueId)) {
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
            let panel = document.getElementById('uw-a11y-panel');
            if (!panel) {
                panel = document.createElement('div');
                panel.id = 'uw-a11y-panel';
                document.body.appendChild(panel);
            }
            
            panel.innerHTML = `
                <div id="uw-a11y-header">
                    <h2>Pinpoint Accessibility Checker</h2>
                    <div class="uw-a11y-header-buttons">
                        <button id="uw-a11y-minimize" title="Minimize">−</button>
                        <button id="uw-a11y-close" title="Close">✕</button>
                    </div>
                </div>
                <div id="uw-a11y-content">
                    <div id="uw-a11y-summary"></div>
                    <div id="uw-a11y-results"></div>
                </div>
            `;
            
            // Add event listeners
            document.getElementById('uw-a11y-close').onclick = () => this.remove();
            document.getElementById('uw-a11y-minimize').onclick = () => this.toggleMinimize();
            
            return panel;
        },
        
        // Add CSS styles
        addStyles: function() {
            if (document.getElementById('uw-a11y-styles')) return;
            
            const style = document.createElement('style');
            style.id = 'uw-a11y-styles';
            style.textContent = `
                body #uw-a11y-panel {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    width: 450px;
                    max-height: 85vh;
                    background: #ffffff;
                    border: 3px solid #c5050c;
                    border-radius: 8px;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
                    z-index: 999999;
                    font-family: Arial, sans-serif;
                    font-size: 14px;
                    overflow: hidden;
                    transition: all 0.3s ease;
                }
                
                body #uw-a11y-panel.minimized {
                    bottom: 0px;
                    top: auto;
                    right: 20px;
                    width: 400px;
                    max-height: 180px;
                    border-radius: 8px 8px 0 0;
                }
                
                body #uw-a11y-panel.minimized #uw-a11y-content {
                    max-height: 120px;
                    padding: 8px 16px;
                    display: none;
                }
                
                body #uw-a11y-panel.minimized #uw-a11y-results {
                    display: none;
                }
                
                body #uw-a11y-panel.minimized .uw-a11y-score-container {
                    margin: 0.5rem 0;
                    padding: 0.5rem;
                }
                
                body #uw-a11y-panel.minimized .uw-a11y-score-dial {
                    width: 60px;
                    height: 60px;
                }
                
                body #uw-a11y-panel.minimized .uw-a11y-score-circle {
                    width: 60px;
                    height: 60px;
                }
                
                body #uw-a11y-panel.minimized .uw-a11y-score-inner {
                    width: 45px;
                    height: 45px;
                }
                
                body #uw-a11y-panel.minimized .uw-a11y-score-number {
                    font-size: 16px;
                }
                
                body #uw-a11y-panel.minimized .uw-a11y-score-label {
                    font-size: 8px;
                }
                
                body #uw-a11y-panel.minimized h3 {
                    font-size: 14px;
                    margin-bottom: 0.5rem;
                }
                
                body #uw-a11y-panel.minimized #uw-a11y-minimize {
                    transform: rotate(180deg);
                }
                body #uw-a11y-panel #uw-a11y-header {
                    background: #c5050c;
                    color: white;
                    padding: 12px 16px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                                            cursor: default;
                }
                
                body #uw-a11y-panel #uw-a11y-header:active {
                   
                }
                
                body #uw-a11y-panel .uw-a11y-header-buttons {
                    display: flex;
                    gap: 8px;
                }
                body #uw-a11y-panel #uw-a11y-header h2 {
                    margin: 0;
                    font-size: 16px;
                    font-weight: bold;
                }
                body #uw-a11y-panel #uw-a11y-close, body #uw-a11y-panel #uw-a11y-minimize {
                    background: none;
                    border: none;
                    color: white;
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
                
                body #uw-a11y-panel #uw-a11y-close:hover, body #uw-a11y-panel #uw-a11y-minimize:hover {
                    background: rgba(255,255,255,0.2);
                }
                
                body #uw-a11y-panel #uw-a11y-minimize {
                    font-size: 20px;
                    font-weight: bold;
                }
                body #uw-a11y-panel #uw-a11y-content {
                    max-height: calc(85vh - 60px);
                    overflow-y: auto;
                    padding: 16px;
                }
                body #uw-a11y-panel #uw-a11y-summary {
                    background: #f8f9fa;
                    border: 1px solid #dee2e6;
                    border-radius: 4px;
                    padding: 12px;
                    margin-bottom: 16px;
                }
                body #uw-a11y-panel .uw-a11y-issue {
                    margin-bottom: 12px;
                    padding: 12px;
                    border-left: 4px solid #ffc107;
                    background: #fff3cd;
                    border-radius: 0 4px 4px 0;
                    cursor: pointer;
                }
                body #uw-a11y-panel .uw-a11y-issue.error {
                    border-left-color: #dc3545;
                    background: #f8d7da;
                }
                body #uw-a11y-panel .uw-a11y-issue.warning {
                    border-left-color: #ffc107;
                    background: #fff3cd;
                }
                body #uw-a11y-panel .uw-a11y-issue.info {
                    border-left-color: #17a2b8;
                    background: #d1ecf1;
                }
                body #uw-a11y-panel .uw-a11y-issue h4 {
                    margin: 0 0 8px 0;
                    font-size: 14px;
                    font-weight: bold;
                }
                body #uw-a11y-panel .uw-a11y-issue p {
                    margin: 4px 0;
                    line-height: 1.4;
                }
                body #uw-a11y-panel .uw-a11y-issue .issue-meta {
                    font-size: 12px;
                    color: #666;
                    margin-top: 8px;
                    padding-top: 8px;
                    border-top: 1px solid rgba(0,0,0,0.1);
                }
                body #uw-a11y-panel .uw-a11y-issue .learn-more {
                    color: #c5050c;
                    text-decoration: none;
                    font-size: 12px;
                }
                body #uw-a11y-panel .uw-a11y-issue .learn-more:hover {
                    text-decoration: underline;
                }
                body .uw-a11y-highlight {
                    background: yellow !important;
                    border: 2px solid red !important;
                    box-shadow: 0 0 0 2px yellow !important;
                }
                body #uw-a11y-panel .uw-a11y-count {
                    font-weight: bold;
                    padding: 2px 8px;
                    border-radius: 12px;
                    color: white;
                    font-size: 12px;
                    margin-right: 8px;
                }
                body #uw-a11y-panel .count-error { background: #dc3545; }
                body #uw-a11y-panel .count-warning { background: #ffc107; color: #212529; }
                body #uw-a11y-panel .count-info { background: #17a2b8; }
                body #uw-a11y-panel .count-verified { background: #28a745; }
                body #uw-a11y-panel .uw-a11y-manual-check {
                    margin: 8px 0;
                    padding: 8px;
                    background: #f8f9fa;
                    border-radius: 4px;
                    border: 1px solid #dee2e6;
                }
                body #uw-a11y-panel .uw-a11y-checkbox {
                    display: flex;
                    align-items: center;
                    cursor: pointer;
                    font-size: 13px;
                }
                body #uw-a11y-panel .uw-a11y-checkbox input[type="checkbox"] {
                    margin-right: 8px;
                    width: 16px;
                    height: 16px;
                }
                body #uw-a11y-panel .uw-a11y-issue.checked {
                    opacity: 0.7;
                    background: #d4edda !important;
                    border-left-color: #28a745 !important;
                }
                body #uw-a11y-panel .uw-a11y-issue.checked .uw-a11y-manual-check {
                    background: #d4edda;
                    border-color: #c3e6cb;
                }
                body #uw-a11y-panel .uw-a11y-check-label {
                    color: #155724;
                    font-weight: 500;
                }
                body #uw-a11y-panel .uw-a11y-spinner {
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
                body #uw-a11y-panel .axe-summary {
                    font-size: 12px;
                    color: #666;
                    border-top: 1px solid #dee2e6;
                    padding-top: 12px;
                    margin-top: 12px;
                }
                body #uw-a11y-panel .uw-a11y-score-container {
                    text-align: center;
                    margin: 1rem 0;
                    padding: 1rem;
                    background: #f8f9fa;
                    border-radius: 8px;
                    border: 2px solid #e9ecef;
                }
                body #uw-a11y-panel .uw-a11y-score-dial {
                    position: relative;
                    width: 120px;
                    height: 120px;
                    margin: 0 auto 1rem auto;
                }
                body #uw-a11y-panel .uw-a11y-score-circle {
                    width: 120px;
                    height: 120px;
                    border-radius: 50%;
                    background: conic-gradient(from 0deg, #28a745 0deg 0deg, #e9ecef 0deg 360deg);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                }
                body #uw-a11y-panel .uw-a11y-score-inner {
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
                body #uw-a11y-panel .uw-a11y-score-number {
                    font-size: 24px;
                    color: #333;
                }
                body #uw-a11y-panel .uw-a11y-score-label {
                    font-size: 10px;
                    color: #666;
                    text-transform: uppercase;
                }
                body #uw-a11y-panel .uw-a11y-details {
                    margin-top: 1rem;
                    padding: 0.5rem;
                    background: #f1f3f4;
                    border-left: 3px solid #007cba;
                    border-radius: 0 4px 4px 0;
                    font-size: 12px;
                    display: none;
                }
                body #uw-a11y-panel .uw-a11y-details.expanded {
                    display: block;
                }
                body #uw-a11y-panel .uw-a11y-details-toggle {
                    background: none;
                    border: none;
                    color: #007cba;
                    cursor: pointer;
                    font-size: 12px;
                    text-decoration: underline;
                    padding: 0;
                    margin-top: 0.5rem;
                }
                body #uw-a11y-panel .uw-a11y-details-item {
                    margin: 0.5rem 0;
                    padding: 0.5rem;
                    background: white;
                    border-radius: 3px;
                }
                body #uw-a11y-panel .uw-a11y-details-label {
                    font-weight: bold;
                    color: #495057;
                }
                body #uw-a11y-panel .uw-a11y-details-value {
                    font-family: monospace;
                    background: #f8f9fa;
                    padding: 0.25rem;
                    border-radius: 2px;
                    margin-top: 0.25rem;
                    word-break: break-all;
                }
                body #uw-a11y-panel .uw-a11y-instance-nav {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin: 8px 0;
                    padding: 8px;
                    background: #e9ecef;
                    border-radius: 4px;
                    font-size: 12px;
                }
                body #uw-a11y-panel .uw-a11y-instance-count {
                    font-weight: bold;
                    color: #495057;
                }
                body #uw-a11y-panel .uw-a11y-nav-buttons {
                    display: flex;
                    gap: 4px;
                }
                body #uw-a11y-panel .uw-a11y-nav-buttons button {
                    background: #6c757d;
                    color: white;
                    border: none;
                    padding: 4px 8px;
                    border-radius: 3px;
                    font-size: 11px;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                body #uw-a11y-panel .uw-a11y-nav-buttons button:hover:not(:disabled) {
                    background: #5a6268;
                }
                body #uw-a11y-panel .uw-a11y-nav-buttons button:disabled {
                    background: #adb5bd;
                    cursor: not-allowed;
                }
            `;
            document.head.appendChild(style);
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
            const summary = document.getElementById('uw-a11y-summary');
            const results = document.getElementById('uw-a11y-results');
            
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
                        <strong>Test Summary:</strong> ${this.axeResults.violations} violations, 
                        ${this.axeResults.passes} passes, ${this.axeResults.incomplete} need review, 
                        ${this.axeResults.inapplicable} not applicable<br>
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
                            <span class="uw-a11y-instance-count">Instance <span id="current-${ruleId}">1</span> of ${issueGroup.length}</span>
                            <div class="uw-a11y-nav-buttons">
                                <button onclick="window.uwAccessibilityChecker.navigateInstance('${ruleId}', -1); event.stopPropagation();" 
                                        id="prev-${ruleId}" disabled>‹ Prev</button>
                                <button onclick="window.uwAccessibilityChecker.navigateInstance('${ruleId}', 1); event.stopPropagation();" 
                                        id="next-${ruleId}">Next ›</button>
                            </div>
                        </div>
                    ` : '';
                    
                    // Create checkbox for manual review items (affects all instances of this rule)
                    const checkboxHtml = isManualReview ? 
                        `<div class="uw-a11y-manual-check">
                            <label class="uw-a11y-checkbox">
                                <input type="checkbox" 
                                       id="check-${ruleId}" 
                                       ${this.isRuleVerified(ruleId) ? 'checked' : ''}
                                       onchange="window.uwAccessibilityChecker.toggleRuleVerification('${ruleId}'); event.stopPropagation();">
                                <span class="uw-a11y-checkmark"></span>
                                <span class="uw-a11y-check-label">
                                    ${this.isRuleVerified(ruleId) ? `All ${issueGroup.length} instances manually verified ✓` : `Mark all ${issueGroup.length} instances as verified`}
                                </span>
                            </label>
                        </div>` : '';

                    return `
                        <div class="uw-a11y-issue ${firstIssue.type} ${isManualReview && this.isRuleVerified(ruleId) ? 'checked' : ''}" 
                             onclick="window.uwAccessibilityChecker.highlightCurrentInstance('${ruleId}')" 
                             style="cursor: pointer" id="issue-${ruleId}">
                            <h4>${firstIssue.title} ${issueGroup.length > 1 ? `(${issueGroup.length} instances)` : ''}</h4>
                            <p id="description-${ruleId}">${firstIssue.description.split('\n')[0]}</p>
                            <p><strong>How to fix:</strong> <span id="recommendation-${ruleId}">${firstIssue.recommendation}</span></p>
                            ${instanceNavigation}
                            ${checkboxHtml}
                            ${firstIssue.detailedInfo && firstIssue.detailedInfo.length > 0 ? `
                                <button class="uw-a11y-details-toggle" onclick="window.uwAccessibilityChecker.toggleDetails('${ruleId}'); event.stopPropagation();">
                                    Show technical details
                                </button>
                                <div class="uw-a11y-details" id="details-${ruleId}">
                                    <div id="detailed-content-${ruleId}">
                                        ${this.renderDetailedInfo(firstIssue.detailedInfo)}
                                    </div>
                                </div>
                            ` : ''}
                            <div class="issue-meta">
                                <strong>Impact:</strong> ${firstIssue.impact || 'unknown'} | 
                                <strong>Tags:</strong> ${firstIssue.tags.join(', ')}
                                ${firstIssue.helpUrl ? `<br><a href="${firstIssue.helpUrl}" target="_blank" class="learn-more">Learn more about this rule</a>` : ''}
                            </div>
                        </div>
                    `;
                }).join('');
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
                const ruleId = issue.ruleId || issue.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
                if (!grouped[ruleId]) {
                    grouped[ruleId] = [];
                }
                grouped[ruleId].push(issue);
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
            
            // Update displayed content
            const descElement = document.getElementById(`description-${ruleId}`);
            const recElement = document.getElementById(`recommendation-${ruleId}`);
            const currentSpan = document.getElementById(`current-${ruleId}`);
            const detailedContent = document.getElementById(`detailed-content-${ruleId}`);
            
            if (descElement) descElement.textContent = currentIssue.description.split('\n')[0];
            if (recElement) recElement.textContent = currentIssue.recommendation;
            if (currentSpan) currentSpan.textContent = currentIndex + 1;
            if (detailedContent && currentIssue.detailedInfo) {
                detailedContent.innerHTML = this.renderDetailedInfo(currentIssue.detailedInfo);
            }
            
            // Update navigation buttons
            const prevBtn = document.getElementById(`prev-${ruleId}`);
            const nextBtn = document.getElementById(`next-${ruleId}`);
            
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
            const checkbox = document.getElementById(`check-${ruleId}`);
            const label = checkbox?.parentNode.querySelector('.uw-a11y-check-label');
            const issueDiv = document.getElementById(`issue-${ruleId}`);
            
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
            const detailsElement = document.getElementById(`details-${ruleId}`);
            const button = detailsElement.previousElementSibling;
            
            if (detailsElement.classList.contains('expanded')) {
                detailsElement.classList.remove('expanded');
                button.textContent = 'Show technical details';
            } else {
                detailsElement.classList.add('expanded');
                button.textContent = 'Hide technical details';
            }
        },

        // Toggle manual verification checkbox
        toggleManualCheck: function(uniqueId) {
            if (this.checkedItems.has(uniqueId)) {
                this.checkedItems.delete(uniqueId);
            } else {
                this.checkedItems.add(uniqueId);
            }
            
            // Update the label text
            const checkbox = document.getElementById(`check-${uniqueId}`);
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
            const scoreNumber = document.querySelector('.uw-a11y-score-number');
            const scoreCircle = document.querySelector('.uw-a11y-score-circle');
            
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
            const summaryDiv = document.getElementById('uw-a11y-summary');
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
            const panel = document.getElementById('uw-a11y-panel');
            const minimizeBtn = document.getElementById('uw-a11y-minimize');
            
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
            fetch('https://api.github.com/repos/alnemec/TestMark/releases/latest')
                .then(response => response.json())
                .then(data => {
                    const latestVersion = data.tag_name.replace('v', '');
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
                <div style="background: #28a745; color: white; padding: 10px; border-radius: 4px; margin-bottom: 10px; font-size: 13px;">
                    <strong>📢 Update Available!</strong><br>
                    A new version (v${newVersion}) of the Pinpoint Accessibility Checker is available.<br>
                    Current version: v${this.version}<br>
                    <div style="margin-top: 8px;">
                        <a href="${releaseUrl}" target="_blank" style="color: #ffffff; text-decoration: underline;">
                            View release notes →
                        </a>
                        <span style="margin: 0 8px;">|</span>
                        <a href="https://alnemec.github.io/TestMark/" target="_blank" style="color: #ffffff; text-decoration: underline;">
                            Get latest bookmarklet →
                        </a>
                        <button onclick="this.parentElement.parentElement.style.display='none'" 
                                style="float: right; background: none; border: 1px solid white; color: white; border-radius: 2px; padding: 2px 6px; cursor: pointer; font-size: 11px;">
                            ✕
                        </button>
                    </div>
                </div>
            `;
            
            // Insert at the top of the summary section
            setTimeout(() => {
                const summary = document.getElementById('uw-a11y-summary');
                if (summary) {
                    summary.insertBefore(notification, summary.firstChild);
                }
            }, 500);
        },


        
        remove: function() {
            const panel = document.getElementById('uw-a11y-panel');
            if (panel) panel.remove();
            
            const styles = document.getElementById('uw-a11y-styles');
            if (styles) styles.remove();
            
            // Remove highlights
            document.querySelectorAll('.uw-a11y-highlight').forEach(el => {
                el.classList.remove('uw-a11y-highlight');
            });
            
            delete window.uwAccessibilityChecker;
        }
    };
    
    // Initialize the accessibility checker
    window.uwAccessibilityChecker.init();
})(); 