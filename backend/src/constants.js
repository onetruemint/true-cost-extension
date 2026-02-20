// Database table names
export const TABLES = {
  USER_SETTINGS: "user_settings",
  QUESTION_VARIANTS: "question_variants",
  QUESTION_EFFECTIVENESS: "question_effectiveness",
  SAVINGS: "savings",
};

// Supabase error codes
export const DB_ERROR_NO_ROWS = "PGRST116";

// Default currency when none provided
export const DEFAULT_CURRENCY = "USD";

// Minimum times a variant must be shown to qualify as "best"
export const MIN_VARIANT_SHOWN_COUNT = 3;

// Default server port
export const DEFAULT_PORT = 3000;
