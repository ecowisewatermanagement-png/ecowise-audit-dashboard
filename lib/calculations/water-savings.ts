import type {
  AppSettings,
  AuditCalculations,
  ExteriorAudit,
  InteriorAudit,
  Recommendation,
} from "@/types/audit";
import {
  WATERSENSE_TOILET_GPF,
  WATERSENSE_SHOWERHEAD_GPM,
  WATERSENSE_BATH_FAUCET_GPM,
  WATERSENSE_KITCHEN_FAUCET_GPM,
  FLUSHES_PER_TOILET_PER_DAY,
  SHOWER_MINUTES_PER_SHOWERHEAD_PER_DAY,
  BATH_FAUCET_MINUTES_PER_DAY,
  KITCHEN_FAUCET_MINUTES_PER_DAY,
  LEAK_GALLONS_PER_DAY,
  IRRIGATION_GALLONS_PER_SQFT_PER_YEAR,
  SMART_CONTROLLER_SAVINGS_RATE,
  OVERSPRAY_RUNOFF_WASTE_GALLONS_PER_YEAR,
  GALLONS_WASTED_PER_BROKEN_HEAD_PER_YEAR,
  ENERGY_KWH_PER_HOT_GALLON,
  KITCHEN_FAUCET_HOT_WATER_FRACTION,
  BATH_FAUCET_HOT_WATER_FRACTION,
} from "./constants";

interface GallonsBreakdown {
  toilets: number;
  showerheads: number;
  bathFaucets: number;
  kitchenFaucet: number;
  leaks: number;
  irrigationController: number;
  irrigationWaste: number;
  total: number;
}

/** Estimated annual gallons saved per fixture category if brought up to WaterSense standard. */
export function calculateGallonsSaved(
  exterior: ExteriorAudit,
  interior: InteriorAudit
): GallonsBreakdown {
  const toilets =
    interior.toiletCount && interior.toiletFlushVolumeGal
      ? Math.max(0, interior.toiletFlushVolumeGal - WATERSENSE_TOILET_GPF) *
        FLUSHES_PER_TOILET_PER_DAY *
        365 *
        interior.toiletCount
      : 0;

  const showerheads =
    interior.showerheadCount && interior.showerheadFlowRateGpm
      ? Math.max(0, interior.showerheadFlowRateGpm - WATERSENSE_SHOWERHEAD_GPM) *
        SHOWER_MINUTES_PER_SHOWERHEAD_PER_DAY *
        365 *
        interior.showerheadCount
      : 0;

  const bathFaucets =
    interior.bathroomFaucetCount && interior.bathroomFaucetFlowRateGpm
      ? Math.max(0, interior.bathroomFaucetFlowRateGpm - WATERSENSE_BATH_FAUCET_GPM) *
        BATH_FAUCET_MINUTES_PER_DAY *
        365 *
        interior.bathroomFaucetCount
      : 0;

  const kitchenFaucet = interior.kitchenFaucetFlowRateGpm
    ? Math.max(0, interior.kitchenFaucetFlowRateGpm - WATERSENSE_KITCHEN_FAUCET_GPM) *
      KITCHEN_FAUCET_MINUTES_PER_DAY *
      365
    : 0;

  const leaks =
    (interior.hasToiletLeaks ? LEAK_GALLONS_PER_DAY.toilet * 365 : 0) +
    (interior.hasFaucetLeaks ? LEAK_GALLONS_PER_DAY.faucet * 365 : 0) +
    (interior.hasShowerLeaks ? LEAK_GALLONS_PER_DAY.shower * 365 : 0);

  const irrigationUse =
    (exterior.irrigatedAreaSqFt ?? 0) * IRRIGATION_GALLONS_PER_SQFT_PER_YEAR;

  const irrigationController =
    exterior.hasIrrigationController && !exterior.isSmartController
      ? irrigationUse * SMART_CONTROLLER_SAVINGS_RATE
      : 0;

  const irrigationWaste =
    (exterior.hasOverspray ? OVERSPRAY_RUNOFF_WASTE_GALLONS_PER_YEAR : 0) +
    (exterior.hasRunoff ? OVERSPRAY_RUNOFF_WASTE_GALLONS_PER_YEAR : 0) +
    (exterior.brokenHeadCount
      ? exterior.brokenHeadCount * GALLONS_WASTED_PER_BROKEN_HEAD_PER_YEAR
      : 0);

  const total =
    toilets +
    showerheads +
    bathFaucets +
    kitchenFaucet +
    leaks +
    irrigationController +
    irrigationWaste;

  return {
    toilets,
    showerheads,
    bathFaucets,
    kitchenFaucet,
    leaks,
    irrigationController,
    irrigationWaste,
    total,
  };
}

export function calculateDollarSavings(
  gallonsSavedPerYear: number,
  waterCostPerGallon: number
): number {
  return gallonsSavedPerYear * waterCostPerGallon;
}

