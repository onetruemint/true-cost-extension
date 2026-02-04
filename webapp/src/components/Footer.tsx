import Link from "next/link";

export default function Footer() {
  return (
    <footer className="py-10 bg-black text-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5 font-semibold">
            <svg
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-[--primary]"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <span>True Cost Calculator</span>
          </div>

          <div className="flex gap-8">
            <Link href="#" className="text-sm text-white/70 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-sm text-white/70 hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="text-sm text-white/70 hover:text-white transition-colors">
              Contact
            </Link>
          </div>

          <div className="text-sm text-white/50">
            &copy; {new Date().getFullYear()} True Cost Calculator. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
