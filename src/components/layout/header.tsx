"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils/cn";
import { LocaleSwitcher } from "./locale-switcher";
import { QuickSearch } from "./quick-search";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/cards" as const, labelKey: "cards" },
  { href: "/decks" as const, labelKey: "decks" },
  { href: "/deck-builder" as const, labelKey: "deckBuilder" },
  { href: "/blog" as const, labelKey: "blog" },
  { href: "/forum" as const, labelKey: "forum" },
] as const;

export function Header() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-sm">
      <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-sm font-bold tracking-tight">
          <span className="text-zinc-100">RIFT</span>
          <span className="text-amber-500">FORGE</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded px-2.5 py-1 text-xs font-medium transition-colors",
                pathname === item.href || pathname.startsWith(item.href + "/")
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-200"
              )}
            >
              {t(item.labelKey)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <QuickSearch />
          <LocaleSwitcher />

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded p-1.5 text-zinc-500 hover:bg-zinc-800 lg:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-zinc-800 px-4 py-2 lg:hidden">
          <div className="flex flex-col gap-0.5">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "rounded px-3 py-2 text-sm font-medium transition-colors",
                  pathname === item.href ||
                    pathname.startsWith(item.href + "/")
                    ? "bg-zinc-800 text-zinc-100"
                    : "text-zinc-500 hover:text-zinc-200"
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
