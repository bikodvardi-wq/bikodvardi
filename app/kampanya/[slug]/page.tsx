import { supabase } from '@/lib/supabase';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import KampanyaIcerik from './KampanyaIcerik';

// 🚀 SEO: Google botu ve Sosyal Medya için Gelişmiş Metadata Motoru (Güvenli Versiyon)
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  
  const { data: kampanya } = await supabase
    .from('kampanya')
    .select('baslik, aciklama, slug, yapan_marka(marka_adi, logo_url)')
    .eq('slug', resolvedParams.slug)
    .single();

  if (!kampanya) return { title: 'Kampanya Bulunamadı | biKodVardı' };

  const marka = (kampanya.yapan_marka as any)?.marka_adi || 'Fırsat';
  const logoUrl = (kampanya.yapan_marka as any)?.logo_url;
  
  const title = `${marka} İndirim Kodu ve Kampanyası: ${kampanya.baslik} | biKodVardı`;
  
  let rawDescription = kampanya.aciklama || `${marka} markasına ait en güncel "${kampanya.baslik}" fırsatını kaçırma. Ücretsiz indirim kodları ve kampanyalar biKodVardı'da!`;
  let cleanDescription = rawDescription.replace(/<[^>]*>?/gm, '');
  const description = cleanDescription.length > 155 ? cleanDescription.substring(0, 152) + '...' : cleanDescription;

  // Güvenli Resim Kontrolü: Sadece gerçek bir http linki varsa resmi ekle
  const ogImages = (logoUrl && logoUrl.startsWith('http')) ? [{
    url: logoUrl,
    width: 800,
    height: 600,
    alt: `${marka} İndirim Kodu`,
  }] : [];

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
      // Resim varsa ekler, yoksa WhatsApp'ı bozmamak için boş geçer
      ...(ogImages.length > 0 && { images: ogImages }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(ogImages.length > 0 && { images: [logoUrl] }),
    },
    alternates: {
      canonical: `https://bikodvardi.com/kampanya/${kampanya.slug}`,
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