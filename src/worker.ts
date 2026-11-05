import { NativeConnection, Worker } from "@temporalio/worker";
import { env } from "./config/env";
import * as activities from "./workflows/hotel.activities";
import { logger } from "./utils/logger";

async function runWorker(): Promise<void> {
  const connection = await NativeConnection.connect({ address: env.temporalAddress });
  const worker = await Worker.create({
    connection,
    namespace: env.temporalNamespace,
    taskQueue: env.temporalTaskQueue,
    workflowsPath: require.resolve("./workflows/hotel.workflow"),
    activities
  });

  logger.info({ taskQueue: env.temporalTaskQueue }, "Temporal worker started");
  await worker.run();
}

runWorker().catch((error) => {
  logger.fatal({ err: error }, "Temporal worker failed");
  process.exit(1);
});
