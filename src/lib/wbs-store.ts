import { useEffect, useSyncExternalStore } from "react";
import seed from "./wbs-seed.json";
import { opportunities } from "./mock-data";

export const STATUSES = ["Not Started", "In Progress", "Blocked", "Complete", "Not Applicable"] as const;
export type TaskStatus = (typeof STATUSES)[number];

export interface Task {
  no: number;
  type: string;
  area: string;
  name: string;
  team: string;
  owner: string;
  due: string;
  status: TaskStatus;
  priority: string;
  comment: string;
}

export const people: { name: string; role: string }[] = seed.people;
const baseTasks = seed.tasks as Task[];

/** Vodaria uses the dated template seed; other bids are seeded from their stored progress. */
export function seedTasks(oppId: string): Task[] {
  if (oppId === "vodaria-bss") return baseTasks.map((t) => ({ ...t }));
  const opp = opportunities.find((o) => o.id === oppId);
  const byDue = [...baseTasks].sort((a, b) => a.due.localeCompare(b.due));
  const doneCount = Math.round(((opp?.progress ?? 0) / 100) * byDue.length);
  const done = new Set(byDue.slice(0, doneCount).map((t) => t.no));
  return baseTasks.map((t) => ({ ...t, status: done.has(t.no) ? "Complete" : "Not Started" }));
}

/** Progress = Complete ÷ applicable tasks (Not Applicable is excluded). */
export function progressOf(tasks: Task[]) {
  const applicable = tasks.filter((t) => t.status !== "Not Applicable");
  if (!applicable.length) return 0;
  return Math.round((applicable.filter((t) => t.status === "Complete").length / applicable.length) * 100);
}

const KEY = "biddeck.wbs.v1";
type State = Record<string, Task[]>;
let state: State = {};
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    state = JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    state = {};
  }
  listeners.forEach((l) => l());
}
function emit() {
  localStorage.setItem(KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
}

const seedCache: State = {};
function get(oppId: string) {
  return state[oppId] ?? (seedCache[oppId] ??= seedTasks(oppId));
}

export function updateTask(oppId: string, no: number, patch: Partial<Task>) {
  state = { ...state, [oppId]: get(oppId).map((t) => (t.no === no ? { ...t, ...patch } : t)) };
  emit();
}
export function resetTasks(oppId: string) {
  const { [oppId]: _, ...rest } = state;
  state = rest;
  emit();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useTasks(oppId: string) {
  useEffect(load, []);
  return useSyncExternalStore(subscribe, () => get(oppId), () => seedCache[oppId] ??= seedTasks(oppId));
}

export function useAllProgress() {
  useEffect(load, []);
  const snap = useSyncExternalStore(subscribe, () => state, () => state);
  void snap;
  return Object.fromEntries(opportunities.map((o) => [o.id, progressOf(get(o.id))])) as Record<string, number>;
}

export async function exportTasksToExcel(opp: { id: string; customer: string; name: string }, tasks: Task[]) {
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("WBS", { views: [{ state: "frozen", ySplit: 1 }] });
  ws.columns = [
    { header: "No", key: "no", width: 6 },
    { header: "Type", key: "type", width: 17 },
    { header: "Area/Document", key: "area", width: 26 },
    { header: "Name/Description", key: "name", width: 70 },
    { header: "Team", key: "team", width: 22 },
    { header: "Owner", key: "owner", width: 18 },
    { header: "Due Date", key: "due", width: 12 },
    { header: "Status", key: "status", width: 15 },
    { header: "Priority", key: "priority", width: 10 },
    { header: "Comment", key: "comment", width: 40 },
  ];
  tasks.forEach((t) => ws.addRow({ ...t, due: new Date(t.due) }));
  ws.getColumn("due").numFmt = "dd-mmm-yy";
  const head = ws.getRow(1);
  head.font = { bold: true, color: { argb: "FFFFFFFF" } };
  head.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF102C45" } };
  ws.autoFilter = { from: "A1", to: "J1" };
  const fills: Record<string, string> = { Complete: "FFD7F0DF", "In Progress": "FFFFF1CC", Blocked: "FFF8D3D0", "Not Applicable": "FFEDEDED" };
  ws.eachRow((row, i) => {
    if (i === 1) return;
    row.getCell("name").alignment = { wrapText: true, vertical: "top" };
    const f = fills[row.getCell("status").value as string];
    if (f) row.getCell("status").fill = { type: "pattern", pattern: "solid", fgColor: { argb: f } };
    row.getCell("status").dataValidation = { type: "list", allowBlank: true, formulae: [`"${STATUSES.join(",")}"`] };
  });
  const sum = wb.addWorksheet("Summary");
  sum.addRow(["Customer", opp.customer]);
  sum.addRow(["Opportunity", opp.name]);
  sum.addRow(["Exported", new Date().toISOString().slice(0, 10)]);
  sum.addRow([]);
  sum.addRow(["Status", "Tasks"]).font = { bold: true };
  STATUSES.forEach((s) => sum.addRow([s, { formula: `COUNTIF(WBS!H:H,"${s}")` }]));
  sum.addRow(["% complete", { formula: `B10/(SUM(B6:B10))` }]).getCell(2).numFmt = "0%";
  sum.getColumn(1).width = 18;
  sum.getColumn(2).width = 40;
  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${opp.customer.replace(/\W+/g, "_")}_WBS_Tasks.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
