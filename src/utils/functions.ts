

type SortOrder = "asc" | "desc";

export function selectFields<T extends object>(
  data: T[] | undefined,
  selectedFields: string[]
): Partial<T>[] {
  if (!data) return [];

  return data.map((item) => {
    const result: Partial<T> = {};

    for (const field of selectedFields) {
      (result as any)[field] = (item as any)[field];
    }

    return result;
  });
}

export function sortByKey<T>(
  data: T[],
  key: keyof T,
  order: SortOrder = "asc"
): T[] {
  return [...data].sort((a, b) => {
    const valueA = a[key];
    const valueB = b[key];

    let comparison = 0;

    if (typeof valueA === "number" && typeof valueB === "number") {
      comparison = valueA - valueB;
    } else {
      comparison = String(valueA ?? "").localeCompare(
        String(valueB ?? ""),
        undefined,
        { sensitivity: "base", numeric: true }
      );
    }

    return order === "asc" ? comparison : -comparison;
  });
}