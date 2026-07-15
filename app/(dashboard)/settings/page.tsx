import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SettingsForm } from "@/components/settings/SettingsForm";
import { ComingSoon } from "@/components/dashboard/ComingSoon";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const [user, supabase] = await Promise.all([getCurrentUser(), createClient()]);
  const { data: settings } = await supabase
    .from("settings")
    .select("*")
    .eq("id", true)
    .single();

  const initialValues = {
    water_cost_per_gallon: settings?.water_cost_per_gallon ?? 0.008,
    energy_cost_per_kwh: settings?.energy_cost_per_kwh ?? 0.14,
    rebate_toilet: settings?.rebate_toilet ?? 100,
    rebate_showerhead: settings?.rebate_showerhead ?? 20,
    rebate_smart_controller: settings?.rebate_smart_controller ?? 150,
    rebate_faucet_aerator: settings?.rebate_faucet_aerator ?? 10,
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground text-sm">
          Values used across every calculation and report.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Calculations</CardTitle>
          <CardDescription>
            Changing these updates savings estimates for future audits — past
            audits keep the values calculated at the time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SettingsForm
            initialValues={initialValues}
            isAdmin={user?.role === "admin"}
          />
        </CardContent>
      </Card>

      <ComingSoon
        title="Branding & recommendation templates"
        description="Company logo upload, PDF report branding, and the editable recommendation-template library are next up."
        backHref="/dashboard"
      />
    </div>
  );
}
