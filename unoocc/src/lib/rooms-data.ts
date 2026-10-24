/**
 * Pilot room list and timetable for the Digital Tower (floors 4–6).
 * This is sample data shaped like the Schedule_Data / Room_Master sheets;
 * replace it with the verified official timetable before going live.
 */

export type RoomType = "Classroom" | "Lab" | "Seminar Hall";
export const ROOM_TYPES: RoomType[] = ["Classroom", "Lab", "Seminar Hall"];

export interface Room {
  id: string;
  name?: string | undefined;
  building: string;
  floor: number;
  type: RoomType;
  capacity: number;
  verified: boolean;
  inService: boolean;
  /** Floor-plan placement: which side of the corridor and relative width. */
  row: "top" | "bottom";
  span: number;
}

export const BUILDING = "Digital Tower";
export const FLOORS = [4, 5, 6];

const r = (
  id: string,
  floor: number,
  type: RoomType,
  capacity: number,
  row: "top" | "bottom",
  extra: Partial<Room> = {},
): Room => ({
  id,
  building: BUILDING,
  floor,
  type,
  capacity,
  verified: true,
  inService: true,
  row,
  span: type === "Seminar Hall" ? 2 : type === "Lab" ? 1.4 : 1,
  ...extra,
});

export const ROOMS: Room[] = [
  // Floor 4
  r("DT-401", 4, "Classroom", 60, "top"),
  r("DT-402", 4, "Classroom", 60, "top"),
  r("DT-403", 4, "Classroom", 72, "top"),
  r("Lab-404", 4, "Lab", 36, "top", { name: "Programming Lab" }),
  r("DT-405", 4, "Classroom", 60, "bottom", { verified: false }),
  r("DT-406", 4, "Seminar Hall", 120, "bottom", { name: "Seminar Hall A" }),
  r("DT-407", 4, "Classroom", 48, "bottom", { inService: false }),
  // Floor 5
  r("DT-501", 5, "Classroom", 60, "top"),
  r("DT-502", 5, "Classroom", 60, "top"),
  r("DT-503", 5, "Classroom", 66, "top"),
  r("DT-504", 5, "Classroom", 60, "top"),
  r("Lab-505", 5, "Lab", 32, "bottom", { name: "Networks Lab" }),
  r("DT-506", 5, "Classroom", 54, "bottom"),
  r("Lab-511", 5, "Lab", 30, "bottom", { name: "AI & ML Lab", verified: false }),
  // Floor 6
  r("DT-601", 6, "Classroom", 60, "top"),
  r("DT-602", 6, "Classroom", 60, "top"),
  r("DT-603", 6, "Classroom", 72, "top"),
  r("DT-604", 6, "Classroom", 60, "top"),
  r("DT-605", 6, "Classroom", 48, "bottom"),
  r("DT-606", 6, "Classroom", 60, "bottom"),
  r("Lab-610", 6, "Lab", 36, "bottom", { name: "IoT Lab" }),
  r("DT-612", 6, "Seminar Hall", 150, "bottom", { name: "Seminar Hall B" }),
];

export const ROOM_BY_ID: Partial<Record<string, Room>> = Object.fromEntries(ROOMS.map((room) => [room.id, room]));
export const floorOf = (id: string) => ROOM_BY_ID[id]?.floor ?? 6;

export interface ScheduleEntry {
  roomId: string;
  /** 0 = Sunday … 6 = Saturday */
  day: number;
  start: string;
  end: string;
  course: string;
  code: string;
  section: string;
  faculty: string;
}

const LECTURES: [string, string][] = [
  ["Data Structures", "CS2101"],
  ["Database Management Systems", "CS2203"],
  ["Operating Systems", "CS2204"],
  ["Computer Networks", "CS3101"],
  ["Theory of Computation", "CS3102"],
  ["Machine Learning", "CS3205"],
  ["Software Engineering", "CS3103"],
  ["Compiler Design", "CS4101"],
  ["Web Technologies", "CS2206"],
  ["Discrete Mathematics", "MA2102"],
  ["Artificial Intelligence", "CS3206"],
  ["Cloud Computing", "CS4103"],
];

const LABS: [string, string][] = [
  ["Data Structures Lab", "CS2151"],
  ["DBMS Lab", "CS2253"],
  ["Computer Networks Lab", "CS3151"],
  ["Machine Learning Lab", "CS3255"],
  ["IoT Systems Lab", "CS4152"],
  ["Web Technologies Lab", "CS2256"],
];

const EVENTS: [string, string][] = [
  ["Department Seminar", "SEM"],
  ["Guest Lecture", "GL"],
  ["Project Review", "PR"],
];

const SECTIONS = ["III-A", "III-B", "III-C", "V-A", "V-B", "V-C", "VII-A", "VII-B"];
const FACULTY = [
  "Prof. A. Kulkarni",
  "Dr. R. Deshpande",
  "Prof. S. Bhoyar",
  "Dr. M. Thakre",
  "Prof. P. Wankhede",
  "Dr. K. Raut",
  "Prof. N. Joshi",
  "Dr. V. Gawande",
  "Prof. T. Meshram",
  "Dr. H. Pande",
];

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const hh = (h: number) => `${String(h).padStart(2, "0")}:00`;

function generateSchedule(): ScheduleEntry[] {
  const out: ScheduleEntry[] = [];
  ROOMS.forEach((room, idx) => {
    for (let day = 1; day <= 6; day++) {
      const rand = mulberry32(idx * 97 + day * 13 + 7);
      const lastHour = day === 6 ? 13 : 18;
      const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)] as T;
      let h = 9;
      while (h < lastHour) {
        const roll = rand();
        if (h === 13 && rand() < 0.8) {
          h += 1; // lunch break
          continue;
        }
        if (room.type === "Lab") {
          if (roll < 0.36 && h + 2 <= lastHour) {
            const [course, code] = pick(LABS);
            out.push({ roomId: room.id, day, start: hh(h), end: hh(h + 2), course, code, section: pick(SECTIONS), faculty: pick(FACULTY) });
            h += 2;
            continue;
          }
        } else if (room.type === "Seminar Hall") {
          if (roll < 0.22 && h + 2 <= lastHour) {
            const [course, code] = pick(EVENTS);
            out.push({ roomId: room.id, day, start: hh(h), end: hh(h + 2), course, code, section: "All", faculty: pick(FACULTY) });
            h += 2;
            continue;
          }
        } else {
          const threshold = room.verified ? 0.46 : 0.3;
          if (roll < threshold) {
            const [course, code] = pick(LECTURES);
            out.push({ roomId: room.id, day, start: hh(h), end: hh(h + 1), course, code, section: pick(SECTIONS), faculty: pick(FACULTY) });
          }
        }
        h += 1;
      }
    }
  });
  return out;
}

export const SCHEDULE: ScheduleEntry[] = generateSchedule();
