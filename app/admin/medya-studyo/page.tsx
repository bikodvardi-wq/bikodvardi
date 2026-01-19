"use client";

import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// SEKTÖREL ARKA PLANLAR (Yüksek Kalite)
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
  const [kampanyalar, setKampanyalar] = useState<any[]>([]);
  const [seciliKampanya, setSeciliKampanya] = useState<any>(null);

  useEffect(() => {
    const veriGetir = async () => {
      const { data } = await supabase
        .from('kampanya')
        .select('*, yapan_marka_bilgisi:yapan_marka(marka_adi, logo_url), faydalanan_marka_bilgisi:fayd_marka(marka_adi)')
        .order('id', { ascending: false });
      if (data) {
        setKampanyalar(data);
        if (urlSlug) setSeciliKampanya(data.find(k => k.slug === urlSlug));
      }
    };
    veriGetir();
  }, [urlSlug]);

  const bg = seciliKampanya ? (sektorResimleri[seciliKampanya.gecerli_sektor_id] || sektorResimleri["default"]) : sektorResimleri["default"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      {/* SOL: LİSTE */}
      <div className="lg:col-span-1 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm max-h-[80vh] overflow-y-auto">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6">Kampanya Arşivi</h3>
        <div className="space-y-3">
          {kampanyalar.map(k => (
            <button key={k.id} onClick={() => setSeciliKampanya(k)} className={`w-full text-left p-5 rounded-3xl transition-all border ${seciliKampanya?.id === k.id ? 'bg-blue-600 text-white border-blue-600 shadow-xl' : 'bg-slate-50 text-slate-600 border-transparent hover:border-slate-200'}`}>
              <p className="text-[8px] font-black uppercase tracking-widest opacity-60 mb-1">{k.yapan_marka_bilgisi?.marka_adi}</p>
              <p className="text-xs font-bold leading-tight line-clamp-2">{k.baslik}</p>
            </button>
          ))}
        </div>
      </div>

      {/* SAĞ: ÖZEL TASARIM ALANI */}
      <div className="lg:col-span-2 flex flex-col items-center">
        {seciliKampanya ? (
          <div id="sosyal-medya-karti" className="relative w-full max-w-[450px] aspect-[4/5] rounded-[3.5rem] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] border-[12px] border-white">
            {/* Sektörel Arka Plan */}
            <img src={bg} className="absolute inset-0 w-full h-full object-cover" alt="" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

            <div className="absolute inset-0 p-12 flex flex-col justify-between">
              {/* ÜST: YAPAN MARKA LOGO */}
              <div className="flex justify-between items-start">
                <div className="bg-white p-3 rounded-2xl shadow-2xl border border-slate-100">
                  <img src={seciliKampanya.yapan_marka_bilgisi?.logo_url} className="h-8 w-auto object-contain" alt="" />
                </div>
                <div className="bg-blue-600 text-white px-5 py-2 rounded-full font-black text-[9px] uppercase tracking-[0.2em] shadow-lg">Yeni Fırsat</div>
              </div>

              {/* ORTA: MARKA HİYERARŞİSİ */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-blue-400 font-black text-xs uppercase tracking-tighter">{seciliKampanya.yapan_marka_bilgisi?.marka_adi}</span>
                    <span className="text-white/60 font-bold text-[10px] uppercase tracking-widest">Müşterilerine Özel</span>
                  </div>
                  <h1 className="text-white text-4xl md:text-5xl font-black leading-[1.05] tracking-tighter italic uppercase" style={{ fontFamily: 'Outfit' }}>
                    {seciliKampanya.faydalanan_marka_bilgisi?.marka_adi || "Seçili"} <span className="text-blue-500">Fırsatı</span>
                  </h1>
                </div>

                {/* SLOGAN / BAŞLIK */}
                <div className="bg-white/10 backdrop-blur-md border-l-4 border-blue-500 p-5 rounded-r-2xl">
                  <p className="text-white font-medium text-lg leading-snug italic">
                    "{seciliKampanya.baslik}"
                  </p>
                </div>
              </div>

              {/* ALT: MARKA & TARİH */}
              <div className="flex justify-between items-end pt-6 border-t border-white/10">
                <div className="text-white font-black text-2xl italic tracking-tighter">
                  biKodVardı<span className="text-blue-500">.com</span>
                </div>
                <div className="text-right">
                  <p className="text-white/40 text-[8px] font-black uppercase tracking-widest mb-1">Geçerlilik</p>
                  <p className="text-white font-bold text-[11px] bg-slate-800/50 px-3 py-1 rounded-lg border border-white/5">
                    {new Date(seciliKampanya.bitis_date).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-[450px] aspect-[4/5] rounded-[3.5rem] bg-slate-50 border-4 border-dashed border-slate-200 flex items-center justify-center text-slate-300 font-bold uppercase tracking-widest text-xs text-center p-20">
            Soldan bir kampanya seçerek tasarım oluşturun
          </div>
        )}

        {seciliKampanya && (
          <div className="mt-12 flex flex-col items-center gap-4">
            <button 
              onClick={() => {
                const text = `🔥 ${seciliKampanya.baslik}\n\nDetaylar: https://bikodvardi.com/kampanya/${seciliKampanya.slug}\n\n#bikodvardi #kampanya #fırsat`;
                navigator.clipboard.writeText(text);
                alert("Paylaşım metni ve link kopyalandı! 😎");
              }}
              className="px-10 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-sm hover:bg-blue-600 transition-all shadow-2xl flex items-center gap-3"
            >
              METNİ KOPYALA 📋
            </button>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">💡 Görselin ekran görüntüsünü alıp paylaşabilirsiniz.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MedyaStudyo() {
  return (
    <main className="p-6 md:p-10 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-4xl font-[900] text-slate-900 tracking-tighter" style={{ fontFamily: 'Outfit' }}>Medya Stüdyosu 🎨</h2>
        <Link href="/admin" className="px-6 py-3 bg-white border border-slate-200 text-slate-400 font-bold rounded-2xl hover:text-black transition-all no-underline text-xs">← Panele Dön</Link>
      </div>
      <Suspense fallback={<div className="text-center p-20 font-black animate-pulse">Stüdyo Hazırlanıyor...</div>}>
        <MedyaStudyoIcerik />
      </Suspense>
    </main>
  );
}