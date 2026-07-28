import { supabase } from '@/lib/supabase';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import KampanyaIcerik from './KampanyaIcerik';
import { getReklamlar } from '@/lib/reklam';
import ReklamAlani from '@/components/ReklamAlani';

// 🚀 SEO: Garantili Versiyon + Çöp Sayfa (NoIndex) Engelleyici
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const [reklamUst, reklamAlt] = await Promise.all([
  getReklamlar('kampanya_ust', 2),
  getReklamlar('kampanya_alt', 2),
  ]);
  const { data: kampanya } = await supabase
    .from('kampanya')
    .select('baslik, aciklama, slug, bitis_date, yapan_marka(marka_adi)')
    .eq('slug', resolvedParams.slug)
    .single();

  if (!kampanya) return { title: 'Kampanya Bulunamadı | biKodVardı' };

  const marka = (kampanya.yapan_marka as any)?.marka_adi || 'Fırsat';
  
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
    robots: {
      index: !isExpired,
      follow: true, 
    }
  };
}

// Sayfa içeriğini sunucuda hazırlayan ana fonksiyon
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params; 

  // 🔥 DEĞİŞİKLİK 1: yapan_marka sorgusuna "slug" eklendi
  const { data: kampanya, error } = await supabase
    .from('kampanya')
    .select(`*, yapan_marka_bilgisi:yapan_marka ( slug, marka_adi, logo_url ), tur_bilgisi:kampanya_turu ( tur_adi )`)
    .eq('slug', resolvedParams.slug)
    .single();

  if (error || !kampanya) {
    notFound();
  }
  const [reklamUst, reklamAlt] = await Promise.all([
  getReklamlar('kampanya_ust', 2),
  getReklamlar('kampanya_alt', 2),
]);
  // 🔥 DEĞİŞİKLİK 2: benzerler sorgusuna "slug" eklendi
  const { data: benzerler } = await supabase
    .from('kampanya')
    .select('id, baslik, slug, yapan_marka_bilgisi:yapan_marka(slug, logo_url, marka_adi)')
    .eq('kampanya_turu', kampanya.kampanya_turu)
    .neq('id', kampanya.id)
    .limit(3);

  const marka = (kampanya.yapan_marka_bilgisi as any)?.marka_adi || 'Fırsat';

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": `${marka} İndirim Kodu: ${kampanya.baslik}`,
    "description": kampanya.aciklama || `${marka} markasına ait güncel indirim fırsatı.`,
    "offers": {
      "@type": "Offer",
      "name": kampanya.baslik,
      "priceCurrency": "TRY",
      "price": "0", 
      "validFrom": kampanya.created_at || new Date().toISOString(),
      "validThrough": kampanya.bitis_date ? `${kampanya.bitis_date}T23:59:59Z` : "2030-12-31T23:59:59Z",
      "seller": {
        "@type": "Organization",
        "name": marka
      }
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <KampanyaIcerik 
        kampanya={kampanya} 
        benzerler={benzerler || []} 
        reklamlar={reklamAlt || []}
        reklamUst={reklamUst || []}
/>    </> 
  );
}