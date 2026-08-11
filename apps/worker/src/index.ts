import "./load-env.ts";
import { createServer } from "node:http";
import { PgBoss } from "pg-boss";
import { env } from "./env.js";

const boss = new PgBoss({
  connectionString: env.DATABASE_URL,
  application_name: "engagement-tools-worker",
});

boss.on("error", (error) => {
  console.error("Queue error", error);
});

await boss.start();

// Register queue handlers here. Keep each job type in its own module and make
// handlers idempotent so retries are safe.

const healthServer = createServer((_request, response) => {
  response.writeHead(200, { "content-type": "application/json" });
  response.end(JSON.stringify({ status: "ok", service: "worker" }));
});

healthServer.listen(env.WORKER_HEALTH_PORT, () => {
  console.info(`Worker ready on health port ${env.WORKER_HEALTH_PORT}`);
});

let shuttingDown = false;

async function shutdown(signal: NodeJS.Signals) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.info(`Received ${signal}; shutting down gracefully`);
  healthServer.close();
  await boss.stop({ graceful: true, timeout: 30_000 });
  process.exit(0);
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
