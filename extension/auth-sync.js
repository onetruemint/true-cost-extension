/**
 * Content script that runs on the frontend to sync auth tokens to the extension
 */

// Check for auth tokens in localStorage and sync to extension
function syncAuthToExtension() {
  const accessToken = localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
  const refreshToken = localStorage.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
  const userStr = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);

  if (accessToken && refreshToken) {
    let user = null;
    try {
      user = userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      // Invalid JSON
    }

    // Send to extension background script
    chrome.runtime.sendMessage({
      action: ACTIONS.SYNC_AUTH_FROM_FRONTEND,
      accessToken,
      refreshToken,
      user,
    });
  }
}

// Run on page load
syncAuthToExtension();

// Also listen for storage changes (in case user logs in after page load)
window.addEventListener("storage", (e) => {
  if (e.key === LOCAL_STORAGE_KEYS.ACCESS_TOKEN || e.key === LOCAL_STORAGE_KEYS.REFRESH_TOKEN) {
    syncAuthToExtension();
  }
});

// Listen for custom event from the page (for same-tab updates)
window.addEventListener(EVENTS.AUTH_UPDATED, () => {
  syncAuthToExtension();
});
