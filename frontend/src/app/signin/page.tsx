"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn, signUp, getGoogleOAuthUrl } from "@/lib/api";

export default function SignInPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const result = isSignUp
        ? await signUp(email, password)
        : await signIn(email, password);

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.session) {
        // Store tokens for the extension to pick up
        localStorage.setItem("tc_access_token", result.session.access_token);
        localStorage.setItem("tc_refresh_token", result.session.refresh_token);
        localStorage.setItem("tc_user", JSON.stringify(result.user));

        // Dispatch event for extension content script
        window.dispatchEvent(new Event("tc-auth-updated"));

        setSuccess(
          "Success! You can now close this page and return to the extension."
        );
      } else if (result.user && !result.session) {
        // Email confirmation required
        setSuccess("Please check your email to confirm your account.");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const currentUrl = window.location.origin + "/auth/callback";
      const url = await getGoogleOAuthUrl(currentUrl);
      window.location.href = url;
    } catch {
      setError("Failed to initialize Google sign in");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-mint to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 text-xl font-semibold text-dark">
            <svg
              viewBox="0 0 24 24"
              width="32"
              height="32"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-primary"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <span>True Cost Calculator</span>
          </Link>
        </div>

        <div className="bg-offwhite rounded-xl shadow-xl border border-primary/20 p-8">
          <h1 className="text-2xl font-bold text-dark text-center mb-2">
            {isSignUp ? "Create an account" : "Welcome back"}
          </h1>
          <p className="text-dark/60 text-center mb-6">
            {isSignUp
              ? "Sign up to sync your savings across devices"
              : "Sign in to access your savings data"}
          </p>

          {/* Tab Switcher */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                !isSignUp
                  ? "bg-primary text-offwhite"
                  : "bg-mint text-dark hover:bg-primary/20"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                isSignUp
                  ? "bg-primary text-offwhite"
                  : "bg-mint text-dark hover:bg-primary/20"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-dark/20 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-dark mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-lg border border-dark/20 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 rounded-lg bg-mint border border-primary/30 text-primary text-sm">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-primary hover:bg-primary-hover text-offwhite rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? isSignUp
                  ? "Creating account..."
                  : "Signing in..."
                : isSignUp
                ? "Create Account"
                : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-dark/10"></div>
            <span className="px-4 text-sm text-dark/50">or</span>
            <div className="flex-1 border-t border-dark/10"></div>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full py-3 px-4 bg-white border border-dark/20 rounded-lg font-medium text-dark hover:bg-mint transition-colors flex items-center justify-center gap-3"
          >
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          {/* Extension hint */}
          <p className="mt-6 text-center text-sm text-dark/50">
            After signing in, return to the extension to see your synced data.
          </p>
        </div>

        {/* Back to home */}
        <p className="text-center mt-6">
          <Link href="/" className="text-primary hover:underline text-sm font-medium">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
