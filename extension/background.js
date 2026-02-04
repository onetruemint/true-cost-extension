// Background service worker for True Cost Calculator

// Default settings
const DEFAULT_SETTINGS = {
  enabled: true,
  confirmBeforePurchase: false,
  returnRate: 7,
  years: 10,
  minPrice: 10
};

// Initialize on install
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Set default settings on fresh install
    chrome.storage.local.set(DEFAULT_SETTINGS);
    console.log('True Cost Calculator installed');
  } else if (details.reason === 'update') {
    // Ensure new settings exist after update
    chrome.storage.local.get(DEFAULT_SETTINGS, (current) => {
      // Only set defaults for missing keys
      const updates = {};
      for (const key of Object.keys(DEFAULT_SETTINGS)) {
        if (current[key] === undefined) {
          updates[key] = DEFAULT_SETTINGS[key];
        }
      }
      if (Object.keys(updates).length > 0) {
        chrome.storage.local.set(updates);
      }
    });
    console.log('True Cost Calculator updated');
  }
});

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'authStateChanged') {
    // Broadcast auth state change to all extension pages
    broadcastAuthState(message.user);
    sendResponse({ success: true });
  }

  if (message.action === 'getAuthState') {
    // Get current auth state from storage
    chrome.storage.local.get(['api_user'], (result) => {
      sendResponse({ user: result.api_user || null });
    });
    return true; // Keep channel open for async response
  }

  return false;
});

// Broadcast auth state to all tabs with content scripts
async function broadcastAuthState(user) {
  try {
    const tabs = await chrome.tabs.query({
      url: [
        '*://*.amazon.com/*',
        '*://*.amazon.co.uk/*',
        '*://*.amazon.ca/*',
        '*://*.amazon.de/*',
        '*://*.amazon.fr/*',
        '*://*.amazon.es/*',
        '*://*.amazon.it/*',
        '*://*.amazon.co.jp/*',
        '*://*.amazon.com.au/*'
      ]
    });

    for (const tab of tabs) {
      try {
        await chrome.tabs.sendMessage(tab.id, {
          action: 'authStateChanged',
          user: user
        });
      } catch (e) {
        // Tab might not have content script loaded
      }
    }
  } catch (e) {
    console.log('Failed to broadcast auth state:', e);
  }
}

// Periodic session refresh (every 30 minutes)
const SESSION_REFRESH_INTERVAL = 30 * 60 * 1000;

async function refreshSession() {
  try {
    const stored = await chrome.storage.local.get(['api_refresh_token']);
    if (!stored.api_refresh_token) return;

    // The popup/content scripts handle the actual refresh when they load
    // This alarm just ensures we check periodically
    console.log('Session refresh check triggered');
  } catch (e) {
    console.log('Session refresh failed:', e);
  }
}

// Set up alarm for periodic session refresh
chrome.alarms.create('sessionRefresh', {
  periodInMinutes: 30
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'sessionRefresh') {
    refreshSession();
  }
});

// Handle extension icon click when popup is not defined
chrome.action.onClicked.addListener((tab) => {
  // This won't fire when default_popup is set, but good to have as fallback
  chrome.action.openPopup();
});
