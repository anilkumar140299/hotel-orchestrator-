import Redis from "ioredis";
import { env } from "./env";

export const redis = new Redis(env.redisUrl, {
  lazyConnect: true,
  maxRetriesPerRequest: 2,
  retryStrategy: (attempt) => Math.min(attempt * 200, 2000)
});
