import { supabase } from '@/lib/supabase';

// Statik cache'i tamamen kapatıyoruz ki her saniye güncel olsun
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function sitemap() {
  const baseUrl = 'https://bikodvardi.com';

  try {
    // 1. KAMPANYALARI ÇEK
    // Not: Tablo adının 'kampanya' olduğundan emin ol (Admin panelinde öyleydi)
    const { data: kampanyalar } = await supabase
      .from('kampanya')
      .select('slug, created_at');

    const kampanyaUrls = kampanyalar?.map((k) => ({
      url: `${baseUrl}/kampanya/${k.slug}`,
      lastModified: k.created_at ? new Date(k.created_at) : new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    })) || [];

    // 2. SEKTÖRLERİ ÇEK
    const { data: sektorler } = await supabase.from('sektor').select('slug');
    const sektorUrls = sektorler?.map((s) => ({
      url: `${baseUrl}/sektor/${s.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })) || [];

    // 3. MARKALARI ÇEK
    const { data: markalar } = await supabase.from('marka').select('slug');
    const markaUrls = markalar?.map((m) => ({
      url: `${baseUrl}/marka/${m.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })) || [];

    // 4. ANA SAYFA VE TÜM LİNKLERİ BİRLEŞTİR
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
  } catch (error) {
    console.error('Sitemap üretilirken hata oluştu:', error);
    // Hata durumunda en azından ana sayfayı döndür ki sitemap tamamen kırılmasın
    return [{ url: baseUrl, lastModified: new Date() }];
  }
}