import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { AuthForm } from "@/components/auth/auth-form";
import { Flame } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: `${t("register")} | RiftForge` };
}

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "auth" });

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,_rgba(99,102,241,0.1),transparent)]" />
      <div className="relative w-full max-w-sm">
        <Link
          href="/"
          className="mb-6 flex items-center justify-center gap-2"
        >
          <Flame size={22} className="text-amber-500" />
          <span className="text-xl font-extrabold tracking-tight">
            <span className="text-zinc-100">RIFT</span>
            <span className="text-amber-500">FORGE</span>
          </span>
        </Link>

        <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/40 p-6 backdrop-blur-sm">
          <h1 className="text-xl font-black text-zinc-100">{t("register")}</h1>

          <AuthForm mode="register" />

          <p className="mt-5 text-center text-xs text-zinc-500">
            {t("hasAccount")}{" "}
            <Link
              href="/login"
              className="font-semibold text-indigo-400 hover:text-indigo-300"
            >
              {t("login")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
