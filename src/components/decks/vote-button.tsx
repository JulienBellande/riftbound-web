"use client";

import { useState, useTransition } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
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
    <div className="flex items-center gap-1">
      <button
        onClick={() => vote(1)}
        disabled={isPending}
        className={cn(
          "rounded-lg p-1.5 transition-colors",
          userVote === 1
            ? "bg-emerald-600/20 text-emerald-400"
            : "text-zinc-500 hover:bg-zinc-800 hover:text-emerald-400"
        )}
        aria-label="Upvote"
      >
        <ThumbsUp size={16} />
      </button>
      <span
        className={cn(
          "min-w-[2rem] text-center text-sm font-bold",
          score > 0 ? "text-emerald-400" : score < 0 ? "text-red-400" : "text-zinc-400"
        )}
      >
        {score}
      </span>
      <button
        onClick={() => vote(-1)}
        disabled={isPending}
        className={cn(
          "rounded-lg p-1.5 transition-colors",
          userVote === -1
            ? "bg-red-600/20 text-red-400"
            : "text-zinc-500 hover:bg-zinc-800 hover:text-red-400"
        )}
        aria-label="Downvote"
      >
        <ThumbsDown size={16} />
      </button>
    </div>
  );
}
