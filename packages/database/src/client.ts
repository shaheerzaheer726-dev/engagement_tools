import "./load-env.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client.js";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prisma = globalForPrisma.prisma;

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is required to create a database client");
  }

  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

/**
 * Return the shared database client, creating it on first use.
 *
 * Keeping client creation behind this function allows build tools to import
 * route modules without requiring runtime-only environment variables.
 */
export function getDb(): PrismaClient {
  if (!prisma) {
    prisma = createPrismaClient();

    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = prisma;
    }
  }

  return prisma;
}
