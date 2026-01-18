import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function sitemap() {
  const baseUrl = 'https://bikodvardi.com';

  // TEST: Supabase'den veri geliyor mu?
  const { data: kampanyalar, error } = await supabase
    .from('kampanya')
    .select('slug, created_at');

  // Eğer hata varsa terminale basar (Vercel loglarında veya localhost terminalinde görürsün)
  if (error) {
    console.error("SUPABASE HATASI:", error.message);
    return [{ url: baseUrl }];
  }

  // Veri boş geliyorsa bunu logla
  if (!kampanyalar || kampanyalar.length === 0) {
    console.warn("KAMPANYA TABLOSU BOŞ VEYA ERİŞİLEMİYOR");
    return [{ url: baseUrl }];
  }

  const kampanyaUrls = kampanyalar.map((k) => ({
    url: `${baseUrl}/kampanya/${k.slug}`,
    lastModified: k.created_at ? new Date(k.created_at) : new Date(),
    changeFrequency: 'daily' as const,
    priority: 1.0,
  }));

  // Diğer (Marka/Sektör) çekme işlemlerini de buraya ekleyebilirsin...
  
  return [
    { url: baseUrl, lastModified: new Date() },
    ...kampanyaUrls
  ];
}