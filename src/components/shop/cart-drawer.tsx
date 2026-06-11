"use client";

import { useState } from "react";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { useCartStore } from "@/stores/cart-store";

export function CartDrawer({ onClose }: { onClose: () => void }) {
  const t = useTranslations("shop");
  const locale = useLocale();
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const totalPrice = useCartStore((s) => s.totalPrice());
  const [checkingOut, setCheckingOut] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleCheckout() {
    setNotice(null);
    setCheckingOut(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
          locale,
        }),
      });
      if (res.status === 503) {
        setNotice(t("checkoutDemoNotice"));
        return;
      }
      if (!res.ok) {
        setNotice(t("checkoutError"));
        return;
      }
      const { url } = await res.json();
      window.location.href = url;
    } catch {
      setNotice(t("checkoutError"));
    } finally {
      setCheckingOut(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md bg-zinc-900 shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
            <h2 className="text-lg font-semibold text-zinc-100">
              {t("cart")} ({items.length})
            </h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
            >
              <X size={20} />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <p className="text-center text-sm text-zinc-500">
                {t("emptyCart")}
              </p>
            ) : (
              <ul className="space-y-4">
                {items.map((item) => (
                  <li
                    key={item.productId}
                    className="flex gap-4 rounded-lg border border-zinc-800 bg-zinc-800/30 p-3"
                  >
                    <div className="h-16 w-16 shrink-0 rounded-lg bg-zinc-700/50" />
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex items-start justify-between">
                        <span className="text-sm font-medium text-zinc-200">
                          {item.name}
                        </span>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="text-zinc-600 hover:text-red-400"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.quantity - 1
                              )
                            }
                            className="rounded border border-zinc-700 p-0.5 text-zinc-400 hover:text-zinc-200"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-6 text-center text-sm text-zinc-300">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.quantity + 1
                              )
                            }
                            className="rounded border border-zinc-700 p-0.5 text-zinc-400 hover:text-zinc-200"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <span className="text-sm font-medium text-amber-400">
                          {(item.price * item.quantity).toFixed(2)} €
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-zinc-800 p-6">
              <div className="flex items-center justify-between text-lg font-semibold">
                <span className="text-zinc-300">Total</span>
                <span className="text-amber-400">{totalPrice.toFixed(2)} €</span>
              </div>
              {notice && (
                <p className="mt-3 rounded-lg border border-amber-900 bg-amber-950/50 px-4 py-2.5 text-sm text-amber-400">
                  {notice}
                </p>
              )}
              <button
                onClick={handleCheckout}
                disabled={checkingOut}
                className="mt-4 w-full rounded-lg bg-amber-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-500 disabled:opacity-60"
              >
                {checkingOut ? "…" : t("checkout")}
              </button>
              <button
                onClick={clearCart}
                className="mt-2 w-full rounded-lg border border-zinc-700 py-2 text-sm text-zinc-400 transition-colors hover:border-red-700 hover:text-red-400"
              >
                {t("clearCart")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
