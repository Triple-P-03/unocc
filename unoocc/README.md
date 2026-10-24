# UNOOCC — Smart Classroom & Lab Availability Tracker

Ramdeobaba University · Idea Lab, Group 40

Find free classrooms and labs in the Digital Tower in real time: live room status, floor map, faculty room updates and a room assistant.

## Run locally

```bash
npm install      # or: bun install
npm run dev      # opens on http://localhost:5173
```

On Windows PowerShell, run:

```powershell
cd "D:\5th sem\unoocc-full-source\unoocc"
npm install
npm run dev
```

Then open http://localhost:5173. The live n8n webhook is configured through
`LIVE_TIMETABLE_URL` and is available through the server-side `/api/timetable`
proxy.

Build for production: `npm run build`

## Tech

React 19 · TanStack Start · Vite · Tailwind CSS · Supabase (database for faculty updates and contact messages)

## Configuration

Database keys live in `.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`). Database tables are defined in `supabase/` migrations.

The live n8n `free-now` snapshot is proxied server-side at `/api/timetable`. The current-window room cards and assistant use the returned room list; other dates and times continue to use the local timetable data.

## Data

Sample room list and timetable: `src/lib/rooms-data.ts`. Availability rules: `src/lib/availability.ts`.
