import { supabase } from '@/lib/supabase';

// Bu satır sayesinde sitemap her zaman en güncel veriyi çeker, bayatlamaz.
export const revalidate = 0; 

export default async function sitemap() {
  const baseUrl = 'https://bikodvardi.com';

  // --- 1. KAMPANYALARI ÇEK (Google'ın asıl görmesi gereken yer) ---
  const { data: kampanyalar } = await supabase
    .from('kampanya')
    .select('slug, created_at')
    .order('created_at', { ascending: false });

  const kampanyaUrls = kampanyalar?.map((k) => ({
    url: `${baseUrl}/kampanya/${k.slug}`,
    lastModified: k.created_at ? new Date(k.created_at) : new Date(),
    changeFrequency: 'daily', // Kampanyalar her gün kontrol edilsin
    priority: 1.0,           // En yüksek öncelik
  })) || [];

  // --- 2. SEKTÖRLERİ ÇEK ---
  const { data: sektorler } = await supabase.from('sektor').select('slug');
  const sektorUrls = sektorler?.map((s) => ({
    url: `${baseUrl}/sektor/${s.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  })) || [];

  // --- 3. MARKALARI ÇEK ---
  const { data: markalar } = await supabase.from('marka').select('slug');
  const markaUrls = markalar?.map((m) => ({
    url: `${baseUrl}/marka/${m.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  })) || [];

  // --- 4. TÜM LİNKLERİ BİRLEŞTİR VE GOOGLE'A SUN ---
  return [
    { 
      url: baseUrl, 
      lastModified: new Date(), 
      changeFrequency: 'always', 
      priority: 1.0 
    },
    ...kampanyaUrls,
    ...sektorUrls,
    ...markaUrls,
  ];
}