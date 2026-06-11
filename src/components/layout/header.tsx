"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils/cn";
import { LocaleSwitcher } from "./locale-switcher";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/cards" as const, labelKey: "cards" },
  { href: "/decks" as const, labelKey: "decks" },
  { href: "/deck-builder" as const, labelKey: "deckBuilder" },
  { href: "/prices" as const, labelKey: "prices" },
  { href: "/shop" as const, labelKey: "shop" },
  { href: "/blog" as const, labelKey: "blog" },
  { href: "/forum" as const, labelKey: "forum" },
] as const;

export function Header() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-amber-500">
            RIFTBOUND
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-zinc-800 hover:text-zinc-100",
                pathname === item.href
                  ? "bg-zinc-800 text-amber-500"
                  : "text-zinc-400"
              )}
            >
              {t(item.labelKey)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          <Link
            href="/cards"
            className="hidden rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-500 sm:block"
          >
            {t("login")}
          </Link>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 lg:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-zinc-800 px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-zinc-800",
                  pathname === item.href
                    ? "bg-zinc-800 text-amber-500"
                    : "text-zinc-400"
                )}
              >
                {t(item.labelKey)}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
