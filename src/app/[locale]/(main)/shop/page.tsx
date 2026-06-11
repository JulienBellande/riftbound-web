import { useTranslations } from "next-intl";

export default function ShopPage() {
  const t = useTranslations("shop");

  const categories = [
    "all",
    "playmat",
    "sleeves",
    "deckbox",
    "figurine",
    "clothing",
    "accessory",
  ] as const;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-zinc-100">{t("title")}</h1>

      {/* Category Tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200 first:border-amber-600 first:bg-amber-600/10 first:text-amber-500"
          >
            {t(`categories.${cat}`)}
          </button>
        ))}
      </div>

      {/* Product Grid (placeholder) */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="group rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition-all hover:border-zinc-700"
          >
            <div className="aspect-square rounded-lg bg-zinc-800/50" />
            <div className="mt-4 h-4 w-3/4 rounded bg-zinc-800" />
            <div className="mt-2 h-3 w-1/3 rounded bg-zinc-800/50" />
            <button className="mt-4 w-full rounded-lg bg-amber-600 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-500">
              {t("addToCart")}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
