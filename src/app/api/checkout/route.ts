import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getStripe, isStripeConfigured } from "@/lib/stripe/config";
import { getProductsByIds } from "@/lib/data/shop";
import type { SupportedLocale } from "@/types";

const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(20),
      })
    )
    .min(1)
    .max(50),
  locale: z.enum(["fr", "en"]).default("fr"),
});

export async function POST(request: NextRequest) {
  let parsed;
  try {
    parsed = checkoutSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "stripe_not_configured" },
      { status: 503 }
    );
  }

  const locale = parsed.locale as SupportedLocale;
  // Prices are resolved server-side — never trust amounts sent by the client.
  const products = await getProductsByIds(
    parsed.items.map((i) => i.productId),
    locale
  );
  const productMap = new Map(products.map((p) => [p.id, p]));

  const lineItems = [];
  for (const item of parsed.items) {
    const product = productMap.get(item.productId);
    if (!product) {
      return NextResponse.json({ error: "unknown_product" }, { status: 400 });
    }
    if (product.stock < item.quantity) {
      return NextResponse.json({ error: "insufficient_stock" }, { status: 409 });
    }
    lineItems.push({
      quantity: item.quantity,
      price_data: {
        currency: "eur",
        unit_amount: Math.round(product.priceEur * 100),
        product_data: {
          name: product.name,
          ...(product.imageUrl && { images: [product.imageUrl] }),
        },
      },
    });
  }

  const origin = request.headers.get("origin") ?? request.nextUrl.origin;
  const shopPath = locale === "fr" ? "/fr/boutique" : "/en/shop";

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    success_url: `${origin}${shopPath}?checkout=success`,
    cancel_url: `${origin}${shopPath}?checkout=cancelled`,
    metadata: {
      items: JSON.stringify(
        parsed.items.map((i) => `${i.productId}:${i.quantity}`)
      ),
    },
  });

  return NextResponse.json({ url: session.url });
}
