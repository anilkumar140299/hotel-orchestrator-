import { app } from "./app";
import { env } from "./config/env";
import { redis } from "./config/redis";
import { logger } from "./utils/logger";
import { closeTemporalClient } from "./temporal/client";

async function start(): Promise<void> {
  await redis.connect();
  await redis.ping();

  const server = app.listen(env.port, () => {
    logger.info({ port: env.port }, "Hotel offer API is listening");
  });

  const shutdown = async (signal: string) => {
    logger.info({ signal }, "Shutting down");
    server.close(async () => {
      await closeTemporalClient();
      await redis.quit();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

start().catch((error) => {
  logger.fatal({ err: error }, "Could not start API");
  process.exit(1);
});
