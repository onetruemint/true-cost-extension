import Link from "next/link";

export default function Hero() {
  return (
    <section className="pt-36 pb-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        <div className="text-center lg:text-left">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-5">
            See What Your Money{" "}
            <span className="text-[--primary]">Could Become</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto lg:mx-0">
            Before you click &quot;Buy Now,&quot; discover the true opportunity cost.
            That $100 purchase could be worth $197 in 10 years if invested
            instead.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-4">
            <a
              href="https://chrome.google.com/webstore"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[--primary] hover:bg-[--primary-hover] text-white px-8 py-4 rounded-lg text-base font-medium transition-colors"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12 0C8.21 0 4.831 1.757 2.632 4.501l3.953 6.848A5.454 5.454 0 0 1 12 6.545h10.691A12 12 0 0 0 12 0zM1.931 5.47A11.943 11.943 0 0 0 0 12c0 6.012 4.42 10.991 10.189 11.864l3.953-6.847a5.45 5.45 0 0 1-6.865-2.29zm13.342 2.166a5.446 5.446 0 0 1 1.45 7.09l.002.001h-.002l-3.952 6.848a12.014 12.014 0 0 0 9.921-5.778H15.273z" />
              </svg>
              Add to Chrome - It&apos;s Free
            </a>
            <Link
              href="#calculator"
              className="inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-900 px-8 py-4 rounded-lg text-base font-medium transition-colors border border-gray-200"
            >
              Try the Calculator
            </Link>
          </div>

          <p className="text-sm text-gray-500">
            Works on Amazon and major shopping sites
          </p>
        </div>

        <div className="hidden lg:block">
          <BrowserMockup />
        </div>
      </div>
    </section>
  );
}

function BrowserMockup() {
  return (
    <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
      <div className="bg-gray-100 px-4 py-3 flex items-center gap-3 border-b border-gray-200">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-400" />
          <span className="w-3 h-3 rounded-full bg-yellow-400" />
          <span className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 bg-white px-3 py-1.5 rounded text-sm text-gray-500">
          amazon.com
        </div>
      </div>

      <div className="p-6 flex gap-5 items-start">
        <div className="flex-1 flex gap-4">
          <div className="w-28 h-28 bg-gradient-to-br from-gray-200 to-gray-100 rounded-lg" />
          <div className="flex flex-col gap-2">
            <div className="font-medium text-gray-900">Wireless Headphones</div>
            <div className="text-2xl font-bold text-gray-900">$149.99</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[--primary-light] to-[--primary-lighter] border border-[--savings-border] rounded-lg px-5 py-4 text-center min-w-[140px]">
          <div className="text-xs font-semibold uppercase tracking-wide text-[--savings-medium] mb-1">
            True Cost
          </div>
          <div className="text-3xl font-bold text-[--savings-dark]">$295</div>
          <div className="text-xs text-[--savings-medium]">in 10 years @ 7%</div>
        </div>
      </div>
    </div>
  );
}
