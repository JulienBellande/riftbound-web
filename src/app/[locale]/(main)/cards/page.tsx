import { getTranslations, setRequestLocale } from "next-intl/server";
import { getCards, getExtensions } from "@/lib/data/cards";
import { CardFiltersBar } from "@/components/cards/card-filters-bar";
import { CardsGrid } from "@/components/cards/cards-grid";
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
    domain: typeof sp.domain === "string" ? sp.domain : undefined,
    ...parseCostRange(typeof sp.cost === "string" ? sp.cost : undefined),
    sortBy:
      typeof sp.sort === "string"
        ? (sp.sort as CardFilters["sortBy"])
        : "name",
    sortOrder: sp.order === "desc" ? "desc" : "asc",
    page: 1,
    perPage: 30,
  };

  const [result, extensions] = await Promise.all([
    getCards(filters),
    getExtensions(),
  ]);

  const typedLocale = locale as SupportedLocale;

  // Stable key so the client grid resets when filters change
  const spKey = new URLSearchParams(
    Object.entries(sp).filter(([, v]) => typeof v === "string") as [
      string,
      string,
    ][]
  ).toString();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h1 className="text-3xl font-black tracking-tight text-zinc-100">
          {t("title")}
        </h1>
        <p className="text-sm text-zinc-500">
          {t("results", { count: result.total })}
        </p>
      </div>

      <div className="sticky top-14 z-30 -mx-4 mt-5 bg-zinc-950/70 px-4 py-3 backdrop-blur-md sm:mx-0 sm:rounded-xl sm:px-3">
        <CardFiltersBar extensions={extensions} />
      </div>

      {result.data.length === 0 ? (
        <p className="mt-16 text-center text-zinc-500">{t("noResults")}</p>
      ) : (
        <CardsGrid
          key={spKey}
          initialCards={result.data}
          total={result.total}
          locale={typedLocale}
        />
      )}
    </div>
  );
}
