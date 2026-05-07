import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Camera, ScanLine, Sparkles, TrendingUp, ArrowRight, Bookmark } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { DemandBadge } from "@/components/DemandBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSession } from "@/hooks/use-session";
import { supabase } from "@/integrations/supabase/client";
import { formatMoney } from "@/lib/scoreflipp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Score Flipp — Scan items, see resale profit instantly" },
      { name: "description", content: "One scan answers it all: what it's worth, where to sell, and how much you'll make." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { user, loading } = useSession();
  const navigate = useNavigate();
  const [recent, setRecent] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from("scans").select("*").order("created_at", { ascending: false }).limit(5)
      .then(({ data }) => setRecent(data ?? []));
    supabase.from("category_trends").select("*").order("trend_score", { ascending: false }).limit(4)
      .then(({ data }) => setTrends(data ?? []));
  }, [user]);

  if (loading || !user) return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;

  return (
    <MobileShell>
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Score Flipp</h1>
          <p className="text-sm text-muted-foreground">Scan. Flip. Profit.</p>
        </div>
        <Sparkles className="h-6 w-6 text-primary" />
      </header>

      {/* Hero scan CTA */}
      <Link to="/scan" className="block">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-6 shadow-elevated text-primary-foreground">
          <div className="relative z-10">
            <p className="text-sm/relaxed opacity-90 font-medium">Tap to start</p>
            <h2 className="text-3xl font-extrabold mt-1">Scan an item</h2>
            <p className="mt-2 text-sm opacity-90 max-w-[18rem]">Find out instantly if it's worth flipping — and where to sell it.</p>
            <div className="mt-5 inline-flex items-center gap-2 bg-background/15 backdrop-blur px-4 py-2 rounded-full text-sm font-semibold">
              <Camera className="h-4 w-4" /> Take photo or upload
            </div>
          </div>
          <ScanLine className="absolute -right-6 -bottom-6 h-44 w-44 opacity-20" />
        </div>
      </Link>

      {/* Recent scans */}
      <section className="mt-8">
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="font-bold text-lg">Recent scans</h3>
          <Link to="/saved" className="text-sm text-primary font-medium inline-flex items-center gap-1">
            <Bookmark className="h-3.5 w-3.5" /> Saved
          </Link>
        </div>
        {recent.length === 0 ? (
          <Card className="p-5 text-sm text-muted-foreground border-dashed">
            No scans yet. Tap the big button above to start.
          </Card>
        ) : (
          <div className="space-y-2">
            {recent.map((s) => (
              <Link key={s.id} to="/result/$id" params={{ id: s.id }} className="block">
                <Card className="p-3 flex items-center gap-3 hover:shadow-soft transition-shadow">
                  {s.image_url ? (
                    <img src={s.image_url} alt={s.item_name ?? "scan"} className="h-14 w-14 rounded-xl object-cover" />
                  ) : (
                    <div className="h-14 w-14 rounded-xl bg-muted grid place-items-center text-muted-foreground"><ScanLine className="h-5 w-5" /></div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{s.item_name ?? "Unknown item"}</p>
                    <p className="text-xs text-muted-foreground truncate">{s.category ?? "—"} · est. profit {formatMoney(s.est_profit, s.currency ?? "USD")}</p>
                  </div>
                  <DemandBadge level={s.demand} size="sm" />
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Trending */}
      <section className="mt-8">
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="font-bold text-lg flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" />Hot categories</h3>
          <Link to="/trends" className="text-sm text-primary font-medium inline-flex items-center gap-1">All <ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {trends.map((t) => (
            <Card key={t.id} className="p-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-sm">{t.category}</p>
                <DemandBadge level={t.demand} size="sm" />
              </div>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{t.hot_items}</p>
            </Card>
          ))}
        </div>
      </section>

      <div className="mt-8 flex gap-2">
        <Button asChild variant="outline" className="flex-1"><Link to="/compare">Compare</Link></Button>
        <Button asChild variant="outline" className="flex-1"><Link to="/watchlist">Watchlist</Link></Button>
      </div>
    </MobileShell>
  );
}
