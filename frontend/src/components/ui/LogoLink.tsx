import Link from "next/link";
import Image from "next/image";

export function LogoLink({ size = 48 }: { size?: number }) {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2.5 text-xl font-semibold text-dark"
    >
      <Image
        src="/SavestRound.svg"
        alt="Savest logo"
        width={size}
        height={size}
      />
      <span>Savest</span>
    </Link>
  );
}
