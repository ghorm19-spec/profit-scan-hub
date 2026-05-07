import { supabase } from "@/integrations/supabase/client";

export const FREE_SCAN_LIMIT = 5;

/** Returns how many scans the user has used this calendar month, and whether they hit the cap. */
export async function getMonthlyUsage(userId: string) {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  const { count } = await supabase
    .from("scans")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", start.toISOString());
  const used = count ?? 0;
  return { used, limit: FREE_SCAN_LIMIT, remaining: Math.max(0, FREE_SCAN_LIMIT - used), capped: used >= FREE_SCAN_LIMIT };
}

/** Stub: in native build this becomes a RevenueCat call. */
export function isProUser(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("sf_pro") === "1";
}
