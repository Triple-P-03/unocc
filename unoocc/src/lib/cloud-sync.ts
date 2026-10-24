/**
 * Cloud database persistence for shared data: faculty updates and contact messages.
 * Faculty updates are loaded into the local store and kept live via realtime.
 */
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { FacultyUpdate, UpdateReason } from "./availability";
import { setState } from "./store";
import type { ContactMessage } from "./store";

type Row = Database["public"]["Tables"]["faculty_updates"]["Row"];

function toUpdate(r: Row): FacultyUpdate {
  return {
    id: r.id,
    name: r.name,
    facultyId: r.faculty_id,
    roomId: r.room_id,
    date: r.date,
    start: r.start_time,
    end: r.end_time,
    reason: r.reason as UpdateReason,
    notes: r.notes ?? undefined,
    createdAt: r.created_at,
    status: r.status === "pending" ? "pending" : "live",
  };
}

export async function loadUpdates() {
  const { data, error } = await supabase
    .from("faculty_updates")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw error;
  setState({ updates: (data ?? []).map(toUpdate) });
}

/** Starts realtime sync; returns a cleanup function. Call from useEffect. */
export function startUpdatesSync() {
  loadUpdates().catch((e) => console.error("Could not load faculty updates", e));
  const channel = supabase
    .channel(`faculty-updates-${Math.random().toString(36).slice(2)}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "faculty_updates" }, () => {
      loadUpdates().catch(() => {});
    })
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}

export async function submitUpdate(u: Omit<FacultyUpdate, "id" | "createdAt">): Promise<FacultyUpdate> {
  const { data, error } = await supabase
    .from("faculty_updates")
    .insert({
      name: u.name,
      faculty_id: u.facultyId,
      room_id: u.roomId,
      date: u.date,
      start_time: u.start,
      end_time: u.end,
      reason: u.reason,
      notes: u.notes ?? null,
      status: u.status,
    })
    .select()
    .single();
  if (error) throw error;
  const saved = toUpdate(data);
  setState((s) => ({ updates: [saved, ...s.updates.filter((x) => x.id !== saved.id)] }));
  return saved;
}

export async function submitMessage(m: Omit<ContactMessage, "id" | "createdAt">) {
  const { error } = await supabase.from("contact_messages").insert({
    name: m.name,
    email: m.email,
    role: m.role,
    topic: m.topic,
    room_id: m.roomId || null,
    issue: m.issue || null,
    message: m.message,
  });
  if (error) throw error;
}
