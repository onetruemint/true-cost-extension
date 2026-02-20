import { ReactNode } from "react";

export function Alert({
  variant,
  children,
}: {
  variant: "error" | "success";
  children: ReactNode;
}) {
  const styles = {
    error: "bg-red-50 border-red-200 text-red-700",
    success: "bg-mint border-primary/30 text-primary",
  };

  return (
    <div className={`p-3 rounded-lg border text-sm ${styles[variant]}`}>
      {children}
    </div>
  );
}
