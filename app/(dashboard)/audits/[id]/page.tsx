import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { AuditWizard } from "@/components/audit/wizard/AuditWizard";
import { WIZARD_STEPS, type WizardStep } from "@/components/audit/wizard/types";
import type { HomeInfoInput } from "@/lib/validations/audit";

export const metadata: Metadata = { title: "Edit Audit" };

export default async function AuditDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ step?: string }>;
}) {
  const { id } = await params;
  const { step: stepParam } = await searchParams;
  const [user, supabase] = await Promise.all([getCurrentUser(), createClient()]);

  const [{ data: audit }, { data: templates }, { data: settings }, { data: communities }] =
    await Promise.all([
      supabase.from("audits").select("*").eq("id", id).single(),
      supabase.from("recommendation_templates").select("*").order("category"),
      supabase.from("settings").select("water_cost_per_gallon").eq("id", true).single(),
      supabase.from("communities").select("id, name").order("name"),
    ]);

  if (!audit) notFound();

  const canEdit = user?.role === "admin" || audit.auditor_id === user?.id;

  const homeInfo: HomeInfoInput = {
    address: audit.address,
    communityId: audit.community_id ?? "",
    homeId: audit.home_id ?? "",
    homeownerName: audit.homeowner_name ?? "",
    homeownerEmail: audit.homeowner_email ?? "",
    homeownerPhone: audit.homeowner_phone ?? "",
    builder: audit.builder ?? "",
    neighborhood: audit.neighborhood ?? "",
    lotNumber: audit.lot_number ?? "",
    auditDate: audit.audit_date,
  };

  const initialStep: WizardStep = WIZARD_STEPS.includes(stepParam as WizardStep)
    ? (stepParam as WizardStep)
    : "home";

  if (!canEdit) {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">{audit.address}</h1>
        <p className="text-muted-foreground text-sm">
          This audit belongs to another auditor — you can view it from the
          audit log but only its owner or an admin can edit it.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{audit.address}</h1>
        <p className="text-muted-foreground text-sm">
          Home ID: {audit.home_id ?? "—"} · Status:{" "}
          <span className="capitalize">{audit.status.replace("_", " ")}</span>
        </p>
      </div>

      <AuditWizard
        initialId={audit.id}
        initialStep={initialStep}
        homeInfo={homeInfo}
        exterior={audit.exterior ?? {}}
        interior={audit.interior ?? {}}
        recommendations={audit.recommendations ?? []}
        templates={templates ?? []}
        communities={communities ?? []}
        waterCostPerGallon={settings?.water_cost_per_gallon ?? 0.008}
        auditorName={user?.fullName ?? user?.email}
      />
    </div>
  );
}
