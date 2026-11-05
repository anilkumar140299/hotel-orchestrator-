import { env } from "../config/env";
import { SupplierHotel } from "../types/hotel";

type SupplierName = "supplierA" | "supplierB";

export async function fetchSupplierHotels(supplier: SupplierName, city: string): Promise<SupplierHotel[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.supplierTimeoutMs);

  try {
    const response = await fetch(
      `${env.supplierBaseUrl}/${supplier}/hotels?city=${encodeURIComponent(city)}`,
      { signal: controller.signal }
    );

    if (!response.ok) {
      throw new Error(`${supplier} returned HTTP ${response.status}`);
    }

    return (await response.json()) as SupplierHotel[];
  } finally {
    clearTimeout(timeout);
  }
}
