"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // 🚀 YENİ EKLENDİ: Next.js Turbo Resim Motoru
import { supabase } from '@/lib/supabase';

export default function KampanyaIcerik({ kampanya: ilkKampanya, benzerler }: { kampanya: any, benzerler: any[] }) {
  const [kampanya, setKampanya] = useState(ilkKampanya);
  const [oyVerildi, setOyVerildi] = useState<'ise_yaradi' | 'hatali' | null>(null);

  useEffect(() => {
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;600;900&family=Inter:wght@400;700&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

    // LocalStorage'dan oy kontrolü (tekrar oy vermeyi engelle)
    const oyKey = `kampanya_oy_${kampanya.id}`;
    const kaydedilenOy = localStorage.getItem(oyKey);
    if (kaydedilenOy) {
      setOyVerildi(kaydedilenOy as 'ise_yaradi' | 'hatali');
    }
  }, [kampanya.id]);

  const oyVer = async (tip: 'ise_yaradi_count' | 'hatali_count', tipAdi: 'ise_yaradi' | 'hatali') => {
    if (oyVerildi) return;

    const suankiSayi = kampanya[tip] || 0;
    const yeniSayi = suankiSayi + 1;

    const { error } = await supabase
      .from('kampanya')
      .update({ [tip]: yeniSayi })
      .eq('id', kampanya.id);

    if (!error) {
      setKampanya({ ...kampanya, [tip]: yeniSayi });
      setOyVerildi(tipAdi);
      localStorage.setItem(`kampanya_oy_${kampanya.id}`, tipAdi);
    } else {
      console.error('Oy verme hatası:', error);
    }
  };

  const toplamOy = (kampanya.ise_yaradi_count || 0) + (kampanya.hatali_count || 0);
  const yararliYuzde = toplamOy > 0 ? Math.round(((kampanya.ise_yaradi_count || 0) / toplamOy) * 100) : 0;

  const shareWhatsApp = () => {
    if (typeof window !== 'undefined') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(kampanya.baslik + " " + window.location.href)}`, '_blank');
    }
  };

  const disLink = kampanya.link && kampanya.link !== "#" 
    ? (kampanya.link.startsWith('http') ? kampanya.link : `https://${kampanya.link}`) 
    : null;

  // 🚀 YENİ EKLENDİ: Arka planda sayacı artırıp kullanıcıyı markaya gönderen fonksiyon
  const yonlendirVeSay = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault(); // Butonun standart tıklamasını durdur

    // 1. Kullanıcıyı hiç bekletmeden anında yeni sekmede markaya gönder
    if (typeof window !== 'undefined' && disLink) {
      window.open(disLink, '_blank');
    }

    // 2. Arka planda Supabase sayacını 1 artır
    const suankiSayi = kampanya.tiklanma_sayisi || 0;
    const yeniSayi = suankiSayi + 1;

    const { error } = await supabase
      .from('kampanya')
      .update({ tiklanma_sayisi: yeniSayi })
      .eq('id', kampanya.id);

    // Ekranda da veriyi güncelleyelim (isteğe bağlı ileride ekranda sayacı göstermek istersen hazır olsun)
    if (!error) {
      setKampanya({ ...kampanya, tiklanma_sayisi: yeniSayi });
    } else {
      console.error('Tıklanma kaydetme hatası:', error);
    }
  };

  const gun = kampanya.bitis_date 
    ? Math.max(0, Math.ceil((new Date(kampanya.bitis_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24))) 
    : null;

  const gecmis = gun !== null && gun === 0;

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

        <div className="bg-[#0D0F14] rounded-[3.5rem] overflow-hidden shadow-2xl relative border border-white/5">
          {gun !== null && (
            <div className={`absolute top-0 right-10 px-6 py-4 rounded-b-3xl flex flex-col items-center shadow-lg z-20 ${gecmis ? 'bg-red-600' : 'bg-blue-600'}`}>
              <span className="text-white font-black text-3xl leading-none" style={{ fontFamily: 'Outfit' }}>{gun}</span>
              <span className="text-[8px] font-black text-white/80 uppercase mt-1">{gecmis ? 'SÜRE DOLDU' : 'GÜN KALDI'}</span>
            </div>
          )}

          {gecmis && (
            <div className="absolute top-0 left-0 right-0 bg-red-600/80 text-white text-center py-3 font-bold text-sm z-30">
              Bu kampanya süresi doldu! ⚠️ Yeni fırsatlar için ana sayfaya dönün.
            </div>
          )}

          <div className="p-8 md:p-14">
            <div className="inline-flex items-center gap-3 bg-white pl-2 pr-5 py-2 rounded-full mb-8">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center p-1.5 border border-slate-200">
                {kampanya.yapan_marka_bilgisi?.logo_url ? (
                  // 🚀 DEĞİŞİKLİK 1: Ana Logo Optimize Edildi
                  <Image 
                    src={kampanya.yapan_marka_bilgisi.logo_url} 
                    width={64}
                    height={64}
                    className="w-full h-full object-contain" 
                    alt={kampanya.yapan_marka_bilgisi.marka_adi || 'Marka logosu'} 
                  />
                ) : (
                  <span className="text-black font-black text-xs">
                    {kampanya.yapan_marka_bilgisi?.marka_adi?.charAt(0) || '?'}
                  </span>
                )}
              </div>
              <span className="text-black font-black tracking-tight uppercase text-sm" style={{ fontFamily: 'Outfit' }}>
                {kampanya.yapan_marka_bilgisi?.marka_adi}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-tight mb-8" style={{ fontFamily: 'Outfit' }}>
              {kampanya.baslik}
            </h1>

            <div 
              className="prose prose-invert max-w-none mb-10 text-slate-300 leading-relaxed font-medium whitespace-pre-wrap [&>div]:whitespace-normal"
              dangerouslySetInnerHTML={{ __html: kampanya.detay || "<p>Detay bulunamadı.</p>" }}
            />

            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h4 className="font-black text-white text-xs uppercase tracking-widest">Bu kampanya işine yaradı mı?</h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">
                  {oyVerildi ? "Teşekkürler oy verdiğin için! 🚀✨" : "Sana yardımcı olduysa oyla!"}
                </p>
                {toplamOy > 0 && (
                  <p className="text-xs text-slate-400 mt-1">
                    Kullanıcıların %{yararliYuzde}'si işe yaradı buldu ({toplamOy} oy)
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => oyVer('ise_yaradi_count', 'ise_yaradi')}
                  disabled={!!oyVerildi}
                  className={`px-6 py-3 rounded-2xl font-black text-xs transition-all flex items-center gap-2 ${oyVerildi === 'ise_yaradi' ? 'bg-green-600 text-white opacity-80' : 'bg-white/10 hover:bg-green-600 text-white'}`}
                >
                  👍 {kampanya.ise_yaradi_count || 0}
                </button>
                <button 
                  onClick={() => oyVer('hatali_count', 'hatali')}
                  disabled={!!oyVerildi}
                  className={`px-6 py-3 rounded-2xl font-black text-xs transition-all flex items-center gap-2 ${oyVerildi === 'hatali' ? 'bg-red-600 text-white opacity-80' : 'bg-white/10 hover:bg-red-600 text-white'}`}
                >
                  👎 {kampanya.hatali_count || 0}
                </button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mt-8">
              {disLink ? (
                <a 
                  href={disLink} 
                  onClick={yonlendirVeSay} // 🚀 SİHİR BURADA: Tıklandığında sayacı tetikleyecek
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex-1 py-5 md:py-6 bg-white hover:bg-blue-600 hover:text-white text-black text-base md:text-xl font-black rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center gap-2 transition-all shadow-xl no-underline group"
                >
                  <span className="md:hidden">KAMPANYAYA GİT</span>
                  <span className="hidden md:inline">MARKANIN SAYFASINA GİT</span>
                  <span className="text-sm opacity-50 group-hover:translate-x-1 transition-transform">↗</span>
                </a>
              ) : (
                <div className="flex-1 py-5 md:py-6 bg-white/10 text-white/40 text-xs md:text-sm font-bold rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center uppercase tracking-widest cursor-not-allowed border border-white/5">
                  LİNK MEVCUT DEĞİL
                </div>
              )}
              <button 
                onClick={shareWhatsApp} 
                className="w-full md:w-auto px-8 py-5 md:py-6 bg-white/5 hover:bg-green-600 text-white rounded-[1.5rem] md:rounded-[2rem] font-bold text-sm transition-all flex items-center justify-center gap-2"
              >
                <span>WhatsApp</span>
              </button>
            </div>
          </div>

          <div className="bg-black/40 border-t border-white/5 px-10 py-5 flex justify-between items-center">
            <span className="text-blue-500 font-bold text-[10px] uppercase tracking-widest">
              Kategori: {kampanya.tur_bilgisi?.tur_adi || "Fırsat"}
            </span>
            <span className="text-white/20 font-bold text-[9px] uppercase tracking-widest">biKodVardı</span>
          </div>
        </div>

        {benzerler.length > 0 && (
          <div className="mt-16 mb-8">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.3em] ml-2 mb-6">İlgini Çekebilecek Diğer Fırsatlar</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {benzerler.map((bk) => (
                <Link key={bk.id} href={`/kampanya/${bk.slug}`} className="group bg-slate-50 border border-slate-100 p-6 rounded-[2.5rem] hover:bg-white hover:shadow-xl transition-all no-underline">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-1.5 mb-4 border border-slate-200">
                    {bk.yapan_marka_bilgisi?.logo_url ? (
                      // 🚀 DEĞİŞİKLİK 2: Benzer Kampanyaların Logoları Optimize Edildi
                      <Image 
                        src={bk.yapan_marka_bilgisi.logo_url} 
                        width={64}
                        height={64}
                        className="w-full h-full object-contain" 
                        alt={bk.yapan_marka_bilgisi?.marka_adi || 'Marka'} 
                      />
                    ) : (
                      <span className="text-black font-black text-xs">
                        {bk.yapan_marka_bilgisi?.marka_adi?.charAt(0) || '?'}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                    {bk.baslik}
                  </h4>
                </Link>
              ))}
            </div>
          </div>
        )}

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