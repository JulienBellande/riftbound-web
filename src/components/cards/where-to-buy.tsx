"use client";

import { useLocale, useTranslations } from "next-intl";
import { ExternalLink } from "lucide-react";
import { formatPrice } from "@/lib/utils/format";
import type { BuyOption } from "@/lib/buy-links";
import type { SupportedLocale } from "@/types";

export function WhereToBuy({ options }: { options: BuyOption[] }) {
  const t = useTranslations("buy");
  const locale = useLocale() as SupportedLocale;
  if (options.length === 0) return null;

  // After sorting, the first priced option is the cheapest.
  const cheapest = options.find((o) => o.priceEur !== null) ?? null;

  return (
    <div className="mt-6">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
        {t("title")}
      </h2>
      <ul className="mt-2 divide-y divide-zinc-800 overflow-hidden rounded-lg border border-zinc-800">
        {options.map((o) => (
          <li
            key={o.source}
            className="flex items-center justify-between gap-3 bg-zinc-900 px-4 py-3"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-zinc-100">{o.label}</p>
              {o.priceEur !== null ? (
                <p className="mt-0.5 text-xs text-zinc-500">
                  {t("from")}{" "}
                  <span className="font-semibold text-emerald-400">
                    {formatPrice(o.priceEur, "EUR", locale)}
                  </span>
                  {cheapest === o && (
                    <span className="ml-2 rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300">
                      {t("bestPrice")}
                    </span>
                  )}
                </p>
              ) : (
                <p className="mt-0.5 text-xs text-zinc-600">{t("checkOffers")}</p>
              )}
            </div>
            <a
              href={o.url}
              target="_blank"
              rel="nofollow sponsored noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-900 transition-colors hover:bg-white"
            >
              {o.priceEur !== null ? t("buy") : t("see")}
              <ExternalLink size={13} />
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-1.5 text-[10px] text-zinc-700">{t("disclosure")}</p>
    </div>
  );
}
