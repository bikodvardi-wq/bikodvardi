import { supabase } from "@/lib/supabase";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 3600;

const SITE_URL = "https://bikodvardi.com";
const SAYFA_BASINA_YAZI = 12;

interface BlogIndexProps {
  searchParams: Promise<{
    sayfa?: string | string[];
  }>;
}

interface BlogYazisi {
  id: number;
  baslik: string;
  slug: string;
  ozet: string | null;
  kapak_gorseli: string | null;
  created_at: string | null;
}

function sayfaNumarasiniAl(deger?: string | string[]): number {
  const hamDeger = Array.isArray(deger) ? deger[0] : deger;

  if (!hamDeger) return 1;

  const sayfa = Number(hamDeger);

  if (!Number.isInteger(sayfa) || sayfa < 1) {
    return 1;
  }

  return sayfa;
}

function blogSayfaUrl(sayfa: number): string {
  return sayfa <= 1 ? `${SITE_URL}/blog` : `${SITE_URL}/blog?sayfa=${sayfa}`;
}

function yerelBlogSayfaUrl(sayfa: number): string {
  return sayfa <= 1 ? "/blog" : `/blog?sayfa=${sayfa}`;
}

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

function tarihiYaz(tarih?: string | null): string {
  if (!tarih) return "Güncel";

  const tarihNesnesi = new Date(tarih);

  if (Number.isNaN(tarihNesnesi.getTime())) return "Güncel";

  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(tarihNesnesi);
}

