import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { getPosts } from "@/lib/data/blog";
import { Pagination } from "@/components/ui/pagination";
import { cn } from "@/lib/utils/cn";
import type { SupportedLocale } from "@/types";
import type { Metadata } from "next";

const CATEGORIES = ["all", "NEWS", "GUIDE", "META", "TOURNAMENT", "PATCH_NOTES"] as const;
const CATEGORY_LABEL_MAP: Record<string, string> = {
  all: "all",
  NEWS: "news",
  GUIDE: "guide",
  META: "meta",
  TOURNAMENT: "tournament",
  PATCH_NOTES: "patchNotes",
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
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

  const category = typeof sp.cat === "string" && sp.cat !== "all" ? sp.cat : undefined;
  const page = typeof sp.page === "string" ? Number(sp.page) : 1;

  const result = await getPosts(typedLocale, { category, page, perPage: 12 });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-zinc-100">{t("title")}</h1>

      <div className="mt-6 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat}
            href={{
              pathname: "/blog",
              query: cat === "all" ? undefined : { cat },
            }}
            className={cn(
              "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
              (cat === "all" && !category) || cat === category
                ? "border-amber-600 bg-amber-600/10 text-amber-500"
                : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
            )}
          >
            {t(`categories.${CATEGORY_LABEL_MAP[cat]}`)}
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {result.data.map((post) => (
          <article
            key={post.id}
            className="group flex flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 transition-all hover:border-zinc-700"
          >
            <div className="aspect-video bg-zinc-800/50" />
            <div className="flex flex-1 flex-col p-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">
                {t(`categories.${CATEGORY_LABEL_MAP[post.category] ?? "news"}`)}
              </span>
              <h2 className="mt-2 text-lg font-semibold text-zinc-100 group-hover:text-amber-400">
                <Link href={{ pathname: "/blog/[slug]", params: { slug: post.slug } }}>
                  {post.title}
                </Link>
              </h2>
              {post.excerpt && (
                <p className="mt-2 line-clamp-2 flex-1 text-sm text-zinc-400">
                  {post.excerpt}
                </p>
              )}
              <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
                <span>{post.author.username}</span>
                <span>
                  {new Date(post.publishedAt).toLocaleDateString(
                    typedLocale === "fr" ? "fr-FR" : "en-GB"
                  )}
                </span>
              </div>
              <Link
                href={{ pathname: "/blog/[slug]", params: { slug: post.slug } }}
                className="mt-3 text-sm font-medium text-amber-500 hover:text-amber-400"
              >
                {t("readMore")} &rarr;
              </Link>
            </div>
          </article>
        ))}
      </div>

      <Pagination page={result.page} totalPages={result.totalPages} />
    </div>
  );
}
