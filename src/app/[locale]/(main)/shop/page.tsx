import { getTranslations, setRequestLocale } from "next-intl/server";
import { getProducts } from "@/lib/data/shop";
import { ShopToolbar } from "@/components/shop/shop-toolbar";
import { AddToCartButton } from "@/components/shop/add-to-cart-button";
import { CartButton } from "@/components/shop/cart-button";
import { Pagination } from "@/components/ui/pagination";
import { formatPrice } from "@/lib/utils/format";
import { ShoppingBag } from "lucide-react";
import type { SupportedLocale } from "@/types";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "shop" });
  return { title: `${t("title")} | RiftForge` };
}

export default async function ShopPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const t = await getTranslations({ locale, namespace: "shop" });
  const typedLocale = locale as SupportedLocale;

  const category =
    typeof sp.cat === "string" && sp.cat !== "all" ? sp.cat : undefined;
  const page = typeof sp.page === "string" ? Number(sp.page) : 1;

  const result = await getProducts(typedLocale, {
    category,
    page,
    perPage: 20,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <ShoppingBag size={20} className="text-amber-500" />
          <h1 className="text-2xl font-black tracking-tight text-zinc-100 sm:text-3xl">
            {t("title")}
          </h1>
        </div>
        <CartButton />
      </div>

      <div className="mt-5">
        <ShopToolbar currentCategory={category ?? "all"} />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {result.data.map((product) => (
          <div
            key={product.id}
            className="group flex flex-col overflow-hidden rounded-xl border border-zinc-800/50 bg-zinc-900/30 transition-all hover:border-zinc-700 hover:bg-zinc-900/50"
          >
            <div className="aspect-square bg-gradient-to-br from-zinc-800/50 via-zinc-850/30 to-zinc-900/50" />
            <div className="flex flex-1 flex-col p-3.5">
              <h3 className="text-sm font-bold text-zinc-100">
                {product.name}
              </h3>
              {product.description && (
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-500">
                  {product.description}
                </p>
              )}
              <div className="mt-auto pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-base font-black text-amber-400">
                    {formatPrice(product.priceEur, "EUR", typedLocale)}
                  </span>
                  {product.stock <= 5 && product.stock > 0 && (
                    <span className="text-[10px] font-semibold text-orange-400">
                      {product.stock}{" "}
                      {typedLocale === "fr" ? "restants" : "left"}
                    </span>
                  )}
                </div>
                {product.stock > 0 ? (
                  <AddToCartButton
                    productId={product.id}
                    name={product.name}
                    price={product.priceEur}
                    imageUrl={product.imageUrl}
                    label={t("addToCart")}
                  />
                ) : (
                  <button
                    disabled
                    className="mt-2 w-full rounded-lg bg-zinc-800 py-1.5 text-xs font-medium text-zinc-500"
                  >
                    {t("outOfStock")}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Pagination page={result.page} totalPages={result.totalPages} />
    </div>
  );
}
