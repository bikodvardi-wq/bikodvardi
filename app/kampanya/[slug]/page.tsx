import { supabase } from '@/lib/supabase';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import KampanyaIcerik from './KampanyaIcerik';

// 🚀 SEO: Google botu ve Sosyal Medya için Gelişmiş Metadata Motoru
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params; // 🔑 Kritik: Params'ı bekle (await)
  
  // SEO için açıklama (aciklama) verisini de çekiyoruz
  const { data: kampanya } = await supabase
    .from('kampanya')
    .select('baslik, aciklama, slug, yapan_marka(marka_adi)')
    .eq('slug', resolvedParams.slug)
    .single();

  if (!kampanya) return { title: 'Kampanya Bulunamadı | biKodVardı' };

  const marka = (kampanya.yapan_marka as any)?.marka_adi || 'Fırsat';
  
  // Google'ın en sevdiği başlık formatı (Tıklanma oranını artırır)
  const title = `${marka} İndirim Kodu ve Kampanyası: ${kampanya.baslik} | biKodVardı`;
  
  // Açıklamayı veritabanından alıp Google standartlarına göre (maks 150-160 karakter) ayarlıyoruz
  let rawDescription = kampanya.aciklama || `${marka} markasına ait en güncel "${kampanya.baslik}" fırsatını kaçırma. Ücretsiz indirim kodları ve kampanyalar biKodVardı'da!`;
  
  // Varsa HTML etiketlerini (<p>, <br> vs.) temizler ki Google arama sonuçlarında kod görünmesin
  let cleanDescription = rawDescription.replace(/<[^>]*>?/gm, '');
  const description = cleanDescription.length > 155 ? cleanDescription.substring(0, 152) + '...' : cleanDescription;

  return {
    title,
    description,
    // Google'ın sayfayı neyle eşleştireceğini anlatan dinamik anahtar kelimeler
    keywords: [marka, `${marka} indirim kodu`, `${marka} kampanya`, 'indirim kodu', 'promosyon kodu', 'bikodvardı', kampanya.baslik],
    
    // WhatsApp, Twitter, Telegram'da link paylaşılınca çıkacak şık önizleme kartları
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
    // Google'a "Bu sayfanın orijinal adresi budur, kopya içerik muamelesi yapma" diyoruz
    alternates: {
      canonical: `https://bikodvardi.com/kampanya/${kampanya.slug}`,
    }
  };
}

// Sayfa içeriğini sunucuda hazırlayan ana fonksiyon
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params; // 🔑 Kritik: Burayı da bekle (await)

  const { data: kampanya, error } = await supabase
    .from('kampanya')
    .select(`*, yapan_marka_bilgisi:yapan_marka ( marka_adi, logo_url ), tur_bilgisi:kampanya_turu ( tur_adi )`)
    .eq('slug', resolvedParams.slug)
    .single();

  // Eğer veri yoksa veya hata varsa 404 sayfasına yönlendir
  if (error || !kampanya) {
    notFound();
  }

  // Benzerleri çek
  const { data: benzerler } = await supabase
    .from('kampanya')
    .select('id, baslik, slug, yapan_marka_bilgisi:yapan_marka(logo_url, marka_adi)')
    .eq('kampanya_turu', kampanya.kampanya_turu)
    .neq('id', kampanya.id)
    .limit(3);

  return <KampanyaIcerik kampanya={kampanya} benzerler={benzerler || []} />;
}