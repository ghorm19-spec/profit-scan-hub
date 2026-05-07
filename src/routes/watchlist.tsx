import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { DemandBadge } from "@/components/DemandBadge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatMoney } from "@/lib/scoreflipp";
import { Eye } from "lucide-react";

export const Route = createFileRoute("/watchlist")({
  head: () => ({ meta: [{ title: "Watchlist — Score Flipp" }, { name: "description", content: "Items you're watching for the right resale moment." }] }),
  component: WatchPage,
});

function WatchPage() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("scans").select("*").eq("watchlisted", true).order("created_at", { ascending: false })
      .then(({ data }) => setItems(data ?? []));
  }, []);
  return (
    <MobileShell>
      <h1 className="text-2xl font-extrabold mb-4">Watchlist</h1>
      {items.length === 0 ? (
        <Card className="p-6 text-center border-dashed">
          <Eye className="h-8 w-8 mx-auto text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">Nothing on your watchlist.</p>
          <Button asChild className="mt-3"><Link to="/scan">Scan an item</Link></Button>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((s) => (
            <Link key={s.id} to="/result/$id" params={{ id: s.id }} className="block">
              <Card className="p-3 flex items-center gap-3">
                {s.image_url ? <img src={s.image_url} className="h-14 w-14 rounded-xl object-cover" /> : <div className="h-14 w-14 rounded-xl bg-muted" />}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{s.item_name}</p>
                  <p className="text-xs text-muted-foreground">{formatMoney(s.price_low, s.currency)} – {formatMoney(s.price_high, s.currency)}</p>
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
