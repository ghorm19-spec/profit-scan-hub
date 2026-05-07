import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { DemandBadge } from "@/components/DemandBadge";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { formatMoney } from "@/lib/scoreflipp";

export const Route = createFileRoute("/compare")({
  head: () => ({ meta: [{ title: "Compare — Score Flipp" }, { name: "description", content: "Compare items side-by-side." }] }),
  component: ComparePage,
});

function ComparePage() {
  const [items, setItems] = useState<any[]>([]);
  const [picked, setPicked] = useState<string[]>([]);
  useEffect(() => {
    supabase.from("scans").select("*").order("created_at", { ascending: false }).limit(20)
      .then(({ data }) => setItems(data ?? []));
  }, []);

  const selected = items.filter((i) => picked.includes(i.id)).slice(0, 3);

  function toggle(id: string) {
    setPicked((p) => p.includes(id) ? p.filter((x) => x !== id) : p.length >= 3 ? p : [...p, id]);
  }

  return (
    <MobileShell>
      <h1 className="text-2xl font-extrabold mb-1">Compare items</h1>
      <p className="text-sm text-muted-foreground mb-4">Pick up to 3 scans.</p>

      {selected.length > 0 && (
        <div className="grid gap-2 mb-5" style={{ gridTemplateColumns: `repeat(${selected.length}, minmax(0,1fr))` }}>
          {selected.map((s) => (
            <Card key={s.id} className="p-3 text-xs">
              {s.image_url && <img src={s.image_url} className="w-full h-20 object-cover rounded-lg mb-2" />}
              <p className="font-bold truncate">{s.item_name}</p>
              <DemandBadge level={s.demand} size="sm" />
              <p className="mt-2"><span className="text-muted-foreground">Profit: </span><b>{formatMoney(s.est_profit, s.currency)}</b></p>
              <p><span className="text-muted-foreground">Range: </span>{formatMoney(s.price_low, s.currency)}–{formatMoney(s.price_high, s.currency)}</p>
              <p><span className="text-muted-foreground">Sell on: </span>{s.recommended_marketplace}</p>
              <p><span className="text-muted-foreground">Time: </span>{s.time_to_sell}</p>
              <p><span className="text-muted-foreground">Rec: </span><b>{s.recommendation}</b></p>
            </Card>
          ))}
        </div>
      )}

      <h3 className="font-bold mb-2">Recent scans</h3>
      <div className="space-y-2">
        {items.map((s) => (
          <Card key={s.id} className="p-3 flex items-center gap-3">
            <Checkbox checked={picked.includes(s.id)} onCheckedChange={() => toggle(s.id)} />
            {s.image_url ? <img src={s.image_url} className="h-12 w-12 rounded-lg object-cover" /> : <div className="h-12 w-12 rounded-lg bg-muted" />}
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate text-sm">{s.item_name}</p>
              <p className="text-xs text-muted-foreground">{formatMoney(s.est_profit, s.currency)}</p>
            </div>
            <DemandBadge level={s.demand} size="sm" />
          </Card>
        ))}
      </div>
    </MobileShell>
  );
}
