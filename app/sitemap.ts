import { supabase } from '@/lib/supabase';

// Statik cache'i devre dışı bırakıp her seferinde taze veri çekmesini zorluyoruz
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function sitemap() {
  const baseUrl = 'https://bikodvardi.com';

  try {
    // Tüm verileri paralel çekerek hızı artırıyoruz
    const [kampanyalarRes, sektorlerRes, markalarRes] = await Promise.all([
      supabase.from('kampanya').select('slug, created_at'),
      supabase.from('sektor').select('slug'),
      supabase.from('marka').select('slug')
    ]);

    // Kampanya URL'lerini oluştur
    const kampanyaUrls = (kampanyalarRes.data || []).map((k) => ({
      url: `${baseUrl}/kampanya/${k.slug}`,
      lastModified: k.created_at ? new Date(k.created_at) : new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    }));

    // Sektör URL'lerini oluştur
    const sektorUrls = (sektorlerRes.data || []).map((s) => ({
      url: `${baseUrl}/sektor/${s.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    // Marka URL'lerini oluştur
    const markaUrls = (markalarRes.data || []).map((m) => ({
      url: `${baseUrl}/marka/${m.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    // Tüm listeyi birleştir
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'always' as const,
        priority: 1.0,
      },
      ...kampanyaUrls,
      ...sektorUrls,
      ...markaUrls,
    ];
  } catch (err) {
    // Hata durumunda boş dönmemesi için en azından ana sayfayı ver
    return [{ url: baseUrl, lastModified: new Date() }];
  }
}