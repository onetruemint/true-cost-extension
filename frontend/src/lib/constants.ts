// localStorage keys used for auth token syncing with the extension
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "tc_access_token",
  REFRESH_TOKEN: "tc_refresh_token",
  USER: "tc_user",
} as const;

// Custom DOM events
export const EVENTS = {
  AUTH_UPDATED: "tc-auth-updated",
} as const;

// External URLs
export const CHROME_WEBSTORE_URL = "https://chrome.google.com/webstore";

// Calculator defaults and constraints
export const CALCULATOR = {
  DEFAULT_PRICE: 100,
  DEFAULT_RATE: 7,
  DEFAULT_YEARS: 10,
  MIN_PRICE: 1,
  MAX_PRICE: 100000,
  MIN_RATE: 1,
  MAX_RATE: 30,
  RATE_STEP: 0.5,
  MIN_YEARS: 1,
  MAX_YEARS: 50,
} as const;
