import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import { getForumCategory, getTopics } from "@/lib/data/forum";
import { NewTopicForm } from "@/components/forum/new-topic-form";
import { Pagination } from "@/components/ui/pagination";
import {
  ArrowLeft,
  MessageSquare,
  Pin,
  Lock,
  MessagesSquare,
} from "lucide-react";
import type { SupportedLocale } from "@/types";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}): Promise<Metadata> {
  const { locale, category } = await params;
  const cat = await getForumCategory(category, locale as SupportedLocale);
  return { title: `${cat?.name ?? "Forum"} | RiftForge` };
}

export default async function ForumCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; category: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale, category } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const typedLocale = locale as SupportedLocale;
  const t = await getTranslations({ locale, namespace: "forum" });

  const cat = await getForumCategory(category, typedLocale);
  if (!cat) notFound();

  const page = typeof sp.page === "string" ? Number(sp.page) : 1;
  const result = await getTopics(category, { page, perPage: 20 });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/forum"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300"
      >
        <ArrowLeft size={14} />
        {t("title")}
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 sm:text-3xl">
            {cat.name}
          </h1>
          {cat.description && (
            <p className="mt-1 text-sm text-zinc-500">{cat.description}</p>
          )}
        </div>
        <NewTopicForm categorySlug={category} />
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50">
        {result.data.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
            <MessagesSquare size={28} className="text-zinc-600" />
            <p className="text-sm font-medium text-zinc-300">
              {t("emptyTitle")}
            </p>
            <p className="max-w-sm text-xs text-zinc-500">{t("emptyHint")}</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {result.data.map((topic) => (
              <Link
                key={topic.id}
                href={{
                  pathname: "/forum/[category]/[topicId]",
                  params: { category, topicId: topic.id },
                }}
                className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-zinc-800/40"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {topic.isPinned && (
                      <Pin size={13} className="shrink-0 text-amber-500" />
                    )}
                    {topic.isLocked && (
                      <Lock size={13} className="shrink-0 text-zinc-500" />
                    )}
                    <span className="truncate font-medium text-zinc-100">
                      {topic.title}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">
                    {t("by")} {topic.user.username} ·{" "}
                    {new Date(topic.createdAt).toLocaleDateString(
                      typedLocale === "fr" ? "fr-FR" : "en-GB"
                    )}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5 text-xs text-zinc-500">
                  <MessageSquare size={13} />
                  {topic.replyCount}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Pagination page={result.page} totalPages={result.totalPages} />
    </div>
  );
}
