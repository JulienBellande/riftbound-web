"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Plus, X } from "lucide-react";

export function NewTopicForm({ categorySlug }: { categorySlug: string }) {
  const t = useTranslations("forum");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit(e: FormEvent) {
    e.preventDefault();
    if (title.trim().length < 3 || !content.trim()) return;
    setNotice(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/forum/topics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ categorySlug, title, content }),
        });
        if (res.status === 401) {
          setNotice(t("loginRequired"));
          return;
        }
        if (!res.ok) {
          setNotice(t("postError"));
          return;
        }
        const { id } = await res.json();
        setTitle("");
        setContent("");
        setOpen(false);
        router.push({
          pathname: "/forum/[category]/[topicId]",
          params: { category: categorySlug, topicId: id },
        });
      } catch {
        setNotice(t("postError"));
      }
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-500"
      >
        <Plus size={16} />
        {t("newTopic")}
      </button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-200">{t("newTopic")}</h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
        >
          <X size={16} />
        </button>
      </div>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={120}
        placeholder={t("titlePlaceholder")}
        className="mt-3 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        maxLength={5000}
        placeholder={t("contentPlaceholder")}
        className="mt-2 w-full resize-y rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
      />
      {notice && <p className="mt-2 text-xs text-amber-400">{notice}</p>}
      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200"
        >
          {t("cancel")}
        </button>
        <button
          type="submit"
          disabled={isPending || title.trim().length < 3 || !content.trim()}
          className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-500 disabled:opacity-50"
        >
          {t("postTopic")}
        </button>
      </div>
    </form>
  );
}
