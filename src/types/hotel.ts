export interface SupplierHotel {
  id: string;
  name: string;
  city: string;
  price: number;
  commissionRate: number;
  supplier: "supplierA" | "supplierB";
  currency: "INR";
}

export interface HotelOffer {
  id?: string;
  name?: string;
  normalizedName?: string;
  city?: string;
  price?: number;
  commissionRate?: number;
  supplier?: "supplierA" | "supplierB";
  currency?: "INR";
}

export interface SupplierResult {
  supplier: "supplierA" | "supplierB";
  hotels: SupplierHotel[];
}

export interface AggregationResult {
  city: string;
  hotels: HotelOffer[];
  degradedSuppliers: string[];
  fetchedAt: string;
  pagination?: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}