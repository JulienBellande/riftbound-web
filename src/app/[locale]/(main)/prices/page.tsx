import { useTranslations } from "next-intl";

export default function PricesPage() {
  const t = useTranslations("prices");
  const tCards = useTranslations("cards");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">{t("title")}</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {t("lastUpdate", { date: new Date().toLocaleDateString() })}
          </p>
        </div>
        <div className="flex gap-2">
          {(["EUR", "USD", "GBP"] as const).map((currency) => (
            <button
              key={currency}
              className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200 first:border-amber-600 first:bg-amber-600/10 first:text-amber-500"
            >
              {currency}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder={tCards("search")}
        className="mt-6 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
      />

      {/* Price Table (placeholder) */}
      <div className="mt-6 overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-900/50">
            <tr>
              <th className="px-4 py-3 font-semibold text-zinc-400">
                {tCards("sort.name")}
              </th>
              <th className="px-4 py-3 font-semibold text-zinc-400">
                Extension
              </th>
              <th className="px-4 py-3 font-semibold text-zinc-400">
                {tCards("filters.rarity")}
              </th>
              <th className="px-4 py-3 text-right font-semibold text-zinc-400">
                {tCards("sort.price")}
              </th>
              <th className="px-4 py-3 text-right font-semibold text-zinc-400">
                7j
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {Array.from({ length: 10 }).map((_, i) => (
              <tr
                key={i}
                className="transition-colors hover:bg-zinc-900/30"
              >
                <td className="px-4 py-3">
                  <div className="h-3 w-32 rounded bg-zinc-800" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-3 w-20 rounded bg-zinc-800/50" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-3 w-16 rounded bg-zinc-800/50" />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="ml-auto h-3 w-14 rounded bg-zinc-800" />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="ml-auto h-3 w-12 rounded bg-emerald-900/30" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
