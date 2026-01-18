import { supabase } from '@/lib/supabase';

export default async function sitemap() {
  const baseUrl = 'https://bikodvardi.com';

  // 1. Kampanyaları çek (En önemlisi bu!)
  const { data: kampanyalar } = await supabase
    .from('kampanya')
    .select('slug, created_at')
    .order('created_at', { ascending: false });

  const kampanyaUrls = kampanyalar?.map((k) => ({
    url: `${baseUrl}/kampanya/${k.slug}`,
    lastModified: k.created_at ? new Date(k.created_at) : new Date(),
    changeFrequency: 'daily',
    priority: 1.0, // Kampanyalar en öncelikli sayfalarımız
  })) || [];

  // 2. Sektörleri çek
  const { data: sektorler } = await supabase.from('sektor').select('slug');
  const sektorUrls = sektorler?.map((s) => ({
    url: `${baseUrl}/sektor/${s.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  })) || [];

  // 3. Markaları çek
  const { data: markalar } = await supabase.from('marka').select('slug');
  const markaUrls = markalar?.map((m) => ({
    url: `${baseUrl}/marka/${m.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  })) || [];

  return [
    { 
      url: baseUrl, 
      lastModified: new Date(), 
      changeFrequency: 'always', 
      priority: 1.0 
    },
    ...kampanyaUrls, // Kampanyalar eklendi!
    ...sektorUrls,
    ...markaUrls,
  ];
}