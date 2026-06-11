import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import { getPostBySlug } from "@/lib/data/blog";
import { ArrowLeft } from "lucide-react";
import type { SupportedLocale } from "@/types";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPostBySlug(slug, locale as SupportedLocale);
  if (!post) return { title: "Riftbound" };
  return {
    title: `${post.title} | Riftbound`,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      type: "article",
      publishedTime: post.publishedAt,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const typedLocale = locale as SupportedLocale;
  const t = await getTranslations({ locale, namespace: "blog" });

  const post = await getPostBySlug(slug, typedLocale);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt ?? undefined,
    datePublished: post.publishedAt,
    author: { "@type": "Person", name: post.author.username },
    inLanguage: typedLocale,
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300"
      >
        <ArrowLeft size={14} />
        {t("title")}
      </Link>

      <header className="mt-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">
          {post.category.replace("_", " ")}
        </span>
        <h1 className="mt-2 text-3xl font-bold text-zinc-100 sm:text-4xl">
          {post.title}
        </h1>
        <p className="mt-4 text-sm text-zinc-500">
          {post.author.username} ·{" "}
          {t("publishedAt", {
            date: new Date(post.publishedAt).toLocaleDateString(
              typedLocale === "fr" ? "fr-FR" : "en-GB",
              { day: "numeric", month: "long", year: "numeric" }
            ),
          })}
        </p>
      </header>

      <div className="prose-invert mt-10 space-y-5 text-zinc-300">
        {post.content.split("\n\n").map((block, i) => {
          if (block.startsWith("## ")) {
            return (
              <h2 key={i} className="text-xl font-semibold text-zinc-100">
                {block.replace("## ", "")}
              </h2>
            );
          }
          if (block.startsWith("- ") || /^\d+\./.test(block)) {
            return (
              <ul key={i} className="list-inside list-disc space-y-1.5 text-zinc-400">
                {block.split("\n").map((line, j) => (
                  <li key={j}>
                    {line
                      .replace(/^-\s*/, "")
                      .replace(/^\d+\.\s*/, "")
                      .replace(/\*\*(.+?)\*\*/g, "$1")}
                  </li>
                ))}
              </ul>
            );
          }
          return (
            <p key={i} className="leading-relaxed">
              {block.replace(/\*\*(.+?)\*\*/g, "$1")}
            </p>
          );
        })}
      </div>
    </article>
  );
}
