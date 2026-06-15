import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { getCards, getExtensions } from "@/lib/data/cards";
import { CardFiltersBar } from "@/components/cards/card-filters-bar";
import { CardFrame } from "@/components/cards/card-frame";
import { Pagination } from "@/components/ui/pagination";
import { formatPrice } from "@/lib/utils/format";
import type { CardFilters, SupportedLocale } from "@/types";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cards" });
  return { title: `${t("title")} | RiftForge` };
}

function parseCostRange(cost?: string): {
  costMin?: number;
  costMax?: number;
} {
  switch (cost) {
    case "0-2":
      return { costMin: 0, costMax: 2 };
    case "3-5":
      return { costMin: 3, costMax: 5 };
    case "6+":
      return { costMin: 6 };
    default:
      return {};
  }
}

export default async function CardsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const sp = await searchParams;
  const t = await getTranslations({ locale, namespace: "cards" });

  const filters: CardFilters = {
    search: typeof sp.q === "string" ? sp.q : undefined,
    extensionId: typeof sp.ext === "string" ? sp.ext : undefined,
    type: typeof sp.type === "string" ? sp.type : undefined,
    rarity: typeof sp.rarity === "string" ? sp.rarity : undefined,
    ...parseCostRange(typeof sp.cost === "string" ? sp.cost : undefined),
    sortBy:
      typeof sp.sort === "string"
        ? (sp.sort as CardFilters["sortBy"])
        : "name",
    sortOrder: sp.order === "desc" ? "desc" : "asc",
    page: typeof sp.page === "string" ? Number(sp.page) : 1,
    perPage: 24,
  };

  const [result, extensions] = await Promise.all([
    getCards(filters),
    getExtensions(),
  ]);

  const typedLocale = locale as SupportedLocale;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-zinc-100">{t("title")}</h1>

      <div className="mt-6">
        <CardFiltersBar extensions={extensions} />
      </div>

      <p className="mt-4 text-sm text-zinc-500">
        {t("results", { count: result.total })}
      </p>

      {result.data.length === 0 ? (
        <p className="mt-12 text-center text-zinc-500">{t("noResults")}</p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {result.data.map((card) => (
            <Link
              key={card.id}
              href={{ pathname: "/cards/[id]", params: { id: card.id } }}
              className="group"
            >
              <CardFrame card={card} locale={typedLocale} />
              {card.latestPrice && (
                <p className="mt-1.5 text-center text-xs font-medium text-amber-500">
                  {formatPrice(card.latestPrice.priceEur, "EUR", typedLocale)}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}

      <Pagination page={result.page} totalPages={result.totalPages} />
    </div>
  );
}
