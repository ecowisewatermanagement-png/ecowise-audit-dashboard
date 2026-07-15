import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { AuditWizard } from "@/components/audit/wizard/AuditWizard";
import { ComingSoon } from "@/components/dashboard/ComingSoon";

export const metadata: Metadata = { title: "New Audit" };

export default async function NewAuditPage() {
  const [user, supabase] = await Promise.all([getCurrentUser(), createClient()]);
  const [{ data: templates }, { data: settings }, { data: communities }] = await Promise.all([
    supabase.from("recommendation_templates").select("*").order("category"),
    supabase.from("settings").select("water_cost_per_gallon").eq("id", true).single(),
    supabase.from("communities").select("id, name").order("name"),
  ]);

  if (!communities || communities.length === 0) {
    return (
      <ComingSoon
        title="Add a community first"
        description="Every audit needs to be tagged with a community. Ask an admin to add one from the Communities page."
        backHref="/audits"
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">New audit</h1>
        <p className="text-muted-foreground text-sm">
          Start with the home&apos;s basic information — the rest autosaves as
          you go.
        </p>
      </div>

      <AuditWizard
        initialId={null}
        templates={templates ?? []}
        communities={communities ?? []}
        waterCostPerGallon={settings?.water_cost_per_gallon ?? 0.008}
        auditorName={user?.fullName ?? user?.email}
      />
    </div>
  );
}
