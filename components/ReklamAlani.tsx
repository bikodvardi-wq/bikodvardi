"use client";

import Image from "next/image";
import Link from "next/link";

interface Reklam {
  id: number;
  baslik?: string | null;
  gorsel_url: string;
  link_url: string;
  konum?: string;
  etiket?: string | null;
}

interface ReklamAlaniProps {
  reklamlar: Reklam[] | Reklam | null;
  className?: string;
  maxCount?: number;
  variant?: "square" | "banner";
}

export default function ReklamAlani({
  reklamlar,
  className = "",
  maxCount = 2,
  variant = "square",
}: ReklamAlaniProps) {
  const liste = !reklamlar
    ? []
    : Array.isArray(reklamlar)
      ? reklamlar
      : [reklamlar];

  const gosterilecekler = liste
    .filter((reklam) => reklam.gorsel_url && reklam.link_url)
    .slice(0, maxCount);

  if (gosterilecekler.length === 0) return null;

  // YATAY BANNER
  if (variant === "banner") {
    return (
      <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${className}`}>
        {gosterilecekler.map((reklam) => (
          <Link
            key={reklam.id}
            href={reklam.link_url}
            target="_blank"
            rel="sponsored noopener noreferrer"
            aria-label={reklam.baslik || "İş birliği bağlantısını aç"}
            className="group relative block h-[112px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg md:h-[132px]"
          >
            <Image
              src={reklam.gorsel_url}
              alt={reklam.baslik || "İş birliği bannerı"}
              fill
              className="object-contain p-2 transition-transform duration-300 group-hover:scale-[1.01]"
              sizes="(max-width: 640px) 100vw, 50vw"
            />

            <span className="absolute right-2.5 top-2.5 z-10 rounded-full border border-white/20 bg-slate-900/75 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider text-white shadow-sm backdrop-blur-md">
              {reklam.etiket || "İş Birliği"}
            </span>
          </Link>
        ))}
      </div>
    );
  }

  // KARE REKLAM
  return (
    <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${className}`}>
      {gosterilecekler.map((reklam) => (
        <Link
          key={reklam.id}
          href={reklam.link_url}
          target="_blank"
          rel="sponsored noopener noreferrer"
          aria-label={reklam.baslik || "İş birliği bağlantısını aç"}
          className="group relative block aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg"
        >
          <Image
            src={reklam.gorsel_url}
            alt={reklam.baslik || "İş birliği görseli"}
            fill
            className="object-contain p-3 transition-transform duration-300 group-hover:scale-[1.01]"
            sizes="(max-width: 640px) 100vw, 50vw"
          />

          <span className="absolute right-3 top-3 z-10 rounded-full border border-white/20 bg-slate-900/75 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider text-white shadow-sm backdrop-blur-md">
            {reklam.etiket || "İş Birliği"}
          </span>
        </Link>
      ))}
    </div>
  );
}