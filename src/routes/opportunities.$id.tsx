import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, Download, RefreshCw, Upload, FileText, ChevronLeft, Plus, Minus, PenLine } from "lucide-react";
import { toast } from "sonner";
import { AppShell, StatusPill, Countdown } from "@/components/AppShell";
import { WbsBoard } from "@/components/WbsBoard";
import { getOpp, daysUntil, inventory, issues, requirements, evaluation, outputs, changes, type Compliance } from "@/lib/mock-data";
import { useTasks, progressOf, type Task } from "@/lib/wbs-store";

const phaseOf = (t: Task) => (t.type === "Process Activity" ? t.area.replace(/^\d+\.\d+\s*/, "") : "Proposal sections");

export const Route = createFileRoute("/opportunities/$id")({
  loader: ({ params }) => {
    const opp = getOpp(params.id);
    if (!opp) throw notFound();
    return { opp };
  },
  head: ({ loaderData }) => {
    const t = loaderData ? `${loaderData.opp.customer} · ${loaderData.opp.name} — BidDeck` : "Workspace — BidDeck";
    return { meta: [{ title: t }, { name: "description", content: "RFx response workspace" }, { property: "og:title", content: t }, { property: "og:description", content: "RFx response workspace" }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] };
  },
  component: Workspace,
});

const tabs = ["Overview", "Inventory", "Requirements", "WBS", "Evaluation", "Changes", "Outputs"] as const;
type Tab = (typeof tabs)[number];

const toneFor = (c: Compliance) => ({ Full: "ok", Partial: "warn", Non: "bad", Clarify: "info" } as const)[c];

