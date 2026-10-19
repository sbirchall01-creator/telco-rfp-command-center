export type Compliance = "Full" | "Partial" | "Non" | "Clarify";
export type Stage = "Qualify" | "Mobilise" | "Draft" | "Review" | "Submit" | "Defence";

export interface Opportunity {
  id: string;
  customer: string;
  name: string;
  crmRef: string;
  rfxType: "RFI" | "RFQ" | "RFP" | "Questionnaire" | "Framework" | "Clarification";
  segment: "B2C" | "B2B" | "Converged";
  salesOwner: string;
  presalesManager: string;
  projectManager: string;
  submissionDeadline: string;
  clarificationDeadline: string;
  defenceDate: string;
  decisionDate: string;
  domains: string[];
  submissionMethod: string;
  timezone: string;
  confidentiality: string;
  stage: Stage;
  progress: number;
  quality: number;
  compliance: Record<Compliance, number>;
}

export const opportunities: Opportunity[] = [
  {
    id: "vodaria-bss",
    customer: "Vodaria Group",
    name: "Converged BSS Transformation",
    crmRef: "OPP-24-0981",
    rfxType: "RFP",
    segment: "Converged",
    salesOwner: "Amelia Clarke",
    presalesManager: "Scott Birchall",
    projectManager: "Ravi Menon",
    submissionDeadline: "2026-11-13T17:00:00Z",
    clarificationDeadline: "2026-10-28T12:00:00Z",
    defenceDate: "2026-12-02",
    decisionDate: "2027-01-20",
    domains: ["Catalog", "CPQ", "Order Mgmt", "Charging", "Billing"],
    submissionMethod: "Ariba portal",
    timezone: "CET (UTC+1)",
    confidentiality: "Strictly Confidential",
    stage: "Draft",
    progress: 46,
    quality: 68,
    compliance: { Full: 312, Partial: 74, Non: 19, Clarify: 23 },
  },
  {
    id: "nordtel-cpq",
    customer: "NordTel",
    name: "B2B Quote-to-Order Modernisation",
    crmRef: "OPP-24-1102",
    rfxType: "RFI",
    segment: "B2B",
    salesOwner: "Jonas Berg",
    presalesManager: "Scott Birchall",
    projectManager: "Emma Hughes",
    submissionDeadline: "2026-10-30T15:00:00Z",
    clarificationDeadline: "2026-10-22T15:00:00Z",
    defenceDate: "",
    decisionDate: "",
    domains: ["CPQ", "Catalog"],
    submissionMethod: "Email",
    timezone: "CET (UTC+1)",
    confidentiality: "Confidential",
    stage: "Review",
    progress: 81,
    quality: 84,
    compliance: { Full: 128, Partial: 22, Non: 4, Clarify: 6 },
  },
  {
    id: "pacifica-fw",
    customer: "Pacifica Telecom",
    name: "Digital BSS Framework Agreement",
    crmRef: "",
    rfxType: "Framework",
    segment: "B2C",
    salesOwner: "Liam O'Connor",
    presalesManager: "Priya Shah",
    projectManager: "",
    submissionDeadline: "2026-12-08T09:00:00Z",
    clarificationDeadline: "2026-11-16T09:00:00Z",
    defenceDate: "",
    decisionDate: "2027-03-01",
    domains: ["Charging", "Billing", "Customer Mgmt"],
    submissionMethod: "Physical + USB",
    timezone: "AEST (UTC+10)",
    confidentiality: "Commercial in Confidence",
    stage: "Mobilise",
    progress: 12,
    quality: 0,
    compliance: { Full: 0, Partial: 0, Non: 0, Clarify: 0 },
  },
];

export const getOpp = (id: string) => opportunities.find((o) => o.id === id);

export const daysUntil = (iso: string) => {
  if (!iso) return null;
  const now = new Date("2026-10-19T09:34:00Z").getTime();
  return Math.ceil((new Date(iso).getTime() - now) / 86400000);
};

export interface InventoryItem {
  file: string;
  type: "PDF" | "DOCX" | "XLSX" | "PPTX";
  owner: "Customer" | "Hansen";
  version: string;
  purpose: string;
  requirements: number;
  responseRequired: boolean;
  preserveTemplate: boolean;
  processed: boolean;
  flag?: "Protected" | "Superseded" | "Conflict" | "Corrupt";
}

