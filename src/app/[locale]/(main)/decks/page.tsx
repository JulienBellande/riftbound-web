import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export default function DecksPage() {
  const t = useTranslations("decks");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-zinc-100">{t("title")}</h1>
        <Link
          href="/deck-builder"
          className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-500"
        >
          {t("create")}
        </Link>
      </div>

      {/* Period Tabs */}
      <div className="mt-6 flex gap-2">
        {(["topWeek", "topMonth", "all"] as const).map((period) => (
          <button
            key={period}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200 first:border-amber-600 first:bg-amber-600/10 first:text-amber-500"
          >
            {t(period)}
          </button>
        ))}
      </div>

      {/* Deck List (placeholder) */}
      <div className="mt-8 space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition-colors hover:border-zinc-700"
          >
            <div className="h-24 w-20 shrink-0 rounded-lg bg-zinc-800/50" />
            <div className="flex flex-1 flex-col justify-between">
              <div>
                <div className="h-4 w-48 rounded bg-zinc-800" />
                <div className="mt-2 h-3 w-32 rounded bg-zinc-800/50" />
              </div>
              <div className="flex gap-4">
                <div className="h-3 w-16 rounded bg-zinc-800/30" />
                <div className="h-3 w-16 rounded bg-zinc-800/30" />
                <div className="h-3 w-16 rounded bg-zinc-800/30" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
