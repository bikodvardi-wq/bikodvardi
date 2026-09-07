import type { Metadata } from "next";
import Link from "next/link";

const GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.bikodvardi.app";

export const metadata: Metadata = {
  title: "BiKodVardı Mobil Uygulaması | Android için İndir",
  description:
    "Güncel kampanyaları, ücretsiz fırsatları ve indirim kodlarını BiKodVardı Android uygulamasıyla cebinden takip et.",
  alternates: {
    canonical: "https://bikodvardi.com/app",
  },
  openGraph: {
    title: "BiKodVardı Mobil Uygulaması",
    description:
      "İndirim kodları ve güncel kampanyalar artık cebinde. BiKodVardı uygulamasını Google Play'den indir.",
    url: "https://bikodvardi.com/app",
    siteName: "BiKodVardı",
    type: "website",
  },
};

const ozellikler = [
  {
    baslik: "Güncel kampanyalar",
    aciklama:
      "Bankaların, operatörlerin ve yüzlerce markanın güncel fırsatlarını tek yerde gör.",
    ikon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7" />
        <path d="M2 7h20v5H2z" />
        <path d="M12 22V7" />
        <path d="M12 7H7.5a2.5 2.5 0 1 1 2.2-3.7L12 7Z" />
        <path d="M12 7h4.5a2.5 2.5 0 1 0-2.2-3.7L12 7Z" />
      </svg>
    ),
  },
  {
    baslik: "Ücretsiz fırsatlar",
    aciklama:
      "Gerçekten işine yarayan ücretsiz ürün, hizmet ve üyelik fırsatlarını kaçırma.",
    ikon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path d="M12 2v20" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    baslik: "Hızlı ve kolay erişim",
    aciklama:
      "Aradığın markayı veya kampanyayı saniyeler içerisinde bul ve ayrıntılarını incele.",
    ikon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </svg>
    ),
  },
];

