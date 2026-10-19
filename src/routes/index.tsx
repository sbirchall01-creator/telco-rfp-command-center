import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Target, ShieldCheck, TrendingUp, ArrowRight } from "lucide-react";
import { Logo } from "@/components/AppShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BidDeck — Sign in to your RFx workspace" },
      { name: "description", content: "Ingest telco RFx documents, coordinate the response, and track submission readiness." },
      { property: "og:title", content: "BidDeck — Sign in to your RFx workspace" },
      { property: "og:description", content: "Ingest telco RFx documents, coordinate the response, and track submission readiness." },
    ],
  }),
  component: Landing,
});

const pillars = [
  { icon: Target, label: "Product objective", text: "Provide a controlled RFx response workspace that ingests customer documentation, identifies instructions and requirements, coordinates the end-to-end Hansen response process, generates first-draft response artefacts, maintains traceability to approved evidence, manages ownership and approvals, and monitors response quality and submission readiness." },
  { icon: ShieldCheck, label: "Guiding principle", text: "AI-generated content is always a draft until reviewed and approved by the accountable role. The system must preserve customer formats, distinguish confirmed capabilities from assumptions or proposals, maintain source traceability, and prevent unsupported statements from becoming customer commitments." },
  { icon: TrendingUp, label: "Key outcome", text: "Reduce the administrative effort required to mobilise and manage an RFx response while improving completeness, consistency, evidence quality, governance and on-time submission confidence." },
];

function Landing() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-ink bg-ink-gradient text-ink-foreground">
      <div className="pointer-events-none fixed inset-0 grid-lines opacity-40 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-8 lg:grid-cols-[1.3fr_1fr] lg:gap-16 lg:py-16">
        <section>
          <Logo light />
          <p className="mt-14 font-mono text-xs uppercase tracking-[0.2em] text-primary">Create · Sell · Deliver</p>
          <h1 className="mt-4 text-4xl font-semibold leading-[1.05] sm:text-6xl">
            Win tier‑1 telco bids<br />with <span className="bg-signal bg-clip-text text-transparent">total control.</span>
          </h1>
          <div className="mt-10 space-y-4">
            {pillars.map(({ icon: Icon, label, text }) => (
              <article key={label} className="rounded-2xl border border-ink-border bg-sidebar-accent/50 p-5 backdrop-blur">
                <div className="flex items-center gap-2 text-sm font-semibold"><Icon className="h-4 w-4 text-primary" />{label}</div>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="lg:pt-24">
          <form
            onSubmit={(e) => { e.preventDefault(); navigate({ to: "/dashboard" }); }}
            className="rounded-3xl bg-card p-7 text-card-foreground shadow-card lg:sticky lg:top-10"
          >
            <h2 className="text-2xl font-semibold">Sign in</h2>
            <p className="mt-1 text-sm text-muted-foreground">Access your bid workspaces.</p>
            <label className="mt-6 block text-sm font-medium">Work email</label>
            <input type="email" defaultValue="scott.birchall@hansen.com" className="mt-1.5 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
            <label className="mt-4 block text-sm font-medium">Password</label>
            <input type="password" defaultValue="demo-password" className="mt-1.5 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
            <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-signal py-3 text-sm font-semibold text-primary-foreground shadow-glow">
              Continue <ArrowRight className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => navigate({ to: "/dashboard" })} className="mt-3 w-full rounded-xl border border-input py-3 text-sm font-medium hover:bg-muted">
              Sign in with Microsoft SSO
            </button>
            <p className="mt-5 text-center text-xs text-muted-foreground">Demo mode — any credentials work.</p>
          </form>
        </section>
      </div>
    </div>
  );
}
