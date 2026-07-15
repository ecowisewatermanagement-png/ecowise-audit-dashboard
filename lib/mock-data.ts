// Placeholder data so the dashboard/analytics UI can be built and reviewed
// before Supabase is connected. Every export here should be replaced by a
// real query — see the `// TODO(data):` comment above each usage site.

export const MOCK_PROJECT_GOAL_HOMES = 750;

export const MOCK_DASHBOARD_SUMMARY = {
  homesAudited: 312,
  estimatedAnnualGallonsSaved: 18_640_000,
  estimatedAnnualDollarSavings: 149_120,
  averageSavingsPerHome: 478,
  homesWithSmartControllers: 141,
  efficientToiletsInstalled: 267,
  efficientShowerheadsInstalled: 298,
  leakRepairs: 74,
  totalRebateOpportunities: 62_400,
};

export const MOCK_MONTHLY_AUDITS = [
  { month: "Feb", audits: 18 },
  { month: "Mar", audits: 34 },
  { month: "Apr", audits: 41 },
  { month: "May", audits: 52 },
  { month: "Jun", audits: 61 },
  { month: "Jul", audits: 47 },
];

export const MOCK_SAVINGS_TREND = [
  { month: "Feb", gallons: 980_000 },
  { month: "Mar", gallons: 2_140_000 },
  { month: "Apr", gallons: 3_820_000 },
  { month: "May", gallons: 6_010_000 },
  { month: "Jun", gallons: 9_420_000 },
  { month: "Jul", gallons: 12_680_000 },
];

export const MOCK_UPGRADE_CATEGORIES = [
  { category: "Toilets", count: 267 },
  { category: "Showerheads", count: 298 },
  { category: "Smart Controllers", count: 141 },
  { category: "Faucet Aerators", count: 203 },
  { category: "Leak Repairs", count: 74 },
];

export const MOCK_NEIGHBORHOOD_PROGRESS = [
  { neighborhood: "Sagebrush Ridge", audited: 88, total: 120 },
  { neighborhood: "Canyon View Estates", audited: 74, total: 150 },
  { neighborhood: "Red Rock Commons", audited: 61, total: 100 },
  { neighborhood: "Desert Willow", audited: 52, total: 180 },
  { neighborhood: "Mesa Trails", audited: 37, total: 200 },
];

export const MOCK_BUILDER_COMPARISON = [
  { builder: "Cavan Homes", avgSavings: 541 },
  { builder: "Ivory Homes", avgSavings: 398 },
  { builder: "Woodside Homes", avgSavings: 462 },
];

export const MOCK_ANALYTICS_SUMMARY = {
  averageAuditScore: 74,
  participationRatePct: 42,
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

export const MOCK_AUDITS: MockAuditRow[] = [
  { id: "1", homeId: "SR-1042", address: "1042 Sagebrush Ridge Dr", homeownerName: "Maria Chen", builder: "Cavan Homes", neighborhood: "Sagebrush Ridge", auditorName: "J. Torres", auditDate: "2026-07-08", status: "reviewed", dollarSavingsPerYear: 612, efficiencyScore: 78 },
  { id: "2", homeId: "CV-0217", address: "217 Canyon View Ln", homeownerName: "David Okafor", builder: "Ivory Homes", neighborhood: "Canyon View Estates", auditorName: "S. Patel", auditDate: "2026-07-10", status: "completed", dollarSavingsPerYear: 349, efficiencyScore: 64 },
  { id: "3", homeId: "RR-0088", address: "88 Red Rock Commons Way", homeownerName: "Elena Marquez", builder: "Cavan Homes", neighborhood: "Red Rock Commons", auditorName: "J. Torres", auditDate: "2026-07-11", status: "in_progress", dollarSavingsPerYear: 0, efficiencyScore: 0 },
  { id: "4", homeId: "DW-0305", address: "305 Desert Willow Ct", homeownerName: "Priya Nair", builder: "Woodside Homes", neighborhood: "Desert Willow", auditorName: "M. Lee", auditDate: "2026-07-12", status: "completed", dollarSavingsPerYear: 528, efficiencyScore: 71 },
  { id: "5", homeId: "MT-0159", address: "159 Mesa Trails Blvd", homeownerName: "Tom Reilly", builder: "Ivory Homes", neighborhood: "Mesa Trails", auditorName: "S. Patel", auditDate: "2026-07-13", status: "draft", dollarSavingsPerYear: 0, efficiencyScore: 0 },
  { id: "6", homeId: "SR-1108", address: "1108 Sagebrush Ridge Dr", homeownerName: "Grace Kim", builder: "Woodside Homes", neighborhood: "Sagebrush Ridge", auditorName: "M. Lee", auditDate: "2026-07-13", status: "reviewed", dollarSavingsPerYear: 701, efficiencyScore: 85 },
];
