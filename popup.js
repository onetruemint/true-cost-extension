document.addEventListener('DOMContentLoaded', () => {
  const enableToggle = document.getElementById('enableToggle');
  const returnRateInput = document.getElementById('returnRate');
  const yearsInput = document.getElementById('years');
  const saveBtn = document.getElementById('saveBtn');
  const status = document.getElementById('status');
  const exampleResult = document.getElementById('exampleResult');

  // Default settings
  const defaults = {
    enabled: true,
    returnRate: 7,
    years: 10
  };

  // Load saved settings
  chrome.storage.local.get(defaults, (settings) => {
    enableToggle.checked = settings.enabled;
    returnRateInput.value = settings.returnRate;
    yearsInput.value = settings.years;
    updateExample();
  });

  // Update example on input change
  returnRateInput.addEventListener('input', updateExample);
  yearsInput.addEventListener('input', updateExample);

  function updateExample() {
    const rate = parseFloat(returnRateInput.value) / 100;
    const years = parseInt(yearsInput.value);
    const futureValue = calculateFutureValue(100, rate, years);
    exampleResult.textContent = `True cost: $${futureValue.toFixed(0)} in ${years} years`;
  }

  function calculateFutureValue(presentValue, annualRate, years) {
    return presentValue * Math.pow(1 + annualRate, years);
  }

  // Save settings
  saveBtn.addEventListener('click', () => {
    const settings = {
      enabled: enableToggle.checked,
      returnRate: parseFloat(returnRateInput.value),
      years: parseInt(yearsInput.value)
    };

    chrome.storage.local.set(settings, () => {
      status.textContent = 'Settings saved!';
      setTimeout(() => {
        status.textContent = '';
      }, 2000);

      // Notify content scripts
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'settingsUpdated',
            settings: settings
          }).catch(() => {
            // Tab might not have content script
          });
        }
      });
    });
  });

  // Quick toggle
  enableToggle.addEventListener('change', () => {
    chrome.storage.local.set({ enabled: enableToggle.checked });
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'toggle',
          enabled: enableToggle.checked
        }).catch(() => {});
      }
    });
  });
});
