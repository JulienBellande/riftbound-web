import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");

  return (
    <footer className="border-t border-zinc-800">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <span className="text-sm font-bold tracking-tight">
              <span className="text-zinc-100">RIFT</span>
              <span className="text-amber-500">FORGE</span>
            </span>
            <p className="mt-3 text-xs leading-relaxed text-zinc-600">
              {t("copyright", { year: new Date().getFullYear() })}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Navigation
            </h3>
            <ul className="mt-3 space-y-1.5">
              {(["cards", "decks", "deckBuilder", "forum"] as const).map(
                (k) => (
                  <li key={k}>
                    <Link
                      href={`/${k === "deckBuilder" ? "deck-builder" : k}` as "/cards"}
                      className="text-sm text-zinc-500 transition-colors hover:text-zinc-200"
                    >
                      {tNav(k)}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              {t("about")}
            </h3>
            <ul className="mt-3 space-y-1.5">
              <li>
                <Link
                  href="/blog"
                  className="text-sm text-zinc-500 transition-colors hover:text-zinc-200"
                >
                  {tNav("blog")}
                </Link>
              </li>
              <li>
                <Link
                  href="/forum"
                  className="text-sm text-zinc-500 transition-colors hover:text-zinc-200"
                >
                  {tNav("forum")}
                </Link>
              </li>
              <li>
                <Link
                  href="/deck-builder"
                  className="text-sm text-zinc-500 transition-colors hover:text-zinc-200"
                >
                  {tNav("deckBuilder")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              {t("legal")}
            </h3>
            <ul className="mt-3 space-y-1.5">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-zinc-500 transition-colors hover:text-zinc-200"
                >
                  {t("privacy")}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-zinc-500 transition-colors hover:text-zinc-200"
                >
                  {t("terms")}
                </Link>
              </li>
              <li>
                <Link
                  href="/legal"
                  className="text-sm text-zinc-500 transition-colors hover:text-zinc-200"
                >
                  {t("mentions")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 border-t border-zinc-800 pt-5">
          <p className="text-[10px] leading-relaxed text-zinc-700">
            {t("disclaimer")}
          </p>
        </div>
      </div>
    </footer>
  );
}
