import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");

  return (
    <footer className="border-t border-zinc-800 bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <span className="text-lg font-bold text-amber-500">RIFTBOUND</span>
            <p className="mt-2 text-sm text-zinc-500">
              {t("copyright", { year: new Date().getFullYear() })}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Navigation
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/cards"
                  className="text-sm text-zinc-500 hover:text-zinc-300"
                >
                  {tNav("cards")}
                </Link>
              </li>
              <li>
                <Link
                  href="/decks"
                  className="text-sm text-zinc-500 hover:text-zinc-300"
                >
                  {tNav("decks")}
                </Link>
              </li>
              <li>
                <Link
                  href="/prices"
                  className="text-sm text-zinc-500 hover:text-zinc-300"
                >
                  {tNav("prices")}
                </Link>
              </li>
              <li>
                <Link
                  href="/shop"
                  className="text-sm text-zinc-500 hover:text-zinc-300"
                >
                  {tNav("shop")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
              {t("about")}
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/blog"
                  className="text-sm text-zinc-500 hover:text-zinc-300"
                >
                  {tNav("blog")}
                </Link>
              </li>
              <li>
                <Link
                  href="/forum"
                  className="text-sm text-zinc-500 hover:text-zinc-300"
                >
                  {tNav("forum")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
              {t("legal")}
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <span className="text-sm text-zinc-500">{t("privacy")}</span>
              </li>
              <li>
                <span className="text-sm text-zinc-500">{t("terms")}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
