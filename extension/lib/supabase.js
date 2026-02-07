/**
 * API client for Savest Chrome Extension
 * Communicates with the backend proxy server (not directly with Supabase)
 */

// Backend proxy server URL - update this to your deployed server
const API_URL = "http://localhost:3000";

class TrueCostAPI {
  constructor(apiUrl) {
    this.apiUrl = apiUrl;
    this.accessToken = null;
    this.refreshToken = null;
    this.user = null;
  }

  // Make API request
  async request(endpoint, options = {}) {
    const url = `${this.apiUrl}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    // Add auth header if we have a token
    if (this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Request failed");
    }

    return data;
  }

  // ============ Authentication ============

  async signUp(email, password) {
    try {
      const data = await this.request("/auth/signup", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      return this.handleAuthResponse(data);
    } catch (e) {
      return { user: null, error: e };
    }
  }

  async signIn(email, password) {
    try {
      const data = await this.request("/auth/signin", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      return this.handleAuthResponse(data);
    } catch (e) {
      return { user: null, error: e };
    }
  }

  async signOut() {
    try {
      await this.request("/auth/signout", { method: "POST" });
    } catch (e) {
      // Ignore errors
    }
    this.accessToken = null;
    this.refreshToken = null;
    this.user = null;
    await chrome.storage.local.remove([
      "api_access_token",
      "api_refresh_token",
      "api_user",
    ]);
  }

  async refreshSession() {
    if (!this.refreshToken) return null;

    try {
      const data = await this.request("/auth/refresh", {
        method: "POST",
        body: JSON.stringify({ refresh_token: this.refreshToken }),
      });
      return this.handleAuthResponse(data);
    } catch (e) {
      await this.signOut();
      return null;
    }
  }

  handleAuthResponse(data) {
    if (data.session?.access_token) {
      this.accessToken = data.session.access_token;
      this.refreshToken = data.session.refresh_token;
      this.user = data.user;

      // Persist tokens
      chrome.storage.local.set({
        api_access_token: this.accessToken,
        api_refresh_token: this.refreshToken,
        api_user: this.user,
      });
    } else if (data.user && !data.session) {
      // User created but not yet confirmed (email confirmation)
      this.user = data.user;
    }
    return { user: this.user, error: null };
  }

  async restoreSession() {
    const stored = await chrome.storage.local.get([
      "api_access_token",
      "api_refresh_token",
      "api_user",
    ]);

    console.log("[Savest] Stored tokens found:", !!stored.api_access_token, !!stored.api_refresh_token);

    if (stored.api_access_token) {
      this.accessToken = stored.api_access_token;
      this.refreshToken = stored.api_refresh_token;
      this.user = stored.api_user;

      // Verify token is still valid by refreshing
      const result = await this.refreshSession();
      console.log("[Savest] Session refresh result:", !!result?.user);
      return result?.user || null;
    }
    return null;
  }

  getUser() {
    return this.user;
  }

  isAuthenticated() {
    return !!this.user && !!this.accessToken;
  }

  // Get Google OAuth URL from server
  async getGoogleOAuthUrl(redirectTo) {
    const data = await this.request(
      `/auth/google/url?redirect_to=${encodeURIComponent(redirectTo)}`,
    );
    return data.url;
  }

  // Handle OAuth callback - exchange tokens
  async handleOAuthCallback(accessToken, refreshToken) {
    try {
      const data = await this.request("/auth/google/callback", {
        method: "POST",
        body: JSON.stringify({
          access_token: accessToken,
          refresh_token: refreshToken,
        }),
      });

      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      this.user = data.user;

      await chrome.storage.local.set({
        api_access_token: this.accessToken,
        api_refresh_token: this.refreshToken,
        api_user: this.user,
      });

      return { user: this.user, error: null };
    } catch (e) {
      return { user: null, error: e };
    }
  }

  // ============ User Settings ============

  async getSettings() {
    if (!this.isAuthenticated()) return null;

    try {
      const data = await this.request("/settings");
      return data.settings;
    } catch (e) {
      console.error("Failed to get settings:", e);
      return null;
    }
  }

  async saveSettings(settings) {
    if (!this.isAuthenticated()) return null;

    try {
      const data = await this.request("/settings", {
        method: "POST",
        body: JSON.stringify({
          enabled: settings.enabled,
          confirm_before_purchase: settings.confirmBeforePurchase,
          return_rate: settings.returnRate,
          years: settings.years,
          min_price: settings.minPrice,
        }),
      });
      return data.settings;
    } catch (e) {
      console.error("Failed to save settings:", e);
      return null;
    }
  }

  // ============ Question Variants ============

  async getActiveVariants() {
    if (!this.isAuthenticated()) return [];

    try {
      const data = await this.request("/variants");
      return data.variants;
    } catch (e) {
      console.error("Failed to get variants:", e);
      return [];
    }
  }

  async getEffectivenessStats() {
    if (!this.isAuthenticated()) return [];

    try {
      const data = await this.request("/variants/effectiveness");
      return data.effectiveness;
    } catch (e) {
      console.error("Failed to get effectiveness stats:", e);
      return [];
    }
  }

  async selectWeightedVariant() {
    const variants = await this.getActiveVariants();
    if (variants.length === 0) return null;

    const stats = await this.getEffectivenessStats();
    const statsMap = new Map(stats.map((s) => [s.question_variant_id, s]));

    // Calculate weights based on skip rate
    const weightedVariants = variants.map((v) => {
      const stat = statsMap.get(v.id);
      if (!stat || stat.times_shown === 0) {
        // New variant - give it a base weight
        return { variant: v, weight: 1 };
      }
      // Weight by skip rate (higher skip rate = more effective = higher weight)
      const skipRate = stat.times_skipped / stat.times_shown;
      return { variant: v, weight: 0.5 + skipRate };
    });

    // Weighted random selection
    const totalWeight = weightedVariants.reduce(
      (sum, wv) => sum + wv.weight,
      0,
    );
    let random = Math.random() * totalWeight;

    for (const wv of weightedVariants) {
      random -= wv.weight;
      if (random <= 0) {
        return wv.variant;
      }
    }

    return weightedVariants[0].variant;
  }

  // ============ Savings Records ============

  async recordSaving(data) {
    if (!this.isAuthenticated()) return null;

    try {
      const result = await this.request("/savings", {
        method: "POST",
        body: JSON.stringify({
          price: data.price,
          currency: data.currency || "USD",
          url: data.url,
          product_title: data.productTitle,
          question_variant_id: data.questionVariantId,
          user_response: data.userResponse,
          final_decision: data.finalDecision,
        }),
      });
      return result.saving;
    } catch (e) {
      console.error("Failed to record saving:", e);
      return null;
    }
  }

  // ============ Savings Queries ============

  async getSavings(period = "all") {
    if (!this.isAuthenticated()) return { total: 0, count: 0 };

    try {
      const data = await this.request(`/savings?period=${period}`);
      return { total: data.total, count: data.count };
    } catch (e) {
      console.error("Failed to get savings:", e);
      return { total: 0, count: 0 };
    }
  }

  async getTodaySavings() {
    return this.getSavings("today");
  }

  async getWeekSavings() {
    return this.getSavings("week");
  }

  async getMonthSavings() {
    return this.getSavings("month");
  }

  async getYTDSavings() {
    return this.getSavings("ytd");
  }

  async getAllTimeSavings() {
    return this.getSavings("all");
  }

  async getMostEffectiveVariant() {
    if (!this.isAuthenticated()) return null;

    try {
      const data = await this.request("/savings/best-variant");
      return data.best_variant;
    } catch (e) {
      console.error("Failed to get best variant:", e);
      return null;
    }
  }
}

// Export singleton instance
const supabase = new TrueCostAPI(API_URL);

// Make available globally for content scripts and popup
if (typeof window !== "undefined") {
  window.supabase = supabase;
}

// For module environments
if (typeof module !== "undefined") {
  module.exports = { supabase, TrueCostAPI };
}
