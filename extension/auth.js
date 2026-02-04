/**
 * OAuth callback handler for True Cost Calculator
 * Handles the redirect from Supabase OAuth and extracts tokens
 */

(function() {
  'use strict';

  const statusEl = document.getElementById('status');
  const closeMessageEl = document.getElementById('closeMessage');

  function showStatus(message, type) {
    statusEl.textContent = message;
    statusEl.className = 'status ' + type;
    if (type === 'success' || type === 'error') {
      closeMessageEl.style.display = 'block';
    }
  }

  async function handleCallback() {
    try {
      // Check URL hash for tokens (Supabase returns tokens in hash)
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);

      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      const error = params.get('error');
      const errorDescription = params.get('error_description');

      if (error) {
        showStatus(errorDescription || error, 'error');
        return;
      }

      if (!accessToken) {
        showStatus('No authentication token received.', 'error');
        return;
      }

      // Handle the OAuth callback
      await window.supabase.handleOAuthCallback(accessToken, refreshToken);

      showStatus('Successfully signed in! You can close this window.', 'success');

      // Notify the background script
      chrome.runtime.sendMessage({
        action: 'authStateChanged',
        user: window.supabase.getUser()
      });

      // Close this tab after a short delay
      setTimeout(() => {
        window.close();
      }, 2000);

    } catch (e) {
      showStatus('Authentication failed: ' + e.message, 'error');
    }
  }

  // Run on page load
  handleCallback();
})();
