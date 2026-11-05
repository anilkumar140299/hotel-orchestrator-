import { fetchSupplierHotels } from "../services/supplier.service";
import { SupplierHotel } from "../types/hotel";

export async function fetchSupplier(
  supplier: "supplierA" | "supplierB",
  city: string
): Promise<SupplierHotel[]> {
  return fetchSupplierHotels(supplier, city);
}
