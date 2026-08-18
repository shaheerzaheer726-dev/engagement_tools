import "../src/load-env.js";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to run the seed script");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

function requireSeedVariable(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(
      `${name} is required. Set explicit bootstrap admin credentials before running the seed command.`,
    );
  }

  return value;
}

const ADMIN_USERNAME = requireSeedVariable("SEED_ADMIN_USERNAME");
const ADMIN_PASSWORD = requireSeedVariable("SEED_ADMIN_PASSWORD");
const ADMIN_NAME = process.env.SEED_ADMIN_NAME?.trim() || "Administrator";

if (ADMIN_USERNAME.length < 3) {
  throw new Error("SEED_ADMIN_USERNAME must be at least 3 characters long");
}

if (ADMIN_PASSWORD.length < 12) {
  throw new Error("SEED_ADMIN_PASSWORD must be at least 12 characters long");
}

if (Buffer.byteLength(ADMIN_PASSWORD, "utf8") > 72) {
  throw new Error(
    "SEED_ADMIN_PASSWORD must be at most 72 UTF-8 bytes for bcrypt",
  );
}

if (ADMIN_PASSWORD.toLowerCase() === ADMIN_USERNAME.toLowerCase()) {
  throw new Error("SEED_ADMIN_PASSWORD must not match SEED_ADMIN_USERNAME");
}

async function main() {
  const existing = await prisma.user.findUnique({
    where: { username: ADMIN_USERNAME },
  });

  if (existing) {
    if (existing.role !== "ADMIN") {
      throw new Error(
        `Cannot create bootstrap admin: username "${ADMIN_USERNAME}" belongs to a non-admin account.`,
      );
    }

    console.log(
      `Admin user "${ADMIN_USERNAME}" already exists (id: ${existing.id}). Skipping.`,
    );
    return;
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const admin = await prisma.user.create({
    data: {
      username: ADMIN_USERNAME,
      name: ADMIN_NAME,
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  console.log(`Created admin user "${admin.username}" (id: ${admin.id}).`);
  console.log("The bootstrap password was not printed. Store it securely.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
