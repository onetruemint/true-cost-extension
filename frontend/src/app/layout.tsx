import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "True Cost Calculator - See What Your Money Could Become",
  description:
    "A Chrome extension that shows the true opportunity cost of purchases by calculating what the money could grow to if invested instead.",
  keywords: ["savings", "investment", "chrome extension", "budgeting", "personal finance"],
  openGraph: {
    title: "True Cost Calculator",
    description: "See what your money could become if invested instead of spent.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
