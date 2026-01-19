"use client";

import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Sektör Arka Planları
const backgrounds: { [key: string]: string } = {
  "1": "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1000",
  "2": "https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?q=80&w=1000",
  "3": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1000",
  "4": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000",
  "default": "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=1000"
};

// Next.js build hatası almamak için ana içeriği Suspense ile sarıyoruz
function MedyaStudyoIcerik() {
  const searchParams = useSearchParams();
  const urlSlug = searchParams.get('slug');
  
  const [kampanyalar, setKampanyalar] = useState<any[]>([]);
  const [seciliKampanya, setSeciliKampanya] = useState<any>(null);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    const veriGetir = async () => {
      const { data } = await supabase
        .from('kampanya')
        .select('*, yapan_marka_bilgisi:yapan_marka(marka_adi, logo_url), faydalanan_marka_bilgisi:fayd_marka(marka_adi)')
        .order('id', { ascending: false });
      
      if (data) {
        setKampanyalar(data);
        if (urlSlug) {
          const bul = data.find(k => k.slug === urlSlug);
          if (bul) setSeciliKampanya(bul);
        }
      }
      setYukleniyor(false);
    };
    veriGetir();
  }, [urlSlug]);

  const bg = seciliKampanya ? (backgrounds[seciliKampanya.gecerli_sektor_id] || backgrounds["default"]) : backgrounds["default"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      {/* SOL: LİSTE */}
      <div className="lg:col-span-1 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm max-h-[80vh] overflow-y-auto">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Kampanya Seç</h3>
        <div className="space-y-3">
          {kampanyalar.map(k => (
            <button 
              key={k.id} 
              onClick={() => setSeciliKampanya(k)}
              className={`w-full text-left p-4 rounded-2xl transition-all border ${seciliKampanya?.id === k.id ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-slate-50 text-slate-600 border-transparent hover:border-slate-200'}`}
            >
              <p className="text-[10px] font-black uppercase opacity-60 mb-1">{k.yapan_marka_bilgisi?.marka_adi}</p>
              <p className="text-xs font-bold leading-tight">{k.baslik}</p>
            </button>
          ))}
        </div>
      </div>

      {/* SAĞ: TASARIM MOTORU */}
      <div className="lg:col-span-2 flex flex-col items-center">
        {seciliKampanya ? (
          <div className="w-full max-w-[500px] aspect-square rounded-[3.5rem] overflow-hidden shadow-2xl relative border-8 border-white">
            <img src={bg} className="absolute inset-0 w-full h-full object-cover" alt="" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
            
            <div className="absolute inset-0 p-10 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="bg-white p-3 rounded-2xl shadow-xl">
                  <img src={seciliKampanya.yapan_marka_bilgisi?.logo_url} className="h-8 w-auto object-contain" alt="" />
                </div>
                <span className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">Yeni Fırsat</span>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                   <p className="text-white/80 font-bold text-sm">
                    <span className="text-blue-400 uppercase">{seciliKampanya.yapan_marka_bilgisi?.marka_adi}</span> Müşterilerine Özel
                   </p>
                   <h1 className="text-white text-4xl font-black leading-tight tracking-tighter" style={{ fontFamily: 'Outfit' }}>
                      {seciliKampanya.faydalanan_marka_bilgisi?.marka_adi || "Tüm Mağazalarda"} Fırsatı
                   </h1>
                </div>
                <p className="text-white font-medium text-lg leading-snug line-clamp-2 border-l-4 border-blue-500 pl-4">
                  {seciliKampanya.baslik}
                </p>
              </div>

              <div className="flex justify-between items-end pt-6 border-t border-white/10">
                <p className="text-white font-black text-xl italic tracking-tighter">biKodVardı<span className="text-blue-500">.com</span></p>
                <div className="text-right">
                  <p className="text-white/40 text-[9px] font-black uppercase">Son Gün</p>
                  <p className="text-white font-bold text-xs">{new Date(seciliKampanya.bitis_date).toLocaleDateString('tr-TR')}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-[500px] aspect-square rounded-[3.5rem] bg-slate-50 border-4 border-dashed border-slate-200 flex items-center justify-center text-slate-300 font-bold uppercase tracking-widest text-sm text-center p-10">
            Soldan bir kampanya seçerek tasarım oluşturun
          </div>
        )}

        {seciliKampanya && (
          <div className="mt-8 flex gap-4">
            <button 
              onClick={() => {
                const text = `🔥 ${seciliKampanya.baslik}\n\nDetaylar: https://bikodvardi.com/kampanya/${seciliKampanya.slug}\n\n#bikodvardi #kampanya`;
                navigator.clipboard.writeText(text);
                alert("Metin Kopyalandı!");
              }}
              className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-black transition-all"
            >
              METNİ KOPYALA 📋
            </button>
            <p className="text-slate-400 font-bold text-xs self-center">💡 Görselin ekran görüntüsünü alıp paylaşabilirsiniz.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ANA EXPORT (Hatanın çözümü burada)
export default function MedyaStudyo() {
  return (
    <main className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter" style={{ fontFamily: 'Outfit' }}>Medya Stüdyosu 🎨</h2>
        <Link href="/admin" className="text-slate-400 font-bold hover:text-black transition-all">← Panele Dön</Link>
      </div>
      
      <Suspense fallback={<div className="text-center p-20 font-black animate-pulse">Stüdyo Hazırlanıyor...</div>}>
        <MedyaStudyoIcerik />
      </Suspense>
    </main>
  );
}