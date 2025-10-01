// Content script for Pinpoint Accessibility Checker (Firefox)
// This script only runs when the extension button is clicked (activeTab permission)

(function() {
    'use strict';
    
    // Use browser API for Firefox, fallback to chrome for compatibility
    const runtime = (typeof browser !== 'undefined') ? browser.runtime : chrome.runtime;
    
    // Function to inject the accessibility checker with bundled dependencies
    async function injectAccessibilityChecker() {
        // Check if checker is already running
        if (window.uwAccessibilityChecker) {
            window.uwAccessibilityChecker.remove();
            return;
        }
        
        try {
            // Pre-load axe-core from extension bundle
            const axeScript = document.createElement('script');
            axeScript.src = runtime.getURL('axe-core.min.js');
            
            const axeLoaded = new Promise((resolve, reject) => {
                axeScript.onload = () => {
                    console.log('✅ axe-core loaded from extension bundle');
                    resolve();
                };
                axeScript.onerror = () => {
                    console.warn('❌ Failed to load axe-core from extension bundle');
                    reject();
                };
            });
            
            (document.head || document.documentElement).appendChild(axeScript);
            
            // Pre-load GSAP from extension bundle
            const gsapScript = document.createElement('script');
            gsapScript.src = runtime.getURL('gsap.min.js');
            
            const gsapLoaded = new Promise((resolve, reject) => {
                gsapScript.onload = () => {
                    console.log('✅ GSAP loaded from extension bundle');
                    resolve();
                };
                gsapScript.onerror = () => {
                    console.warn('❌ Failed to load GSAP from extension bundle');
                    reject();
                };
            });
            
            (document.head || document.documentElement).appendChild(gsapScript);
            
            // Wait for dependencies to load (or fail)
            await Promise.allSettled([axeLoaded, gsapLoaded]);
            
            // Now inject the accessibility checker
            const checkerScript = document.createElement('script');
            checkerScript.src = runtime.getURL('accessibility-checker.js');
            checkerScript.onload = function() {
                console.log('✅ Pinpoint Accessibility Checker loaded');
                this.remove(); // Clean up script tag
            };
            checkerScript.onerror = function() {
                console.error('❌ Failed to load Pinpoint Accessibility Checker');
                this.remove();
            };
            
            // Inject into the page
            (document.head || document.documentElement).appendChild(checkerScript);
            
        } catch (error) {
            console.error('Error injecting accessibility checker:', error);
        }
    }
    
    // Auto-run when content script loads (triggered by extension button click)
    injectAccessibilityChecker();
    
    // Debug function to check if content script is loaded
    console.log('Pinpoint Accessibility Checker content script loaded (Firefox)');
})();