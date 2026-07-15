import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { AuditStatusBadge } from "@/components/audit/AuditStatusBadge";
import { MyHomeSummary } from "@/components/client-portal/MyHomeSummary";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Audit Detail" };

export default async function CommunityAuditDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (user?.clientType !== "hoa_director") redirect("/community");

  const supabase = await createClient();
  const { data: audit } = await supabase.from("audits").select("*").eq("id", id).single();
  if (!audit) notFound();

  let auditorName: string | null = null;
  if (audit.auditor_id) {
    const { data: auditor } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", audit.auditor_id)
      .single();
    auditorName = auditor?.full_name ?? null;
  }

  const isFinished = audit.status === "completed" || audit.status === "reviewed";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{audit.address}</h1>
          <p className="text-muted-foreground text-sm">
            {audit.homeowner_name ?? "Homeowner not on file"} · Audited{" "}
            {audit.audit_date} by {auditorName ?? "an EcoWise auditor"}
          </p>
        </div>
        <AuditStatusBadge status={audit.status} />
      </div>

      {isFinished ? (
        <MyHomeSummary
          audit={{
            address: audit.address,
            homeownerName: audit.homeowner_name,
            auditDate: audit.audit_date,
            exterior: audit.exterior,
            interior: audit.interior,
            recommendations: audit.recommendations,
            calculations: audit.calculations,
          }}
          auditorName={auditorName}
        />
      ) : (
        <p className="text-muted-foreground text-sm">
          This audit is still in progress — check back once it&apos;s
          complete.
        </p>
      )}
    </div>
  );
}
