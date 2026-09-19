// lib/format.ts
export function formatPrice(value: string | number): string {
  const n = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}