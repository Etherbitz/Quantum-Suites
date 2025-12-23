import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Global type declaration so Prisma survives hot reloads in dev.
 */
declare global {
  var prisma: PrismaClient | undefined;
}

/**
 * Create a single shared PG pool.
 * Prisma 7 requires adapters for optimal serverless behavior.
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Create Prisma adapter.
 */
const adapter = new PrismaPg(pool);

/**
 * Instantiate Prisma once.
 * Reuse across reloads in development.
 */
export const prisma =
  global.prisma ??
  new PrismaClient({
    adapter,
  });

/**
 * Cache Prisma client in dev only.
 * Prevents multiple instances during HMR.
 */
if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