export const inventory: InventoryItem[] = [
  { file: "Vodaria_RFP_Main_v2.1.pdf", type: "PDF", owner: "Customer", version: "v2.1 · 02 Oct", purpose: "Main RFP & instructions", requirements: 42, responseRequired: false, preserveTemplate: false, processed: true },
  { file: "Annex_B_Requirements.xlsx", type: "XLSX", owner: "Customer", version: "v1.3 · 09 Oct", purpose: "Capability requirements", requirements: 428, responseRequired: true, preserveTemplate: true, processed: true, flag: "Protected" },
  { file: "Annex_B_Requirements_v1.2.xlsx", type: "XLSX", owner: "Customer", version: "v1.2 · 30 Sep", purpose: "Capability requirements", requirements: 419, responseRequired: true, preserveTemplate: true, processed: true, flag: "Superseded" },
  { file: "Annex_D_Response_Template.docx", type: "DOCX", owner: "Customer", version: "v1.0 · 02 Oct", purpose: "Proposal response template", requirements: 18, responseRequired: true, preserveTemplate: true, processed: true },
  { file: "Annex_E_Evaluation.pdf", type: "PDF", owner: "Customer", version: "v1.0 · 02 Oct", purpose: "Evaluation criteria & weighting", requirements: 0, responseRequired: false, preserveTemplate: false, processed: true, flag: "Conflict" },
  { file: "Bidders_Conference.pptx", type: "PPTX", owner: "Customer", version: "— · 07 Oct", purpose: "Customer briefing", requirements: 6, responseRequired: false, preserveTemplate: false, processed: true },
  { file: "Hansen_Kickoff_Template.pptx", type: "PPTX", owner: "Hansen", version: "v4 · 2026", purpose: "Internal kick-off", requirements: 0, responseRequired: false, preserveTemplate: true, processed: true },
];

export const issues = [
  { severity: "high", title: "Annex C (Pricing workbook) referenced but not supplied", detail: "Referenced in §4.2 of the main RFP. Requirement workbook supplied without pricing workbook." },
  { severity: "high", title: "Conflicting submission deadlines", detail: "Main RFP states 13 Nov 17:00 CET; Annex E states 12 Nov 17:00 CET." },
  { severity: "med", title: "Multiple versions of Annex B detected", detail: "v1.2 marked as superseded by v1.3 (9 new, 3 changed requirements)." },
  { severity: "med", title: "Hidden sheet in Annex B", detail: "Sheet 'Weights_Internal' is hidden and password-protected." },
  { severity: "low", title: "Locked response cells", detail: "Columns H–J in Annex B are protected; responses may not be safely editable." },
];

export interface Requirement {
  id: string;
  domain: string;
  text: string;
  compliance: Compliance;
  response: string;
  evidence: string;
  status: "Draft" | "In review" | "Approved";
  owner: string;
}

export const requirements: Requirement[] = [
  { id: "B-1.04", domain: "Catalog", text: "The solution shall support a single product catalogue for B2C and B2B offers across fixed and mobile.", compliance: "Full", response: "Hansen Catalog provides a single, design-time catalogue spanning B2C/B2B and converged offers, with lifecycle versioning.", evidence: "Catalog Product Guide §2.1", status: "Approved", owner: "M. Ortiz" },
  { id: "B-1.11", domain: "Catalog", text: "Business users must be able to launch a new tariff without IT involvement in under 5 days.", compliance: "Full", response: "Configuration-driven launch via no-code designer; reference customers average 2–3 days.", evidence: "Case study: Tier-1 EU operator", status: "In review", owner: "M. Ortiz" },
  { id: "B-2.07", domain: "CPQ", text: "Guided selling for complex enterprise bundles including SD-WAN and managed security.", compliance: "Partial", response: "Guided selling is supported out of the box; SD-WAN-specific configuration rules require project configuration.", evidence: "CPQ Release Notes 26.2", status: "Draft", owner: "K. Lee" },
  { id: "B-3.02", domain: "Order Mgmt", text: "Native TMF 622 / 641 Open API compliance with certification.", compliance: "Full", response: "Certified TMF622 v5 and TMF641 v4 conformance.", evidence: "TM Forum certificate 2026", status: "Approved", owner: "D. Patel" },
  { id: "B-3.19", domain: "Order Mgmt", text: "Real-time order fallout dashboard with AI-driven root-cause recommendations.", compliance: "Partial", response: "Fallout dashboard available; AI root-cause on 2027 roadmap. ASSUMPTION — subject to roadmap approval.", evidence: "Roadmap deck Q4 (internal)", status: "Draft", owner: "D. Patel" },
  { id: "B-4.33", domain: "Charging", text: "Converged online charging supporting 5G SA (CHF) at 40k TPS.", compliance: "Clarify", response: "Clarification needed: is 40k TPS peak or sustained, and per site or aggregate?", evidence: "—", status: "Draft", owner: "A. Novak" },
  { id: "B-5.08", domain: "Billing", text: "Support for on-premise mainframe print stream generation (AFP).", compliance: "Non", response: "Not supported natively. Proposed via partner integration.", evidence: "Partner catalogue", status: "In review", owner: "S. Grant" },
];

