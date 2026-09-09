import { supabase } from '@/lib/supabase';
import type { MetadataRoute } from 'next';

export const revalidate = 300;

const BASE_URL = 'https://bikodvardi.com';
const PAGE_SIZE = 1000;

type KampanyaSitemapKaydi = {
  id: number;
  slug: string | null;
  created_at: string | null;
  fayd_marka: number | null;
  gecerli_sektor_id: number | null;
};

type MarkaSitemapKaydi = {
  id: number;
  slug: string | null;
  sektor_id: number | null;
  ek_sektor_idler: number[] | null;
};

type SektorSitemapKaydi = {
  id: number;
  slug: string | null;
};

type BlogSitemapKaydi = {
  id: number;
  slug: string | null;
  created_at: string | null;
};

/**
 * Supabase'in tek sorgudaki satır sınırına takılmadan tüm kayıtları getirir.
 */
async function tumKayitlariGetir<T>(
  sorguOlustur: () => any
): Promise<T[]> {
  const tumKayitlar: T[] = [];
  let baslangic = 0;

  while (true) {
    const { data, error } = await sorguOlustur().range(
      baslangic,
      baslangic + PAGE_SIZE - 1
    );

    if (error) throw error;

    const sayfa = (data || []) as T[];
    tumKayitlar.push(...sayfa);

    if (sayfa.length < PAGE_SIZE) break;
    baslangic += PAGE_SIZE;
  }

  return tumKayitlar;
}

function tarihOlustur(value: string | null): Date | undefined {
  if (!value) return undefined;

  const tarih = new Date(value);
  return Number.isNaN(tarih.getTime()) ? undefined : tarih;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const nowIso = now.toISOString();

  const sabitSayfalar: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/app`,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/hakkimizda`,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/iletisim`,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/gizlilik-politikasi`,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  try {
    const [kampanyalar, markalar, sektorler, blogYazilari] =
      await Promise.all([
        tumKayitlariGetir<KampanyaSitemapKaydi>(() =>
          supabase
            .from('kampanya')
            .select(
              'id, slug, created_at, fayd_marka, gecerli_sektor_id'
            )
            .or(`bitis_date.gt.${nowIso},bitis_date.is.null`)
            .order('id', { ascending: true })
        ),
        tumKayitlariGetir<MarkaSitemapKaydi>(() =>
          supabase
            .from('marka')
            .select('id, slug, sektor_id, ek_sektor_idler')
            .order('id', { ascending: true })
        ),
        tumKayitlariGetir<SektorSitemapKaydi>(() =>
          supabase
            .from('sektor')
            .select('id, slug')
            .order('id', { ascending: true })
        ),
        tumKayitlariGetir<BlogSitemapKaydi>(() =>
          supabase
            .from('blog_yazilari')
            .select('id, slug, created_at')
            .eq('yayin_durumu', true)
            .order('id', { ascending: true })
        ),
      ]);

    // Marka detay sayfası yalnızca doğrudan fayd_marka eşleşen aktif
    // kampanyaları gösterdiği için sitemap'e de yalnızca bu markaları ekle.
    const aktifMarkaIdleri = new Set(
      kampanyalar
        .map((kampanya) => kampanya.fayd_marka)
        .filter((id): id is number => id !== null)
        .map(String)
    );

    const markaHaritasi = new Map(
      markalar.map((marka) => [String(marka.id), marka])
    );

    const aktifSektorIdleri = new Set<string>();

    kampanyalar.forEach((kampanya) => {
      if (kampanya.gecerli_sektor_id !== null) {
        aktifSektorIdleri.add(String(kampanya.gecerli_sektor_id));
      }

      if (kampanya.fayd_marka !== null) {
        const marka = markaHaritasi.get(String(kampanya.fayd_marka));

        if (marka?.sektor_id !== null && marka?.sektor_id !== undefined) {
          aktifSektorIdleri.add(String(marka.sektor_id));
        }

        (marka?.ek_sektor_idler || []).forEach((sektorId) => {
          aktifSektorIdleri.add(String(sektorId));
        });
      }
    });

    const kampanyaUrlListesi: MetadataRoute.Sitemap = kampanyalar
      .filter((kampanya) => Boolean(kampanya.slug))
      .map((kampanya) => ({
        url: `${BASE_URL}/kampanya/${kampanya.slug}`,
        lastModified: tarihOlustur(kampanya.created_at),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      }));

    const markaUrlListesi: MetadataRoute.Sitemap = markalar
      .filter(
        (marka) =>
          Boolean(marka.slug) && aktifMarkaIdleri.has(String(marka.id))
      )
      .map((marka) => ({
        url: `${BASE_URL}/marka/${marka.slug}`,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));

    const sektorUrlListesi: MetadataRoute.Sitemap = sektorler
      .filter(
        (sektor) =>
          Boolean(sektor.slug) && aktifSektorIdleri.has(String(sektor.id))
      )
      .map((sektor) => ({
        url: `${BASE_URL}/sektor/${sektor.slug}`,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));

    const blogUrlListesi: MetadataRoute.Sitemap = blogYazilari
      .filter((yazi) => Boolean(yazi.slug))
      .map((yazi) => ({
        url: `${BASE_URL}/blog/${yazi.slug}`,
        lastModified: tarihOlustur(yazi.created_at),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }));

    const tumUrlListesi = [
      ...sabitSayfalar,
      ...kampanyaUrlListesi,
      ...markaUrlListesi,
      ...sektorUrlListesi,
      ...blogUrlListesi,
    ];

    // Her ihtimale karşı yinelenen URL'leri temizle.
    return Array.from(
      new Map(tumUrlListesi.map((kayit) => [kayit.url, kayit])).values()
    );
  } catch (error) {
    console.error('Sitemap oluşturulamadı:', error);

    // Veritabanı geçici olarak ulaşılamazsa temel sayfalar yine sunulur.
    return sabitSayfalar;
  }
}
