"use client";

import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default function KampanyaDetay({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const [kampanya, setKampanya] = useState<any>(null);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    // Fontları yükle
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;600;900&family=Inter:wght@400;700&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

    const veriGetir = async () => {
      setYukleniyor(true);
      
      // DÜZELTME: 'aciklama' yerine 'detay' sütununu çekiyoruz
      const { data, error } = await supabase
        .from('kampanya')
        .select(`
          *,
          yapan_marka_bilgisi:yapan_marka ( marka_adi, logo_url ),
          tur_bilgisi:kampanya_turu ( tur_adi )
        `)
        .eq('slug', resolvedParams.slug)
        .single();

      if (error || !data) { 
        setYukleniyor(false); 
        return; 
      }
      setKampanya(data);
      setYukleniyor(false);
    };
    veriGetir();
  }, [resolvedParams.slug]);

  const shareWhatsApp = () => {
    if (typeof window !== 'undefined' && kampanya) {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(kampanya.baslik + " " + window.location.href)}`, '_blank');
    }
  };

  if (yukleniyor) return <div className="h-screen flex items-center justify-center font-black text-blue-600 animate-pulse">biKodVardı...</div>;
  if (!kampanya) return notFound();

  // Dış Link Kontrolü
  const disLink = kampanya.link && kampanya.link !== "#" 
    ? (kampanya.link.startsWith('http') ? kampanya.link : `https://${kampanya.link}`)
    : null;

  const gun = kampanya.bitis_date ? Math.ceil((new Date(kampanya.bitis_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : null;

  return (
    <main className="min-h-screen bg-white font-['Inter'] pb-24">
      
      {/* ÜST REKLAM ALANI */}
      <div className="w-full bg-slate-50 border-b border-slate-100 py-4 text-center">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">Sponsorlu İçerik Alanı</span>
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-12">
        {/* GERİ DÖNÜŞ */}
        <Link href="/" className="inline-flex items-center gap-2 mb-10 group no-underline">
             <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center group-hover:bg-blue-600 transition-colors">←</div>
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ana Sayfa</span>
        </Link>

        {/* ANA KART */}
        <div className="bg-[#0D0F14] rounded-[3.5rem] overflow-hidden shadow-2xl relative border border-white/5">
          
          {/* SAYAÇ */}
          {gun !== null && gun >= 0 && (
            <div className="absolute top-0 right-10 bg-blue-600 px-6 py-4 rounded-b-3xl flex flex-col items-center shadow-lg z-20">
                <span className="text-white font-black text-3xl leading-none" style={{ fontFamily: 'Outfit' }}>{gun}</span>
                <span className="text-[8px] font-black text-white/80 uppercase mt-1">GÜN KALDI</span>
            </div>
          )}

          <div className="p-10 md:p-14">
              
              {/* YAPAN MARKA */}
              <div className="inline-flex items-center gap-3 bg-white pl-2 pr-5 py-2 rounded-full mb-8">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center p-1.5 border border-slate-200">
                      {kampanya.yapan_marka_bilgisi?.logo_url ? (
                        <img src={kampanya.yapan_marka_bilgisi.logo_url} className="w-full h-full object-contain" alt="" />
                      ) : (
                        <span className="text-black font-black text-xs">{kampanya.yapan_marka_bilgisi?.marka_adi?.charAt(0)}</span>
                      )}
                  </div>
                  <span className="text-black font-black tracking-tight uppercase text-sm" style={{ fontFamily: 'Outfit' }}>
                      {kampanya.yapan_marka_bilgisi?.marka_adi}
                  </span>
              </div>

              {/* BAŞLIK */}
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-tight mb-8" style={{ fontFamily: 'Outfit' }}>
                  {kampanya.baslik}
              </h1>

              {/* --- KRİTİK BÖLÜM: DETAY METNİ --- */}
              {/* Artık 'kampanya.detay' kullanıyoruz ve stilini görseldeki gibi koruyoruz */}
              <div className="text-slate-300 text-lg leading-relaxed font-bold mb-10 whitespace-pre-wrap border-l-4 border-blue-600 pl-6 py-2">
                  {kampanya.detay || "Kampanya detayı bulunamadı."}
              </div>

              {/* AKSİYON BUTONLARI */}
              <div className="flex flex-col md:flex-row gap-4 mt-8">
                  {/* DIŞ LİNK BUTONU */}
                  {disLink ? (
                      <a 
                        href={disLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-1 py-6 bg-white hover:bg-blue-600 hover:text-white text-black text-xl font-black rounded-[2rem] flex items-center justify-center gap-2 transition-all shadow-xl no-underline group"
                      >
                          MARKANIN SAYFASINA GİT
                          <span className="text-sm opacity-50 group-hover:translate-x-1 transition-transform">↗</span>
                      </a>
                  ) : (
                      <div className="flex-1 py-6 bg-white/10 text-white/40 text-sm font-bold rounded-[2rem] flex items-center justify-center uppercase tracking-widest cursor-not-allowed border border-white/5">
                          LİNK MEVCUT DEĞİL
                      </div>
                  )}

                  {/* PAYLAŞ BUTONU */}
                  <button onClick={shareWhatsApp} className="w-full md:w-auto px-8 py-6 bg-white/5 hover:bg-green-600 text-white rounded-[2rem] font-bold transition-all flex items-center justify-center gap-2">
                      <span>WhatsApp'ta Paylaş</span>
                  </button>
              </div>

          </div>

          {/* ALT BİLGİ */}
          <div className="bg-black/40 border-t border-white/5 px-10 py-5 flex justify-between items-center">
              <span className="text-blue-500 font-bold text-[10px] uppercase tracking-widest">
                  Kategori: {kampanya.tur_bilgisi?.tur_adi || "Fırsat"}
              </span>
              <span className="text-white/20 font-bold text-[9px] uppercase tracking-widest">
                  biKodVardı
              </span>
          </div>
        </div>

        {/* REKLAM ALANI */}
        <div className="w-full h-32 bg-slate-50 rounded-[2.5rem] mt-12 flex items-center justify-center border border-slate-100 border-dashed">
            <span className="text-[10px] text-slate-300 font-black uppercase tracking-[0.5em]">Reklam</span>
        </div>

      </div>
    </main>
  );
}