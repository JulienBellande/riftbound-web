"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { User, LayoutGrid, ShoppingBag, LogOut, ChevronDown } from "lucide-react";

export function UserMenu({
  username,
  isDemo,
}: {
  username: string;
  isDemo: boolean;
}) {
  const t = useTranslations("nav");
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    setOpen(false);
    if (!isDemo) {
      const { createClient } = await import("@/lib/supabase/client");
      await createClient().auth.signOut();
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-100"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-600 text-[10px] font-bold uppercase text-white">
          {username.charAt(0)}
        </span>
        <span className="hidden max-w-[8rem] truncate sm:inline">{username}</span>
        <ChevronDown size={14} />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-xl">
            {isDemo && (
              <p className="border-b border-zinc-800 px-4 py-2 text-xs text-zinc-500">
                {t("demoAccount")}
              </p>
            )}
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-800"
            >
              <User size={15} />
              {t("profile")}
            </Link>
            <Link
              href="/my-decks"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-800"
            >
              <LayoutGrid size={15} />
              {t("myDecks")}
            </Link>
            <Link
              href="/orders"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-800"
            >
              <ShoppingBag size={15} />
              {t("orders")}
            </Link>
            <button
              onClick={logout}
              className="flex w-full items-center gap-2.5 border-t border-zinc-800 px-4 py-2.5 text-left text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-red-400"
            >
              <LogOut size={15} />
              {t("logout")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
