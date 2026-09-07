import { supabase } from "@/lib/supabase";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import KampanyaIcerik from "./KampanyaIcerik";
import { getReklamlar } from "@/lib/reklam";

export const revalidate = 300;

const SITE_URL = "https://bikodvardi.com";

/**
 * HTML etiketlerini ve gereksiz boşlukları temizler.
 */
function metniTemizle(metin?: string | null): string {
  if (!metin) return "";

  return metin
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Metni belirtilen uzunlukta güvenli biçimde kısaltır.
 */
function metniKisalt(metin: string, uzunluk: number): string {
  if (metin.length <= uzunluk) return metin;

  return `${metin.slice(0, uzunluk - 3).trim()}...`;
}

/**
 * Kampanya süresinin Türkiye saatine göre dolup dolmadığını belirler.
 */
function suresiDolduMu(bitisTarihi?: string | null): boolean {
  if (!bitisTarihi) return false;

  // Supabase alanı yalnızca YYYY-MM-DD biçimindeyse
  if (/^\d{4}-\d{2}-\d{2}$/.test(bitisTarihi)) {
    const turkiyeBugun = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Istanbul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    return bitisTarihi < turkiyeBugun;
  }

  const bitis = new Date(bitisTarihi);

  if (Number.isNaN(bitis.getTime())) {
    return false;
  }

  return bitis.getTime() < Date.now();
}

/**
 * Kampanya sayfasının dinamik SEO bilgileri.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const { data: kampanya } = await supabase
    .from("kampanya")
    .select(`
      baslik,
      aciklama,
      slug,
      bitis_date,
      yapan_marka_bilgisi:yapan_marka (
        marka_adi
      )
    `)
    .eq("slug", slug)
    .maybeSingle();

  if (!kampanya) {
    notFound();
  }

  const markaBilgisi = Array.isArray(kampanya.yapan_marka_bilgisi)
    ? kampanya.yapan_marka_bilgisi[0]
    : kampanya.yapan_marka_bilgisi;

  const marka = markaBilgisi?.marka_adi || "Güncel";
  const canonicalUrl = `${SITE_URL}/kampanya/${kampanya.slug}`;
  const isExpired = suresiDolduMu(kampanya.bitis_date);

  const title = metniKisalt(
    `${marka} Kampanyası: ${kampanya.baslik} | biKodVardı`,
    65
  );

  const varsayilanAciklama =
    `${marka} markasına ait ${kampanya.baslik} kampanyasının ` +
    `güncel detaylarını, koşullarını ve son kullanım tarihini inceleyin.`;

  const description = metniKisalt(
    metniTemizle(kampanya.aciklama) || varsayilanAciklama,
    155
  );

  return {
    title,
    description,

    alternates: {
      canonical: canonicalUrl,
    },

    robots: {
      index: !isExpired,
      follow: true,
      googleBot: {
        index: !isExpired,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },

    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "biKodVardı",
      locale: "tr_TR",
      type: "article",
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

/**
 * Kampanya detay sayfası.
 */
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const now = new Date().toISOString();

  const { data: kampanya, error } = await supabase
    .from("kampanya")
    .select(`
      *,
      yapan_marka_bilgisi:yapan_marka (
        slug,
        marka_adi,
        logo_url
      ),
      tur_bilgisi:kampanya_turu (
        tur_adi
      )
    `)
    .eq("slug", slug)
    .maybeSingle();

  if (error || !kampanya) {
    notFound();
  }

  const markaBilgisi = Array.isArray(kampanya.yapan_marka_bilgisi)
    ? kampanya.yapan_marka_bilgisi[0]
    : kampanya.yapan_marka_bilgisi;

  const marka = markaBilgisi?.marka_adi || "Güncel fırsat";
  const canonicalUrl = `${SITE_URL}/kampanya/${kampanya.slug}`;

  const [reklamUst, reklamAlt, benzerlerRes] = await Promise.all([
    getReklamlar("kampanya_ust", 2),
    getReklamlar("kampanya_alt", 2),

    supabase
      .from("kampanya")
      .select(`
        id,
        baslik,
        slug,
        bitis_date,
        kampanya_turu,
        yapan_marka_bilgisi:yapan_marka (
          slug,
          logo_url,
          marka_adi
        )
      `)
      .eq("kampanya_turu", kampanya.kampanya_turu)
      .neq("id", kampanya.id)
      .or(`bitis_date.gt.${now},bitis_date.is.null`)
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  const temizAciklama =
    metniTemizle(kampanya.aciklama) ||
    `${marka} markasına ait güncel kampanya ve indirim fırsatı.`;

  /*
   * Kampanyanın indirim miktarı veya gerçek fiyatı belli olmadığı için
   * Offer içine price: 0 eklemiyoruz.
   */
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: `${marka} Kampanyası: ${kampanya.baslik}`,
        description: temizAciklama,
        inLanguage: "tr-TR",
        isPartOf: {
          "@id": `${SITE_URL}/#website`,
        },
        breadcrumb: {
          "@id": `${canonicalUrl}#breadcrumb`,
        },
        ...(kampanya.created_at
          ? { datePublished: kampanya.created_at }
          : {}),
        ...(kampanya.updated_at
          ? { dateModified: kampanya.updated_at }
          : {}),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonicalUrl}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Ana Sayfa",
            item: SITE_URL,
          },
          ...(markaBilgisi?.slug
            ? [
                {
                  "@type": "ListItem",
                  position: 2,
                  name: marka,
                  item: `${SITE_URL}/marka/${markaBilgisi.slug}`,
                },
              ]
            : []),
          {
            "@type": "ListItem",
            position: markaBilgisi?.slug ? 3 : 2,
            name: kampanya.baslik,
            item: canonicalUrl,
          },
        ],
      },
    ],
  };

  const guvenliJsonLd = JSON.stringify(jsonLd).replace(
    /</g,
    "\\u003c"
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: guvenliJsonLd }}
      />

      <KampanyaIcerik
        kampanya={kampanya}
        benzerler={benzerlerRes.data || []}
        reklamlar={reklamAlt || []}
        reklamUst={reklamUst || []}
      />
    </>
  );
}