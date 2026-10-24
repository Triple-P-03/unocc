import { createFileRoute } from "@tanstack/react-router";

const jsonHeaders = { "content-type": "application/json; charset=utf-8" };

export const Route = createFileRoute("/api/timetable")({
  server: {
    handlers: {
      GET: async () => {
        const sourceUrl = process.env["LIVE_TIMETABLE_URL"];

        if (!sourceUrl) {
          return Response.json(
            { error: "Live timetable source is not configured." },
            { status: 503, headers: jsonHeaders },
          );
        }

        let response: Response;
        try {
          response = await fetch(sourceUrl, {
            headers: { accept: "application/json" },
          });
        } catch {
          return Response.json(
            { error: "Could not reach the live timetable source." },
            { status: 502, headers: jsonHeaders },
          );
        }

        if (!response.ok) {
          return Response.json(
            {
              error: "The live timetable source returned an error.",
              upstreamStatus: response.status,
            },
            { status: 502, headers: jsonHeaders },
          );
        }

        const contentType = response.headers.get("content-type") ?? "";
        if (!contentType.toLowerCase().includes("application/json")) {
          return Response.json(
            { error: "The live timetable source must return JSON." },
            { status: 502, headers: jsonHeaders },
          );
        }

        const body = await response.text();
        try {
          return Response.json(JSON.parse(body) as unknown, { headers: jsonHeaders });
        } catch {
          return Response.json(
            { error: "The live timetable source returned invalid JSON." },
            { status: 502, headers: jsonHeaders },
          );
        }
      },
    },
  },
});
