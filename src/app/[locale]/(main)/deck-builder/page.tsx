import { useTranslations } from "next-intl";

export default function DeckBuilderPage() {
  const t = useTranslations("deckBuilder");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-zinc-100">{t("title")}</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left: Card Search + Results */}
        <div>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder={t("cardSearch")}
              className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Card search results grid */}
          <div className="mt-4 grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="cursor-pointer rounded-xl border border-zinc-800 bg-zinc-900/50 p-2 transition-all hover:border-amber-600/50 hover:shadow-lg hover:shadow-amber-600/5"
              >
                <div className="aspect-[2.5/3.5] rounded-lg bg-zinc-800/50" />
                <div className="mt-2 h-2.5 w-3/4 rounded bg-zinc-800" />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Deck Panel */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="space-y-3">
            <input
              type="text"
              placeholder={t("deckName")}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
            />
            <select className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-300 focus:border-amber-500 focus:outline-none">
              <option value="standard">Standard</option>
              <option value="extended">Extended</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <div className="mt-4 border-t border-zinc-800 pt-4">
            <h3 className="text-sm font-semibold text-zinc-300">
              {t("deckList")}
            </h3>
            <p className="mt-1 text-xs text-zinc-500">
              {t("totalCards", { count: 0 })}
            </p>

            {/* Drop zone placeholder */}
            <div className="mt-4 flex min-h-[200px] items-center justify-center rounded-lg border-2 border-dashed border-zinc-700 text-sm text-zinc-500">
              {t("dragHint")}
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button className="flex-1 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-500">
              {t("save")}
            </button>
            <button className="flex-1 rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500">
              {t("publish")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
