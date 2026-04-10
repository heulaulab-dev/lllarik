"use client";

import { useEffect, useRef, useState } from "react";
import { Joyride, EVENTS, STATUS, type Step as JoyrideStep } from "react-joyride";
import { toast } from "sonner";
import { usePatchDashboardTourAcks, type DashboardMe } from "@/lib/dashboardService";
import {
  DASHBOARD_TOUR_STEPS,
  filterStepsByRole,
  getPendingSteps,
  type DashboardTourStep,
} from "@/lib/dashboardTour";

function toJoyrideSteps(tour: DashboardTourStep[]): JoyrideStep[] {
  return tour.map((s) => ({
    target: `[data-tour-id="${s.tourId}"]`,
    title: s.title,
    content: <p className="text-sm leading-snug text-muted-foreground">{s.body}</p>,
    placement: "bottom",
    id: s.stepId,
  }));
}

type Props = {
  me: DashboardMe | undefined;
  meLoading: boolean;
  forceFullReplay: boolean;
  onReplayConsumed: () => void;
};

export function DashboardTourJoyride({ me, meLoading, forceFullReplay, onReplayConsumed }: Props) {
  const patchAcks = usePatchDashboardTourAcks();
  const [run, setRun] = useState(false);
  const [steps, setSteps] = useState<JoyrideStep[]>([]);
  const runStepsRef = useRef<DashboardTourStep[]>([]);

  const reducedMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (meLoading || !me) {
      setRun(false);
      setSteps([]);
      return;
    }
    const applicable = filterStepsByRole(DASHBOARD_TOUR_STEPS, me.role);
    const pending = getPendingSteps(applicable, me.dashboardTourStepAcks ?? {}, {
      forceFullReplay: forceFullReplay,
    });
    if (pending.length === 0) {
      setRun(false);
      setSteps([]);
      return;
    }
    if (forceFullReplay) {
      onReplayConsumed();
    }
    runStepsRef.current = pending;
    setSteps(toJoyrideSteps(pending));
    setRun(true);
  }, [meLoading, me, forceFullReplay, me?.dashboardTourStepAcks, me?.role, onReplayConsumed]);

  return (
    <Joyride
      run={run}
      steps={steps}
      continuous
      scrollToFirstStep
      onEvent={(data) => {
        if (data.type === EVENTS.ERROR && data.error) {
          toast.error("Tour could not highlight a target. Try expanding the sidebar.");
          return;
        }
        if (data.type !== EVENTS.TOUR_STATUS) return;
        if (data.status !== STATUS.FINISHED && data.status !== STATUS.SKIPPED) return;

        const acks: Record<string, number> = {};
        for (const s of runStepsRef.current) {
          acks[s.stepId] = s.contentVersion;
        }
        setRun(false);
        patchAcks.mutateAsync(acks).catch(() => {
          toast.error("Could not save tour progress. Try again from Settings.");
        });
      }}
      options={{
        buttons: ["back", "skip", "primary"],
        skipBeacon: true,
        showProgress: true,
        scrollDuration: reducedMotion ? 0 : 300,
        overlayColor: "rgba(15, 23, 42, 0.55)",
        zIndex: 10050,
        arrowColor: "#ffffff",
        backgroundColor: "#ffffff",
        textColor: "#0f172a",
        primaryColor: "#171717",
      }}
    />
  );
}
