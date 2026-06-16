import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { AuthForm } from "@/components/auth/auth-form";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: `${t("login")} | RiftForge` };
}

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "auth" });

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-6 flex items-center justify-center"
        >
          <span className="text-lg font-bold tracking-tight">
            <span className="text-zinc-100">RIFT</span>
            <span className="text-amber-500">FORGE</span>
          </span>
        </Link>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <h1 className="text-xl font-black text-zinc-100">{t("login")}</h1>

          <AuthForm mode="login" />

          <p className="mt-5 text-center text-xs text-zinc-500">
            {t("noAccount")}{" "}
            <Link
              href="/register"
              className="font-semibold text-zinc-200 hover:text-white"
            >
              {t("register")}
            </Link>
          </p>

          <p className="mt-1.5 text-center">
            <Link
              href="/login"
              className="text-xs text-zinc-600 hover:text-zinc-400"
            >
              {t("forgotPassword")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
