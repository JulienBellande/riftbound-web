"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils/cn";
import { LocaleSwitcher } from "./locale-switcher";
import { UserMenu } from "./user-menu";
import { Menu, X, Flame } from "lucide-react";
import { useState } from "react";

interface HeaderUser {
  username: string;
  isDemo: boolean;
}

const navItems = [
  { href: "/cards" as const, labelKey: "cards" },
  { href: "/decks" as const, labelKey: "decks" },
  { href: "/deck-builder" as const, labelKey: "deckBuilder" },
  { href: "/prices" as const, labelKey: "prices" },
  { href: "/shop" as const, labelKey: "shop" },
  { href: "/blog" as const, labelKey: "blog" },
  { href: "/forum" as const, labelKey: "forum" },
] as const;

export function Header({ user }: { user: HeaderUser | null }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/60 bg-zinc-950/90 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Flame size={22} className="text-amber-500" />
          <span className="text-lg font-extrabold tracking-tight">
            <span className="text-zinc-100">RIFT</span>
            <span className="text-amber-500">FORGE</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-amber-500/10 text-amber-400"
                  : "text-zinc-400 hover:text-zinc-100"
              )}
            >
              {t(item.labelKey)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          {user ? (
            <UserMenu username={user.username} isDemo={user.isDemo} />
          ) : (
            <Link
              href="/login"
              className="hidden rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-1.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-indigo-600/30 hover:brightness-110 sm:block"
            >
              {t("login")}
            </Link>
          )}

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
        <nav className="border-t border-zinc-800/60 px-4 py-3 lg:hidden">
          <div className="flex flex-col gap-0.5">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-amber-500/10 text-amber-400"
                    : "text-zinc-400 hover:text-zinc-100"
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
