import { supabase } from '@/lib/supabase';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import KampanyaIcerik from './KampanyaIcerik';

// Google botu için metadata motoru
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params; // 🔑 Kritik: Params'ı bekle (await)
  const { data: kampanya } = await supabase
    .from('kampanya')
    .select('baslik, yapan_marka(marka_adi)')
    .eq('slug', resolvedParams.slug)
    .single();

  if (!kampanya) return { title: 'Kampanya Bulunamadı | biKodVardı' };

  const marka = (kampanya.yapan_marka as any)?.marka_adi || 'Marka';
  return {
    title: `${marka} - ${kampanya.baslik} | biKodVardı`,
    description: `${marka} markasının en güncel ${kampanya.baslik} kampanyası biKodVardı'da!`,
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