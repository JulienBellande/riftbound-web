"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/client";

const SUPABASE_CONFIGURED =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const INPUT_CLASS =
  "w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const t = useTranslations("auth");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (!SUPABASE_CONFIGURED) {
      setNotice(t("demoNotice"));
      return;
    }

    setLoading(true);
    const supabase = createClient();

    if (mode === "login") {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setLoading(false);
      if (authError) {
        setError(t("genericError"));
        return;
      }
      router.push("/");
      router.refresh();
    } else {
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      setLoading(false);
      if (authError) {
        setError(t("genericError"));
        return;
      }
      setNotice(t("checkEmail"));
    }
  }

  async function handleOAuth(provider: "discord" | "google") {
    setError(null);
    setNotice(null);

    if (!SUPABASE_CONFIGURED) {
      setNotice(t("demoNotice"));
      return;
    }

    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        {mode === "register" && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-400">
              {t("username")}
            </label>
            <input
              type="text"
              required
              minLength={3}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={INPUT_CLASS}
              placeholder="ShadowMage42"
            />
          </div>
        )}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-400">
            {t("email")}
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={INPUT_CLASS}
            placeholder="player@riftbound.gg"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-400">
            {t("password")}
          </label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={INPUT_CLASS}
          />
        </div>

        {error && (
          <p className="rounded-lg border border-red-900 bg-red-950/50 px-4 py-2.5 text-sm text-red-400">
            {error}
          </p>
        )}
        {notice && (
          <p className="rounded-lg border border-amber-900 bg-amber-950/50 px-4 py-2.5 text-sm text-amber-400">
            {notice}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-amber-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-500 disabled:opacity-60"
        >
          {loading ? "…" : t(mode)}
        </button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-zinc-900/50 px-2 text-zinc-500">
              {t("orContinueWith")}
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            onClick={() => handleOAuth("discord")}
            className="flex items-center justify-center gap-2 rounded-lg border border-zinc-700 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
          >
            Discord
          </button>
          <button
            onClick={() => handleOAuth("google")}
            className="flex items-center justify-center gap-2 rounded-lg border border-zinc-700 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
          >
            Google
          </button>
        </div>
      </div>
    </>
  );
}
