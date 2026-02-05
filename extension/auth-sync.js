/**
 * Content script that runs on the frontend to sync auth tokens to the extension
 */

// Check for auth tokens in localStorage and sync to extension
function syncAuthToExtension() {
  const accessToken = localStorage.getItem("tc_access_token");
  const refreshToken = localStorage.getItem("tc_refresh_token");
  const userStr = localStorage.getItem("tc_user");

  if (accessToken && refreshToken) {
    let user = null;
    try {
      user = userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      // Invalid JSON
    }

    // Send to extension background script
    chrome.runtime.sendMessage({
      action: "syncAuthFromFrontend",
      accessToken,
      refreshToken,
      user,
    });

    // Clear from localStorage after syncing (optional - for security)
    // localStorage.removeItem("tc_access_token");
    // localStorage.removeItem("tc_refresh_token");
    // localStorage.removeItem("tc_user");
  }
}

// Run on page load
syncAuthToExtension();

// Also listen for storage changes (in case user logs in after page load)
window.addEventListener("storage", (e) => {
  if (e.key === "tc_access_token" || e.key === "tc_refresh_token") {
    syncAuthToExtension();
  }
});

// Listen for custom event from the page (for same-tab updates)
window.addEventListener("tc-auth-updated", () => {
  syncAuthToExtension();
});
