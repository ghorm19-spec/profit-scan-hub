export type DemandLevel = "High" | "Medium" | "Low";

export function formatMoney(n: number | null | undefined, currency = "USD") {
  if (n == null || isNaN(Number(n))) return "—";
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 0 }).format(Number(n));
  } catch {
    return `${currency} ${Math.round(Number(n))}`;
  }
}

export const REGIONS: { code: string; label: string; currency: string }[] = [
  { code: "US", label: "United States", currency: "USD" },
  { code: "CA", label: "Canada", currency: "CAD" },
  { code: "UK", label: "United Kingdom", currency: "GBP" },
  { code: "EU", label: "Europe", currency: "EUR" },
  { code: "AU", label: "Australia", currency: "AUD" },
  { code: "GLOBAL", label: "Global", currency: "USD" },
];

export function detectRegion(): { region: string; currency: string } {
  if (typeof navigator === "undefined") return { region: "US", currency: "USD" };
  const lang = navigator.language || "en-US";
  const cc = lang.split("-")[1]?.toUpperCase() ?? "";
  const map: Record<string, { region: string; currency: string }> = {
    US: { region: "US", currency: "USD" },
    CA: { region: "CA", currency: "CAD" },
    GB: { region: "UK", currency: "GBP" },
    AU: { region: "AU", currency: "AUD" },
  };
  if (map[cc]) return map[cc];
  if (["DE","FR","ES","IT","NL","IE","PT","BE","AT","FI"].includes(cc)) return { region: "EU", currency: "EUR" };
  return { region: "US", currency: "USD" };
}
