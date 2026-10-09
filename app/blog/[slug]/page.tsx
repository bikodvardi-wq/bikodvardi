import { cache } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { supabase } from "@/lib/supabase";

export const revalidate = 3600;

const SITE_URL = "https://bikodvardi.com";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

function metniTemizle(metin?: string | null): string {
  if (!metin) return "";

  return metin
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function metniKisalt(metin: string, uzunluk: number): string {
  if (metin.length <= uzunluk) return metin;

  const kesilmis = metin.slice(0, uzunluk - 3);
  const sonBosluk = kesilmis.lastIndexOf(" ");
  const guvenliMetin =
    sonBosluk > uzunluk * 0.7 ? kesilmis.slice(0, sonBosluk) : kesilmis;

  return `${guvenliMetin.trim()}...`;
}

function guvenliKapakGorseli(gorselUrl?: string | null): string | null {
  if (!gorselUrl) return null;

  try {
    const url = new URL(gorselUrl);
    const izinliAlanAdlari = new Set([
      "images.unsplash.com",
      "cwoswinjuiwcylcsufav.supabase.co",
    ]);

    return url.protocol === "https:" && izinliAlanAdlari.has(url.hostname)
      ? gorselUrl
      : null;
  } catch {
    return null;
  }
}

function tarihiFormatla(tarih?: string | null): string {
  if (!tarih) return "Güncel";

  const date = new Date(tarih);
  if (Number.isNaN(date.getTime())) return "Güncel";

  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function okumaSuresiniHesapla(icerik?: string | null): number {
  const kelimeSayisi = metniTemizle(icerik)
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(1, Math.ceil(kelimeSayisi / 200));
}

const blogYazisiniGetir = cache(async (slug: string) => {
  const { data, error } = await supabase
    .from("blog_yazilari")
    .select(`
      id,
      baslik,
      slug,
      ozet,
      icerik,
      kapak_gorseli,
      yayin_durumu,
      okunma_sayisi,
      created_at
    `)
    .eq("slug", slug)
    .eq("yayin_durumu", true)
    .maybeSingle();

  if (error) return null;
  return data;
});

export async function generateStaticParams() {
  const { data, error } = await supabase
    .from("blog_yazilari")
    .select("slug")
    .eq("yayin_durumu", true)
    .not("slug", "is", null);

  if (error) return [];

  return (data || [])
    .filter((yazi) => Boolean(yazi.slug))
    .map((yazi) => ({ slug: yazi.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const yazi = await blogYazisiniGetir(slug);

  if (!yazi) notFound();

  const canonicalUrl = `${SITE_URL}/blog/${yazi.slug}`;
  const kapakGorseli = guvenliKapakGorseli(yazi.kapak_gorseli);
  const varsayilanAciklama = `${yazi.baslik} hakkında güncel bilgiler, alışveriş önerileri ve fırsatları inceleyin.`;
  const description = metniKisalt(
    metniTemizle(yazi.ozet) ||
      metniKisalt(metniTemizle(yazi.icerik), 155) ||
      varsayilanAciklama,
    155
  );
  const title = metniKisalt(`${yazi.baslik} | biKodVardı Blog`, 65);

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
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
      ...(yazi.created_at ? { publishedTime: yazi.created_at } : {}),
      authors: ["biKodVardı Editör Ekibi"],
      images: [
        {
          url: kapakGorseli || DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: yazi.baslik,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [kapakGorseli || DEFAULT_OG_IMAGE],
    },
  };
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const yazi = await blogYazisiniGetir(slug);

  if (!yazi) notFound();

  const { data: ilgiliYazilarData } = await supabase
    .from("blog_yazilari")
    .select("id, baslik, slug, ozet, created_at")
    .eq("yayin_durumu", true)
    .neq("id", yazi.id)
    .not("slug", "is", null)
    .order("created_at", { ascending: false })
    .limit(3);

  const ilgiliYazilar = ilgiliYazilarData || [];
  const canonicalUrl = `${SITE_URL}/blog/${yazi.slug}`;
  const kapakGorseli = guvenliKapakGorseli(yazi.kapak_gorseli);
  const temizOzet =
    metniTemizle(yazi.ozet) || metniKisalt(metniTemizle(yazi.icerik), 155);
  const okumaSuresi = okumaSuresiniHesapla(yazi.icerik);
  const kelimeSayisi = metniTemizle(yazi.icerik)
    .split(/\s+/)
    .filter(Boolean).length;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${canonicalUrl}#article`,
        headline: yazi.baslik,
        description: temizOzet,
        url: canonicalUrl,
        mainEntityOfPage: { "@id": `${canonicalUrl}#webpage` },
        inLanguage: "tr-TR",
        isAccessibleForFree: true,
        wordCount: kelimeSayisi,
        timeRequired: `PT${okumaSuresi}M`,
        ...(kapakGorseli ? { image: [kapakGorseli] } : {}),
        ...(yazi.created_at
          ? {
              datePublished: yazi.created_at,
              dateModified: yazi.created_at,
            }
          : {}),
        author: {
          "@type": "Organization",
          name: "biKodVardı Editör Ekibi",
          url: SITE_URL,
        },
        publisher: {
          "@type": "Organization",
          name: "biKodVardı",
          url: SITE_URL,
        },
      },
      {
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: yazi.baslik,
        description: temizOzet,
        inLanguage: "tr-TR",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        breadcrumb: { "@id": `${canonicalUrl}#breadcrumb` },
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
          {
            "@type": "ListItem",
            position: 2,
            name: "Blog",
            item: `${SITE_URL}/blog`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: yazi.baslik,
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
    <main className="min-h-screen bg-white text-slate-900 font-['Plus_Jakarta_Sans']">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: guvenliJsonLd }}
      />

      <nav
        aria-label="Blog navigasyonu"
        className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur-md md:px-8"
      >
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link
            href="/blog"
            className="text-sm font-bold text-slate-500 no-underline transition-colors hover:text-blue-600"
          >
            ← Blog&apos;a Dön
          </Link>
          <Link href="/" aria-label="biKodVardı ana sayfa" className="no-underline">
            <div
              className="text-xl font-[900] tracking-tighter text-slate-900"
              style={{ fontFamily: "Outfit" }}
            >
              bi<span className="text-blue-600">kod</span>vardı
            </div>
          </Link>
        </div>
      </nav>

      <article className="mx-auto max-w-3xl px-4 py-12 md:py-20">
        <header className="mb-12 text-center">
          <nav
            aria-label="İçerik yolu"
            className="mb-5 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400"
          >
            <Link href="/" className="transition-colors hover:text-blue-600">
              Ana Sayfa
            </Link>
            <span aria-hidden="true">/</span>
            <Link href="/blog" className="transition-colors hover:text-blue-600">
              Blog
            </Link>
          </nav>

          <h1
            className="mb-6 text-3xl font-[900] leading-tight tracking-tight text-slate-900 md:text-5xl"
            style={{ fontFamily: "Outfit" }}
          >
            {yazi.baslik}
          </h1>

          {temizOzet && (
            <p className="mx-auto mb-6 max-w-2xl text-base leading-7 text-slate-500 md:text-lg">
              {temizOzet}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] font-black uppercase tracking-widest text-slate-400">
            {yazi.created_at && (
              <time
                dateTime={yazi.created_at}
                className="flex items-center gap-1.5"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect width="18" height="18" x="3" y="4" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                {tarihiFormatla(yazi.created_at)}
              </time>
            )}
            <span aria-hidden="true">•</span>
            <span>{okumaSuresi} dakika okuma</span>
            <span aria-hidden="true">•</span>
            <span>biKodVardı Rehber</span>
          </div>
        </header>

        <div className="relative mb-16 h-[300px] w-full overflow-hidden rounded-[3rem] bg-gradient-to-br from-blue-600 to-slate-950 shadow-2xl md:h-[400px]">
          {kapakGorseli ? (
            <Image
              src={kapakGorseli}
              alt={yazi.baslik}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center px-8 text-center">
              <span
                className="text-4xl font-black tracking-tight text-white/90 md:text-6xl"
                style={{ fontFamily: "Outfit" }}
              >
                bi<span className="text-blue-200">kod</span>vardı
              </span>
            </div>
          )}
        </div>

        <div
          className="prose prose-slate max-w-none prose-headings:scroll-mt-24 prose-headings:font-black prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-2xl"
          dangerouslySetInnerHTML={{ __html: yazi.icerik }}
        />
      </article>

      {ilgiliYazilar.length > 0 && (
        <section className="border-t border-slate-200 bg-slate-50 py-16">
          <div className="mx-auto max-w-5xl px-4">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
                  Okumaya Devam Et
                </p>
                <h2
                  className="text-2xl font-black text-slate-900 md:text-3xl"
                  style={{ fontFamily: "Outfit" }}
                >
                  Güncel Rehberler
                </h2>
              </div>
              <Link
                href="/blog"
                className="shrink-0 text-sm font-bold text-blue-600 hover:text-blue-800"
              >
                Tüm Yazılar →
              </Link>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {ilgiliYazilar.map((ilgiliYazi) => (
                <Link
                  key={ilgiliYazi.id}
                  href={`/blog/${ilgiliYazi.slug}`}
                  className="group rounded-3xl border border-slate-200 bg-white p-6 no-underline shadow-sm transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
                >
                  <time className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {tarihiFormatla(ilgiliYazi.created_at)}
                  </time>
                  <h3 className="mt-3 line-clamp-3 text-lg font-black leading-snug text-slate-900 transition-colors group-hover:text-blue-600">
                    {ilgiliYazi.baslik}
                  </h3>
                  {ilgiliYazi.ozet && (
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">
                      {metniTemizle(ilgiliYazi.ozet)}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="border-t border-slate-200 bg-[#F8FAFC] py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2
            className="mb-4 text-3xl font-black"
            style={{ fontFamily: "Outfit" }}
          >
            Okuduklarını Fırsata Çevir
          </h2>
          <p className="mb-8 font-medium text-slate-500">
            Güncel indirim kodlarını, ücretsiz fırsatları ve marka
            kampanyalarını tek yerde inceleyin.
          </p>
          <Link
            href="/"
            className="inline-block rounded-full bg-blue-600 px-8 py-4 font-black text-white shadow-xl transition-colors hover:bg-slate-950"
          >
            Güncel Kampanyaları İncele
          </Link>
        </div>
      </section>
    </main>
  );
}
