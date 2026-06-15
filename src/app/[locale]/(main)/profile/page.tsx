import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect, Link } from "@/i18n/routing";
import { getCurrentUser } from "@/lib/auth";
import { getDecksByUser } from "@/lib/data/decks";
import { LayoutGrid } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return { title: `${t("profile")} | RiftForge` };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const t = await getTranslations({ locale, namespace: "account" });

  const user = await getCurrentUser();
  if (!user) {
    redirect({ href: "/login", locale });
    return null;
  }

  const decks = await getDecksByUser(user.id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-zinc-100">{tNav("profile")}</h1>

      <div className="mt-8 flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-600 text-2xl font-bold uppercase text-white">
          {user.username.charAt(0)}
        </div>
        <div>
          <h2 className="text-xl font-semibold text-zinc-100">
            {user.username}
          </h2>
          <p className="text-sm text-zinc-500">{user.email}</p>
          <span className="mt-1 inline-block rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-400">
            {user.isDemo ? t("demoAccount") : t("memberAccount")}
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link
          href="/my-decks"
          className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition-colors hover:border-zinc-700"
        >
          <div>
            <div className="text-2xl font-bold text-zinc-100">
              {decks.length}
            </div>
            <div className="mt-1 text-sm text-zinc-500">{tNav("myDecks")}</div>
          </div>
          <LayoutGrid className="text-zinc-600" />
        </Link>
      </div>
    </div>
  );
}
