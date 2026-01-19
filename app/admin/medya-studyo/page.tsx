"use client";

import { useState, useEffect, Suspense, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toPng } from 'html-to-image'; // Kütüphaneyi kurmalısın: npm install html-to-image

// SEKTÖREL ARKA PLANLAR
const sektorResimleri: { [key: string]: string } = {
  "1": "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1200", // Alışveriş
  "2": "https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?q=80&w=1200", // Banka
  "3": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200", // Moda
  "4": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200", // Gıda
  "default": "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=1200"
};

function MedyaStudyoIcerik() {
  const searchParams = useSearchParams();
  const urlSlug = searchParams.get('slug');
  const kartRef = useRef<HTMLDivElement>(null); // İndirme işlemi için referans
  
  const [kampanyalar, setKampanyalar] = useState<any[]>([]);
  const [seciliKampanya, setSeciliKampanya] = useState<any>(null);

  useEffect(() => {
    const veriGetir = async () => {
      // Markanın sektör bilgisini de içerecek şekilde veriyi çekiyoruz
      const { data } = await supabase
        .from('kampanya')
        .select(`
          *, 
          yapan_marka_bilgisi:yapan_marka(marka_adi, logo_url, sektor_id), 
          faydalanan_marka_bilgisi:fayd_marka(marka_adi)
        `)
        .order('id', { ascending: false });
      
      if (data) {
        setKampanyalar(data);
        if (urlSlug) setSeciliKampanya(data.find(k => k.slug === urlSlug));
      }
    };
    veriGetir();
  }, [urlSlug]);

  // PNG İNDİRME FONKSİYONU
  const gorselIndir = async () => {
    if (kartRef.current === null) return;
    try {
      const dataUrl = await toPng(kartRef.current, { cacheBust: true, quality: 1 });
      const link = document.createElement('a');
      link.download = `bikodvardi-${seciliKampanya.slug}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Görsel oluşturulamadı:", err);
    }
  };

  // ARKA PLAN BELİRLEME (Markanın kendi sektörüne bakıyoruz)
  const marka_sektor = seciliKampanya?.yapan_marka_bilgisi?.sektor_id;
  const bg = marka_sektor ? (sektorResimleri[marka_sektor] || sektorResimleri["default"]) : sektorResimleri["default"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      <div className="lg:col-span-1 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm max-h-[80vh] overflow-y-auto">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6">Kampanya Arşivi</h3>
        <div className="space-y-3">
          {kampanyalar.map(k => (
            <button key={k.id} onClick={() => setSeciliKampanya(k)} className={`w-full text-left p-5 rounded-3xl border ${seciliKampanya?.id === k.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-transparent'}`}>
              <p className="text-[8px] font-black uppercase opacity-60 mb-1">{k.yapan_marka_bilgisi?.marka_adi}</p>
              <p className="text-xs font-bold leading-tight line-clamp-2">{k.baslik}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="lg:col-span-2 flex flex-col items-center">
        {seciliKampanya ? (
          <>
            {/* İNDİRİLECEK ALAN */}
            <div ref={kartRef} className="relative w-full max-w-[450px] aspect-[4/5] rounded-[3.5rem] overflow-hidden shadow-2xl">
              <img src={bg} className="absolute inset-0 w-full h-full object-cover" crossOrigin="anonymous" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              <div className="absolute inset-0 p-12 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="bg-white p-3 rounded-2xl shadow-2xl">
                    <img src={seciliKampanya.yapan_marka_bilgisi?.logo_url} className="h-8 w-auto object-contain" crossOrigin="anonymous" alt="" />
                  </div>
                  <div className="bg-blue-600 text-white px-5 py-2 rounded-full font-black text-[9px] uppercase tracking-widest">YENİ FIRSAT</div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-blue-400 font-black text-xs uppercase">{seciliKampanya.yapan_marka_bilgisi?.marka_adi}</span>
                      <span className="text-white/60 font-bold text-[10px] uppercase">Müşterilerine Özel</span>
                    </div>
                    <h1 className="text-white text-4xl font-black leading-tight italic uppercase" style={{ fontFamily: 'Outfit' }}>
                      {seciliKampanya.faydalanan_marka_bilgisi?.marka_adi || "Seçili"} <span className="text-blue-500">Fırsatı</span>
                    </h1>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md border-l-4 border-blue-500 p-5 rounded-r-2xl text-white font-medium text-lg italic leading-snug">
                    "{seciliKampanya.baslik}"
                  </div>
                </div>

                <div className="flex justify-between items-end pt-6 border-t border-white/10 text-white font-black text-2xl">
                  <div>biKodVardı<span className="text-blue-500">.com</span></div>
                  <div className="text-right text-[11px] font-bold bg-black/30 px-3 py-1 rounded-lg">
                    SON GÜN: {new Date(seciliKampanya.bitis_date).toLocaleDateString('tr-TR')}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 flex gap-4 w-full max-w-[450px]">
              <button onClick={gorselIndir} className="flex-1 py-5 bg-green-600 text-white rounded-[2rem] font-black text-sm hover:bg-green-700 shadow-xl flex items-center justify-center gap-3 uppercase">
                Görseli İndir 📥
              </button>
              <button onClick={() => {
                navigator.clipboard.writeText(`🔥 ${seciliKampanya.baslik}\n\nDetaylar: https://bikodvardi.com/kampanya/${seciliKampanya.slug}`);
                alert("Metin Kopyalandı!");
              }} className="px-10 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-sm hover:bg-blue-600 transition-all uppercase">
                Metni Kopyala 📋
              </button>
            </div>
          </>
        ) : (
          <div className="text-slate-300 font-bold p-20 text-center border-4 border-dashed rounded-[3.5rem]">Soldan kampanya seçiniz.</div>
        )}
      </div>
    </div>
  );
}

export default function MedyaStudyo() {
  return (
    <main className="p-6 md:p-10 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-10 font-['Outfit']">
        <h2 className="text-4xl font-[900] text-slate-900 tracking-tighter">Medya Stüdyosu 🎨</h2>
        <Link href="/admin" className="px-6 py-3 bg-white border border-slate-200 text-slate-400 font-bold rounded-2xl hover:text-black transition-all no-underline text-xs">← Panele Dön</Link>
      </div>
      <Suspense fallback={<div>Yükleniyor...</div>}><MedyaStudyoIcerik /></Suspense>
    </main>
  );
}