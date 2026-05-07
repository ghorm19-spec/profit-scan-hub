import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Bookmark, BookmarkCheck, Share2, CheckCircle2, GitCompare, Store, Zap, DollarSign, Clock, ShieldAlert, Sparkles } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { DemandBadge } from "@/components/DemandBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { formatMoney } from "@/lib/scoreflipp";
import { toast } from "sonner";

export const Route = createFileRoute("/result/$id")({
  head: () => ({ meta: [{ title: "Scan result — Score Flipp" }, { name: "description", content: "Detailed resale analysis for your scanned item." }] }),
  component: ResultPage,
  errorComponent: ({ error }) => <div className="p-6">Error: {error.message}</div>,
  notFoundComponent: () => <div className="p-6">Scan not found</div>,
});

function ResultPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [scan, setScan] = useState<any>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data, error } = await supabase.from("scans").select("*").eq("id", id).maybeSingle();
    if (error) toast.error(error.message);
    setScan(data);
    setNotes(data?.notes ?? "");
    setLoading(false);
  }

  useEffect(() => { load(); }, [id]);

  async function update(patch: any) {
    const { error } = await supabase.from("scans").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    setScan({ ...scan, ...patch });
  }

  async function markSold() {
    const priceStr = window.prompt("Sold for? (number)");
    if (!priceStr) return;
    const sold_price = Number(priceStr);
    if (Number.isNaN(sold_price)) return;
    await update({ sold: true, sold_price, sold_at: new Date().toISOString() });
    toast.success("Marked as sold");
  }

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: scan.item_name, text: `${scan.item_name} — ${scan.demand} demand`, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    }
  }

  if (loading) return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;
  if (!scan) return <MobileShell><p>Not found.</p></MobileShell>;

  const recColor = scan.recommendation === "Buy" ? "bg-gradient-success text-success-foreground" : scan.recommendation === "Pass" ? "bg-gradient-danger text-danger-foreground" : "bg-gradient-warning text-warning-foreground";

  return (
    <MobileShell>
      <button onClick={() => navigate({ to: "/" })} className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-3"><ArrowLeft className="h-4 w-4" />Back</button>

      {/* Hero result */}
      <div className="rounded-3xl overflow-hidden shadow-elevated bg-card">
        {scan.image_url && <img src={scan.image_url} alt={scan.item_name} className="w-full max-h-72 object-cover" />}
        <div className="p-5">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{scan.category}{scan.brand ? ` · ${scan.brand}` : ""}</p>
          <h1 className="text-2xl font-extrabold mt-1">{scan.item_name}</h1>

          <div className="mt-4 flex flex-wrap gap-2 items-center">
            <DemandBadge level={scan.demand} size="lg" />
            <span className={`inline-flex items-center font-bold rounded-full px-4 py-2 text-sm ${recColor}`}>
              {scan.recommendation}
            </span>
            {scan.underpriced_alert && (
              <span className="inline-flex items-center gap-1 text-xs font-bold rounded-full px-3 py-1 bg-warning text-warning-foreground"><Zap className="h-3 w-3" />Underpriced</span>
            )}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <Stat icon={<DollarSign className="h-4 w-4" />} label="Resale range" value={`${formatMoney(scan.price_low, scan.currency)} – ${formatMoney(scan.price_high, scan.currency)}`} />
            <Stat icon={<Sparkles className="h-4 w-4" />} label="Net profit" value={formatMoney(scan.est_profit, scan.currency)} highlight />
            <Stat icon={<Clock className="h-4 w-4" />} label="Time to sell" value={scan.time_to_sell ?? "—"} />
            <Stat icon={<ShieldAlert className="h-4 w-4" />} label="Scam risk" value={scan.scam_risk ?? "—"} />
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            {scan.explanation}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">Confidence: {Math.round((scan.confidence ?? 0) * 100)}%</p>
        </div>
      </div>

      {/* Marketplace recs */}
      <Card className="mt-5 p-4">
        <h3 className="font-bold flex items-center gap-2 mb-3"><Store className="h-4 w-4 text-primary" />Where to sell</h3>
        <div className="space-y-2 text-sm">
          <Row label="Best overall" value={scan.recommended_marketplace} bold />
          <Row label="Fastest sale" value={scan.best_for_fast_sale} />
          <Row label="Highest price" value={scan.best_for_highest_price} />
          <Row label="Est. fees" value={formatMoney(scan.est_fees, scan.currency)} />
        </div>
      </Card>

      {/* Notes */}
      <Card className="mt-4 p-4">
        <h3 className="font-bold mb-2">Notes</h3>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add notes about this item…" rows={3} />
        <Button variant="outline" size="sm" className="mt-2" onClick={() => update({ notes }).then(() => toast.success("Saved"))}>Save notes</Button>
      </Card>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2 mt-5">
        <Button variant={scan.saved ? "default" : "outline"} onClick={() => update({ saved: !scan.saved })}>
          {scan.saved ? <BookmarkCheck className="h-4 w-4 mr-1.5" /> : <Bookmark className="h-4 w-4 mr-1.5" />}
          {scan.saved ? "Saved" : "Save"}
        </Button>
        <Button variant={scan.watchlisted ? "default" : "outline"} onClick={() => update({ watchlisted: !scan.watchlisted })}>
          Watchlist
        </Button>
        <Button variant="outline" asChild><Link to="/compare"><GitCompare className="h-4 w-4 mr-1.5" />Compare</Link></Button>
        <Button variant="outline" onClick={share}><Share2 className="h-4 w-4 mr-1.5" />Share</Button>
        <Button className="col-span-2 bg-gradient-success text-success-foreground" onClick={markSold} disabled={scan.sold}>
          <CheckCircle2 className="h-4 w-4 mr-1.5" />
          {scan.sold ? `Sold for ${formatMoney(scan.sold_price, scan.currency)}` : "Mark as sold"}
        </Button>
      </div>
    </MobileShell>
  );
}

function Stat({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl p-3 ${highlight ? "bg-gradient-success text-success-foreground shadow-glow" : "bg-secondary text-secondary-foreground"}`}>
      <div className="flex items-center gap-1 text-xs opacity-80">{icon}{label}</div>
      <div className="font-extrabold text-lg mt-0.5 leading-tight">{value}</div>
    </div>
  );
}
function Row({ label, value, bold }: { label: string; value: string | null; bold?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className={bold ? "font-bold text-foreground" : "text-foreground"}>{value ?? "—"}</span>
    </div>
  );
}
