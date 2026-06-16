"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";

export function ReplyForm({
  topicId,
  readOnly,
}: {
  topicId: string;
  readOnly?: boolean;
}) {
  const t = useTranslations("forum");
  const router = useRouter();
  const [content, setContent] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (readOnly) {
    return (
      <p className="mt-4 rounded-lg border border-zinc-800 bg-zinc-800/30 px-4 py-3 text-sm text-zinc-500">
        {t("readOnlyTopic")}
      </p>
    );
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setNotice(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/forum/replies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topicId, content }),
        });
        if (!res.ok) {
          setNotice(t("postError"));
          return;
        }
        setContent("");
        router.refresh();
      } catch {
        setNotice(t("postError"));
      }
    });
  }

  return (
    <form onSubmit={submit} className="mt-6">
      <h3 className="text-sm font-semibold text-zinc-300">{t("yourReply")}</h3>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        maxLength={5000}
        placeholder={t("replyPlaceholder")}
        className="mt-2 w-full resize-y rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
      />
      {notice && <p className="mt-2 text-xs text-amber-400">{notice}</p>}
      <p className="mt-2 text-[11px] text-zinc-500">{t("anonNotice")}</p>
      <div className="mt-2 flex justify-end">
        <button
          type="submit"
          disabled={isPending || !content.trim()}
          className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-500 disabled:opacity-50"
        >
          {t("postReply")}
        </button>
      </div>
    </form>
  );
}
