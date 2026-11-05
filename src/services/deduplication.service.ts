import { HotelOffer, SupplierHotel } from "../types/hotel";

export function normalizeHotelName(name: string): string {
  return name.normalize("NFKC").trim().toLocaleLowerCase().replace(/\s+/g, " ");
}

function stableHotelId(city: string, normalizedName: string): string {
  let hash = 2166136261;
  for (const char of `${city.toLowerCase()}:${normalizedName}`) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return `h${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

export function deduplicateHotels(hotels: SupplierHotel[]): HotelOffer[] {
  const bestByName = new Map<string, HotelOffer>();

  for (const hotel of hotels) {
    const normalizedName = normalizeHotelName(hotel.name);
    const candidate: HotelOffer = {
      ...hotel,
      id: stableHotelId(hotel.city, normalizedName),
      normalizedName
    };
    const current = bestByName.get(normalizedName);

    if (
      !current ||
      candidate.price < current.price ||
      (candidate.price === current.price && candidate.commissionRate > current.commissionRate)
    ) {
      bestByName.set(normalizedName, candidate);
    }
  }

  return [...bestByName.values()].sort((a, b) => a.price - b.price || a.name.localeCompare(b.name));
}
