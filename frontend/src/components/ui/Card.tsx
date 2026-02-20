import { ReactNode } from "react";

export function Card({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`bg-offwhite rounded-xl shadow-xl border border-primary/20 p-8 ${className}`}
    >
      {children}
    </div>
  );
}
