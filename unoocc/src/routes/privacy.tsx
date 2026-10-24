import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy — UNOOCC" },
      { name: "description", content: "How UNOOCC handles data: no cameras, no sensors, no student tracking." },
      { property: "og:title", content: "Privacy — UNOOCC" },
      { property: "og:description", content: "UNOOCC is timetable-based and stores no personal data from students." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <>
      <PageHeader eyebrow="Legal" title="Privacy" />
      <div className="mx-auto max-w-3xl space-y-5 px-4 py-12 text-muted-foreground sm:px-6">
        <p>UNOOCC works out room availability from the official timetable, faculty updates and the current time. It uses no cameras, WiFi tracking or occupancy sensors.</p>
        <p>We store no personal data from students. Faculty updates record the name and faculty ID of the person posting them, so every change can be traced.</p>
        <p>Your favourite rooms and display preferences are saved only in your own browser.</p>
      </div>
    </>
  ),
});
