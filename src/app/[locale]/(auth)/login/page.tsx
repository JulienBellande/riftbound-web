import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { AuthForm } from "@/components/auth/auth-form";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: `${t("login")} | Riftbound` };
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
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 block text-center text-2xl font-bold text-amber-500">
          RIFTBOUND
        </Link>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8">
          <h1 className="text-2xl font-bold text-zinc-100">{t("login")}</h1>

          <AuthForm mode="login" />

          <p className="mt-6 text-center text-sm text-zinc-500">
            {t("noAccount")}{" "}
            <Link href="/register" className="text-amber-500 hover:text-amber-400">
              {t("register")}
            </Link>
          </p>

          <p className="mt-2 text-center">
            <Link href="/login" className="text-sm text-zinc-500 hover:text-zinc-400">
              {t("forgotPassword")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
