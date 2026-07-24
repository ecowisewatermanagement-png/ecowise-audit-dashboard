import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AuditStatusBadge } from "@/components/audit/AuditStatusBadge";
import { CommunitySwitcher } from "@/components/client-portal/CommunitySwitcher";
import { DownloadAllAuditsButton } from "@/components/client-portal/DownloadAllAuditsButton";
import { DownloadSingleAuditButton } from "@/components/client-portal/DownloadSingleAuditButton";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Community Audits" };

export default async function CommunityAuditsPage({
  searchParams,
}: {
  searchParams: Promise<{ community?: string }>;
}) {
  const { community: communityParam } = await searchParams;
  const user = await getCurrentUser();
  if (user?.clientType !== "hoa_director") redirect("/community");

  const supabase = await createClient();
  const { data: access } = await supabase
    .from("community_access")
    .select("community_id")
    .eq("user_id", user.id);

  const communityIds = (access ?? []).map((a) => a.community_id);
  const { data: communities } = communityIds.length
    ? await supabase.from("communities").select("id, name").in("id", communityIds).order("name")
    : { data: [] };

  if (!communities || communities.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No community access yet — reach out to your EcoWise contact.
      </p>
    );
  }

  const selected = communities.find((c) => c.id === communityParam) ?? communities[0];

  const { data: audits } = await supabase
    .from("audits")
    .select(
      "id, address, home_id, homeowner_name, audit_date, status, calculations, exterior, interior, recommendations, auditor_id"
    )
    .eq("community_id", selected.id)
    .order("audit_date", { ascending: false });

  const auditorIds = [
    ...new Set((audits ?? []).map((a) => a.auditor_id).filter((id): id is string => id !== null)),
  ];
  const { data: profiles } = auditorIds.length
    ? await supabase.from("profiles").select("id, full_name").in("id", auditorIds)
    : { data: [] };
  const auditorNameById = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));

  const finishedAudits = (audits ?? [])
    .filter((a) => a.status === "completed" || a.status === "reviewed")
    .map((a) => ({
      id: a.id,
      address: a.address,
      homeownerName: a.homeowner_name,
      auditDate: a.audit_date,
      exterior: a.exterior,
      interior: a.interior,
      recommendations: a.recommendations,
      calculations: a.calculations,
      auditorName: a.auditor_id ? auditorNameById.get(a.auditor_id) : null,
    }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{selected.name} — all audits</h1>
          <p className="text-muted-foreground text-sm">
            Every home audited in your community.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CommunitySwitcher
            communities={communities.map((c) => ({ id: c.id, name: c.name }))}
            selectedId={selected.id}
          />
          {finishedAudits.length > 0 && (
            <DownloadAllAuditsButton communityName={selected.name} audits={finishedAudits} />
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Address</TableHead>
              <TableHead>Homeowner</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Savings</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {(audits ?? []).map((audit) => {
              const isFinished = audit.status === "completed" || audit.status === "reviewed";
              return (
                <TableRow key={audit.id}>
                  <TableCell className="font-medium">
                    <Link href={`/community/audits/${audit.id}`} className="hover:underline">
                      {audit.address}
                    </Link>
                    <div className="text-muted-foreground text-xs">{audit.home_id}</div>
                  </TableCell>
                  <TableCell>{audit.homeowner_name ?? "—"}</TableCell>
                  <TableCell>{audit.audit_date}</TableCell>
                  <TableCell>
                    {audit.calculations?.dollarSavingsPerYear
                      ? `$${audit.calculations.dollarSavingsPerYear.toLocaleString()}`
                      : "—"}
                  </TableCell>
                  <TableCell>{audit.calculations?.efficiencyScore ?? "—"}</TableCell>
                  <TableCell>
                    <AuditStatusBadge status={audit.status} />
                  </TableCell>
                  <TableCell>
                    {isFinished && (
                      <DownloadSingleAuditButton
                        audit={{
                          address: audit.address,
                          homeownerName: audit.homeowner_name,
                          auditDate: audit.audit_date,
                          exterior: audit.exterior,
                          interior: audit.interior,
                          recommendations: audit.recommendations,
                          calculations: audit.calculations,
                        }}
                        auditorName={audit.auditor_id ? auditorNameById.get(audit.auditor_id) : null}
                      />
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {(audits ?? []).length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-muted-foreground py-8 text-center">
                  No audits recorded for this community yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
