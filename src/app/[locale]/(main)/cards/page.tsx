import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";

export default function CardsPage() {
  const t = useTranslations("cards");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-zinc-100">{t("title")}</h1>

      {/* Filters Bar */}
      <div className="mt-6 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder={t("search")}
          className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
        <select className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-300 focus:border-amber-500 focus:outline-none">
          <option>{t("filters.allExtensions")}</option>
        </select>
        <select className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-300 focus:border-amber-500 focus:outline-none">
          <option>{t("filters.allTypes")}</option>
        </select>
        <select className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-300 focus:border-amber-500 focus:outline-none">
          <option>{t("filters.allRarities")}</option>
        </select>
      </div>

      {/* Card Grid (placeholder) */}
      <div className="mt-8 grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {Array.from({ length: 18 }).map((_, i) => (
          <div
            key={i}
            className="group rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 transition-all hover:border-amber-600/50 hover:shadow-lg hover:shadow-amber-600/5"
          >
            <div className="aspect-[2.5/3.5] rounded-lg bg-zinc-800/50" />
            <div className="mt-3 h-3 w-3/4 rounded bg-zinc-800" />
            <div className="mt-1.5 h-2.5 w-1/2 rounded bg-zinc-800/50" />
          </div>
        ))}
      </div>

      <p className="mt-6 text-center text-sm text-zinc-500">
        {t("noResults")}
      </p>
    </div>
  );
}
