import Link from "next/link";

export default function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2.5 text-lg font-semibold text-gray-900">
          <svg
            viewBox="0 0 24 24"
            width="28"
            height="28"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-[--primary]"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          <span>True Cost Calculator</span>
        </Link>

        <div className="flex items-center gap-8">
          <Link href="#features" className="text-gray-600 text-sm font-medium hover:text-gray-900 transition-colors hidden md:block">
            Features
          </Link>
          <Link href="#how-it-works" className="text-gray-600 text-sm font-medium hover:text-gray-900 transition-colors hidden md:block">
            How It Works
          </Link>
          <Link href="#calculator" className="text-gray-600 text-sm font-medium hover:text-gray-900 transition-colors hidden md:block">
            Try It
          </Link>
          <a
            href="https://chrome.google.com/webstore"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[--primary] hover:bg-[--primary-hover] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Add to Chrome
          </a>
        </div>
      </div>
    </nav>
  );
}
