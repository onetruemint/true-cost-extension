import Link from "next/link";

export function BackLink() {
  return (
    <p className="text-center mt-6">
      <Link
        href="/"
        className="text-primary hover:underline text-sm font-medium"
      >
        &larr; Back to home
      </Link>
    </p>
  );
}
