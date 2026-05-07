import { cn } from "@/lib/utils";
import type { DemandLevel } from "@/lib/scoreflipp";

export function DemandBadge({ level, size = "md" }: { level: DemandLevel | string | null; size?: "sm" | "md" | "lg" }) {
  const l = (level ?? "Low") as DemandLevel;
  const styles: Record<DemandLevel, string> = {
    High: "bg-gradient-success text-success-foreground shadow-glow",
    Medium: "bg-gradient-warning text-warning-foreground",
    Low: "bg-muted text-muted-foreground",
  };
  const sizes = {
    sm: "px-2.5 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-5 py-2 text-base",
  };
  return (
    <span className={cn("inline-flex items-center font-bold rounded-full uppercase tracking-wide", styles[l] ?? styles.Low, sizes[size])}>
      {l} demand
    </span>
  );
}
