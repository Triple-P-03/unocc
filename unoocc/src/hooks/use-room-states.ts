import { useMemo } from "react";
import { applyLiveNowState } from "@/lib/live-timetable";
import { roomState, type RoomState, type Window } from "@/lib/availability";
import { ROOMS, SCHEDULE, type Room } from "@/lib/rooms-data";
import { defaultStart } from "@/lib/time";
import { useStore } from "@/lib/store";
import { useNow } from "./use-now";

export function useRoomStates(win: Window | null, rooms: Room[] = ROOMS): RoomState[] {
  const updates = useStore((s) => s.updates);
  const { now, liveNow } = useNow();

  return useMemo(() => {
    if (!win) return [];

    const states = rooms.map((r) => roomState(r, win, SCHEDULE, updates));
    const isCurrentWindow =
      !!now &&
      !!liveNow &&
      liveNow.dateISO === win.dateISO &&
      (win.from === defaultStart(now.minutes) || (win.from <= now.minutes && now.minutes < win.to));

    return isCurrentWindow ? states.map((state) => applyLiveNowState(state, liveNow, win)) : states;
  }, [
    win?.dateISO,
    win?.weekday,
    win?.from,
    win?.to,
    rooms,
    updates,
    now?.dateISO,
    now?.minutes,
    liveNow,
  ]); // eslint-disable-line react-hooks/exhaustive-deps
}
