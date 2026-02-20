document.addEventListener("DOMContentLoaded", () => {
  // Settings elements
  const enableToggle = document.getElementById("enableToggle");
  const confirmToggle = document.getElementById("confirmToggle");
  const returnRateInput = document.getElementById("returnRate");
  const yearsInput = document.getElementById("years");
  const minPriceInput = document.getElementById("minPrice");
  const status = document.getElementById("status");

  // Debounce timer for auto-save
  let saveTimeout = null;
  const exampleResult = document.getElementById("exampleResult");
  const savingsDisplay = document.getElementById("savingsDisplay");
  const savingsAmount = document.getElementById("savingsAmount");
  const savingsCount = document.getElementById("savingsCount");
  const timeFilters = document.getElementById("timeFilters");

  // Auth elements
  const loggedOutView = document.getElementById("loggedOutView");
  const loggedInView = document.getElementById("loggedInView");
  const userEmail = document.getElementById("userEmail");
  const signInLink = document.getElementById("signInLink");
  const signOutBtn = document.getElementById("signOutBtn");

  // Best variant elements
  const bestVariant = document.getElementById("bestVariant");
  const bestVariantText = document.getElementById("bestVariantText");
  const bestVariantStats = document.getElementById("bestVariantStats");

  let currentPeriod = "all";

  // Default settings with fallback values
  const defaults = {
    ...DEFAULT_SETTINGS,
    totalSaved: 0,
    skippedItems: [],
  };

  // Initialize
  init();

  async function init() {
    // Restore Supabase session
    const user = await window.supabase.restoreSession();
    updateAuthUI(user);

    // Load settings (from Supabase if logged in, otherwise local)
    await loadSettings();

    // Load savings data
    await loadSavings();

    // Load best variant if logged in
    if (user) {
      await loadBestVariant();
    }
  }

  function updateAuthUI(user) {
    if (user) {
      loggedOutView.style.display = "none";
      loggedInView.style.display = "block";
      userEmail.textContent = user.email;
      timeFilters.style.display = "flex";
    } else {
      loggedOutView.style.display = "block";
      loggedInView.style.display = "none";
      timeFilters.style.display = "none";
    }
  }

  async function loadSettings() {
    const user = window.supabase.getUser();

    if (user) {
      // Try to load from Supabase
      const cloudSettings = await window.supabase.getSettings();
      if (cloudSettings) {
        enableToggle.checked = cloudSettings.enabled;
        confirmToggle.checked = cloudSettings.confirm_before_purchase;
        returnRateInput.value = cloudSettings.return_rate;
        yearsInput.value = cloudSettings.years;
        minPriceInput.value = cloudSettings.min_price;
        updateExample();
        updateSavingsDisplay(true, cloudSettings.confirm_before_purchase);
        return;
      }
    }

    // Fall back to local storage
    chrome.storage.local.get(defaults, (settings) => {
      enableToggle.checked = settings.enabled;
      confirmToggle.checked = settings.confirmBeforePurchase;
      returnRateInput.value = settings.returnRate;
      yearsInput.value = settings.years;
      minPriceInput.value = settings.minPrice;
      updateExample();
      updateSavingsDisplay(settings.totalSaved, settings.confirmBeforePurchase);
    });
  }

  async function loadSavings() {
    const user = window.supabase.getUser();

    if (user) {
      // Load from Supabase based on selected period
      let savings;
      switch (currentPeriod) {
        case "today":
          savings = await window.supabase.getTodaySavings();
          break;
        case "week":
          savings = await window.supabase.getWeekSavings();
          break;
        case "month":
          savings = await window.supabase.getMonthSavings();
          break;
        case "ytd":
          savings = await window.supabase.getYTDSavings();
          break;
        case "all":
          savings = await window.supabase.getAllTimeSavings();
          break;
        default:
          savings = await window.supabase.getAllTimeSavings();
      }

      savingsAmount.textContent = "$" + savings.total.toFixed(2);
      if (savings.count > 0) {
        savingsCount.textContent = `${savings.count} purchase${
          savings.count !== 1 ? "s" : ""
        } skipped`;
        savingsCount.style.display = "block";
      } else {
        savingsCount.style.display = "none";
      }
    } else {
      // Load from local storage
      chrome.storage.local.get(
        { totalSaved: 0, skippedItems: [] },
        (result) => {
          savingsAmount.textContent = "$" + result.totalSaved.toFixed(2);
          if (result.skippedItems.length > 0) {
            savingsCount.textContent = `${result.skippedItems.length} purchase${
              result.skippedItems.length !== 1 ? "s" : ""
            } skipped`;
            savingsCount.style.display = "block";
          } else {
            savingsCount.style.display = "none";
          }
        }
      );
    }
  }

  async function loadBestVariant() {
    const best = await window.supabase.getMostEffectiveVariant();
    if (best && best.question_variants) {
      bestVariant.style.display = "block";
      bestVariantText.textContent = `"${best.question_variants.question_text}"`;
      const skipRate = ((best.times_skipped / best.times_shown) * 100).toFixed(
        0
      );
      bestVariantStats.textContent = `${skipRate}% skip rate (${best.times_skipped}/${best.times_shown} times)`;
    }
  }

  function updateSavingsDisplay(total, showDisplay) {
    savingsDisplay.style.display = showDisplay ? "block" : "none";
    if (typeof total === "number") {
      savingsAmount.textContent = "$" + total.toFixed(2);
    }
  }

  // Sign in link - opens frontend auth page
  signInLink.addEventListener("click", (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: `${SAVEST_FRONTEND_URL}/signin` });
  });

  // Sign out
  signOutBtn.addEventListener("click", async () => {
    await window.supabase.signOut();
    updateAuthUI(null);
    await loadSettings();
    await loadSavings();
    bestVariant.style.display = "none";

    // Notify background script
    chrome.runtime.sendMessage({ action: ACTIONS.AUTH_STATE_CHANGED, user: null });
  });

  // Time filter buttons
  timeFilters.addEventListener("click", async (e) => {
    if (e.target.classList.contains("time-filter")) {
      document
        .querySelectorAll(".time-filter")
        .forEach((btn) => btn.classList.remove("active"));
      e.target.classList.add("active");
      currentPeriod = e.target.dataset.period;
      await loadSavings();
    }
  });

  // Auto-save settings with debounce
  async function saveSettings() {
    const settings = {
      enabled: enableToggle.checked,
      confirmBeforePurchase: confirmToggle.checked,
      returnRate: parseFloat(returnRateInput.value) || DEFAULT_SETTINGS.returnRate,
      years: parseInt(yearsInput.value) || DEFAULT_SETTINGS.years,
      minPrice: parseFloat(minPriceInput.value) || 0,
    };

    // Save to local storage
    chrome.storage.local.set(settings, () => {
      // Show brief save confirmation
      status.textContent = "Saved";
      status.style.opacity = "1";
      setTimeout(() => {
        status.style.opacity = "0";
      }, TIMING.STATUS_DISPLAY_MS);

      // Notify content scripts
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs
            .sendMessage(tabs[0].id, {
              action: ACTIONS.SETTINGS_UPDATED,
              settings: settings,
            })
            .catch(() => {
              // Tab might not have content script
            });
        }
      });
    });

    // Also save to Supabase if logged in
    if (window.supabase.isAuthenticated()) {
      await window.supabase.saveSettings(settings);
    }
  }

  // Debounced save for text inputs
  function debouncedSave() {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveSettings, TIMING.SETTINGS_DEBOUNCE_MS);
  }

  // Update example calculation
  function updateExample() {
    const rate = parseFloat(returnRateInput.value) / 100;
    const years = parseInt(yearsInput.value);
    const futureValue = calculateFutureValue(100, rate, years);
    exampleResult.textContent = `True cost: $${futureValue.toFixed(
      0
    )} in ${years} years`;
  }

  function calculateFutureValue(presentValue, annualRate, years) {
    return presentValue * Math.pow(1 + annualRate, years);
  }

  // Toggle change handlers - save immediately
  enableToggle.addEventListener("change", saveSettings);

  confirmToggle.addEventListener("change", async () => {
    updateSavingsDisplay(null, confirmToggle.checked);
    if (confirmToggle.checked) {
      await loadSavings();
    }
    saveSettings();
  });

  // Input change handlers - debounced save
  returnRateInput.addEventListener("input", () => {
    updateExample();
    debouncedSave();
  });

  yearsInput.addEventListener("input", () => {
    updateExample();
    debouncedSave();
  });

  minPriceInput.addEventListener("input", debouncedSave);

  // Listen for auth state changes from other parts of extension
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === ACTIONS.AUTH_STATE_CHANGED) {
      updateAuthUI(message.user);
      loadSettings();
      loadSavings();
      if (message.user) {
        loadBestVariant();
      } else {
        bestVariant.style.display = "none";
      }
    }
    sendResponse({ success: true });
  });
});
