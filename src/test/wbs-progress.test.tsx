import { describe, expect, it } from "vitest";
import { progressOf, seedTasks, type Task } from "@/lib/wbs-store";

const t = (status: Task["status"]): Task => ({ no: 1, type: "", area: "", name: "", team: "", owner: "", due: "2026-10-01", status, priority: "Medium", comment: "" });

describe("WBS progress", () => {
  it("counts only Complete tasks over applicable tasks (Not Applicable excluded)", () => {
    expect(progressOf([t("Complete"), t("In Progress"), t("Not Applicable"), t("Not Applicable")])).toBe(50);
  });
  it("is 0 when nothing is applicable", () => {
    expect(progressOf([t("Not Applicable")])).toBe(0);
  });
  it("loads every task from the Hansen WBS template", () => {
    expect(seedTasks("vodaria-bss")).toHaveLength(127);
  });
});
