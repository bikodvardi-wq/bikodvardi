import { cache } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ReklamAlani from "@/components/ReklamAlani";
import { getReklamlar } from "@/lib/reklam";
import { supabase } from "@/lib/supabase";

export const revalidate = 3600;

const SITE_URL = "https://bikodvardi.com";
const OG_IMAGE = `${SITE_URL}/og-image.png`;

function turkiyeBugunu(): string {
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

  return `${degerler.year}-${degerler.month}-${degerler.day}`;
}

function metniKisalt(metin: string, uzunluk: number): string {
  if (metin.length <= uzunluk) return metin;

  const kesilmis = metin.slice(0, uzunluk - 3);
  const sonBosluk = kesilmis.lastIndexOf(" ");
  const guvenliMetin =
    sonBosluk > uzunluk * 0.7 ? kesilmis.slice(0, sonBosluk) : kesilmis;

  return `${guvenliMetin.trim()}...`;
}

/**
 * next/image yalnızca doğrudan görsel dosyası sunan ve next.config içinde
 * izin verilen adresleri kullanır. Unsplash fotoğraf sayfası gibi URL'ler
 * görsel olmadığı için güvenli arka plana düşürülür.
 */
function guvenliSektorGorseli(gorselUrl?: string | null): string | null {
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

export async function generateStaticParams() {
  const { data, error } = await supabase
    .from("sektor")
    .select("slug")
    .not("slug", "is", null);

  if (error) return [];

  return (data || [])
    .filter((sektor) => Boolean(sektor.slug))
    .map((sektor) => ({ slug: sektor.slug }));
}

/**
 * Metadata ve sayfa aynı veriyi kullandığı için sorgu sonucu render süresince
 * önbelleğe alınır. Böylece sektör/marka/kampanya sorguları iki kez çalışmaz.
 */
const sektorVerisiniGetir = cache(async (slug: string) => {
  const { data: sektor, error: sektorHatasi } = await supabase
    .from("sektor")
    .select("id, sektor_adi, slug, gorsel_url")
    .eq("slug", slug)
    .maybeSingle();

  if (sektorHatasi || !sektor) return null;

  const { data: markaData, error: markaHatasi } = await supabase
    .from("marka")
    .select("id, marka_adi, slug, sektor_id, ek_sektor_idler")
    .or(`sektor_id.eq.${sektor.id},ek_sektor_idler.cs.{${sektor.id}}`)
    .not("slug", "is", null);

  const markaListesi = markaHatasi ? [] : markaData || [];
  const markaIdleri = markaListesi.map((marka) => marka.id);
  const bugun = turkiyeBugunu();

  const dogrudanKampanyaSorgusu = markaIdleri.length
    ? supabase
        .from("kampanya")
        .select("id, fayd_marka")
        .in("fayd_marka", markaIdleri)
        .or(`bitis_date.gte.${bugun},bitis_date.is.null`)
        .limit(5000)
    : Promise.resolve({ data: [] as Array<{ id: number; fayd_marka: number }> });

  const sektorKampanyasiSorgusu = supabase
    .from("kampanya")
    .select("id, fayd_marka")
    .eq("gecerli_sektor_id", sektor.id)
    .is("fayd_marka", null)
    .or(`bitis_date.gte.${bugun},bitis_date.is.null`)
    .limit(5000);

  const [dogrudanRes, sektorGeneliRes] = await Promise.all([
    dogrudanKampanyaSorgusu,
    sektorKampanyasiSorgusu,
  ]);

  const dogrudanKampanyalar = dogrudanRes.data || [];
  const sektorGeneliKampanyalar = sektorGeneliRes.data || [];
  const markaSayaclari = new Map<string, number>();

  dogrudanKampanyalar.forEach((kampanya) => {
    const markaId = String(kampanya.fayd_marka);
    markaSayaclari.set(markaId, (markaSayaclari.get(markaId) || 0) + 1);
  });

  // Sektör geneli kampanyalar sektör toplamına eklenir; tek tek markaların
  // özel kampanyasıymış gibi marka sayaçlarına dağıtılmaz.
  const benzersizKampanyaIdleri = new Set([
    ...dogrudanKampanyalar.map((kampanya) => String(kampanya.id)),
    ...sektorGeneliKampanyalar.map((kampanya) => String(kampanya.id)),
  ]);

  const aktifMarkalar = markaListesi
    .map((marka) => ({
      ...marka,
      kampanyaSayisi: markaSayaclari.get(String(marka.id)) || 0,
    }))
    .filter((marka) => marka.kampanyaSayisi > 0)
    .sort((a, b) => {
      if (b.kampanyaSayisi !== a.kampanyaSayisi) {
        return b.kampanyaSayisi - a.kampanyaSayisi;
      }

      return a.marka_adi.localeCompare(b.marka_adi, "tr");
    });

  return {
    sektor,
    aktifMarkalar,
    toplamAktifKod: benzersizKampanyaIdleri.size,
  };
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const veri = await sektorVerisiniGetir(slug);

  if (!veri) notFound();

  const { sektor, aktifMarkalar, toplamAktifKod } = veri;
  const yil = new Date().getFullYear();
  const canonicalUrl = `${SITE_URL}/sektor/${sektor.slug}`;
  const indexlenebilir = toplamAktifKod > 0;

  const title = metniKisalt(
    `${sektor.sektor_adi} İndirim Kodları ve Kampanyaları ${yil} | biKodVardı`,
    65
  );

  const description = metniKisalt(
    `${sektor.sektor_adi} kategorisindeki ${aktifMarkalar.length} markanın ` +
      `${toplamAktifKod} güncel indirim kodu ve kampanyasını inceleyin. ` +
      `Yeni fırsatlar biKodVardı'da.`,
    155
  );

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    robots: {
      index: indexlenebilir,
      follow: true,
      googleBot: {
        index: indexlenebilir,
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
      type: "website",
      images: [
        {
          url: OG_IMAGE,
          width: 1200,
          height: 630,
          alt: `${sektor.sektor_adi} indirim kodları ve kampanyaları`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE],
    },
  };
}

export default async function SektorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const veri = await sektorVerisiniGetir(slug);

  if (!veri) notFound();

  const { sektor, aktifMarkalar, toplamAktifKod } = veri;
  const canonicalUrl = `${SITE_URL}/sektor/${sektor.slug}`;
  const sektorGorseli = guvenliSektorGorseli(sektor.gorsel_url);

  const [reklamUst, reklamAlt] = await Promise.all([
    getReklamlar("sektor_ust", 2),
    getReklamlar("sektor_alt", 2),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: `${sektor.sektor_adi} İndirim Kodları ve Kampanyaları`,
        description:
          `${sektor.sektor_adi} kategorisindeki aktif indirim kodları, ` +
          `marka kampanyaları ve güncel fırsatlar.`,
        inLanguage: "tr-TR",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        breadcrumb: { "@id": `${canonicalUrl}#breadcrumb` },
        ...(aktifMarkalar.length > 0
          ? { mainEntity: { "@id": `${canonicalUrl}#brand-list` } }
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
          {
            "@type": "ListItem",
            position: 2,
            name: sektor.sektor_adi,
            item: canonicalUrl,
          },
        ],
      },
      ...(aktifMarkalar.length > 0
        ? [
            {
              "@type": "ItemList",
              "@id": `${canonicalUrl}#brand-list`,
              name: `${sektor.sektor_adi} kategorisindeki aktif markalar`,
              numberOfItems: aktifMarkalar.length,
              itemListElement: aktifMarkalar.map((marka, index) => ({
                "@type": "ListItem",
                position: index + 1,
                name: marka.marka_adi,
                url: `${SITE_URL}/marka/${marka.slug}`,
              })),
            },
          ]
        : []),
    ],
  };

  const guvenliJsonLd = JSON.stringify(jsonLd)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");

  return (
    <main className="min-h-screen bg-[#F0F4F8] pb-20 text-left font-['Plus_Jakarta_Sans']">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: guvenliJsonLd }}
      />

      <div className="relative flex h-[35vh] w-full items-center overflow-hidden md:h-[40vh]">
        {sektorGorseli ? (
          <Image
            src={sektorGorseli}
            alt={`${sektor.sektor_adi} kampanyaları`}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-slate-100 to-white" />
        )}

        <div className="absolute inset-0 bg-gradient-to-r from-[#F0F4F8] via-white/20 to-black/5" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6">
          <div className="inline-block max-w-sm rounded-[2.5rem] border border-white/40 bg-white/70 p-6 shadow-2xl shadow-blue-900/5 backdrop-blur-2xl md:p-10">
            <nav aria-label="İçerik yolu">
              <Link
                href="/"
                className="mb-3 flex w-fit items-center gap-1 text-[9px] font-black uppercase tracking-[0.3em] text-blue-600 no-underline hover:underline"
              >
                ← Ana Sayfa
              </Link>
            </nav>

            <h1
              className="text-3xl font-[900] leading-tight tracking-tighter text-slate-900 md:text-4xl"
              style={{ fontFamily: "Outfit" }}
            >
              {sektor.sektor_adi} <br />
              <span className="font-light italic tracking-normal text-blue-600">
                Kodları
              </span>
            </h1>
          </div>
        </div>
      </div>

      <div className="relative z-20 mx-auto -mt-6 max-w-7xl px-6">
        <div className="mb-8 flex flex-wrap items-center gap-6 rounded-[2rem] border border-white bg-white/80 p-5 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
            </div>
            <div>
              <p
                className="text-lg font-[900] leading-none text-slate-900"
                style={{ fontFamily: "Outfit" }}
              >
                {toplamAktifKod}
              </p>
              <p className="mt-0.5 text-[8px] font-bold uppercase tracking-widest text-slate-400">
                Aktif Kampanya
              </p>
            </div>
          </div>

          <div className="hidden h-6 w-px bg-slate-200 md:block" />

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0F172A] text-white shadow-lg">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div>
              <p
                className="text-lg font-[900] leading-none text-slate-900"
                style={{ fontFamily: "Outfit" }}
              >
                {aktifMarkalar.length}
              </p>
              <p className="mt-0.5 text-[8px] font-bold uppercase tracking-widest text-slate-400">
                Aktif Marka
              </p>
            </div>
          </div>
        </div>

        {reklamUst.length > 0 && (
          <div className="mb-10">
            <ReklamAlani
              reklamlar={reklamUst}
              maxCount={2}
              variant="banner"
            />
          </div>
        )}

        {aktifMarkalar.length > 0 ? (
          <section aria-labelledby="aktif-markalar">
            <h2 id="aktif-markalar" className="sr-only">
              {sektor.sektor_adi} kategorisindeki aktif markalar
            </h2>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {aktifMarkalar.map((marka) => (
                <Link
                  key={marka.id}
                  href={`/marka/${marka.slug}`}
                  className="group relative flex flex-col overflow-hidden rounded-[2rem] border border-slate-800 bg-[#0F172A] p-5 shadow-lg transition-all duration-500 hover:-translate-y-1 hover:shadow-blue-600/20"
                >
                  <div className="relative z-10 mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-3.5 text-left">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-lg font-black text-[#0F172A] shadow-xl transition-transform group-hover:scale-105">
                        {marka.marka_adi.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-lg font-[800] leading-tight tracking-tight text-white">
                          {marka.marka_adi}
                        </h3>
                        <div className="mt-0.5 flex items-center gap-1">
                          <span className="h-1 w-1 animate-pulse rounded-full bg-blue-500" />
                          <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">
                            {marka.kampanyaSayisi} kampanya aktif
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 mt-auto flex items-center justify-between border-t border-slate-800 pt-4">
                    <span className="text-[9px] font-black uppercase tracking-[0.15em] text-blue-500">
                      Kampanyaları Gör
                    </span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/10 text-blue-500 transition-all group-hover:rotate-12 group-hover:bg-blue-600 group-hover:text-white">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : (
          <section className="rounded-[2.5rem] border border-slate-100 bg-white px-6 py-14 text-center shadow-sm">
            <h2 className="mb-2 text-2xl font-black text-slate-900">
              Aktif marka kampanyası bulunmuyor
            </h2>
            <p className="mx-auto max-w-xl text-sm leading-6 text-slate-500">
              {sektor.sektor_adi} kategorisindeki yeni fırsatlar eklendiğinde bu
              sayfada listelenecektir. Güncel kampanyaları ana sayfadan takip
              edebilirsiniz.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700"
            >
              Güncel Kampanyalara Dön
            </Link>
          </section>
        )}

        {reklamAlt.length > 0 && (
          <div className="mb-8 mt-12">
            <ReklamAlani
              reklamlar={reklamAlt}
              maxCount={2}
              variant="square"
            />
          </div>
        )}

        {toplamAktifKod > 0 && (
          <section className="mt-12 rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm md:p-12">
            <h2
              className="mb-4 text-2xl font-[900] tracking-tight text-slate-900"
              style={{ fontFamily: "Outfit" }}
            >
              {sektor.sektor_adi} İndirim Kodları ve Kampanyaları
            </h2>
            <p className="leading-7 text-slate-600">
              {sektor.sektor_adi} kategorisinde yer alan {aktifMarkalar.length}{" "}
              markanın toplam {toplamAktifKod} aktif fırsatını bu sayfadan
              karşılaştırabilirsiniz. Bir markayı seçerek güncel indirim
              kodlarını, kampanya koşullarını ve son kullanım tarihlerini
              inceleyebilirsiniz.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
