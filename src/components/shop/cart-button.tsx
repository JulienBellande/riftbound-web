"use client";

import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useState } from "react";
import { CartDrawer } from "./cart-drawer";

export function CartButton() {
  const totalItems = useCartStore((s) => s.totalItems());
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative rounded-lg border border-zinc-700 p-2 text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200"
        aria-label="Cart"
      >
        <ShoppingCart size={20} />
        {totalItems > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-600 text-[10px] font-bold text-white">
            {totalItems}
          </span>
        )}
      </button>
      {open && <CartDrawer onClose={() => setOpen(false)} />}
    </>
  );
}
