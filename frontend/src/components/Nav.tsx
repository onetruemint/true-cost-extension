"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogoLink } from "./ui";
import { STORAGE_KEYS, EVENTS, CHROME_WEBSTORE_URL } from "@/lib/constants";

export default function Nav() {
  const [user, setUser] = useState<{ email?: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.USER);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {}
    }

    const handleAuthUpdate = () => {
      const updated = localStorage.getItem(STORAGE_KEYS.USER);
      if (updated) {
        try {
          setUser(JSON.parse(updated));
        } catch {}
      } else {
        setUser(null);
      }
    };

    window.addEventListener(EVENTS.AUTH_UPDATED, handleAuthUpdate);
    window.addEventListener("storage", handleAuthUpdate);
    return () => {
      window.removeEventListener(EVENTS.AUTH_UPDATED, handleAuthUpdate);
      window.removeEventListener("storage", handleAuthUpdate);
    };
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-mint/90 backdrop-blur-sm border-b border-primary/20 z-50">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
        <LogoLink />

        <div className="flex items-center gap-8">
          <Link
            href="#features"
            className="text-dark/70 text-sm font-medium hover:text-dark transition-colors hidden md:block"
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="text-dark/70 text-sm font-medium hover:text-dark transition-colors hidden md:block"
          >
            How It Works
          </Link>
          <Link
            href="#calculator"
            className="text-dark/70 text-sm font-medium hover:text-dark transition-colors hidden md:block"
          >
            Try It
          </Link>
          {user ? (
            <span className="text-dark/70 text-sm font-medium hidden md:block">
              {user.email}
            </span>
          ) : (
            <Link
              href="/signin"
              className="text-dark/70 text-sm font-medium hover:text-dark transition-colors hidden md:block"
            >
              Sign In
            </Link>
          )}
          <a
            href={CHROME_WEBSTORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary hover:bg-primary-hover text-offwhite px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Add to Chrome
          </a>
        </div>
      </div>
    </nav>
  );
}
