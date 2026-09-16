import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const connectionString =
    process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL must be configured");

  // Cloud database connections must verify the server certificate.
  const ssl = connectionString.includes("supabase") || connectionString.includes("neon")
    ? { rejectUnauthorized: true }
    : undefined;

  const adapter = new PrismaPg({ connectionString, ssl });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
