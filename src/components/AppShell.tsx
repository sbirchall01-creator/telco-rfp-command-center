import { Link } from "@tanstack/react-router";
import { LayoutGrid, Plus, Bell } from "lucide-react";
import type { ReactNode } from "react";

export function Logo({ light }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-signal font-display text-sm font-bold text-primary-foreground shadow-glow">B</span>
      <span className={`font-display text-lg font-semibold ${light ? "text-ink-foreground" : "text-foreground"}`}>BidDeck</span>
    </span>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-ink-border bg-ink text-ink-foreground">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Link to="/dashboard"><Logo light /></Link>
          <nav className="ml-4 hidden items-center gap-1 text-sm sm:flex">
            <Link to="/dashboard" className="rounded-md px-3 py-1.5 text-ink-muted hover:text-ink-foreground" activeProps={{ className: "bg-sidebar-accent !text-ink-foreground" }}>
              <LayoutGrid className="mr-1.5 inline h-4 w-4" />Pipeline
            </Link>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Link to="/opportunities/new" className="inline-flex items-center gap-1.5 rounded-lg bg-signal px-3 py-1.5 text-sm font-semibold text-primary-foreground shadow-glow">
              <Plus className="h-4 w-4" /><span className="hidden sm:inline">New RFx</span>
            </Link>
            <button aria-label="Notifications" className="relative grid h-9 w-9 place-items-center rounded-lg text-ink-muted hover:bg-sidebar-accent">
              <Bell className="h-4 w-4" /><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
            </button>
            <span className="grid h-8 w-8 place-items-center rounded-full bg-sidebar-accent text-xs font-semibold">SB</span>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}

export function StatusPill({ tone, children }: { tone: "ok" | "warn" | "bad" | "info" | "neutral"; children: ReactNode }) {
  const map = {
    ok: "bg-success/15 text-success",
    warn: "bg-warning/20 text-accent-foreground",
    bad: "bg-destructive/12 text-destructive",
    info: "bg-accent text-accent-foreground",
    neutral: "bg-muted text-muted-foreground",
  };
  return <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ${map[tone]}`}>{children}</span>;
}

export function Countdown({ label, days }: { label: string; days: number | null }) {
  const urgent = days !== null && days <= 10;
  return (
    <div className="surface p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-1 font-display text-3xl font-semibold ${urgent ? "text-primary" : ""}`}>
        {days === null ? "—" : days}<span className="ml-1 text-sm font-medium text-muted-foreground">days</span>
      </p>
    </div>
  );
}
