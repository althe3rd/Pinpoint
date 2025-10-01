// Popup script for Pinpoint Accessibility Checker

(function() {
    'use strict';
    
    // DOM elements
    const runCheckButton = document.getElementById('runCheck');
    const status = document.getElementById('status');
    const popupContainer = document.querySelector('.popup-container');
    
    // Initialize popup
    document.addEventListener('DOMContentLoaded', function() {
        initializePopup();
        addEventListeners();
        checkCurrentTab();
    });
    
    function initializePopup() {
        // Set initial status
        setStatus('Ready to check accessibility', 'info');
        
        // Focus the run button for keyboard accessibility
        runCheckButton.focus();
    }
    
    function addEventListeners() {
        // Run check button
        runCheckButton.addEventListener('click', runAccessibilityCheck);
        
        // Keyboard shortcuts
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' && event.target === runCheckButton) {
                runAccessibilityCheck();
            }
        });
        
        // Links
        const links = document.querySelectorAll('.link');
        links.forEach(link => {
            link.addEventListener('click', function(event) {
                // Links will open in new tabs automatically due to target="_blank"
                // Close popup after a short delay
                setTimeout(() => {
                    window.close();
                }, 100);
            });
        });
    }
    
    async function checkCurrentTab() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!tab) {
                setStatus('No active tab found', 'error');
                disableButton();
                return;
            }
            
            // Check if the tab URL is accessible
            if (tab.url.startsWith('chrome://') || 
                tab.url.startsWith('chrome-extension://') || 
                tab.url.startsWith('moz-extension://') ||
                tab.url.startsWith('about:') ||
                tab.url.startsWith('file://')) {
                setStatus('Cannot check this page (restricted URL)', 'error');
                disableButton();
                return;
            }
            
            // Check if page is loaded
            if (tab.status !== 'complete') {
                setStatus('Waiting for page to load...', 'info');
                disableButton();
                
                // Listen for tab updates
                chrome.tabs.onUpdated.addListener(function tabUpdateListener(tabId, changeInfo) {
                    if (tabId === tab.id && changeInfo.status === 'complete') {
                        chrome.tabs.onUpdated.removeListener(tabUpdateListener);
                        setStatus('Ready to check accessibility', 'info');
                        enableButton();
                    }
                });
                return;
            }
            
            setStatus('Ready to check accessibility', 'info');
            enableButton();
            
        } catch (error) {
            console.error('Error checking current tab:', error);
            setStatus('Error accessing current tab', 'error');
            disableButton();
        }
    }
    
    async function runAccessibilityCheck() {
        try {
            setStatus('Running accessibility check...', 'loading');
            setButtonLoading(true);
            
            // Get current active tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!tab) {
                throw new Error('No active tab found');
            }
            
            // Send message to content script to run the check
            const response = await chrome.tabs.sendMessage(tab.id, {
                action: 'runAccessibilityCheck'
            });
            
            if (response && response.success) {
                setStatus('Accessibility check started!', 'success');
                setButtonSuccess();
                
                // Close popup after a short delay
                setTimeout(() => {
                    window.close();
                }, 1500);
            } else {
                throw new Error('Failed to start accessibility check');
            }
            
        } catch (error) {
            console.error('Error running accessibility check:', error);
            
            // Handle specific error cases
            let errorMessage = 'Failed to run accessibility check';
            
            if (error.message.includes('Could not establish connection')) {
                errorMessage = 'Page not ready. Please refresh and try again.';
            } else if (error.message.includes('Extension context invalidated')) {
                errorMessage = 'Extension needs to be refreshed. Please reload the extension.';
            }
            
            setStatus(errorMessage, 'error');
            setButtonLoading(false);
            
            // Reset button after 3 seconds
            setTimeout(() => {
                setStatus('Ready to check accessibility', 'info');
                enableButton();
            }, 3000);
        }
    }
    
    function setStatus(message, type = 'info') {
        status.textContent = message;
        status.className = `status ${type}`;
    }
    
    function setButtonLoading(loading) {
        if (loading) {
            runCheckButton.disabled = true;
            runCheckButton.innerHTML = '<span class="button-icon">⟳</span>Running Check...';
            popupContainer.classList.add('loading');
        } else {
            runCheckButton.disabled = false;
            runCheckButton.innerHTML = '<span class="button-icon">🔍</span>Run Accessibility Check';
            popupContainer.classList.remove('loading');
        }
    }
    
    function setButtonSuccess() {
        runCheckButton.innerHTML = '<span class="button-icon">✓</span>Check Started!';
        popupContainer.classList.remove('loading');
        popupContainer.classList.add('success');
    }
    
    function disableButton() {
        runCheckButton.disabled = true;
        runCheckButton.innerHTML = '<span class="button-icon">🔍</span>Run Accessibility Check';
        popupContainer.classList.remove('loading', 'success');
    }
    
    function enableButton() {
        runCheckButton.disabled = false;
        runCheckButton.innerHTML = '<span class="button-icon">🔍</span>Run Accessibility Check';
        popupContainer.classList.remove('loading', 'success');
    }
    
    // Handle errors globally
    window.addEventListener('error', function(event) {
        console.error('Popup error:', event.error);
        setStatus('An unexpected error occurred', 'error');
        setButtonLoading(false);
    });
    
})();