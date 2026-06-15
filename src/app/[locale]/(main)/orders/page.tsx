import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect, Link } from "@/i18n/routing";
import { getCurrentUser } from "@/lib/auth";
import { getOrdersByUser } from "@/lib/data/orders";
import { formatPrice } from "@/lib/utils/format";
import type { SupportedLocale } from "@/types";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return { title: `${t("orders")} | Riftbound` };
}

export default async function OrdersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const typedLocale = locale as SupportedLocale;
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const t = await getTranslations({ locale, namespace: "account" });

  const user = await getCurrentUser();
  if (!user) {
    redirect({ href: "/login", locale });
    return null;
  }

  const orders = await getOrdersByUser(user.id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-zinc-100">{tNav("orders")}</h1>

      {orders.length === 0 ? (
        <div className="mt-12 rounded-xl border border-dashed border-zinc-800 p-12 text-center">
          <p className="text-zinc-400">{t("noOrders")}</p>
          <Link
            href="/shop"
            className="mt-4 inline-block rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-amber-500"
          >
            {t("browseShop")}
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <span className="font-mono text-xs text-zinc-500">
                  #{order.id.slice(0, 8)}
                </span>
                <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-300">
                  {order.status}
                </span>
              </div>
              <ul className="mt-3 space-y-1.5 text-sm text-zinc-300">
                {order.items.map((item, i) => (
                  <li key={i} className="flex justify-between">
                    <span>
                      {item.quantity} × {item.name}
                    </span>
                    <span className="text-zinc-400">
                      {formatPrice(
                        item.unitPrice * item.quantity,
                        "EUR",
                        typedLocale
                      )}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex justify-between border-t border-zinc-800 pt-3 text-sm font-semibold">
                <span className="text-zinc-400">{t("orderTotal")}</span>
                <span className="text-amber-400">
                  {formatPrice(order.totalEur, "EUR", typedLocale)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
