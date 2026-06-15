import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { getForumCategories } from "@/lib/data/forum";
import { MessageSquare, Eye, Clock, MessagesSquare } from "lucide-react";
import type { SupportedLocale } from "@/types";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "forum" });
  return { title: `${t("title")} | RiftForge` };
}

function formatRelative(
  isoDate: string | null,
  locale: SupportedLocale
): string {
  if (!isoDate) return "—";
  const diff = Date.now() - new Date(isoDate).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return locale === "fr" ? "< 1h" : "< 1h ago";
  if (hours < 24)
    return locale === "fr" ? `il y a ${hours}h` : `${hours}h ago`;
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
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="flex items-center gap-2.5">
        <MessagesSquare size={20} className="text-sky-400" />
        <h1 className="text-2xl font-black tracking-tight text-zinc-100 sm:text-3xl">
          {t("title")}
        </h1>
      </div>
      <p className="mt-2 text-sm text-zinc-500">{t("pickCategory")}</p>

      <div className="mt-6 space-y-2.5">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={{
              pathname: "/forum/[category]",
              params: { category: cat.slug },
            }}
            className="flex items-center justify-between rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-4 transition-all hover:border-zinc-700 hover:bg-zinc-900/50 sm:p-5"
          >
            <div className="flex-1">
              <h3 className="text-sm font-bold text-zinc-100 sm:text-base">
                {cat.name}
              </h3>
              {cat.description && (
                <p className="mt-0.5 text-xs text-zinc-500">
                  {cat.description}
                </p>
              )}
            </div>
            <div className="hidden gap-6 text-center sm:flex">
              <div>
                <div className="flex items-center gap-1 text-sm font-bold text-zinc-300">
                  <MessageSquare size={13} className="text-zinc-500" />
                  {cat.topicCount}
                </div>
                <div className="text-[10px] text-zinc-600">{t("topics")}</div>
              </div>
              <div>
                <div className="flex items-center gap-1 text-sm font-bold text-zinc-300">
                  <Eye size={13} className="text-zinc-500" />
                  {cat.replyCount}
                </div>
                <div className="text-[10px] text-zinc-600">{t("replies")}</div>
              </div>
              <div>
                <div className="flex items-center gap-1 text-xs text-zinc-400">
                  <Clock size={12} className="text-zinc-600" />
                  {formatRelative(cat.lastActivity, typedLocale)}
                </div>
                <div className="text-[10px] text-zinc-600">
                  {t("lastActivity")}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
