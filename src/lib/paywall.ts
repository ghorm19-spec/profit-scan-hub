import { supabase } from "@/integrations/supabase/client";
import { Purchases, type Package } from "@revenuecat/purchases-js";

export const FREE_SCAN_LIMIT = 5;

// Public RevenueCat web billing key. Replace with your real key from app.revenuecat.com.
const RC_WEB_KEY = (import.meta.env.VITE_REVENUECAT_WEB_KEY as string | undefined) ?? "";
const PRO_ENTITLEMENT = "pro";

let configured = false;
function ensureConfigured(userId: string) {
  if (configured || !RC_WEB_KEY) return;
  Purchases.configure(RC_WEB_KEY, userId);
  configured = true;
}

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

/** Fast local check used by the UI. Falls back to cached flag for offline / web stub. */
export function isProUser(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("sf_pro") === "1";
}

/** Refresh entitlement state from RevenueCat (or cache) and persist locally. */
export async function refreshProStatus(userId?: string): Promise<boolean> {
  try {
    if (RC_WEB_KEY && userId) {
      ensureConfigured(userId);
      const info = await Purchases.getSharedInstance().getCustomerInfo();
      const active = !!info.entitlements.active[PRO_ENTITLEMENT];
      localStorage.setItem("sf_pro", active ? "1" : "0");
      return active;
    }
  } catch (e) {
    console.warn("RevenueCat refresh failed", e);
  }
  return isProUser();
}

/** Trigger purchase. On web with no RC key configured, falls back to a local unlock for testing. */
export async function purchasePro(userId: string): Promise<{ ok: boolean; message?: string }> {
  if (!RC_WEB_KEY) {
    localStorage.setItem("sf_pro", "1");
    return { ok: true, message: "Pro unlocked (test mode — configure VITE_REVENUECAT_WEB_KEY for real billing)." };
  }
  try {
    ensureConfigured(userId);
    const offerings = await Purchases.getSharedInstance().getOfferings();
    const pkg: Package | undefined = offerings.current?.availablePackages?.[0];
    if (!pkg) return { ok: false, message: "No subscription package configured in RevenueCat." };
    await Purchases.getSharedInstance().purchase({ rcPackage: pkg });
    const active = await refreshProStatus(userId);
    return active ? { ok: true } : { ok: false, message: "Purchase did not unlock Pro." };
  } catch (e: any) {
    return { ok: false, message: e?.message ?? "Purchase failed" };
  }
}

export async function restorePurchases(userId: string): Promise<boolean> {
  return refreshProStatus(userId);
}
