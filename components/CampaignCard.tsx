"use client";

import Link from "next/link";
import Image from "next/image";

interface CampaignCardProps {
  kampanya: {
    id: number;
    slug: string;
    baslik: string;
    bitis_date?: string | null;
    kampanya_turu?: number;
    yapan_marka_bilgisi?: {
      marka_adi?: string;
      logo_url?: string | null;
    } | null;
  };
  turAdi?: string;
  variant?: "default" | "son-sans" | "ucretsiz";
  className?: string;
}

export default function CampaignCard({
  kampanya,
  turAdi = "Fırsat",
  variant = "default",
  className = "",
}: CampaignCardProps) {
  const markaAdi = kampanya.yapan_marka_bilgisi?.marka_adi || "Marka";
  const logoUrl = kampanya.yapan_marka_bilgisi?.logo_url;

  const gunKalan = kampanya.bitis_date
    ? Math.ceil(
        (new Date(kampanya.bitis_date).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  const isSonSans = variant === "son-sans";
  const isUcretsiz = variant === "ucretsiz";

  return (
    <Link
      href={`/kampanya/${kampanya.slug}`}
      className={`
        group flex flex-col h-full rounded-2xl border transition-all duration-300 overflow-hidden no-underline
        ${isUcretsiz
          ? "bg-[#0F172A] border-white/10 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-900/20"
          : isSonSans
          ? "bg-orange-50 border-orange-200 hover:border-orange-400 hover:shadow-md"
          : "bg-white border-slate-200 hover:border-blue-300 hover:shadow-lg"
        }
        ${className}
      `}
    >
      {/* Üst Kısım */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Logo + Badge */}
        <div className="flex items-start justify-between mb-3">
          <div
            className={`
              w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden shrink-0
              ${isUcretsiz ? "bg-white" : "bg-slate-50 border border-slate-100"}
            `}
          >
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={markaAdi}
                width={24}
                height={24}
                className="object-contain"
              />
            ) : (
              <span className={`text-sm font-black ${isUcretsiz ? "text-slate-800" : "text-slate-600"}`}>
                {markaAdi.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {isUcretsiz ? (
            <span className="bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
              BEDAVA
            </span>
          ) : isSonSans ? (
            <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-1 rounded-md">
              SÜRE BİTİYOR
            </span>
          ) : (
            <span className="bg-blue-50 text-blue-700 text-[10px] font-semibold px-2 py-1 rounded-md">
              {turAdi}
            </span>
          )}
        </div>

        {/* Başlık */}
        <h3
          className={`
            font-bold text-[14px] leading-snug line-clamp-2 mb-1.5
            ${isUcretsiz ? "text-white group-hover:text-blue-400" : "text-slate-900 group-hover:text-blue-600"}
          `}
          style={{ fontFamily: "Outfit" }}
        >
          {kampanya.baslik}
        </h3>

        <p className={`text-xs ${isUcretsiz ? "text-slate-400" : "text-slate-500"}`}>
          {markaAdi}
        </p>
      </div>

      {/* Alt Kısım */}
      <div
        className={`
          px-4 py-3 flex items-center justify-between border-t
          ${isUcretsiz ? "border-white/10" : "border-slate-100"}
        `}
      >
        <span className={`text-[11px] ${isUcretsiz ? "text-slate-400" : isSonSans ? "text-orange-600 font-medium" : "text-slate-400"}`}>
          {gunKalan !== null && gunKalan > 0 ? `${gunKalan} gün kaldı` : "Devam ediyor"}
        </span>

        <span
          className={`
            text-[12px] font-semibold px-3 py-1 rounded-lg transition-colors
            ${isUcretsiz
              ? "bg-white text-slate-900 group-hover:bg-blue-500 group-hover:text-white"
              : isSonSans
              ? "bg-orange-500 text-white"
              : "bg-slate-900 text-white group-hover:bg-blue-600"
            }
          `}
        >
          İncele →
        </span>
      </div>
    </Link>
  );
}