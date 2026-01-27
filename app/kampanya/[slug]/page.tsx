import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase'; // Tek ve doğru import bu olmalı
import KampanyaIcerik from './KampanyaIcerik';

// 🔍 GOOGLE İÇİN METADATA (Burası Google aramalarında görünen kısımdır)
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { data: kampanya } = await supabase
    .from('kampanya')
    .select('baslik, yapan_marka(marka_adi)')
    .eq('slug', params.slug)
    .single();

  if (!kampanya) return { title: 'Kampanya Bulunamadı | biKodVardı' };

  const marka = (kampanya.yapan_marka as any)?.marka_adi || 'Marka';
  return {
    title: `${marka} - ${kampanya.baslik} | biKodVardı`,
    description: `${marka} markasının en güncel ${kampanya.baslik} kampanyası ve indirim kodları biKodVardı'da! Hemen tıkla, fırsatı kaçırma.`,
    alternates: { canonical: `https://bikodvardi.com/kampanya/${params.slug}` },
    robots: { index: true, follow: true }
  };
}

// 📦 SERVER COMPONENT: Veriyi sunucuda çeker, Google botuna dolu gönderir
export default async function Page({ params }: { params: { slug: string } }) {
  const { data: kampanya } = await supabase
    .from('kampanya')
    .select(`*, yapan_marka_bilgisi:yapan_marka ( marka_adi, logo_url ), tur_bilgisi:kampanya_turu ( tur_adi )`)
    .eq('slug', params.slug)
    .single();

  if (!kampanya) notFound();

  // Benzer kampanyaları da sunucuda çekelim
  const { data: benzerler } = await supabase
    .from('kampanya')
    .select('id, baslik, slug, yapan_marka_bilgisi:yapan_marka(logo_url, marka_adi)')
    .eq('kampanya_turu', kampanya.kampanya_turu)
    .neq('id', kampanya.id)
    .limit(3)
    .order('created_at', { ascending: false });

  return <KampanyaIcerik kampanya={kampanya} benzerler={benzerler || []} />;
}