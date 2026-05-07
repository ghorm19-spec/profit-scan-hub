import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { REGIONS, formatMoney } from "@/lib/scoreflipp";
import { LogOut } from "lucide-react";
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
  }, [user]);

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

      <Button variant="outline" className="w-full mt-4" onClick={logout}>
        <LogOut className="h-4 w-4 mr-1.5" />Sign out
      </Button>
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
