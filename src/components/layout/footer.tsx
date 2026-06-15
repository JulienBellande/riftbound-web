import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Flame } from "lucide-react";

export function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");

  return (
    <footer className="border-t border-zinc-800/60 bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <Flame size={18} className="text-amber-500" />
              <span className="text-base font-extrabold tracking-tight">
                <span className="text-zinc-100">RIFT</span>
                <span className="text-amber-500">FORGE</span>
              </span>
            </div>
            <p className="mt-3 text-xs text-zinc-600">
              {t("copyright", { year: new Date().getFullYear() })}
            </p>
            <p className="mt-1 text-[10px] text-zinc-700">
              {t("disclaimer")}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Navigation
            </h3>
            <ul className="mt-3 space-y-2">
              {(["cards", "decks", "prices", "shop"] as const).map((k) => (
                <li key={k}>
                  <Link
                    href={`/${k}` as "/cards"}
                    className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
                  >
                    {tNav(k)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              {t("about")}
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/blog"
                  className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
                >
                  {tNav("blog")}
                </Link>
              </li>
              <li>
                <Link
                  href="/forum"
                  className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
                >
                  {tNav("forum")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              {t("legal")}
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <span className="text-sm text-zinc-600">{t("privacy")}</span>
              </li>
              <li>
                <span className="text-sm text-zinc-600">{t("terms")}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
