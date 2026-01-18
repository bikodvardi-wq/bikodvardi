import { supabase } from '@/lib/supabase';

// Önbelleği (cache) tamamen devre dışı bırakıyoruz. Her girişte canlı veri çeker.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function sitemap() {
  const baseUrl = 'https://bikodvardi.com';

  try {
    // 1. VERİLERİ ÇEK (Hata payını sıfırlamak için try-catch içinde)
    const [kampanyalarRes, sektorlerRes, markalarRes] = await Promise.all([
      supabase.from('kampanya').select('slug, created_at'),
      supabase.from('sektor').select('slug'),
      supabase.from('marka').select('slug')
    ]);

    // 2. KAMPANYA LİNKLERİNİ OLUŞTUR (Filtreleme ekledik)
    const kampanyaUrls = (kampanyalarRes.data || [])
      .filter(k => k.slug) // Sadece slug'ı olanları al
      .map((k) => ({
        url: `${baseUrl}/kampanya/${k.slug}`,
        lastModified: k.created_at ? new Date(k.created_at) : new Date(),
        changeFrequency: 'daily' as const,
        priority: 1.0,
      }));

    // 3. SEKTÖR LİNKLERİNİ OLUŞTUR
    const sektorUrls = (sektorlerRes.data || [])
      .filter(s => s.slug)
      .map((s) => ({
        url: `${baseUrl}/sektor/${s.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));

    // 4. MARKA LİNKLERİNİ OLUŞTUR
    const markaUrls = (markalarRes.data || [])
      .filter(m => m.slug)
      .map((m) => ({
        url: `${baseUrl}/marka/${m.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));

    // 5. TÜMÜNÜ BİRLEŞTİR VE DÖNDÜR
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
    console.error('Sitemap hatası:', error);
    // Hata olursa sitemap tamamen çökmesin, en azından ana sayfayı döndürsün
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
      }
    ];
  }
}