import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useNow } from "@/hooks/use-now";
import { cn } from "@/lib/utils";

function ago(ms: number) {
  const s = Math.max(0, Math.round(ms / 1000));
  if (s < 5) return "just now";
  if (s < 60) return `${s} seconds ago`;
  const m = Math.floor(s / 60);
  return `${m} minute${m === 1 ? "" : "s"} ago`;
}

export function useAgo(updatedAt: number | null) {
  const [, force] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => force((n) => n + 1), 5000);
    return () => window.clearInterval(id);
  }, []);
  return updatedAt ? ago(Date.now() - updatedAt) : "…";
}

export function LiveIndicator({ className, showButton = true, light }: { className?: string; showButton?: boolean; light?: boolean }) {
  const { updatedAt, refresh, refreshing } = useNow();
  const label = useAgo(updatedAt);
  return (
    <div className={cn("inline-flex items-center gap-2 text-xs", light ? "text-hero-muted" : "text-muted-foreground", className)}>
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full rounded-full bg-free animate-status-ping" />
        <span className="relative inline-flex size-2 rounded-full bg-free" />
      </span>
      <span>Updated {label}</span>
      {showButton && (
        <button
          type="button"
          onClick={refresh}
          disabled={refreshing}
          className={cn(
            "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-medium transition-colors",
            light ? "hover:bg-hero-foreground/10 hover:text-hero-foreground" : "hover:bg-muted hover:text-foreground",
          )}
          aria-label="Refresh room status"
        >
          <RefreshCw className={cn("size-3", refreshing && "animate-spin")} />
          {refreshing ? "Checking…" : "Refresh"}
        </button>
      )}
    </div>
  );
}
