import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { REGIONS, formatMoney } from "@/lib/scoreflipp";
import { LogOut, Trash2, FileText, Shield, Crown } from "lucide-react";
import { isProUser, FREE_SCAN_LIMIT, purchasePro, restorePurchases, refreshProStatus } from "@/lib/paywall";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — Score Flipp" }, { name: "description", content: "Your region, currency and stats." }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useSession();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ scans: 0, sold: 0, profit: 0 });
  const [deleting, setDeleting] = useState(false);
  const [buying, setBuying] = useState(false);
  const [pro, setPro] = useState(isProUser());

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => setProfile(data));
    supabase.from("scans").select("est_profit, sold, sold_price, currency").then(({ data }) => {
      const arr = data ?? [];
      const sold = arr.filter((s: any) => s.sold);
      setStats({
        scans: arr.length,
        sold: sold.length,
        profit: sold.reduce((sum: number, s: any) => sum + Number(s.sold_price ?? s.est_profit ?? 0), 0),
      });
    });
    refreshProStatus(user.id).then(setPro);
  }, [user]);

  async function buyPro() {
    if (!user) return;
    setBuying(true);
    const r = await purchasePro(user.id);
    setBuying(false);
    if (r.ok) {
      setPro(true);
      toast.success(r.message ?? "Pro unlocked!");
    } else {
      toast.error(r.message ?? "Purchase failed");
    }
  }

  async function restore() {
    if (!user) return;
    const active = await restorePurchases(user.id);
    setPro(active);
    toast[active ? "success" : "info"](active ? "Pro restored" : "No active subscription found");
  }


  async function update(patch: any) {
    if (!user) return;
    const { error } = await supabase.from("profiles").upsert({ id: user.id, ...profile, ...patch });
    if (error) return toast.error(error.message);
    setProfile({ ...profile, ...patch });
    toast.success("Updated");
  }

  async function logout() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  async function deleteAccount() {
    setDeleting(true);
    try {
      const { error } = await supabase.functions.invoke("delete-account");
      if (error) throw error;
      await supabase.auth.signOut();
      toast.success("Account deleted");
      navigate({ to: "/auth" });
    } catch (e: any) {
      toast.error(e.message ?? "Could not delete account");
    } finally {
      setDeleting(false);
    }
  }

  if (!profile) return <MobileShell><p className="text-muted-foreground">Loading…</p></MobileShell>;

  const currency = profile.currency ?? "USD";
  return (
    <MobileShell>
      <h1 className="text-2xl font-extrabold mb-1">Profile</h1>
      <p className="text-sm text-muted-foreground mb-4">{user?.email}</p>

      <div className="grid grid-cols-3 gap-2 mb-5">
        <Stat label="Scans" value={String(stats.scans)} />
        <Stat label="Sold" value={String(stats.sold)} />
        <Stat label="Profit" value={formatMoney(stats.profit, currency)} highlight />
      </div>

      <Card className="p-4 space-y-3">
        <div>
          <Label>Region</Label>
          <Select value={profile.region ?? "US"} onValueChange={(v) => {
            const r = REGIONS.find((x) => x.code === v)!;
            update({ region: v, currency: r.currency });
          }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {REGIONS.map((r) => <SelectItem key={r.code} value={r.code}>{r.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Currency</Label>
          <Select value={profile.currency ?? "USD"} onValueChange={(v) => update({ currency: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["USD","CAD","GBP","EUR","AUD"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {!pro ? (
        <Card className="p-4 mt-4 bg-gradient-hero text-primary-foreground border-0">
          <div className="flex items-center gap-2 font-bold"><Crown className="h-4 w-4" /> Upgrade to Pro</div>
          <p className="text-sm opacity-90 mt-1">Unlimited scans, batch mode, and price-drop alerts. Free plan: {FREE_SCAN_LIMIT} scans/month.</p>
          <Button variant="secondary" className="w-full mt-3" disabled={buying} onClick={buyPro}>
            {buying ? "Processing…" : "Get Pro — $4.99/mo"}
          </Button>
          <button onClick={restore} className="w-full mt-2 text-xs opacity-80 underline">Restore purchases</button>
        </Card>
      ) : (
        <Card className="p-4 mt-4 bg-gradient-success text-success-foreground border-0">
          <div className="flex items-center gap-2 font-bold"><Crown className="h-4 w-4" /> Pro active</div>
          <p className="text-sm opacity-90 mt-1">Unlimited scans unlocked. Manage your subscription in your app store settings.</p>
        </Card>
      )}
        <Card className="p-4 mt-4 bg-gradient-hero text-primary-foreground border-0">
          <div className="flex items-center gap-2 font-bold"><Crown className="h-4 w-4" /> Upgrade to Pro</div>
          <p className="text-sm opacity-90 mt-1">Unlimited scans, batch mode, and price-drop alerts. Free plan: {FREE_SCAN_LIMIT} scans/month.</p>
          <Button variant="secondary" className="w-full mt-3" onClick={() => {
            localStorage.setItem("sf_pro", "1");
            toast.success("Pro activated! (In native build this triggers RevenueCat purchase.)");
            setTimeout(() => window.location.reload(), 600);
          }}>
            Get Pro — $4.99/mo
          </Button>
        </Card>
      ) : (
        <Card className="p-4 mt-4 bg-gradient-success text-success-foreground border-0">
          <div className="flex items-center gap-2 font-bold"><Crown className="h-4 w-4" /> Pro active</div>
          <p className="text-sm opacity-90 mt-1">Thanks for supporting Score Flipp. Unlimited scans unlocked.</p>
          <Button variant="secondary" className="w-full mt-3" onClick={() => {
            localStorage.removeItem("sf_pro");
            window.location.reload();
          }}>
            Cancel (test)
          </Button>
        </Card>
      )}

      <Card className="p-2 mt-4">
        <Link to="/privacy" className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted text-sm">
          <Shield className="h-4 w-4 text-muted-foreground" /> Privacy Policy
        </Link>
        <Link to="/terms" className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted text-sm">
          <FileText className="h-4 w-4 text-muted-foreground" /> Terms of Service
        </Link>
      </Card>

      <Button variant="outline" className="w-full mt-4" onClick={logout}>
        <LogOut className="h-4 w-4 mr-1.5" />Sign out
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" className="w-full mt-2 text-destructive hover:text-destructive hover:bg-destructive/10">
            <Trash2 className="h-4 w-4 mr-1.5" />Delete account
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes your scans, photos, and profile. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteAccount} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? "Deleting…" : "Delete forever"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MobileShell>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl p-3 text-center ${highlight ? "bg-gradient-success text-success-foreground" : "bg-secondary text-secondary-foreground"}`}>
      <p className="text-xs opacity-80">{label}</p>
      <p className="font-extrabold">{value}</p>
    </div>
  );
}
