import { deduplicateHotels } from "../src/services/deduplication.service";
import { SupplierHotel } from "../src/types/hotel";

const hotel = (overrides: Partial<SupplierHotel>): SupplierHotel => ({
  id: "x",
  name: "The Grand Palace",
  city: "delhi",
  price: 8000,
  commissionRate: 10,
  supplier: "supplierA",
  currency: "INR",
  ...overrides
});

describe("deduplicateHotels", () => {
  it("keeps the cheapest offer for the same hotel", () => {
    const result = deduplicateHotels([
      hotel({ price: 8500, supplier: "supplierA" }),
      hotel({ price: 8100, supplier: "supplierB" })
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].price).toBe(8100);
    expect(result[0].supplier).toBe("supplierB");
  });

  it("uses higher commission when prices are equal", () => {
    const result = deduplicateHotels([
      hotel({ price: 8000, commissionRate: 10, supplier: "supplierA" }),
      hotel({ price: 8000, commissionRate: 15, supplier: "supplierB" })
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].commissionRate).toBe(15);
    expect(result[0].supplier).toBe("supplierB");
  });

  it("normalizes case and whitespace before comparing names", () => {
    const result = deduplicateHotels([
      hotel({ name: "  THE GRAND   PALACE ", price: 8000 }),
      hotel({ name: "the grand palace", price: 7900, supplier: "supplierB" })
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].price).toBe(7900);
  });
});
