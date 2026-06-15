import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import { getTopicById, getForumCategory, isTopicReplyable } from "@/lib/data/forum";
import { ReplyForm } from "@/components/forum/reply-form";
import { ArrowLeft, Lock, Pin } from "lucide-react";
import type { SupportedLocale } from "@/types";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string; topicId: string }>;
}): Promise<Metadata> {
  const { topicId } = await params;
  const topic = await getTopicById(topicId);
  return { title: `${topic?.title ?? "Forum"} | RiftForge` };
}

export default async function ForumTopicPage({
  params,
}: {
  params: Promise<{ locale: string; category: string; topicId: string }>;
}) {
  const { locale, category, topicId } = await params;
  setRequestLocale(locale);
  const typedLocale = locale as SupportedLocale;
  const t = await getTranslations({ locale, namespace: "forum" });

  const topic = await getTopicById(topicId);
  if (!topic) notFound();

  const cat = await getForumCategory(category, typedLocale);
  const replyable = isTopicReplyable(topicId) && !topic.isLocked;

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString(
      typedLocale === "fr" ? "fr-FR" : "en-GB",
      { day: "numeric", month: "short", year: "numeric" }
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href={{ pathname: "/forum/[category]", params: { category } }}
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300"
      >
        <ArrowLeft size={14} />
        {cat?.name ?? t("title")}
      </Link>

      <header className="mt-4 flex items-start gap-2">
        {topic.isPinned && <Pin size={18} className="mt-1 text-amber-500" />}
        {topic.isLocked && <Lock size={18} className="mt-1 text-zinc-500" />}
        <h1 className="text-2xl font-bold text-zinc-100 sm:text-3xl">
          {topic.title}
        </h1>
      </header>

      {/* Original post */}
      <article className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span className="font-medium text-zinc-300">
            {topic.user.username}
          </span>
          <span>{formatDate(topic.createdAt)}</span>
        </div>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-200">
          {topic.content}
        </p>
      </article>

      {/* Replies */}
      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-zinc-400">
        {topic.replyCount} {t("replies")}
      </h2>
      <ul className="mt-4 space-y-4">
        {topic.replies.map((reply) => (
          <li
            key={reply.id}
            className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5"
          >
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span className="font-medium text-zinc-300">
                {reply.user.username}
              </span>
              <span>{formatDate(reply.createdAt)}</span>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-200">
              {reply.content}
            </p>
          </li>
        ))}
      </ul>

      <ReplyForm topicId={topicId} readOnly={!replyable} />
    </div>
  );
}
