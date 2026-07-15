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
    .select("id, address, home_id, homeowner_name, audit_date, status, calculations")
    .eq("community_id", selected.id)
    .order("audit_date", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{selected.name} — all audits</h1>
          <p className="text-muted-foreground text-sm">
            Every home audited in your community.
          </p>
        </div>
        <CommunitySwitcher
          communities={communities.map((c) => ({ id: c.id, name: c.name }))}
          selectedId={selected.id}
        />
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {(audits ?? []).map((audit) => (
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
              </TableRow>
            ))}
            {(audits ?? []).length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground py-8 text-center">
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
