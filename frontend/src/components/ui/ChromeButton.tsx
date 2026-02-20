import { CHROME_WEBSTORE_URL } from "@/lib/constants";

const ChromeIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M12 0C8.21 0 4.831 1.757 2.632 4.501l3.953 6.848A5.454 5.454 0 0 1 12 6.545h10.691A12 12 0 0 0 12 0zM1.931 5.47A11.943 11.943 0 0 0 0 12c0 6.012 4.42 10.991 10.189 11.864l3.953-6.847a5.45 5.45 0 0 1-6.865-2.29zm13.342 2.166a5.446 5.446 0 0 1 1.45 7.09l.002.001h-.002l-3.952 6.848a12.014 12.014 0 0 0 9.921-5.778H15.273z" />
  </svg>
);

export function ChromeButton({
  className = "bg-primary hover:bg-primary-hover text-offwhite",
}: {
  className?: string;
}) {
  return (
    <a
      href={CHROME_WEBSTORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg text-base font-medium transition-colors ${className}`}
    >
      <ChromeIcon />
      Add to Chrome - It&apos;s Free
    </a>
  );
}
