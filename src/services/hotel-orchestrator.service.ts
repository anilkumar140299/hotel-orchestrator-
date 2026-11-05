import { randomUUID } from "node:crypto";
import { getTemporalClient } from "../temporal/client";
import { env } from "../config/env";
import { AggregationResult } from "../types/hotel";
import { cacheHotels } from "./cache.service";
import { aggregateHotelsWorkflow } from "../workflows/hotel.workflow";
import { logger } from "../utils/logger";

export async function aggregateAndCacheHotels(city: string): Promise<AggregationResult> {
  const client = await getTemporalClient();
  const workflowId = `hotel-aggregation-${city.trim().toLowerCase()}-${randomUUID()}`;

  const result = await client.workflow.execute(aggregateHotelsWorkflow, {
    taskQueue: env.temporalTaskQueue,
    workflowId,
    args: [city]
  });

  await cacheHotels(result);
  if (result.degradedSuppliers.length) {
    logger.warn({ city, degradedSuppliers: result.degradedSuppliers }, "Hotel aggregation completed with partial supplier data");
  }

  return result;
}
