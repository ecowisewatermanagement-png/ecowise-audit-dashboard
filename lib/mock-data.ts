// Placeholder data so the dashboard/analytics UI can be built and reviewed
// before Supabase is connected. Every export here should be replaced by a
// real query — see the `// TODO(data):` comment above each usage site.

export const MOCK_PROJECT_GOAL_HOMES = 750;

export const MOCK_DASHBOARD_SUMMARY = {
  homesAudited: 0,
  estimatedAnnualGallonsSaved: 0,
  estimatedAnnualDollarSavings: 0,
  averageSavingsPerHome: 0,
  homesWithSmartControllers: 0,
  efficientToiletsInstalled: 0,
  efficientShowerheadsInstalled: 0,
  leakRepairs: 0,
  totalRebateOpportunities: 0,
};

export const MOCK_MONTHLY_AUDITS: { month: string; audits: number }[] = [];

export const MOCK_SAVINGS_TREND: { month: string; gallons: number }[] = [];

export const MOCK_UPGRADE_CATEGORIES: { category: string; count: number }[] = [];

export const MOCK_NEIGHBORHOOD_PROGRESS: { neighborhood: string; audited: number; total: number }[] = [];

export const MOCK_BUILDER_COMPARISON: { builder: string; avgSavings: number }[] = [];

export const MOCK_ANALYTICS_SUMMARY = {
  averageAuditScore: 0,
  participationRatePct: 0,
};

export interface MockAuditRow {
  id: string;
  homeId: string;
  address: string;
  homeownerName: string;
  builder: string;
  neighborhood: string;
  auditorName: string;
  auditDate: string;
  status: "draft" | "in_progress" | "completed" | "reviewed";
  dollarSavingsPerYear: number;
  efficiencyScore: number;
}

export const MOCK_AUDITS: MockAuditRow[] = [];
