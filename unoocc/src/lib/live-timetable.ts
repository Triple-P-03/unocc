import type { RoomState, Window } from "./availability";
import { toMin } from "./time";

export interface LiveRoom {
  roomId: string;
  freeUntil: number | null;
  freeMinutes: number;
}

export interface LiveNowSnapshot {
  status: "OK" | "CLOSED";
  asOf: string;
  dateISO: string;
  day: string;
  disclaimer: string;
  rooms: LiveRoom[];
  nextFree: string | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseFreeUntil(value: unknown): number | null | undefined {
  if (value === null || value === "END_OF_DAY") return null;
  if (typeof value !== "string" || !/^\d{1,2}:\d{2}$/.test(value)) return undefined;
  return toMin(value);
}

export function parseLiveNow(payload: unknown): LiveNowSnapshot | null {
  if (!isRecord(payload)) return null;

  const status = payload.status === "CLOSED" ? "CLOSED" : payload.status === "OK" ? "OK" : null;
  const asOf = typeof payload.as_of === "string" ? payload.as_of : "";
  if (!status || !/^\d{4}-\d{2}-\d{2}/.test(asOf)) return null;

  const rooms = Array.isArray(payload.rooms)
    ? payload.rooms.flatMap((entry) => {
        if (!isRecord(entry) || typeof entry.room !== "string") return [];
        const freeUntil = parseFreeUntil(entry.free_until);
        if (freeUntil === undefined) return [];
        const freeMinutes =
          typeof entry.free_minutes === "number" && Number.isFinite(entry.free_minutes)
            ? entry.free_minutes
            : 0;
        return [{ roomId: entry.room, freeUntil, freeMinutes }];
      })
    : [];

  return {
    status,
    asOf,
    dateISO: asOf.slice(0, 10),
    day: typeof payload.day === "string" ? payload.day : "",
    disclaimer: typeof payload.disclaimer === "string" ? payload.disclaimer : "",
    rooms,
    nextFree: typeof payload.next_free === "string" ? payload.next_free : null,
  };
}

/** Overlay the n8n current-status snapshot onto the timetable-derived room state. */
export function applyLiveNowState(
  state: RoomState,
  snapshot: LiveNowSnapshot,
  win: Window,
): RoomState {
  if (snapshot.dateISO !== win.dateISO || !state.room.inService) return state;

  if (snapshot.status === "CLOSED") {
    return {
      ...state,
      status: "offline",
      current: undefined,
      freeUntil: null,
      busyUntil: null,
      justFreed: false,
    };
  }

  const liveRoom = snapshot.rooms.find(
    (room) => room.roomId.toLowerCase() === state.room.id.toLowerCase(),
  );
  if (!liveRoom) {
    return {
      ...state,
      status: "busy",
      current: state.status === "busy" ? state.current : undefined,
      freeUntil: null,
      busyUntil: state.status === "busy" ? state.busyUntil : null,
      justFreed: false,
    };
  }

  return {
    ...state,
    status: state.room.verified ? "free" : "unverified",
    current: undefined,
    freeUntil: liveRoom.freeUntil,
    busyUntil: null,
  };
}
