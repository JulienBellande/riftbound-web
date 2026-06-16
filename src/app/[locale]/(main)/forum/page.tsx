import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { getForumCategories } from "@/lib/data/forum";
import {
  MessagesSquare,
  Swords,
  Layers3,
  LifeBuoy,
  CalendarDays,
  MessageSquare,
  FileText,
  Clock,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
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

const ICONS: Record<string, LucideIcon> = {
  general: MessagesSquare,
  strategy: Swords,
  decks: Layers3,
  help: LifeBuoy,
  events: CalendarDays,
};

function formatRelative(
  isoDate: string | null,
  locale: SupportedLocale
): string {
  if (!isoDate) return locale === "fr" ? "Aucune activité" : "No activity yet";
  const diff = Date.now() - new Date(isoDate).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return locale === "fr" ? "à l'instant" : "just now";
  if (hours < 24) return locale === "fr" ? `il y a ${hours} h` : `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return locale === "fr" ? `il y a ${days} j` : `${days}d ago`;
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
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <h1 className="text-xl font-bold text-zinc-100 sm:text-2xl">
        {t("title")}
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">
        {t("intro")}
      </p>
      <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs text-zinc-400">
        <ShieldCheck size={13} className="text-emerald-500" />
        {t("anonNotice")}
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {categories.map((cat) => {
          const Icon = ICONS[cat.icon] ?? MessagesSquare;
          return (
            <Link
              key={cat.id}
              href={{
                pathname: "/forum/[category]",
                params: { category: cat.slug },
              }}
              className="group flex flex-col rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 transition-colors hover:border-zinc-600 hover:bg-zinc-900 sm:p-5"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-amber-500 transition-colors group-hover:bg-zinc-700">
                  <Icon size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-zinc-100 sm:text-base">
                    {cat.name}
                  </h3>
                  {cat.description && (
                    <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">
                      {cat.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-4 border-t border-zinc-800/80 pt-3 text-xs text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <FileText size={13} className="text-zinc-600" />
                  {cat.topicCount} {t("topics")}
                </span>
                <span className="flex items-center gap-1.5">
                  <MessageSquare size={13} className="text-zinc-600" />
                  {cat.replyCount} {t("replies")}
                </span>
                <span className="ml-auto flex items-center gap-1.5">
                  <Clock size={12} className="text-zinc-600" />
                  {formatRelative(cat.lastActivity, typedLocale)}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
