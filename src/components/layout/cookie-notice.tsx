"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { X } from "lucide-react";

const KEY = "rb_notice_v1";

export function CookieNotice() {
  const t = useTranslations("cookies");
  const [show, setShow] = useState(false);

  // Show once until dismissed. localStorage is only available client-side, so
  // we read it on mount (intentional setState in this sync-to-storage effect).
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch {
      /* storage unavailable — keep hidden */
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!show) return null;

  function dismiss() {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    setShow(false);
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3 sm:px-6">
        <p className="flex-1 text-xs leading-relaxed text-zinc-400">
          {t("message")}{" "}
          <Link href="/privacy" className="text-amber-400 hover:underline">
            {t("learnMore")}
          </Link>
        </p>
        <button
          onClick={dismiss}
          className="shrink-0 rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-900 transition-colors hover:bg-white"
        >
          {t("accept")}
        </button>
        <button
          onClick={dismiss}
          aria-label={t("accept")}
          className="shrink-0 rounded p-1 text-zinc-500 hover:text-zinc-300"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
