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
    <section className="relative pt-8 md:pt-12 pb-8 md:pb-10">
      {/* Arka plan */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 h-[380px]
                   bg-[radial-gradient(circle_at_top,#dbeafe_0%,#eff6ff_35%,transparent_72%)]"
      />

      <div className="max-w-4xl mx-auto px-4">
        {/* Üst etiket */}
        <div className="flex justify-center mb-5">
          <div className="inline-flex items-center gap-2 rounded-full
                          border border-blue-100 bg-white/80 backdrop-blur
                          px-3.5 py-2 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>

            <span className="text-xs font-semibold text-slate-600">
              Türkiye&apos;nin güncel kampanya rehberi
            </span>
          </div>
        </div>

        {/* Başlık */}
        <div className="text-center">
          <h1
            className="mx-auto max-w-3xl text-4xl font-black tracking-[-0.04em]
                       text-slate-950 sm:text-5xl md:text-6xl lg:text-7xl
                       leading-[1.03]"
            style={{ fontFamily: "Outfit" }}
          >
            Ödemeden önce
            <br />

            <span className="text-blue-600">
              bi&apos;koduna bak.
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-6
                        text-slate-500 sm:text-base md:text-lg">
            Markanı ara, güncel kampanyaları ve indirim kodlarını tek yerde bul.
            Daha fazla ödeme yapmadan önce 30 saniye kontrol et.
          </p>
        </div>

        {/* Arama */}
        <div className="relative mx-auto mt-8 max-w-2xl md:mt-10">
          <div className="relative rounded-[22px] bg-white p-1.5
                          shadow-[0_18px_60px_rgba(15,23,42,0.12)]
                          ring-1 ring-slate-200/80">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>

            <input
              type="text"
              value={aramaTerimi}
              onChange={(e) => onArama(e.target.value)}
              placeholder="Hangi marka veya kampanyayı arıyorsun?"
              className="h-[58px] w-full rounded-[17px] bg-white
                         pl-12 pr-5 text-[15px] font-medium text-slate-900
                         outline-none placeholder:text-slate-400
                         sm:h-[64px] sm:text-base"
            />
          </div>

          {/* Arama sonuçları */}
          {aramaSonuclari.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-50 mt-3
                            overflow-hidden rounded-2xl border border-slate-200
                            bg-white p-2 shadow-2xl">
              {aramaSonuclari.map((item: any, index: number) => (
                <Link
                  key={index}
                  href={
                    item.tip === "sektor"
                      ? `/sektor/${item.slug}`
                      : `/marka/${item.slug}`
                  }
                  className="group flex items-center justify-between
                             rounded-xl p-3.5 text-slate-900 no-underline
                             transition hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center
                                    rounded-xl border border-slate-200 bg-white">
                      {item.tip === "sektor" ? (
                        <span className="text-sm">#</span>
                      ) : item.logo_url ? (
                        <Image
                          src={item.logo_url}
                          width={20}
                          height={20}
                          className="object-contain"
                          alt={item.marka_adi || "Marka"}
                        />
                      ) : (
                        <span className="text-xs font-black">
                          {item.marka_adi?.charAt(0)}
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="text-sm font-bold group-hover:text-blue-600">
                        {item.tip === "sektor"
                          ? item.sektor_adi
                          : item.marka_adi}
                      </div>

                      <div className="mt-0.5 text-[11px] text-slate-400">
                        {item.tip === "sektor"
                          ? "Kategori kampanyalarını görüntüle"
                          : "Markanın kampanyalarını görüntüle"}
                      </div>
                    </div>
                  </div>

                  <span className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-500">
                    →
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Popüler aramalar */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <span className="mr-1 text-[11px] font-semibold text-slate-400">
            Çok arananlar
          </span>

          {populerAramalar.slice(0, 5).map((arama) => (
            <button
              key={arama}
              type="button"
              onClick={() => onHizliArama(arama)}
              className="rounded-full border border-slate-200 bg-white
                         px-3 py-1.5 text-[11px] font-semibold text-slate-600
                         shadow-sm transition
                         hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
            >
              {arama}
            </button>
          ))}
        </div>
        {/* Kampanya filtreleri */}
<div className="mx-auto mt-7 max-w-2xl">
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
    <div className="mb-4 flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-extrabold text-slate-900">
          Kampanyaları filtrele
        </p>

        <p className="mt-0.5 text-[11px] text-slate-400">
          Seçimler otomatik olarak uygulanır
        </p>
      </div>

      {(seciliSektor || seciliTur) && (
        <button
          type="button"
          onClick={() => {
            onSektorChange("");
            onTurChange("");
          }}
          className="shrink-0 rounded-lg bg-blue-50 px-3 py-2 text-[11px] font-bold text-blue-600 transition hover:bg-blue-100"
        >
          Temizle
        </button>
      )}
    </div>

    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {/* Kategori filtresi */}
      <div>
        <label
          htmlFor="sektor-filtresi"
          className="mb-1.5 block text-[11px] font-bold text-slate-500"
        >
          Kategori
        </label>

        <div className="relative">
          <select
            id="sektor-filtresi"
            value={seciliSektor}
            onChange={(e) => onSektorChange(e.target.value)}
            className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
          >
            <option value="">Tüm kategoriler</option>

            {sektorler.map((sektor) => (
              <option key={sektor.id} value={String(sektor.id)}>
                {sektor.sektor_adi}
              </option>
            ))}
          </select>

          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">
            ▼
          </span>
        </div>
      </div>

            {/* Kampanya türü filtresi */}
              <div>
              <label
                htmlFor="tur-filtresi"
                className="mb-1.5 block text-[11px] font-bold text-slate-500"
              >
                Kampanya türü
              </label>

              <div className="relative">
                <select
                  id="tur-filtresi"
                  value={seciliTur}
                  onChange={(e) => onTurChange(e.target.value)}
                  className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                >
                  <option value="">Tüm kampanya türleri</option>

                  {kampanyaTurleri.map((tur) => (
                    <option key={tur.id} value={String(tur.id)}>
                      {tur.tur_adi}
                    </option>
                  ))}
                </select>

                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                  ▼
                </span>
              </div>
            </div>
          </div>

          {(seciliSektor || seciliTur) && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              <span className="text-[11px] font-semibold text-emerald-700">
                Filtre aktif — uygun kampanyalar aşağıda listeleniyor
              </span>
            </div>
          )}
        </div>
      </div>
        {/* İstatistikler */}
        <div className="mx-auto mt-8 grid max-w-2xl grid-cols-3
                        divide-x divide-slate-200 rounded-2xl
                        border border-slate-200 bg-white/70
                        px-2 py-4 backdrop-blur sm:py-5">
          <div className="text-center">
            <div className="text-lg font-black text-slate-900 sm:text-xl">
              {stats.aktif.toLocaleString("tr-TR")}
            </div>
            <div className="mt-1 text-[10px] font-medium text-slate-400 sm:text-xs">
              Aktif kampanya
            </div>
          </div>

          <div className="text-center">
            <div className="text-lg font-black text-slate-900 sm:text-xl">
              {stats.marka}+
            </div>
            <div className="mt-1 text-[10px] font-medium text-slate-400 sm:text-xs">
              Marka
            </div>
          </div>

          <div className="text-center">
            <div className="text-lg font-black text-slate-900 sm:text-xl">
              {stats.toplam.toLocaleString("tr-TR")}
            </div>
            <div className="mt-1 text-[10px] font-medium text-slate-400 sm:text-xs">
              Toplam fırsat
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}