import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
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

const RARITY_DOT: Record<string, string> = {
  COMMON: "bg-zinc-500",
  UNCOMMON: "bg-emerald-500",
  RARE: "bg-sky-500",
  EPIC: "bg-violet-500",
  SHOWCASE: "bg-amber-400",
  PROMO: "bg-fuchsia-500",
};

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
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 sm:text-2xl">
            {t("title")}
          </h1>
          {lastUpdate && (
            <p className="mt-1 text-xs text-zinc-500">
              {t("lastUpdate", {
                date: new Date(lastUpdate).toLocaleDateString(
                  locale === "fr" ? "fr-FR" : "en-GB"
                ),
              })}
            </p>
          )}
        </div>
        <PricesToolbar currency={currency} />
      </div>

      <div className="mt-5 overflow-hidden rounded-lg border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-900">
            <tr>
              <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                {tCards("sort.name")}
              </th>
              <th className="hidden px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-500 sm:table-cell">
                {tCards("filters.extension")}
              </th>
              <th className="hidden px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-500 md:table-cell">
                {tCards("filters.rarity")}
              </th>
              <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">
                {tCards("sort.price")} ({currency})
              </th>
              <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">
                {t("trend7d")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {result.data.map((row) => (
              <tr
                key={row.id}
                className="transition-colors hover:bg-zinc-900"
              >
                <td className="px-3 py-2">
                  <Link
                    href={{
                      pathname: "/cards/[id]",
                      params: { id: row.id },
                    }}
                    className="flex items-center gap-2.5 font-medium text-zinc-200 transition-colors hover:text-zinc-100"
                  >
                    {row.imageUrl ? (
                      <Image
                        src={row.imageUrl}
                        alt=""
                        width={28}
                        height={39}
                        quality={60}
                        className="shrink-0 rounded ring-1 ring-zinc-800"
                      />
                    ) : (
                      <span className="h-[39px] w-7 shrink-0 rounded bg-zinc-800" />
                    )}
                    <span className="truncate text-sm">
                      {localizedName(row, typedLocale)}
                    </span>
                  </Link>
                </td>
                <td className="hidden px-3 py-2 text-xs text-zinc-500 sm:table-cell">
                  {row.extension.code}
                </td>
                <td className="hidden px-3 py-2 md:table-cell">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full",
                        RARITY_DOT[row.rarity] ?? "bg-zinc-500"
                      )}
                    />
                    <span className="text-xs text-zinc-500">
                      {tCards(`rarities.${row.rarity}`)}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-2 text-right text-sm font-bold text-zinc-100">
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
                    "px-3 py-2 text-right text-xs font-semibold",
                    row.trend7d === null
                      ? "text-zinc-600"
                      : row.trend7d > 0
                        ? "text-emerald-400"
                        : row.trend7d < 0
                          ? "text-red-400"
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
