import type { Currency, SupportedLocale } from "@/types";

const LOCALE_TAGS: Record<SupportedLocale, string> = {
  fr: "fr-FR",
  en: "en-GB",
};

export function formatPrice(
  amount: number,
  currency: Currency,
  locale: SupportedLocale
): string {
  return new Intl.NumberFormat(LOCALE_TAGS[locale], {
    style: "currency",
    currency,
  }).format(amount);
}

export function priceForCurrency(
  price: { priceEur: number; priceUsd: number; priceGbp: number },
  currency: Currency
): number {
  switch (currency) {
    case "USD":
      return price.priceUsd;
    case "GBP":
      return price.priceGbp;
    default:
      return price.priceEur;
  }
}

export function formatTrend(trend: number): string {
  const sign = trend > 0 ? "+" : "";
  return `${sign}${trend.toFixed(1)}%`;
}

export function localizedName(
  entity: { nameFr: string; nameEn: string },
  locale: SupportedLocale
): string {
  return locale === "fr" ? entity.nameFr : entity.nameEn;
}

export function localizedDescription(
  entity: { descriptionFr: string | null; descriptionEn: string | null },
  locale: SupportedLocale
): string | null {
  return locale === "fr" ? entity.descriptionFr : entity.descriptionEn;
}
