import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F8FAFC] px-4 py-16 font-['Plus_Jakarta_Sans'] text-slate-900">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_top,#dbeafe_0%,#eff6ff_38%,transparent_72%)]"
      />

      <div
        aria-hidden="true"
        className="absolute -left-24 bottom-10 h-64 w-64 rounded-full bg-blue-200/30 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -right-24 top-24 h-72 w-72 rounded-full bg-cyan-200/30 blur-3xl"
      />

      <section className="relative z-10 w-full max-w-2xl text-center">
        <Link
          href="/"
          aria-label="biKodVardı ana sayfa"
          className="mb-10 inline-block text-2xl font-[900] tracking-tighter text-slate-900 no-underline"
          style={{ fontFamily: "Outfit" }}
        >
          bi<span className="text-blue-600">kod</span>vardı
        </Link>

        <div className="rounded-[2rem] border border-slate-200 bg-white/90 px-6 py-10 shadow-[0_25px_80px_rgba(15,23,42,0.10)] backdrop-blur-sm sm:px-10 sm:py-14">
          <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="h-10 w-10"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 13 13 20a2 2 0 0 1-2.8 0L4 13.8V4h9.8L20 10.2a2 2 0 0 1 0 2.8Z" />
              <circle cx="8.5" cy="8.5" r="1.2" fill="currentColor" stroke="none" />
              <path d="m14 9 3 3" />
              <path d="m17 9-3 3" />
            </svg>
          </div>

          <p className="mb-3 text-xs font-black uppercase tracking-[0.24em] text-blue-600">
            404 · Sayfa bulunamadı
          </p>

          <h1
            className="text-3xl font-black tracking-[-0.035em] text-slate-950 sm:text-4xl md:text-5xl"
            style={{ fontFamily: "Outfit" }}
          >
            Bu fırsat sona ermiş olabilir.
          </h1>

          <p className="mx-auto mt-5 max-w-lg text-sm leading-6 text-slate-500 sm:text-base">
            Aradığın kampanya kaldırılmış, süresi dolmuş veya adresi değişmiş
            olabilir. Marka ya da kampanya adını yazarak güncel fırsatları
            kontrol edebilirsin.
          </p>

          <form
            action="/"
            method="get"
            role="search"
            className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row"
          >
            <label htmlFor="404-arama" className="sr-only">
              Marka veya kampanya ara
            </label>

            <div className="relative flex-1">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>

              <input
                id="404-arama"
                type="search"
                name="ara"
                required
                minLength={2}
                autoComplete="off"
                placeholder="Marka veya kampanya ara"
                className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <button
              type="submit"
              className="h-14 rounded-2xl bg-blue-600 px-7 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200"
            >
              Fırsat Ara
            </button>
          </form>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 border-t border-slate-100 pt-7">
            <Link
              href="/"
              className="rounded-full bg-slate-900 px-5 py-2.5 text-xs font-bold text-white no-underline transition hover:bg-blue-600"
            >
              Ana Sayfaya Dön
            </Link>

            <Link
              href="/blog"
              className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-600 no-underline transition hover:border-blue-200 hover:text-blue-600"
            >
              Alışveriş Rehberleri
            </Link>

            <Link
              href="/app"
              className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-600 no-underline transition hover:border-blue-200 hover:text-blue-600"
            >
              Mobil Uygulama
            </Link>
          </div>
        </div>

        <p className="mt-7 text-xs font-medium text-slate-400">
          Güncel indirim kodları ve kampanyalar için biKodVardı
        </p>
      </section>
    </main>
  );
}
