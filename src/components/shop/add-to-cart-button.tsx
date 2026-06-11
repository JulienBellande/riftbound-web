"use client";

import { useCartStore } from "@/stores/cart-store";

export function AddToCartButton({
  productId,
  name,
  price,
  imageUrl,
  label,
}: {
  productId: string;
  name: string;
  price: number;
  imageUrl: string | null;
  label: string;
}) {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <button
      onClick={() => addItem({ productId, name, price, imageUrl })}
      className="mt-3 w-full rounded-lg bg-amber-600 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-500"
    >
      {label}
    </button>
  );
}
