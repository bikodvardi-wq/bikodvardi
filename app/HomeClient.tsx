"use client";

/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import CampaignCard from "@/components/CampaignCard";
import ReklamAlani from "@/components/ReklamAlani";
import HeroSection from "@/components/home/HeroSection";

interface HomeClientProps {
  sektorler: any[];
  kampanyaTurleri: any[];
  populerMarkalar: any[];
  enYeniKampanyalar: any[];
  ucretsizKampanyalar: any[];
  tumAktifKampanyalar: any[];
  sonSansKampanyalar: any[];
  tumMarkalar: any[];
  stats: { aktif: number; toplam: number; marka: number };
  reklamAlt: any[] | null;   // ← burayı değiştirdik
  reklamUst: any[] | null;   // ← bunu ekle
}
export default function HomeClient({
  sektorler,
  kampanyaTurleri,
  populerMarkalar,
  enYeniKampanyalar,
  ucretsizKampanyalar,
  tumAktifKampanyalar,
  sonSansKampanyalar,
  tumMarkalar,
  stats,
  reklamAlt,
  reklamUst,          // ← bunu ekle
}: HomeClientProps) {
  const [aramaTerimi, setAramaTerimi] = useState("");
  const [aramaSonuclari, setAramaSonuclari] = useState<any[]>([]);

  const [seciliSektor, setSeciliSektor] = useState<string>("");
  const [seciliTur, setSeciliTur] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sabit Popüler Aramalar
  const populerAramalar = ["Trendyol", "Spor", "Kozmetik", "Ayakkabı"];

  const aramaYap = (terim: string) => {
  setAramaTerimi(terim);

  const temizTerim = terim.trim();

  if (temizTerim.length < 2) {
    setAramaSonuclari([]);
    return;
  }

  const kucukTerim = temizTerim.toLocaleLowerCase("tr-TR");

  // Kampanya sonuçları
  const kampanyaSonuclari = tumAktifKampanyalar
    .filter((kampanya) => {
      const baslik = String(
        kampanya.baslik || ""
      ).toLocaleLowerCase("tr-TR");

      const markaAdi = String(
        kampanya.yapan_marka_bilgisi?.marka_adi || ""
      ).toLocaleLowerCase("tr-TR");

      return (
        baslik.includes(kucukTerim) ||
        markaAdi.includes(kucukTerim)
      );
    })
    .slice(0, 5)
    .map((kampanya) => ({
      ...kampanya,
      tip: "kampanya",
    }));

  // Marka sonuçları
  const markaSonuclari = tumMarkalar
    .filter((marka) =>
      String(marka.marka_adi || "")
        .toLocaleLowerCase("tr-TR")
        .includes(kucukTerim)
    )
    .slice(0, 3)
    .map((marka) => ({
      ...marka,
      tip: "marka",
    }));

  // Kategori sonuçları
  const sektorSonuclari = sektorler
    .filter((sektor) =>
      String(sektor.sektor_adi || "")
        .toLocaleLowerCase("tr-TR")
        .includes(kucukTerim)
    )
    .slice(0, 2)
    .map((sektor) => ({
      ...sektor,
      tip: "sektor",
    }));

  setAramaSonuclari([
    ...kampanyaSonuclari,
    ...markaSonuclari,
    ...sektorSonuclari,
  ]);
};

  const hizliArama = (terim: string) => {
    aramaYap(terim);
  };
  useEffect(() => {
  setCurrentPage(1);
}, [seciliSektor, seciliTur]);

  // Google'ın "Site içinde ara" (SearchAction) özelliğinden gelen ?ara= parametresini yakala
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('ara');
    if (q) aramaYap(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Seçilen kategoriye bağlı markaları bul
const seciliSektorMarkaIdleri = useMemo(() => {
  if (!seciliSektor) return new Set<string>();

  return new Set(
    tumMarkalar
      .filter((marka) => {
        const anaSektorUyuyor =
          String(marka.sektor_id) === String(seciliSektor);

        const ekSektorUyuyor =
          Array.isArray(marka.ek_sektor_idler) &&
          marka.ek_sektor_idler.some(
            (sektorId: number | string) =>
              String(sektorId) === String(seciliSektor)
          );

        return anaSektorUyuyor || ekSektorUyuyor;
      })
      .map((marka) => String(marka.id))
  );
}, [seciliSektor, tumMarkalar]);

const filtrelenmisKampanyalar = useMemo(
  () =>
    tumAktifKampanyalar.filter((kampanya) => {
      // Kategori seçilmediyse bütün kategorileri kabul et
      const kategoriUyuyor =
        !seciliSektor ||
        String(kampanya.gecerli_sektor_id) === String(seciliSektor) ||
        Boolean(
          kampanya.fayd_marka &&
            seciliSektorMarkaIdleri.has(String(kampanya.fayd_marka))
        );

      // Kampanya türü seçilmediyse bütün türleri kabul et
      const turUyuyor =
        !seciliTur ||
        String(kampanya.kampanya_turu) === String(seciliTur);

      return kategoriUyuyor && turUyuyor;
    }),
  [
    seciliSektor,
    seciliTur,
    seciliSektorMarkaIdleri,
    tumAktifKampanyalar,
  ]
);

const filtreAktif = Boolean(seciliSektor || seciliTur);

  const filtreTemizle = () => {
    setSeciliSektor("");
    setSeciliTur("");
  };

  const optimizeUnsplash = (url: string) => {
  if (!url || !url.includes('images.unsplash.com')) return url;
  try {
    const u = new URL(url);
    u.searchParams.set('w', '600');
    u.searchParams.set('q', '75');
    u.searchParams.set('auto', 'format');
    return u.toString();
  } catch {
    return url;
  }
};

  // --- Bülten Aboneliği ---
  const [aboneEmail, setAboneEmail] = useState("");
  const [aboneDurum, setAboneDurum] = useState<'bos' | 'gonderiliyor' | 'basarili' | 'hata'>('bos');
  const [aboneHataMesaji, setAboneHataMesaji] = useState('');

  const aboneOl = async (e: React.FormEvent) => {
    e.preventDefault();

    const gecerliEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(aboneEmail);
    if (!gecerliEmail) {
      setAboneDurum('hata');
      setAboneHataMesaji('Lütfen geçerli bir e-posta adresi gir.');
      return;
    }

    setAboneDurum('gonderiliyor');

    try {
      const response = await fetch('/api/abone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: aboneEmail }),
      });

      const sonuc = await response.json().catch(() => null);

      if (!response.ok) {
        setAboneDurum('hata');
        setAboneHataMesaji(
          sonuc?.message ||
            'Bir şeyler ters gitti, birazdan tekrar dener misin?'
        );
        return;
      }

      setAboneDurum('basarili');
      setAboneEmail('');
    } catch {
      setAboneDurum('hata');
      setAboneHataMesaji(
        'Bağlantı kurulamadı, birazdan tekrar dener misin?'
      );
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] font-['Plus_Jakarta_Sans'] text-slate-900 text-left">
      <nav className="sticky top-0 z-[60] bg-white/80 backdrop-blur-md border-b border-slate-200 py-4 px-4 md:px-8 flex justify-between items-center">
        <Link href="/" className="no-underline">
          <div className="text-2xl font-[900] tracking-tighter text-slate-900" style={{ fontFamily: 'Outfit' }}>
            bi<span className="text-blue-600">kod</span>vardı
          </div>
        </Link>
        <div className="flex items-center gap-2 md:gap-3">
          {/* Mobil uygulama */}
          <Link
            href="/app"
            aria-label="BiKodVardı mobil uygulamasını indir"
            className="flex h-10 items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 text-blue-600 no-underline transition hover:border-blue-200 hover:bg-blue-100 md:px-4"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="6" y="2" width="12" height="20" rx="2" />
              <path d="M10 18h4" />
            </svg>

            <span className="hidden text-xs font-bold sm:inline">
              Uygulamayı İndir
            </span>
          </Link>

          {/* WhatsApp */}
          <a
            href="https://whatsapp.com/channel/0029VbCMRE8EFeXm1h0Lw92F"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="BiKodVardı WhatsApp kanalını takip et"
            className="hidden items-center gap-2 rounded-full border border-green-100 bg-green-50 px-4 py-2 text-sm font-bold text-green-600 no-underline transition hover:bg-green-100 md:flex"
          >
            WhatsApp
          </a>

          {/* Telegram */}
          <a
            href="https://t.me/bikodvardi"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Telegram'da BiKodVardı"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-blue-600 no-underline transition hover:bg-blue-100"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </a>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <HeroSection
          stats={stats}
          aramaTerimi={aramaTerimi}
          aramaSonuclari={aramaSonuclari}
          populerAramalar={populerAramalar}
          sektorler={sektorler}
          kampanyaTurleri={kampanyaTurleri}
          seciliSektor={seciliSektor}
          seciliTur={seciliTur}
          onArama={aramaYap}
          onHizliArama={hizliArama}
          onSektorChange={setSeciliSektor}
          onTurChange={setSeciliTur}
        />


        {/* Son Şans Kampanyaları */}
        {!filtreAktif && sonSansKampanyalar.length > 0 && (
          <section className="mb-14">
            <div className="flex items-center justify-between mb-6 px-2">
              <div className="flex items-center gap-2">
                <span className="text-xl"></span>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter" style={{ fontFamily: 'Outfit' }}>
                  Son Şans (Bitmek Üzere)
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {sonSansKampanyalar.slice(0, 4).map((k) => (
                <CampaignCard
                  key={k.id}
                  kampanya={k}
                  variant="son-sans"
                  turAdi={kampanyaTurleri.find(t => t.id === k.kampanya_turu)?.tur_adi}
                />
              ))}
            </div>
          </section>
        )}

        {/* FİLTRELENMİŞ SONUÇLAR */}
        {filtreAktif && (
          <section className="mb-14">
            <div className="flex items-center justify-between mb-6 px-1">
              <h3
                className="text-xl font-black text-slate-900 tracking-tight"
                style={{ fontFamily: "Outfit" }}
              >
                Filtrelenmiş Fırsatlar
                <span className="ml-2 text-base font-semibold text-slate-500">
                  ({filtrelenmisKampanyalar.length})
                </span>
              </h3>
              <button
                onClick={filtreTemizle}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Filtreyi Temizle
              </button>
            </div>

            {filtrelenmisKampanyalar.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                <p className="text-lg font-semibold text-slate-800 mb-1">
                  Seçtiğin kriterlere uyan fırsat bulamadık
                </p>
                <p className="text-sm text-slate-500">
                  Filtreleri değiştirerek tekrar dene.
                </p>
              </div>
            ) : (
              <>
                {/* Kartlar */}
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5">
                  {filtrelenmisKampanyalar
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((k) => (
                      <CampaignCard
                        key={k.id}
                        kampanya={k}
                        variant="default"
                        turAdi={kampanyaTurleri.find((t) => t.id === k.kampanya_turu)?.tur_adi}
                      />
                    ))}
                </div>

                {/* Sayfalama */}
                {filtrelenmisKampanyalar.length > itemsPerPage && (
                  <div className="flex flex-wrap items-center justify-center gap-2 mt-10">
                    {/* Önceki */}
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-sm font-medium rounded-xl border border-slate-200
                                bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40
                                disabled:cursor-not-allowed transition-colors"
                    >
                      ← Önceki
                    </button>

                    {/* Sayfa Numaraları */}
                    {Array.from(
                      { length: Math.ceil(filtrelenmisKampanyalar.length / itemsPerPage) },
                      (_, i) => i + 1
                    ).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 text-sm font-semibold rounded-xl transition-colors ${
                          currentPage === page
                            ? "bg-blue-600 text-white"
                            : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    {/* Sonraki */}
                    <button
                      onClick={() =>
                        setCurrentPage((p) =>
                          Math.min(Math.ceil(filtrelenmisKampanyalar.length / itemsPerPage), p + 1)
                        )
                      }
                      disabled={
                        currentPage === Math.ceil(filtrelenmisKampanyalar.length / itemsPerPage)
                      }
                      className="px-4 py-2 text-sm font-medium rounded-xl border border-slate-200
                                bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40
                                disabled:cursor-not-allowed transition-colors"
                    >
                      Sonraki →
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {/* FLAŞ ÜCRETSİZ FIRSATLAR */}
        {ucretsizKampanyalar.length > 0 && !filtreAktif && (
          <section className="mb-14">
            <div className="flex items-center gap-3 mb-6 px-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter" style={{ fontFamily: 'Outfit' }}>
                Flaş Ücretsiz Fırsatlar
              </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
              {ucretsizKampanyalar.slice(0, 4).map((k) => (
                <CampaignCard
                  key={k.id}
                  kampanya={k}
                  variant="ucretsiz"
                  turAdi={kampanyaTurleri.find(t => t.id === k.kampanya_turu)?.tur_adi}
                />
              ))}
            </div>
          </section>
        )}

        {/* YENİ KEŞFEDİLEN FIRSATLAR */}
        {!filtreAktif && (
        <section className="mb-14">
          <div className="flex items-center justify-between mb-6 px-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
              Yeni Keşfedilen Fırsatlar
            </h3>
            <div className="h-[1px] flex-1 bg-slate-200 mx-6 hidden md:block"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5">
            {enYeniKampanyalar.slice(0, 4).map((k) => (
              <CampaignCard
                key={k.id}
                kampanya={k}
                variant="default"
                turAdi={kampanyaTurleri.find(t => t.id === k.kampanya_turu)?.tur_adi}
              />
            ))}
          </div>
          </section>
        )}

        {/* POPÜLER MARKALAR */}
        <div className="max-w-7xl mx-auto mb-16">
          <div className="flex items-center justify-between mb-6 px-2 text-center md:text-left">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 w-full md:w-auto">En Çok Kampanya Yapanlar</h3>
            <div className="h-[1px] flex-1 bg-slate-200 ml-6 hidden md:block"></div>
          </div>
          <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-3">
            {populerMarkalar.map((marka) => (
              <Link key={marka.id} href={`/marka/${marka.slug}`} className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-2xl hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/5 transition-all no-underline group">
                <div className="w-6 h-6 bg-slate-50 rounded-lg flex items-center justify-center text-[11px] font-black group-hover:bg-blue-600 group-hover:text-white transition-colors uppercase">
                  {marka.marka_adi[0]}
                </div>
                <span className="text-[12px] font-bold text-slate-700">{marka.marka_adi}</span>
                <div className="w-5 h-5 bg-blue-50 rounded-full flex items-center justify-center">
                  <span className="text-[9px] font-black text-blue-600">{marka.firsatSayisi}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

      {/* ORTA REKLAM ALANI — YATAY */}
      {(reklamUst && reklamUst.length > 0) && (
        <div className="mt-12 md:mt-16">
          <ReklamAlani
            reklamlar={reklamUst}
            maxCount={2}
            variant="banner"
          />
        </div>
      )}

        {/* POPÜLER KATEGORİLER */}
        <section className="mt-16 md:mt-20">
          <div className="mb-8">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-2">
              Popüler Kategoriler
            </p>
            <h2
              className="text-2xl md:text-3xl font-extrabold text-slate-900"
              style={{ fontFamily: "Outfit" }}
            >
              Kategori seçerek başla
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
            {sektorler.map((s) => (
              <Link
                key={s.id}
                href={`/sektor/${s.slug}`}
                className="group relative bg-white rounded-2xl border border-slate-200 overflow-hidden
                          hover:border-blue-300 hover:shadow-lg transition-all duration-300 no-underline"
              >
               {/* Görsel Alanı */}
                <div className="h-28 md:h-36 relative overflow-hidden">
                  {s.gorsel_url ? (
                    <img
                      src={optimizeUnsplash(s.gorsel_url)}
                      alt={`${s.sektor_adi} indirim kodları ve kampanyaları`}
                      width={600}
                      height={360}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                      <span className="text-white text-3xl font-black opacity-30">
                        {s.sektor_adi.charAt(0)}
                      </span>
                    </div>
                  )}

                  {/* Hafif karartma */}
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                </div>

                {/* Bilgi */}
                <div className="p-3.5 md:p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-slate-900 text-sm md:text-[15px] group-hover:text-blue-600 transition-colors line-clamp-1">
                      {s.sektor_adi}
                    </h3>
                    <span className="shrink-0 text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md">
                      {s.firsatSayisi || 0}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>



      {/* ALT REKLAM ALANI — KARE */}
      {(reklamAlt && reklamAlt.length > 0) && (
        <div className="mt-12 md:mt-16 mb-4">
          <ReklamAlani
            reklamlar={reklamAlt}
            maxCount={2}
            variant="square"
          />
        </div>
)}

        {/* ÖZEL KULÜP / NEWSLETTER */}
        <section className="mt-16 md:mt-24">
          <div className="relative bg-slate-900 rounded-3xl overflow-hidden">
            {/* Arka plan efekti */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-transparent"></div>
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"></div>

            <div className="relative z-10 px-6 py-12 md:px-12 md:py-16 text-center">
              <span className="inline-block bg-blue-500/20 text-blue-300 text-[11px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider mb-5">
                Özel Kulüp
              </span>

              <h2
                className="text-2xl md:text-4xl font-extrabold text-white mb-3 leading-tight"
                style={{ fontFamily: "Outfit" }}
              >
                En iyi kodlar mailine gelsin
              </h2>

              <p className="text-slate-400 text-sm md:text-base max-w-md mx-auto mb-8">
                Spam yok. Sadece haftanın gerçekten işe yarayan, en yüksek indirimli 5 kodu.
              </p>

              {aboneDurum === "basarili" ? (
                <div className="bg-white/10 border border-white/20 rounded-2xl px-6 py-5 max-w-md mx-auto">
                  <p className="font-bold text-white text-lg">Kulübe hoş geldin! 🎉</p>
                  <p className="text-slate-300 text-sm mt-1">
                    En iyi kodlar artık sana da gelecek.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={aboneOl}
                  className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto"
                >
                  <input
                    type="email"
                    required
                    placeholder="E-posta adresin..."
                    value={aboneEmail}
                    onChange={(e) => {
                      setAboneEmail(e.target.value);
                      if (aboneDurum === "hata") setAboneDurum("bos");
                    }}
                    className="flex-1 px-5 py-3.5 rounded-xl bg-white text-slate-900 text-sm font-medium
                              outline-none focus:ring-4 focus:ring-blue-500/30 placeholder:text-slate-400"
                  />
                  <button
                    type="submit"
                    disabled={aboneDurum === "gonderiliyor"}
                    className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold
                              rounded-xl transition-colors disabled:opacity-60 whitespace-nowrap"
                  >
                    {aboneDurum === "gonderiliyor" ? "Gönderiliyor..." : "Katıl 🚀"}
                  </button>
                </form>
              )}

              {aboneDurum === "hata" && (
                <p className="mt-4 text-sm text-red-300 bg-red-500/10 border border-red-500/20
                              rounded-xl px-4 py-2.5 inline-block">
                  {aboneHataMesaji}
                </p>
              )}
            </div>
          </div>
        </section>
      </div>

      <footer className="mt-24 bg-white border-t border-slate-200 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-6 text-left">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
            <div className="space-y-4">
              <h4 className="text-slate-900 font-black uppercase text-xs tracking-widest" style={{ fontFamily: 'Outfit' }}>
                bi<span className="text-blue-600">kod</span>vardı
              </h4>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                Türkiye'nin en güncel <strong>indirim kodu</strong> ve <strong>kampanya</strong> platformu.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="text-slate-900 font-black uppercase text-xs tracking-widest" style={{ fontFamily: 'Outfit' }}>Keşfet</h4>
              <nav className="flex flex-col gap-2">
                <Link href="/app" className="text-slate-500 hover:text-blue-600 text-sm font-medium no-underline transition-colors">
                  Mobil Uygulama
                </Link>

                <Link href="/blog" className="text-slate-500 hover:text-blue-600 text-sm font-medium no-underline transition-colors">
                  Blog
                </Link>

                <Link href="/hakkimizda" className="text-slate-500 hover:text-blue-600 text-sm font-medium no-underline transition-colors">
                  Hakkımızda
                </Link>

                <Link href="/iletisim" className="text-slate-500 hover:text-blue-600 text-sm font-medium no-underline transition-colors">
                  İletişim
                </Link>

                <Link href="/gizlilik-politikasi" className="text-slate-500 hover:text-blue-600 text-sm font-medium no-underline transition-colors">
                  Gizlilik Politikası
                </Link>
              </nav>
            </div>
            <div className="space-y-4 md:text-right">
              <h4 className="text-slate-900 font-black uppercase text-xs tracking-widest" style={{ fontFamily: 'Outfit' }}>İletişim</h4>
              <a href="mailto:iletisim@bikodvardi.com" className="text-blue-600 font-bold no-underline block">iletisim@bikodvardi.com</a>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black pt-2">© 2026 BİKODVARDI — TÜM HAKLARI SAKLIDIR.</p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
