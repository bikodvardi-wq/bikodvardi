import { supabase } from '@/lib/supabase';
import type { Metadata } from 'next';
import HomeClient from './HomeClient';
import { getReklamlar } from '@/lib/reklam';
export const revalidate = 300; // 5 dakikada bir yenilensin

// 🚀 SEO: Ana sayfa artık sunucuda render ediliyor, arama motorları
// içeriği (kampanyalar, markalar, sektörler) doğrudan HTML içinde görüyor.
export const metadata: Metadata = {
  title: "biKodVardı | En Güncel İndirim Kodları ve Kampanyalar",
  description: "2026'nın en güncel banka kampanyaları, indirim kodları ve marka fırsatları. Akbank, Ziraat, İş Bankası ve yüzlerce markanın kodları tek tıkla elinizde.",
  alternates: {
    canonical: 'https://bikodvardi.com',
  },
  openGraph: {
    title: "biKodVardı | Aradığın kod, tek tıkla.",
    description: "Yüzlerce markanın en güncel indirim ve kampanya kodları.",
    url: 'https://bikodvardi.com',
  },
};

// Kampanyaları/markaları rastgele karıştırmak için (server'da her istekte bir kez çalışır)
function karistir<T>(array: T[]): T[] {
  return [...array].sort(() => 0.5 - Math.random());
}

export default async function Home() {
  const now = new Date().toISOString();

  const [
  sRes,
  tRes,
  mRes,
  yeniKRes,
  ucretsizRes,
  tumAktifRes,
  tumToplamRes,
  markaCountRes,
  reklamAlt,
  reklamUst,
] = await Promise.all([
  supabase.from('sektor').select('id, sektor_adi, slug, gorsel_url'),
  supabase.from('kampanya_turu').select('id, tur_adi'),
  supabase.from('marka').select('id, marka_adi, slug, logo_url, sektor_id, ek_sektor_idler'),

  supabase
    .from('kampanya')
    .select('*, yapan_marka_bilgisi:yapan_marka(marka_adi, logo_url, sektor_id)')
    .or(`bitis_date.gt.${now},bitis_date.is.null`)
    .order('created_at', { ascending: false })
    .limit(20),

  supabase
    .from('kampanya')
    .select('*, yapan_marka_bilgisi:yapan_marka(marka_adi, logo_url, sektor_id)')
    .in('kampanya_turu', [3, 4])
    .or(`bitis_date.gt.${now},bitis_date.is.null`)
    .order('created_at', { ascending: false })
    .limit(20),

  supabase
    .from('kampanya')
    .select('*, yapan_marka_bilgisi:yapan_marka(marka_adi, logo_url, sektor_id), bitis_date')
    .or(`bitis_date.gt.${now},bitis_date.is.null`)
    .order('created_at', { ascending: false })
    .limit(1000),

  supabase.from('kampanya').select('id', { count: 'exact', head: true }),
  supabase.from('marka').select('id', { count: 'exact', head: true }),
  getReklamlar('anasayfa_alt', 2),
  getReklamlar('anasayfa_ust', 2),
  ]);

  
  const sData = sRes.data || [];
  const tData = tRes.data || [];
  const mData = mRes.data || [];
  const tumAktifData = tumAktifRes.data || [];
  const yeniKData = yeniKRes.data || [];
  const ucretsizData = ucretsizRes.data || [];

  const ucretsizKampanyalar = karistir(ucretsizData).slice(0, 6);
  const enYeniKampanyalar = karistir(yeniKData).slice(0, 6);

  // “Son Şans” (bitiş tarihi 3 gün içinde olanlar)
const ucGunSonra = new Date();
ucGunSonra.setDate(ucGunSonra.getDate() + 3);

const sonSansKampanyalar = karistir(
  tumAktifData.filter(
    (k: any) =>
      k.bitis_date &&
      new Date(k.bitis_date).getTime() <= ucGunSonra.getTime() &&
      new Date(k.bitis_date).getTime() > new Date().getTime()
  )
).slice(0, 4);

  // Sektör ve Marka Sayaçları
  const siraliSektorler = sData.map((sektor: any) => {
    const sektoreAitMarkalar = mData.filter((m: any) =>
      String(m.sektor_id) === String(sektor.id) ||
      (m.ek_sektor_idler && m.ek_sektor_idler.some((id: any) => String(id) === String(sektor.id)))
    ).map((m: any) => m.id);

    const aktifKampanyaSet = new Set();
    tumAktifData.forEach((k: any) => {
      if (k.fayd_marka && sektoreAitMarkalar.includes(k.fayd_marka)) {
        aktifKampanyaSet.add(k.id);
      }
      if (!k.fayd_marka && String(k.gecerli_sektor_id) === String(sektor.id)) {
        aktifKampanyaSet.add(k.id);
      }
    });

    return { ...sektor, firsatSayisi: aktifKampanyaSet.size };
  })
    // Aktif kodu olmayan kategorileri ana sayfada öne çıkarmıyoruz (boş sayfa deneyimini önlemek için)
    .filter((sektor: any) => sektor.firsatSayisi > 0)
    .sort((a: any, b: any) => b.firsatSayisi - a.firsatSayisi);

  const populerMarkalar = mData.map((m: any) => ({
    ...m,
    firsatSayisi: tumAktifData.filter((k: any) => String(k.fayd_marka) === String(m.id)).length,
  })).sort((a: any, b: any) => b.firsatSayisi - a.firsatSayisi).slice(0, 12);

  const stats = {
    aktif: tumAktifData.length,
    toplam: tumToplamRes.count || 0,
    marka: markaCountRes.count || 0,
  };

  return (
    <HomeClient
      sektorler={siraliSektorler}
      kampanyaTurleri={tData}
      populerMarkalar={populerMarkalar}
      enYeniKampanyalar={enYeniKampanyalar}
      ucretsizKampanyalar={ucretsizKampanyalar}
      tumAktifKampanyalar={tumAktifData}
      sonSansKampanyalar={sonSansKampanyalar}
      tumMarkalar={mData}
      stats={stats}
      reklamAlt={reklamAlt}
      reklamUst={reklamUst}
    />
  );
}