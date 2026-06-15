import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { getPriceRows } from "@/lib/data/cards";
import { Pagination } from "@/components/ui/pagination";
import { PricesToolbar } from "@/components/cards/prices-toolbar";
import {
  formatPrice,
  formatTrend,
  localizedName,
  priceForCurrency,
} from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { Currency, SupportedLocale } from "@/types";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "prices" });
  return { title: `${t("title")} | RiftForge` };
}

export default async function PricesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const sp = await searchParams;
  const t = await getTranslations({ locale, namespace: "prices" });
  const tCards = await getTranslations({ locale, namespace: "cards" });
  const typedLocale = locale as SupportedLocale;

  const currency: Currency = ["EUR", "USD", "GBP"].includes(
    sp.currency as string
  )
    ? (sp.currency as Currency)
    : "EUR";

  const result = await getPriceRows({
    search: typeof sp.q === "string" ? sp.q : undefined,
    sortOrder: sp.order === "asc" ? "asc" : "desc",
    page: typeof sp.page === "string" ? Number(sp.page) : 1,
    perPage: 50,
  });

  const lastUpdate = result.data[0]?.latestPrice?.fetchedAt;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">{t("title")}</h1>
          {lastUpdate && (
            <p className="mt-1 text-sm text-zinc-500">
              {t("lastUpdate", {
                date: new Date(lastUpdate).toLocaleDateString(
                  locale === "fr" ? "fr-FR" : "en-GB"
                ),
              })}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6">
        <PricesToolbar currency={currency} />
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-900/50">
            <tr>
              <th className="px-4 py-3 font-semibold text-zinc-400">
                {tCards("sort.name")}
              </th>
              <th className="hidden px-4 py-3 font-semibold text-zinc-400 sm:table-cell">
                {tCards("filters.extension")}
              </th>
              <th className="hidden px-4 py-3 font-semibold text-zinc-400 md:table-cell">
                {tCards("filters.rarity")}
              </th>
              <th className="px-4 py-3 text-right font-semibold text-zinc-400">
                {tCards("sort.price")} ({currency})
              </th>
              <th className="px-4 py-3 text-right font-semibold text-zinc-400">
                {t("trend7d")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {result.data.map((row) => (
              <tr key={row.id} className="transition-colors hover:bg-zinc-900/30">
                <td className="px-4 py-3">
                  <Link
                    href={{ pathname: "/cards/[id]", params: { id: row.id } }}
                    className="font-medium text-zinc-200 hover:text-amber-400"
                  >
                    {localizedName(row, typedLocale)}
                  </Link>
                </td>
                <td className="hidden px-4 py-3 text-zinc-500 sm:table-cell">
                  {row.extension.code}
                </td>
                <td className="hidden px-4 py-3 text-zinc-500 md:table-cell">
                  {tCards(`rarities.${row.rarity}`)}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-zinc-100">
                  {row.latestPrice
                    ? formatPrice(
                        priceForCurrency(row.latestPrice, currency),
                        currency,
                        typedLocale
                      )
                    : "—"}
                </td>
                <td
                  className={cn(
                    "px-4 py-3 text-right font-medium",
                    row.trend7d === null
                      ? "text-zinc-600"
                      : row.trend7d > 0
                        ? "text-emerald-500"
                        : row.trend7d < 0
                          ? "text-red-500"
                          : "text-zinc-500"
                  )}
                >
                  {row.trend7d !== null ? formatTrend(row.trend7d) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={result.page} totalPages={result.totalPages} />
    </div>
  );
}
