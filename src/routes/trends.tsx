import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { DemandBadge } from "@/components/DemandBadge";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp } from "lucide-react";

export const Route = createFileRoute("/trends")({
  head: () => ({ meta: [{ title: "Trends — Score Flipp" }, { name: "description", content: "Hot resale categories right now." }] }),
  component: TrendsPage,
});

function TrendsPage() {
  const [trends, setTrends] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("category_trends").select("*").order("trend_score", { ascending: false })
      .then(({ data }) => setTrends(data ?? []));
  }, []);
  return (
    <MobileShell>
      <h1 className="text-2xl font-extrabold mb-1 flex items-center gap-2"><TrendingUp className="h-6 w-6 text-primary" />Hot categories</h1>
      <p className="text-sm text-muted-foreground mb-4">What's flipping fast right now.</p>
      <div className="space-y-2">
        {trends.map((t) => (
          <Card key={t.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold">{t.category}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t.hot_items}</p>
              </div>
              <div className="text-right">
                <DemandBadge level={t.demand} size="sm" />
                <p className="text-[10px] text-muted-foreground mt-1">Score {t.trend_score}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </MobileShell>
  );
}
