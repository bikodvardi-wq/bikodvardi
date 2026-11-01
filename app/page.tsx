import { supabase } from '@/lib/supabase';
import type { Metadata } from 'next';
import HomeClient from './HomeClient';
import { getReklamlar } from '@/lib/reklam';
export const revalidate = 3600; // 1 saatte bir kontrol edilir // 5 dakikada bir yenilenir

// 🚀 SEO: Ana sayfa artık sunucuda render ediliyor, arama motorları
// içeriği (kampanyalar, markalar, sektörler) doğrudan HTML içinde görüyor.
export const metadata: Metadata = {
  title: "biKodVardı | En Güncel İndirim Kodları ve Kampanyalar",
  description:
  "En güncel banka kampanyaları, ücretsiz fırsatlar ve indirim kodları. Akbank, İş Bankası, Vodafone ve yüzlerce markanın kampanyalarını BiKodVardı ile keşfet.",  alternates: {
    canonical: 'https://bikodvardi.com',
  },
  openGraph: {
    title: "biKodVardı | Aradığın kod, tek tıkla.",
    description: "Yüzlerce markanın en güncel indirim ve kampanya kodları.",
    url: 'https://bikodvardi.com',
  },
};

/**
 * Türkiye saatine göre haftalık sabit anahtar üretir.
 * Böylece sıralama her istekte değil, haftada bir değişir.
 */
function haftaAnahtariOlustur(): string {
  const parcalar = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const degerler = Object.fromEntries(
    parcalar
      .filter((parca) => parca.type !== "literal")
      .map((parca) => [parca.type, parca.value])
  );

  const tarih = new Date(
    Date.UTC(
      Number(degerler.year),
      Number(degerler.month) - 1,
      Number(degerler.day)
    )
  );

  const haftaninGunu = tarih.getUTCDay() || 7;

  tarih.setUTCDate(tarih.getUTCDate() + 4 - haftaninGunu);

  const haftaYili = tarih.getUTCFullYear();
  const yilBaslangici = new Date(Date.UTC(haftaYili, 0, 1));

  const haftaNumarasi = Math.ceil(
    ((tarih.getTime() - yilBaslangici.getTime()) / 86_400_000 + 1) / 7
  );

  return `${haftaYili}-W${String(haftaNumarasi).padStart(2, "0")}`;
}

function sabitHashOlustur(deger: string): number {
  let hash = 2_166_136_261;

  for (let i = 0; i < deger.length; i += 1) {
    hash ^= deger.charCodeAt(i);
    hash = Math.imul(hash, 16_777_619);
  }

  return hash >>> 0;
}

function ogeAnahtariOlustur<T>(oge: T, index: number): string {
  if (typeof oge === "object" && oge !== null) {
    const kayit = oge as {
      id?: string | number | null;
      slug?: string | null;
    };

    if (kayit.id !== undefined && kayit.id !== null) {
      return String(kayit.id);
    }

    if (kayit.slug) {
      return kayit.slug;
    }
  }

  return String(index);
}

/**
 * Listeyi aynı hafta boyunca değişmeyecek şekilde sıralar.
 */
function haftalikKaristir<T>(array: T[], grup: string): T[] {
  const haftaAnahtari = haftaAnahtariOlustur();

  return array
    .map((oge, index) => ({
      oge,
      index,
      siralama: sabitHashOlustur(
        `${haftaAnahtari}:${grup}:${ogeAnahtariOlustur(oge, index)}`
      ),
    }))
    .sort(
      (a, b) =>
        a.siralama - b.siralama ||
        a.index - b.index
    )
    .map(({ oge }) => oge);
}

export default async function Home() {
  const now = new Date().toISOString();

  const [
  sRes,
  tRes,
  mRes,
  yeniKRes,
  aktifCountRes,      // ← yeni count
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
    .limit(8),
  
  supabase
  .from('kampanya')
  .select('id', { count: 'exact', head: true })
  .or(`bitis_date.gt.${now},bitis_date.is.null`),

  supabase
    .from('kampanya')
    .select('*, yapan_marka_bilgisi:yapan_marka(marka_adi, logo_url, sektor_id)')
    .in('kampanya_turu', [3, 4])
    .or(`bitis_date.gt.${now},bitis_date.is.null`)
    .order('created_at', { ascending: false })
    .limit(8),

    supabase
  .from("kampanya")
  .select(`
    id,
    slug,
    baslik,
    bitis_date,
    created_at,
    kampanya_turu,
    fayd_marka,
    gecerli_sektor_id,
    yapan_marka_bilgisi:yapan_marka(
      marka_adi,
      logo_url,
      sektor_id
    )
  `)
  .or(`bitis_date.gt.${now},bitis_date.is.null`)
  .order("created_at", { ascending: false })
  .limit(2000),

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

const ucretsizKampanyalar = haftalikKaristir(
  ucretsizData,
  "ucretsiz-kampanyalar"
).slice(0, 6);

const enYeniKampanyalar = haftalikKaristir(
  yeniKData,
  "en-yeni-kampanyalar"
).slice(0, 6);

  // “Son Şans” (bitiş tarihi 3 gün içinde olanlar)
const ucGunSonra = new Date();
ucGunSonra.setDate(ucGunSonra.getDate() + 3);

const simdi = Date.now();

const sonSansKampanyalar = haftalikKaristir(
  tumAktifData.filter(
    (k: any) =>
      k.bitis_date &&
      new Date(k.bitis_date).getTime() <= ucGunSonra.getTime() &&
      new Date(k.bitis_date).getTime() > simdi
  ),
  "son-sans-kampanyalari"
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
  aktif: aktifCountRes.count || 0,   // ✅ gerçek sayı
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