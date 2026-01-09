import { supabase } from '@/lib/supabase';

export default async function sitemap() {
  const baseUrl = 'https://bikodvardi.com';

  // Sektörleri çek
  const { data: sektorler } = await supabase.from('sektor').select('slug');
  const sektorUrls = sektorler?.map((s) => ({
    url: `${baseUrl}/sektor/${s.slug}`,
    lastModified: new Date(),
  })) || [];

  // Markaları çek
  const { data: markalar } = await supabase.from('marka').select('slug');
  const markaUrls = markalar?.map((m) => ({
    url: `${baseUrl}/marka/${m.slug}`,
    lastModified: new Date(),
  })) || [];

  return [
    { url: baseUrl, lastModified: new Date() },
    ...sektorUrls,
    ...markaUrls,
  ];
}