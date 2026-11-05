import { SupplierHotel } from "../types/hotel";

const supplierA: SupplierHotel[] = [
  { id: "A-101", name: "The Grand Palace", city: "delhi", price: 8500, commissionRate: 12, supplier: "supplierA", currency: "INR" },
  { id: "A-102", name: "City Comfort Inn", city: "delhi", price: 4200, commissionRate: 10, supplier: "supplierA", currency: "INR" },
  { id: "A-103", name: "Park View Hotel", city: "delhi", price: 6200, commissionRate: 14, supplier: "supplierA", currency: "INR" },
  { id: "A-104", name: "Lake View Residency", city: "jaipur", price: 5100, commissionRate: 11, supplier: "supplierA", currency: "INR" }
];

const supplierB: SupplierHotel[] = [
  { id: "B-201", name: "The Grand Palace", city: "delhi", price: 8100, commissionRate: 9, supplier: "supplierB", currency: "INR" },
  { id: "B-202", name: "City Comfort Inn", city: "delhi", price: 4200, commissionRate: 15, supplier: "supplierB", currency: "INR" },
  { id: "B-203", name: "Metro Suites", city: "delhi", price: 9900, commissionRate: 13, supplier: "supplierB", currency: "INR" },
  { id: "B-204", name: "Lake View Residency", city: "jaipur", price: 4900, commissionRate: 10, supplier: "supplierB", currency: "INR" }
];

export function getSupplierHotels(supplier: "supplierA" | "supplierB", city: string): SupplierHotel[] {
  const source = supplier === "supplierA" ? supplierA : supplierB;
  return source.filter((hotel) => hotel.city.toLowerCase() === city.trim().toLowerCase());
}