function Workspace() {
  const { opp } = Route.useLoaderData();
  const [tab, setTab] = useState<Tab>("Overview");
  const tasks = useTasks(opp.id);
  const pct = progressOf(tasks);
  const weighted = Math.round(evaluation.reduce((s, e) => s + (e.weight * e.score) / 100, 0));

  return (
    <AppShell>
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ChevronLeft className="h-4 w-4" />Pipeline</Link>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap gap-1.5"><StatusPill tone="info">{opp.rfxType}</StatusPill><StatusPill tone="neutral">{opp.segment}</StatusPill><StatusPill tone="bad">{opp.confidentiality}</StatusPill></div>
          <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">{opp.name}</h1>
          <p className="text-sm text-muted-foreground">{opp.customer} · {opp.crmRef || "No CRM ref"} · {opp.timezone}</p>
        </div>
        <span className="rounded-full bg-ink px-3 py-1 font-mono text-xs text-ink-foreground">Stage · {opp.stage}</span>
      </div>

      <div className="-mx-4 mt-6 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="inline-flex gap-1 rounded-xl bg-muted p-1">
          {tabs.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${tab === t ? "bg-card text-foreground shadow-card" : "text-muted-foreground hover:text-foreground"}`}>
              {t}{t === "Changes" && <span className="ml-1.5 rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">5</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {tab === "Overview" && (
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="grid grid-cols-2 gap-3 lg:col-span-3 lg:grid-cols-4">
              <Countdown label="Until submission" days={daysUntil(opp.submissionDeadline)} />
              <Countdown label="Until final clarifications" days={daysUntil(opp.clarificationDeadline)} />
              <div className="surface p-4"><p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Tasks complete</p><p className="mt-1 font-display text-3xl font-semibold">{pct}%</p></div>
              <div className="surface p-4"><p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Coverage score</p><p className="mt-1 font-display text-3xl font-semibold">{weighted}<span className="text-sm text-muted-foreground">/100</span></p></div>
            </div>
            <div className="surface p-5 lg:col-span-2">
              <h2 className="font-semibold">Compliance position</h2>
              <ComplianceBars c={opp.compliance} />
            </div>
            <div className="surface p-5">
              <h2 className="font-semibold">Task progress by phase</h2>
              <div className="mt-4 space-y-3">
                {[...new Set(tasks.map(phaseOf))].map((p) => {
                  const ts = tasks.filter((t) => phaseOf(t) === p && t.status !== "Not Applicable"); const d = ts.filter((t) => t.status === "Complete").length;
                  return <div key={p}><div className="flex justify-between text-sm"><span>{p}</span><span className="font-mono text-muted-foreground">{d}/{ts.length}</span></div><div className="mt-1 h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-signal" style={{ width: `${ts.length ? (d / ts.length) * 100 : 0}%` }} /></div></div>;
                })}
              </div>
            </div>
            <div className="surface p-5 lg:col-span-2">
              <h2 className="flex items-center gap-2 font-semibold"><AlertTriangle className="h-4 w-4 text-primary" />Document issues</h2>
              <ul className="mt-3 divide-y">
                {issues.map((i) => <li key={i.title} className="flex gap-3 py-3"><span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${i.severity === "high" ? "bg-destructive" : i.severity === "med" ? "bg-warning" : "bg-muted-foreground"}`} /><div><p className="text-sm font-medium">{i.title}</p><p className="text-xs text-muted-foreground">{i.detail}</p></div></li>)}
              </ul>
            </div>
            <div className="surface p-5">
              <h2 className="font-semibold">Key details</h2>
              <dl className="mt-3 space-y-2 text-sm">
                {[["Sales owner", opp.salesOwner], ["Pre-Sales", opp.presalesManager], ["Project Manager", opp.projectManager], ["Defence date", opp.defenceDate], ["Decision date", opp.decisionDate], ["Submission via", opp.submissionMethod], ["Domains", opp.domains.join(", ")]].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3"><dt className="text-muted-foreground">{k}</dt><dd className="text-right font-medium">{v || <span className="text-warning">Missing</span>}</dd></div>
                ))}
              </dl>
            </div>
          </div>
        )}

        {tab === "Inventory" && (
          <div className="surface overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>{["File", "Owner", "Version", "Purpose", "Reqs", "Response", "Preserve", "Processed", "Flags"].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y">
                {inventory.map((d) => (
                  <tr key={d.file} className={d.flag === "Superseded" ? "opacity-55" : ""}>
                    <td className="px-4 py-3"><div className="flex items-center gap-2"><span className="rounded bg-accent px-1.5 py-0.5 font-mono text-[10px] text-accent-foreground">{d.type}</span><span className="font-medium">{d.file}</span></div></td>
                    <td className="px-4 py-3">{d.owner}</td>
                    <td className="px-4 py-3 font-mono text-xs">{d.version}</td>
                    <td className="px-4 py-3 text-muted-foreground">{d.purpose}</td>
                    <td className="px-4 py-3 font-mono">{d.requirements}</td>
                    <td className="px-4 py-3">{d.responseRequired ? "Yes" : "No"}</td>
                    <td className="px-4 py-3">{d.preserveTemplate ? "Yes" : "No"}</td>
                    <td className="px-4 py-3">{d.processed ? <CheckCircle2 className="h-4 w-4 text-success" /> : "No"}</td>
                    <td className="px-4 py-3">{d.flag && <StatusPill tone={d.flag === "Superseded" ? "neutral" : d.flag === "Conflict" ? "bad" : "warn"}>{d.flag}</StatusPill>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "Requirements" && (
          <div className="space-y-3">
            <div className="surface p-5"><h2 className="font-semibold">Compliance summary</h2><ComplianceBars c={opp.compliance} /></div>
            {requirements.map((r) => (
              <article key={r.id} className="surface p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">{r.id}</span><StatusPill tone="neutral">{r.domain}</StatusPill>
                  <StatusPill tone={toneFor(r.compliance)}>{r.compliance === "Non" ? "Non-compliant" : r.compliance === "Clarify" ? "Clarification" : `${r.compliance}y compliant`.replace("Fully", "Fully").replace("Partialy", "Partially")}</StatusPill>
                  <span className="ml-auto"><StatusPill tone={r.status === "Approved" ? "ok" : r.status === "In review" ? "info" : "warn"}>{r.status === "Draft" ? "AI draft" : r.status}</StatusPill></span>
                </div>
                <p className="mt-3 text-sm font-medium">{r.text}</p>
                <div className="mt-3 rounded-xl border-l-4 border-primary bg-muted p-3 text-sm">{r.response}</div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>Evidence: <b className="text-foreground">{r.evidence}</b> · Owner {r.owner}</span>
                  <span className="flex gap-2">
                    <button className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 font-medium hover:bg-muted"><PenLine className="h-3 w-3" />Edit</button>
                    {r.status !== "Approved" && <button onClick={() => toast.success(`${r.id} approved`)} className="rounded-lg bg-ink px-2.5 py-1 font-medium text-ink-foreground">Approve</button>}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}

        {tab === "WBS" && <WbsBoard opp={opp} tasks={tasks} />}

        {tab === "Evaluation" && (
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="surface flex flex-col items-center justify-center p-6 text-center">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Weighted coverage score</p>
              <p className="mt-2 font-display text-6xl font-semibold">{weighted}</p>
              <p className="text-sm text-muted-foreground">Based on customer criteria (Annex E)</p>
              <button onClick={() => toast("Re-scoring responses against matrix…")} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-signal px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow"><RefreshCw className="h-4 w-4" />Run new review</button>
              <p className="mt-2 text-xs text-muted-foreground">Last reviewed 2h ago · auto-review on save</p>
            </div>
            <div className="surface p-5 lg:col-span-2">
              <h2 className="font-semibold">Criteria</h2>
              <div className="mt-4 space-y-4">
                {evaluation.map((e) => (
                  <div key={e.criterion}>
                    <div className="flex justify-between text-sm"><span className="font-medium">{e.criterion} <span className="text-muted-foreground">· {e.weight}%</span></span><span className="font-mono">{e.score}</span></div>
                    <div className="mt-1 h-2 rounded-full bg-muted"><div className={`h-full rounded-full ${e.score >= 70 ? "bg-success" : e.score >= 50 ? "bg-warning" : "bg-destructive"}`} style={{ width: `${e.score}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "Changes" && (
          <div className="space-y-4">
            <div className="surface p-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">New customer material detected</p>
              <p className="mt-1 font-medium"><span className="text-muted-foreground line-through">{changes.from}</span> → {changes.to}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {([["Added", changes.added, "text-success", Plus], ["Changed", changes.changed, "text-accent-foreground", PenLine], ["Removed", changes.removed, "text-destructive", Minus]] as const).map(([l, items, c, Icon]) => (
                <div key={l} className="surface p-5">
                  <h3 className={`flex items-center gap-2 font-semibold ${c}`}><Icon className="h-4 w-4" />{l} ({items.length})</h3>
                  <ul className="mt-3 space-y-2 text-sm">{items.map((i) => <li key={i.id}><span className="font-mono text-xs text-muted-foreground">{i.id}</span> {i.text}</li>)}</ul>
                </div>
              ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="surface p-5"><h3 className="font-semibold">Impacted items</h3><ul className="mt-3 list-disc space-y-1 pl-5 text-sm">{changes.affected.map((a) => <li key={a}>{a}</li>)}</ul></div>
              <div className="surface p-5"><h3 className="font-semibold">Outputs requiring regeneration</h3><ul className="mt-3 list-disc space-y-1 pl-5 text-sm">{changes.regenerate.map((a) => <li key={a}>{a}</li>)}</ul></div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => toast.success("Changes accepted — affected items reopened")} className="rounded-xl bg-signal px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow">Accept & apply changes</button>
              <button className="rounded-xl border px-5 py-2.5 text-sm font-medium hover:bg-muted">Review individually</button>
            </div>
          </div>
        )}

        {tab === "Outputs" && (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              {outputs.map((o) => (
                <div key={o.name} className="surface flex items-center gap-4 p-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent"><FileText className="h-5 w-5 text-primary" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{o.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{o.file} · {o.template}</p>
                    <div className="mt-1"><StatusPill tone={o.status === "Approved" ? "ok" : o.status === "Needs regeneration" ? "bad" : o.status === "Draft" ? "warn" : "info"}>{o.status}</StatusPill></div>
                  </div>
                  <button aria-label={`Download ${o.name}`} onClick={() => toast(`Preparing ${o.file}`)} className="grid h-9 w-9 place-items-center rounded-lg border hover:bg-muted"><Download className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-6 text-sm font-medium text-muted-foreground hover:bg-muted">
              <Upload className="h-4 w-4" />Upload revised Hansen documents
              <input type="file" multiple className="hidden" onChange={() => toast.success("Hansen documents uploaded")} />
            </label>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function ComplianceBars({ c }: { c: Record<Compliance, number> }) {
  const tot = c.Full + c.Partial + c.Non + c.Clarify || 1;
  const rows = [["Fully compliant", c.Full, "bg-success"], ["Partially compliant", c.Partial, "bg-warning"], ["Non-compliant", c.Non, "bg-destructive"], ["Clarification needed", c.Clarify, "bg-chart-5"]] as const;
  return (
    <div className="mt-4">
      <div className="flex h-3 overflow-hidden rounded-full bg-muted">{rows.map(([l, v, cl]) => <div key={l} className={cl} style={{ width: `${(v / tot) * 100}%` }} />)}</div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {rows.map(([l, v, cl]) => <div key={l}><div className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className={`h-2 w-2 rounded-full ${cl}`} />{l}</div><p className="font-display text-2xl font-semibold">{v}</p></div>)}
      </div>
    </div>
  );
}
