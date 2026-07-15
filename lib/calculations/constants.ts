// EPA WaterSense fixture thresholds and typical usage assumptions used to
// estimate savings from an audit. These are reasonable industry defaults,
// not site-specific engineering figures — tune WATER_COST / rebate amounts
// per district from Settings; tune the usage assumptions here if EcoWise's
// engineers want climate- or district-specific figures instead.

export const WATERSENSE_TOILET_GPF = 1.28;
export const WATERSENSE_SHOWERHEAD_GPM = 2.0;
export const WATERSENSE_BATH_FAUCET_GPM = 1.5;
export const WATERSENSE_KITCHEN_FAUCET_GPM = 1.8;

export const FLUSHES_PER_TOILET_PER_DAY = 5;
export const SHOWER_MINUTES_PER_SHOWERHEAD_PER_DAY = 7.8;
export const BATH_FAUCET_MINUTES_PER_DAY = 4;
export const KITCHEN_FAUCET_MINUTES_PER_DAY = 8;

// EPA "Fix a Leak Week" typical (not worst-case) household leak rates.
export const LEAK_GALLONS_PER_DAY = {
  toilet: 20,
  faucet: 8,
  shower: 10,
} as const;

// Rough, climate-agnostic irrigation benchmarks.
export const IRRIGATION_GALLONS_PER_SQFT_PER_YEAR = 15;
export const SMART_CONTROLLER_SAVINGS_RATE = 0.15; // 15% of irrigation use
export const OVERSPRAY_RUNOFF_WASTE_GALLONS_PER_YEAR = 2000;
export const GALLONS_WASTED_PER_BROKEN_HEAD_PER_YEAR = 1500;

// Water heating energy: kWh needed to heat one gallon ~70°F with a
// standard-efficiency water heater.
export const ENERGY_KWH_PER_HOT_GALLON = 0.0142;
export const KITCHEN_FAUCET_HOT_WATER_FRACTION = 0.5;
export const BATH_FAUCET_HOT_WATER_FRACTION = 0.5;
