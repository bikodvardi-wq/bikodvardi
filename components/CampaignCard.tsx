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
      sektor_id?: number;
    } | null;
  };
  turAdi?: string; // kampanya türünün adı (örnek: "İndirim", "Ücretsiz" vs.)
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

  // Kaç gün kaldığını hesapla
  const gunKalan = kampanya.bitis_date
    ? Math.ceil(
        (new Date(kampanya.bitis_date).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  // Variant stilleri
  const isSonSans = variant === "son-sans";
  const isUcretsiz = variant === "ucretsiz";

  return (
    <Link
      href={`/kampanya/${kampanya.slug}`}
      className={`
        group relative flex flex-col justify-between
        rounded-[1.75rem] border transition-all duration-300
        overflow-hidden no-underline
        ${isUcretsiz
          ? "bg-[#0F172A] border-white/10 hover:border-blue-500/40 hover:shadow-2xl hover:shadow-blue-900/20"
          : isSonSans
          ? "bg-orange-50/60 border-orange-200 hover:border-orange-400 hover:bg-orange-50"
          : "bg-white border-slate-200 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5"
        }
        ${className}
      `}
    >
      {/* Üst Kısım */}
      <div className="p-5 pb-4">
        {/* Logo + Badge */}
        <div className="flex items-start justify-between mb-4">
          <div
            className={`
              w-11 h-11 rounded-2xl flex items-center justify-center overflow-hidden
              ${isUcretsiz ? "bg-white" : "bg-slate-50 border border-slate-100"}
            `}
          >
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={markaAdi}
                width={28}
                height={28}
                className="object-contain max-h-7"
              />
            ) : (
              <span
                className={`text-sm font-black ${
                  isUcretsiz ? "text-slate-900" : "text-slate-600"
                }`}
              >
                {markaAdi.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {/* Badge */}
          {isUcretsiz ? (
            <span className="bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
              BEDAVA
            </span>
          ) : isSonSans ? (
            <span className="bg-orange-100 text-orange-600 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">
              SÜRE BİTİYOR
            </span>
          ) : (
            <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2.5 py-1 rounded-lg">
              {turAdi}
            </span>
          )}
        </div>

        {/* Başlık */}
        <h3
          className={`
            font-bold text-[15px] leading-snug line-clamp-2 mb-2
            transition-colors
            ${isUcretsiz
              ? "text-white group-hover:text-blue-400"
              : "text-slate-900 group-hover:text-blue-600"
            }
          `}
          style={{ fontFamily: "Outfit" }}
        >
          {kampanya.baslik}
        </h3>

        {/* Marka adı */}
        <p
          className={`text-xs font-medium ${
            isUcretsiz ? "text-slate-400" : "text-slate-500"
          }`}
        >
          {markaAdi}
        </p>
      </div>

      {/* Alt Kısım */}
      <div
        className={`
          px-5 pb-5 pt-2 flex items-center justify-between
          ${isUcretsiz ? "border-t border-white/5" : "border-t border-slate-100"}
        `}
      >
        {/* Sol taraf - süre bilgisi */}
        <div className="text-[11px] font-medium">
          {gunKalan !== null && gunKalan > 0 ? (
            <span
              className={
                isSonSans
                  ? "text-orange-600 font-bold"
                  : isUcretsiz
                  ? "text-slate-400"
                  : "text-slate-400"
              }
            >
              {gunKalan} gün kaldı
            </span>
          ) : (
            <span className={isUcretsiz ? "text-slate-500" : "text-slate-400"}>
              Devam ediyor
            </span>
          )}
        </div>

        {/* Sağ taraf - Buton */}
        <span
          className={`
            text-[12px] font-bold px-3.5 py-1.5 rounded-xl transition-all
            ${isUcretsiz
              ? "bg-white text-slate-900 group-hover:bg-blue-500 group-hover:text-white"
              : isSonSans
              ? "bg-orange-500 text-white group-hover:bg-orange-600"
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