# UNOOCC — Smart Classroom & Lab Availability Tracker

Ramdeobaba University · Idea Lab, Group 40

Find free classrooms and labs in the Digital Tower in real time: live room status, floor map, faculty room updates and a room assistant.

## Run locally

```bash
npm install      # or: bun install
npm run dev      # opens on http://localhost:8080
```

Build for production: `npm run build`

## Tech

React 19 · TanStack Start · Vite · Tailwind CSS · Supabase (database for faculty updates and contact messages)

## Configuration

Database keys live in `.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`). Database tables are defined in `supabase/` migrations.

The live timetable integration has a server-side proxy at `/api/timetable`. Set `LIVE_TIMETABLE_URL` to the n8n JSON webhook URL; the timetable payload will be normalized into the app's `ScheduleEntry` format once the webhook response shape is provided.

## Data

Sample room list and timetable: `src/lib/rooms-data.ts`. Availability rules: `src/lib/availability.ts`.
