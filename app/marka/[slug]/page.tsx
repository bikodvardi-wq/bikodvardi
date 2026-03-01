import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';

// ISR: Her 1 saatte bir yenile (kampanyalar güncel kalsın)
export const revalidate = 3600; 

export async function generateStaticParams() {
  const { data: markalar, error } = await supabase
    .from('marka')
    .select('slug')
    .neq('slug', null);

  if (error) {
    console.error('generateStaticParams hatası:', error);
    return [];
  }

  return markalar?.map((m) => ({ slug: m.slug })) || [];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  const { data: marka } = await supabase
    .from('marka')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!marka) {
    return {
      title: 'Marka Bulunamadı | biKodVardı',
      description: 'Aradığınız marka sayfası bulunamadı.',
    };
  }

  const yil = new Date().getFullYear();
  const descriptionText =
    marka.aciklama ||
    `${marka.marka_adi} mağazasında geçerli güncel indirim kuponları, hediye çekleri ve aktif kampanyalar. ${marka.marka_adi} alışverişini ucuza getir!`;

  return {
    title: `${marka.marka_adi} İndirim Kodu ve Kampanyaları - ${yil}`,
    description: descriptionText,
    openGraph: {
      title: `${marka.marka_adi} İndirim Kodları ${yil}`,
      description: descriptionText,
      url: `https://bikodvardi.com/marka/${slug}`,
      type: 'website',
    },
  };
}

const kalanGunHesapla = (tarihVerisi: string | null) => {
  if (!tarihVerisi) return null;
  const hedefTarih = new Date(tarihVerisi);
  if (isNaN(hedefTarih.getTime())) return null;
  const fark = hedefTarih.getTime() - new Date().getTime();
  const gun = Math.ceil(fark / (1000 * 3600 * 24));
  return gun >= 0 ? gun : null;
};

