"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import ReklamAlani from '@/components/ReklamAlani';

export default function KampanyaIcerik({ 
  kampanya: ilkKampanya, 
  benzerler,
  reklamlar = []
}: { 
  kampanya: any, 
  benzerler: any[],
  reklamlar?: any[]
}) {
  const [kampanya, setKampanya] = useState(ilkKampanya);
  const [oyVerildi, setOyVerildi] = useState<'ise_yaradi' | 'hatali' | null>(null);

  useEffect(() => {
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;600;900&family=Inter:wght@400;700&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

    // 1. OY KONTROLÜ
    const oyKey = `kampanya_oy_${kampanya.id}`;
    const kaydedilenOy = localStorage.getItem(oyKey);
    if (kaydedilenOy) {
      setOyVerildi(kaydedilenOy as 'ise_yaradi' | 'hatali');
    }

    // 2. SAYFA GÖRÜNTÜLENME (HİT) SAYACI
    const goruntulenmeKey = `kampanya_goruntulendi_${kampanya.id}`;
    if (!sessionStorage.getItem(goruntulenmeKey)) {
      const goruntulenmeyiArtir = async () => {
        const { error } = await supabase.rpc('tiklanma_artir', { k_id: kampanya.id });
        if (!error) {
          setKampanya((prev: any) => ({ ...prev, tiklanma_sayisi: (prev.tiklanma_sayisi || 0) + 1 }));
          sessionStorage.setItem(goruntulenmeKey, 'true');
        }
      };
      goruntulenmeyiArtir();
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
    }
  };

  const shareWhatsApp = () => {
    if (typeof window !== 'undefined') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(kampanya.baslik + " " + window.location.href)}`, '_blank');
    }
  };

  const toplamOy = (kampanya.ise_yaradi_count || 0) + (kampanya.hatali_count || 0);
  const yararliYuzde = toplamOy > 0 ? Math.round(((kampanya.ise_yaradi_count || 0) / toplamOy) * 100) : 0;
  
  const disLink = kampanya.link && kampanya.link !== "#" 
    ? (kampanya.link.startsWith('http') ? kampanya.link : `https://${kampanya.link}`) 
    : null;

  const gun = kampanya.bitis_date 
    ? Math.max(0, Math.ceil((new Date(kampanya.bitis_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24))) 
    : null;

  const gecmis = gun !== null && gun === 0;
  const sonSans = gun !== null && gun > 0 && gun <= 3; // YENİ: FOMO Etkisi (Son 3 gün)

  // YENİ: Akıllı Yönlendirme Verileri
  const markaBilgisi = kampanya.yapan_marka_bilgisi;
  const markaSlug = markaBilgisi?.slug; // Server'dan gelmesi şart
  const markaAdi = markaBilgisi?.marka_adi || 'Marka';
  const geriLink = markaSlug ? `/marka/${markaSlug}` : '/';
  const geriMetin = markaSlug ? `${markaAdi} Fırsatlarına Dön` : 'Ana Sayfa';

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
        "name": `${markaAdi} kampanyası nasıl kullanılır?`,
        "acceptedAnswer": { "@type": "Answer", "text": "Resmi sayfaya giderek kampanya detaylarını inceleyebilir ve hemen faydalanabilirsiniz." }
      }
    ]
  };

  return (
    <main className="min-h-screen bg-white font-['Inter'] pb-32 md:pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      
      <div className="w-full bg-slate-50 border-b border-slate-100 py-4 text-center">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">Sponsorlu İçerik Alanı</span>
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-12">
        
        {/* YENİ: SEO Breadcrumb */}
        <nav className="flex items-center gap-2 mb-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          <Link href="/" className="hover:text-blue-600 transition-colors">Ana Sayfa</Link>
          <span>/</span>
          {markaSlug && (
            <>
              <Link href={`/marka/${markaSlug}`} className="hover:text-blue-600 transition-colors">{markaAdi}</Link>
              <span>/</span>
            </>
          )}
          <span className="text-slate-900 truncate max-w-[150px] md:max-w-[300px]">{kampanya.baslik}</span>
        </nav>

        {/* YENİ: Akıllı Geri Dönüş Butonu */}
        <Link href={geriLink} className="inline-flex items-center gap-3 mb-10 group no-underline">
          <div className="w-8 h-8 bg-slate-50 text-slate-600 rounded-full flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm border border-slate-200">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-blue-600 transition-colors">
            {geriMetin}
          </span>
        </Link>

        {/* ANA KAMPANYA KARTI */}
        <div className="bg-[#0D0F14] rounded-[3.5rem] overflow-hidden shadow-2xl relative border border-white/5">
          {gun !== null && (
            <div className={`absolute top-0 right-10 px-6 py-4 rounded-b-3xl flex flex-col items-center shadow-lg z-20 ${gecmis ? 'bg-red-600' : (sonSans ? 'bg-orange-500 animate-pulse' : 'bg-blue-600')}`}>
              <span className="text-white font-black text-3xl leading-none" style={{ fontFamily: 'Outfit' }}>{gun}</span>
              <span className="text-[8px] font-black text-white/80 uppercase mt-1">
                {gecmis ? 'SÜRE DOLDU' : (sonSans ? 'SON ŞANS!' : 'GÜN KALDI')}
              </span>
            </div>
          )}

          {gecmis && (
            <div className="absolute top-0 left-0 right-0 bg-red-600/90 backdrop-blur-sm text-white text-center py-3 font-bold text-sm z-30 flex items-center justify-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              <span>Bu kampanya süresi doldu! Yeni fırsatlar için <b>{markaAdi}</b> sayfasına dönün.</span>
            </div>
          )}

          <div className="p-8 md:p-14">
            <div className="inline-flex items-center gap-3 bg-white pl-2 pr-5 py-2 rounded-full mb-8">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center p-1.5 border border-slate-200">
                {markaBilgisi?.logo_url ? (
                  <Image 
                    src={markaBilgisi.logo_url} 
                    width={64} height={64}
                    className="w-full h-full object-contain" 
                    alt={markaAdi} 
                  />
                ) : (
                  <span className="text-black font-black text-xs">{markaAdi.charAt(0)}</span>
                )}
              </div>
              <span className="text-black font-black tracking-tight uppercase text-sm" style={{ fontFamily: 'Outfit' }}>
                {markaAdi}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-tight mb-8" style={{ fontFamily: 'Outfit' }}>
              {kampanya.baslik}
            </h1>

            <div 
              className="prose prose-invert max-w-none mb-10 text-slate-300 leading-relaxed font-medium whitespace-pre-wrap [&>div]:whitespace-normal"
              dangerouslySetInnerHTML={{ __html: kampanya.detay || "<p>Detay bulunamadı.</p>" }}
            />

            {/* OY SİSTEMİ */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h4 className="font-black text-white text-xs uppercase tracking-widest">Bu kampanya işine yaradı mı?</h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">
                  {oyVerildi ? "Teşekkürler, oy verdiğin için!" : "Sana yardımcı olduysa oyla!"}
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
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12"></path><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path></svg>
                  {kampanya.ise_yaradi_count || 0}
                </button>
                <button 
                  onClick={() => oyVer('hatali_count', 'hatali')}
                  disabled={!!oyVerildi}
                  className={`px-6 py-3 rounded-2xl font-black text-xs transition-all flex items-center gap-2 ${oyVerildi === 'hatali' ? 'bg-red-600 text-white opacity-80' : 'bg-white/10 hover:bg-red-600 text-white'}`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 14V2"></path><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z"></path></svg>
                  {kampanya.hatali_count || 0}
                </button>
              </div>
            </div>

            {/* MASAÜSTÜ CTA BUTONLARI */}
            <div className="hidden md:flex flex-row gap-4 mt-8">
              {disLink ? (
                <a 
                  href={disLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex-1 py-6 bg-white hover:bg-blue-600 hover:text-white text-black text-xl font-black rounded-[2rem] flex items-center justify-center gap-2 transition-all shadow-xl no-underline group"
                >
                  <span>MARKANIN SAYFASINA GİT</span>
                  <span className="text-sm opacity-50 group-hover:translate-x-1 transition-transform">↗</span>
                </a>
              ) : (
                <div className="flex-1 py-6 bg-white/10 text-white/40 text-sm font-bold rounded-[2rem] flex items-center justify-center uppercase tracking-widest cursor-not-allowed border border-white/5">
                  LİNK MEVCUT DEĞİL
                </div>
              )}
              <button 
                onClick={shareWhatsApp} 
                className="px-8 py-6 bg-white/5 hover:bg-green-600 text-white rounded-[2rem] font-bold text-sm transition-all flex items-center justify-center gap-2"
              >
                <span>WhatsApp'ta Paylaş</span>
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
        {/* REKLAM ALANI */}
        {reklamlar && reklamlar.length > 0 && (
          <div className="mt-12 mb-4">
            <ReklamAlani reklamlar={reklamlar} maxCount={2} />
          </div>
        )}
        {/* BENZER KAMPANYALAR */}
        {benzerler.length > 0 && (
          <div className="mt-16 mb-8">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.3em] ml-2 mb-6">İlgini Çekebilecek Diğer Fırsatlar</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {benzerler.map((bk) => (
                <Link key={bk.id} href={`/kampanya/${bk.slug}`} className="group bg-slate-50 border border-slate-100 p-6 rounded-[2.5rem] hover:bg-white hover:shadow-xl transition-all no-underline">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-1.5 mb-4 border border-slate-200">
                    {bk.yapan_marka_bilgisi?.logo_url ? (
                      <Image 
                        src={bk.yapan_marka_bilgisi.logo_url} 
                        width={64} height={64}
                        className="w-full h-full object-contain" 
                        alt={bk.yapan_marka_bilgisi?.marka_adi || 'Marka'} 
                      />
                    ) : (
                      <span className="text-black font-black text-xs">{bk.yapan_marka_bilgisi?.marka_adi?.charAt(0) || '?'}</span>
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

        {/* SSS */}
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
                Aşağıdaki butonla markanın resmi sayfasına giderek katılım sağlayabilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* YENİ: MOBİL İÇİN YAPIŞKAN CTA BUTONU (Sticky Bottom CTA) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-slate-100 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-50 flex gap-2">
         {disLink ? (
            <a 
              href={disLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex-1 py-4 bg-[#0D0F14] text-white text-sm font-black rounded-[1.5rem] flex items-center justify-center gap-2 shadow-xl no-underline"
            >
              <span>MAĞAZAYA GİT</span>
              <span>↗</span>
            </a>
          ) : (
            <div className="flex-1 py-4 bg-slate-200 text-slate-400 text-xs font-bold rounded-[1.5rem] flex items-center justify-center uppercase tracking-widest cursor-not-allowed">
              LİNK YOK
            </div>
          )}
          <button 
            onClick={shareWhatsApp} 
            className="w-14 h-14 bg-green-500 text-white rounded-[1.5rem] flex items-center justify-center shadow-lg"
            aria-label="WhatsApp'ta Paylaş"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
          </button>
      </div>

    </main>
  );
}