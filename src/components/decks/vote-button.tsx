"use client";

import { useState, useTransition } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function VoteButton({
  deckId,
  initialScore,
}: {
  deckId: string;
  initialScore: number;
}) {
  const [score, setScore] = useState(initialScore);
  const [userVote, setUserVote] = useState<1 | -1 | null>(null);
  const [isPending, startTransition] = useTransition();

  function vote(value: 1 | -1) {
    startTransition(async () => {
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deckId, value }),
      });
      if (res.ok) {
        const data = await res.json();
        setScore(data.newScore);
        setUserVote(userVote === value ? null : value);
      }
    });
  }

  return (
    <div className="flex flex-col items-center gap-0.5 rounded-lg border border-zinc-800 bg-zinc-900/80 px-1.5 py-1">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          vote(1);
        }}
        disabled={isPending}
        className={cn(
          "rounded p-0.5 transition-colors",
          userVote === 1
            ? "text-amber-400"
            : "text-zinc-600 hover:text-amber-400"
        )}
        aria-label="Upvote"
      >
        <ChevronUp size={16} strokeWidth={2.5} />
      </button>
      <span
        className={cn(
          "text-xs font-bold tabular-nums leading-none",
          score > 0
            ? "text-amber-400"
            : score < 0
              ? "text-red-400"
              : "text-zinc-500"
        )}
      >
        {score}
      </span>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          vote(-1);
        }}
        disabled={isPending}
        className={cn(
          "rounded p-0.5 transition-colors",
          userVote === -1
            ? "text-red-400"
            : "text-zinc-600 hover:text-red-400"
        )}
        aria-label="Downvote"
      >
        <ChevronDown size={16} strokeWidth={2.5} />
      </button>
    </div>
  );
}
