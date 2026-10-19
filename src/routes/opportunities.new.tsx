import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { UploadCloud, FileText, Sparkles, Check } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/opportunities/new")({
  head: () => ({
    meta: [
      { title: "New RFx — BidDeck" },
      { name: "description", content: "Upload customer RFx documents and auto-create the opportunity." },
      { property: "og:title", content: "New RFx — BidDeck" },
      { property: "og:description", content: "Upload customer RFx documents and auto-create the opportunity." },
    ],
  }),
  component: NewRfx,
});

const fields: [string, string][] = [
  ["Customer", "Vodaria Group"], ["Opportunity name", "Converged BSS Transformation"], ["Opportunity ID / CRM ref", ""],
  ["RFx type", "RFP"], ["Classification (B2C / B2B / Converged)", "Converged"], ["Sales owner", ""],
  ["Pre-Sales Manager", ""], ["Project Manager", ""], ["Submission deadline", "2026-11-13 17:00 CET"],
  ["Clarification deadline", "2026-10-28 12:00 CET"], ["Presentation / defence date", "2026-12-02"], ["Expected decision date", ""],
  ["Products & domains in scope", "Catalog, CPQ, Order Mgmt, Charging, Billing"], ["Submission method", "Ariba portal"],
  ["Customer time zone", "CET (UTC+1)"], ["Confidentiality", "Strictly Confidential"], ["Bid status / lifecycle stage", "Qualify"],
];

function NewRfx() {
  const navigate = useNavigate();
  const [files, setFiles] = useState<string[]>([]);
  const [mode, setMode] = useState<"req" | "rfx">("rfx");
  const parsed = files.length > 0;

  return (
    <AppShell>
      <h1 className="text-3xl font-semibold">New RFx</h1>
      <p className="mt-1 text-sm text-muted-foreground">Upload customer documents — PDF, DOCX, XLSX and PPTX are analysed. Other types are stored.</p>

      <label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/40 bg-accent/40 px-6 py-12 text-center transition hover:bg-accent">
        <UploadCloud className="h-10 w-10 text-primary" />
        <p className="mt-3 font-display text-lg font-semibold">Drop customer files or browse</p>
        <p className="text-sm text-muted-foreground">Multiple files supported</p>
        <input type="file" multiple className="hidden" onChange={(e) => setFiles(Array.from(e.target.files ?? []).map((f) => f.name))} />
        <button type="button" onClick={(e) => { e.preventDefault(); setFiles(["Vodaria_RFP_Main_v2.1.pdf", "Annex_B_Requirements.xlsx", "Annex_D_Response_Template.docx", "Annex_E_Evaluation.pdf"]); }} className="mt-4 text-sm font-semibold text-primary underline-offset-4 hover:underline">
          Use sample Vodaria pack
        </button>
      </label>

      {parsed && (
        <>
          <div className="mt-4 flex flex-wrap gap-2">
            {files.map((f) => <span key={f} className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs"><FileText className="h-3.5 w-3.5 text-primary" />{f}<Check className="h-3.5 w-3.5 text-success" /></span>)}
          </div>

          <section className="surface mt-6 p-5 sm:p-6">
            <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /><h2 className="text-lg font-semibold">Extracted opportunity — draft</h2></div>
            <p className="text-sm text-muted-foreground">Blank where not found. Every field is editable.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {fields.map(([l, v]) => (
                <label key={l} className="block">
                  <span className="text-xs font-medium text-muted-foreground">{l}</span>
                  <input defaultValue={v} placeholder="Not found — add" className={`mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring ${v ? "" : "border-dashed border-warning"}`} />
                </label>
              ))}
            </div>
          </section>

          <section className="mt-6">
            <h2 className="text-lg font-semibold">Process option</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {[
                { k: "req" as const, t: "Requirement response", d: "Analyse requirement documents, propose responses & compliance positions, flag gaps and clarifications, preserve the customer's structure." },
                { k: "rfx" as const, t: "Full RFx response", d: "Everything above plus kick-off pack, WBS, solution document, proposal, clarification set and evaluation matrix." },
              ].map((o) => (
                <button key={o.k} onClick={() => setMode(o.k)} className={`rounded-2xl border-2 p-5 text-left transition ${mode === o.k ? "border-primary bg-accent/50" : "bg-card hover:border-primary/40"}`}>
                  <p className="font-display font-semibold">{o.t}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{o.d}</p>
                </button>
              ))}
            </div>
            <button onClick={() => navigate({ to: "/opportunities/$id", params: { id: "vodaria-bss" } })} className="mt-6 w-full rounded-xl bg-signal py-3 font-semibold text-primary-foreground shadow-glow sm:w-auto sm:px-8">
              Create workspace
            </button>
          </section>
        </>
      )}
    </AppShell>
  );
}
