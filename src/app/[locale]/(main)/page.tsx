import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export default function HomePage() {
  const t = useTranslations("home");

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950 py-24 sm:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-100 sm:text-5xl lg:text-6xl">
            {t("hero.title")}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-400">
            {t("hero.subtitle")}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/cards"
              className="rounded-xl bg-amber-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-600/25 transition-colors hover:bg-amber-500"
            >
              {t("hero.cta")}
            </Link>
            <Link
              href="/decks"
              className="rounded-xl border border-zinc-700 px-6 py-3 text-sm font-semibold text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-100"
            >
              {t("hero.ctaSecondary")}
            </Link>
          </div>
        </div>
      </section>

      {/* Top Decks Preview */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-zinc-100">
            {t("topDecks.title")}
          </h2>
          <Link
            href="/decks"
            className="text-sm font-medium text-amber-500 hover:text-amber-400"
          >
            {t("topDecks.viewAll")}
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition-colors hover:border-zinc-700"
            >
              <div className="h-32 rounded-lg bg-zinc-800/50" />
              <div className="mt-4 h-4 w-2/3 rounded bg-zinc-800" />
              <div className="mt-2 h-3 w-1/3 rounded bg-zinc-800/50" />
            </div>
          ))}
        </div>
      </section>

      {/* Latest News Preview */}
      <section className="border-t border-zinc-800 bg-zinc-900/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-zinc-100">
              {t("latestNews.title")}
            </h2>
            <Link
              href="/blog"
              className="text-sm font-medium text-amber-500 hover:text-amber-400"
            >
              {t("latestNews.viewAll")}
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6"
              >
                <div className="h-40 rounded-lg bg-zinc-800/50" />
                <div className="mt-4 h-4 w-3/4 rounded bg-zinc-800" />
                <div className="mt-2 h-3 w-1/2 rounded bg-zinc-800/50" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Price Movements Preview */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-zinc-100">
          {t("priceAlerts.title")}
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-500">
              {t("priceAlerts.rising")}
            </h3>
            <div className="mt-4 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg bg-zinc-800/30 px-4 py-3"
                >
                  <div className="h-3 w-1/3 rounded bg-zinc-700" />
                  <div className="h-3 w-16 rounded bg-emerald-900/50" />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-red-500">
              {t("priceAlerts.falling")}
            </h3>
            <div className="mt-4 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg bg-zinc-800/30 px-4 py-3"
                >
                  <div className="h-3 w-1/3 rounded bg-zinc-700" />
                  <div className="h-3 w-16 rounded bg-red-900/50" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
