"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function Home() {
  const [sektorler, setSektorler] = useState<any[]>([]);
  const [populerMarkalar, setPopulerMarkalar] = useState<any[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [aramaTerimi, setAramaTerimi] = useState("");
  const [aramaSonuclari, setAramaSonuclari] = useState<any[]>([]);
  const [stats, setStats] = useState({ toplam: 0, aktif: 0 });

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;600;900&family=Plus+Jakarta+Sans:wght@400;500;700;800&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const veriGetir = async () => {
      setYukleniyor(true);
      const [sRes, mRes, kRes] = await Promise.all([
        supabase.from('sektor').select('*, gorsel_url'),
        supabase.from('marka').select('*'),
        supabase.from('kampanya').select('id, fayd_marka, gecerli_sektor_id')
      ]);

      const sData = sRes.data || [];
      const mData = mRes.data || [];
      const kData = kRes.data || [];

      const benzersizKampanyalar = new Set();
      
      const siraliSektorler = sData.map(sektor => {
        const sektoreAitMarkalar = mData.filter(m => 
          String(m.sektor_id) === String(sektor.id) || 
          (m.ek_sektor_idler && m.ek_sektor_idler.some((id:any) => String(id) === String(sektor.id)))
        ).map(m => m.id);

        const sektorKampanyaSet = new Set();
        kData.forEach(k => {
          if ((k.fayd_marka && sektoreAitMarkalar.includes(k.fayd_marka)) || (k.gecerli_sektor_id && String(k.gecerli_sektor_id) === String(sektor.id))) {
            sektorKampanyaSet.add(k.id);
            benzersizKampanyalar.add(k.id);
          }
        });
        return { ...sektor, firsatSayisi: sektorKampanyaSet.size };
      }).sort((a, b) => b.firsatSayisi - a.firsatSayisi);

      // Popüler markaları (En çok kampanyası olanlar) seçelim
      const markalarFirsatli = mData.map(m => ({
        ...m,
        firsatSayisi: kData.filter(k => String(k.fayd_marka) === String(m.id)).length
      })).sort((a, b) => b.firsatSayisi - a.firsatSayisi).slice(0, 10);

      setSektorler(siraliSektorler);
      setPopulerMarkalar(markalarFirsatli);
      setStats({ toplam: benzersizKampanyalar.size, aktif: benzersizKampanyalar.size });
      setYukleniyor(false);
    };
    veriGetir();
  }, []);

  const aramaYap = async (terim: string) => {
    setAramaTerimi(terim);
    if (terim.length > 1) {
      const { data } = await supabase.from('marka').select('*').ilike('marka_adi', `%${terim}%`).limit(5);
      setAramaSonuclari(data || []);
    } else { setAramaSonuclari([]); }
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "biKodVardı",
    "url": "https://bikodvardi.com",
    "description": "Türkiye'nin en güncel indirim kodu ve kampanya platformu.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://bikodvardi.com/?ara={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  if (yukleniyor) return (
    <div className="h-screen flex items-center justify-center font-black text-4xl text-blue-600 animate-pulse" style={{ fontFamily: 'Outfit' }}>
      bi<span className="italic">kod</span>vardı
    </div>
  );

  return (
    <main className="min-h-screen bg-[#F8FAFC] font-['Plus_Jakarta_Sans'] text-slate-900 text-left">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* --- ÜST BAR (SOSYAL BUTONLAR EKLENDİ) --- */}
      <nav className="sticky top-0 z-[60] bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex justify-between items-center text-left">
          <Link href="/" className="no-underline">
            <h1 className="text-2xl font-[900] tracking-tighter text-slate-900" style={{ fontFamily: 'Outfit' }}>
              bi<span className="text-blue-600">kod</span>vardı
            </h1>
          </Link>
          <div className="flex gap-3">
             <a href="https://wa.me/channel/LINKIN" target="_blank" className="hidden md:flex items-center gap-2 text-sm font-bold text-green-600 bg-green-50 px-4 py-2 rounded-full hover:bg-green-100 transition no-underline border border-green-100">
               WhatsApp
             </a>
             <a href="https://t.me/bikodvardi" target="_blank" className="w-10 h-10 flex items-center justify-center bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition shadow-sm border border-blue-100 no-underline">
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
             </a>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* HERO SECTION */}
        <header className="text-center pt-10 md:pt-16 pb-8 max-w-4xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-full mb-6 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{stats.toplam} Aktif Kod Yayında</span>
          </div>
          
          <h2 className="text-5xl md:text-7xl font-[900] tracking-tight text-slate-900 mb-8" style={{ fontFamily: 'Outfit', lineHeight: 1.1 }}>
            İndirim kodu arama, <br/> 
            <span className="text-blue-600 italic font-light tracking-normal">bi'kod bul.</span>
          </h2>
          
          <div className="relative w-full max-w-2xl mx-auto mt-2">
            <input 
              type="text" 
              placeholder="Hangi markada indirim arıyorsun?" 
              value={aramaTerimi} 
              onChange={(e) => aramaYap(e.target.value)}
              className="w-full bg-white border border-slate-200 p-5 md:p-6 rounded-3xl outline-none text-lg shadow-xl shadow-blue-900/5 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium" 
            />
            {aramaSonuclari.length > 0 && (
              <div className="absolute top-[105%] left-0 right-0 bg-white border border-slate-200 rounded-3xl shadow-2xl p-4 z-50 overflow-hidden text-left">
                {aramaSonuclari.map((m: any) => (
                  <Link key={m.id} href={`/marka/${m.slug}`} className="flex items-center gap-4 p-3 hover:bg-blue-50 rounded-2xl transition no-underline text-slate-900 font-bold">
                    {m.marka_adi} İndirim Kodları
                  </Link>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* --- POPÜLER MARKALAR (KÜÇÜK VE ŞIK ETİKETLER) --- */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
             {populerMarkalar.map((marka) => (
                <Link 
                  key={marka.id} 
                  href={`/marka/${marka.slug}`}
                  className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-2xl hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/5 transition-all no-underline group"
                >
                  <div className="w-5 h-5 bg-slate-50 rounded-md flex items-center justify-center text-[10px] font-black group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    {marka.marka_adi[0]}
                  </div>
                  <span className="text-[12px] font-bold text-slate-700">{marka.marka_adi}</span>
                  <span className="text-[9px] font-black text-blue-600 opacity-50">{marka.firsatSayisi}</span>
                </Link>
             ))}
          </div>
        </div>

        {/* --- REKLAM ALANI 1 (ADSENSE) --- */}
        <div className="w-full h-24 bg-white/50 border border-slate-200 border-dashed rounded-3xl mb-16 flex items-center justify-center text-slate-300 text-[10px] font-bold uppercase tracking-[0.5em]">
           REKLAM ALANI
        </div>

        {/* KATEGORİLER */}
        <section className="mt-10">
          <div className="flex items-end justify-between mb-10 text-left">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600 mb-2">Popüler Kategoriler</h3>
              <p className="text-3xl font-extrabold text-slate-900" style={{ fontFamily: 'Outfit' }}>Kategori seçerek başla.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sektorler.map((s) => (
              <Link href={`/sektor/${s.slug}`} key={s.id} className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-200 hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500 no-underline" title={`${s.sektor_adi} İndirim Kodları`}>
                <div className="h-40 overflow-hidden relative">
                  <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url('${s.gorsel_url || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200"}')` }}></div>
                </div>
                <div className="p-6 text-left">
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition">{s.sektor_adi}</h4>
                    <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-3 py-1 rounded-lg uppercase">{s.firsatSayisi} Kod</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* --- REKLAM ALANI 2 (BÜYÜK) --- */}
        <div className="w-full h-48 bg-white/50 border border-slate-200 border-dashed rounded-[3.5rem] mt-24 flex items-center justify-center text-slate-300 text-[10px] font-bold uppercase tracking-[0.5em]">
             SPONSORLU BAĞLANTI / REKLAM
        </div>
      </div>

      {/* --- FOOTER --- */}
      <footer className="mt-40 bg-white border-t border-slate-200 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-6 text-left">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
            <div className="space-y-4">
              <h4 className="text-slate-900 font-black uppercase text-xs tracking-widest" style={{ fontFamily: 'Outfit' }}>
                bi<span className="text-blue-600">kod</span>vardı
              </h4>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                Türkiye'nin en güncel <strong>indirim kodu</strong> ve <strong>kampanya</strong> platformu. Aradığın tüm markalar için bi'kod bul.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-slate-900 font-black uppercase text-xs tracking-widest" style={{ fontFamily: 'Outfit' }}>
                Yasal Uyarı
              </h4>
              <p className="text-slate-400 text-[11px] leading-relaxed font-medium italic">
                bikodvardi.com bağımsız bir platformdur. Marka hakları sahiplerine aittir. Paylaşılan kodların çalışabilirliği markaların inisiyatifindedir.
              </p>
            </div>

            <div className="space-y-4 md:text-right">
              <h4 className="text-slate-900 font-black uppercase text-xs tracking-widest" style={{ fontFamily: 'Outfit' }}>
                İletişim
              </h4>
              <a href="mailto:iletisim@bikodvardi.com" className="text-blue-600 transition-colors text-sm font-bold no-underline block">iletisim@bikodvardi.com</a>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black pt-2">© 2026 BİKODVARDI — TÜM HAKLARI SAKLIDIR.</p>
            </div>
          </div>
        </div>
      </footer>
      {/* Alt Bilgi Alanı (Footer) */}
      {/* Alt Bilgi Alanı (Footer) */}
      <footer className="mt-20 py-12 text-center border-t border-slate-100 bg-white/50">
          <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.4em] mb-6">
              bi<span className="text-blue-600">kod</span>vardı — 2026
          </p>
          
          <div className="flex justify-center items-center gap-8">
            <Link 
              href="/hakkimizda" 
              className="text-[10px] font-black text-slate-500 hover:text-blue-600 uppercase tracking-widest transition-colors no-underline"
            >
              Hakkımızda
            </Link>
            
            {/* Yönetim linki kaldırıldı. Sen panele tarayıcıdan /admin yazarak girmeye devam edebilirsin. */}
          </div>
      </footer>
    </main>
  );
}