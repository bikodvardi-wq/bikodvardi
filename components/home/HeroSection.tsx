"use client";

import Link from "next/link";
import Image from "next/image";

interface HeroSectionProps {
  stats: {
    aktif: number;
    toplam: number;
    marka: number;
  };
  aramaTerimi: string;
  aramaSonuclari: any[];
  populerAramalar: string[];
  sektorler: any[];
  kampanyaTurleri: any[];
  seciliSektor: string;
  seciliTur: string;
  onArama: (terim: string) => void;
  onHizliArama: (terim: string) => void;
  onSektorChange: (value: string) => void;
  onTurChange: (value: string) => void;
}

export default function HeroSection({
  stats,
  aramaTerimi,
  aramaSonuclari,
  populerAramalar,
  sektorler,
  kampanyaTurleri,
  seciliSektor,
  seciliTur,
  onArama,
  onHizliArama,
  onSektorChange,
  onTurChange,
}: HeroSectionProps) {
  return (
    <header className="pt-8 md:pt-14 pb-10 md:pb-14">
      {/* İstatistikler */}
      <div className="flex flex-wrap justify-center gap-2.5 mb-8">
        <div className="inline-flex items-center gap-2 bg-white border border-slate-200 px-3.5 py-1.5 rounded-full shadow-sm">
          <span className="text-orange-500 text-xs">📦</span>

          <span className="text-[11px] font-bold text-slate-600">
            {stats.toplam.toLocaleString("tr-TR")} Toplam Kod
          </span>
        </div>

        <div className="inline-flex items-center gap-2 bg-white border border-slate-200 px-3.5 py-1.5 rounded-full shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>

          <span className="text-[11px] font-bold text-slate-600">
            {stats.aktif.toLocaleString("tr-TR")} Aktif Kampanya
          </span>
        </div>

        <div className="hidden sm:inline-flex items-center gap-2 bg-white border border-slate-200 px-3.5 py-1.5 rounded-full shadow-sm">
          <span className="text-blue-500 text-xs font-black">●</span>

          <span className="text-[11px] font-bold text-slate-600">
            {stats.marka}+ Marka
          </span>
        </div>
      </div>

      {/* Başlık */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-[900] tracking-tight text-slate-900 leading-[1.15]"
          style={{ fontFamily: "Outfit" }}
        >
          İndirim kodu ara,
          <br />

          <span className="text-blue-600">bi&apos;kod bul.</span>
        </h1>
      </div>

      {/* Arama */}
      <div className="w-full max-w-2xl mx-auto relative">
        <div className="relative">
          <input
            type="text"
            placeholder="Marka, kategori veya fırsat ara..."
            value={aramaTerimi}
            onChange={(e) => onArama(e.target.value)}
            className="w-full bg-white border border-slate-200 text-slate-900 text-base md:text-lg
                       py-4 md:py-5 pl-5 pr-12 rounded-2xl shadow-lg shadow-slate-200/50
                       outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-400
                       transition-all font-medium placeholder:text-slate-400"
          />

          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Arama Sonuçları */}
        {aramaSonuclari.length > 0 && (
          <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 z-50 overflow-hidden">
            {aramaSonuclari.map((item: any, index: number) => (
              <Link
                key={index}
                href={
                  item.tip === "sektor"
                    ? `/sektor/${item.slug}`
                    : `/marka/${item.slug}`
                }
                className="flex items-center justify-between p-3.5 hover:bg-blue-50 rounded-xl transition no-underline text-slate-900 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center">
                    {item.tip === "sektor" ? (
                      <span className="text-sm">📁</span>
                    ) : item.logo_url ? (
                      <Image
                        src={item.logo_url}
                        width={16}
                        height={16}
                        className="object-contain"
                        alt={item.marka_adi || "Marka"}
                      />
                    ) : (
                      <span className="text-[11px] font-black">
                        {item.marka_adi?.charAt(0)}
                      </span>
                    )}
                  </div>

                  <span className="font-semibold text-sm group-hover:text-blue-600 transition-colors">
                    {item.tip === "sektor"
                      ? item.sektor_adi
                      : item.marka_adi}

                    {item.tip === "marka" && " İndirimleri"}
                  </span>
                </div>

                <span
                  className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${
                    item.tip === "sektor"
                      ? "bg-orange-100 text-orange-600"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {item.tip === "sektor" ? "Kategori" : "Marka"}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Popüler Aramalar */}
      <div className="flex flex-wrap justify-center items-center gap-2 mt-4">
        <span className="text-[11px] text-slate-400 font-medium">
          Popüler:
        </span>

        {populerAramalar.map((arama) => (
          <button
            key={arama}
            type="button"
            onClick={() => onHizliArama(arama)}
            className="text-[11px] bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-600
                       text-slate-500 px-3 py-1 rounded-full transition-all font-medium"
          >
            {arama}
          </button>
        ))}
      </div>

      {/* Filtreler */}
      <div className="flex flex-wrap justify-center gap-3 mt-6">
        <select
          value={seciliSektor}
          onChange={(e) => onSektorChange(e.target.value)}
          aria-label="Sektör seçin"
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700
                     outline-none focus:ring-2 focus:ring-blue-500/20 min-w-[160px]"
        >
          <option value="">Tüm Sektörler</option>

          {sektorler.map((sektor) => (
            <option key={sektor.id} value={sektor.id}>
              {sektor.sektor_adi} ({sektor.firsatSayisi || 0})
            </option>
          ))}
        </select>

        <select
          value={seciliTur}
          onChange={(e) => onTurChange(e.target.value)}
          aria-label="Kampanya türü seçin"
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700
                     outline-none focus:ring-2 focus:ring-blue-500/20 min-w-[160px]"
        >
          <option value="">Tüm Kampanya Türleri</option>

          {kampanyaTurleri.map((tur) => (
            <option key={tur.id} value={tur.id}>
              {tur.tur_adi || `Tür ${tur.id}`}
            </option>
          ))}
        </select>
      </div>
    </header>
  );
}