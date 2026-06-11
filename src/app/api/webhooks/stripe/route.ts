import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { getStripe, isStripeConfigured } from "@/lib/stripe/config";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import type Stripe from "stripe";

export async function POST(request: NextRequest) {
  // Raw body required for Stripe signature verification
  const body = await request.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!isStripeConfigured() || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe is not configured" },
      { status: 503 }
    );
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    await fulfillOrder(session);
  }

  return NextResponse.json({ received: true });
}

async function fulfillOrder(session: Stripe.Checkout.Session) {
  if (!isDatabaseConfigured()) return;

  // Items are encoded as "productId:quantity" in the session metadata
  const rawItems: string[] = JSON.parse(session.metadata?.items ?? "[]");
  const items = rawItems.map((entry) => {
    const [productId, quantity] = entry.split(":");
    return { productId, quantity: Number(quantity) };
  });
  if (items.length === 0) return;

  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) } },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  await prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        stripeSessionId: session.id,
        email: session.customer_details?.email ?? "",
        totalEur: (session.amount_total ?? 0) / 100,
        status: "PAID",
        items: {
          create: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            unitPrice: Number(productMap.get(i.productId)?.priceEur ?? 0),
          })),
        },
      },
    });

    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return order;
  });
}
