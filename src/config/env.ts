import "dotenv/config";

function numberFromEnv(name: string, fallback: number): number {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export const env = {
  port: numberFromEnv("PORT", 3000),
  redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
  temporalAddress: process.env.TEMPORAL_ADDRESS ?? "localhost:7233",
  temporalNamespace: process.env.TEMPORAL_NAMESPACE ?? "default",
  temporalTaskQueue: process.env.TEMPORAL_TASK_QUEUE ?? "hotel-offer-queue",
  supplierBaseUrl: process.env.SUPPLIER_BASE_URL ?? "http://localhost:3000",
  cacheTtlSeconds: numberFromEnv("CACHE_TTL_SECONDS", 300),
  supplierTimeoutMs: numberFromEnv("SUPPLIER_TIMEOUT_MS", 2500)
};
