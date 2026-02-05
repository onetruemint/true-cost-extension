"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      // Get tokens from URL hash (Supabase OAuth returns them in the hash)
      const hash = window.location.hash;
      if (hash) {
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");

        if (accessToken && refreshToken) {
          // Store tokens for the extension to pick up
          localStorage.setItem("tc_access_token", accessToken);
          localStorage.setItem("tc_refresh_token", refreshToken);

          // Try to get user info
          try {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/auth/google/callback`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  access_token: accessToken,
                  refresh_token: refreshToken,
                }),
              }
            );
            const data = await response.json();
            if (data.user) {
              localStorage.setItem("tc_user", JSON.stringify(data.user));
            }
          } catch {
            // Still consider it a success since we have the tokens
          }

          // Dispatch event for extension content script
          window.dispatchEvent(new Event("tc-auth-updated"));

          setStatus("success");
          setMessage("You're signed in! You can now close this page and return to the extension.");
          return;
        }
      }

      // Check for error in query params
      const error = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");

      if (error) {
        setStatus("error");
        setMessage(errorDescription || error || "Authentication failed");
        return;
      }

      setStatus("error");
      setMessage("No authentication data received");
    };

    handleCallback();
  }, [searchParams]);

  return (
    <div className="bg-offwhite rounded-xl shadow-xl border border-primary/20 p-8">
      {status === "loading" && (
        <>
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h1 className="text-xl font-semibold text-dark">Completing sign in...</h1>
        </>
      )}

      {status === "success" && (
        <>
          <div className="w-16 h-16 bg-mint rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              viewBox="0 0 24 24"
              width="32"
              height="32"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-primary"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-dark mb-2">Success!</h1>
          <p className="text-dark/70">{message}</p>
        </>
      )}

      {status === "error" && (
        <>
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              viewBox="0 0 24 24"
              width="32"
              height="32"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-red-500"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M15 9l-6 6M9 9l6 6" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-dark mb-2">Sign in failed</h1>
          <p className="text-red-600">{message}</p>
          <Link
            href="/signin"
            className="inline-block mt-4 px-6 py-2 bg-primary text-offwhite rounded-lg font-medium hover:bg-primary-hover transition-colors"
          >
            Try again
          </Link>
        </>
      )}
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="bg-offwhite rounded-xl shadow-xl border border-primary/20 p-8">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <h1 className="text-xl font-semibold text-dark text-center">Loading...</h1>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-mint to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <Suspense fallback={<LoadingFallback />}>
          <AuthCallbackContent />
        </Suspense>

        <p className="mt-6">
          <Link href="/" className="text-primary hover:underline text-sm font-medium">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