/** Energy saved from heating less hot water (showerheads + a hot-water fraction of faucets). */
export function calculateEnergySavings(
  breakdown: GallonsBreakdown
): number {
  const hotGallonsSaved =
    breakdown.showerheads +
    breakdown.bathFaucets * BATH_FAUCET_HOT_WATER_FRACTION +
    breakdown.kitchenFaucet * KITCHEN_FAUCET_HOT_WATER_FRACTION;

  return hotGallonsSaved * ENERGY_KWH_PER_HOT_GALLON;
}

export function calculateRebateTotal(
  recommendations: Recommendation[]
): number {
  return recommendations.reduce((sum, r) => sum + (r.rebateAmount ?? 0), 0);
}

export function calculateROI(
  annualDollarSavings: number,
  rebateAmount: number,
  totalCost: number
): number | undefined {
  if (!totalCost) return undefined;
  return (annualDollarSavings + rebateAmount - totalCost) / totalCost;
}

export function calculatePaybackPeriod(
  totalCost: number,
  rebateAmount: number,
  annualDollarSavings: number
): number | undefined {
  if (!annualDollarSavings) return undefined;
  const netCost = Math.max(0, totalCost - rebateAmount);
  return netCost / annualDollarSavings;
}

/**
 * Weighted 0–100 score: starts at 100, deducts for each inefficient fixture
 * or unresolved issue found. Deduction weights are illustrative — revisit
 * once EcoWise's engineers have a preferred scoring rubric.
 */
export function calculateEfficiencyScore(
  exterior: ExteriorAudit,
  interior: InteriorAudit
): number {
  let score = 100;

  if (interior.toiletFlushVolumeGal && interior.toiletFlushVolumeGal > WATERSENSE_TOILET_GPF) {
    const overBy = interior.toiletFlushVolumeGal - WATERSENSE_TOILET_GPF;
    score -= Math.min(15, overBy * 8);
  }
  if (
    interior.showerheadFlowRateGpm &&
    interior.showerheadFlowRateGpm > WATERSENSE_SHOWERHEAD_GPM
  ) {
    const overBy = interior.showerheadFlowRateGpm - WATERSENSE_SHOWERHEAD_GPM;
    score -= Math.min(15, overBy * 6);
  }
  if (
    interior.bathroomFaucetFlowRateGpm &&
    interior.bathroomFaucetFlowRateGpm > WATERSENSE_BATH_FAUCET_GPM
  ) {
    score -= 5;
  }
  if (
    interior.kitchenFaucetFlowRateGpm &&
    interior.kitchenFaucetFlowRateGpm > WATERSENSE_KITCHEN_FAUCET_GPM
  ) {
    score -= 5;
  }

  if (exterior.hasIrrigationController && !exterior.isSmartController) score -= 10;
  if (exterior.hasIrrigationController && !exterior.hasRainSensor) score -= 5;

  if (interior.hasToiletLeaks) score -= 7;
  if (interior.hasFaucetLeaks) score -= 5;
  if (interior.hasShowerLeaks) score -= 5;
  if (exterior.hasLeaks) score -= 5;

  if (exterior.hasOverspray) score -= 5;
  if (exterior.hasRunoff) score -= 5;
  if (exterior.brokenHeadCount) score -= Math.min(10, exterior.brokenHeadCount * 2);

  if (interior.hasHighEfficiencyWasher === false) score -= 5;
  if (interior.isDishwasherWaterEfficient === false) score -= 3;

  return Math.max(0, Math.min(100, Math.round(score)));
}

/** Runs the full calculation pipeline for one audit and returns the result to persist. */
export function calculateAudit(
  exterior: ExteriorAudit,
  interior: InteriorAudit,
  recommendations: Recommendation[],
  settings: Pick<AppSettings, "waterCostPerGallon">
): AuditCalculations {
  const breakdown = calculateGallonsSaved(exterior, interior);
  const dollarSavingsPerYear = calculateDollarSavings(
    breakdown.total,
    settings.waterCostPerGallon
  );
  const energySavingsPerYear = calculateEnergySavings(breakdown);
  const rebateAmount = calculateRebateTotal(recommendations);
  const totalCost = recommendations.reduce(
    (sum, r) => sum + (r.estimatedCost ?? 0),
    0
  );

  return {
    gallonsSavedPerYear: Math.round(breakdown.total),
    dollarSavingsPerYear: Math.round(dollarSavingsPerYear * 100) / 100,
    energySavingsPerYear: Math.round(energySavingsPerYear),
    rebateAmount: Math.round(rebateAmount * 100) / 100,
    roi: calculateROI(dollarSavingsPerYear, rebateAmount, totalCost),
    paybackPeriodYears: calculatePaybackPeriod(
      totalCost,
      rebateAmount,
      dollarSavingsPerYear
    ),
    efficiencyScore: calculateEfficiencyScore(exterior, interior),
  };
}
