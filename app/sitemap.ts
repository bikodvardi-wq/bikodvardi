import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function sitemap() {
  const baseUrl = 'https://bikodvardi.com';

  try {
    // 🔥 YENİ: Bugünün tarihini alıyoruz ki süresi geçenleri eleyelim
    const now = new Date().toISOString();

    const [kampanyalarRes, sektorlerRes, markalarRes] = await Promise.all([
      // 🔥 DEĞİŞİKLİK BURADA: Sadece bitiş tarihi bugünden büyük olanları VEYA süresiz (null) olanları çekiyoruz
      supabase
        .from('kampanya')
        .select('slug, created_at')
        .or(`bitis_date.gt.${now},bitis_date.is.null`),
      
      supabase.from('sektor').select('slug'),
      supabase.from('marka').select('slug')
    ]);

    const kampanyaUrls = (kampanyalarRes.data || [])
      .filter(k => k.slug)
      .map((k) => ({
        url: `${baseUrl}/kampanya/${k.slug}`,
        lastModified: k.created_at ? new Date(k.created_at) : new Date(),
        changeFrequency: 'daily' as const,
        priority: 1.0,
      }));

    const sektorUrls = (sektorlerRes.data || [])
      .filter(s => s.slug)
      .map((s) => ({
        url: `${baseUrl}/sektor/${s.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));

    const markaUrls = (markalarRes.data || [])
      .filter(m => m.slug)
      .map((m) => ({
        url: `${baseUrl}/marka/${m.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));

    return [
      { url: baseUrl, lastModified: new Date(), changeFrequency: 'always', priority: 1.0 },
      ...kampanyaUrls,
      ...sektorUrls,
      ...markaUrls,
    ];
  } catch (error) {
    return [{ url: baseUrl, lastModified: new Date() }];
  }
}