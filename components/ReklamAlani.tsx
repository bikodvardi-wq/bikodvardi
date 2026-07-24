"use client";

import Image from "next/image";
import Link from "next/link";

interface Reklam {
  id: number;
  baslik: string;
  gorsel_url: string;
  link_url: string;
  konum?: string;
  etiket?: string;
}

interface ReklamAlaniProps {
  reklamlar: Reklam[] | Reklam | null;
  className?: string;
  maxCount?: number;
}

export default function ReklamAlani({
  reklamlar,
  className = "",
  maxCount = 2,
}: ReklamAlaniProps) {
  const liste = !reklamlar
    ? []
    : Array.isArray(reklamlar)
    ? reklamlar
    : [reklamlar];

  const gosterilecekler = liste.slice(0, maxCount);

  if (gosterilecekler.length === 0) {
    return (
      <div
        className={`w-full rounded-2xl border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center ${className}`}
        style={{ aspectRatio: "1 / 1", maxWidth: "280px" }}
      >
        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
          Reklam Alanı
        </span>
      </div>
    );
  }

  return (
    <div
      className={`grid gap-3 ${
        gosterilecekler.length === 1
          ? "grid-cols-1 max-w-[280px] mx-auto"
          : "grid-cols-2"
      } ${className}`}
    >
      {gosterilecekler.map((reklam) => (
        <Link
          key={reklam.id}
          href={reklam.link_url}
          target="_blank"
          rel="sponsored noopener noreferrer"
          className="block relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow group"
          style={{ aspectRatio: "1 / 1" }}
        >
          <Image
            src={reklam.gorsel_url}
            alt={reklam.baslik || "Reklam"}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 280px"
          />

          {/* ETİKET */}
          {reklam.etiket && (
            <span className="absolute top-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider backdrop-blur-sm">
              {reklam.etiket}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}