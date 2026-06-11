"use client";

import { useRouter, usePathname } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({
  page,
  totalPages,
}: {
  page: number;
  totalPages: number;
}) {
  const t = useTranslations("common");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function goTo(target: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (target <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(target));
    }
    const qs = params.toString();
    // @ts-expect-error dynamic pathname from usePathname
    router.push(`${pathname}${qs ? `?${qs}` : ""}`);
  }

  return (
    <nav className="mt-8 flex items-center justify-center gap-2">
      <button
        onClick={() => goTo(page - 1)}
        disabled={page <= 1}
        aria-label={t("previous")}
        className="rounded-lg border border-zinc-700 p-2 text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200 disabled:opacity-40 disabled:hover:border-zinc-700"
      >
        <ChevronLeft size={16} />
      </button>

      <span className="px-3 text-sm text-zinc-400">
        {page} / {totalPages}
      </span>

      <button
        onClick={() => goTo(page + 1)}
        disabled={page >= totalPages}
        aria-label={t("next")}
        className="rounded-lg border border-zinc-700 p-2 text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200 disabled:opacity-40 disabled:hover:border-zinc-700"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}
