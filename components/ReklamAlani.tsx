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

  const gosterilecekler = liste.slice(0, maxCount);

  if (gosterilecekler.length === 0) return null;

  // YATAY BANNER
  if (variant === "banner") {
    return (
      <div className={`flex flex-col gap-3 ${className}`}>
        {gosterilecekler.map((reklam) => (
          <Link
            key={reklam.id}
            href={reklam.link_url}
            target="_blank"
            rel="sponsored noopener noreferrer"
            className="block relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow"
            style={{ aspectRatio: "3 / 1", maxHeight: "160px" }}
          >
            <Image
              src={reklam.gorsel_url}
              alt={reklam.baslik || "Reklam"}
              fill
              className="object-contain bg-white"
              sizes="(max-width: 768px) 100vw, 1200px"
            />
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

  // KARE
  return (
    <div
      className={`grid gap-3 ${
        gosterilecekler.length === 1
          ? "grid-cols-1 max-w-[280px] mx-auto"
          : "grid-cols-2 max-w-2xl mx-auto"
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