export default function AppPage() {
  const uygulamaSchema = {
    "@context": "https://schema.org",
    "@type": "MobileApplication",
    name: "BiKodVardı",
    operatingSystem: "Android",
    applicationCategory: "ShoppingApplication",
    downloadUrl: GOOGLE_PLAY_URL,
    installUrl: GOOGLE_PLAY_URL,
    url: "https://bikodvardi.com/app",
    description:
      "Güncel kampanyaları, ücretsiz fırsatları ve indirim kodlarını takip edebileceğiniz Android uygulaması.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "TRY",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(uygulamaSchema),
        }}
      />

      <main className="min-h-screen bg-[#f8fafc] text-slate-900">
        {/* Üst menü */}
        <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
            <Link
              href="/"
              className="text-xl font-black tracking-tighter text-slate-900 no-underline"
              style={{ fontFamily: "Outfit" }}
            >
              bi<span className="text-blue-600">kod</span>vardı
            </Link>

            <Link
              href="/"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 no-underline transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
            >
              Ana sayfaya dön
            </Link>
          </div>
        </header>

        {/* Ana tanıtım */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#dbeafe_0%,transparent_46%)]"
          />

          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 md:px-8 md:py-24 lg:grid-cols-2 lg:gap-20">
            {/* Yazılar */}
            <div className="text-center lg:text-left">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3.5 py-2 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />

                <span className="text-xs font-bold text-slate-600">
                  Android uygulaması
                </span>
              </div>

              <h1
                className="text-4xl font-black leading-[1.05] tracking-[-0.04em] text-slate-950 sm:text-5xl md:text-6xl"
                style={{ fontFamily: "Outfit" }}
              >
                İndirim kodları
                <span className="block text-blue-600">artık cebinde.</span>
              </h1>

              <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-slate-500 lg:mx-0 md:text-lg">
                En güncel kampanyaları, ücretsiz fırsatları ve indirim
                kodlarını BiKodVardı mobil uygulamasıyla istediğin her yerde
                takip et.
              </p>

              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <a
                  href={GOOGLE_PLAY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-slate-950 px-6 py-4 text-left text-white no-underline shadow-xl shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-blue-600 sm:w-auto"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-7 w-7 shrink-0"
                    aria-hidden="true"
                  >
                    <path
                      fill="currentColor"
                      d="M3.6 2.4a2 2 0 0 0-.6 1.5v16.2a2 2 0 0 0 .6 1.5l9.2-9.6-9.2-9.6Zm10.5 10.9-2.3 2.4 5.8 3.3 3.3-1.9a1.8 1.8 0 0 0 0-3.2l-3.3-1.9-3.5 1.3Zm3.5-1.3-5.8-3.3 2.3 2.4 3.5.9ZM4.9 2.2l8 8.3-2.4 2.5L4.9 2.2Z"
                    />
                  </svg>

                  <span>
                    <span className="block text-[10px] font-medium uppercase tracking-wider text-slate-300 group-hover:text-blue-100">
                      Hemen indir
                    </span>

                    <span className="block text-base font-extrabold">
                      Google Play
                    </span>
                  </span>
                </a>

                <span className="text-xs font-semibold text-slate-400">
                  Ücretsiz • Android
                </span>
              </div>
            </div>

            {/* Telefon görünümü */}
            <div className="relative mx-auto w-full max-w-[360px]">
              <div
                aria-hidden="true"
                className="absolute inset-8 rounded-full bg-blue-500/20 blur-3xl"
              />

              <div className="relative rounded-[42px] border-[8px] border-slate-950 bg-slate-950 p-2 shadow-[0_35px_90px_rgba(15,23,42,0.28)]">
                <div className="overflow-hidden rounded-[30px] bg-[#f8fafc]">
                  <div className="flex items-center justify-between bg-white px-5 py-4">
                    <div
                      className="text-lg font-black tracking-tighter"
                      style={{ fontFamily: "Outfit" }}
                    >
                      bi<span className="text-blue-600">kod</span>vardı
                    </div>

                    <div className="h-8 w-8 rounded-full bg-blue-50" />
                  </div>

                  <div className="px-4 py-5">
                    <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-5 text-white">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-100">
                        Güncel fırsatlar
                      </p>

                      <p className="mt-2 text-xl font-black leading-tight">
                        Ödemeden önce
                        <br />
                        bi’koduna bak.
                      </p>
                    </div>

                    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="flex items-center justify-between">
                        <div className="h-9 w-9 rounded-xl bg-slate-100" />
                        <span className="rounded-lg bg-emerald-50 px-2 py-1 text-[9px] font-black text-emerald-600">
                          BEDAVA
                        </span>
                      </div>

                      <div className="mt-4 h-3 w-4/5 rounded-full bg-slate-900" />
                      <div className="mt-2 h-3 w-3/5 rounded-full bg-slate-200" />

                      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
                        <div className="h-2.5 w-20 rounded-full bg-slate-200" />
                        <div className="h-8 w-20 rounded-lg bg-slate-900" />
                      </div>
                    </div>

                    <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="flex items-center justify-between">
                        <div className="h-9 w-9 rounded-xl bg-slate-100" />
                        <span className="rounded-lg bg-blue-50 px-2 py-1 text-[9px] font-black text-blue-600">
                          İNDİRİM
                        </span>
                      </div>

                      <div className="mt-4 h-3 w-3/4 rounded-full bg-slate-900" />
                      <div className="mt-2 h-3 w-1/2 rounded-full bg-slate-200" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Özellikler */}
        <section className="border-y border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-20">
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
                Neden BiKodVardı?
              </p>

              <h2
                className="mt-3 text-2xl font-black tracking-tight text-slate-950 md:text-3xl"
                style={{ fontFamily: "Outfit" }}
              >
                Tasarruf etmenin kolay yolu
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {ozellikler.map((ozellik) => (
                <article
                  key={ozellik.baslik}
                  className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-6"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                    {ozellik.ikon}
                  </div>

                  <h3 className="mt-5 text-base font-extrabold text-slate-900">
                    {ozellik.baslik}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {ozellik.aciklama}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Alt çağrı */}
        <section className="px-5 py-16 md:px-8 md:py-24">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-slate-950 px-6 py-12 text-center shadow-2xl md:px-12 md:py-16">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-300">
              BiKodVardı Android
            </p>

            <h2
              className="mt-4 text-3xl font-black tracking-tight text-white md:text-4xl"
              style={{ fontFamily: "Outfit" }}
            >
              Daha fazla ödeme yapmadan önce kontrol et.
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-400 md:text-base">
              Güncel indirim ve kampanyalara ücretsiz ulaşmak için uygulamayı
              şimdi indir.
            </p>

            <a
              href={GOOGLE_PLAY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-extrabold text-white no-underline transition hover:bg-blue-500"
            >
              Google Play’den ücretsiz indir →
            </a>
          </div>
        </section>

        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-8 text-center sm:flex-row sm:text-left md:px-8">
            <Link
              href="/"
              className="text-sm font-black tracking-tight text-slate-900 no-underline"
            >
              bi<span className="text-blue-600">kod</span>vardı
            </Link>

            <p className="text-xs text-slate-400">
              © 2026 BiKodVardı — Tüm hakları saklıdır.
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}