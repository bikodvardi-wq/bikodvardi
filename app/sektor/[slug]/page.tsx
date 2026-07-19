import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { getReklam } from '@/lib/reklam';

// ISR: Her 1 saatte bir yenile
export const revalidate = 3600;

export async function generateStaticParams() {
  const { data: sektorler, error } = await supabase
    .from('sektor')
    .select('slug')
    .neq('slug', null);

  if (error) {
    console.error('generateStaticParams hatası:', error);
    return [];
  }

  return sektorler?.map((s) => ({ slug: s.slug })) || [];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  const { data: sektor } = await supabase
    .from('sektor')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!sektor) {
    return {
      title: 'Kategori Bulunamadı | biKodVardı',
      description: 'Aradığınız kategori sayfası bulunamadı.',
    };
  }

  const yil = new Date().getFullYear();
  const descriptionText = `${sektor.sektor_adi} kategorisindeki tüm markaların güncel indirim kodları ve kampanyaları ${yil}. En avantajlı fırsatları tek yerde bul.`;

  return {
    title: `${sektor.sektor_adi} İndirim Kodları ve Kampanyaları - ${yil}`,
    description: descriptionText,
    openGraph: {
      title: `${sektor.sektor_adi} İndirim Kodları`,
      description: descriptionText,
      url: `https://bikodvardi.com/sektor/${slug}`,
      type: 'website',
    },
  };
}

export default async function SektorDetay({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // 1. SEKTÖR BİLGİSİNİ ÇEK
  const { data: sektor } = await supabase
    .from('sektor')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!sektor) {
    notFound();
  }

  const now = new Date().toISOString();

  // 2. AKTİF KAMPANYALARI ÇEK (süresi dolmamış veya süresiz)
  const { data: kData } = await supabase
    .from('kampanya')
    .select('id, fayd_marka, gecerli_sektor_id, kampanya_turu, bitis_date')
    .or(`bitis_date.gt.${now},bitis_date.is.null`);

  // 3. MARKALARI ÇEK
  const { data: mData } = await supabase
    .from('marka')
    .select('id, marka_adi, slug, logo_url, sektor_id, ek_sektor_idler')
    .or(`sektor_id.eq.${sektor.id},ek_sektor_idler.cs.{${sektor.id}}`);

  const [reklamUst, reklamAlt] = await Promise.all([
    getReklam('sektor_ust'),
    getReklam('sektor_alt'),
  ]);

  const kampanyaListesi = kData || [];
  const markaListesi = mData || [];

  // Her marka için aktif kampanya sayısını hesapla
  const markalar = markaListesi.map(marka => {
    const markaKampanyalari = kampanyaListesi.filter(k =>
      String(k.fayd_marka) === String(marka.id) ||
      (String(k.gecerli_sektor_id) === String(sektor.id) && !k.fayd_marka)
    );
    return { ...marka, kampanyaSayisi: markaKampanyalari.length };
  }).sort((a, b) => b.kampanyaSayisi - a.kampanyaSayisi);

  // Toplam aktif kod sayısı (benzersiz)
  const benzersizAktifKodlar = new Set();
  kampanyaListesi.forEach(k => {
    if (String(k.gecerli_sektor_id) === String(sektor.id) ||
        markaListesi.some(m => String(k.fayd_marka) === String(m.id))) {
      benzersizAktifKodlar.add(k.id);
    }
  });
  const toplamAktifKod = benzersizAktifKodlar.size;

  return (
    <main className="min-h-screen bg-[#F0F4F8] font-['Plus_Jakarta_Sans'] text-left pb-20">

      {/* --- BANNER (GLASSMORPHISM) --- */}
      <div className="relative h-[35vh] md:h-[40vh] w-full flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${sektor.gorsel_url || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200"}')` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#F0F4F8] via-transparent to-black/5"></div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6">
          <div className="inline-block p-6 md:p-10 bg-white/70 backdrop-blur-2xl border border-white/40 rounded-[2.5rem] shadow-2xl shadow-blue-900/5 max-w-sm">
            <Link href="/" className="flex items-center gap-1 text-blue-600 text-[9px] font-black uppercase tracking-[0.3em] mb-3 no-underline hover:underline w-fit">
              ← GERİ DÖN
            </Link>
            <h1 className="text-3xl md:text-4xl font-[900] text-slate-900 tracking-tighter leading-tight" style={{ fontFamily: 'Outfit' }}>
              {sektor.sektor_adi} <br/>
              <span className="text-blue-600 italic font-light tracking-normal">Kodları</span>
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-6 relative z-20">

        {/* --- SAYAÇ MODÜLÜ (sadece aktif kodlar) --- */}
        <div className="flex flex-wrap gap-6 mb-8 bg-white/80 backdrop-blur-md p-5 rounded-[2rem] border border-white shadow-xl items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                <line x1="7" y1="7" x2="7.01" y2="7"></line>
              </svg>
            </div>
            <div>
              <p className="text-lg font-[900] text-slate-900 leading-none" style={{ fontFamily: 'Outfit' }}>
                {toplamAktifKod}
              </p>
              <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5 tracking-widest">AKTİF KOD</p>
            </div>
          </div>
          <div className="h-6 w-[1px] bg-slate-200 hidden md:block"></div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#0F172A] text-white rounded-xl flex items-center justify-center shadow-lg">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div>
              <p className="text-lg font-[900] text-slate-900 leading-none" style={{ fontFamily: 'Outfit' }}>
                {markalar.length}
              </p>
              <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5 tracking-widest">MARKA</p>
            </div>
          </div>
        </div>

        {/* --- REKLAM ALANI 1 (ÜST) --- */}
        {reklamUst ? (
          <a
            href={reklamUst.link_url}
            target="_blank"
            rel="sponsored noopener noreferrer"
            className="relative w-full h-24 rounded-3xl mb-8 overflow-hidden block shadow-lg bg-slate-900"
          >
            <Image src={reklamUst.gorsel_url} alt={reklamUst.baslik} fill sizes="100vw" className="object-contain" />
          </a>
        ) : (
          <div className="w-full h-24 bg-white/50 border border-slate-200 border-dashed rounded-3xl mb-8 flex items-center justify-center text-slate-300 text-[10px] font-bold uppercase tracking-[0.5em]">
            REKLAM ALANI
          </div>
        )}

        {/* --- MARKA KARTLARI (sadece aktif kod sayısı gösteriliyor) --- */}
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
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                        {marka.kampanyaSayisi} KOD AKTİF
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800 mt-auto relative z-10">
                <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.15em]">KODLARI GÖR</span>
                <div className="w-8 h-8 bg-blue-600/10 text-blue-500 rounded-lg flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:rotate-12">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* --- REKLAM ALANI 2 (ALT - BÜYÜK) --- */}
        {reklamAlt ? (
          <a
            href={reklamAlt.link_url}
            target="_blank"
            rel="sponsored noopener noreferrer"
            className="relative w-full h-48 rounded-[3rem] mt-16 overflow-hidden block shadow-xl bg-slate-900"
          >
            <Image src={reklamAlt.gorsel_url} alt={reklamAlt.baslik} fill sizes="100vw" className="object-contain" />
          </a>
        ) : (
          <div className="w-full h-48 bg-white/50 border border-slate-200 border-dashed rounded-[3rem] mt-16 flex items-center justify-center text-slate-300 text-[10px] font-bold uppercase tracking-[0.5em]">
            SPONSORLU BAĞLANTI / REKLAM
          </div>
        )}

      </div>
    </main>
  );
}