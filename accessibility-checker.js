(function() {
    'use strict';
    
    // Prevent multiple instances
    if (window.uwAccessibilityChecker) {
        window.uwAccessibilityChecker.remove();
        return;
    }
    
            // Main accessibility checker object
        window.uwAccessibilityChecker = {
            version: '1.4.9', // Current version
            issues: [],
            axeLoaded: false,
            checkedItems: new Set(), // Track manually verified items
            isMinimized: false, // Track minimized state
            shadowRoot: null, // Shadow DOM root
            scoreAnimationPlayed: false, // Run score animation only once
            // Visibility filters for list rendering
            filters: { errors: true, warnings: true, info: true },
        
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
                            <h2 id="uw-a11y-title">Pinpoint Accessibility Checker</h2>
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
            script.src = 'https://cdn.jsdelivr.net/npm/axe-core@4.10.3/axe.min.js';
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
            
            // Configure axe with selected WCAG spec/level (defaults to 2.1 AA)
            const { wcagSpec, wcagLevel } = this.getSelectedWcag();
            const tags = this.buildWcagTags(wcagSpec, wcagLevel);
            const isAAA = (wcagLevel || '').toUpperCase() === 'AAA';
            const axeConfig = {
                rules: {
                    // Disable the region rule which often creates false positives
                    // for "Ensures all page content is contained by landmarks"
                    'region': { enabled: false },
                    // Disable AAA color contrast unless user asks for AAA
                    'color-contrast-enhanced': { enabled: isAAA }
                },
                runOnly: { type: 'tag', values: tags }
            };
            
            // Build context with excludes
            const context = { exclude: this.getEffectiveExcludeSelectors() };

            // Run axe-core analysis with context (excluding configured selectors)
            window.axe.run(context, axeConfig, (err, results) => {
                if (err) {
                    this.showError('Error running accessibility analysis: ' + err.message);
                    return;
                }
                
                this.processAxeResults(results);
                // Run additional best-practices checks if enabled
                try {
                    if (this.isBestPracticesEnabled()) {
                        this.runBestPracticeChecks();
                    }
                } catch (e) {
                    // Don't let best-practice scan break the main flow
                    console.warn('Best-practices scan failed:', e);
                }
                this.displayResults();
            });
        },

        // Additional best-practices checks beyond axe rules
        runBestPracticeChecks: function() {
            // Helper: compute an approximate accessible name for links/buttons
            const getAccessibleName = (el) => {
                if (!el) return '';
                // aria-label has highest precedence
                const ariaLabel = el.getAttribute && el.getAttribute('aria-label');
                if (ariaLabel && ariaLabel.trim()) return ariaLabel.trim();

                // aria-labelledby
                const labelledby = el.getAttribute && el.getAttribute('aria-labelledby');
                if (labelledby) {
                    const ids = labelledby.split(/\s+/);
                    const text = ids.map(id => {
                        const ref = document.getElementById(id);
                        return ref ? (ref.innerText || ref.textContent || '').trim() : '';
                    }).join(' ').trim();
                    if (text) return text;
                }

                // img alt inside link
                const img = el.querySelector && el.querySelector('img[alt]');
                if (img && img.getAttribute('alt') && img.getAttribute('alt').trim()) {
                    return img.getAttribute('alt').trim();
                }

                // input value for input buttons/submit
                if (el.tagName === 'INPUT') {
                    const type = (el.getAttribute('type') || '').toLowerCase();
                    const val = el.getAttribute('value');
                    if (val && val.trim() && ['button','submit','reset'].includes(type)) {
                        return val.trim();
                    }
                }

                // Fallback: text content
                const text = (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
                return text;
            };

            // Helper: basic visibility filter to reduce noise
            const isVisible = (el) => {
                try {
                    if (!el || !(el instanceof Element)) return false;
                    if (el.hidden) return false;
                    const style = window.getComputedStyle(el);
                    if (!style || style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity) === 0) return false;
                    // Exclude our own UI container
                    if (el.closest && el.closest('#uw-a11y-container')) return false;
                    // Respect user/essential excludes for best-practice checks too
                    if (this.shouldExcludeElement && this.shouldExcludeElement(el)) return false;
                    return true;
                } catch (_) {
                    return true;
                }
            };

            // 1) Non-descriptive link text
            const genericPhrases = [
                'click here', 'here', 'learn more', 'read more', 'more', 'details',
                'this', 'this link', 'continue', 'link', 'info'
            ];
            const anchors = Array.from(document.querySelectorAll('a[href]'));
            anchors.forEach(a => {
                if (!isVisible(a)) return;
                const name = getAccessibleName(a).toLowerCase();
                if (!name) return;
                const isGeneric = genericPhrases.includes(name);
                if (isGeneric) {
                    this.addIssue(
                        'info',
                        'Best Practice: Use contextual link text',
                        `The link text "${name}" is not descriptive out of context.`,
                        a,
                        'Use meaningful, specific link text that communicates the destination or action. For example, instead of <code>click here</code>, use <code>Download annual report (PDF)</code> or <code>Read more about financial aid</code>. You can also add context with <code>aria-label</code> when needed.',
                        'https://www.w3.org/WAI/GL/UNDERSTANDING-WCAG20/navigation-mechanisms-meaningful-sequence.html',
                        'minor',
                        ['best-practice', 'links'],
                        [
                            { label: 'Detected Text', value: name },
                            { label: 'Href', value: a.getAttribute('href') || '' }
                        ],
                        'bp-contextual-link-text'
                    );
                }
            });

            // 2) Multiple generic link texts that go to different destinations
            const mapByText = new Map();
            anchors.forEach(a => {
                if (!isVisible(a)) return;
                const name = getAccessibleName(a).toLowerCase();
                if (!genericPhrases.includes(name)) return; // only for generic texts
                const href = (a.getAttribute('href') || '').trim();
                if (!mapByText.has(name)) mapByText.set(name, new Set());
                mapByText.get(name).add(href);
            });
            mapByText.forEach((hrefs, text) => {
                if (hrefs.size > 1) {
                    // Flag once, reference examples
                    const examples = anchors.filter(a => genericPhrases.includes(getAccessibleName(a).toLowerCase()))
                        .slice(0, 3)
                        .map(a => ({ text: getAccessibleName(a), href: a.getAttribute('href') || '' }));
                    this.addIssue(
                        'info',
                        'Best Practice: Avoid repeated generic links',
                        `Found multiple "${text}" links pointing to different destinations.`,
                        null,
                        'Provide unique, contextual link text for each destination. For example, replace repeated <code>Read more</code> with <code>Read more about scholarships</code>, <code>Read more about housing</code>, etc.',
                        'https://www.w3.org/WAI/tutorials/page-structure/links/',
                        'minor',
                        ['best-practice', 'links'],
                        [
                            { label: 'Link Text', value: text },
                            { label: 'Unique Destinations', value: Array.from(hrefs).join(', ') },
                            { label: 'Examples (first 3)', value: examples.map(e => `${e.text} → ${e.href}`).join(' | ') }
                        ],
                        'bp-duplicate-generic-links'
                    );
                }
            });

            // 3) New tab/window behavior not communicated and missing rel security
            anchors.forEach(a => {
                if (!isVisible(a)) return;
                const target = a.getAttribute('target');
                if (target && target.toLowerCase() === '_blank') {
                    const name = getAccessibleName(a);
                    const nameLc = name.toLowerCase();
                    const mentionsNewTab = nameLc.includes('opens in new tab') || nameLc.includes('opens in a new tab') || nameLc.includes('(new tab)');
                    const rel = (a.getAttribute('rel') || '').toLowerCase();
                    const hasNoopener = rel.includes('noopener');
                    const hasNoreferrer = rel.includes('noreferrer');

                    if (!mentionsNewTab || !hasNoopener || !hasNoreferrer) {
                        const recommendations = [];
                        if (!mentionsNewTab) recommendations.push('Inform users the link opens in a new tab/window (e.g., include visually hidden text like <code><span class="sr-only">(opens in new tab)</span></code> or add to <code>aria-label</code>).');
                        if (!hasNoopener || !hasNoreferrer) recommendations.push('Add <code>rel="noopener noreferrer"</code> for security and privacy.');
                        this.addIssue(
                            'info',
                            'Best Practice: Communicate new-tab behavior',
                            'Link opens in a new tab/window but may not communicate this behavior or include recommended rel attributes.',
                            a,
                            recommendations.join(' '),
                            'https://www.w3.org/TR/WCAG20-TECHS/G201.html',
                            'minor',
                            ['best-practice', 'links'],
                            [
                                { label: 'Text', value: name },
                                { label: 'Href', value: a.getAttribute('href') || '' },
                                { label: 'Has rel', value: rel || '(none)' }
                            ],
                            'bp-new-tab-communication'
                        );
                    }
                }
            });

            // 4) Inputs using placeholder as the primary label (lack persistent label)
            const formControls = Array.from(document.querySelectorAll('input, textarea, select'))
                .filter(el => {
                    const type = (el.getAttribute('type') || '').toLowerCase();
                    if (type === 'hidden') return false;
                    return true;
                });
            const hasAssociatedLabel = (el) => {
                if (!el || !(el instanceof Element)) return false;
                if (el.closest('label')) return true;
                const id = el.getAttribute('id');
                if (id && document.querySelector(`label[for="${CSS.escape(id)}"]`)) return true;
                if (el.hasAttribute('aria-label') && el.getAttribute('aria-label').trim()) return true;
                if (el.hasAttribute('aria-labelledby')) {
                    const ids = el.getAttribute('aria-labelledby').split(/\s+/);
                    const named = ids.map(i => document.getElementById(i)).filter(Boolean)
                        .map(n => (n.innerText || n.textContent || '').trim()).join(' ').trim();
                    if (named) return true;
                }
                return false;
            };
            formControls.forEach(el => {
                if (!isVisible(el)) return;
                const hasPlaceholder = el.hasAttribute('placeholder') && el.getAttribute('placeholder').trim();
                if (hasPlaceholder && !hasAssociatedLabel(el)) {
                    this.addIssue(
                        'info',
                        'Best Practice: Don\'t rely on placeholder as label',
                        'This form control appears to rely on placeholder text instead of a persistent label.',
                        el,
                        'Provide a visible, persistent <code><label></code> or an accessible name via <code>aria-label</code>/<code>aria-labelledby</code>. Placeholders should be hints, not primary labels, because they disappear on input and can reduce readability.',
                        'https://www.w3.org/WAI/tutorials/forms/labels/',
                        'minor',
                        ['best-practice', 'forms'],
                        [
                            { label: 'Control', value: el.tagName.toLowerCase() + (el.getAttribute('type') ? ` [type=${el.getAttribute('type')}]` : '') },
                            { label: 'Placeholder', value: el.getAttribute('placeholder') || '' }
                        ],
                        'bp-placeholder-only-label'
                    );
                }
            });

            // 5) Generic/unclear button text
            const buttonSelectors = 'button, input[type="button"], input[type="submit"], input[type="reset"], a[role="button"]';
            const buttons = Array.from(document.querySelectorAll(buttonSelectors));
            const genericButtonPhrases = [
                'submit','go','more','learn more','read more','click here','ok','yes','no','continue','next','previous','prev','send'
            ];
            buttons.forEach(btn => {
                if (!isVisible(btn)) return;
                const name = getAccessibleName(btn).trim();
                if (!name) return;
                if (genericButtonPhrases.includes(name.toLowerCase())) {
                    this.addIssue(
                        'info',
                        'Best Practice: Make button text specific',
                        `The button label "${name}" is generic and may be unclear.`,
                        btn,
                        'Use specific labels that describe the action, e.g., <code>Submit application</code>, <code>Search site</code>, or <code>Download report</code>.',
                        'https://www.w3.org/WAI/tutorials/forms/labels/#hints-and-instructions',
                        'minor',
                        ['best-practice', 'buttons'],
                        [ { label: 'Detected Text', value: name } ],
                        'bp-generic-button-text'
                    );
                }
            });

            // 6) Autoplaying media recommendations
            const autoplayMedia = Array.from(document.querySelectorAll('video[autoplay], audio[autoplay]'));
            autoplayMedia.forEach(m => {
                if (!isVisible(m)) return;
                const hasControls = m.hasAttribute('controls');
                const isMuted = m.hasAttribute('muted');
                const label = m.tagName.toLowerCase();
                const recs = [];
                if (!hasControls) recs.push('Add <code>controls</code> so users can pause/stop.');
                if (!isMuted && m.tagName === 'VIDEO') recs.push('Avoid autoplay with sound; consider starting paused or muted.');
                recs.push('Respect user preference with <code>@media (prefers-reduced-motion: reduce)</code> and avoid distracting motion.');
                this.addIssue(
                    'info',
                    'Best Practice: Avoid autoplay without clear controls',
                    `${label} element autoplays. Autoplay can be disorienting and should generally be avoided.`,
                    m,
                    recs.join(' '),
                    'https://www.w3.org/WAI/WCAG21/Techniques/general/G19',
                    'minor',
                    ['best-practice', 'media'],
                    [ { label: 'Element', value: `<${label}>` }, { label: 'Controls', value: hasControls ? 'present' : 'missing' } ],
                    'bp-media-autoplay'
                );
            });

            // 7) Infinite or marquee-style animations
            // Simple tag checks first
            const marqueeLike = Array.from(document.querySelectorAll('marquee, blink'));
            marqueeLike.forEach(el => {
                if (!isVisible(el)) return;
                this.addIssue(
                    'info',
                    'Best Practice: Avoid marquee/blink effects',
                    'Elements using marquee/blink effects can be distracting and hard to read.',
                    el,
                    'Replace with non-moving alternatives or provide user controls and respect <code>prefers-reduced-motion</code>.',
                    'https://www.w3.org/WAI/WCAG21/Understanding/pause-stop-hide.html',
                    'minor',
                    ['best-practice', 'motion'],
                    [],
                    'bp-marquee-blink'
                );
            });
            // Computed-style animation scan (limited for performance)
            try {
                const allEls = Array.from(document.querySelectorAll('*'));
                if (allEls.length <= 2500) {
                    allEls.forEach(el => {
                        if (!isVisible(el)) return;
                        const cs = getComputedStyle(el);
                        if (!cs) return;
                        const durations = (cs.animationDuration || '').split(',').map(s => (s || '').trim());
                        const iters = (cs.animationIterationCount || '').split(',').map(s => (s || '').trim());
                        const running = (cs.animationPlayState || '').split(',').some(s => s.trim() === 'running');
                        const hasDuration = durations.some(d => d && d !== '0s' && d !== '0ms');
                        const infinite = iters.some(n => n === 'infinite');
                        if (running && hasDuration && infinite) {
                            this.addIssue(
                                'info',
                                'Best Practice: Provide motion alternatives',
                                'Detected an element with continuous animation.',
                                el,
                                'Offer a way to pause/stop animation and respect <code>prefers-reduced-motion</code> to reduce or remove motion for users who prefer it.',
                                'https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html',
                                'minor',
                                ['best-practice', 'motion'],
                                [],
                                'bp-infinite-animation'
                            );
                        }
                    });
                }
            } catch (_) { /* ignore animation scan errors */ }

            // 8) File-type link labeling (PDF, docs, etc.)
            const fileExts = ['.pdf','.doc','.docx','.ppt','.pptx','.xls','.xlsx','.zip'];
            anchors.forEach(a => {
                if (!isVisible(a)) return;
                const href = (a.getAttribute('href') || '').toLowerCase();
                const name = getAccessibleName(a).toLowerCase();
                const matched = fileExts.find(ext => href.endsWith(ext));
                if (matched && name && !name.includes(matched.replace('.', ''))) {
                    this.addIssue(
                        'info',
                        'Best Practice: Indicate file type in link',
                        `This link points to a ${matched.toUpperCase()} file, but the link text may not indicate the file type.`,
                        a,
                        'Include the file type (and optionally size) in the link text, e.g., <code>Annual Report (PDF)</code>.',
                        'https://www.w3.org/WAI/tips/writing/#inform-users-about-what-to-expect',
                        'minor',
                        ['best-practice', 'links'],
                        [ { label: 'Href', value: href } ],
                        'bp-filetype-link-label'
                    );
                }
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
            // Escape HTML entities to prevent injection and structural issues
            const escapeHtml = (unsafe) => {
                return unsafe
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#039;");
            };
            
            // For now, just escape the text without complex regex processing
            // This prevents HTML structure issues that were causing nesting problems
            return escapeHtml(text);
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
                
                // Check if it's our container, panel, or any child element
                if (selector.includes('#uw-a11y-container') || 
                    selector.includes('#uw-a11y-panel') || 
                    selector.includes('uw-a11y-')) {
                    return true;
                }
            }
            
            // Check the HTML content for our UI elements
            if (node.html) {
                if (node.html.includes('uw-a11y-') || 
                    node.html.includes('id="uw-a11y-') ||
                    node.html.includes('class="uw-a11y-') ||
                    node.html.includes('Loading axe-core') ||
                    node.html.includes('Pinpoint Accessibility Checker')) {
                    return true;
                }
            }
            
            // Check the actual DOM element if available
            const element = this.getElementFromNode(node);
            if (element) {
                // Check if element is inside our container or panel
                const container = document.getElementById('uw-a11y-container');
                const panel = document.getElementById('uw-a11y-panel');
                
                if (container && (element === container || container.contains(element))) {
                    return true;
                }
                
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
                
                // Check if element is within shadow DOM
                if (element.getRootNode && element.getRootNode() !== document) {
                    const shadowRoot = element.getRootNode();
                    if (shadowRoot.host && shadowRoot.host.id === 'uw-a11y-container') {
                        return true;
                    }
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
                <div id="uw-a11y-wrapper">
                <div id="uw-a11y-nav">
                    <nav>
                        <ul>
                            <li>
                                <a id="uw-a11y-nav-results" href="#uw-a11y-view-results" title="Results">
                                    <svg class="feather feather-pie-chart" fill="none" height="24" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
                                    <span class="uw-a11y-nav-label">Results</span>
                                </a>
                            </li>
                            <li>
                                <a id="uw-a11y-nav-settings" href="#uw-a11y-view-settings" title="Settings">
                                    <svg class="feather feather-toggle-left" fill="none" height="24" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><rect height="14" rx="7" ry="7" width="22" x="1" y="5"/><circle cx="8" cy="12" r="3"/></svg>
                                    <span class="uw-a11y-nav-label">Settings</span>
                                </a>
                            </li>
                            <li>
                                <a id="uw-a11y-nav-help" href="#uw-a11y-view-help" title="Help">
                                    <svg class="feather feather-alert-triangle" fill="none" height="24" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
                                    <span class="uw-a11y-nav-label">Help</span>
                                </a>
                            </li>
                            <li>
                                <a id="uw-a11y-nav-about" href="#uw-a11y-view-about" title="About">
                                    <svg class="feather feather-info" fill="none" height="24" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/></svg>
                                    <span class="uw-a11y-nav-label">About</span>
                                </a>
                            </li>
                        </ul>
                    </nav>
                </div>
                <div id="uw-a11y-panel" tabindex="-1" role="dialog" aria-labelledby="uw-a11y-title">
                    <div class="accentcolors">
                        <div class="color1"></div>
                        <div class="color2"></div>
                        <div class="color3"></div>
                    </div>
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
                            <h2 id="uw-a11y-title">Pinpoint Accessibility Checker</h2>
                        </div>
                        <div class="uw-a11y-header-buttons">
                            <button id="uw-a11y-minimize" title="Minimize">−</button>
                            <button id="uw-a11y-close" title="Close">✕</button>
                        </div>
                    </div>
                    <div id="uw-a11y-content">
                        <div id="uw-a11y-view-results" class="uw-a11y-view">
                            <div id="uw-a11y-summary"></div>
                            <p class="if-issues">
                                <div class="mouse-icon"></div>
                                <small>Select any item below to highlight the element on the page.</small>
                            </p>
                            <div id="uw-a11y-results"></div>
                        </div>

                        <div id="uw-a11y-view-about" class="uw-a11y-view" hidden>
                            <div class="uw-a11y-about">
                                <h3>About Pinpoint</h3>
                                <p>Version: <strong>${this.version}</strong> · Engine: axe-core v${this.getAxeVersion ? (this.getAxeVersion() || 'unknown') : 'unknown'}</p>
                                <p>Pinpoint Accessibility Checker helps quickly find accessibility issues and best-practice improvements, pairing automated results with guidance.</p>
                                <p><a href="https://github.com/althe3rd/Pinpoint" target="_blank" rel="noopener noreferrer">Project on GitHub</a></p>
                            </div>
                        </div>

                        <div id="uw-a11y-view-settings" class="uw-a11y-view" hidden>
                            <div class="uw-a11y-settings">
                                <h3>Settings</h3>
                                <p>Lightweight options will appear here. For now, results filters and checked items persist for this session.</p>
                            </div>
                        </div>

                        <div id="uw-a11y-view-help" class="uw-a11y-view" hidden>
                            <div class="uw-a11y-help">
                                <h3>Help</h3>
                                <ul>
                                    <li>Click a result to highlight it on the page.</li>
                                    <li>Use the eye icons to filter categories.</li>
                                    <li>Open “Learn more” links for WCAG details.</li>
                                </ul>
                                <p>Need more? Visit the <a href="https://github.com/althe3rd/Pinpoint#readme" target="_blank" rel="noopener noreferrer">documentation</a>.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            `;
            
            // Add event listeners
            this.shadowRoot.getElementById('uw-a11y-close').onclick = () => this.remove();
            this.shadowRoot.getElementById('uw-a11y-minimize').onclick = () => this.toggleMinimize();
            this.initNavigation();
            this.renderSettings();
            
            // Load GSAP and animate panel
            this.loadGSAP().then(() => {
                this.setupInitialHeight();
                this.animatePanel();
                // Small delay to ensure panel animation starts before nav animation
                setTimeout(() => {
                    this.animateNavigation();
                }, 100);
                this.setupResizeHandler();
            });

            return this.shadowRoot.getElementById('uw-a11y-panel');
        },
        
        // Get CSS styles as string for Shadow DOM
        getStyles: function() {
            return `<style>
                :host {
                    all: initial;
                    font-family: "Red Hat Display", "Red Hat Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                }
                
                /* ===== Scrollbar CSS ===== */
                /* Firefox */
                * {
                    scrollbar-width: auto;
                    scrollbar-color:rgb(132, 132, 132) rgba(255,255,255,0.0) ;
                }

                /* Chrome, Edge, and Safari */
                *::-webkit-scrollbar {
                    width: 8px;
                   
                }

                *::-webkit-scrollbar-track {
                    background: transparent;
                }

                *::-webkit-scrollbar-thumb {
                    background-color:rgb(188, 188, 188);
                    border-radius: 10px;
                   
                }

                #uw-a11y-wrapper {
                    display: grid;
                    grid-template-columns: 60px 1fr;
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    width: 450px;
                    
                    z-index: 999999;
                    gap: .4rem;
                    background: rgba(0,0,0,0.7);
                    backdrop-filter: blur(20px);
                    padding: 4px;
                    border-radius: 16px;
                    transition: height 0.4s;
                }

                #uw-a11y-nav {
                    justify-content: center;
                    color: #fff;

                }

                #uw-a11y-nav ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    display: flex;
                    gap: 1rem;
                    display: flex;
                    flex-direction: column;
                }

                #uw-a11y-nav ul li {
                    position: relative;
                    /* Prevent FOUC: start hidden; GSAP/CSS will reveal */
                    opacity: 0;
                }

                #uw-a11y-nav ul li a {
                    display: block;
                    color: #fff;
                    text-decoration: none;
                    padding: 0.5rem .5rem;
                    border-radius: 12px;
                    transition: background 0.3s ease;
                    font-size: 0.7rem;
                    text-align: center
                }

                #uw-a11y-nav ul li a:hover {
                    background: rgba(255, 255, 255, 0.1);
                }

                #uw-a11y-nav ul li a.active {
                    background: rgba(255,255,255,0.18);
                }

                #uw-a11y-nav ul li a svg {
                    width: 20px;
                    height: 20px;
                    margin: 0 auto;
                    margin-bottom: 4px;
                    display: block;
                
                }

                .uw-a11y-nav-icon {
                    width: 22px;
                    height: 22px;
                    display: block;
                    margin: 0 auto 4px auto;
                }

                .uw-a11y-nav-label {
                    display: block;
                    line-height: 1.1;
                }

                /* View switching */
                .uw-a11y-view[hidden] { display: none; }

                /* Settings styles */
                .uw-a11y-settings { margin-bottom: 3rem; }
                .uw-a11y-settings h3 { margin: 0 0 .5rem 0; }
                .uw-a11y-form-row { margin: .75rem 0; }
                .uw-a11y-input { width: 80%; padding: 8px 14px; border-radius: 6px; border: 1px solid #cbd3da; font-size: 14px; border-radius: 50rem; }
                .uw-a11y-helptext { font-size: 12px; color: #555; margin-top: 4px; }
                .uw-a11y-actions { display: flex; gap: .5rem; margin-top: .75rem; }
                .uw-a11y-btn { appearance: none; border: 1px solid #b6bcc2; background: #fff; color: #111; padding: 6px 10px; border-radius: 6px; cursor: pointer; font-size: 13px; }
                .uw-a11y-btn.primary { background: #0d6efd; border-color: #0d6efd; color: #fff; }
                .uw-a11y-btn:disabled { opacity: .6; cursor: not-allowed; }
                .uw-a11y-reset-icon { width: 16px; height: 16px; vertical-align: text-bottom; margin-right: 6px; }
                .uw-a11y-msg { font-size: 12px; margin-top: 6px; }
                .uw-a11y-msg.ok { color: #155724; }
                .uw-a11y-msg.err { color: #721c24; }

                #uw-a11y-panel {
                    
                    background: rgba(239, 239, 239, 0.9);
                    border: 1px solid rgba(255,255,255,0.85);
                    border-radius: 12px;
                    backdrop-filter: blur(12px);
                    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
                    z-index: 999999;
                    font-family: "Red Hat Display", "Red Hat Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    font-size: 14px;
                    overflow: hidden;
                    transition: all 0.3s ease;
                    outline: none;
                }
                
                #uw-a11y-panel:focus {
                    outline: 3px solid #007cba;
                    outline-offset: 2px;
                }
                
                /* Screen reader only text */
                .sr-only {
                    position: absolute;
                    width: 1px;
                    height: 1px;
                    padding: 0;
                    margin: -1px;
                    overflow: hidden;
                    clip: rect(0, 0, 0, 0);
                    white-space: nowrap;
                    border: 0;
                }
                
                /* Animated click icon */
                .uw-a11y-click-icon {
                    display: inline-block;
                    margin-right: 8px;
                    color: #007cba;
                    animation: uw-pulse 2s ease-in-out infinite;
                    vertical-align: middle;
                }
                
                @keyframes uw-pulse {
                    0% {
                        transform: scale(1);
                        opacity: 1;
                    }
                    50% {
                        transform: scale(1.1);
                        opacity: 0.8;
                    }
                    100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }

                #uw-a11y-panel .accentcolors {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: -1;
                }

                #uw-a11y-panel .accentcolors .color1 {
                    content: "";
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 30%;
                    height: 60px;
                    filter: blur(60px);
                    background: rgba(121, 20, 222, 0.6);
                    z-index: -1;
                }

                #uw-a11y-panel .accentcolors .color2 {
                    content: "";
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 30%;
                    height: 50px;
                    filter: blur(60px);
                    background: rgba(52, 126, 223, 0.6);
                    z-index: -1;
                }

                #uw-a11y-panel .accentcolors .color3 {
                    content: "";
                    position: absolute;
                    top: 0;
                    left: 30%;
                    width: 40%;
                    height: 20px;
                    filter: blur(60px);
                    background: rgba(23, 72, 248, 0.6);
                    z-index: -1;
                }

                
                #uw-a11y-panel.minimized {
                    bottom: -1px;
                    top: auto;
                    right: 20px;
                    width: 400px;
                    max-height: 180px;
                    border-radius: 8px 8px 0 0;
                }

                .violationtype {
                    margin-bottom: 0.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                #uw-a11y-panel .info-with-tooltip {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    position: relative;
                }
                #uw-a11y-panel .info-btn {
                    background: white;
                    border: 1px solid rgba(0,0,0,0.2);
                    color: #333;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    line-height: 1;
                    cursor: pointer;
                    padding: 0;
                }
                #uw-a11y-panel .info-btn:focus {
                    outline: 2px solid #007cba;
                    outline-offset: 2px;
                }
                #uw-a11y-panel .tooltip {
                    position: absolute;
                    left: 0;
                    top: 140%;
                    background: #212529;
                    color: #fff;
                    padding: 6px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    max-width: 260px;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.15);
                    opacity: 0;
                    visibility: hidden;
                    transition: opacity 0.15s ease;
                    z-index: 10;
                }
                #uw-a11y-panel .info-btn:hover + .tooltip,
                #uw-a11y-panel .info-btn:focus + .tooltip {
                    opacity: 1;
                    visibility: visible;
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
                    transition: height 0.4s ease-in-out;
                    box-sizing: border-box;
                }

                /* Initial animation states to prevent flash - fast transitions for GSAP override */
                #uw-a11y-wrapper {
                    opacity: 0;
                    transform: scale(0.9) translateY(20px);
                }

                /* Important: Only apply the initial offset when using the CSS fallback.
                   GSAP handles transforms when available, so the base <li> should not be offset. */
                #uw-a11y-nav ul li.uw-a11y-css-animate {
                    opacity: 0;
                    transform: translateX(-30px) scale(0.9);
                }

                /* CSS-only animations (fallback when GSAP not available) */
                #uw-a11y-wrapper.uw-a11y-css-animate {
                    transition: opacity 0.5s ease-out, transform 0.5s ease-out;
                }

                #uw-a11y-nav ul li.uw-a11y-css-animate {
                    transition: opacity 0.6s ease-out, transform 0.6s ease-out;
                }

                /* Stagger delays for CSS-only animations */
                #uw-a11y-nav ul li.uw-a11y-css-animate:nth-child(1) { transition-delay: 0.3s; }
                #uw-a11y-nav ul li.uw-a11y-css-animate:nth-child(2) { transition-delay: 0.4s; }
                #uw-a11y-nav ul li.uw-a11y-css-animate:nth-child(3) { transition-delay: 0.5s; }
                #uw-a11y-nav ul li.uw-a11y-css-animate:nth-child(4) { transition-delay: 0.6s; }

                /* Show elements when animations are ready */
                #uw-a11y-wrapper.uw-a11y-animate-in {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                }

                #uw-a11y-nav ul li.uw-a11y-animate-in {
                    opacity: 1;
                    transform: translateX(0) scale(1);
                }

                /* Respect reduced motion preference */
                @media (prefers-reduced-motion: reduce) {
                    #uw-a11y-panel #uw-a11y-content {
                        transition: none;
                    }
                    
                    #uw-a11y-nav ul li a {
                        transition: none;
                    }

                    /* Immediately show elements when reduced motion is preferred */
                    #uw-a11y-wrapper,
                    #uw-a11y-nav ul li {
                        opacity: 1 !important;
                        transform: none !important;
                        transition: none !important;
                    }
                }
                #uw-a11y-panel #uw-a11y-summary {
                    background: #f8f9fa;
                    /*border: 1px solid #dee2e6;*/
                    box-shadow: 0 6px 20px 0 rgba(0, 0, 0, 0.12);
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
                    cursor: default;
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
                    width: 18px;
                    height: 18px;
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
                 
                 #uw-a11y-panel .uw-a11y-issue.checked .uw-a11y-issue-icon.type-warning {
                     color: #155724;
                 }
                 
                 #uw-a11y-panel .uw-a11y-issue-title {
                     flex: 1;
                 }

                /* Unified icon styles for summary + issue items */
                #uw-a11y-panel .issue-type-icon svg {
                    width: 18px;
                    height: 18px;
                    display: inline-block;
                    vertical-align: middle;
                }
                #uw-a11y-panel .issue-type-icon { display: inline-flex; align-items: center; margin: 0 4px 0 6px; }
                #uw-a11y-panel .issue-type-icon.type-error svg,
                #uw-a11y-panel .uw-a11y-issue-icon.type-error { color: #dc3545; }
                #uw-a11y-panel .issue-type-icon.type-warning svg,
                #uw-a11y-panel .uw-a11y-issue-icon.type-warning { color: #e0a800; }
                #uw-a11y-panel .issue-type-icon.type-info svg,
                #uw-a11y-panel .uw-a11y-issue-icon.type-info { color: #17a2b8; }
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
                #uw-a11y-panel .filter-toggle .icon-eye-off { display: none; }
                #uw-a11y-panel .filter-toggle[aria-pressed="false"] .icon-eye { display: none; }
                #uw-a11y-panel .filter-toggle[aria-pressed="false"] .icon-eye-off { display: inline; }
                #uw-a11y-panel .filter-toggle {
                    background: none;
                    border: 1px solid rgba(0,0,0,0.15);
                    border-radius: 6px;
                    padding: 2px 6px;
                    cursor: pointer;
                    color: #333;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 12px;
                }
                #uw-a11y-panel .filter-toggle:hover {
                    background: rgba(0,0,0,0.05);
                }
                #uw-a11y-panel .filter-toggle:focus {
                    outline: 2px solid #007cba;
                    outline-offset: 2px;
                }
                #uw-a11y-panel .filter-toggle[aria-pressed="false"] {
                    opacity: 0.45;
                }
                #uw-a11y-panel .filter-icon { width: 16px; height: 16px; }
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

        // Check if user prefers reduced motion
        prefersReducedMotion: function() {
            return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        },

        // Load GSAP and initialize animations
        loadGSAP: function() {
            return new Promise((resolve, reject) => {
                // Check if user prefers reduced motion
                if (this.prefersReducedMotion()) {
                    console.log('🎯 Reduced motion preferred - animations disabled');
                    resolve(null);
                    return;
                }
                
                // Check if GSAP is already loaded
                if (window.gsap) {
                    resolve(window.gsap);
                    return;
                }
                
                // Load GSAP from CDN
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/gsap.min.js';
                script.onload = () => {
                    console.log('✨ GSAP loaded successfully');
                    resolve(window.gsap);
                };
                script.onerror = () => {
                    console.warn('❌ Failed to load GSAP, animations will be disabled');
                    resolve(null);
                };
                document.head.appendChild(script);
            });
        },

        // Setup initial height for smooth transitions
        setupInitialHeight: function() {
            const content = this.shadowRoot.getElementById('uw-a11y-content');
            if (!content) return;
            
            // Set initial height based on the first view (results)
            const initialHeight = this.measureViewHeight('results');
            const maxAllowedHeight = this.getMaxContentHeight();
            
            if (initialHeight) {
                content.style.height = initialHeight + 'px';
                content.style.maxHeight = maxAllowedHeight + 'px'; // Maintain max-height constraint
                content.style.overflowY = initialHeight >= maxAllowedHeight ? 'auto' : 'hidden';
            }
        },

        // Setup window resize handler to recalculate max heights
        setupResizeHandler: function() {
            if (this.resizeHandler) {
                window.removeEventListener('resize', this.resizeHandler);
            }
            
            this.resizeHandler = () => {
                const content = this.shadowRoot.getElementById('uw-a11y-content');
                if (!content) return;
                
                const maxAllowedHeight = this.getMaxContentHeight();
                const currentView = this.currentView || 'results';
                const idealHeight = this.measureViewHeight(currentView);
                const newHeight = Math.min(idealHeight, maxAllowedHeight);
                
                // Update max-height and current height if needed
                content.style.maxHeight = maxAllowedHeight + 'px';
                if (window.gsap && !this.prefersReducedMotion()) {
                    window.gsap.to(content, {
                        height: newHeight,
                        duration: 0.3,
                        ease: "power2.out"
                    });
                } else {
                    content.style.height = newHeight + 'px';
                }
                
                content.style.overflowY = newHeight >= maxAllowedHeight ? 'auto' : 'hidden';
            };
            
            window.addEventListener('resize', this.resizeHandler);
        },

        // Animate the entire panel entrance
        animatePanel: function() {
            const wrapper = this.shadowRoot.getElementById('uw-a11y-wrapper');
            if (!wrapper) return;
            
            if (window.gsap && !this.prefersReducedMotion()) {
                // Use GSAP for enhanced animations - no delay needed
                window.gsap.to(wrapper, {
                    scale: 1,
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    ease: "power3.out"
                });
            } else {
                // Use CSS animations as fallback or for reduced motion
                wrapper.classList.add('uw-a11y-css-animate');
                // Small delay to ensure DOM is ready
                setTimeout(() => {
                    wrapper.classList.add('uw-a11y-animate-in');
                }, 50);
            }
        },

        // Animate navigation items with stagger effect
        animateNavigation: function() {
            const navItems = this.shadowRoot.querySelectorAll('#uw-a11y-nav ul li');
            console.log('🎯 animateNavigation called, found', navItems.length, 'nav items');
            
            if (navItems.length === 0) {
                console.warn('❌ No navigation items found for animation');
                return;
            }
            
            if (window.gsap && !this.prefersReducedMotion()) {
                console.log('✨ Starting GSAP navigation animation');
                
                // Clear CSS transforms and let GSAP take full control
                navItems.forEach((item, index) => {
                    item.style.transform = '';
                    item.style.opacity = '';
                    console.log(`🔧 Cleared styles for nav item ${index + 1}`);
                });
                
                // Use GSAP for enhanced animations - set initial state and animate
                const tl = window.gsap.fromTo(navItems, 
                    {
                        x: -30, 
                        opacity: 0,
                        scale: 0.9
                    },
                    {
                        x: 0,
                        opacity: 1,
                        scale: 1,
                        duration: 0.6,
                        stagger: 0.1,
                        ease: "back.out(1.7)",
                        delay: 0.3,
                        onStart: () => console.log('🚀 GSAP nav animation started'),
                        onComplete: () => console.log('✅ GSAP nav animation completed')
                    }
                );
                
                console.log('📝 GSAP timeline created:', tl);
                
                // Add subtle hover animations with conflict prevention
                navItems.forEach(item => {
                    const link = item.querySelector('a');
                    if (!link) return;
                    
                    link.addEventListener('mouseenter', () => {
                        // Don't animate during view transitions or if reduced motion is preferred
                        if (this.isAnimating || this.prefersReducedMotion()) return;
                        
                        window.gsap.to(item, {
                            scale: 1.05,
                            duration: 0.3,
                            ease: "power2.out",
                            overwrite: "auto"
                        });
                    });
                    
                    link.addEventListener('mouseleave', () => {
                        // Don't animate if reduced motion is preferred
                        if (this.prefersReducedMotion()) return;
                        
                        window.gsap.to(item, {
                            scale: 1,
                            duration: 0.3,
                            ease: "power2.out",
                            overwrite: "auto"
                        });
                    });
                });
            } else {
                // Use CSS animations as fallback or for reduced motion
                navItems.forEach(item => {
                    item.classList.add('uw-a11y-css-animate');
                });
                
                // Small delay to ensure DOM is ready, then trigger staggered animation
                setTimeout(() => {
                    navItems.forEach((item, index) => {
                        setTimeout(() => {
                            item.classList.add('uw-a11y-animate-in');
                        }, index * 100); // 100ms stagger
                    });
                }, 100);
            }
        },

        // Calculate the maximum allowed content height
        getMaxContentHeight: function() {
            // Calculate 85vh minus the header height (approximately 60px)
            const maxHeight = Math.floor(window.innerHeight * 0.85) - 60;
            return Math.max(200, maxHeight); // Minimum height of 200px
        },

        // Measure the height of a specific view section with max-height constraint
        measureViewHeight: function(viewName) {
            const viewEl = this.shadowRoot.getElementById(`uw-a11y-view-${viewName}`);
            if (!viewEl) return null;
            
            // Temporarily show the element to measure its height
            const wasHidden = viewEl.hasAttribute('hidden');
            const originalStyles = {
                position: viewEl.style.position,
                visibility: viewEl.style.visibility,
                height: viewEl.style.height
            };
            
            // Make it measurable but invisible
            viewEl.removeAttribute('hidden');
            viewEl.style.position = 'absolute';
            viewEl.style.visibility = 'hidden';
            viewEl.style.height = 'auto';
            
            // Measure the natural height
            const naturalHeight = viewEl.scrollHeight;
            const maxAllowedHeight = this.getMaxContentHeight();
            
            // Use the smaller of natural height or max allowed height
            const targetHeight = Math.min(naturalHeight, maxAllowedHeight);
            
            // Restore original state
            if (wasHidden) viewEl.setAttribute('hidden', '');
            viewEl.style.position = originalStyles.position;
            viewEl.style.visibility = originalStyles.visibility;
            viewEl.style.height = originalStyles.height;
            
            return targetHeight;
        },

        // Animate the panel height transition
        animatePanelHeight: function(targetHeight) {
            if (!window.gsap) return Promise.resolve();
            
            const content = this.shadowRoot.getElementById('uw-a11y-content');
            if (!content) return Promise.resolve();
            
            // Kill any existing height animations
            window.gsap.killTweensOf(content);
            
            return new Promise((resolve) => {
                window.gsap.to(content, {
                    height: targetHeight,
                    duration: 0.4,
                    ease: "power2.inOut",
                    onComplete: resolve
                });
            });
        },

        // Animate navigation view transitions with height changes
        animateViewTransition: function(currentView, newView) {
            if (!window.gsap) return Promise.resolve();
            
            const currentEl = this.shadowRoot.getElementById(`uw-a11y-view-${currentView}`);
            const newEl = this.shadowRoot.getElementById(`uw-a11y-view-${newView}`);
            const content = this.shadowRoot.getElementById('uw-a11y-content');
            
            return new Promise((resolve) => {
                // Kill any existing animations on these elements
                if (currentEl) window.gsap.killTweensOf(currentEl);
                if (newEl) window.gsap.killTweensOf(newEl);
                if (content) window.gsap.killTweensOf(content);
                
                if (!currentEl || !newEl || currentView === newView) {
                    resolve();
                    return;
                }
                
                // Measure the target height for the new view
                const targetHeight = this.measureViewHeight(newView);
                if (!targetHeight) {
                    resolve();
                    return;
                }
                
                // Animate current view out and start height transition
                window.gsap.to(currentEl, {
                    opacity: 0,
                    y: -10,
                    duration: 0.2,
                    ease: "power2.in",
                    onComplete: () => {
                        // Switch visibility
                        currentEl.setAttribute('hidden', '');
                        newEl.removeAttribute('hidden');
                        
                        // Ensure we don't exceed max height and manage overflow
                        const maxAllowedHeight = this.getMaxContentHeight();
                        const finalHeight = Math.min(targetHeight, maxAllowedHeight);
                        
                        // Update overflow based on whether content will be scrollable
                        content.style.overflowY = finalHeight >= maxAllowedHeight ? 'auto' : 'hidden';
                        
                        // Animate height change and new view in simultaneously
                        const heightTween = window.gsap.to(content, {
                            height: finalHeight,
                            duration: 0.4,
                            ease: "power2.inOut"
                        });
                        
                        // Animate new view in
                        window.gsap.fromTo(newEl, 
                            { opacity: 0, y: 10 },
                            { 
                                opacity: 1, 
                                y: 0,
                                duration: 0.3,
                                ease: "power2.out",
                                delay: 0.1,
                                onComplete: resolve
                            }
                        );
                    }
                });
            });
        },

        // Initialize left-hand navigation
        initNavigation: function() {
            // Initialize current view tracker
            this.currentView = null;
            this.isAnimating = false;
            
            const map = [
                { id: 'uw-a11y-nav-results', view: 'results' },
                { id: 'uw-a11y-nav-settings', view: 'settings' },
                { id: 'uw-a11y-nav-help', view: 'help' },
                { id: 'uw-a11y-nav-about', view: 'about' }
            ];
            map.forEach(({ id, view }) => {
                const link = this.shadowRoot.getElementById(id);
                if (link) {
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        // Prevent rapid clicking during animations
                        if (this.isAnimating) return;
                        this.showView(view);
                    });
                }
            });
            // Default to results
            this.showView('results');
        },

        // Show a specific view and update nav state
        showView: function(view) {
            const views = ['results', 'settings', 'help', 'about'];
            const currentView = this.currentView;
            
            // Don't do anything if we're already on this view or currently animating
            if (currentView === view || this.isAnimating) return;
            
            // Update current view tracker
            this.currentView = view;
            
            // Update nav links active state first (without animation conflicts)
            this.updateNavActiveState(view);
            
            // Check if animations should be used
            const shouldAnimate = window.gsap && currentView && currentView !== view && !this.prefersReducedMotion();
            
            if (shouldAnimate) {
                this.isAnimating = true;
                this.animateViewTransition(currentView, view).then(() => {
                    this.isAnimating = false;
                    if (view === 'results') {
                        // Run score animation after the results view is visible
                        this.startResultsScoreAnimation();
                    }
                });
            } else {
                // Instant transition for reduced motion or no GSAP
                views.forEach(v => {
                    const el = this.shadowRoot.getElementById(`uw-a11y-view-${v}`);
                    if (!el) return;
                    if (v === view) {
                        el.removeAttribute('hidden');
                    } else {
                        el.setAttribute('hidden', '');
                    }
                });
                
                // Instantly adjust height if needed
                if (currentView && currentView !== view) {
                    const content = this.shadowRoot.getElementById('uw-a11y-content');
                    if (content) {
                        const targetHeight = this.measureViewHeight(view);
                        const maxAllowedHeight = this.getMaxContentHeight();
                        const finalHeight = Math.min(targetHeight, maxAllowedHeight);
                        
                        content.style.height = finalHeight + 'px';
                        content.style.overflowY = finalHeight >= maxAllowedHeight ? 'auto' : 'hidden';
                    }
                }

                if (view === 'results') {
                    this.startResultsScoreAnimation();
                }
            }
        },

        // Update navigation active state without animation conflicts
        updateNavActiveState: function(activeView) {
            const views = ['results', 'settings', 'help', 'about'];
            
            views.forEach(v => {
                const link = this.shadowRoot.getElementById(`uw-a11y-nav-${v}`);
                if (!link) return;
                
                // Kill any existing GSAP animations on this link
                if (window.gsap) {
                    window.gsap.killTweensOf(link);
                }
                
                if (v === activeView) {
                    link.classList.add('active');
                    link.setAttribute('aria-current', 'page');
                } else {
                    link.classList.remove('active');
                    link.removeAttribute('aria-current');
                    // Reset any inline styles that GSAP might have added
                    if (window.gsap) {
                        window.gsap.set(link, { backgroundColor: '' });
                    }
                }
            });
        },

        // SETTINGS: defaults and persistence
        // Always-excluded internal selectors (not user-configurable)
        getEssentialExcludeSelectors: function() {
            return [
                '#uw-a11y-container',
                '#uw-a11y-panel',
                '.uw-a11y-highlight',
                '[id^="uw-a11y-"]',
                '[class*="uw-a11y-"]',
                '#uw-a11y-global-styles'
            ];
        },
        // Default user-adjustable excludes (shown in Settings)
        getDefaultExcludeSelectors: function() {
            return [
                '#wpadminbar'
            ];
        },

        getSettingsKey: function() { return 'uw-a11y-settings'; },

        loadSettings: function() {
            try {
                const json = localStorage.getItem(this.getSettingsKey());
                if (!json) return {};
                const parsed = JSON.parse(json);
                return parsed && typeof parsed === 'object' ? parsed : {};
            } catch (_) { return {}; }
        },

        saveSettings: function(settings) {
            try {
                localStorage.setItem(this.getSettingsKey(), JSON.stringify(settings || {}));
            } catch (_) { /* ignore quota errors */ }
        },

        // Whether best-practice suggestions are enabled (default: true)
        isBestPracticesEnabled: function() {
            const s = this.loadSettings();
            return s.enableBestPractices !== false; // default true unless explicitly false
        },

        // Combine user excludes with enforced internal ones
        getEffectiveExcludeSelectors: function() {
            const essentials = this.getEssentialExcludeSelectors();
            const defaults = this.getDefaultExcludeSelectors();
            const s = this.loadSettings();
            const user = Array.isArray(s.excludeSelectors) ? s.excludeSelectors : (typeof s.excludeSelectors === 'string' ? s.excludeSelectors.split(',') : []);
            const clean = (user || [])
                .map(v => (v || '').toString().trim())
                .filter(Boolean);
            // Merge in order: essentials (always), defaults, then user additions
            return [...new Set([ ...essentials, ...defaults, ...clean ])];
        },

        // Check if an element should be excluded by settings
        shouldExcludeElement: function(el) {
            try {
                const selectors = this.getEffectiveExcludeSelectors();
                for (const sel of selectors) {
                    if (!sel) continue;
                    try {
                        if (el.matches(sel)) return true;
                        if (el.closest && el.closest(sel)) return true;
                    } catch (_) { /* invalid selector safety */ }
                }
            } catch (_) { /* ignore */ }
            return false;
        },

        // WCAG selection helpers
        getDefaultWcag: function() { return { wcagSpec: '2.1', wcagLevel: 'AA' }; },
        getSelectedWcag: function() {
            const s = this.loadSettings();
            const d = this.getDefaultWcag();
            return { wcagSpec: s.wcagSpec || d.wcagSpec, wcagLevel: s.wcagLevel || d.wcagLevel };
        },
        buildWcagTags: function(spec, level) {
            const lvl = (level || 'AA').toUpperCase();
            const levelKey = lvl.toLowerCase(); // 'a' | 'aa' | 'aaa'
            const specs = ['2.0','2.1','2.2'];
            const chosenIdx = Math.max(0, specs.indexOf(spec || '2.1'));
            const tags = [];
            for (let i = 0; i <= chosenIdx; i++) {
                const s = specs[i].replace('.', ''); // '20','21','22'
                const prefix = i === 0 ? 'wcag2' : `wcag${s}`;
                tags.push(`${prefix}${levelKey}`);
            }
            // Also include lower levels implicitly when AA/AAA chosen
            if (lvl === 'AA' || lvl === 'AAA') {
                for (let i = 0; i <= chosenIdx; i++) {
                    const s = specs[i].replace('.', '');
                    const prefix = i === 0 ? 'wcag2' : `wcag${s}`;
                    if (!tags.includes(`${prefix}a`)) tags.push(`${prefix}a`);
                }
            }
            if (lvl === 'AAA') {
                for (let i = 0; i <= chosenIdx; i++) {
                    const s = specs[i].replace('.', '');
                    const prefix = i === 0 ? 'wcag2' : `wcag${s}`;
                    if (!tags.includes(`${prefix}aa`)) tags.push(`${prefix}aa`);
                }
            }
            return tags;
        },

        getWcagLabel: function() {
            const { wcagSpec, wcagLevel } = this.getSelectedWcag();
            return `WCAG ${wcagSpec} ${String(wcagLevel || '').toUpperCase()}`;
        },

        resetSettingsToDefaults: function() {
            const defaults = { 
                excludeSelectors: this.getDefaultExcludeSelectors(),
                enableBestPractices: true,
                ...this.getDefaultWcag()
            };
            this.saveSettings(defaults);
            return defaults;
        },

        // Render the Settings view (called after panel creation)
        renderSettings: function() {
            const wrap = this.shadowRoot.getElementById('uw-a11y-view-settings');
            if (!wrap) return;

            const settings = this.loadSettings();
            // Show only user-adjustable selectors in the input (strip essentials)
            const renderList = Array.isArray(settings.excludeSelectors) ? settings.excludeSelectors : this.getDefaultExcludeSelectors();
            const current = this.filterOutEssential(renderList).join(', ');
            const bp = settings.enableBestPractices !== false; // default true
            const wcag = { ...(this.getDefaultWcag()), wcagSpec: settings.wcagSpec || '2.1', wcagLevel: (settings.wcagLevel || 'AA').toUpperCase() };

            wrap.innerHTML = `
                <div class="uw-a11y-settings" role="region" aria-labelledby="uw-a11y-settings-heading">
                    <h3 id="uw-a11y-settings-heading">Settings</h3>
                    <div class="uw-a11y-form-row">
                        <label for="uw-a11y-exclude-input"><strong>Exclude Selectors</strong></label>
                        <input id="uw-a11y-exclude-input" class="uw-a11y-input" type="text" value="${this.escapeHtmlAttr(current)}" aria-describedby="uw-a11y-exclude-help">
                        <div id="uw-a11y-exclude-help" class="uw-a11y-helptext">Comma‑separated CSS selectors skipped during scanning. Essential internal UI is always excluded.</div>
                        <div id="uw-a11y-settings-msg" class="uw-a11y-msg" aria-live="polite"></div>
                    </div>
                    <div class="uw-a11y-form-row">
                        <label for="uw-a11y-wcag-spec"><strong>WCAG Specification</strong></label>
                        <select id="uw-a11y-wcag-spec" class="uw-a11y-input">
                            <option value="2.0" ${wcag.wcagSpec==='2.0'?'selected':''}>WCAG 2.0</option>
                            <option value="2.1" ${wcag.wcagSpec==='2.1'?'selected':''}>WCAG 2.1</option>
                            <option value="2.2" ${wcag.wcagSpec==='2.2'?'selected':''}>WCAG 2.2</option>
                        </select>
                        <div class="uw-a11y-helptext">Choose which WCAG version to target. Default is 2.1.</div>
                    </div>
                    <div class="uw-a11y-form-row">
                        <label for="uw-a11y-wcag-level"><strong>WCAG Level</strong></label>
                        <select id="uw-a11y-wcag-level" class="uw-a11y-input">
                            <option value="A" ${wcag.wcagLevel==='A'?'selected':''}>Level A</option>
                            <option value="AA" ${wcag.wcagLevel==='AA'?'selected':''}>Level AA</option>
                            <option value="AAA" ${wcag.wcagLevel==='AAA'?'selected':''}>Level AAA</option>
                        </select>
                        <div class="uw-a11y-helptext">Default is AA. Selecting AAA enables extra rules like enhanced color contrast.</div>
                    </div>
                    <div class="uw-a11y-form-row">
                        <label>
                            <input id="uw-a11y-bp-input" type="checkbox" ${bp ? 'checked' : ''}>
                            <span>Include best‑practice suggestions</span>
                        </label>
                        <div class="uw-a11y-helptext">Additional tips beyond WCAG failures, like link text clarity or new‑tab labeling.</div>
                        <div class="uw-a11y-actions">
                            <button id="uw-a11y-save-settings" class="uw-a11y-btn primary">Save and Re‑scan</button>
                            <button id="uw-a11y-reset-settings" class="uw-a11y-btn" title="Reset to defaults">
                                <svg class="uw-a11y-reset-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 5V1L7 6l5 5V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7z"/></svg>
                                Reset
                            </button>
                        </div>
                    </div>
                </div>
            `;

            const input = this.shadowRoot.getElementById('uw-a11y-exclude-input');
            const msg = this.shadowRoot.getElementById('uw-a11y-settings-msg');
            const saveBtn = this.shadowRoot.getElementById('uw-a11y-save-settings');
            const resetBtn = this.shadowRoot.getElementById('uw-a11y-reset-settings');
            const bpInput = this.shadowRoot.getElementById('uw-a11y-bp-input');
            const wcagSpecSel = this.shadowRoot.getElementById('uw-a11y-wcag-spec');
            const wcagLevelSel = this.shadowRoot.getElementById('uw-a11y-wcag-level');

            const parseSelectors = (val) => val.split(',').map(s => s.trim()).filter(Boolean);
            const validateSelectors = (arr) => {
                for (const sel of arr) {
                    try { document.querySelectorAll(sel); } catch (e) { return sel; }
                }
                return null;
            };

            saveBtn.addEventListener('click', () => {
                const arr = parseSelectors(input.value || '');
                const bad = validateSelectors(arr);
                if (bad) {
                    msg.textContent = `Invalid selector: ${bad}`;
                    msg.className = 'uw-a11y-msg err';
                    return;
                }
                const toSave = { 
                    // Persist only non-essential selectors
                    excludeSelectors: this.filterOutEssential(arr),
                    enableBestPractices: !!(bpInput && bpInput.checked),
                    wcagSpec: wcagSpecSel ? wcagSpecSel.value : '2.1',
                    wcagLevel: wcagLevelSel ? wcagLevelSel.value : 'AA'
                };
                this.saveSettings(toSave);
                msg.textContent = 'Saved. Re‑scanning…';
                msg.className = 'uw-a11y-msg ok';
                // Ensure the score dial re-animates after a settings-driven re-scan
                this.scoreAnimationPlayed = false;
                // Re-run analysis with new settings
                this.runAxeChecks();
                this.showView('results');
            });

            resetBtn.addEventListener('click', () => {
                const defaults = this.resetSettingsToDefaults();
                input.value = this.filterOutEssential(defaults.excludeSelectors).join(', ');
                if (bpInput) bpInput.checked = !!defaults.enableBestPractices;
                if (wcagSpecSel) wcagSpecSel.value = defaults.wcagSpec;
                if (wcagLevelSel) wcagLevelSel.value = defaults.wcagLevel;
                msg.textContent = 'Settings reset to defaults.';
                msg.className = 'uw-a11y-msg ok';
            });

        },

        // Remove essential/selectors from a provided list
        filterOutEssential: function(list) {
            const essentials = new Set(this.getEssentialExcludeSelectors());
            return (list || []).filter(sel => !essentials.has(sel));
        },

        // Escape for attribute values
        escapeHtmlAttr: function(str) {
            return (str || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
        },
        
        // Get axe-core version dynamically
        getAxeVersion: function() {
            if (window.axe && window.axe.version) {
                return window.axe.version;
            }
            return 'unknown';
        },

        // Load and save filter preferences (persisted in localStorage)
        loadFilters: function() {
            try {
                const stored = localStorage.getItem('uw-a11y-filters');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    this.filters = { errors: true, warnings: true, info: true, ...parsed };
                }
            } catch (e) { /* ignore */ }
        },
        saveFilters: function() {
            try {
                localStorage.setItem('uw-a11y-filters', JSON.stringify(this.filters));
            } catch (e) { /* ignore */ }
        },
        toggleFilter: function(kind) {
            if (!['errors','warnings','info'].includes(kind)) return;
            this.filters[kind] = !this.filters[kind];
            this.saveFilters();
            this.updateFilterUI();
            this.refreshIssueList();
        },
        updateFilterUI: function() {
            const setState = (id, pressed) => {
                const btn = this.shadowRoot.getElementById(id);
                if (btn) btn.setAttribute('aria-pressed', pressed ? 'true' : 'false');
                const row = btn?.closest('.violationtype');
                if (row) row.style.color = pressed ? '#000' : '#ccc';
            };
            setState('toggle-errors', this.filters.errors);
            setState('toggle-warnings', this.filters.warnings);
            setState('toggle-info', this.filters.info);
        },
        getIssuesForFilters: function() {
            return this.issues.filter(i =>
                (i.type === 'error' && this.filters.errors) ||
                (i.type === 'warning' && this.filters.warnings) ||
                (i.type === 'info' && this.filters.info)
            );
        },
        refreshIssueList: function() {
            const results = this.shadowRoot.getElementById('uw-a11y-results');
            if (!results) return;
            const issuesToShow = this.getIssuesForFilters();
            if (issuesToShow.length === 0) {
                results.innerHTML = `
                    <div class="uw-a11y-issue info">
                        <h4>No issues to display</h4>
                        <p>Adjust the filters above to show hidden groups.</p>
                    </div>
                `;
                return;
            }
            const groupedIssues = this.groupIssuesByRule(issuesToShow);
            const generatedHtml = Object.keys(groupedIssues).map((ruleId, index) => {
                const issueGroup = groupedIssues[ruleId];
                const firstIssue = issueGroup[0];
                const isManualReview = firstIssue.type === 'warning' && firstIssue.uniqueId;
                const instanceNavigation = issueGroup.length > 1 ? `
                        <div class=\"uw-a11y-instance-nav\">
                            <span class=\"uw-a11y-instance-count\">Instance <span id=\"current-${this.sanitizeHtmlId(ruleId)}\">1</span> of ${issueGroup.length}</span>
                            <div class=\"uw-a11y-nav-buttons\">
                                <button onclick=\"window.uwAccessibilityChecker.navigateInstance('${this.escapeJavaScript(ruleId)}', -1); event.stopPropagation();\" 
                                        id=\"prev-${this.sanitizeHtmlId(ruleId)}\" disabled>‹ Prev</button>
                                <button onclick=\"window.uwAccessibilityChecker.navigateInstance('${this.escapeJavaScript(ruleId)}', 1); event.stopPropagation();\" 
                                        id=\"next-${this.sanitizeHtmlId(ruleId)}\">Next ›</button>
                            </div>
                        </div>
                    ` : '';
                const iconSvg = this.getIssueTypeIcon(firstIssue.type, 'issue');
                return `
                    <div class=\"uw-a11y-issue ${firstIssue.type} ${isManualReview && this.isRuleVerified(ruleId) ? 'checked' : ''}\" 
                         onclick=\"window.uwAccessibilityChecker.highlightCurrentInstance('${this.escapeJavaScript(ruleId)}')\" 
                         onkeydown=\"if(event.key==='Enter'||event.key===' '){event.preventDefault();window.uwAccessibilityChecker.highlightCurrentInstance('${this.escapeJavaScript(ruleId)}');}\"
                         tabindex=\"0\"
                         role=\"button\" 
                         aria-label=\"Click to highlight ${this.escapeHtmlAttribute(firstIssue.title)} on the page${issueGroup.length > 1 ? ` (${issueGroup.length} instances)` : ''}\"
                         id=\"issue-${this.sanitizeHtmlId(ruleId)}\">
                         ${instanceNavigation}
                        <h4>
                            <span class=\"uw-a11y-issue-header\">${iconSvg}<span class=\"uw-a11y-issue-title\">${this.escapeHtmlContent(firstIssue.title)} ${issueGroup.length > 1 ? `(${issueGroup.length} instances)` : ''}</span></span>
                        </h4>
                        <div class=\"how-to-fix\"><div class=\"how-to-fix-icon\"><svg viewBox=\"0 0 512 512\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M331.8 224.1c28.29 0 54.88 10.99 74.86 30.97l19.59 19.59c40.01-17.74 71.25-53.3 81.62-96.65c5.725-23.92 5.34-47.08 .2148-68.4c-2.613-10.88-16.43-14.51-24.34-6.604l-68.9 68.9h-75.6V97.2l68.9-68.9c7.912-7.912 4.275-21.73-6.604-24.34c-21.32-5.125-44.48-5.51-68.4 .2148c-55.3 13.23-98.39 60.22-107.2 116.4C224.5 128.9 224.2 137 224.3 145l82.78 82.86C315.2 225.1 323.5 224.1 331.8 224.1zM384 278.6c-23.16-23.16-57.57-27.57-85.39-13.9L191.1 158L191.1 95.99l-127.1-95.99L0 63.1l96 127.1l62.04 .0077l106.7 106.6c-13.67 27.82-9.251 62.23 13.91 85.39l117 117.1c14.62 14.5 38.21 14.5 52.71-.0016l52.75-52.75c14.5-14.5 14.5-38.08-.0016-52.71L384 278.6zM227.9 307L168.7 247.9l-148.9 148.9c-26.37 26.37-26.37 69.08 0 95.45C32.96 505.4 50.21 512 67.5 512s34.54-6.592 47.72-19.78l119.1-119.1C225.5 352.3 222.6 329.4 227.9 307zM64 472c-13.25 0-24-10.75-24-24c0-13.26 10.75-24 24-24S88 434.7 88 448C88 461.3 77.25 472 64 472z\"/></svg></div><div><strong>How to fix:</strong> <span id=\"recommendation-${this.sanitizeHtmlId(ruleId)}\"></span></div></div>
                        ${isManualReview ? `
                        <div class=\"uw-a11y-manual-check\"> 
                          <label class=\"uw-a11y-checkbox\"> 
                            <input type=\"checkbox\" id=\"check-${this.sanitizeHtmlId(ruleId)}\" ${this.isRuleVerified(ruleId) ? 'checked' : ''} 
                                   onchange=\"window.uwAccessibilityChecker.toggleRuleVerification('${this.escapeJavaScript(ruleId)}'); event.stopPropagation();\"> 
                            <span class=\"uw-a11y-checkmark\"></span>
                            <span class=\"uw-a11y-check-label\">${this.isRuleVerified(ruleId) ? `All ${issueGroup.length} instances manually verified ✓` : `Mark all ${issueGroup.length} instances as verified`}</span>
                          </label>
                        </div>` : ''}
                        ${firstIssue.detailedInfo && firstIssue.detailedInfo.length > 0 ? `
                            <button class=\"uw-a11y-details-toggle\" onclick=\"window.uwAccessibilityChecker.toggleDetails('${this.escapeJavaScript(ruleId)}'); event.stopPropagation();\">Show technical details</button>
                            <div class=\"uw-a11y-details\" id=\"details-${this.sanitizeHtmlId(ruleId)}\"><div id=\"detailed-content-${this.sanitizeHtmlId(ruleId)}\">${this.renderDetailedInfo(firstIssue.detailedInfo)}</div></div>
                        ` : ''}
                        <div class=\"issue-meta\"><div><strong>Impact:</strong> ${this.escapeHtmlContent(firstIssue.impact || 'unknown')}
                        ${firstIssue.helpUrl ? `<br><a href=\"${this.escapeUrl(firstIssue.helpUrl)}\" target=\"_blank\" class=\"learn-more\">Learn more about this rule</a>` : ''}
                        </div></div>
                    </div>`;
            }).join('');
            results.innerHTML = generatedHtml;
            // initialize rec content
            Object.keys(groupedIssues).forEach(ruleId => {
                const issueGroup = groupedIssues[ruleId];
                const firstIssue = issueGroup[0];
                const recElement = this.shadowRoot.getElementById(`recommendation-${ruleId}`);
                if (recElement) recElement.innerHTML = firstIssue.recommendation;
            });
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
        
        // Announce results to screen readers via ARIA live region
        announceResults: function(scoreData, counts) {
            const announcements = this.shadowRoot.getElementById('uw-a11y-announcements');
            if (!announcements) return;
            
            let message = '';
            
            if (scoreData) {
                const score = scoreData.score;
                const ratingText = score >= 97 ? 'Excellent' : 
                                  score >= 90 ? 'Very Good' : 
                                  score >= 70 ? 'Good' : 
                                  score >= 50 ? 'Fair' : 
                                  'Needs immediate attention';
                
                message += `Accessibility test complete. Score: ${score} out of 100, rated as ${ratingText}. `;
            }
            
            const totalIssues = counts.error + counts.warning;
            if (totalIssues === 0) {
                message += 'No accessibility violations found. Excellent work!';
            } else {
                message += `Found ${totalIssues} total issues: `;
                if (counts.error > 0) {
                    message += `${counts.error} violation${counts.error === 1 ? '' : 's'} requiring immediate attention`;
                }
                if (counts.warning > 0) {
                    if (counts.error > 0) message += ' and ';
                    message += `${counts.warning} item${counts.warning === 1 ? '' : 's'} requiring manual review`;
                }
                if (counts.warningChecked > 0) {
                    message += `. ${counts.warningChecked} item${counts.warningChecked === 1 ? '' : 's'} already verified`;
                }
                message += '. Navigate through the list below to review each issue.';
            }
            
            // Use setTimeout to ensure the live region is ready
            setTimeout(() => {
                announcements.textContent = message;
            }, 500);
        },
        
        // Set focus to the accessibility checker panel for keyboard navigation
        setFocusToPanel: function() {
            // Use a small delay to ensure DOM is fully rendered
            setTimeout(() => {
                const panel = this.shadowRoot.getElementById('uw-a11y-panel');
                if (panel) {
                    panel.focus();
                    // Scroll into view if needed
                    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }, 100);
        },
        
        // Update visibility of elements with if-issues class
        updateIfIssuesVisibility: function() {
            const hasIssues = this.issues.length > 0;
            const ifIssuesElements = this.shadowRoot.querySelectorAll('.if-issues');
            
            ifIssuesElements.forEach(element => {
                if (hasIssues) {
                    element.style.display = '';
                } else {
                    element.style.display = 'none';
                }
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
            
            // Update visibility of elements with if-issues class
            this.updateIfIssuesVisibility();
            

            
            // Get accessibility score
            const scoreData = this.axeResults ? this.axeResults.score : null;
            
            // Load and apply saved filter preferences
            this.loadFilters();

            // Display summary with score dial and accessibility announcements
            summary.innerHTML = `
                <!-- ARIA live region for screen reader announcements -->
                <div id="uw-a11y-announcements" aria-live="polite" aria-atomic="true" class="sr-only"></div>
                
                ${scoreData ? this.renderScoreDial(scoreData) : ''}
                
                <!-- Accessible summary section -->
                <div role="region" aria-labelledby="uw-a11y-summary-heading">
                    <h3 id="uw-a11y-summary-heading" class="sr-only">Accessibility Test Results Summary</h3>
                    
                    <p><strong>Total Issues Found:</strong> ${this.issues.length}</p>
                    
                    <div style="margin: 8px 0;" role="list" aria-label="Issue breakdown by type">
                        <div role="listitem" class="violationtype">
                            <div class="info-with-tooltip">
                                <span id="count-error" class="uw-a11y-count count-error" aria-label="${counts.error} violations requiring immediate attention">${counts.error}</span> <span class="issue-type-icon type-error">${this.getIssueTypeIcon('error','summary')}</span>Violations
                                <button class="info-btn" aria-label="What does Violations mean?" aria-describedby="tip-violations">i</button>
                                <span id="tip-violations" class="tooltip" role="tooltip">These are accessibility failures that must be fixed.</span>
                            </div>
                            <button id="toggle-errors" class="filter-toggle" aria-pressed="true" aria-label="Toggle showing violations" onclick="window.uwAccessibilityChecker.toggleFilter('errors')">
                                <svg class="filter-icon icon-eye" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/></svg>
                                <svg class="filter-icon icon-eye-off" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 3l18 18M10.58 10.58A3 3 0 0012 15a3 3 0 002.42-4.42M9.88 4.24A10.94 10.94 0 0112 5c7 0 11 7 11 7a18.94 18.94 0 01-5.06 5.94M6.26 6.26A18.94 18.94 0 001 12s4 7 11 7a10.94 10.94 0 004.24-.88" stroke="currentColor" stroke-width="2"/></svg>
                            </button>
                        </div>
                        <div role="listitem" class="violationtype">
                            <div class="info-with-tooltip">
                                <span id="count-warning" class="uw-a11y-count count-warning" aria-label="${counts.warning} manual review items">${counts.warning}</span> <span class="issue-type-icon type-warning">${this.getIssueTypeIcon('warning','summary')}</span>Manual Review
                                <button class="info-btn" aria-label="What does Manual Review mean?" aria-describedby="tip-manual">i</button>
                                <span id="tip-manual" class="tooltip" role="tooltip">These items need human verification.</span>
                            </div>
                            <button id="toggle-warnings" class="filter-toggle" aria-pressed="true" aria-label="Toggle showing manual review" onclick="window.uwAccessibilityChecker.toggleFilter('warnings')">
                                <svg class="filter-icon icon-eye" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/></svg>
                                <svg class="filter-icon icon-eye-off" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 3l18 18M10.58 10.58A3 3 0 0012 15a3 3 0 002.42-4.42M9.88 4.24A10.94 10.94 0 0112 5c7 0 11 7 11 7a18.94 18.94 0 01-5.06 5.94M6.26 6.26A18.94 18.94 0 001 12s4 7 11 7a10.94 10.94 0 004.24-.88" stroke="currentColor" stroke-width="2"/></svg>
                            </button>
                        </div>
                        <div role="listitem" class="violationtype">
                            <div class="info-with-tooltip">
                                <span id="count-info" class="uw-a11y-count count-info" aria-label="${counts.info} best-practice suggestions">${counts.info}</span> <span class="issue-type-icon type-info">${this.getIssueTypeIcon('info','summary')}</span>Best Practices
                                <button class="info-btn" aria-label="What does Best Practices mean?" aria-describedby="tip-best">i</button>
                                <span id="tip-best" class="tooltip" role="tooltip">Suggestions to improve usability and clarity.</span>
                            </div>
                            <button id="toggle-info" class="filter-toggle" aria-pressed="true" aria-label="Toggle showing best practices" onclick="window.uwAccessibilityChecker.toggleFilter('info')">
                                <svg class="filter-icon icon-eye" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/></svg>
                                <svg class="filter-icon icon-eye-off" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 3l18 18M10.58 10.58A3 3 0 0012 15a3 3 0 002.42-4.42M9.88 4.24A10.94 10.94 0 0112 5c7 0 11 7 11 7a18.94 18.94 0 01-5.06 5.94M6.26 6.26A18.94 18.94 0 001 12s4 7 11 7a10.94 10.94 0 004.24-.88" stroke="currentColor" stroke-width="2"/></svg>
                            </button>
                        </div>
                        ${counts.warningChecked > 0 ? `
                            <div role="listitem" class="violationtype">
                                <div>
                                    <span id="count-verified" class="uw-a11y-count count-verified" aria-label="${counts.warningChecked} verified items">${counts.warningChecked}</span>Verified
                                    <span class="sr-only"> - These manual review items have been checked and confirmed</span>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                ${this.axeResults ? `
                    <div class="axe-summary">
                        <strong>Standard:</strong> ${this.getWcagLabel()}
                    </div>
                ` : ''}
            `;
            // Animate the score dial and number on initial render
            this.startResultsScoreAnimation();
            // Initialize filter toggle UI state
            this.updateFilterUI();

            // Display issues
            if (this.issues.length === 0) {
                results.innerHTML = `
                    <div class="uw-a11y-issue info">
                        <h4>Excellent Accessibility!</h4>
                        <p>No accessibility violations detected by axe-core. Your page meets ${this.getWcagLabel()} automated testing standards.</p>
                        <p><strong>Next Steps:</strong> Consider manual testing with screen readers and keyboard navigation for complete accessibility validation.</p>
                    </div>
                `;
            } else {
                // Render issue list using current filters
                this.refreshIssueList();
            }
            
            // Announce results to screen readers
            this.announceResults(scoreData, counts);
            
            // Set focus to the panel for keyboard accessibility
            this.setFocusToPanel();
        },
        

        
        // Render the accessibility score dial
        // Helper function to create gradient with multiple stops
        createScoreGradient: function(score, percentage) {
            let gradientStops;
            
            if (score >= 90) {
                // Dark green to light green for excellent scores
                gradientStops = `#1e7e34 0deg, #28a745 ${percentage * 0.3}deg, #34ce57 ${percentage * 0.6}deg, #40d969 ${percentage}deg`;
            } else if (score >= 70) {
                // Dark yellow/amber to light yellow
                gradientStops = `#e6a800 0deg, #ffc107 ${percentage * 0.3}deg, #ffce3a ${percentage * 0.6}deg, #ffd96a ${percentage}deg`;
            } else if (score >= 50) {
                // Dark orange to light orange
                gradientStops = `#dc6002 0deg, #fd7e14 ${percentage * 0.3}deg, #ff8c42 ${percentage * 0.6}deg, #ff9a56 ${percentage}deg`;
            } else {
                // Dark red to light red
                gradientStops = `#a71e2a 0deg, #dc3545 ${percentage * 0.3}deg, #e55666 ${percentage * 0.6}deg, #ee6674 ${percentage}deg`;
            }
            
            return `conic-gradient(from 0deg, ${gradientStops}, #e9ecef ${percentage}deg 360deg)`;
        },

        // Return a consistent SVG icon for a given issue type
        // variant: 'issue' | 'summary' (controls class names)
        getIssueTypeIcon: function(type, variant) {
            const cls = variant === 'issue' ? 'uw-a11y-issue-icon' : '';
            const base = (extra) => extra ? `${cls} ${extra}` : cls;
            if (type === 'error') {
                // Alert triangle
                return `<svg class="${base('type-error')}" viewBox="0 0 24 24" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 9v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M12 17h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
            }
            if (type === 'warning') {
                // Magnifying glass (manual review)
                return `<svg class="${base('type-warning')}" viewBox="0 0 512 512" width="18" height="18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M456.69,421.39,362.6,327.3a173.81,173.81,0,0,0,34.84-104.58C397.44,126.38,319.06,48,222.72,48S48,126.38,48,222.72s78.38,174.72,174.72,174.72A173.81,173.81,0,0,0,327.3,362.6l94.09,94.09a25,25,0,0,0,35.3-35.3ZM97.92,222.72a124.8,124.8,0,1,1,124.8,124.8A124.95,124.95,0,0,1,97.92,222.72Z"/></svg>`;
            }
            // Info / Best Practices — check circle
            return `<svg class="${base('type-info')}" viewBox="0 0 24 24" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 4L12 14.01 9 11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        },

        renderScoreDial: function(scoreData) {
            const score = scoreData.score;
            const percentage = (score / 100) * 360; // Convert to degrees
            const gradient = this.createScoreGradient(score, percentage);
            
            // Generate accessibility rating text
            const ratingText = score >= 97 ? 'Excellent' : 
                              score >= 90 ? 'Very Good - just a few issues to address' : 
                              score >= 70 ? 'Fair accessibility with room for improvement' : 
                              score >= 50 ? 'Several issues to address' : 
                              'Immediate attention needed';
            
            return `
                <div class="uw-a11y-score-container" role="region" aria-labelledby="uw-a11y-score-heading">
                    <h3 id="uw-a11y-score-heading" class="sr-only">Accessibility Score</h3>
                    
                    <!-- Screen reader accessible score announcement -->
                    <div class="sr-only">
                        Accessibility score: ${score} out of 100. Rating: ${ratingText}
                    </div>
                    
                    <div class="uw-a11y-score-dial" role="img" aria-label="Accessibility score ${score} out of 100, rated as ${ratingText}">
                        <div class="uw-a11y-score-circle" style="background: ${this.createScoreGradient(0, 0)};">
                            <div class="uw-a11y-score-inner">
                                <div class="uw-a11y-score-number" aria-hidden="true">0</div>
                                <div class="uw-a11y-score-label" aria-hidden="true">Score</div>
                            </div>
                        </div>
                    </div>
                    <div style="font-size: 14px;">
                        <span style="font-size: 12px; color: #666;" aria-hidden="true">
                            ${ratingText}
                        </span>
                    </div>
                </div>
            `;
        },

        // Animate the results score dial fill and count-up
        startResultsScoreAnimation: function() {
            try {
                // Guard: only animate once per session
                if (this.scoreAnimationPlayed) return;
                if (this.prefersReducedMotion()) { this.scoreAnimationPlayed = true; return; } // Respect user preference
                const scoreObj = this.axeResults && this.axeResults.score ? this.axeResults.score : null;
                if (!scoreObj) return;
                const finalScore = Math.max(0, Math.min(100, parseInt(scoreObj.score, 10) || 0));
                const scoreDial = this.shadowRoot.querySelector('.uw-a11y-score-dial');
                const scoreCircle = this.shadowRoot.querySelector('.uw-a11y-score-circle');
                const scoreNumber = this.shadowRoot.querySelector('.uw-a11y-score-number');
                if (!scoreCircle || !scoreNumber || !scoreDial) return;
                // Mark as played now to avoid double-starts if called rapidly
                this.scoreAnimationPlayed = true;

                // Reset start state
                scoreNumber.textContent = '0';
                scoreCircle.style.background = this.createScoreGradient(0, 0);

                // Kill prior animation if any
                if (this._scoreTween && window.gsap) {
                    this._scoreTween.kill();
                    this._scoreTween = null;
                }

                const updateAria = (val) => {
                    const current = Math.round(val);
                    const ratingText = current >= 97 ? 'Excellent' :
                        current >= 90 ? 'Very Good - just a few issues to address' :
                        current >= 70 ? 'Good accessibility with room for improvement' :
                        current >= 50 ? 'Fair accessibility - several issues to address' :
                        'Immediate attention needed';
                    scoreDial.setAttribute('aria-label', `Accessibility score ${current} out of 100, rated as ${ratingText}`);
                };

                const endDeg = (finalScore / 100) * 360;
                if (window.gsap) {
                    const state = { n: 0, deg: 0 };
                    this._scoreTween = window.gsap.to(state, {
                        n: finalScore,
                        deg: endDeg,
                        duration: 1.2,
                        ease: 'power2.out',
                        onUpdate: () => {
                            const currentScore = Math.round(state.n);
                            scoreNumber.textContent = String(currentScore);
                            // Use currentScore for color banding and state.deg for fill
                            scoreCircle.style.background = this.createScoreGradient(currentScore, state.deg);
                            updateAria(state.n);
                        }
                    });
                } else {
                    // Simple JS fallback
                    const start = performance.now();
                    const dur = 1200;
                    const step = (t) => {
                        const p = Math.min(1, (t - start) / dur);
                        const val = Math.round(finalScore * p);
                        const deg = endDeg * p;
                        scoreNumber.textContent = String(val);
                        scoreCircle.style.background = this.createScoreGradient(val, deg);
                        updateAria(val);
                        if (p < 1) requestAnimationFrame(step);
                    };
                    requestAnimationFrame(step);
                }
            } catch (e) {
                // Non-fatal; animation is cosmetic
                console.warn('Score animation failed:', e);
            }
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
                } else if (typeof value === 'string') {
                    // Only escape problematic characters that could break HTML structure
                    // But preserve basic text formatting
                    value = value
                        .replace(/</g, "&lt;")
                        .replace(/>/g, "&gt;")
                        .replace(/"/g, "&quot;");
                }
                
                return `
                    <div class="uw-a11y-details-item">
                        <div class="uw-a11y-details-label">${detail.label}:</div>
                        <div class="uw-a11y-details-value">${value}</div>
                    </div>
                `;
            }).join('');
        },
        
        // Group issues by rule ID and type for better organization
        groupIssuesByRule: function(issues) {
            const grouped = {};
            issues.forEach(issue => {
                // Use the issue's existing ruleId directly to prevent conflicts
                // Only fall back to title-based ID if ruleId is truly missing
                const baseRuleId = issue.ruleId || `fallback-${issue.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${issue.id}`;
                
                // Include type in the grouping key to separate violations from manual review items
                const ruleId = `${baseRuleId}-${issue.type}`;
                
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
                
                // Update gradient based on score
                const score = newScore.score;
                const percentage = (score / 100) * 360;
                const gradient = this.createScoreGradient(score, percentage);
                scoreCircle.style.background = gradient;
            }
            
            // Update the counts
            const counts = {
                error: this.issues.filter(i => i.type === 'error').length,
                warning: this.issues.filter(i => i.type === 'warning' && i.uniqueId).length, // Only count manual review with uniqueId
                warningChecked: this.issues.filter(i => i.type === 'warning' && i.uniqueId && this.checkedItems.has(i.uniqueId)).length,
                info: this.issues.filter(i => i.type === 'info').length
            };
            
            // Update count display numbers without removing toggles
            const setText = (id, value) => {
                const el = this.shadowRoot.getElementById(id);
                if (el) el.textContent = value;
            };
            setText('count-error', counts.error);
            setText('count-warning', counts.warning);
            setText('count-info', counts.info);
            setText('count-verified', counts.warningChecked);
            
            // Update visibility of if-issues elements
            this.updateIfIssuesVisibility();
            
            // Announce score update to screen readers
            const announcements = this.shadowRoot.getElementById('uw-a11y-announcements');
            if (announcements && counts.warningChecked > 0) {
                const message = `Score updated to ${newScore.score}. ${counts.warningChecked} item${counts.warningChecked === 1 ? '' : 's'} verified.`;
                announcements.textContent = message;
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
                // Set focus when restoring for keyboard users
                this.setFocusToPanel();
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
        
                    if (this.compareVersions(latestVersion, this.version) > 0) {
                        this.showUpdateNotification(latestVersion, data.html_url);
                    }
                })
                .catch(error => {
                    // Silently fail - don't bother users with update check errors
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
            // Clean up resize handler
            if (this.resizeHandler) {
                window.removeEventListener('resize', this.resizeHandler);
                this.resizeHandler = null;
            }
            
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