export interface WbsTask {
  id: string;
  phase: string;
  task: string;
  owner: string;
  due: string;
  done: boolean;
  affected?: boolean;
}

export const wbs: WbsTask[] = [
  { id: "1.1", phase: "Mobilise", task: "Bid / no-bid decision", owner: "A. Clarke", due: "2026-10-08", done: true },
  { id: "1.2", phase: "Mobilise", task: "Kick-off meeting & pack", owner: "S. Birchall", due: "2026-10-10", done: true },
  { id: "1.3", phase: "Mobilise", task: "Document inventory sign-off", owner: "R. Menon", due: "2026-10-12", done: true },
  { id: "2.1", phase: "Solution", task: "High-level solution document", owner: "S. Birchall", due: "2026-10-24", done: false },
  { id: "2.2", phase: "Solution", task: "Architecture diagrams", owner: "D. Patel", due: "2026-10-26", done: false },
  { id: "3.1", phase: "Responses", task: "Annex B capability responses", owner: "Domain leads", due: "2026-11-03", done: false, affected: true },
  { id: "3.2", phase: "Responses", task: "Clarification questions submitted", owner: "S. Birchall", due: "2026-10-27", done: false },
  { id: "3.3", phase: "Responses", task: "Proposal narrative (Annex D)", owner: "Bid writer", due: "2026-11-06", done: false },
  { id: "4.1", phase: "Commercial", task: "Effort estimates & assumptions", owner: "R. Menon", due: "2026-11-04", done: false, affected: true },
  { id: "4.2", phase: "Commercial", task: "Pricing approval", owner: "Finance", due: "2026-11-09", done: false },
  { id: "5.1", phase: "Governance", task: "Red-team review", owner: "Exec sponsor", due: "2026-11-10", done: false },
  { id: "5.2", phase: "Governance", task: "Final submission", owner: "A. Clarke", due: "2026-11-13", done: false },
];

export const evaluation = [
  { criterion: "Functional fit", weight: 35, score: 72, source: "Customer" },
  { criterion: "Technical architecture", weight: 20, score: 78, source: "Customer" },
  { criterion: "Delivery approach", weight: 15, score: 55, source: "Customer" },
  { criterion: "Commercials", weight: 20, score: 40, source: "Customer" },
  { criterion: "References & experience", weight: 10, score: 88, source: "Customer" },
];

export const outputs: { name: string; file: string; template: string; status: string; url?: string }[] = [
  { name: "Kick-off pack", file: "Vodaria_RFx_Kickoff_Pack.pptx", template: "Hansen RFx kick-off pack", status: "Approved", url: "/downloads/Vodaria_RFx_Kickoff_Pack.pptx" },
  { name: "Work breakdown structure", file: "Vodaria_RFP_Response_WBS.xlsx", template: "Hansen RFP response WBS + timeline", status: "Live in workspace", url: "/downloads/Vodaria_RFP_Response_WBS.xlsx" },
  { name: "Proposal response", file: "Vodaria_RFx_Response.docx", template: "Hansen RFx response master", status: "Draft", url: "/downloads/Vodaria_RFx_Response.docx" },
  { name: "High-level solution document", file: "Vodaria_HLSD.docx", template: "None", status: "Draft" },
  { name: "Capability requirements response", file: "Annex_B_Requirements_RESPONSE.xlsx", template: "Customer (preserved)", status: "Needs regeneration" },
  { name: "Clarification questions", file: "Vodaria_Clarifications.xlsx", template: "Hansen clarifications", status: "In review" },
  { name: "Evaluation matrix", file: "Vodaria_Evaluation.xlsx", template: "Customer criteria (Annex E)", status: "Draft" },
];

export const changes = {
  from: "Annex_B_Requirements_v1.2.xlsx",
  to: "Annex_B_Requirements.xlsx (v1.3)",
  added: [{ id: "B-4.41", text: "Support for network slicing-aware charging." }, { id: "B-6.02", text: "Sovereign cloud hosting within the EU." }],
  changed: [{ id: "B-3.19", text: "Added: 'AI-driven root-cause recommendations'." }, { id: "B-1.11", text: "Launch time reduced from 10 days to 5 days." }],
  removed: [{ id: "B-2.15", text: "Legacy CRM screen-scraping integration." }],
  affected: ["2 approved responses reopened", "Proposal §5.3 Order Management", "Estimate assumption A-14", "WBS 3.1, 4.1"],
  regenerate: ["Capability requirements response", "Evaluation matrix"],
};
