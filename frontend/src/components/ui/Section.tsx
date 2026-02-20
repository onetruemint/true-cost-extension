import { ReactNode } from "react";

export function Section({
  id,
  className = "",
  children,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={`py-24 ${className}`}>
      <div className="max-w-6xl mx-auto px-6">{children}</div>
    </section>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">
      {children}
    </h2>
  );
}

export function SectionSubtitle({ children }: { children: ReactNode }) {
  return (
    <p className="text-lg text-dark/70 text-center max-w-2xl mx-auto mb-12">
      {children}
    </p>
  );
}
