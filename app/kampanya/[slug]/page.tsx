"use client";

import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default function KampanyaDetay({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const [kampanya, setKampanya] = useState<any>(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [oyVerildi, setOyVerildi] = useState(false);

  useEffect(() => {
    // Fontları yükle
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;600;900&family=Inter:wght@400;700&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

    const veriGetir = async () => {
      setYukleniyor(true);
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

  // --- ETKİLEŞİM FONKSİYONU ---
  const oyVer = async (tip: 'ise_yaradi_count' | 'hatali_count') => {
    if (oyVerildi) return;

    const suankiSayi = kampanya[tip] || 0;
    const yeniSayi = suankiSayi + 1;
    
    const { error } = await supabase
      .from('kampanya')
      .update({ [tip]: yeniSayi })
      .eq('id', kampanya.id);

    if (!error) {
      setKampanya({ ...kampanya, [tip]: yeniSayi });
      setOyVerildi(true);
    } else {
      console.error("Hata:", error.message);
    }
  };

  const shareWhatsApp = () => {
    if (typeof window !== 'undefined' && kampanya) {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(kampanya.baslik + " " + window.location.href)}`, '_blank');
    }
  };

  if (yukleniyor) return <div className="h-screen flex items-center justify-center font-black text-blue-600 animate-pulse">biKodVardı...</div>;
  if (!kampanya) return notFound();

  const disLink = kampanya.link && kampanya.link !== "#" 
    ? (kampanya.link.startsWith('http') ? kampanya.link : `https://${kampanya.link}`)
    : null;

  const gun = kampanya.bitis_date ? Math.ceil((new Date(kampanya.bitis_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : null;

  // GOOGLE FAQ SCHEMA
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `${kampanya.baslik} ne zamana kadar geçerli?`,
        "acceptedAnswer": { "@type": "Answer", "text": `Bu kampanya ${new Date(kampanya.bitis_date).toLocaleDateString('tr-TR')} tarihine kadar geçerlidir.` }
      },
      {
        "@type": "Question",
        "name": `${kampanya.yapan_marka_bilgisi?.marka_adi} kampanyası nasıl kullanılır?`,
        "acceptedAnswer": { "@type": "Answer", "text": "Resmi sayfaya giderek kampanya detaylarını inceleyebilir ve hemen faydalanabilirsiniz." }
      }
    ]
  };

  return (
    <main className="min-h-screen bg-white font-['Inter'] pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      
      <div className="w-full bg-slate-50 border-b border-slate-100 py-4 text-center">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">Sponsorlu İçerik Alanı</span>
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-12">
        <Link href="/" className="inline-flex items-center gap-2 mb-10 group no-underline">
              <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center group-hover:bg-blue-600 transition-colors">←</div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ana Sayfa</span>
        </Link>

        {/* --- KART ALANI --- */}
        <div className="bg-[#0D0F14] rounded-[3.5rem] overflow-hidden shadow-2xl relative border border-white/5">
          
          {gun !== null && gun >= 0 && (
            <div className="absolute top-0 right-10 bg-blue-600 px-6 py-4 rounded-b-3xl flex flex-col items-center shadow-lg z-20">
                <span className="text-white font-black text-3xl leading-none" style={{ fontFamily: 'Outfit' }}>{gun}</span>
                <span className="text-[8px] font-black text-white/80 uppercase mt-1">GÜN KALDI</span>
            </div>
          )}

          <div className="p-8 md:p-14">
              {/* Marka Logo */}
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

              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-tight mb-8" style={{ fontFamily: 'Outfit' }}>
                  {kampanya.baslik}
              </h1>

              {/* --- AKILLI İÇERİK ALANI ---
                  1. whitespace-pre-wrap: Eski düz metinlerdeki satır başlarını (Enter) korur.
                  2. dangerouslySetInnerHTML: Yeni HTML tabloları (Gemini'den gelen) render eder.
                  3. [&>div]:whitespace-normal: Eğer içerik yeni bir HTML div ise (tablo gibi), 
                     onun içindeki boşlukları normale çevirir ki tablo bozulmasın.
              */}
              <div 
                className="
                  prose prose-invert max-w-none mb-10 text-slate-300 leading-relaxed font-medium 
                  whitespace-pre-wrap [&>div]:whitespace-normal
                "
                dangerouslySetInnerHTML={{ __html: kampanya.detay || "<p>Detay bulunamadı.</p>" }}
              />

              {/* ETKİLEŞİM BUTONLARI */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h4 className="font-black text-white text-xs uppercase tracking-widest">Bu kampanya işine yaradı mı?</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">
                      {oyVerildi ? "Geri bildirimin için teşekkürler! ✨" : "Sana yardımcı olduysa oyla!"}
                    </p>
                </div>
                <div className="flex gap-3">
                    <button 
                      onClick={() => oyVer('ise_yaradi_count')}
                      disabled={oyVerildi}
                      className={`px-6 py-3 rounded-2xl font-black text-xs transition-all flex items-center gap-2 ${oyVerildi ? 'bg-green-600 text-white opacity-50' : 'bg-white/10 hover:bg-green-600 text-white'}`}
                    >
                        👍 {kampanya.ise_yaradi_count || 0}
                    </button>
                    <button 
                      onClick={() => oyVer('hatali_count')}
                      disabled={oyVerildi}
                      className={`px-6 py-3 rounded-2xl font-black text-xs transition-all flex items-center gap-2 ${oyVerildi ? 'bg-red-600 text-white opacity-50' : 'bg-white/10 hover:bg-red-600 text-white'}`}
                    >
                        👎 {kampanya.hatali_count || 0}
                    </button>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 mt-8">
                  {disLink ? (
                      <a href={disLink} target="_blank" rel="noopener noreferrer" className="flex-1 py-6 bg-white hover:bg-blue-600 hover:text-white text-black text-xl font-black rounded-[2rem] flex items-center justify-center gap-2 transition-all shadow-xl no-underline group">
                          MARKANIN SAYFASINA GİT
                          <span className="text-sm opacity-50 group-hover:translate-x-1 transition-transform">↗</span>
                      </a>
                  ) : (
                      <div className="flex-1 py-6 bg-white/10 text-white/40 text-sm font-bold rounded-[2rem] flex items-center justify-center uppercase tracking-widest cursor-not-allowed border border-white/5">
                          LİNK MEVCUT DEĞİL
                      </div>
                  )}

                  <button onClick={shareWhatsApp} className="w-full md:w-auto px-8 py-6 bg-white/5 hover:bg-green-600 text-white rounded-[2rem] font-bold transition-all flex items-center justify-center gap-2">
                      <span>WhatsApp</span>
                  </button>
              </div>
          </div>

          <div className="bg-black/40 border-t border-white/5 px-10 py-5 flex justify-between items-center">
              <span className="text-blue-500 font-bold text-[10px] uppercase tracking-widest">
                  Kategori: {kampanya.tur_bilgisi?.tur_adi || "Fırsat"}
              </span>
              <span className="text-white/20 font-bold text-[9px] uppercase tracking-widest">
                  biKodVardı
              </span>
          </div>
        </div>

        {/* SSS BÖLÜMÜ */}
        <div className="mt-16 space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.3em] ml-2">Sıkça Sorulan Sorular</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <p className="font-black text-slate-900 text-xs uppercase mb-3 text-blue-600">Geçerlilik Tarihi</p>
                    <p className="text-sm text-slate-500 font-bold leading-relaxed">
                       Bu kampanya {new Date(kampanya.bitis_date).toLocaleDateString('tr-TR')} tarihine kadar geçerlidir.
                    </p>
                </div>
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <p className="font-black text-slate-900 text-xs uppercase mb-3 text-blue-600">Nasıl Yararlanırım?</p>
                    <p className="text-sm text-slate-500 font-bold leading-relaxed">
                        Yukarıdaki butonla markanın resmi sayfasına giderek katılım sağlayabilirsiniz.
                    </p>
                </div>
            </div>
        </div>

        <div className="w-full h-32 bg-slate-50 rounded-[2.5rem] mt-12 flex items-center justify-center border border-slate-100 border-dashed">
            <span className="text-[10px] text-slate-300 font-black uppercase tracking-[0.5em]">Reklam</span>
        </div>
      </div>
    </main>
  );
}