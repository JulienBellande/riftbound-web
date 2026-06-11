import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/**
 * True when a real PostgreSQL connection string is configured.
 * Without it, the data layer serves the bundled sample dataset so the
 * site stays fully navigable in demos and previews.
 */
export function isDatabaseConfigured(): boolean {
  const url = process.env.DATABASE_URL;
  return !!url && url.startsWith("postgres");
}
