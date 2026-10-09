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



function metniKisalt(metin: string, uzunluk: number): string {

  if (metin.length <= uzunluk) return metin;



  const kesilmis = metin.slice(0, uzunluk - 3);

  const sonBosluk = kesilmis.lastIndexOf(" ");

  const guvenliMetin = sonBosluk > uzunluk * 0.7

    ? kesilmis.slice(0, sonBosluk)

    : kesilmis;



  return `${guvenliMetin.trim()}...`;

}



function kalanGunHesapla(bitisTarihi?: string | null): number | null {

  if (!bitisTarihi) return null;



  const tarih = bitisTarihi.slice(0, 10);



  if (!/^\d{4}-\d{2}-\d{2}$/.test(tarih)) return null;



  const [bitisYil, bitisAy, bitisGun] = tarih.split("-").map(Number);

  const [bugunYil, bugunAy, bugunGun] = turkiyeBugunu().split("-").map(Number);



  const fark =

    Date.UTC(bitisYil, bitisAy - 1, bitisGun) -

    Date.UTC(bugunYil, bugunAy - 1, bugunGun);



  const gun = Math.round(fark / 86_400_000);

  return gun >= 0 ? gun : null;

}



const markayiGetir = cache(async (slug: string) => {

  const { data, error } = await supabase

    .from("marka")

    .select(`

      id,

      marka_adi,

      slug,

      aciklama,

      logo_url,

      sektor_id,

      web_site_url,

      affiliate_link,

      sektor_bilgisi:sektor_id (

        slug,

        sektor_adi

      )

    `)

    .eq("slug", slug)

    .maybeSingle();



  if (error) return null;

  return data;

});



const aktifKampanyaSayisiniGetir = cache(async (markaId: number) => {

  const { count, error } = await supabase

    .from("kampanya")

    .select("id", { count: "exact", head: true })

    .eq("fayd_marka", markaId)

    .or(`bitis_date.gte.${turkiyeBugunu()},bitis_date.is.null`);



  return { count: count || 0, error };

});



async function benzerAktifMarkalariGetir(

  sektorId: number | null,

  mevcutMarkaId: number

) {

  if (!sektorId) return [];



  const { data: adaylar } = await supabase

    .from("marka")

    .select("id, slug, marka_adi")

    .eq("sektor_id", sektorId)

    .neq("id", mevcutMarkaId)

    .not("slug", "is", null)

    .order("marka_adi", { ascending: true })

    .limit(25);



  if (!adaylar?.length) return [];



  const adayIdleri = adaylar.map((marka) => marka.id);

  const { data: aktifKampanyalar } = await supabase

    .from("kampanya")

    .select("fayd_marka")

    .in("fayd_marka", adayIdleri)

    .or(`bitis_date.gte.${turkiyeBugunu()},bitis_date.is.null`)

    .limit(1000);



  const aktifMarkaIdleri = new Set(

    (aktifKampanyalar || []).map((kampanya) => String(kampanya.fayd_marka))

  );



  return adaylar

    .filter((marka) => aktifMarkaIdleri.has(String(marka.id)))

    .slice(0, 5);

}



