import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuditTable } from "@/components/audit/AuditTable";
import { createClient } from "@/lib/supabase/server";
import type { AuditListRow } from "@/types/audit";

export const metadata: Metadata = { title: "Audits" };

export default async function AuditsPage() {
  const supabase = await createClient();

  const { data: audits } = await supabase
    .from("audits")
    .select(
      "id, home_id, address, homeowner_name, builder, neighborhood, auditor_id, audit_date, status, calculations"
    )
    .order("created_at", { ascending: false });

  const auditorIds = [
    ...new Set(
      (audits ?? [])
        .map((a) => a.auditor_id)
        .filter((id): id is string => id !== null)
    ),
  ];
  const { data: profiles } = auditorIds.length
    ? await supabase.from("profiles").select("id, full_name, email").in("id", auditorIds)
    : { data: [] };
  const auditorNameById = new Map(
    (profiles ?? []).map((p) => [p.id, p.full_name ?? p.email ?? "—"])
  );

  const rows: AuditListRow[] = (audits ?? []).map((a) => ({
    id: a.id,
    homeId: a.home_id ?? "—",
    address: a.address,
    homeownerName: a.homeowner_name ?? "—",
    builder: a.builder ?? "—",
    neighborhood: a.neighborhood ?? "—",
    auditorName: a.auditor_id ? (auditorNameById.get(a.auditor_id) ?? "—") : "—",
    auditDate: a.audit_date,
    status: a.status,
    dollarSavingsPerYear: a.calculations?.dollarSavingsPerYear ?? 0,
    efficiencyScore: a.calculations?.efficiencyScore ?? 0,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Audit log</h1>
          <p className="text-muted-foreground text-sm">
            Search, filter, and manage every home audit.
          </p>
        </div>
        <Button render={<Link href="/audits/new" />}>
          <Plus />
          New audit
        </Button>
      </div>

      <AuditTable audits={rows} />
    </div>
  );
}
