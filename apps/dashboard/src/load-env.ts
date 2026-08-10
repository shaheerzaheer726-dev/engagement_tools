import dotenv from "dotenv";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function findEnvPath(): string | undefined {
  let currentDir = __dirname;

  for (let i = 0; i < 8; i += 1) {
    const candidate = resolve(currentDir, ".env");
    if (existsSync(candidate)) {
      return candidate;
    }
    currentDir = resolve(currentDir, "..");
  }

  return undefined;
}

const envPath = findEnvPath();
if (envPath) {
  dotenv.config({ path: envPath });
}