export async function generateMetadata({

  params,

}: {

  params: Promise<{ slug: string }>;

}): Promise<Metadata> {

  const { slug } = await params;

  const marka = await markayiGetir(slug);



  if (!marka) notFound();



  const { count, error } = await aktifKampanyaSayisiniGetir(marka.id);

  // Geçici sorgu hatasında değerli bir sayfayı yanlışlıkla dizinden çıkarmıyoruz.

  const indexlenebilir = error ? true : count > 0;

  const yil = new Date().getFullYear();

  const canonicalUrl = `${SITE_URL}/marka/${marka.slug}`;



  const varsayilanAciklama =

    `${marka.marka_adi} indirim kodları, kuponları ve güncel kampanyalarını ` +

    `inceleyin. Aktif ${marka.marka_adi} fırsatları biKodVardı'da.`;



  const description = metniKisalt(

    metniTemizle(marka.aciklama) || varsayilanAciklama,

    155

  );



  const title = metniKisalt(

    `${marka.marka_adi} İndirim Kodları ve Kampanyaları ${yil} | biKodVardı`,

    65

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

          alt: `${marka.marka_adi} indirim kodları ve kampanyaları`,

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



export default async function MarkaPage({

  params,

}: {

  params: Promise<{ slug: string }>;

}) {

  const { slug } = await params;

  const marka = await markayiGetir(slug);



  if (!marka) notFound();



  const bugun = turkiyeBugunu();



  const [kampanyalarRes, reklamUst, reklamAlt, benzerMarkalar] =

    await Promise.all([

      supabase

        .from("kampanya")

        .select(`

          id,

          baslik,

          slug,

          bitis_date,

          kampanya_turu,

          tiklanma_sayisi,

          yapan_marka_bilgisi:yapan_marka (

            marka_adi,

            logo_url

          ),

          tur_bilgisi:kampanya_turu (

            tur_adi

          )

        `)

        .eq("fayd_marka", marka.id)

        .or(`bitis_date.gte.${bugun},bitis_date.is.null`)

        .order("id", { ascending: false }),

      getReklamlar("marka_ust", 2),

      getReklamlar("marka_alt", 2),

      benzerAktifMarkalariGetir(marka.sektor_id, marka.id),

    ]);



  // Aynı kampanya ilişki veya veri tekrarı nedeniyle birden fazla kez
  // dönerse kullanıcıya yalnızca bir kez gösterilir.
  const kampanyaListesi = Array.from(
    new Map(
      (kampanyalarRes.data || [])
        .filter((kampanya) => kampanya.slug)
        .map((kampanya) => [kampanya.slug, kampanya] as const)
    ).values()
  );

  const sektorData = Array.isArray(marka.sektor_bilgisi)

    ? marka.sektor_bilgisi[0]

    : marka.sektor_bilgisi;

  const sektorAdi = sektorData?.sektor_adi || "Kategoriler";

  const geriLink = sektorData?.slug ? `/sektor/${sektorData.slug}` : "/";

  const canonicalUrl = `${SITE_URL}/marka/${marka.slug}`;

  const temizMarkaAciklamasi =

    metniTemizle(marka.aciklama) ||

    `En güncel ${marka.marka_adi} indirim kodlarını ve kampanyalarını inceleyin.`;



  const faqItems = [

    {

      soru: `${marka.marka_adi} kampanyaları nasıl bulunur?`,

      cevap:

        `biKodVardı'da ${marka.marka_adi} için halen geçerli olan kampanyalar ` +

        `bu sayfada listelenir. Fırsatın ayrıntılarını ve kullanım koşullarını ` +

        `görmek için ilgili kampanyayı açabilirsiniz.`,

    },

    {

      soru: `${marka.marka_adi} indirim kodu nasıl kullanılır?`,

      cevap:

        `Kampanya sayfasında bir indirim kodu bulunuyorsa kodu kopyalayın. ` +

        `${marka.marka_adi} ödeme ekranındaki kupon veya indirim kodu alanına ` +

        `yapıştırın ve kampanya koşullarını kontrol edin.`,

    },

  ];



  const jsonLd = {

    "@context": "https://schema.org",

    "@graph": [

      {

        "@type": "CollectionPage",

        "@id": `${canonicalUrl}#webpage`,

        url: canonicalUrl,

        name: `${marka.marka_adi} İndirim Kodları ve Kampanyaları`,

        description: temizMarkaAciklamasi,

        inLanguage: "tr-TR",

        isPartOf: { "@id": `${SITE_URL}/#website` },

        breadcrumb: { "@id": `${canonicalUrl}#breadcrumb` },

        about: {

          "@type": "Brand",

          name: marka.marka_adi,

          ...(marka.logo_url ? { logo: marka.logo_url } : {}),

        },

        ...(kampanyaListesi.length > 0

          ? { mainEntity: { "@id": `${canonicalUrl}#campaign-list` } }

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

          ...(sektorData?.slug

            ? [

                {

                  "@type": "ListItem",

                  position: 2,

                  name: sektorAdi,

                  item: `${SITE_URL}/sektor/${sektorData.slug}`,

                },

              ]

            : []),

          {

            "@type": "ListItem",

            position: sektorData?.slug ? 3 : 2,

            name: marka.marka_adi,

            item: canonicalUrl,

          },

        ],

      },

      ...(kampanyaListesi.length > 0

        ? [

            {

              "@type": "ItemList",

              "@id": `${canonicalUrl}#campaign-list`,

              name: `${marka.marka_adi} aktif kampanyaları`,

              numberOfItems: kampanyaListesi.length,

              itemListElement: kampanyaListesi.map((kampanya, index) => ({

                "@type": "ListItem",

                position: index + 1,

                name: kampanya.baslik,

                url: `${SITE_URL}/kampanya/${kampanya.slug}`,

              })),

            },

            {

              "@type": "FAQPage",

              "@id": `${canonicalUrl}#faq`,

              mainEntity: faqItems.map((item) => ({

                "@type": "Question",

                name: item.soru,

                acceptedAnswer: {

                  "@type": "Answer",

                  text: item.cevap,

                },

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

    <main className="min-h-screen bg-[#F0F4F8] pb-24 text-left font-['Plus_Jakarta_Sans']">

      <script

        type="application/ld+json"

        dangerouslySetInnerHTML={{ __html: guvenliJsonLd }}

      />



      <div className="relative overflow-hidden border-b border-slate-200 bg-white pb-12 pt-6">

        <div className="pointer-events-none absolute right-0 top-0 select-none text-[180px] font-black uppercase leading-none tracking-tighter opacity-[0.02]">

          {marka.marka_adi?.charAt(0) || "B"}

        </div>



        <div className="relative z-10 mx-auto max-w-7xl px-6">

          <nav

            aria-label="İçerik yolu"

            className="mb-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400"

          >

            <Link href="/" className="transition-colors hover:text-blue-600">

              Ana Sayfa

            </Link>

            <span aria-hidden="true">/</span>

            {sektorData?.slug && (

              <>

                <Link

                  href={`/sektor/${sektorData.slug}`}

                  className="transition-colors hover:text-blue-600"

                >

                  {sektorAdi}

                </Link>

                <span aria-hidden="true">/</span>

              </>

            )}

            <span aria-current="page" className="text-slate-900">

              {marka.marka_adi} Mağazası

            </span>

          </nav>



          <div className="mb-8 flex items-start justify-between">

            <Link

              href={geriLink}

              className="group flex items-center gap-2 border-none bg-transparent p-0 text-slate-400 no-underline transition-colors hover:text-blue-600"

            >

              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 shadow-sm transition-all group-hover:bg-blue-600 group-hover:text-white">

                <svg

                  width="16"

                  height="16"

                  viewBox="0 0 24 24"

                  fill="none"

                  stroke="currentColor"

                  strokeWidth="3"

                  strokeLinecap="round"

                  strokeLinejoin="round"

                  aria-hidden="true"

                >

                  <line x1="19" y1="12" x2="5" y2="12" />

                  <polyline points="12 19 5 12 12 5" />

                </svg>

              </span>

              <span className="text-[9px] font-black uppercase leading-none tracking-[0.2em]">

                Geri Dön

              </span>

            </Link>



            {marka.web_site_url && (

              <a

                href={marka.web_site_url}

                target="_blank"

                rel="noopener noreferrer"

                className="group flex items-center gap-3 rounded-2xl bg-slate-900 px-5 py-2.5 text-white no-underline shadow-lg transition-all hover:bg-blue-600"

              >

                <span className="text-[10px] font-black uppercase tracking-widest">

                  Mağazaya Git

                </span>

                <svg

                  className="transition-transform group-hover:translate-x-1"

                  width="14"

                  height="14"

                  viewBox="0 0 24 24"

                  fill="none"

                  stroke="currentColor"

                  strokeWidth="3"

                  aria-hidden="true"

                >

                  <line x1="7" y1="17" x2="17" y2="7" />

                  <polyline points="7 7 17 7 17 17" />

                </svg>

              </a>

            )}

          </div>



          <div className="flex flex-col items-center gap-6 md:flex-row">

            <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-[1.8rem] border border-slate-100 bg-white p-3 text-[#0F172A] shadow-xl ring-4 ring-slate-50">

              {marka.logo_url ? (

                <Image

                  src={marka.logo_url}

                  fill

                  sizes="80px"

                  className="object-contain p-3"

                  alt={`${marka.marka_adi} logosu`}

                  priority

                />

              ) : (

                <span className="text-3xl font-black text-slate-900">

                  {marka.marka_adi?.charAt(0)}

                </span>

              )}

            </div>



            <div className="text-center md:text-left">

              <h1

                className="mb-2 text-4xl font-[900] tracking-tighter text-slate-900 md:text-5xl"

                style={{ fontFamily: "Outfit" }}

              >

                {marka.marka_adi} İndirim Kodları ve Kampanyaları

              </h1>

              <div className="inline-flex items-center gap-2.5 rounded-xl bg-blue-600 px-4 py-1.5 text-white shadow-md">

                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />

                <p className="text-[10px] font-black uppercase leading-none tracking-widest">

                  {kampanyaListesi.length} aktif fırsat listeleniyor

                </p>

              </div>

            </div>

          </div>

          {!marka.logo_url && (

            <div

              data-nosnippet=""

              className="mt-7 flex max-w-3xl flex-col gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 px-5 py-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between"

            >

              <div>

                <p className="font-bold text-slate-900">

                  Bu markayı temsil ediyor musunuz?

                </p>

                <p className="mt-1 text-xs font-medium leading-5 text-slate-500">

                  Markanızın resmî logosunun ve kurumsal bilgilerinin

                  BiKodVardı&apos;da doğru görünmesi için bize ulaşabilirsiniz.

                </p>

              </div>

              <a

                href={`mailto:iletisim@bikodvardi.com?subject=${encodeURIComponent(

                  `${marka.marka_adi} logo ve kurumsal bilgi güncelleme talebi`

                )}`}

                className="shrink-0 rounded-xl bg-white px-4 py-2.5 text-center text-[10px] font-black uppercase tracking-widest text-blue-600 no-underline shadow-sm ring-1 ring-blue-100 transition hover:bg-blue-600 hover:text-white"

              >

                E-posta Gönder

              </a>

            </div>

          )}

        </div>

      </div>



      <div className="mx-auto mt-10 max-w-5xl px-6">

        {reklamUst.length > 0 && (

          <div className="mb-10">

            <ReklamAlani

              reklamlar={reklamUst}

              maxCount={2}

              variant="banner"

            />

          </div>

        )}



        <div className="space-y-6">

          {kampanyaListesi.map((kampanya) => {

            const gun = kalanGunHesapla(kampanya.bitis_date);

            const markaBilgisi = Array.isArray(kampanya.yapan_marka_bilgisi)

              ? kampanya.yapan_marka_bilgisi[0]

              : kampanya.yapan_marka_bilgisi;

            const yapanMarkaAdi = markaBilgisi?.marka_adi || "Fırsat";

            const yapanMarkaLogo = markaBilgisi?.logo_url;

            const turBilgisi = Array.isArray(kampanya.tur_bilgisi)

              ? kampanya.tur_bilgisi[0]

              : kampanya.tur_bilgisi;

            const turAdi =

              turBilgisi?.tur_adi || kampanya.kampanya_turu || "Kampanya";

            const tiklanma = Number(kampanya.tiklanma_sayisi || 0);



            return (

              <article

                key={kampanya.id}

                className="group relative flex flex-col overflow-hidden rounded-[2.5rem] border border-slate-800 bg-[#0F172A] shadow-xl transition-all hover:shadow-2xl lg:flex-row"

              >

                {gun !== null && (

                  <div className="absolute right-8 top-0 z-20 flex min-w-[50px] flex-col items-center rounded-b-xl bg-blue-600 px-3 py-3 shadow-lg">

                    <span

                      className="text-lg font-black leading-none text-white"

                      style={{ fontFamily: "Outfit" }}

                    >

                      {gun}

                    </span>

                    <span className="mt-0.5 text-[7px] font-black uppercase text-white/80">

                      Gün

                    </span>

                  </div>

                )}



                <div className="relative flex-1 overflow-hidden p-8 text-left md:p-10">

                  <div className="pointer-events-none absolute -bottom-10 -right-4 select-none text-[120px] font-black uppercase text-white/[0.02]">

                    {yapanMarkaAdi.charAt(0)}

                  </div>



                  <div className="mb-6 flex items-start justify-between">

                    <div className="inline-flex items-center gap-2.5 rounded-xl bg-white px-2 py-1.5 shadow-lg">

                      <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 p-1.5 text-xs font-black text-[#0F172A]">

                        {yapanMarkaLogo ? (

                          <Image

                            src={yapanMarkaLogo}

                            fill

                            sizes="32px"

                            className="object-contain p-1.5"

                            alt={`${yapanMarkaAdi} logosu`}

                          />

                        ) : (

                          yapanMarkaAdi.charAt(0)

                        )}

                      </div>

                      <span

                        className="pr-3 text-xs font-black uppercase tracking-tight text-[#0F172A]"

                        style={{ fontFamily: "Outfit" }}

                      >

                        {yapanMarkaAdi}

                      </span>

                    </div>



                    {tiklanma > 0 && (

                      <div className="hidden items-center gap-1.5 rounded-lg border border-orange-500/20 bg-orange-500/10 px-3 py-1.5 md:flex">

                        <span className="text-[10px]" aria-hidden="true">

                          🔥

                        </span>

                        <span className="text-[9px] font-black uppercase tracking-widest text-orange-400">

                          {tiklanma.toLocaleString("tr-TR")} kullanım

                        </span>

                      </div>

                    )}

                  </div>



                  <h2

                    className="relative z-10 mb-6 text-2xl font-[800] leading-[1.2] tracking-tight text-white md:text-3xl"

                    style={{ fontFamily: "Outfit" }}

                  >

                    {kampanya.baslik}

                  </h2>



                  <div className="relative z-10 flex flex-wrap items-center gap-3 border-t border-white/5 pt-6">

                    <span className="rounded-md bg-blue-600 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-white">

                      {turAdi}

                    </span>

                    <p className="text-[10px] font-bold uppercase leading-none tracking-widest text-slate-500">

                      {marka.marka_adi} özel teklifi

                    </p>

                  </div>

                </div>



                <div className="flex flex-col items-center justify-center gap-3 border-t border-slate-800 bg-[#1e293b]/30 p-8 lg:w-64 lg:border-l lg:border-t-0">

                  {marka.affiliate_link && (

                    <a

                      href={marka.affiliate_link}

                      target="_blank"

                      rel="sponsored noopener noreferrer"

                      className="w-full animate-pulse rounded-[1.8rem] bg-orange-500 py-4 text-center text-[10px] font-black uppercase tracking-[0.15em] text-white no-underline shadow-xl transition-all hover:bg-orange-600"

                    >

                      Mağazaya Git

                    </a>

                  )}



                  <Link

                    href={`/kampanya/${kampanya.slug}`}

                    className="w-full rounded-[1.8rem] bg-white py-4 text-center text-[10px] font-black uppercase tracking-[0.15em] text-[#0F172A] no-underline shadow-xl transition-all hover:bg-blue-600 hover:text-white"

                  >

                    Kampanyayı İncele

                  </Link>

                </div>

              </article>

            );

          })}

        </div>



        {kampanyaListesi.length === 0 && (

          <div className="mt-8 rounded-[3rem] border border-slate-100 bg-white py-20 text-center shadow-sm">

            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50">

              <span className="text-3xl" aria-hidden="true">

                📭

              </span>

            </div>

            <h2

              className="mb-2 text-2xl font-black text-slate-900"

              style={{ fontFamily: "Outfit" }}

            >

              Şu an aktif fırsat bulunmuyor

            </h2>

            <p className="mb-8 font-medium text-slate-500">

              {sektorAdi} kategorisindeki diğer markaların indirimlerini

              inceleyebilirsiniz.

            </p>



            {benzerMarkalar.length > 0 && (

              <div className="flex flex-wrap justify-center gap-3">

                {benzerMarkalar.map((benzerMarka) => (

                  <Link

                    key={benzerMarka.slug}

                    href={`/marka/${benzerMarka.slug}`}

                    className="rounded-2xl bg-blue-50 px-6 py-3 text-sm font-bold text-blue-600 transition-all hover:bg-blue-600 hover:text-white"

                  >

                    {benzerMarka.marka_adi} Fırsatları

                  </Link>

                ))}

              </div>

            )}

          </div>

        )}



        {kampanyaListesi.length > 0 && (

          <section className="mt-16 rounded-[3rem] border border-slate-100 bg-white p-10 shadow-sm md:p-16">

            <h2

              className="mb-8 text-3xl font-[900] tracking-tighter text-slate-900"

              style={{ fontFamily: "Outfit" }}

            >

              {marka.marka_adi} Kampanyaları Hakkında

            </h2>



            <p className="mb-10 font-medium leading-relaxed text-slate-600">

              {temizMarkaAciklamasi}

            </p>



            <div className="grid gap-6 md:grid-cols-2">

              {faqItems.map((item) => (

                <div

                  key={item.soru}

                  className="rounded-3xl border border-slate-100 bg-slate-50 p-7"

                >

                  <h3 className="mb-3 font-bold text-slate-900">

                    {item.soru}

                  </h3>

                  <p className="text-sm font-medium leading-6 text-slate-600">

                    {item.cevap}

                  </p>

                </div>

              ))}

            </div>

          </section>

        )}



        {benzerMarkalar.length > 0 && kampanyaListesi.length > 0 && (

          <section className="mt-12 text-center" aria-labelledby="benzer-markalar">

            <h2

              id="benzer-markalar"

              className="mb-4 text-[10px] font-black uppercase tracking-widest text-slate-400"

            >

              Diğer {sektorAdi} markaları

            </h2>

            <div className="flex flex-wrap justify-center gap-2">

              {benzerMarkalar.map((benzerMarka) => (

                <Link

                  key={benzerMarka.slug}

                  href={`/marka/${benzerMarka.slug}`}

                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm transition-colors hover:text-blue-600"

                >

                  {benzerMarka.marka_adi}

                </Link>

              ))}

            </div>

          </section>

        )}

        <section

          data-nosnippet=""

          aria-labelledby="marka-is-birligi"

          className="relative mt-16 overflow-hidden rounded-[2.5rem] bg-[#0F172A] px-7 py-9 text-white shadow-xl md:px-12 md:py-11"

        >

          <div className="pointer-events-none absolute -right-8 -top-14 h-44 w-44 rounded-full bg-blue-600/20 blur-3xl" />

          <div className="relative flex flex-col gap-7 md:flex-row md:items-center md:justify-between">

            <div className="max-w-2xl">

              <p className="mb-2 text-[9px] font-black uppercase tracking-[0.25em] text-blue-400">

                Kurumsal İş Birliği

              </p>

              <h2

                id="marka-is-birligi"

                className="text-2xl font-[900] tracking-tight md:text-3xl"

                style={{ fontFamily: "Outfit" }}

              >

                BiKodVardı ile iş birliği yapın

              </h2>

              <p className="mt-3 text-sm font-medium leading-6 text-slate-300">

                {marka.marka_adi} kampanyalarını, indirimlerini ve marka

                avantajlarını kampanya arayan kullanıcılara ulaştırmak için

                bizimle iletişime geçebilirsiniz.

              </p>

            </div>

            <a

              href={`mailto:iletisim@bikodvardi.com?subject=${encodeURIComponent(

                `${marka.marka_adi} iş birliği talebi`

              )}`}

              className="shrink-0 rounded-2xl bg-blue-600 px-6 py-4 text-center text-[10px] font-black uppercase tracking-[0.18em] text-white no-underline shadow-lg transition hover:bg-white hover:text-slate-900"

            >

              İş Birliği İçin Yazın

            </a>

          </div>

        </section>

      </div>



      {reklamAlt.length > 0 && (

        <div className="mx-auto mb-8 mt-16 max-w-5xl px-6">

          <ReklamAlani

            reklamlar={reklamAlt}

            maxCount={2}

            variant="square"

          />

        </div>

      )}



      <footer className="mt-20 py-12 text-center opacity-40">

        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">

          bi<span className="text-blue-600">kod</span>vardı — {new Date().getFullYear()}

        </p>

      </footer>

    </main>

  );

}
