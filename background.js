// Background service worker for True Cost Calculator

chrome.runtime.onInstalled.addListener(() => {
  // Set default settings on install
  chrome.storage.local.set({
    enabled: true,
    returnRate: 7,
    years: 10
  });
  console.log('True Cost Calculator installed');
});
