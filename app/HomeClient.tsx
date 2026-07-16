"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
}: HomeClientProps) {
  const [aramaTerimi, setAramaTerimi] = useState("");
  const [aramaSonuclari, setAramaSonuclari] = useState<any[]>([]);

  const [seciliSektor, setSeciliSektor] = useState<string>("");
  const [seciliTur, setSeciliTur] = useState<string>("");

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
          <a href="https://t.me/bikodvardi" target="_blank" className="w-10 h-10 flex items-center justify-center bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition border border-blue-100 no-underline">🚀</a>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <header className="text-center pt-10 md:pt-16 pb-12 max-w-4xl mx-auto">
          <div className="flex flex-wrap justify-center gap-3 mb-8">
             <div className="inline-flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-full shadow-sm">
                <span className="text-orange-500 text-xs">📦</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{stats.toplam} TOPLAM KOD</span>
             </div>
             <div className="inline-flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-full shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{stats.aktif} AKTİF KAMPANYA</span>
             </div>
             <div className="hidden md:inline-flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-full shadow-sm">
                <span className="text-blue-500 font-black text-xs">●</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{stats.marka}+ MARKA</span>
             </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-[900] tracking-tight text-slate-900 mb-8" style={{ fontFamily: 'Outfit', lineHeight: 1.1 }}>
            İndirim kodu arama, <br/>
            <span className="text-blue-600 italic font-light">bi'kod bul.</span>
          </h1>

          <div className="w-full max-w-4xl mx-auto">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Marka, kategori veya fırsat ara..."
                value={aramaTerimi}
                onChange={(e) => aramaYap(e.target.value)}
                className="w-full bg-white border border-slate-200 p-6 rounded-3xl outline-none text-lg shadow-xl focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
              />

              {aramaSonuclari.length > 0 && (
                <div className="absolute top-full mt-3 left-0 right-0 bg-white border border-slate-200 rounded-3xl shadow-2xl p-4 z-[70] overflow-hidden text-left flex flex-col gap-1">
                  {aramaSonuclari.map((item: any, index: number) => (
                    <Link key={index} href={item.tip === 'sektor' ? `/sektor/${item.slug}` : `/marka/${item.slug}`} className="flex items-center justify-between p-4 hover:bg-blue-50 rounded-2xl transition no-underline text-slate-900 font-bold group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                          {item.tip === 'sektor' ? <span className="text-sm">📁</span> : item.logo_url ? <Image src={item.logo_url} width={16} height={16} className="max-w-[16px] max-h-[16px] object-contain" alt="" /> : <span className="text-[10px] font-black">{item.marka_adi.charAt(0)}</span>}
                        </div>
                        <span className="group-hover:text-blue-600 transition-colors">{item.tip === 'sektor' ? item.sektor_adi : item.marka_adi} {item.tip === 'marka' && "İndirimleri"}</span>
                      </div>
                      <span className={`text-[9px] px-2.5 py-1 rounded-md uppercase tracking-widest font-black ${item.tip === 'sektor' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                        {item.tip === 'sektor' ? 'Kategori' : 'Marka'}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-wrap justify-center items-center gap-2 mt-4">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Popüler:</span>
              {populerAramalar.map(p => (
                <button
                  key={p}
                  onClick={() => hizliArama(p)}
                  className="text-[10px] bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-600 text-slate-500 px-3 py-1.5 rounded-full transition-all font-bold uppercase tracking-widest shadow-sm"
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-4 mt-8 relative z-[50]">
              <select value={seciliSektor} onChange={(e) => setSeciliSektor(e.target.value)} className="px-6 py-3 bg-white border border-slate-300 rounded-2xl shadow-sm text-slate-700 min-w-[200px] outline-none">
                <option value="">Tüm Sektörler</option>
                {sektorler.map((s) => <option key={s.id} value={s.id}>{s.sektor_adi} ({s.firsatSayisi || 0})</option>)}
              </select>
              <select value={seciliTur} onChange={(e) => setSeciliTur(e.target.value)} className="px-6 py-3 bg-white border border-slate-300 rounded-2xl shadow-sm text-slate-700 min-w-[200px] outline-none">
                <option value="">Tüm Kampanya Türleri</option>
                {kampanyaTurleri.map((t) => <option key={t.id} value={t.id}>{t.tur_adi || `Tür ${t.id}`}</option>)}
              </select>
            </div>
          </div>
        </header>

        {/* Son Şans Kampanyaları (Süresi Dolmak Üzere Olanlar) */}
        {!filtreAktif && sonSansKampanyalar.length > 0 && (
          <section className="mb-14">
            <div className="flex items-center justify-between mb-6 px-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">⏳</span>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter" style={{ fontFamily: 'Outfit' }}>Son Şans (Bitmek Üzere)</h3>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {sonSansKampanyalar.map(k => (
                <Link key={k.id} href={`/kampanya/${k.slug}`} className="bg-orange-50/50 border border-orange-200 p-5 rounded-3xl hover:bg-orange-50 hover:border-orange-300 transition-all no-underline group flex flex-col justify-between">
                  <div>
                    <span className="inline-block bg-orange-100 text-orange-600 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md mb-3">SÜRE BİTİYOR</span>
                    <h4 className="text-slate-900 font-bold text-sm leading-tight mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">{k.baslik}</h4>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">{k.yapan_marka_bilgisi?.marka_adi}</span>
                    <span className="text-[10px] bg-white border border-orange-100 text-orange-500 px-2 py-1 rounded-lg font-black uppercase tracking-widest">
                      {Math.ceil((new Date(k.bitis_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24))} Gün Kaldı
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* FİLTRELENMİŞ SONUÇLAR */}
        {filtreAktif && (
          <section className="mb-14">
            <div className="flex items-center justify-between mb-6 px-2">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter" style={{ fontFamily: 'Outfit' }}>
                Filtrelenmiş Fırsatlar ({filtrelenmisKampanyalar.length})
              </h3>
              <button onClick={filtreTemizle} className="text-blue-600 hover:underline text-sm font-medium">
                Filtreyi Temizle
              </button>
            </div>
            {filtrelenmisKampanyalar.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl shadow border border-slate-200 p-8">
                <p className="text-lg font-medium mb-2">Seçtiğin kriterlere uyan fırsat bulamadık 😔</p>
                <p className="text-sm">Filtreleri değiştir, arama yap veya kategorilere göz at!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filtrelenmisKampanyalar.slice(0, 20).map((k) => (
                  <Link key={k.id} href={`/kampanya/${k.slug}`} className="group bg-white rounded-[2.5rem] p-6 border border-slate-200 overflow-hidden hover:shadow-2xl hover:border-blue-300 transition-all no-underline">
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-slate-50 p-2 rounded-xl">
                        {k.yapan_marka_bilgisi?.logo_url ? <Image src={k.yapan_marka_bilgisi.logo_url} width={32} height={32} className="h-8 w-auto object-contain" alt="" /> : <span className="text-slate-600 font-bold text-sm">{k.yapan_marka_bilgisi?.marka_adi?.charAt(0) || '?'}</span>}
                      </div>
                      <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
                        {kampanyaTurleri.find(t => t.id === k.kampanya_turu)?.tur_adi || 'Fırsat'}
                      </span>
                    </div>
                    <h4 className="text-slate-900 font-bold text-lg leading-tight mb-2 line-clamp-2">{k.baslik}</h4>
                    <p className="text-slate-500 text-sm mb-2">{k.yapan_marka_bilgisi?.marka_adi}</p>
                    {k.bitis_date && (
                      <p className="text-slate-400 text-xs">
                        Bitiş: {new Date(k.bitis_date).toLocaleDateString('tr-TR')}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        {/* FLAŞ ÜCRETSİZ FIRSATLAR */}
        {ucretsizKampanyalar.length > 0 && !filtreAktif && (
          <section className="mb-14 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="flex items-center gap-3 mb-6 px-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter" style={{ fontFamily: 'Outfit' }}>Flaş Ücretsiz Fırsatlar ⚡</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ucretsizKampanyalar.map((k) => (
                <Link key={k.id} href={`/kampanya/${k.slug}`} className="group relative bg-[#0D0F14] rounded-[2.5rem] p-8 border border-white/5 overflow-hidden hover:scale-[1.02] transition-all no-underline shadow-2xl shadow-blue-950/20 flex flex-col justify-between min-h-[220px]">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-600/20 blur-[40px] group-hover:bg-blue-600/40 transition-colors"></div>
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      <div className="bg-white p-2.5 rounded-2xl shadow-lg">
                        {k.yapan_marka_bilgisi?.logo_url ? <Image src={k.yapan_marka_bilgisi.logo_url} width={24} height={24} className="h-6 w-auto object-contain" alt="" /> : <span className="text-black font-black text-xs">{k.yapan_marka_bilgisi?.marka_adi?.charAt(0) || '?'}</span>}
                      </div>
                      <span className="bg-green-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest animate-bounce">BEDAVA</span>
                    </div>
                    <h4 className="text-white font-black text-xl leading-tight mb-3 group-hover:text-blue-400 transition-colors line-clamp-2" style={{ fontFamily: 'Outfit' }}>{k.baslik}</h4>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">0 TL Öde!</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* YENİ KEŞFEDİLEN FIRSATLAR */}
        <section className="mb-14">
          <div className="flex items-center justify-between mb-6 px-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Yeni Keşfedilen Fırsatlar</h3>
            <div className="h-[1px] flex-1 bg-slate-200 mx-6 hidden md:block"></div>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-6 no-scrollbar -mx-4 px-4">
            {enYeniKampanyalar.map((k) => (
              <Link key={k.id} href={`/kampanya/${k.slug}`} className="flex-shrink-0 w-[300px] md:w-[350px] bg-white p-8 rounded-[3rem] border border-slate-100 relative overflow-hidden group no-underline transition-all hover:shadow-2xl hover:-translate-y-2">
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <span className="bg-blue-600 text-[8px] font-black text-white px-3 py-1 rounded-full uppercase tracking-widest">YENİ</span>
                    <div className="relative w-10 h-10 bg-white rounded-2xl flex items-center justify-center p-2 border border-slate-100">
                      {k.yapan_marka_bilgisi?.logo_url ? <Image src={k.yapan_marka_bilgisi.logo_url} fill sizes="40px" alt="" className="object-contain p-2" /> : <span className="text-xs font-black text-slate-600">{k.yapan_marka_bilgisi?.marka_adi?.charAt(0) || '?'}</span>}
                    </div>
                  </div>
                  <h4 className="text-slate-900 font-black text-xl leading-tight mb-2 group-hover:text-blue-600 transition-colors h-14 overflow-hidden" style={{ fontFamily: 'Outfit' }}>{k.baslik}</h4>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{k.yapan_marka_bilgisi?.marka_adi}</p>
                </div>
              </Link>
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
        <section className="mt-16">
          <div className="flex items-end justify-between mb-10 text-left">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600 mb-2">Popüler Kategoriler</h3>
              <p className="text-3xl font-extrabold text-slate-900" style={{ fontFamily: 'Outfit' }}>Kategori seçerek başla.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sektorler.map((s) => (
              <Link href={`/sektor/${s.slug}`} key={s.id} className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-200 hover:border-blue-300 hover:shadow-2xl transition-all duration-500 no-underline" title={`${s.sektor_adi} İndirim Kodları`}>
                <div className="h-40 overflow-hidden relative">
                  <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url('${s.gorsel_url || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200"}')` }}></div>
                </div>
                <div className="p-6 text-left">
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition">{s.sektor_adi}</h4>
                    <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-3 py-1 rounded-lg uppercase">{s.firsatSayisi || 0} Kod</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* REKLAM ALANI */}
        <div className="w-full h-48 bg-white/50 border border-slate-200 border-dashed rounded-[3.5rem] mt-24 flex items-center justify-center text-slate-300 text-[10px] font-bold uppercase tracking-[0.5em]">
          SPONSORLU BAĞLANTI / REKLAM
        </div>

        {/* TOPLULUK / BÜLTEN KUTUSU */}
        <section className="mt-20 bg-blue-600 rounded-[3rem] p-10 md:p-16 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="bg-white/20 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest inline-block mb-6">ÖZEL KULÜBE KATIL</span>
            <h3 className="text-3xl md:text-5xl font-black mb-4" style={{ fontFamily: 'Outfit' }}>En İyi Kodlar Mailine Gelsin.</h3>
            <p className="text-blue-100 font-medium mb-8">Spam yok. Sadece haftanın gerçekten işe yarayan, en yüksek indirimli 5 kodu.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <input type="email" placeholder="E-posta adresin..." className="px-6 py-4 rounded-2xl text-slate-900 outline-none w-full sm:w-72 font-medium focus:ring-4 focus:ring-white/30" />
              <button className="bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-2xl font-bold transition-colors whitespace-nowrap shadow-lg">Bana Gönder 🚀</button>
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