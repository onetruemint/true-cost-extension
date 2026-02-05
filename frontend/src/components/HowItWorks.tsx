const steps = [
  {
    number: 1,
    title: "Install the Extension",
    description: "Add True Cost Calculator to Chrome with one click. No account required to start.",
  },
  {
    number: 2,
    title: "Shop as Usual",
    description: "Browse Amazon and other shopping sites. The extension automatically detects prices.",
  },
  {
    number: 3,
    title: "See the True Cost",
    description: "A subtle badge appears showing what the money could grow to if invested instead.",
  },
  {
    number: 4,
    title: "Make Better Decisions",
    description: "With the true cost visible, decide if the purchase is really worth it to you.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-offwhite">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">
          How It Works
        </h2>
        <p className="text-lg text-dark/70 text-center max-w-2xl mx-auto mb-12">
          Simple math, powerful insight. The True Cost Calculator uses compound
          interest to show opportunity cost.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <div className="w-12 h-12 bg-primary text-offwhite rounded-full flex items-center justify-center text-xl font-semibold mx-auto mb-5">
                {step.number}
              </div>
              <h3 className="text-base font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-dark/70">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
