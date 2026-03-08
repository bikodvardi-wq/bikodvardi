import { supabase } from '@/lib/supabase';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import KampanyaIcerik from './KampanyaIcerik';

// 🚀 SEO: Garantili Versiyon + Çöp Sayfa (NoIndex) Engelleyici
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  
  // 🔥 DEĞİŞİKLİK 1: Tarih kontrolü için 'bitis_date' bilgisini de çekiyoruz
  const { data: kampanya } = await supabase
    .from('kampanya')
    .select('baslik, aciklama, slug, bitis_date, yapan_marka(marka_adi)')
    .eq('slug', resolvedParams.slug)
    .single();

  if (!kampanya) return { title: 'Kampanya Bulunamadı | biKodVardı' };

  const marka = (kampanya.yapan_marka as any)?.marka_adi || 'Fırsat';
  
  // 🔥 DEĞİŞİKLİK 2: Kampanyanın süresi geçmiş mi kontrol ediyoruz
  const bugun = new Date().toISOString().split('T')[0];
  const isExpired = kampanya.bitis_date && kampanya.bitis_date < bugun;

  const title = `${marka} İndirim Kodu ve Kampanyası: ${kampanya.baslik} | biKodVardı`;
  
  let rawDescription = kampanya.aciklama || `${marka} markasına ait en güncel "${kampanya.baslik}" fırsatını kaçırma. Ücretsiz indirim kodları ve kampanyalar biKodVardı'da!`;
  let cleanDescription = rawDescription.replace(/<[^>]*>?/gm, '');
  const description = cleanDescription.length > 155 ? cleanDescription.substring(0, 152) + '...' : cleanDescription;

  return {
    title,
    description,
    keywords: [marka, `${marka} indirim kodu`, `${marka} kampanya`, 'indirim kodu', 'promosyon kodu', 'bikodvardı', kampanya.baslik],
    
    openGraph: {
      title,
      description,
      url: `https://bikodvardi.com/kampanya/${kampanya.slug}`,
      siteName: 'biKodVardı',
      locale: 'tr_TR',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `https://bikodvardi.com/kampanya/${kampanya.slug}`,
    },
    // 🔥 DEĞİŞİKLİK 3: Süresi geçmişse Google'a "Beni Dizine Ekleme (noindex)" diyoruz!
    robots: {
      index: !isExpired, // Aktifse true (ekle), süresi dolmuşsa false (ekleme)
      follow: true,      // Sitedeki diğer linkleri gezmeye devam et
    }
  };
}

// Sayfa içeriğini sunucuda hazırlayan ana fonksiyon
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params; 

  const { data: kampanya, error } = await supabase
    .from('kampanya')
    .select(`*, yapan_marka_bilgisi:yapan_marka ( marka_adi, logo_url ), tur_bilgisi:kampanya_turu ( tur_adi )`)
    .eq('slug', resolvedParams.slug)
    .single();

  if (error || !kampanya) {
    notFound();
  }

  const { data: benzerler } = await supabase
    .from('kampanya')
    .select('id, baslik, slug, yapan_marka_bilgisi:yapan_marka(logo_url, marka_adi)')
    .eq('kampanya_turu', kampanya.kampanya_turu)
    .neq('id', kampanya.id)
    .limit(3);

  return <KampanyaIcerik kampanya={kampanya} benzerler={benzerler || []} />;
}