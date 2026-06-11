"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { useTransition } from "react";

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const nextLocale = locale === "fr" ? "en" : "fr";

  function switchLocale() {
    startTransition(() => {
      router.replace(
        // @ts-expect-error - pathname from usePathname may not match static pathnames
        { pathname },
        { locale: nextLocale }
      );
    });
  }

  return (
    <button
      onClick={switchLocale}
      disabled={isPending}
      className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium uppercase text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200 disabled:opacity-50"
    >
      {nextLocale}
    </button>
  );
}
