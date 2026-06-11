"use client";

import { useRouter, usePathname } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";

const CATEGORIES = [
  "all",
  "PLAYMAT",
  "SLEEVES",
  "DECKBOX",
  "FIGURINE",
  "CLOTHING",
  "ACCESSORY",
] as const;

const LABEL_MAP: Record<string, string> = {
  all: "all",
  PLAYMAT: "playmat",
  SLEEVES: "sleeves",
  DECKBOX: "deckbox",
  FIGURINE: "figurine",
  CLOTHING: "clothing",
  ACCESSORY: "accessory",
};

export function ShopToolbar({
  currentCategory,
}: {
  currentCategory: string;
}) {
  const t = useTranslations("shop");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setCategory(cat: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (cat === "all") {
      params.delete("cat");
    } else {
      params.set("cat", cat);
    }
    params.delete("page");
    const qs = params.toString();
    // @ts-expect-error dynamic pathname
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => setCategory(cat)}
          className={cn(
            "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
            cat === currentCategory
              ? "border-amber-600 bg-amber-600/10 text-amber-500"
              : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
          )}
        >
          {t(`categories.${LABEL_MAP[cat]}`)}
        </button>
      ))}
    </div>
  );
}
