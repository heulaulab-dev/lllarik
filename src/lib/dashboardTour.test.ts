import { describe, expect, it } from "vitest";
import {
  DASHBOARD_TOUR_STEPS,
  filterStepsByRole,
  getPendingSteps,
} from "./dashboardTour";

describe("filterStepsByRole", () => {
  it("excludes admin-only steps for editor", () => {
    const filtered = filterStepsByRole(DASHBOARD_TOUR_STEPS, "editor");
    expect(filtered.some((s) => s.stepId === "nav.users")).toBe(false);
  });

  it("includes admin-only steps for admin", () => {
    const filtered = filterStepsByRole(DASHBOARD_TOUR_STEPS, "admin");
    expect(filtered.some((s) => s.stepId === "nav.users")).toBe(true);
  });
});

describe("getPendingSteps", () => {
  it("returns all steps when acks are empty", () => {
    const applicable = filterStepsByRole(DASHBOARD_TOUR_STEPS, "editor");
    const pending = getPendingSteps(applicable, {}, { forceFullReplay: false });
    expect(pending.length).toBe(applicable.length);
  });

  it("returns nothing when all acks match", () => {
    const applicable = filterStepsByRole(DASHBOARD_TOUR_STEPS, "editor");
    const acks = Object.fromEntries(applicable.map((s) => [s.stepId, s.contentVersion]));
    const pending = getPendingSteps(applicable, acks, { forceFullReplay: false });
    expect(pending).toHaveLength(0);
  });

  it("returns only outdated steps", () => {
    const applicable = filterStepsByRole(DASHBOARD_TOUR_STEPS, "editor");
    const pending = getPendingSteps(applicable, { "sidebar.workspace": 0 }, { forceFullReplay: false });
    expect(pending.map((s) => s.stepId)).toContain("sidebar.workspace");
  });

  it("forceFullReplay returns all applicable steps", () => {
    const applicable = filterStepsByRole(DASHBOARD_TOUR_STEPS, "editor");
    const acks = Object.fromEntries(applicable.map((s) => [s.stepId, s.contentVersion]));
    const pending = getPendingSteps(applicable, acks, { forceFullReplay: true });
    expect(pending.length).toBe(applicable.length);
  });
});
