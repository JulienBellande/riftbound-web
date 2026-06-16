import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { getPosts } from "@/lib/data/blog";
import { Pagination } from "@/components/ui/pagination";
import { cn } from "@/lib/utils/cn";
import type { SupportedLocale } from "@/types";
import type { Metadata } from "next";

const CATEGORIES = [
  "all",
  "NEWS",
  "GUIDE",
  "META",
  "TOURNAMENT",
  "PATCH_NOTES",
] as const;
const CATEGORY_LABEL_MAP: Record<string, string> = {
  all: "all",
  NEWS: "news",
  GUIDE: "guide",
  META: "meta",
  TOURNAMENT: "tournament",
  PATCH_NOTES: "patchNotes",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  return { title: `${t("title")} | RiftForge` };
}

export default async function BlogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const t = await getTranslations({ locale, namespace: "blog" });
  const typedLocale = locale as SupportedLocale;

  const category =
    typeof sp.cat === "string" && sp.cat !== "all" ? sp.cat : undefined;
  const page = typeof sp.page === "string" ? Number(sp.page) : 1;

  const result = await getPosts(typedLocale, { category, page, perPage: 12 });

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <h1 className="text-xl font-bold text-zinc-100 sm:text-2xl">
        {t("title")}
      </h1>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat}
            href={{
              pathname: "/blog",
              query: cat === "all" ? undefined : { cat },
            }}
            className={cn(
              "rounded-full border px-3.5 py-1 text-xs font-semibold transition-all",
              (cat === "all" && !category) || cat === category
                ? "border-zinc-600 bg-zinc-800 text-zinc-100"
                : "border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
            )}
          >
            {t(`categories.${CATEGORY_LABEL_MAP[cat]}`)}
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {result.data.map((post) => (
          <article
            key={post.id}
            className="group flex flex-col overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 transition-colors hover:border-zinc-700"
          >
            <div className="aspect-video bg-zinc-800" />
            <div className="flex flex-1 flex-col p-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">
                {t(
                  `categories.${CATEGORY_LABEL_MAP[post.category] ?? "news"}`
                )}
              </span>
              <h2 className="mt-1.5 text-sm font-bold text-zinc-100 transition-colors group-hover:text-zinc-50">
                <Link
                  href={{
                    pathname: "/blog/[slug]",
                    params: { slug: post.slug },
                  }}
                >
                  {post.title}
                </Link>
              </h2>
              {post.excerpt && (
                <p className="mt-1.5 line-clamp-2 flex-1 text-xs leading-relaxed text-zinc-500">
                  {post.excerpt}
                </p>
              )}
              <div className="mt-3 flex items-center justify-between text-[10px] text-zinc-600">
                <span>{post.author.username}</span>
                <span>
                  {new Date(post.publishedAt).toLocaleDateString(
                    typedLocale === "fr" ? "fr-FR" : "en-GB"
                  )}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>

      <Pagination page={result.page} totalPages={result.totalPages} />
    </div>
  );
}
