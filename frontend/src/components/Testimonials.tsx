const testimonials = [
  {
    quote: "This extension completely changed how I think about spending. I've saved over $500 in just two months!",
    author: "Sarah M.",
  },
  {
    quote: 'Simple concept, powerful impact. The "want vs. need" prompt has stopped so many impulse buys.',
    author: "Mike R.",
  },
  {
    quote: "Finally, an extension that helps me build wealth instead of just tracking what I spend.",
    author: "Jessica T.",
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-[--white]">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          What Users Are Saying
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div key={t.author} className="bg-[--mint]/50 p-8 rounded-lg border border-[--primary]/10">
              <div className="text-yellow-400 text-lg mb-4">★★★★★</div>
              <p className="text-[--black] leading-relaxed mb-4">&quot;{t.quote}&quot;</p>
              <div className="text-sm font-medium text-[--black]/70">- {t.author}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
