import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { DemandBadge } from "@/components/DemandBadge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatMoney } from "@/lib/scoreflipp";
import { Download, ScanLine } from "lucide-react";

export const Route = createFileRoute("/saved")({
  head: () => ({ meta: [{ title: "Saved — Score Flipp" }, { name: "description", content: "Your saved scans, ready to flip." }] }),
  component: SavedPage,
});

function SavedPage() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("scans").select("*").eq("saved", true).order("created_at", { ascending: false })
      .then(({ data }) => setItems(data ?? []));
  }, []);

  function exportCsv() {
    const cols = ["item_name","category","demand","price_low","price_high","est_profit","recommended_marketplace","sold","sold_price","currency","created_at"];
    const csv = [cols.join(",")].concat(
      items.map((r) => cols.map((c) => JSON.stringify(r[c] ?? "")).join(","))
    ).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "scoreflipp-saved.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <MobileShell>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-extrabold">Saved items</h1>
        <Button size="sm" variant="outline" onClick={exportCsv} disabled={items.length === 0}><Download className="h-4 w-4 mr-1" />CSV</Button>
      </div>
      {items.length === 0 ? (
        <Card className="p-6 text-center border-dashed">
          <ScanLine className="h-8 w-8 mx-auto text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">No saved items yet.</p>
          <Button asChild className="mt-3"><Link to="/scan">Scan something</Link></Button>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((s) => (
            <Link key={s.id} to="/result/$id" params={{ id: s.id }} className="block">
              <Card className="p-3 flex items-center gap-3">
                {s.image_url ? <img src={s.image_url} className="h-14 w-14 rounded-xl object-cover" /> : <div className="h-14 w-14 rounded-xl bg-muted" />}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{s.item_name}</p>
                  <p className="text-xs text-muted-foreground">{formatMoney(s.est_profit, s.currency)} profit · {s.recommended_marketplace}</p>
                </div>
                <DemandBadge level={s.demand} size="sm" />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </MobileShell>
  );
}
