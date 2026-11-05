import { proxyActivities } from "@temporalio/workflow";
import type * as activities from "../workflows/hotel.activities";
import { AggregationResult } from "../types/hotel";
import { deduplicateHotels } from "../services/deduplication.service";

const { fetchSupplier } = proxyActivities<typeof activities>({
  startToCloseTimeout: "5 seconds",
  retry: {
    initialInterval: "300 milliseconds",
    maximumInterval: "2 seconds",
    maximumAttempts: 2
  }
});

export async function aggregateHotelsWorkflow(city: string): Promise<AggregationResult> {
  const suppliers = await Promise.allSettled([
    fetchSupplier("supplierA", city),
    fetchSupplier("supplierB", city)
  ]);

  const hotels = suppliers.flatMap((result) =>
    result.status === "fulfilled" ? result.value : []
  );
  const degradedSuppliers = suppliers.flatMap((result, index) =>
    result.status === "rejected" ? [index === 0 ? "supplierA" : "supplierB"] : []
  );

  const selected = deduplicateHotels(hotels);

  return {
    city: city.trim().toLowerCase(),
    hotels: selected,
    degradedSuppliers,
    fetchedAt: new Date().toISOString()
  };
}

