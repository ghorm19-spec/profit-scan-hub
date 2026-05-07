import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Camera, ImagePlus, Loader2, Sparkles, ArrowLeft } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useSession } from "@/hooks/use-session";
import { supabase } from "@/integrations/supabase/client";
import { analyzeItem } from "@/scan.functions";
import { detectRegion } from "@/lib/scoreflipp";
import { getMonthlyUsage, isProUser, FREE_SCAN_LIMIT } from "@/lib/paywall";
import { toast } from "sonner";

export const Route = createFileRoute("/scan")({
  head: () => ({ meta: [{ title: "Scan — Score Flipp" }, { name: "description", content: "Snap a photo to instantly estimate resale value." }] }),
  component: ScanPage,
});

function ScanPage() {
  const navigate = useNavigate();
  const { user } = useSession();
  const fileRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [hint, setHint] = useState("");
  const [cost, setCost] = useState("");
  const [busy, setBusy] = useState(false);

  function handleFile(f: File | null) {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result));
    reader.readAsDataURL(f);
  }

  async function run() {
    if (!user) return navigate({ to: "/auth" });
    if (!preview && !hint) {
      toast.error("Add a photo or a quick description");
      return;
    }
    setBusy(true);
    try {
      if (!isProUser()) {
        const usage = await getMonthlyUsage(user.id);
        if (usage.capped) {
          toast.error(`You've used all ${FREE_SCAN_LIMIT} free scans this month. Upgrade to Pro for unlimited scans.`);
          setBusy(false);
          return;
        }
      }
      const { region, currency } = detectRegion();
      const result = await analyzeItem({
        data: {
          imageDataUrl: preview ?? undefined,
          hint: hint || undefined,
          region, currency,
          userCost: cost ? Number(cost) : undefined,
        },
      });

      let imageUrl: string | null = null;
      if (preview) {
        const blob = await (await fetch(preview)).blob();
        const path = `${user.id}/${crypto.randomUUID()}.jpg`;
        const { error: upErr } = await supabase.storage.from("scans").upload(path, blob, { contentType: blob.type || "image/jpeg" });
        if (!upErr) {
          const { data } = supabase.storage.from("scans").getPublicUrl(path);
          imageUrl = data.publicUrl;
        }
      }

      const { data: inserted, error } = await supabase.from("scans").insert({
        user_id: user.id,
        image_url: imageUrl,
        item_name: result.item_name,
        category: result.category,
        brand: result.brand,
        condition_note: result.condition_note,
        demand: result.demand,
        price_low: result.price_low,
        price_high: result.price_high,
        est_fees: result.est_fees,
        est_profit: result.est_profit,
        recommended_marketplace: result.recommended_marketplace,
        best_for_fast_sale: result.best_for_fast_sale,
        best_for_highest_price: result.best_for_highest_price,
        confidence: result.confidence,
        time_to_sell: result.time_to_sell,
        recommendation: result.recommendation,
        scam_risk: result.scam_risk,
        underpriced_alert: result.underpriced_alert,
        explanation: result.explanation,
        currency, region,
        user_cost: cost ? Number(cost) : null,
      }).select("id").single();
      if (error) throw error;
      navigate({ to: "/result/$id", params: { id: inserted.id } });
    } catch (e: any) {
      toast.error(e?.message ?? "Scan failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <MobileShell>
      <button onClick={() => navigate({ to: "/" })} className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-3"><ArrowLeft className="h-4 w-4" />Back</button>
      <h1 className="text-2xl font-extrabold">Scan an item</h1>
      <p className="text-sm text-muted-foreground">Snap or upload. We'll estimate price, profit, and where to sell.</p>

      <Card className="mt-5 p-4">
        {preview ? (
          <div className="relative">
            <img src={preview} alt="preview" className="w-full rounded-2xl object-cover max-h-72" />
            <button onClick={() => setPreview(null)} className="absolute top-2 right-2 bg-background/90 rounded-full px-3 py-1 text-xs font-medium">Remove</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => camRef.current?.click()} className="aspect-square rounded-2xl bg-gradient-hero text-primary-foreground flex flex-col items-center justify-center gap-2 shadow-elevated">
              <Camera className="h-8 w-8" />
              <span className="font-semibold">Camera</span>
            </button>
            <button onClick={() => fileRef.current?.click()} className="aspect-square rounded-2xl bg-secondary text-secondary-foreground flex flex-col items-center justify-center gap-2">
              <ImagePlus className="h-8 w-8" />
              <span className="font-semibold">Upload</span>
            </button>
          </div>
        )}
        <input ref={camRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />

        <div className="mt-4 space-y-3">
          <div>
            <Label htmlFor="hint">What is it? (optional)</Label>
            <Input id="hint" placeholder="e.g. Nike Dunk Low Panda, size 10" value={hint} onChange={(e) => setHint(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="cost">Your cost / asking price (optional)</Label>
            <Input id="cost" type="number" inputMode="decimal" placeholder="e.g. 30" value={cost} onChange={(e) => setCost(e.target.value)} />
          </div>
        </div>
      </Card>

      <Button onClick={run} disabled={busy} className="mt-5 w-full h-14 text-base bg-gradient-primary text-primary-foreground shadow-glow">
        {busy ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Analyzing…</> : <><Sparkles className="h-5 w-5 mr-2" />Score this item</>}
      </Button>
    </MobileShell>
  );
}
