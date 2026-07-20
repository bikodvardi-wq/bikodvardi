"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import CampaignCard from "@/components/CampaignCard";

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
  reklamAlt: { id: number; baslik: string; gorsel_url: string; link_url: string } | null;
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
}: HomeClientProps) {
  const [aramaTerimi, setAramaTerimi] = useState("");
  const [aramaSonuclari, setAramaSonuclari] = useState<any[]>([]);

  const [seciliSektor, setSeciliSektor] = useState<string>("");
  const [seciliTur, setSeciliTur] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Sabit Popüler Aramalar
  const populerAramalar = ["Trendyol", "Spor", "Kozmetik", "Ayakkabı", "Teknoloji"];

  const aramaYap = (terim: string) => {
    setAramaTerimi(terim);
    if (terim.length > 1) {
      const kucukTerim = terim.toLocaleLowerCase('tr-TR');

      const markaSonuclari = tumMarkalar
        .filter(m => m.marka_adi.toLocaleLowerCase('tr-TR').includes(kucukTerim))
        .map(m => ({ ...m, tip: 'marka' }))
        .slice(0, 5);

      const sektorSonuclari = sektorler
        .filter(s => s.sektor_adi.toLocaleLowerCase('tr-TR').includes(kucukTerim))
        .map(s => ({ ...s, tip: 'sektor' }))
        .slice(0, 3);

      setAramaSonuclari([...sektorSonuclari, ...markaSonuclari]);
    } else {
      setAramaSonuclari([]);
    }
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

  const filtrelenmisKampanyalar = tumAktifKampanyalar
    .filter(k => {
      let uyuyor = true;
      if (seciliSektor) {
        uyuyor = uyuyor && (
          String(k.gecerli_sektor_id) === seciliSektor ||
          String(k.yapan_marka_bilgisi?.sektor_id) === seciliSektor
        );
      }
      if (seciliTur) {
        uyuyor = uyuyor && String(k.kampanya_turu) === seciliTur;
      }
      return uyuyor;
    });

  const filtreAktif = seciliSektor || seciliTur;

  const filtreTemizle = () => {
    setSeciliSektor("");
    setSeciliTur("");
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

    const { error } = await supabase.from('abone').insert([{ email: aboneEmail }]);

    if (error) {
      if (error.code === '23505') {
        // unique constraint - zaten kayıtlı
        setAboneDurum('hata');
        setAboneHataMesaji('Bu e-posta zaten kayıtlı — teşekkürler, zaten kulübümüzdesin!');
      } else {
        setAboneDurum('hata');
        setAboneHataMesaji('Bir şeyler ters gitti, birazdan tekrar dener misin?');
      }
      return;
    }

    setAboneDurum('basarili');
    setAboneEmail('');
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] font-['Plus_Jakarta_Sans'] text-slate-900 text-left">
      <nav className="sticky top-0 z-[60] bg-white/80 backdrop-blur-md border-b border-slate-200 py-4 px-4 md:px-8 flex justify-between items-center">
        <Link href="/" className="no-underline">
          <div className="text-2xl font-[900] tracking-tighter text-slate-900" style={{ fontFamily: 'Outfit' }}>
            bi<span className="text-blue-600">kod</span>vardı
          </div>
        </Link>
        <div className="flex gap-3">
          <a href="https://wa.me/channel/LINKIN" target="_blank" className="hidden md:flex items-center gap-2 text-sm font-bold text-green-600 bg-green-50 px-4 py-2 rounded-full hover:bg-green-100 transition no-underline border border-green-100">WhatsApp</a>
          <a href="https://t.me/bikodvardi" target="_blank" className="w-10 h-10 flex items-center justify-center bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition border border-blue-100 no-underline">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </a>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <header className="pt-8 md:pt-14 pb-10 md:pb-14">
  {/* Stats */}
  <div className="flex flex-wrap justify-center gap-2.5 mb-8">
    <div className="inline-flex items-center gap-2 bg-white border border-slate-200 px-3.5 py-1.5 rounded-full shadow-sm">
      <span className="text-orange-500 text-xs">📦</span>
      <span className="text-[11px] font-bold text-slate-600">
        {stats.toplam.toLocaleString("tr-TR")} Toplam Kod
      </span>
    </div>
    <div className="inline-flex items-center gap-2 bg-white border border-slate-200 px-3.5 py-1.5 rounded-full shadow-sm">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
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
      <span className="text-blue-600">bi'kod bul.</span>
    </h1>
  </div>

  {/* Arama Kutusu */}
  <div className="w-full max-w-2xl mx-auto relative">
    <div className="relative">
      <input
        type="text"
        placeholder="Marka, kategori veya fırsat ara..."
        value={aramaTerimi}
        onChange={(e) => aramaYap(e.target.value)}
        className="w-full bg-white border border-slate-200 text-slate-900 text-base md:text-lg 
                   py-4 md:py-5 pl-5 pr-12 rounded-2xl shadow-lg shadow-slate-200/50
                   outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-400
                   transition-all font-medium placeholder:text-slate-400"
      />
      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>

    {/* Arama Sonuçları */}
    {aramaSonuclari.length > 0 && (
      <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 z-50 overflow-hidden">
        {aramaSonuclari.map((item: any, index: number) => (
          <Link
            key={index}
            href={item.tip === "sektor" ? `/sektor/${item.slug}` : `/marka/${item.slug}`}
            className="flex items-center justify-between p-3.5 hover:bg-blue-50 rounded-xl transition no-underline text-slate-900 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center">
                {item.tip === "sektor" ? (
                  <span className="text-sm">📁</span>
                ) : item.logo_url ? (
                  <Image src={item.logo_url} width={16} height={16} className="object-contain" alt="" />
                ) : (
                  <span className="text-[11px] font-black">{item.marka_adi?.charAt(0)}</span>
                )}
              </div>
              <span className="font-semibold text-sm group-hover:text-blue-600 transition-colors">
                {item.tip === "sektor" ? item.sektor_adi : item.marka_adi}
                {item.tip === "marka" && " İndirimleri"}
              </span>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${
                item.tip === "sektor" ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600"
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
    <span className="text-[11px] text-slate-400 font-medium">Popüler:</span>
    {populerAramalar.map((p) => (
      <button
        key={p}
        onClick={() => hizliArama(p)}
        className="text-[11px] bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-600 
                   text-slate-500 px-3 py-1 rounded-full transition-all font-medium"
      >
        {p}
      </button>
    ))}
  </div>

  {/* Filtreler */}
  <div className="flex flex-wrap justify-center gap-3 mt-6">
    <select
      value={seciliSektor}
      onChange={(e) => setSeciliSektor(e.target.value)}
      className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 
                 outline-none focus:ring-2 focus:ring-blue-500/20 min-w-[160px]"
    >
      <option value="">Tüm Sektörler</option>
      {sektorler.map((s) => (
        <option key={s.id} value={s.id}>
          {s.sektor_adi} ({s.firsatSayisi || 0})
        </option>
      ))}
    </select>

    <select
      value={seciliTur}
      onChange={(e) => setSeciliTur(e.target.value)}
      className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 
                 outline-none focus:ring-2 focus:ring-blue-500/20 min-w-[160px]"
    >
      <option value="">Tüm Kampanya Türleri</option>
      {kampanyaTurleri.map((t) => (
        <option key={t.id} value={t.id}>
          {t.tur_adi || `Tür ${t.id}`}
        </option>
      ))}
    </select>
  </div>
</header>
        

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
              {sonSansKampanyalar.map((k) => (
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

            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
              {ucretsizKampanyalar.map((k) => (
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
        <section className="mb-14">
          <div className="flex items-center justify-between mb-6 px-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
              Yeni Keşfedilen Fırsatlar
            </h3>
            <div className="h-[1px] flex-1 bg-slate-200 mx-6 hidden md:block"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5">
            {enYeniKampanyalar.map((k) => (
              <CampaignCard
                key={k.id}
                kampanya={k}
                variant="default"
                turAdi={kampanyaTurleri.find(t => t.id === k.kampanya_turu)?.tur_adi}
              />
            ))}
          </div>
        </section>

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
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                      style={{ backgroundImage: `url('${s.gorsel_url}')` }}
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

        {/* REKLAM ALANI */}
        {reklamAlt ? (
          <a
            href={reklamAlt.link_url}
            target="_blank"
            rel="sponsored noopener noreferrer"
            className="relative w-full aspect-[6/1] rounded-[3.5rem] mt-24 overflow-hidden block shadow-xl bg-slate-900"
          >
            <Image src={reklamAlt.gorsel_url} alt={reklamAlt.baslik} fill sizes="100vw" className="object-cover" />
          </a>
        ) : (
          <div className="w-full aspect-[6/1] bg-white/50 border border-slate-200 border-dashed rounded-[3.5rem] mt-24 flex items-center justify-center text-slate-300 text-[10px] font-bold uppercase tracking-[0.5em]">
            SPONSORLU BAĞLANTI / REKLAM
          </div>
        )}

        {/* TOPLULUK / BÜLTEN KUTUSU */}
        <section className="mt-20 bg-blue-600 rounded-[3rem] p-10 md:p-16 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="bg-white/20 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest inline-block mb-6">ÖZEL KULÜBE KATIL</span>
            <h3 className="text-3xl md:text-5xl font-black mb-4" style={{ fontFamily: 'Outfit' }}>En İyi Kodlar Mailine Gelsin.</h3>
            <p className="text-blue-100 font-medium mb-8">Spam yok. Sadece haftanın gerçekten işe yarayan, en yüksek indirimli 5 kodu.</p>

            {aboneDurum === 'basarili' ? (
              <div className="bg-white/15 border border-white/30 rounded-2xl px-6 py-5 max-w-md mx-auto">
                <p className="font-bold text-lg">Kulübe hoş geldin!</p>
                <p className="text-blue-100 text-sm mt-1">E-postanı onayladık, en iyi kodlar artık sana da gelecek.</p>
              </div>
            ) : (
              <form onSubmit={aboneOl} className="flex flex-col sm:flex-row gap-3 justify-center">
                <input
                  type="email"
                  required
                  placeholder="E-posta adresin..."
                  value={aboneEmail}
                  onChange={(e) => { setAboneEmail(e.target.value); if (aboneDurum === 'hata') setAboneDurum('bos'); }}
                  className="px-6 py-4 rounded-2xl text-slate-900 outline-none w-full sm:w-72 font-medium focus:ring-4 focus:ring-white/30"
                />
                <button
                  type="submit"
                  disabled={aboneDurum === 'gonderiliyor'}
                  className="bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-2xl font-bold transition-colors whitespace-nowrap shadow-lg disabled:opacity-60"
                >
                  {aboneDurum === 'gonderiliyor' ? 'Gönderiliyor...' : 'Bana Gönder'}
                </button>
              </form>
            )}

            {aboneDurum === 'hata' && (
              <p className="text-white bg-red-500/30 border border-red-300/40 rounded-xl px-4 py-2 text-sm font-medium mt-3 inline-block">
                {aboneHataMesaji}
              </p>
            )}
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
                <Link href="/blog" className="text-slate-500 hover:text-blue-600 text-sm font-medium no-underline transition-colors">Blog</Link>
                <Link href="/hakkimizda" className="text-slate-500 hover:text-blue-600 text-sm font-medium no-underline transition-colors">Hakkımızda</Link>
                <Link href="/iletisim" className="text-slate-500 hover:text-blue-600 text-sm font-medium no-underline transition-colors">İletişim</Link>
                <Link href="/gizlilik-politikasi" className="text-slate-500 hover:text-blue-600 text-sm font-medium no-underline transition-colors">Gizlilik Politikası</Link>
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