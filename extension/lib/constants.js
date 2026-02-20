/**
 * Shared constants for the Savest Chrome extension.
 * Loaded via importScripts (service worker), <script> tags (popup/auth),
 * and manifest content_scripts (content scripts).
 */

// ----- Environment config (update these for deployment) -----

const SAVEST_API_URL = "http://localhost:3000";
const SAVEST_FRONTEND_URL = "http://localhost:3001";

// ----- Chrome storage keys -----

const STORAGE_KEYS = {
  ACCESS_TOKEN: "api_access_token",
  REFRESH_TOKEN: "api_refresh_token",
  USER: "api_user",
};

// ----- localStorage keys (used on the frontend for extension sync) -----

const LOCAL_STORAGE_KEYS = {
  ACCESS_TOKEN: "tc_access_token",
  REFRESH_TOKEN: "tc_refresh_token",
  USER: "tc_user",
};

// ----- Chrome runtime message actions -----

const ACTIONS = {
  AUTH_STATE_CHANGED: "authStateChanged",
  GET_AUTH_STATE: "getAuthState",
  SYNC_AUTH_FROM_FRONTEND: "syncAuthFromFrontend",
  RECORD_SAVING: "recordSaving",
  GET_VARIANTS: "getVariants",
  GET_WEIGHTED_VARIANT: "getWeightedVariant",
  SETTINGS_UPDATED: "settingsUpdated",
  TOGGLE: "toggle",
};

// ----- Custom DOM events -----

const EVENTS = {
  AUTH_UPDATED: "tc-auth-updated",
};

// ----- Default user settings -----

const DEFAULT_SETTINGS = {
  enabled: true,
  confirmBeforePurchase: false,
  returnRate: 7,
  years: 10,
  minPrice: 10,
};

// ----- Timing constants -----

const TIMING = {
  SESSION_REFRESH_MINUTES: 30,
  AUTH_CLOSE_DELAY_MS: 2000,
  SETTINGS_DEBOUNCE_MS: 500,
  STATUS_DISPLAY_MS: 1000,
};

// ----- Variant selection weights -----

const VARIANT_WEIGHTS = {
  BASE_WEIGHT: 1,
  MIN_WEIGHT_OFFSET: 0.5,
};

// ----- Chrome alarms -----

const ALARMS = {
  SESSION_REFRESH: "sessionRefresh",
};

// ----- Amazon URL patterns (for tab queries) -----

const AMAZON_URL_PATTERNS = [
  "*://*.amazon.com/*",
  "*://*.amazon.co.uk/*",
  "*://*.amazon.ca/*",
  "*://*.amazon.de/*",
  "*://*.amazon.fr/*",
  "*://*.amazon.es/*",
  "*://*.amazon.it/*",
  "*://*.amazon.co.jp/*",
  "*://*.amazon.com.au/*",
];

// ----- Content script DOM constants -----

const DOM = {
  BADGE_CLASS: "savest-badge",
  PROCESSED_ATTR: "data-savest-processed",
  CONFIRM_ATTR: "data-savest-confirm",
  CONFIRMED_ATTR: "data-savest-confirmed",
  MODAL_ID: "savest-modal",
  MAX_TITLE_LENGTH: 200,
};

// ----- Amazon price selectors -----

const PRODUCT_PAGE_SELECTORS = [
  "#corePrice_feature_div .a-price .a-offscreen",
  "#corePriceDisplay_desktop_feature_div .a-price .a-offscreen",
  "#priceblock_ourprice",
  "#priceblock_dealprice",
  "#priceblock_saleprice",
  '.a-price[data-a-size="xl"] .a-offscreen',
  '.a-price[data-a-size="l"] .a-offscreen',
];

const CART_SELECTORS = [
  "#sc-subtotal-amount-activecart .a-price .a-offscreen",
  "#sc-subtotal-amount-buybox .a-price .a-offscreen",
  ".sc-subtotal .a-price .a-offscreen",
  "#subtotals-marketplace-table .a-price .a-offscreen",
];

const PURCHASE_BUTTON_SELECTORS = [
  "#add-to-cart-button",
  "#buy-now-button",
  'input[name="submit.add-to-cart"]',
  "#submit.add-to-cart",
  '.a-button-input[name="submit.addToCart"]',
  "#sc-buy-box-ptc-button input",
  "#submitOrderButtonId input",
  'input[name="placeYourOrder1"]',
];

// ----- Default question variants (offline fallback) -----

const DEFAULT_VARIANTS = [
  {
    id: "default-1",
    question_text: "Is this a want or a need?",
    subtext: "Be honest with yourself.",
  },
  {
    id: "default-2",
    question_text: "Will this purchase bring lasting joy?",
    subtext: "Think about how you'll feel in a month.",
  },
  {
    id: "default-3",
    question_text: "Do you really need this right now?",
    subtext: "Consider if you could wait.",
  },
  {
    id: "default-4",
    question_text: "Is future-you going to thank you for this?",
    subtext: "Think long-term.",
  },
];

// ----- Currency mappings -----

const CURRENCY_SYMBOLS = {
  ".co.uk": "£",
  ".de": "€",
  ".fr": "€",
  ".es": "€",
  ".it": "€",
  ".co.jp": "¥",
  ".com.au": "A$",
  ".ca": "C$",
};

const CURRENCY_CODES = {
  ".co.uk": "GBP",
  ".de": "EUR",
  ".fr": "EUR",
  ".es": "EUR",
  ".it": "EUR",
  ".co.jp": "JPY",
  ".com.au": "AUD",
  ".ca": "CAD",
};

const DEFAULT_CURRENCY_SYMBOL = "$";
const DEFAULT_CURRENCY_CODE = "USD";
