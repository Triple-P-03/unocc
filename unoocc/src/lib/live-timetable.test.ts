import { describe, expect, it } from "vitest";
import { applyLiveNowState, parseLiveNow } from "./live-timetable";
import { roomState } from "./availability";
import { ROOMS, SCHEDULE } from "./rooms-data";

describe("live n8n timetable snapshot", () => {
  const payload = {
    status: "OK",
    as_of: "2026-10-24T09:15:38+05:30",
    day: "Saturday",
    disclaimer: "Based on the recorded timetable.",
    rooms: [
      { room: "DT-503", floor: 5, type: "Classroom", free_until: "END_OF_DAY", free_minutes: 525 },
      { room: "DT-505", floor: 5, type: "Classroom/Lab", free_until: "10:00", free_minutes: 45 },
    ],
    next_free: null,
  };

  it("parses the webhook room list and end-of-day values", () => {
    const snapshot = parseLiveNow(payload);

    expect(snapshot).not.toBeNull();
    expect(snapshot?.dateISO).toBe("2026-10-24");
    expect(snapshot?.rooms).toEqual([
      { roomId: "DT-503", freeUntil: null, freeMinutes: 525 },
      { roomId: "DT-505", freeUntil: 600, freeMinutes: 45 },
    ]);
  });

  it("overlays a live free room onto the app state", () => {
    const snapshot = parseLiveNow(payload);
    const room = ROOMS.find((entry) => entry.id === "DT-503");
    if (!snapshot || !room) throw new Error("test fixture room missing");

    const win = { dateISO: "2026-10-24", weekday: 6, from: 555, to: 615 };
    const state = roomState(room, win, SCHEDULE, []);
    const liveState = applyLiveNowState(state, snapshot, win);

    expect(liveState.status).toBe("free");
    expect(liveState.freeUntil).toBeNull();
  });

  it("marks every in-service room offline when n8n reports closed", () => {
    const snapshot = parseLiveNow({ ...payload, status: "CLOSED", rooms: [] });
    const room = ROOMS.find((entry) => entry.id === "DT-503");
    if (!snapshot || !room) throw new Error("test fixture room missing");

    const win = { dateISO: "2026-10-24", weekday: 6, from: 555, to: 615 };
    const state = roomState(room, win, SCHEDULE, []);

    expect(applyLiveNowState(state, snapshot, win).status).toBe("offline");
  });
});
