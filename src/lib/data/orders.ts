import "server-only";
import { prisma, isDatabaseConfigured } from "@/lib/db";

export interface OrderSummary {
  id: string;
  status: string;
  totalEur: number;
  createdAt: string;
  items: {
    name: string;
    quantity: number;
    unitPrice: number;
  }[];
}

export async function getOrdersByUser(
  userId: string
): Promise<OrderSummary[]> {
  if (!isDatabaseConfigured()) {
    // Orders are only persisted via the Stripe webhook, which requires a
    // configured database — nothing to show in demo mode.
    return [];
  }

  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      items: { include: { product: { select: { nameEn: true, nameFr: true } } } },
    },
  });

  return orders.map((o) => ({
    id: o.id,
    status: o.status,
    totalEur: Number(o.totalEur),
    createdAt: o.createdAt.toISOString(),
    items: o.items.map((i) => ({
      name: i.product.nameEn,
      quantity: i.quantity,
      unitPrice: Number(i.unitPrice),
    })),
  }));
}
