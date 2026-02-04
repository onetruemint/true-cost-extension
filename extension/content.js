// True Cost Calculator - Content Script for Amazon

(function() {
  'use strict';

  let settings = {
    enabled: true,
    confirmBeforePurchase: false,
    returnRate: 7,
    years: 10,
    minPrice: 10
  };

  // Current question variant (loaded from Supabase or default)
  let currentVariant = null;

  const BADGE_CLASS = 'true-cost-badge';
  const PROCESSED_ATTR = 'data-true-cost-processed';

  // Price selectors for Amazon - only main product price and cart totals
  const PRODUCT_PAGE_SELECTORS = [
    // Main product page price (primary price display)
    '#corePrice_feature_div .a-price .a-offscreen',
    '#corePriceDisplay_desktop_feature_div .a-price .a-offscreen',
    '#priceblock_ourprice',
    '#priceblock_dealprice',
    '#priceblock_saleprice',
    '.a-price[data-a-size="xl"] .a-offscreen',
    '.a-price[data-a-size="l"] .a-offscreen'
  ];

  const CART_SELECTORS = [
    // Cart subtotal/total
    '#sc-subtotal-amount-activecart .a-price .a-offscreen',
    '#sc-subtotal-amount-buybox .a-price .a-offscreen',
    '.sc-subtotal .a-price .a-offscreen',
    '#subtotals-marketplace-table .a-price .a-offscreen'
  ];

  // Default question variants (used when not logged in or Supabase unavailable)
  const DEFAULT_VARIANTS = [
    { id: 'default-1', question_text: 'Is this a want or a need?', subtext: 'Be honest with yourself.' },
    { id: 'default-2', question_text: 'Will this purchase bring lasting joy?', subtext: 'Think about how you\'ll feel in a month.' },
    { id: 'default-3', question_text: 'Do you really need this right now?', subtext: 'Consider if you could wait.' },
    { id: 'default-4', question_text: 'Is future-you going to thank you for this?', subtext: 'Think long-term.' }
  ];

  // Initialize
  chrome.storage.local.get(['enabled', 'confirmBeforePurchase', 'returnRate', 'years', 'minPrice'], (result) => {
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

  async function init() {
    // Initial processing
    processPage();

    // Try to load question variant from Supabase
    await loadQuestionVariant();

    // Set up purchase confirmation interceptors
    setupPurchaseConfirmation();

    // Watch for dynamic content (Amazon loads content dynamically)
    const observer = new MutationObserver((mutations) => {
      if (settings.enabled) {
        processPage();
        setupPurchaseConfirmation();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  async function loadQuestionVariant() {
    // Check if supabase client is available and authenticated
    if (typeof window.supabase !== 'undefined' && window.supabase.isAuthenticated()) {
      try {
        currentVariant = await window.supabase.selectWeightedVariant();
        if (currentVariant) return;
      } catch (e) {
        console.log('Failed to load variant from Supabase:', e);
      }
    }

    // Fall back to random default variant
    currentVariant = DEFAULT_VARIANTS[Math.floor(Math.random() * DEFAULT_VARIANTS.length)];
  }

  function getPageType() {
    const url = window.location.pathname;
    if (url.includes('/dp/') || url.includes('/gp/product/')) {
      return 'product';
    }
    if (url.includes('/cart') || url.includes('/gp/cart')) {
      return 'cart';
    }
    return 'other';
  }

  function processPage() {
    const pageType = getPageType();

    if (pageType === 'product') {
      PRODUCT_PAGE_SELECTORS.forEach(selector => {
        document.querySelectorAll(selector).forEach(processPriceElement);
      });
    } else if (pageType === 'cart') {
      CART_SELECTORS.forEach(selector => {
        document.querySelectorAll(selector).forEach(processPriceElement);
      });
    }
    // Skip search results and other pages
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

  function detectCurrencyCode() {
    const url = window.location.hostname;
    if (url.includes('.co.uk')) return 'GBP';
    if (url.includes('.de') || url.includes('.fr') || url.includes('.es') || url.includes('.it')) return 'EUR';
    if (url.includes('.co.jp')) return 'JPY';
    if (url.includes('.com.au')) return 'AUD';
    if (url.includes('.ca')) return 'CAD';
    return 'USD';
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
      <span class="true-cost-label">💰 If invested, worth <span class="true-cost-value">${formatCurrency(futureValue)}</span> in ${settings.years} yrs</span>
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

  // Purchase confirmation feature
  const CONFIRM_PROCESSED_ATTR = 'data-true-cost-confirm';

  const PURCHASE_BUTTON_SELECTORS = [
    '#add-to-cart-button',
    '#buy-now-button',
    'input[name="submit.add-to-cart"]',
    '#submit.add-to-cart',
    '.a-button-input[name="submit.addToCart"]',
    '#sc-buy-box-ptc-button input',
    '#submitOrderButtonId input',
    'input[name="placeYourOrder1"]'
  ];

  function setupPurchaseConfirmation() {
    if (!settings.confirmBeforePurchase) return;

    PURCHASE_BUTTON_SELECTORS.forEach(selector => {
      document.querySelectorAll(selector).forEach(button => {
        if (button.hasAttribute(CONFIRM_PROCESSED_ATTR)) return;
        button.setAttribute(CONFIRM_PROCESSED_ATTR, 'true');

        button.addEventListener('click', handlePurchaseClick, true);
      });
    });
  }

  function handlePurchaseClick(e) {
    if (!settings.confirmBeforePurchase) return;

    // Don't intercept if user already confirmed
    if (e.target.hasAttribute('data-true-cost-confirmed')) {
      e.target.removeAttribute('data-true-cost-confirmed');
      return;
    }

    const price = getCurrentPrice();

    // Skip if price is below minimum threshold
    if (!price || price < settings.minPrice) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    showWantNeedModal(price, e.target);
  }

  function getCurrentPrice() {
    for (const selector of PRODUCT_PAGE_SELECTORS) {
      const el = document.querySelector(selector);
      if (el) {
        const price = parsePrice(el.textContent);
        if (price && price > 0) return price;
      }
    }
    for (const selector of CART_SELECTORS) {
      const el = document.querySelector(selector);
      if (el) {
        const price = parsePrice(el.textContent);
        if (price && price > 0) return price;
      }
    }
    return null;
  }

  function getProductTitle() {
    // Try to get product title from page
    const titleEl = document.querySelector('#productTitle') ||
                    document.querySelector('#title') ||
                    document.querySelector('h1.a-size-large');
    return titleEl ? titleEl.textContent.trim().substring(0, 200) : null;
  }

  function showWantNeedModal(price, targetButton) {
    // Remove any existing modal
    const existing = document.getElementById('true-cost-modal');
    if (existing) existing.remove();

    const futureValue = calculateFutureValue(price);
    const currencySymbol = detectCurrencySymbol();

    // Use current variant or fall back to default
    const variant = currentVariant || DEFAULT_VARIANTS[0];

    const modal = document.createElement('div');
    modal.id = 'true-cost-modal';
    modal.className = 'true-cost-modal-overlay';

    // Step 1: Want vs Need question
    modal.innerHTML = `
      <div class="true-cost-modal">
        <div class="true-cost-modal-header">🤔 Quick check...</div>
        <div class="true-cost-modal-body">
          <p class="true-cost-modal-question">${escapeHtml(variant.question_text)}</p>
          <p class="true-cost-modal-subtext">${escapeHtml(variant.subtext || '')}</p>
        </div>
        <div class="true-cost-modal-buttons true-cost-modal-buttons-stacked">
          <button class="true-cost-modal-need">I need this</button>
          <button class="true-cost-modal-want">I just want it</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Handle "I need this" - proceed immediately
    modal.querySelector('.true-cost-modal-need').addEventListener('click', () => {
      modal.remove();
      recordDecision(price, 'need', 'purchased', variant);
      targetButton.setAttribute('data-true-cost-confirmed', 'true');
      targetButton.click();
    });

    // Handle "I just want it" - show opportunity cost
    modal.querySelector('.true-cost-modal-want').addEventListener('click', () => {
      showWantConfirmation(modal, price, futureValue, currencySymbol, targetButton, variant);
    });

    // Close on overlay click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function showWantConfirmation(modal, price, futureValue, currencySymbol, targetButton, variant) {
    const modalContent = modal.querySelector('.true-cost-modal');

    modalContent.innerHTML = `
      <div class="true-cost-modal-header">💰 Here's what you could save...</div>
      <div class="true-cost-modal-body">
        <div class="true-cost-modal-highlight">
          <div class="true-cost-modal-price">${currencySymbol}${price.toFixed(2)} today</div>
          <div class="true-cost-modal-arrow">↓</div>
          <div class="true-cost-modal-future">Could become <strong>${formatCurrency(futureValue)}</strong> in ${settings.years} years</div>
        </div>
        <p class="true-cost-modal-question">Skip this purchase and invest the money instead?</p>
      </div>
      <div class="true-cost-modal-buttons">
        <button class="true-cost-modal-skip">Skip & Save ${currencySymbol}${price.toFixed(2)}</button>
        <button class="true-cost-modal-buy-anyway">Buy anyway</button>
      </div>
    `;

    // Handle "Skip & Save"
    modalContent.querySelector('.true-cost-modal-skip').addEventListener('click', () => {
      recordSkippedPurchase(price, variant);
      showSavedConfirmation(modal, price, currencySymbol);
    });

    // Handle "Buy anyway"
    modalContent.querySelector('.true-cost-modal-buy-anyway').addEventListener('click', () => {
      modal.remove();
      recordDecision(price, 'want', 'purchased', variant);
      targetButton.setAttribute('data-true-cost-confirmed', 'true');
      targetButton.click();
    });
  }

  function showSavedConfirmation(modal, price, currencySymbol) {
    const modalContent = modal.querySelector('.true-cost-modal');

    chrome.storage.local.get({ totalSaved: 0 }, (result) => {
      modalContent.innerHTML = `
        <div class="true-cost-modal-header">🎉 Great choice!</div>
        <div class="true-cost-modal-body">
          <div class="true-cost-modal-saved">
            <div class="true-cost-modal-saved-label">You just saved</div>
            <div class="true-cost-modal-saved-amount">${currencySymbol}${price.toFixed(2)}</div>
          </div>
          <div class="true-cost-modal-total">
            <span>Total saved so far:</span>
            <strong>${currencySymbol}${result.totalSaved.toFixed(2)}</strong>
          </div>
        </div>
        <div class="true-cost-modal-buttons">
          <button class="true-cost-modal-close">Nice!</button>
        </div>
      `;

      modalContent.querySelector('.true-cost-modal-close').addEventListener('click', () => {
        modal.remove();
      });
    });
  }

  async function recordDecision(price, userResponse, finalDecision, variant) {
    // Check if supabase client is available and authenticated
    if (typeof window.supabase !== 'undefined' && window.supabase.isAuthenticated()) {
      try {
        await window.supabase.recordSaving({
          price: price,
          currency: detectCurrencyCode(),
          url: window.location.href,
          productTitle: getProductTitle(),
          questionVariantId: variant?.id?.startsWith('default-') ? null : variant?.id,
          userResponse: userResponse,
          finalDecision: finalDecision
        });
      } catch (e) {
        console.log('Failed to record decision to Supabase:', e);
      }
    }
  }

  function recordSkippedPurchase(price, variant) {
    // Record to local storage
    chrome.storage.local.get({ totalSaved: 0, skippedItems: [] }, (result) => {
      const newTotal = result.totalSaved + price;
      const skippedItem = {
        price: price,
        url: window.location.href,
        timestamp: Date.now()
      };

      chrome.storage.local.set({
        totalSaved: newTotal,
        skippedItems: [...result.skippedItems, skippedItem]
      });
    });

    // Also record to Supabase
    recordDecision(price, 'want', 'skipped', variant);
  }
})();
