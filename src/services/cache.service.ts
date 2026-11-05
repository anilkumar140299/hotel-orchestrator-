import { redis } from "../config/redis";
import { env } from "../config/env";
import { AggregationResult, HotelOffer } from "../types/hotel";

function keys(city: string) {
  const normalizedCity = city.trim().toLowerCase();
  return {
    sortedSet: `hotels:${normalizedCity}:prices`,
    hash: `hotels:${normalizedCity}:offers`,
    meta: `hotels:${normalizedCity}:meta`
  };
}

export async function cacheHotels(result: AggregationResult): Promise<void> {
  const key = keys(result.city);
  const pipeline = redis.pipeline();

  pipeline.del(key.sortedSet, key.hash, key.meta);

  for (const hotel of result.hotels) {
    pipeline.zadd(key.sortedSet, hotel.price, hotel.id);
    pipeline.hset(key.hash, hotel.id, JSON.stringify(hotel));
  }

  pipeline.hset(key.meta, {
    fetchedAt: result.fetchedAt,
    degradedSuppliers: JSON.stringify(result.degradedSuppliers)
  });

  pipeline.expire(key.sortedSet, env.cacheTtlSeconds);
  pipeline.expire(key.hash, env.cacheTtlSeconds);
  pipeline.expire(key.meta, env.cacheTtlSeconds);

  const response = await pipeline.exec();
  if (response?.some(([error]) => error)) {
    throw new Error("Redis pipeline failed while caching hotel offers");
  }
}

export async function readHotelsFromCache(
  city: string,
  minPrice?: number,
  maxPrice?: number
): Promise<AggregationResult | null> {
  const key = keys(city);
  const exists = await redis.exists(key.meta);
  if (!exists) return null;

  const min = minPrice ?? "-inf";
  const max = maxPrice ?? "+inf";
  const ids = await redis.zrangebyscore(key.sortedSet, min, max);
  const rawOffers = ids.length ? await redis.hmget(key.hash, ...ids) : [];
  const hotels = rawOffers
    .filter((value): value is string => value !== null)
    .map((value) => JSON.parse(value) as HotelOffer);

  const meta = await redis.hgetall(key.meta);
  return {
    city: city.trim().toLowerCase(),
    hotels,
    fetchedAt: meta.fetchedAt ?? new Date().toISOString(),
    degradedSuppliers: meta.degradedSuppliers ? JSON.parse(meta.degradedSuppliers) as string[] : []
  };
}
