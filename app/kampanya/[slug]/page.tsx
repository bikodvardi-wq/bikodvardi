import { cache } from "react";
import { supabase } from "@/lib/supabase";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import KampanyaIcerik from "./KampanyaIcerik";
import { getReklamlar } from "@/lib/reklam";

export const revalidate = 300;

const SITE_URL = "https://bikodvardi.com";
const OG_IMAGE = `${SITE_URL}/og-image.png`;

/**
 * HTML etiketlerini, yaygın HTML karakterlerini ve gereksiz boşlukları temizler.
 */
function metniTemizle(metin?: string | null): string {
  if (!metin) return "";

  return metin
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&#39;|&#x27;/gi, "'")
    .replace(/ /g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Metni kelimeyi ortadan bölmeden belirtilen uzunluğa kısaltır.
 */
function metniKisalt(metin: string, uzunluk: number): string {
  if (metin.length <= uzunluk) return metin;

  const kesilmis = metin.slice(0, uzunluk - 3).trim();
  const sonBosluk = kesilmis.lastIndexOf(" ");
  const guvenliMetin = sonBosluk > uzunluk * 0.6
    ? kesilmis.slice(0, sonBosluk)
    : kesilmis;

  return `${guvenliMetin.trim()}...`;
}

/**
 * Türkiye saatine göre bugünün YYYY-MM-DD değerini üretir.
 */
function turkiyeBugunu(): string {
  const parcalar = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const yil = parcalar.find((parca) => parca.type === "year")?.value;
  const ay = parcalar.find((parca) => parca.type === "month")?.value;
  const gun = parcalar.find((parca) => parca.type === "day")?.value;

  return `${yil}-${ay}-${gun}`;
}

/**
 * Kampanya süresinin Türkiye saatine göre dolup dolmadığını belirler.
 */
function suresiDolduMu(bitisTarihi?: string | null): boolean {
  if (!bitisTarihi) return false;

  if (/^\d{4}-\d{2}-\d{2}$/.test(bitisTarihi)) {
    return bitisTarihi < turkiyeBugunu();
  }

  const bitis = new Date(bitisTarihi);
  return Number.isNaN(bitis.getTime()) ? false : bitis.getTime() < Date.now();
}

function tarihiYaz(bitisTarihi?: string | null): string | null {
  if (!bitisTarihi) return null;

  const tarih = /^\d{4}-\d{2}-\d{2}$/.test(bitisTarihi)
    ? new Date(`${bitisTarihi}T12:00:00Z`)
    : new Date(bitisTarihi);

  if (Number.isNaN(tarih.getTime())) return null;

  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(tarih);
}

function seoBasligiOlustur(baslik: string): string {
  const sonEk = " | biKodVardı";
  const anaBaslik = metniKisalt(baslik, 65 - sonEk.length);
  return `${anaBaslik}${sonEk}`;
}

function varsayilanAciklamaOlustur(
  baslik: string,
  marka: string,
  bitisTarihi?: string | null
): string {
  const isExpired = suresiDolduMu(bitisTarihi);
  const yaziliTarih = tarihiYaz(bitisTarihi);

  if (isExpired) {
    return `${baslik} kampanyası sona ermiştir. ${marka} markasına ait güncel indirim kodlarını ve aktif fırsatları BiKodVardı'da inceleyin.`;
  }

  const tarihMetni = yaziliTarih
    ? ` Kampanya ${yaziliTarih} tarihine kadar geçerlidir.`
    : "";

  return `${baslik} kampanyasının kullanım koşullarını ve kimlerin yararlanabileceğini inceleyin.${tarihMetni}`;
}

/**
 * generateMetadata ve Page aynı kampanya verisini kullanır.
 * React cache aynı sunucu render'ında yinelenen Supabase sorgusunu önler.
 */
const getKampanya = cache(async (slug: string) => {
  const { data, error } = await supabase
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

  if (error) {
    console.error("Kampanya sorgusu başarısız:", error.message);
    return null;
  }

  return data;
});

/**
 * Kampanya sayfasının dinamik SEO bilgileri.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const kampanya = await getKampanya(slug);

  if (!kampanya) {
    notFound();
  }

  const markaBilgisi = Array.isArray(kampanya.yapan_marka_bilgisi)
    ? kampanya.yapan_marka_bilgisi[0]
    : kampanya.yapan_marka_bilgisi;

  const marka = markaBilgisi?.marka_adi || "Güncel kampanya";
  const canonicalUrl = `${SITE_URL}/kampanya/${kampanya.slug}`;
  const isExpired = suresiDolduMu(kampanya.bitis_date);
  const title = seoBasligiOlustur(kampanya.baslik);

  const varsayilanAciklama = varsayilanAciklamaOlustur(
    kampanya.baslik,
    marka,
    kampanya.bitis_date
  );

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
      images: [
        {
          url: OG_IMAGE,
          width: 1200,
          height: 630,
          alt: `${kampanya.baslik} kampanya detayları`,
        },
      ],
      ...(kampanya.created_at
        ? { publishedTime: kampanya.created_at }
        : {}),
      ...(kampanya.updated_at
        ? { modifiedTime: kampanya.updated_at }
        : {}),
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE],
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
  const kampanya = await getKampanya(slug);

  if (!kampanya) {
    notFound();
  }

  const markaBilgisi = Array.isArray(kampanya.yapan_marka_bilgisi)
    ? kampanya.yapan_marka_bilgisi[0]
    : kampanya.yapan_marka_bilgisi;

  const marka = markaBilgisi?.marka_adi || "Güncel fırsat";
  const canonicalUrl = `${SITE_URL}/kampanya/${kampanya.slug}`;
  const bugun = turkiyeBugunu();

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
      .or(`bitis_date.gte.${bugun},bitis_date.is.null`)
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  const temizAciklama =
    metniTemizle(kampanya.aciklama) ||
    varsayilanAciklamaOlustur(
      kampanya.baslik,
      marka,
      kampanya.bitis_date
    );

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "biKodVardı",
        inLanguage: "tr-TR",
      },
      {
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: kampanya.baslik,
        description: temizAciklama,
        inLanguage: "tr-TR",
        isPartOf: {
          "@id": `${SITE_URL}/#website`,
        },
        about: {
          "@type": "Organization",
          name: marka,
          ...(markaBilgisi?.slug
            ? { url: `${SITE_URL}/marka/${markaBilgisi.slug}` }
            : {}),
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

  const guvenliJsonLd = JSON.stringify(jsonLd)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");

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
