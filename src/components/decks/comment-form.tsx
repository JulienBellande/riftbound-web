"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";

export function CommentForm({ deckId }: { deckId: string }) {
  const t = useTranslations("comments");
  const router = useRouter();
  const [content, setContent] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setNotice(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/comments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deckId, content }),
        });
        if (res.status === 401) {
          setNotice(t("loginRequired"));
          return;
        }
        if (!res.ok) {
          setNotice(t("error"));
          return;
        }
        setContent("");
        router.refresh();
      } catch {
        setNotice(t("error"));
      }
    });
  }

  return (
    <form onSubmit={submit} className="mt-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        maxLength={2000}
        placeholder={t("placeholder")}
        className="w-full resize-y rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
      />
      {notice && <p className="mt-2 text-xs text-amber-400">{notice}</p>}
      <div className="mt-2 flex justify-end">
        <button
          type="submit"
          disabled={isPending || !content.trim()}
          className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-500 disabled:opacity-50"
        >
          {t("submit")}
        </button>
      </div>
    </form>
  );
}
