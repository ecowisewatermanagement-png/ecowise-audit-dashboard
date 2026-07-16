"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { calculateAudit } from "@/lib/calculations/water-savings";
import {
  homeInfoSchema,
  exteriorSchema,
  interiorSchema,
  recommendationSchema,
  type HomeInfoInput,
  type ExteriorInput,
  type InteriorInput,
  type RecommendationInput,
} from "@/lib/validations/audit";
import type { AuditStatus } from "@/types/audit";
import { z } from "zod";

type ActionResult = { success: true } | { success: false; message: string };

export async function createAudit(input: HomeInfoInput) {
  const values = homeInfoSchema.parse(input);
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("audits")
    .insert({
      address: values.address,
      community_id: values.communityId,
      home_id: values.homeId || null,
      homeowner_name: values.homeownerName || null,
      homeowner_email: values.homeownerEmail || null,
      homeowner_phone: values.homeownerPhone || null,
      builder: values.builder || null,
      neighborhood: values.neighborhood || null,
      lot_number: values.lotNumber || null,
      audit_date: values.auditDate,
      auditor_id: user.id,
      status: "in_progress",
    })
    .select("id")
    .single();

  if (error || !data) {
    return { success: false as const, message: error?.message ?? "Could not create audit" };
  }

  revalidatePath("/audits");
  return { success: true as const, id: data.id as string };
}

export async function updateHomeInfo(
  id: string,
  input: HomeInfoInput
): Promise<ActionResult> {
  const values = homeInfoSchema.parse(input);
  const supabase = await createClient();
  const { error } = await supabase
    .from("audits")
    .update({
      address: values.address,
      community_id: values.communityId,
      home_id: values.homeId || null,
      homeowner_name: values.homeownerName || null,
      homeowner_email: values.homeownerEmail || null,
      homeowner_phone: values.homeownerPhone || null,
      builder: values.builder || null,
      neighborhood: values.neighborhood || null,
      lot_number: values.lotNumber || null,
      audit_date: values.auditDate,
    })
    .eq("id", id);

  if (error) return { success: false, message: error.message };
  revalidatePath(`/audits/${id}`);
  revalidatePath("/audits");
  return { success: true };
}

export async function updateExterior(
  id: string,
  input: ExteriorInput
): Promise<ActionResult> {
  const values = exteriorSchema.parse(input);
  const supabase = await createClient();
  const { error } = await supabase
    .from("audits")
    .update({ exterior: values })
    .eq("id", id);

  if (error) return { success: false, message: error.message };
  revalidatePath(`/audits/${id}`);
  return { success: true };
}

export async function updateInterior(
  id: string,
  input: InteriorInput
): Promise<ActionResult> {
  const values = interiorSchema.parse(input);
  const supabase = await createClient();
  const { error } = await supabase
    .from("audits")
    .update({ interior: values })
    .eq("id", id);

  if (error) return { success: false, message: error.message };
  revalidatePath(`/audits/${id}`);
  return { success: true };
}

export async function updateRecommendations(
  id: string,
  input: RecommendationInput[]
): Promise<ActionResult> {
  const values = z.array(recommendationSchema).parse(input);
  const supabase = await createClient();
  const { error } = await supabase
    .from("audits")
    .update({ recommendations: values })
    .eq("id", id);

  if (error) return { success: false, message: error.message };
  revalidatePath(`/audits/${id}`);
  return { success: true };
}

/** Recomputes calculations from the audit's current exterior/interior/recommendations and persists them. */
export async function recalculateAudit(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const [{ data: audit, error: fetchError }, { data: settings }] = await Promise.all([
    supabase
      .from("audits")
      .select("exterior, interior, recommendations")
      .eq("id", id)
      .single(),
    supabase.from("settings").select("water_cost_per_gallon").eq("id", true).single(),
  ]);

  if (fetchError || !audit) {
    return { success: false, message: fetchError?.message ?? "Audit not found" };
  }

  const calculations = calculateAudit(
    audit.exterior ?? {},
    audit.interior ?? {},
    audit.recommendations ?? [],
    { waterCostPerGallon: settings?.water_cost_per_gallon ?? 0.008 }
  );

  const { error } = await supabase
    .from("audits")
    .update({ calculations })
    .eq("id", id);

  if (error) return { success: false, message: error.message };
  revalidatePath(`/audits/${id}`);
  return { success: true };
}

export async function finalizeAudit(
  id: string,
  status: Extract<AuditStatus, "completed" | "reviewed">
): Promise<ActionResult> {
  await recalculateAudit(id);
  const supabase = await createClient();
  const { error } = await supabase.from("audits").update({ status }).eq("id", id);

  if (error) return { success: false, message: error.message };
  revalidatePath(`/audits/${id}`);
  revalidatePath("/audits");
  revalidatePath("/dashboard");
  return { success: true };
}

/** Admin-only — RLS also enforces this at the database level. */
export async function deleteAudit(id: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (user?.role !== "admin") {
    return { success: false, message: "Only admins can delete audits." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("audits").delete().eq("id", id);

  if (error) return { success: false, message: error.message };
  revalidatePath("/audits");
  revalidatePath("/dashboard");
  return { success: true };
}
