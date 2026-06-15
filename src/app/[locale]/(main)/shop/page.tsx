import { getTranslations, setRequestLocale } from "next-intl/server";
import { getProducts } from "@/lib/data/shop";
import { ShopToolbar } from "@/components/shop/shop-toolbar";
import { AddToCartButton } from "@/components/shop/add-to-cart-button";
import { CartButton } from "@/components/shop/cart-button";
import { Pagination } from "@/components/ui/pagination";
import { formatPrice } from "@/lib/utils/format";
import type { SupportedLocale } from "@/types";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
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

  const category = typeof sp.cat === "string" && sp.cat !== "all" ? sp.cat : undefined;
  const page = typeof sp.page === "string" ? Number(sp.page) : 1;

  const result = await getProducts(typedLocale, { category, page, perPage: 20 });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-zinc-100">{t("title")}</h1>
        <CartButton />
      </div>

      <div className="mt-6">
        <ShopToolbar currentCategory={category ?? "all"} />
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {result.data.map((product) => (
          <div
            key={product.id}
            className="group flex flex-col rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition-all hover:border-zinc-700"
          >
            <div className="aspect-square rounded-lg bg-zinc-800/50" />
            <div className="mt-4 flex-1">
              <h3 className="font-semibold text-zinc-100">{product.name}</h3>
              {product.description && (
                <p className="mt-1 line-clamp-2 text-sm text-zinc-500">
                  {product.description}
                </p>
              )}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-lg font-bold text-amber-400">
                {formatPrice(product.priceEur, "EUR", typedLocale)}
              </span>
              {product.stock <= 5 && product.stock > 0 && (
                <span className="text-xs text-orange-400">
                  {product.stock} {typedLocale === "fr" ? "restants" : "left"}
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
                className="mt-3 w-full rounded-lg bg-zinc-700 py-2 text-sm font-medium text-zinc-400"
              >
                {t("outOfStock")}
              </button>
            )}
          </div>
        ))}
      </div>

      <Pagination page={result.page} totalPages={result.totalPages} />
    </div>
  );
}
