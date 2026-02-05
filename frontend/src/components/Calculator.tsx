"use client";

import { useState, useMemo } from "react";

export default function Calculator() {
  const [price, setPrice] = useState(100);
  const [rate, setRate] = useState(7);
  const [years, setYears] = useState(10);

  const result = useMemo(() => {
    const futureValue = price * Math.pow(1 + rate / 100, years);
    const growth = futureValue - price;
    return { futureValue: Math.round(futureValue), growth: Math.round(growth) };
  }, [price, rate, years]);

  return (
    <section id="calculator" className="py-24 bg-gradient-to-br from-mint to-primary-lighter">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">
          Try the Calculator
        </h2>
        <p className="text-lg text-dark/70 text-center max-w-2xl mx-auto mb-12">
          See how your money could grow over time.
        </p>

        <div className="bg-offwhite rounded-xl shadow-2xl max-w-2xl mx-auto overflow-hidden grid md:grid-cols-2">
          <div className="p-10 flex flex-col gap-6">
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Purchase Price
              </label>
              <div className="flex items-center gap-2">
                <span className="text-dark/50">$</span>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value) || 0)}
                  min={1}
                  max={100000}
                  className="w-28 px-3 py-2 border border-dark/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Annual Return Rate
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value) || 0)}
                  min={1}
                  max={30}
                  step={0.5}
                  className="w-28 px-3 py-2 border border-dark/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <span className="text-dark/50">%</span>
              </div>
              <p className="text-xs text-dark/50 mt-1.5">
                S&P 500 average: ~7% after inflation
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Investment Horizon
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={years}
                  onChange={(e) => setYears(Number(e.target.value) || 0)}
                  min={1}
                  max={50}
                  className="w-28 px-3 py-2 border border-dark/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <span className="text-dark/50">years</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary to-primary-hover p-10 flex flex-col items-center justify-center text-offwhite text-center">
            <div className="text-xs uppercase tracking-widest opacity-90 mb-2">
              True Cost
            </div>
            <div className="text-5xl font-bold mb-1">
              ${result.futureValue.toLocaleString()}
            </div>
            <div className="text-sm opacity-90 mb-4">
              in {years} year{years !== 1 ? "s" : ""}
            </div>
            <div className="bg-offwhite/20 px-4 py-2 rounded-full text-sm">
              <span className="font-semibold">+${result.growth.toLocaleString()}</span>{" "}
              potential growth
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
