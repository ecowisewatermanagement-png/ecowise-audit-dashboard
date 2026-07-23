import { z } from "zod";

export const homeInfoSchema = z.object({
  address: z.string().min(1, "Address is required"),
  communityId: z.string().min(1, "Community is required"),
  homeId: z.string().optional(),
  homeownerName: z.string().optional(),
  homeownerEmail: z.string().email("Enter a valid email").optional().or(z.literal("")),
  homeownerPhone: z.string().optional(),
  builder: z.string().optional(),
  neighborhood: z.string().optional(),
  lotNumber: z.string().optional(),
  auditDate: z.string().min(1, "Audit date is required"),
});

export type HomeInfoInput = z.infer<typeof homeInfoSchema>;

export const exteriorSchema = z.object({
  irrigatedAreaSqFt: z.number().min(0).optional(),
  landscapeType: z.enum(["turf", "xeriscape", "mixed", "none"]).optional(),
  hasIrrigationController: z.boolean().optional(),
  controllerBrand: z.string().optional(),
  isSmartController: z.boolean().optional(),
  numberOfZones: z.number().min(0).optional(),
  sprinklerType: z.enum(["spray", "rotor", "drip", "mixed"]).optional(),
  hasDripSystem: z.boolean().optional(),
  staticPsi: z.number().min(0).optional(),
  hasRainSensor: z.boolean().optional(),
  hasOverspray: z.boolean().optional(),
  hasRunoff: z.boolean().optional(),
  hasLeaks: z.boolean().optional(),
  brokenHeadCount: z.number().min(0).optional(),
  hasPool: z.boolean().optional(),
  poolGallons: z.number().min(0).optional(),
  poolGallonsUsedPerYear: z.number().min(0).optional(),
  hasSpa: z.boolean().optional(),
  spaGallons: z.number().min(0).optional(),
  spaGallonsUsedPerYear: z.number().min(0).optional(),
  notes: z.string().optional(),
});

export type ExteriorInput = z.infer<typeof exteriorSchema>;

export const interiorSchema = z.object({
  bathroomCount: z.number().min(0).optional(),
  showerheadCount: z.number().min(0).optional(),
  showerheadFlowRateGpm: z.number().min(0).optional(),
  toiletCount: z.number().min(0).optional(),
  toiletFlushVolumeGal: z.number().min(0).optional(),
  bathroomFaucetCount: z.number().min(0).optional(),
  bathroomFaucetFlowRateGpm: z.number().min(0).optional(),
  kitchenFaucetFlowRateGpm: z.number().min(0).optional(),
  hasHighEfficiencyWasher: z.boolean().optional(),
  hasDishwasher: z.boolean().optional(),
  isDishwasherWaterEfficient: z.boolean().optional(),
  hasToiletLeaks: z.boolean().optional(),
  hasFaucetLeaks: z.boolean().optional(),
  hasShowerLeaks: z.boolean().optional(),
  hasHotWaterRecirculation: z.boolean().optional(),
  notes: z.string().optional(),
});

export type InteriorInput = z.infer<typeof interiorSchema>;

export const recommendationSchema = z.object({
  id: z.string(),
  templateId: z.string().optional(),
  title: z.string().min(1),
  category: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]),
  estimatedGallonsSavedPerYear: z.number().min(0).optional(),
  estimatedCost: z.number().min(0).optional(),
  rebateAmount: z.number().min(0).optional(),
});

export type RecommendationInput = z.infer<typeof recommendationSchema>;