function gecerliGorselUrl(url?: string | null): string | null {
  if (!url) return null;

  try {
    const adres = new URL(url);

    if (adres.protocol !== "https:") return null;

    const izinliHost =
      adres.hostname === "images.unsplash.com" ||
      adres.hostname.endsWith(".supabase.co");

    return izinliHost ? adres.toString() : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  searchParams,
}: BlogIndexProps): Promise<Metadata> {
  const params = await searchParams;
  const sayfa = sayfaNumarasiniAl(params.sayfa);
  const canonical = blogSayfaUrl(sayfa);

  const title =
    sayfa === 1
      ? "Blog ve Alışveriş Rehberi | biKodVardı"
      : `Blog ve Alışveriş Rehberi - Sayfa ${sayfa} | biKodVardı`;

  const description =
    "İndirim kodları, kampanyalar, güvenli alışveriş yöntemleri ve tasarruf ipuçları hakkında güncel biKodVardı rehberlerini okuyun.";

  return {
    title,
    description,
    alternates: {
      canonical,
    },
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
      url: canonical,
      siteName: "biKodVardı",
      locale: "tr_TR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function BlogIndex({ searchParams }: BlogIndexProps) {
  const params = await searchParams;
  const sayfa = sayfaNumarasiniAl(params.sayfa);
  const baslangic = (sayfa - 1) * SAYFA_BASINA_YAZI;
  const bitis = baslangic + SAYFA_BASINA_YAZI - 1;

  const { data, count, error } = await supabase
    .from("blog_yazilari")
    .select("id, baslik, slug, ozet, kapak_gorseli, created_at", {
      count: "exact",
    })
    .eq("yayin_durumu", true)
    .not("slug", "is", null)
    .order("created_at", { ascending: false })
    .range(baslangic, bitis);

  if (error) {
    throw new Error(`Blog yazıları alınamadı: ${error.message}`);
  }

  const yazilar = (data || []) as BlogYazisi[];
  const toplamYazi = count || 0;
  const toplamSayfa = Math.max(1, Math.ceil(toplamYazi / SAYFA_BASINA_YAZI));

  if (sayfa > 1 && (sayfa > toplamSayfa || yazilar.length === 0)) {
    notFound();
  }

  const canonicalUrl = blogSayfaUrl(sayfa);
  const oncekiSayfa = sayfa > 1 ? sayfa - 1 : null;
  const sonrakiSayfa = sayfa < toplamSayfa ? sayfa + 1 : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Blog",
        "@id": `${canonicalUrl}#blog`,
        url: canonicalUrl,
        name:
          sayfa === 1
            ? "biKodVardı Blog ve Alışveriş Rehberi"
            : `biKodVardı Blog - Sayfa ${sayfa}`,
        description:
          "Kampanyalar, indirim kodları, güvenli alışveriş ve tasarruf yöntemleri hakkında güncel rehberler.",
        inLanguage: "tr-TR",
        publisher: {
          "@type": "Organization",
          name: "biKodVardı",
          url: SITE_URL,
        },
        blogPost: yazilar.map((yazi) => ({
          "@type": "BlogPosting",
          headline: yazi.baslik,
          url: `${SITE_URL}/blog/${yazi.slug}`,
          ...(yazi.created_at ? { datePublished: yazi.created_at } : {}),
          ...(gecerliGorselUrl(yazi.kapak_gorseli)
            ? { image: gecerliGorselUrl(yazi.kapak_gorseli) }
            : {}),
        })),
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
            name: sayfa === 1 ? "Blog" : `Blog - Sayfa ${sayfa}`,
            item: canonicalUrl,
          },
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${canonicalUrl}#yazilar`,
        numberOfItems: yazilar.length,
        itemListOrder: "https://schema.org/ItemListOrderDescending",
        itemListElement: yazilar.map((yazi, index) => ({
          "@type": "ListItem",
          position: baslangic + index + 1,
          url: `${SITE_URL}/blog/${yazi.slug}`,
          name: yazi.baslik,
        })),
      },
    ],
  };

  const guvenliJsonLd = JSON.stringify(jsonLd).replace(/</g, "\\u003c");

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-20 font-['Plus_Jakarta_Sans'] text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: guvenliJsonLd }}
      />

      {oncekiSayfa && (
        <link rel="prev" href={blogSayfaUrl(oncekiSayfa)} />
      )}
      {sonrakiSayfa && (
        <link rel="next" href={blogSayfaUrl(sonrakiSayfa)} />
      )}

      <nav
        aria-label="Ana navigasyon"
        className="border-b border-slate-200 bg-white px-4 py-4 md:px-8"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="no-underline" aria-label="biKodVardı ana sayfa">
            <div
              className="text-2xl font-[900] tracking-tighter text-slate-900"
              style={{ fontFamily: "Outfit" }}
            >
              bi<span className="text-blue-600">kod</span>vardı
            </div>
          </Link>

          <Link
            href="/"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 no-underline transition hover:border-blue-200 hover:text-blue-600"
          >
            Kampanyalara Dön
          </Link>
        </div>
      </nav>

      <header className="mx-auto max-w-4xl px-4 pb-12 pt-16 text-center">
        <span className="mb-4 inline-block rounded-full bg-blue-100 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-blue-600">
          Alışveriş Rehberi
        </span>

        <h1
          className="mb-6 text-4xl font-[900] tracking-tight text-slate-900 md:text-6xl"
          style={{ fontFamily: "Outfit" }}
        >
          Daha Akıllıca{" "}
          <span className="font-light italic text-blue-600">Alışveriş Yap.</span>
        </h1>

        <p className="mx-auto max-w-2xl text-base font-medium leading-7 text-slate-500 md:text-lg">
          İndirim kodlarını doğru kullanmanın, güvenli alışveriş yapmanın ve
          kampanyalardan daha fazla tasarruf etmenin yollarını keşfedin.
        </p>

        {sayfa > 1 && (
          <p className="mt-4 text-sm font-bold text-slate-400">
            Sayfa {sayfa} / {toplamSayfa}
          </p>
        )}
      </header>

      <section
        aria-labelledby="blog-yazilari-baslik"
        className="mx-auto max-w-7xl px-4 md:px-8"
      >
        <h2 id="blog-yazilari-baslik" className="sr-only">
          Güncel alışveriş rehberleri
        </h2>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {yazilar.map((yazi) => {
            const gorselUrl = gecerliGorselUrl(yazi.kapak_gorseli);
            const ozet =
              metniTemizle(yazi.ozet) ||
              `${yazi.baslik} hakkında güncel bilgiler ve alışveriş ipuçları.`;

            return (
              <article key={yazi.id} className="h-full">
                <Link
                  href={`/blog/${yazi.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white no-underline transition-all duration-500 hover:-translate-y-1 hover:border-blue-300 hover:shadow-2xl"
                >
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400">
                    {gorselUrl ? (
                      <img
                        src={gorselUrl}
                        alt={`${yazi.baslik} kapak görseli`}
                        width={800}
                        height={450}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center px-8 text-center">
                        <span
                          className="text-2xl font-black tracking-tight text-white/95"
                          style={{ fontFamily: "Outfit" }}
                        >
                          bi<span className="text-slate-950">kod</span>vardı
                          Rehber
                        </span>
                      </div>
                    )}

                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950/20 to-transparent" />
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-8">
                    <div>
                      <time
                        dateTime={yazi.created_at || undefined}
                        className="mb-3 block text-[10px] font-bold uppercase tracking-widest text-slate-400"
                      >
                        {tarihiYaz(yazi.created_at)}
                      </time>

                      <h3
                        className="mb-3 text-xl font-black leading-tight text-slate-900 transition-colors group-hover:text-blue-600"
                        style={{ fontFamily: "Outfit" }}
                      >
                        {yazi.baslik}
                      </h3>

                      <p className="mb-6 line-clamp-3 text-sm leading-6 text-slate-500">
                        {ozet}
                      </p>
                    </div>

                    <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">
                        Alışveriş Rehberi
                      </span>
                      <span className="text-sm font-bold text-blue-600 transition-transform group-hover:translate-x-1">
                        Okumaya Başla →
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            );
          })}

          {yazilar.length === 0 && (
            <div className="col-span-full rounded-[2rem] border border-slate-200 bg-white px-6 py-20 text-center">
              <h2 className="text-xl font-black text-slate-900">
                Henüz yayınlanmış bir yazı bulunmuyor
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Yeni alışveriş rehberleri yakında burada olacak.
              </p>
            </div>
          )}
        </div>

        {toplamSayfa > 1 && (
          <nav
            aria-label="Blog sayfaları"
            className="mt-14 flex items-center justify-center gap-3"
          >
            {oncekiSayfa ? (
              <Link
                href={yerelBlogSayfaUrl(oncekiSayfa)}
                rel="prev"
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 no-underline transition hover:border-blue-300 hover:text-blue-600"
              >
                ← Önceki
              </Link>
            ) : (
              <span className="cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-5 py-3 text-sm font-bold text-slate-400">
                ← Önceki
              </span>
            )}

            <span className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-black text-white">
              {sayfa} / {toplamSayfa}
            </span>

            {sonrakiSayfa ? (
              <Link
                href={yerelBlogSayfaUrl(sonrakiSayfa)}
                rel="next"
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 no-underline transition hover:border-blue-300 hover:text-blue-600"
              >
                Sonraki →
              </Link>
            ) : (
              <span className="cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-5 py-3 text-sm font-bold text-slate-400">
                Sonraki →
              </span>
            )}
          </nav>
        )}
      </section>
    </main>
  );
}
