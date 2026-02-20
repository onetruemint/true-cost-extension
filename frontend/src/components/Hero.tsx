import Link from "next/link";
import { ChromeButton } from "./ui";

export default function Hero() {
  return (
    <section className="pt-36 pb-20 bg-gradient-to-b from-mint to-white">
      <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        <div className="text-center lg:text-left">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-5">
            See What Your Money{" "}
            <span className="text-primary">Could Become</span>
          </h1>
          <p className="text-lg text-dark/70 mb-8 max-w-lg mx-auto lg:mx-0">
            Before you click &quot;Buy Now,&quot; discover the true opportunity cost.
            That $100 purchase could be worth $197 in 10 years if invested
            instead.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-4">
            <ChromeButton className="bg-primary hover:bg-primary-hover text-offwhite" />
            <Link
              href="#calculator"
              className="inline-flex items-center justify-center gap-2 bg-mint hover:bg-primary-light text-dark px-8 py-4 rounded-lg text-base font-medium transition-colors border border-primary/30"
            >
              Try the Calculator
            </Link>
          </div>

          <p className="text-sm text-dark/50">
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
    <div className="bg-offwhite rounded-xl shadow-2xl border border-primary/20 overflow-hidden">
      <div className="bg-mint/50 px-4 py-3 flex items-center gap-3 border-b border-primary/20">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-400" />
          <span className="w-3 h-3 rounded-full bg-yellow-400" />
          <span className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 bg-offwhite px-3 py-1.5 rounded text-sm text-dark/50">
          amazon.com
        </div>
      </div>

      <div className="p-6 flex gap-5 items-start">
        <div className="flex-1 flex gap-4">
          <div className="w-28 h-28 bg-gradient-to-br from-dark/20 to-dark/10 rounded-lg" />
          <div className="flex flex-col gap-2">
            <div className="font-medium text-dark">Wireless Headphones</div>
            <div className="text-2xl font-bold text-dark">$149.99</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary-light to-primary-lighter border border-savings-border rounded-lg px-5 py-4 text-center min-w-[140px]">
          <div className="text-xs font-semibold uppercase tracking-wide text-savings-medium mb-1">
            True Cost
          </div>
          <div className="text-3xl font-bold text-savings-dark">$295</div>
          <div className="text-xs text-savings-medium">in 10 years @ 7%</div>
        </div>
      </div>
    </div>
  );
}