export default async function MarkaDetay({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const { data: marka } = await supabase
    .from('marka')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!marka) {
    notFound();
  }

  const now = new Date().toISOString();

  const { data: kampanyalar, error } = await supabase
    .from('kampanya')
    .select(`
      *,
      yapan_marka_bilgisi:yapan_marka ( marka_adi, logo_url ),
      tur_bilgisi:kampanya_turu ( tur_adi ) 
    `)
    .or(`fayd_marka.eq.${marka.id},gecerli_sektor_id.eq.${marka.sektor_id}`)
    .or(`bitis_date.gt.${now},bitis_date.is.null`)
    .order('id', { ascending: false });

  if (error) {
    console.error('Kampanya çekme hatası:', error);
  }

  const kampanyaListesi = kampanyalar || [];

  return (
    <main className="min-h-screen bg-[#F0F4F8] font-['Plus_Jakarta_Sans'] pb-24 text-left">
      <link
        href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;600;900&family=Plus+Jakarta+Sans:wght@400;500;700;800&display=swap"
        rel="stylesheet"
      />

      {/* ÜST HEADER ALANI */}
      <div className="bg-white border-b border-slate-200 pt-6 pb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-[0.02] pointer-events-none text-[180px] font-black tracking-tighter leading-none select-none uppercase">
          {marka.marka_adi ? marka.marka_adi[0] : 'B'}
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* SEO Breadcrumb */}
          <nav className="flex items-center gap-2 mb-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <Link href="/" className="hover:text-blue-600 transition-colors">Ana Sayfa</Link>
            <span>/</span>
            <span className="text-slate-900">{marka.marka_adi} Mağazası</span>
          </nav>

          <div className="flex justify-between items-start mb-8">
            <Link
              href="/"
              className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors group bg-transparent border-none cursor-pointer p-0 no-underline"
            >
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
              </div>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] leading-none">GERİ DÖN</span>
            </Link>

            {marka.web_site_url && (
              <a
                href={marka.web_site_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-slate-900 text-white px-5 py-2.5 rounded-2xl hover:bg-blue-600 transition-all shadow-lg group no-underline"
              >
                <span className="text-[10px] font-black uppercase tracking-widest">Mağazaya Git</span>
                <svg className="group-hover:translate-x-1 transition-transform" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <line x1="7" y1="17" x2="17" y2="7" />
                  <polyline points="7 7 17 7 17 17" />
                </svg>
              </a>
            )}
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-20 h-20 bg-white text-[#0F172A] rounded-[1.8rem] shadow-xl flex items-center justify-center p-3 border border-slate-100 ring-4 ring-slate-50 overflow-hidden">
              {marka.logo_url ? (
                <img src={marka.logo_url} className="max-h-full object-contain" alt={`${marka.marka_adi} indirim kodu`} />
              ) : (
                <span className="text-3xl font-black text-slate-900">{marka.marka_adi?.charAt(0)}</span>
              )}
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-[900] text-slate-900 tracking-tighter mb-2" style={{ fontFamily: 'Outfit' }}>
                {marka.marka_adi} İndirim Kodları
              </h1>
              <div className="inline-flex items-center gap-2.5 bg-blue-600 text-white px-4 py-1.5 rounded-xl shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                <p className="font-black text-[10px] uppercase tracking-widest leading-none">
                  {kampanyaListesi.length} AKTİF FIRSAT LİSTELENİYOR
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* İÇERİK ALANI */}
      <div className="max-w-5xl mx-auto px-6 mt-10">
        <div className="space-y-6">
          {kampanyaListesi.map((k) => {
            const gun = kalanGunHesapla(k.bitis_date);
            const markaBilgisi = Array.isArray(k.yapan_marka_bilgisi) ? k.yapan_marka_bilgisi[0] : k.yapan_marka_bilgisi;
            const yapanMarkaAdi = markaBilgisi?.marka_adi || 'FIRSAT';
            const yapanMarkaLogo = markaBilgisi?.logo_url;
            const turBilgisi = Array.isArray(k.tur_bilgisi) ? k.tur_bilgisi[0] : k.tur_bilgisi;
            const turAdi = turBilgisi?.tur_adi || (k.kampanya_turu || 'Kampanya');

            return (
              <div
                key={k.id}
                className="group bg-[#0F172A] rounded-[2.5rem] border border-slate-800 shadow-xl overflow-hidden flex flex-col lg:flex-row transition-all hover:shadow-2xl relative"
              >
                {gun !== null && (
                  <div className="absolute top-0 right-8 bg-blue-600 px-3 py-3 rounded-b-xl shadow-lg z-20 flex flex-col items-center min-w-[50px]">
                    <span className="text-white font-black text-lg leading-none" style={{ fontFamily: 'Outfit' }}>{gun}</span>
                    <span className="text-[7px] font-black text-white/80 uppercase mt-0.5">GÜN</span>
                  </div>
                )}

                <div className="p-8 md:p-10 flex-1 relative overflow-hidden text-left">
                  <div className="absolute -right-4 -bottom-10 text-[120px] font-black text-white/[0.02] select-none uppercase pointer-events-none">
                    {yapanMarkaAdi ? yapanMarkaAdi[0] : 'K'}
                  </div>

                  <div className="inline-flex items-center gap-2.5 bg-white px-2 py-1.5 rounded-xl mb-6 shadow-lg">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center p-1.5 text-[#0F172A] font-black text-xs">
                      {yapanMarkaLogo ? (
                        <img src={yapanMarkaLogo} className="w-full h-full object-contain" alt={yapanMarkaAdi} />
                      ) : (
                        yapanMarkaAdi ? yapanMarkaAdi[0] : 'F'
                      )}
                    </div>
                    <span className="text-[#0F172A] font-black tracking-tight uppercase text-xs pr-3" style={{ fontFamily: 'Outfit' }}>
                      {yapanMarkaAdi}
                    </span>
                  </div>

                  <h3 className="text-2xl md:text-3xl font-[800] text-white leading-[1.2] mb-6 tracking-tight relative z-10" style={{ fontFamily: 'Outfit' }}>
                    {k.baslik}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-white/5 relative z-10">
                    <span className="bg-blue-600 text-white text-[9px] font-black px-3 py-1 rounded-md uppercase tracking-wider">
                      {turAdi}
                    </span>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-none">
                      {marka.marka_adi} Özel Teklifi
                    </p>
                  </div>
                </div>

                <div className="bg-[#1e293b]/30 lg:w-64 border-t lg:border-t-0 lg:border-l border-slate-800 p-8 flex flex-col items-center justify-center gap-3">
                  {marka.affiliate_link && (
                    <a
                      href={marka.affiliate_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-orange-500 text-white py-4 rounded-[1.8rem] font-black text-[10px] uppercase tracking-[0.15em] shadow-xl hover:bg-orange-600 transition-all text-center no-underline animate-pulse"
                    >
                      MAĞAZAYA GİT
                    </a>
                  )}

                  <Link
                    href={`/kampanya/${k.slug}`}
                    className="w-full bg-white text-[#0F172A] py-4 rounded-[1.8rem] font-black text-[10px] uppercase tracking-[0.15em] shadow-xl hover:bg-blue-600 hover:text-white transition-all text-center no-underline"
                  >
                    KUPONU GÖR
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* SEO REHBER ALANI (Orijinal tasarım diliyle entegre edildi) */}
        <section className="mt-16 bg-white rounded-[3rem] p-10 md:p-16 shadow-sm border border-slate-100">
          <h2 className="text-3xl font-[900] text-slate-900 mb-8 tracking-tighter" style={{ fontFamily: 'Outfit' }}>
            {marka.marka_adi} Alışveriş Rehberi
          </h2>
          <div className="grid md:grid-cols-2 gap-10">
            <div className="prose prose-slate text-slate-600 font-medium leading-relaxed">
              <p className="mb-4">
                En güncel <strong>{marka.marka_adi} indirim kodu</strong> ve kampanya seçeneklerini kullanarak alışverişinizi çok daha uygun fiyatlara tamamlayabilirsiniz. biKodVardı olarak her gün en yeni fırsatları sizin için doğruluyoruz.
              </p>
              <p>
                Mağaza sayfasında geçerli aktif kuponları görüntülemek için yukarıdaki listeyi inceleyebilir, size en uygun fırsatı anında kullanabilirsiniz.
              </p>
            </div>
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
              <h4 className="text-[11px] font-[900] text-blue-600 uppercase tracking-[0.2em] mb-4">Nasıl Kullanılır?</h4>
              <ul className="space-y-3">
                {['Kuponu görüntüle butonuna tıkla', 'Açılan kodu kopyala', 'Ödeme sayfasında ilgili alana yapıştır'].map((step, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-700">
                    <span className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center text-[10px] text-blue-600">{i+1}</span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* İÇ LİNKLEME (Tarama Botları İçin) */}
        <div className="mt-12 flex flex-wrap gap-2 justify-center">
          {['Trendyol', 'Hepsiburada', 'n11', 'Flo', 'Amazon'].map((m) => (
            <Link 
              key={m}
              href={`/marka/${m.toLowerCase()}`}
              className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm"
            >
              {m} FIRSATLARI
            </Link>
          ))}
        </div>

        {kampanyaListesi.length === 0 && (
          <div className="text-center py-16 bg-white rounded-[3rem] border border-slate-100 mt-8">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
              Aktif fırsat bulunamadı.
            </p>
          </div>
        )}
      </div>

      <footer className="mt-20 py-12 text-center opacity-40">
        <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.4em]">
          bi<span className="text-blue-600">kod</span>vardı — {new Date().getFullYear()}
        </p>
      </footer>
    </main>
  );
}