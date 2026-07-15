import { z } from "zod";

export const settingsSchema = z.object({
  water_cost_per_gallon: z.number().min(0),
  energy_cost_per_kwh: z.number().min(0),
  rebate_toilet: z.number().min(0),
  rebate_showerhead: z.number().min(0),
  rebate_smart_controller: z.number().min(0),
  rebate_faucet_aerator: z.number().min(0),
});

export type SettingsInput = z.infer<typeof settingsSchema>;
