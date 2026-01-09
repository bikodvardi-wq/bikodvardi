"use client";

import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SektorDetay({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [sektor, setSektor] = useState<any>(null);
  const [markalar, setMarkalar] = useState<any[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [toplamKod, setToplamKod] = useState(0);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;600;900&family=Plus+Jakarta+Sans:wght@400;500;700;800&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const veriGetir = async () => {
      setYukleniyor(true);
      const { data: sData } = await supabase.from('sektor').select('*').eq('slug', slug).single();
      
      if (sData) {
        setSektor(sData);
        const [mRes, kRes] = await Promise.all([
          supabase.from('marka').select('*').or(`sektor_id.eq.${sData.id},ek_sektor_idler.cs.{${sData.id}}`),
          supabase.from('kampanya').select('id, fayd_marka, gecerli_sektor_id')
        ]);

        const mData = mRes.data || [];
        const kData = kRes.data || [];
        const sektorGeneliBenzersizKampanyalar = new Set();
        
        const markalarliData = mData.map(marka => {
          const markaKampanyalari = kData.filter(k => 
            String(k.fayd_marka) === String(marka.id) || 
            (String(k.gecerli_sektor_id) === String(sData.id) && !k.fayd_marka)
          );
          const markaKodSayisi = new Set(markaKampanyalari.map(k => k.id)).size;
          markaKampanyalari.forEach(k => sektorGeneliBenzersizKampanyalar.add(k.id));
          return { ...marka, kampanyaSayisi: markaKodSayisi };
        }).sort((a, b) => b.kampanyaSayisi - a.kampanyaSayisi);

        setMarkalar(markalarliData);
        setToplamKod(sektorGeneliBenzersizKampanyalar.size);
      }
      setYukleniyor(false);
    };
    veriGetir();
  }, [slug]);

  if (yukleniyor) return (
    <div className="h-screen flex items-center justify-center font-black text-2xl text-blue-600 animate-pulse" style={{ fontFamily: 'Outfit' }}>
      bi<span className="italic">kod</span>vardı
    </div>
  );

  return (
    <main className="min-h-screen bg-[#F0F4F8] font-['Plus_Jakarta_Sans'] text-left pb-20">
      
      {/* --- BANNER (GLASSMORPHISM) --- */}
      <div className="relative h-[35vh] md:h-[40vh] w-full flex items-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: `url('${sektor?.gorsel_url || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200"}')` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#F0F4F8] via-transparent to-black/5"></div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6">
            <div className="inline-block p-6 md:p-10 bg-white/70 backdrop-blur-2xl border border-white/40 rounded-[2.5rem] shadow-2xl shadow-blue-900/5 max-w-sm">
                <button onClick={() => router.back()} className="text-blue-600 text-[9px] font-black uppercase tracking-[0.3em] mb-3 bg-transparent border-none cursor-pointer hover:underline">
                  ← GERİ DÖN
                </button>
                <h1 className="text-3xl md:text-4xl font-[900] text-slate-900 tracking-tighter leading-tight" style={{ fontFamily: 'Outfit' }}>
                    {sektor?.sektor_adi} <br/>
                    <span className="text-blue-600 italic font-light tracking-normal">Kodları</span>
                </h1>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-6 relative z-20">
        
        {/* --- SAYAÇ MODÜLÜ --- */}
        <div className="flex flex-wrap gap-6 mb-8 bg-white/80 backdrop-blur-md p-5 rounded-[2rem] border border-white shadow-xl items-center">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                </div>
                <div>
                    <p className="text-lg font-[900] text-slate-900 leading-none" style={{ fontFamily: 'Outfit' }}>{toplamKod}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5 tracking-widest">Aktif Kod</p>
                </div>
            </div>
            <div className="h-6 w-[1px] bg-slate-200 hidden md:block"></div>
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#0F172A] text-white rounded-xl flex items-center justify-center shadow-lg">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                </div>
                <div>
                    <p className="text-lg font-[900] text-slate-900 leading-none" style={{ fontFamily: 'Outfit' }}>{markalar.length}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5 tracking-widest">Marka</p>
                </div>
            </div>
        </div>

        {/* --- REKLAM ALANI 1 (ÜST) --- */}
        <div className="w-full h-24 bg-white/50 border border-slate-200 border-dashed rounded-3xl mb-8 flex items-center justify-center text-slate-300 text-[10px] font-bold uppercase tracking-[0.5em]">
           REKLAM ALANI
        </div>

        {/* --- MARKA KARTLARI --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {markalar.map((marka) => (
            <Link 
              key={marka.id} 
              href={`/marka/${marka.slug}`}
              className="group bg-[#0F172A] p-5 rounded-[2rem] border border-slate-800 shadow-lg hover:shadow-blue-600/20 transition-all duration-500 hover:-translate-y-1 flex flex-col relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-5 relative z-10">
                <div className="flex items-center gap-3.5 text-left">
                    <div className="w-12 h-12 bg-white text-[#0F172A] rounded-xl flex items-center justify-center text-lg font-black shadow-xl group-hover:scale-105 transition-transform">
                        {marka.marka_adi[0]}
                    </div>
                    <div>
                        <h4 className="font-[800] text-lg text-white tracking-tight leading-tight">
                            {marka.marka_adi}
                        </h4>
                        <div className="flex items-center gap-1 mt-0.5">
                            <span className="w-1 h-1 rounded-full bg-blue-500 animate-pulse"></span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{marka.kampanyaSayisi} KOD AKTİF</span>
                        </div>
                    </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-800 mt-auto relative z-10">
                  <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.15em]">KODLARI GÖR</span>
                  <div className="w-8 h-8 bg-blue-600/10 text-blue-500 rounded-lg flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:rotate-12">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </div>
              </div>
            </Link>
          ))}
        </div>

        {/* --- REKLAM ALANI 2 (ALT - BÜYÜK) --- */}
        <div className="w-full h-48 bg-white/50 border border-slate-200 border-dashed rounded-[3rem] mt-16 flex items-center justify-center text-slate-300 text-[10px] font-bold uppercase tracking-[0.5em]">
             SPONSORLU BAĞLANTI / REKLAM
        </div>

      </div>
    </main>
  );
}