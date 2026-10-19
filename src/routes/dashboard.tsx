import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { AppShell, StatusPill } from "@/components/AppShell";
import { opportunities, daysUntil } from "@/lib/mock-data";
import { useAllProgress } from "@/lib/wbs-store";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Bid pipeline — BidDeck" },
      { name: "description", content: "All live RFx responses with deadlines, progress, quality and compliance." },
      { property: "og:title", content: "Bid pipeline — BidDeck" },
      { property: "og:description", content: "All live RFx responses with deadlines, progress, quality and compliance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const progress = useAllProgress();
  const totalReqs = opportunities.reduce((s, o) => s + Object.values(o.compliance).reduce((a, b) => a + b, 0), 0);
  const next = Math.min(...opportunities.map((o) => daysUntil(o.submissionDeadline) ?? 999));
  return (
    <AppShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Monday · 19 Oct 2026</p>
          <h1 className="mt-1 text-3xl font-semibold sm:text-4xl">Good morning, Scott</h1>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { l: "Live bids", v: opportunities.length },
          { l: "Next submission", v: `${next}d` },
          { l: "Requirements tracked", v: totalReqs },
          { l: "Awaiting approval", v: 37 },
        ].map((k) => (
          <div key={k.l} className="surface p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{k.l}</p>
            <p className="mt-1 font-display text-3xl font-semibold">{k.v}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-xl font-semibold">Active responses</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {opportunities.map((o) => {
          const sub = daysUntil(o.submissionDeadline);
          const clar = daysUntil(o.clarificationDeadline);
          const c = o.compliance;
          const tot = c.Full + c.Partial + c.Non + c.Clarify || 1;
          return (
            <Link key={o.id} to="/opportunities/$id" params={{ id: o.id }} className="surface group p-5 transition hover:-translate-y-0.5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex gap-1.5"><StatusPill tone="info">{o.rfxType}</StatusPill><StatusPill tone="neutral">{o.segment}</StatusPill></div>
                  <h3 className="mt-3 text-lg font-semibold leading-snug">{o.name}</h3>
                  <p className="text-sm text-muted-foreground">{o.customer}</p>
                </div>
                <ArrowUpRight className="h-5 w-5 text-muted-foreground transition group-hover:text-primary" />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-muted p-3">
                <div><p className="text-xs text-muted-foreground">Submission</p><p className={`font-display text-xl font-semibold ${sub! <= 14 ? "text-primary" : ""}`}>{sub}d</p></div>
                <div><p className="text-xs text-muted-foreground">Clarifications</p><p className={`font-display text-xl font-semibold ${clar! <= 7 ? "text-primary" : ""}`}>{clar}d</p></div>
              </div>
              <div className="mt-4 space-y-3 text-sm">
                <div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Tasks complete</span><span className="font-mono">{progress[o.id]}%</span></div>
                  <div className="mt-1 h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-signal" style={{ width: `${progress[o.id]}%` }} /></div>
                </div>
                <div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Compliance</span><span className="font-mono">{tot > 1 ? `${Math.round((c.Full / tot) * 100)}% full` : "Not analysed"}</span></div>
                  <div className="mt-1 flex h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="bg-success" style={{ width: `${(c.Full / tot) * 100}%` }} />
                    <div className="bg-warning" style={{ width: `${(c.Partial / tot) * 100}%` }} />
                    <div className="bg-destructive" style={{ width: `${(c.Non / tot) * 100}%` }} />
                    <div className="bg-chart-5" style={{ width: `${(c.Clarify / tot) * 100}%` }} />
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
                <span>Stage: <b className="text-foreground">{o.stage}</b></span>
                <span>Quality {o.quality ? `${o.quality}/100` : "—"}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </AppShell>
  );
}
