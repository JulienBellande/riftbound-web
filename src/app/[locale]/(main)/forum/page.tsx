import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { getForumCategories } from "@/lib/data/forum";
import { MessageSquare, Eye, Clock } from "lucide-react";
import type { SupportedLocale } from "@/types";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "forum" });
  return { title: `${t("title")} | Riftbound` };
}

function formatRelative(isoDate: string | null, locale: SupportedLocale): string {
  if (!isoDate) return "—";
  const diff = Date.now() - new Date(isoDate).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return locale === "fr" ? "< 1h" : "< 1h ago";
  if (hours < 24) return locale === "fr" ? `il y a ${hours}h` : `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return locale === "fr" ? `il y a ${days}j` : `${days}d ago`;
}

export default async function ForumPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "forum" });
  const typedLocale = locale as SupportedLocale;

  const categories = await getForumCategories(typedLocale);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-zinc-100">{t("title")}</h1>
      <p className="mt-2 text-sm text-zinc-500">{t("pickCategory")}</p>

      <div className="mt-8 space-y-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={{ pathname: "/forum/[category]", params: { category: cat.slug } }}
            className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition-colors hover:border-zinc-700"
          >
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-zinc-100">{cat.name}</h3>
              {cat.description && (
                <p className="mt-1 text-sm text-zinc-500">{cat.description}</p>
              )}
            </div>
            <div className="hidden gap-8 text-center sm:flex">
              <div>
                <div className="flex items-center gap-1.5 text-lg font-semibold text-zinc-300">
                  <MessageSquare size={16} className="text-zinc-500" />
                  {cat.topicCount}
                </div>
                <div className="text-xs text-zinc-500">{t("topics")}</div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-lg font-semibold text-zinc-300">
                  <Eye size={16} className="text-zinc-500" />
                  {cat.replyCount}
                </div>
                <div className="text-xs text-zinc-500">{t("replies")}</div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-sm text-zinc-400">
                  <Clock size={14} className="text-zinc-600" />
                  {formatRelative(cat.lastActivity, typedLocale)}
                </div>
                <div className="text-xs text-zinc-500">{t("lastActivity")}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
