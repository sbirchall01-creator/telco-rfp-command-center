import { useMemo, useState } from "react";
import { FileSpreadsheet, RotateCcw, Search } from "lucide-react";
import { toast } from "sonner";
import { StatusPill } from "@/components/AppShell";
import { STATUSES, people, progressOf, resetTasks, updateTask, exportTasksToExcel, type Task, type TaskStatus } from "@/lib/wbs-store";

const tone = (s: TaskStatus) => ({ Complete: "ok", "In Progress": "warn", Blocked: "bad", "Not Started": "neutral", "Not Applicable": "neutral" } as const)[s];
const groupOf = (t: Task) => (t.type === "Process Activity" ? t.area.replace(/^\d+\.\d+\s*/, "") : "Proposal sections");

export function WbsBoard({ opp, tasks }: { opp: { id: string; customer: string; name: string }; tasks: Task[] }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("All");
  const [owner, setOwner] = useState<string>("All");
  const [busy, setBusy] = useState(false);
  const pct = progressOf(tasks);

  const filtered = useMemo(
    () => tasks.filter((t) => (status === "All" || t.status === status) && (owner === "All" || t.owner === owner) && (!q || `${t.name} ${t.area}`.toLowerCase().includes(q.toLowerCase()))),
    [tasks, q, status, owner],
  );
  const groups = useMemo(() => {
    const m = new Map<string, Task[]>();
    filtered.forEach((t) => m.set(groupOf(t), [...(m.get(groupOf(t)) ?? []), t]));
    return [...m];
  }, [filtered]);
  const counts = STATUSES.map((s) => [s, tasks.filter((t) => t.status === s).length] as const);

  const onExport = async () => {
    setBusy(true);
    try { await exportTasksToExcel(opp, tasks); toast.success("Task list exported to Excel"); }
    catch { toast.error("Export failed — please try again"); }
    finally { setBusy(false); }
  };

  const sel = "rounded-lg border bg-card px-2.5 py-1.5 text-sm";
  return (
    <div className="space-y-4">
      <div className="surface p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">Work breakdown · {tasks.length} tasks</h2>
            <p className="text-xs text-muted-foreground">Based on the Hansen RFP response WBS. Changes save automatically and update the pipeline.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { resetTasks(opp.id); toast("Task list reset to plan"); }} className="inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm hover:bg-muted"><RotateCcw className="h-4 w-4" />Reset</button>
            <button disabled={busy} onClick={onExport} className="inline-flex items-center gap-1.5 rounded-xl bg-signal px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-60"><FileSpreadsheet className="h-4 w-4" />{busy ? "Exporting…" : "Export to Excel"}</button>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3"><div className="h-2 flex-1 rounded-full bg-muted"><div className="h-full rounded-full bg-signal transition-all" style={{ width: `${pct}%` }} /></div><span className="font-mono text-sm">{pct}%</span></div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {counts.map(([s, n]) => (
            <button key={s} onClick={() => setStatus(status === s ? "All" : s)} className={`rounded-full ring-offset-2 ${status === s ? "ring-2 ring-ring" : ""}`}><StatusPill tone={tone(s)}>{s} · {n}</StatusPill></button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <label className="relative flex-1 min-w-48"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tasks" className="w-full rounded-lg border bg-card py-1.5 pl-8 pr-3 text-sm" /></label>
          <select aria-label="Filter by owner" value={owner} onChange={(e) => setOwner(e.target.value)} className={sel}><option value="All">All owners</option>{people.map((p) => <option key={p.name} value={p.name}>{p.name}</option>)}</select>
          <select aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)} className={sel}><option value="All">All statuses</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
        </div>
      </div>

      {groups.map(([g, ts]) => {
        const done = ts.filter((t) => t.status === "Complete").length;
        return (
          <section key={g} className="surface overflow-hidden">
            <header className="flex items-center justify-between bg-muted/60 px-4 py-2.5"><h3 className="text-sm font-semibold">{g}</h3><span className="font-mono text-xs text-muted-foreground">{done}/{ts.length}</span></header>
            <ul className="divide-y">
              {ts.map((t) => (
                <li key={t.no} className="grid gap-2 px-4 py-3 md:grid-cols-[2.5rem_1fr_11rem_9.5rem] md:items-center">
                  <span className="font-mono text-xs text-muted-foreground">{t.no}</span>
                  <div className="min-w-0">
                    <p className={`text-sm font-medium ${t.status === "Complete" || t.status === "Not Applicable" ? "text-muted-foreground line-through" : ""}`}>{t.type === "Proposal Section" ? `§${t.area} ` : ""}{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.team} · due {new Date(t.due).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })} · {t.priority}</p>
                  </div>
                  <select aria-label={`Owner for task ${t.no}`} value={t.owner} onChange={(e) => { updateTask(opp.id, t.no, { owner: e.target.value }); toast.success(`Task ${t.no} assigned to ${e.target.value}`); }} className={sel}>
                    {people.map((p) => <option key={p.name} value={p.name}>{p.name} · {p.role}</option>)}
                  </select>
                  <select aria-label={`Status for task ${t.no}`} value={t.status} onChange={(e) => updateTask(opp.id, t.no, { status: e.target.value as TaskStatus })} className={`${sel} font-medium ${t.status === "Complete" ? "text-success" : t.status === "Blocked" ? "text-destructive" : ""}`}>
                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
      {!groups.length && <p className="surface p-6 text-center text-sm text-muted-foreground">No tasks match these filters.</p>}
    </div>
  );
}
