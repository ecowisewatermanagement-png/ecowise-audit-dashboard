export interface ExteriorAudit {
  irrigatedAreaSqFt?: number;
  landscapeType?: "turf" | "xeriscape" | "mixed" | "none";
  hasIrrigationController?: boolean;
  controllerBrand?: string;
  isSmartController?: boolean;
  numberOfZones?: number;
  sprinklerType?: "spray" | "rotor" | "drip" | "mixed";
  hasDripSystem?: boolean;
  staticPsi?: number;
  hasRainSensor?: boolean;
  hasOverspray?: boolean;
  hasRunoff?: boolean;
  hasLeaks?: boolean;
  brokenHeadCount?: number;
  hasPool?: boolean;
  poolGallons?: number;
  poolGallonsUsedPerYear?: number;
  hasSpa?: boolean;
  spaGallons?: number;
  spaGallonsUsedPerYear?: number;
  notes?: string;
}

export interface InteriorAudit {
  bathroomCount?: number;

  showerheadCount?: number;
  showerheadFlowRateGpm?: number;

  toiletCount?: number;
  toiletFlushVolumeGal?: number;

  bathroomFaucetCount?: number;
  bathroomFaucetFlowRateGpm?: number;

  kitchenFaucetFlowRateGpm?: number;

  hasHighEfficiencyWasher?: boolean;
  hasDishwasher?: boolean;
  isDishwasherWaterEfficient?: boolean;

  hasToiletLeaks?: boolean;
  hasFaucetLeaks?: boolean;
  hasShowerLeaks?: boolean;

  hasHotWaterRecirculation?: boolean;

  notes?: string;
}

export type RecommendationPriority = "low" | "medium" | "high";

export interface Recommendation {
  id: string;
  templateId?: string;
  title: string;
  category: string;
  description?: string;
  priority: RecommendationPriority;
  estimatedGallonsSavedPerYear?: number;
  estimatedCost?: number;
  rebateAmount?: number;
}

export interface AuditCalculations {
  gallonsSavedPerYear?: number;
  dollarSavingsPerYear?: number;
  energySavingsPerYear?: number;
  rebateAmount?: number;
  roi?: number;
  paybackPeriodYears?: number;
  efficiencyScore?: number;
}

export type AuditStatus = "draft" | "in_progress" | "completed" | "reviewed";

/** Flattened shape for the audit log table — one row per real `audits` record. */
export interface AuditListRow {
  id: string;
  homeId: string;
  address: string;
  homeownerName: string;
  builder: string;
  neighborhood: string;
  auditorName: string;
  auditDate: string;
  status: AuditStatus;
  dollarSavingsPerYear: number;
  efficiencyScore: number;
}

export type PhotoCategory =
  | "front_yard"
  | "backyard"
  | "irrigation_controller"
  | "sprinklers"
  | "leaks"
  | "toilets"
  | "showerheads"
  | "faucets"
  | "misc";

export interface AuditPhoto {
  id: string;
  auditId: string;
  category: PhotoCategory;
  storagePath: string;
  caption?: string;
  createdAt: string;
}

export interface Community {
  id: string;
  name: string;
  slug: string;
  goalHomes: number | null;
  createdAt: string;
}

export type UserRole = "admin" | "auditor" | "client";

export interface Audit {
  id: string;
  homeId: string | null;
  address: string;
  homeownerName: string | null;
  homeownerEmail: string | null;
  homeownerPhone: string | null;
  builder: string | null;
  neighborhood: string | null;
  lotNumber: string | null;
  communityId: string | null;
  auditorId: string | null;
  auditorName?: string | null;
  auditDate: string;
  status: AuditStatus;
  exterior: ExteriorAudit;
  interior: InteriorAudit;
  recommendations: Recommendation[];
  calculations: AuditCalculations;
  notes: string | null;
  pdfUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  waterCostPerGallon: number;
  energyCostPerKwh: number;
  rebateToilet: number;
  rebateShowerhead: number;
  rebateSmartController: number;
  rebateFaucetAerator: number;
  companyLogoUrl: string | null;
}
