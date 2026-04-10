export type TourRole = "admin" | "editor" | "viewer";

export type DashboardTourStep = {
  stepId: string;
  contentVersion: number;
  /** Value for `data-tour-id` in the dashboard shell */
  tourId: string;
  title: string;
  body: string;
  /** If set, only these roles see the step */
  roles?: TourRole[];
};

export const DASHBOARD_TOUR_STEPS: DashboardTourStep[] = [
  {
    stepId: "sidebar.workspace",
    contentVersion: 1,
    tourId: "tour-workspace",
    title: "Workspace",
    body: "This is your LLLARIK dashboard. Open the workspace header to return to Overview anytime.",
  },
  {
    stepId: "sidebar.search",
    contentVersion: 1,
    tourId: "tour-search",
    title: "Search the menu",
    body: "Filter sidebar links by name when the list grows.",
  },
  {
    stepId: "nav.main",
    contentVersion: 1,
    tourId: "tour-nav-main",
    title: "Main",
    body: "Overview, Products, and Copy — day-to-day content work lives here.",
  },
  {
    stepId: "nav.secondary",
    contentVersion: 1,
    tourId: "tour-nav-secondary",
    title: "Secondary",
    body: "Releases, Settings, Users (admins), and the public Landing shortcut.",
  },
  {
    stepId: "nav.users",
    contentVersion: 1,
    tourId: "tour-users",
    title: "Users",
    body: "Admins can invite and manage dashboard accounts here.",
    roles: ["admin"],
  },
  {
    stepId: "sidebar.account",
    contentVersion: 1,
    tourId: "tour-account",
    title: "Account",
    body: "Your profile summary and role. Use the menu for actions like signing out.",
  },
  {
    stepId: "header.sidebar-trigger",
    contentVersion: 1,
    tourId: "tour-sidebar-trigger",
    title: "Collapse & focus",
    body: "Toggle the sidebar to make room for content on smaller screens.",
  },
];

export function filterStepsByRole(steps: DashboardTourStep[], role: string): DashboardTourStep[] {
  return steps.filter((s) => {
    if (!s.roles?.length) return true;
    return s.roles.includes(role as TourRole);
  });
}

export function getPendingSteps(
  steps: DashboardTourStep[],
  acks: Record<string, number>,
  opts: { forceFullReplay: boolean },
): DashboardTourStep[] {
  if (opts.forceFullReplay) return steps;
  return steps.filter((s) => (acks[s.stepId] ?? 0) < s.contentVersion);
}
