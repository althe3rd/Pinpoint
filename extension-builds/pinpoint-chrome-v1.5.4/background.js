// Background service worker for Pinpoint Accessibility Checker (Chrome)

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
    console.log('Pinpoint Accessibility Checker installed/updated');
    
    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        // Show welcome message on first install
        showWelcomeMessage();
        
        // Optionally open the website for more information
        // chrome.tabs.create({ url: 'https://althe3rd.github.io/Pinpoint/' });
    } else if (details.reason === chrome.runtime.OnInstalledReason.UPDATE) {
        console.log('Extension updated to version:', chrome.runtime.getManifest().version);
    }
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
    console.log('Pinpoint Accessibility Checker started');
});

// Handle toolbar icon clicks (action API)
chrome.action.onClicked.addListener(async (tab) => {
    try {
        // Check if we can access this tab
        if (tab.url.startsWith('chrome://') || 
            tab.url.startsWith('chrome-extension://') || 
            tab.url.startsWith('moz-extension://') ||
            tab.url.startsWith('about:') ||
            tab.url.startsWith('file://')) {
            
            // Show notification for restricted pages
            chrome.action.setBadgeText({ text: '!', tabId: tab.id });
            chrome.action.setBadgeBackgroundColor({ color: '#dc3545', tabId: tab.id });
            
            setTimeout(() => {
                chrome.action.setBadgeText({ text: '', tabId: tab.id });
            }, 3000);
            
            return;
        }
        
        // Send message to content script to run accessibility check
        const response = await chrome.tabs.sendMessage(tab.id, {
            action: 'runAccessibilityCheck'
        });
        
        if (response && response.success) {
            // Show success badge temporarily
            chrome.action.setBadgeText({ text: '✓', tabId: tab.id });
            chrome.action.setBadgeBackgroundColor({ color: '#28a745', tabId: tab.id });
            
            setTimeout(() => {
                chrome.action.setBadgeText({ text: '', tabId: tab.id });
            }, 3000);
        }
        
    } catch (error) {
        console.error('Error handling toolbar click:', error);
        
        // Show error badge
        chrome.action.setBadgeText({ text: '!', tabId: tab.id });
        chrome.action.setBadgeBackgroundColor({ color: '#dc3545', tabId: tab.id });
        
        setTimeout(() => {
            chrome.action.setBadgeText({ text: '', tabId: tab.id });
        }, 3000);
    }
});

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener(async (command) => {
    if (command === 'run-accessibility-check') {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab) {
            try {
                await chrome.tabs.sendMessage(tab.id, {
                    action: 'runAccessibilityCheck'
                });
            } catch (error) {
                console.error('Error handling keyboard shortcut:', error);
            }
        }
    }
});

// Handle messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getVersion') {
        sendResponse({ version: chrome.runtime.getManifest().version });
    } else if (request.action === 'logError') {
        console.error('Content script error:', request.error);
        sendResponse({ success: true });
    }
    
    return true; // Keep message channel open for async response
});

// Show welcome message to active tab
async function showWelcomeMessage() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (tab && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
            // Wait a moment for content script to load
            setTimeout(async () => {
                try {
                    await chrome.tabs.sendMessage(tab.id, {
                        action: 'showWelcome'
                    });
                } catch (error) {
                    // Content script might not be ready yet, that's okay
                    console.log('Welcome message not sent - content script not ready');
                }
            }, 1000);
        }
    } catch (error) {
        console.log('Could not show welcome message:', error.message);
    }
}

// Handle tab updates to clear badges
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'loading') {
        // Clear any existing badges when page starts loading
        chrome.action.setBadgeText({ text: '', tabId: tabId });
    }
});

// Set up context menu (optional feature for right-click)
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'pinpoint-check',
        title: 'Check accessibility with Pinpoint',
        contexts: ['page']
    });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === 'pinpoint-check' && tab) {
        try {
            await chrome.tabs.sendMessage(tab.id, {
                action: 'runAccessibilityCheck'
            });
        } catch (error) {
            console.error('Error from context menu:', error);
        }
    }
});

console.log('Pinpoint Accessibility Checker background script loaded');