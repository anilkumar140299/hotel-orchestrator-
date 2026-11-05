import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { readHotelsFromCache } from "../services/cache.service";
import { aggregateAndCacheHotels } from "../services/hotel-orchestrator.service";

const querySchema = z.object({
  city: z.string().trim().min(1).max(100),
  minPrice: z.coerce.number().finite().nonnegative().optional(),
  maxPrice: z.coerce.number().finite().nonnegative().optional()
}).refine(
  (query) => query.minPrice === undefined || query.maxPrice === undefined || query.minPrice <= query.maxPrice,
  { message: "minPrice must be less than or equal to maxPrice" }
);

export async function getHotels(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = querySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({
        error: "Invalid query parameters",
        details: parsed.error.flatten().fieldErrors
      });
      return;
    }

    const { city, minPrice, maxPrice } = parsed.data;
    const cached = await readHotelsFromCache(city, minPrice, maxPrice);

    if (cached) {
      if (cached.degradedSuppliers.length) {
        res.setHeader("x-degraded-suppliers", cached.degradedSuppliers.join(","));
      }
      res.setHeader("x-cache", "HIT");
      res.json(cached);
      return;
    }

    // A filtered request must be based on a complete cached supplier aggregation.
    // On a cold cache, aggregate once and then apply the requested range in memory.
    const fresh = await aggregateAndCacheHotels(city);
    const hotels = fresh.hotels.filter((hotel) =>
      (minPrice === undefined || hotel.price >= minPrice) &&
      (maxPrice === undefined || hotel.price <= maxPrice)
    );

    if (fresh.degradedSuppliers.length) {
      res.setHeader("x-degraded-suppliers", fresh.degradedSuppliers.join(","));
    }
    res.setHeader("x-cache", "MISS");
    res.json({ ...fresh, hotels });
  } catch (error) {
    next(error);
  }
}
