"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { settingsSchema, type SettingsInput } from "@/lib/validations/settings";

export async function updateSettings(input: SettingsInput) {
  const values = settingsSchema.parse(input);
  const supabase = await createClient();

  const { error } = await supabase
    .from("settings")
    .update(values)
    .eq("id", true);

  if (error) {
    return { success: false as const, message: error.message };
  }

  revalidatePath("/settings");
  return { success: true as const };
}
