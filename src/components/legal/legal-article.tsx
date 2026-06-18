import type { ReactNode } from "react";
import { Link } from "@/i18n/routing";
import { ArrowLeft } from "lucide-react";

export function LegalArticle({
  title,
  updated,
  children,
}: {
  title: string;
  updated?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300"
      >
        <ArrowLeft size={14} />
        RiftForge
      </Link>
      <h1 className="mt-6 text-3xl font-bold text-zinc-100">{title}</h1>
      {updated && <p className="mt-1 text-xs text-zinc-600">{updated}</p>}
      <div className="mt-8 space-y-4 text-sm leading-relaxed text-zinc-300 [&_h2]:mt-7 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-zinc-100 [&_a]:text-amber-400 [&_a:hover]:underline [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
        {children}
      </div>
    </div>
  );
}
