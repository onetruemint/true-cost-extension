// True Cost Calculator - Content Script for Amazon

(function() {
  'use strict';

  let settings = {
    enabled: true,
    returnRate: 7,
    years: 10
  };

  const BADGE_CLASS = 'true-cost-badge';
  const PROCESSED_ATTR = 'data-true-cost-processed';

  // Price selectors for Amazon
  const PRICE_SELECTORS = [
    // Main product page price
    '.a-price .a-offscreen',
    '#priceblock_ourprice',
    '#priceblock_dealprice',
    '#priceblock_saleprice',
    '.a-price-whole',
    // Search results and listings
    '[data-a-color="price"] .a-offscreen',
    '.a-color-price',
    // Cart and checkout
    '.sc-product-price',
    '.a-price[data-a-size="xl"] .a-offscreen',
    '.a-price[data-a-size="l"] .a-offscreen',
    '.a-price[data-a-size="m"] .a-offscreen'
  ];

  // Initialize
  chrome.storage.local.get(['enabled', 'returnRate', 'years'], (result) => {
    settings = { ...settings, ...result };
    if (settings.enabled) {
      init();
    }
  });

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'settingsUpdated') {
      settings = message.settings;
      removeAllBadges();
      if (settings.enabled) {
        processPage();
      }
    } else if (message.action === 'toggle') {
      settings.enabled = message.enabled;
      if (settings.enabled) {
        processPage();
      } else {
        removeAllBadges();
      }
    }
    sendResponse({ success: true });
  });

  function init() {
    // Initial processing
    processPage();

    // Watch for dynamic content (Amazon loads content dynamically)
    const observer = new MutationObserver((mutations) => {
      if (settings.enabled) {
        processPage();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  function processPage() {
    PRICE_SELECTORS.forEach(selector => {
      document.querySelectorAll(selector).forEach(processPriceElement);
    });
  }

  function processPriceElement(element) {
    // Skip if already processed or is our badge
    if (element.hasAttribute(PROCESSED_ATTR) || element.closest('.' + BADGE_CLASS)) {
      return;
    }

    // Skip hidden elements
    if (element.offsetParent === null && !element.classList.contains('a-offscreen')) {
      return;
    }

    const priceText = element.textContent.trim();
    const price = parsePrice(priceText);

    if (price && price > 0) {
      element.setAttribute(PROCESSED_ATTR, 'true');
      addTrueCostBadge(element, price);
    }
  }

  function parsePrice(text) {
    if (!text) return null;

    // Remove currency symbols and extract number
    // Handles: $29.99, £19.99, €24,99, $1,234.56, etc.
    const cleaned = text.replace(/[^0-9.,]/g, '');

    // Handle different decimal separators
    let price;
    if (cleaned.includes(',') && cleaned.includes('.')) {
      // Format like 1,234.56
      price = parseFloat(cleaned.replace(/,/g, ''));
    } else if (cleaned.includes(',')) {
      // Could be 1,234 (thousands) or 24,99 (decimal)
      const parts = cleaned.split(',');
      if (parts[parts.length - 1].length === 2) {
        // Likely European format (24,99)
        price = parseFloat(cleaned.replace(',', '.'));
      } else {
        // Likely thousands separator (1,234)
        price = parseFloat(cleaned.replace(/,/g, ''));
      }
    } else {
      price = parseFloat(cleaned);
    }

    return isNaN(price) ? null : price;
  }

  function calculateFutureValue(presentValue) {
    const rate = settings.returnRate / 100;
    return presentValue * Math.pow(1 + rate, settings.years);
  }

  function formatCurrency(amount) {
    // Detect currency from page or default to $
    const currencySymbol = detectCurrencySymbol();

    if (amount >= 1000) {
      return currencySymbol + amount.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      });
    }
    return currencySymbol + amount.toFixed(2);
  }

  function detectCurrencySymbol() {
    const url = window.location.hostname;
    if (url.includes('.co.uk')) return '£';
    if (url.includes('.de') || url.includes('.fr') || url.includes('.es') || url.includes('.it')) return '€';
    if (url.includes('.co.jp')) return '¥';
    if (url.includes('.com.au')) return 'A$';
    if (url.includes('.ca')) return 'C$';
    return '$';
  }

  function addTrueCostBadge(priceElement, price) {
    const futureValue = calculateFutureValue(price);

    // Find appropriate parent to append badge
    let container = priceElement.closest('.a-price') ||
                    priceElement.closest('.a-price-whole')?.parentElement ||
                    priceElement.parentElement;

    // Check if badge already exists for this container
    if (container.querySelector('.' + BADGE_CLASS)) {
      return;
    }

    const badge = document.createElement('div');
    badge.className = BADGE_CLASS;
    badge.innerHTML = `
      <span class="true-cost-label">True cost in ${settings.years}yr:</span>
      <span class="true-cost-value">${formatCurrency(futureValue)}</span>
    `;

    // Insert after the price
    if (container) {
      container.style.position = 'relative';
      container.appendChild(badge);
    }
  }

  function removeAllBadges() {
    document.querySelectorAll('.' + BADGE_CLASS).forEach(el => el.remove());
    document.querySelectorAll('[' + PROCESSED_ATTR + ']').forEach(el => {
      el.removeAttribute(PROCESSED_ATTR);
    });
  }
})();
