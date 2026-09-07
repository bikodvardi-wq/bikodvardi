import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

// Sitemap en fazla 5 dakika önbellekte tutulur.
// Silinen veya süresi biten kampanyalar en geç 5 dakika içinde çıkar.
export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://bikodvardi.com";
  const now = new Date().toISOString();

  // Sabit ve indexlenmesini istediğimiz sayfalar
  const statikSayfalar: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/app`,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/hakkimizda`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/iletisim`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/gizlilik-politikasi`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  try {
    const [kampanyalarRes, sektorlerRes, markalarRes] =
      await Promise.all([
        // Yalnızca aktif veya süresiz kampanyalar
        supabase
          .from("kampanya")
          .select("slug, created_at")
          .not("slug", "is", null)
          .or(`bitis_date.gt.${now},bitis_date.is.null`)
          .order("created_at", { ascending: false }),

        // Kategori sayfaları
        supabase
          .from("sektor")
          .select("slug")
          .not("slug", "is", null),

        // Marka sayfaları
        supabase
          .from("marka")
          .select("slug")
          .not("slug", "is", null),
      ]);

    if (kampanyalarRes.error) {
      console.error(
        "Sitemap kampanyaları alınamadı:",
        kampanyalarRes.error
      );
    }

    if (sektorlerRes.error) {
      console.error(
        "Sitemap sektörleri alınamadı:",
        sektorlerRes.error
      );
    }

    if (markalarRes.error) {
      console.error(
        "Sitemap markaları alınamadı:",
        markalarRes.error
      );
    }

    const kampanyaUrls: MetadataRoute.Sitemap = (
      kampanyalarRes.data || []
    )
      .filter(
        (kampanya) =>
          typeof kampanya.slug === "string" &&
          kampanya.slug.trim().length > 0
      )
      .map((kampanya) => ({
        url: `${baseUrl}/kampanya/${kampanya.slug}`,
        lastModified: kampanya.created_at
          ? new Date(kampanya.created_at)
          : undefined,
        changeFrequency: "daily",
        priority: 0.9,
      }));

    const sektorUrls: MetadataRoute.Sitemap = (
      sektorlerRes.data || []
    )
      .filter(
        (sektor) =>
          typeof sektor.slug === "string" &&
          sektor.slug.trim().length > 0
      )
      .map((sektor) => ({
        url: `${baseUrl}/sektor/${sektor.slug}`,
        changeFrequency: "daily",
        priority: 0.8,
      }));

    const markaUrls: MetadataRoute.Sitemap = (
      markalarRes.data || []
    )
      .filter(
        (marka) =>
          typeof marka.slug === "string" &&
          marka.slug.trim().length > 0
      )
      .map((marka) => ({
        url: `${baseUrl}/marka/${marka.slug}`,
        changeFrequency: "daily",
        priority: 0.8,
      }));

    return [
      ...statikSayfalar,
      ...kampanyaUrls,
      ...sektorUrls,
      ...markaUrls,
    ];
  } catch (error) {
    console.error("Sitemap oluşturulamadı:", error);

    // Supabase geçici olarak çalışmasa bile sabit sayfalar kalır.
    return statikSayfalar;
  }
}