// Savest - Content Script for Amazon

(function () {
  "use strict";

  let settings = { ...DEFAULT_SETTINGS };

  // Current question variant (loaded from Supabase or default)
  let currentVariant = null;

  // Initialize
  chrome.storage.local.get(
    ["enabled", "confirmBeforePurchase", "returnRate", "years", "minPrice"],
    (result) => {
      settings = { ...settings, ...result };
      if (settings.enabled) {
        init();
      }
    },
  );

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === ACTIONS.SETTINGS_UPDATED) {
      settings = message.settings;
      removeAllBadges();
      if (settings.enabled) {
        processPage();
      }
    } else if (message.action === ACTIONS.TOGGLE) {
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

    // Try to load question variant via background script
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
      subtree: true,
    });
  }

  async function loadQuestionVariant() {
    try {
      const response = await chrome.runtime.sendMessage({ action: ACTIONS.GET_WEIGHTED_VARIANT });
      if (response?.variant) {
        currentVariant = response.variant;
        return;
      }
    } catch (e) {
      console.log("[Savest] Failed to load variant from background:", e);
    }

    // Fall back to random default variant
    currentVariant =
      DEFAULT_VARIANTS[Math.floor(Math.random() * DEFAULT_VARIANTS.length)];
  }

  function getPageType() {
    const url = window.location.pathname;
    if (url.includes("/dp/") || url.includes("/gp/product/")) {
      return "product";
    }
    if (url.includes("/cart") || url.includes("/gp/cart")) {
      return "cart";
    }
    return "other";
  }

  function processPage() {
    const pageType = getPageType();

    if (pageType === "product") {
      PRODUCT_PAGE_SELECTORS.forEach((selector) => {
        document.querySelectorAll(selector).forEach(processPriceElement);
      });
    } else if (pageType === "cart") {
      CART_SELECTORS.forEach((selector) => {
        document.querySelectorAll(selector).forEach(processPriceElement);
      });
    }
    // Skip search results and other pages
  }

  function processPriceElement(element) {
    // Skip if already processed or is our badge
    if (
      element.hasAttribute(DOM.PROCESSED_ATTR) ||
      element.closest("." + DOM.BADGE_CLASS)
    ) {
      return;
    }

    // Skip hidden elements
    if (
      element.offsetParent === null &&
      !element.classList.contains("a-offscreen")
    ) {
      return;
    }

    const priceText = element.textContent.trim();
    const price = parsePrice(priceText);

    if (price && price > 0) {
      element.setAttribute(DOM.PROCESSED_ATTR, "true");
      addTrueCostBadge(element, price);
    }
  }

  function parsePrice(text) {
    if (!text) return null;

    // Remove currency symbols and extract number
    // Handles: $29.99, £19.99, €24,99, $1,234.56, etc.
    const cleaned = text.replace(/[^0-9.,]/g, "");

    // Handle different decimal separators
    let price;
    if (cleaned.includes(",") && cleaned.includes(".")) {
      // Format like 1,234.56
      price = parseFloat(cleaned.replace(/,/g, ""));
    } else if (cleaned.includes(",")) {
      // Could be 1,234 (thousands) or 24,99 (decimal)
      const parts = cleaned.split(",");
      if (parts[parts.length - 1].length === 2) {
        // Likely European format (24,99)
        price = parseFloat(cleaned.replace(",", "."));
      } else {
        // Likely thousands separator (1,234)
        price = parseFloat(cleaned.replace(/,/g, ""));
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
      return (
        currencySymbol +
        amount.toLocaleString("en-US", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })
      );
    }
    return currencySymbol + amount.toFixed(2);
  }

  function detectCurrencySymbol() {
    const url = window.location.hostname;
    for (const [domain, symbol] of Object.entries(CURRENCY_SYMBOLS)) {
      if (url.includes(domain)) return symbol;
    }
    return DEFAULT_CURRENCY_SYMBOL;
  }

  function detectCurrencyCode() {
    const url = window.location.hostname;
    for (const [domain, code] of Object.entries(CURRENCY_CODES)) {
      if (url.includes(domain)) return code;
    }
    return DEFAULT_CURRENCY_CODE;
  }

  function addTrueCostBadge(priceElement, price) {
    const futureValue = calculateFutureValue(price);

    // Find appropriate parent to append badge
    let container =
      priceElement.closest(".a-price") ||
      priceElement.closest(".a-price-whole")?.parentElement ||
      priceElement.parentElement;

    // Check if badge already exists for this container
    if (container.querySelector("." + DOM.BADGE_CLASS)) {
      return;
    }

    const badge = document.createElement("div");
    badge.className = DOM.BADGE_CLASS;
    badge.innerHTML = `
      <span class="savest-label">💰 If invested, worth <span class="savest-value">${formatCurrency(futureValue)}</span> in ${settings.years} yrs</span>
    `;

    // Insert after the price
    if (container) {
      container.style.position = "relative";
      container.appendChild(badge);
    }
  }

  function removeAllBadges() {
    document.querySelectorAll("." + DOM.BADGE_CLASS).forEach((el) => el.remove());
    document.querySelectorAll("[" + DOM.PROCESSED_ATTR + "]").forEach((el) => {
      el.removeAttribute(DOM.PROCESSED_ATTR);
    });
  }

  // Purchase confirmation feature
  function setupPurchaseConfirmation() {
    if (!settings.confirmBeforePurchase) return;

    PURCHASE_BUTTON_SELECTORS.forEach((selector) => {
      document.querySelectorAll(selector).forEach((button) => {
        if (button.hasAttribute(DOM.CONFIRM_ATTR)) return;
        button.setAttribute(DOM.CONFIRM_ATTR, "true");

        button.addEventListener("click", handlePurchaseClick, true);
      });
    });
  }

  function handlePurchaseClick(e) {
    if (!settings.confirmBeforePurchase) return;

    // Don't intercept if user already confirmed
    if (e.target.hasAttribute(DOM.CONFIRMED_ATTR)) {
      e.target.removeAttribute(DOM.CONFIRMED_ATTR);
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
    const titleEl =
      document.querySelector("#productTitle") ||
      document.querySelector("#title") ||
      document.querySelector("h1.a-size-large");
    return titleEl ? titleEl.textContent.trim().substring(0, DOM.MAX_TITLE_LENGTH) : null;
  }

  function showWantNeedModal(price, targetButton) {
    // Remove any existing modal
    const existing = document.getElementById(DOM.MODAL_ID);
    if (existing) existing.remove();

    const futureValue = calculateFutureValue(price);
    const currencySymbol = detectCurrencySymbol();

    // Use current variant or fall back to default
    const variant = currentVariant || DEFAULT_VARIANTS[0];

    const modal = document.createElement("div");
    modal.id = DOM.MODAL_ID;
    modal.className = "savest-modal-overlay";

    // Step 1: Want vs Need question
    modal.innerHTML = `
      <div class="savest-modal">
        <div class="savest-modal-header">🤔 Quick check...</div>
        <div class="savest-modal-body">
          <p class="savest-modal-question">${escapeHtml(variant.question_text)}</p>
          <p class="savest-modal-subtext">${escapeHtml(variant.subtext || "")}</p>
        </div>
        <div class="savest-modal-buttons savest-modal-buttons-stacked">
          <button class="savest-modal-need">I need this</button>
          <button class="savest-modal-want">I just want it</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Handle "I need this" - proceed immediately
    modal.querySelector(".savest-modal-need").addEventListener("click", () => {
      modal.remove();
      recordDecision(price, "need", "purchased", variant);
      targetButton.setAttribute(DOM.CONFIRMED_ATTR, "true");
      targetButton.click();
    });

    // Handle "I just want it" - show opportunity cost
    modal.querySelector(".savest-modal-want").addEventListener("click", () => {
      showWantConfirmation(
        modal,
        price,
        futureValue,
        currencySymbol,
        targetButton,
        variant,
      );
    });

    // Close on overlay click
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function showWantConfirmation(
    modal,
    price,
    futureValue,
    currencySymbol,
    targetButton,
    variant,
  ) {
    const modalContent = modal.querySelector(".savest-modal");

    modalContent.innerHTML = `
      <div class="savest-modal-header">💰 Here's what you could save...</div>
      <div class="savest-modal-body">
        <div class="savest-modal-highlight">
          <div class="savest-modal-price">${currencySymbol}${price.toFixed(2)} today</div>
          <div class="savest-modal-arrow">↓</div>
          <div class="savest-modal-future">Could become <strong>${formatCurrency(futureValue)}</strong> in ${settings.years} years</div>
        </div>
        <p class="savest-modal-question">Skip this purchase and invest the money instead?</p>
      </div>
      <div class="savest-modal-buttons">
        <button class="savest-modal-skip">Skip & Save ${currencySymbol}${price.toFixed(2)}</button>
        <button class="savest-modal-buy-anyway">Buy anyway</button>
      </div>
    `;

    // Handle "Skip & Save"
    modalContent
      .querySelector(".savest-modal-skip")
      .addEventListener("click", () => {
        recordSkippedPurchase(price, variant);
        showSavedConfirmation(modal, price, currencySymbol);
      });

    // Handle "Buy anyway"
    modalContent
      .querySelector(".savest-modal-buy-anyway")
      .addEventListener("click", () => {
        modal.remove();
        recordDecision(price, "want", "purchased", variant);
        targetButton.setAttribute(DOM.CONFIRMED_ATTR, "true");
        targetButton.click();
      });
  }

  function showSavedConfirmation(modal, price, currencySymbol) {
    const modalContent = modal.querySelector(".savest-modal");

    chrome.storage.local.get({ totalSaved: 0 }, (result) => {
      modalContent.innerHTML = `
        <div class="savest-modal-header">🎉 Great choice!</div>
        <div class="savest-modal-body">
          <div class="savest-modal-saved">
            <div class="savest-modal-saved-label">You just saved</div>
            <div class="savest-modal-saved-amount">${currencySymbol}${price.toFixed(2)}</div>
          </div>
          <div class="savest-modal-total">
            <span>Total saved so far:</span>
            <strong>${currencySymbol}${result.totalSaved.toFixed(2)}</strong>
          </div>
        </div>
        <div class="savest-modal-buttons">
          <button class="savest-modal-close">Nice!</button>
        </div>
      `;

      modalContent
        .querySelector(".savest-modal-close")
        .addEventListener("click", () => {
          modal.remove();
        });
    });
  }

  async function recordDecision(price, userResponse, finalDecision, variant) {
    try {
      await chrome.runtime.sendMessage({
        action: ACTIONS.RECORD_SAVING,
        data: {
          price: price,
          currency: detectCurrencyCode(),
          url: window.location.href,
          productTitle: getProductTitle(),
          questionVariantId: variant?.id?.startsWith("default-")
            ? null
            : variant?.id,
          userResponse: userResponse,
          finalDecision: finalDecision,
        },
      });
    } catch (e) {
      console.log("[Savest] Failed to record decision:", e);
    }
  }

  function recordSkippedPurchase(price, variant) {
    // Record to local storage
    chrome.storage.local.get({ totalSaved: 0, skippedItems: [] }, (result) => {
      const newTotal = result.totalSaved + price;
      const skippedItem = {
        price: price,
        url: window.location.href,
        timestamp: Date.now(),
      };

      chrome.storage.local.set({
        totalSaved: newTotal,
        skippedItems: [...result.skippedItems, skippedItem],
      });
    });

    // Also record to Supabase
    recordDecision(price, "want", "skipped", variant);
  }
})();
