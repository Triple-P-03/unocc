import { useMemo } from "react";
import { roomState, type RoomState, type Window } from "@/lib/availability";
import { ROOMS, SCHEDULE, type Room } from "@/lib/rooms-data";
import { useStore } from "@/lib/store";

export function useRoomStates(win: Window | null, rooms: Room[] = ROOMS): RoomState[] {
  const updates = useStore((s) => s.updates);
  return useMemo(
    () => (win ? rooms.map((r) => roomState(r, win, SCHEDULE, updates)) : []),
    [win?.dateISO, win?.weekday, win?.from, win?.to, rooms, updates], // eslint-disable-line react-hooks/exhaustive-deps
  );
}
