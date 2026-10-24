import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { parseLiveNow, type LiveNowSnapshot } from "@/lib/live-timetable";
import { nowInKolkata, type Now } from "@/lib/time";

interface NowContextValue {
  now: Now | null;
  updatedAt: number | null;
  refreshing: boolean;
  liveNow: LiveNowSnapshot | null;
  refresh: () => void;
}

const NowContext = createContext<NowContextValue>({
  now: null,
  updatedAt: null,
  refreshing: false,
  liveNow: null,
  refresh: () => {},
});

/** Shares the current Asia/Kolkata time; re-checks every 60 seconds. */
export function NowProvider({ children }: { children: ReactNode }) {
  const [now, setNow] = useState<Now | null>(null);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [liveNow, setLiveNow] = useState<LiveNowSnapshot | null>(null);

  const tick = useCallback(() => {
    setNow(nowInKolkata());
    setUpdatedAt(Date.now());
  }, []);

  const refreshLive = useCallback(async () => {
    try {
      const response = await fetch("/api/timetable", { headers: { accept: "application/json" } });
      if (!response.ok) throw new Error(`Live status request failed: ${response.status}`);
      const snapshot = parseLiveNow((await response.json()) as unknown);
      if (!snapshot) throw new Error("Live status response was invalid");
      setLiveNow(snapshot);
    } catch {
      setLiveNow(null);
    }
  }, []);

  useEffect(() => {
    tick();
    void refreshLive();
    const id = window.setInterval(() => {
      tick();
      void refreshLive();
    }, 60_000);
    return () => window.clearInterval(id);
  }, [refreshLive, tick]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    void Promise.all([
      refreshLive(),
      new Promise<void>((resolve) => window.setTimeout(resolve, 650)),
    ]).then(() => {
      tick();
      setRefreshing(false);
    });
  }, [refreshLive, tick]);

  const value = useMemo(
    () => ({ now, updatedAt, refreshing, liveNow, refresh }),
    [now, updatedAt, refreshing, liveNow, refresh],
  );
  return <NowContext.Provider value={value}>{children}</NowContext.Provider>;
}

export const useNow = () => useContext(NowContext);
