import type { Metadata } from "next";
import { Home } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { MyHomeSummary } from "@/components/client-portal/MyHomeSummary";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "My Home" };

export default async function MyHomePage() {
  const user = await getCurrentUser();
  const supabase = await createClient();

  const { data: audit } = await supabase
    .from("audits")
    .select("*")
    .ilike("homeowner_email", user!.email ?? "")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!audit) {
    return (
      <Empty className="rounded-lg border bg-card py-12">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Home />
          </EmptyMedia>
          <EmptyTitle>No audit found yet</EmptyTitle>
          <EmptyDescription>
            We haven&apos;t matched an audit to your account
            ({user?.email}) yet. Once EcoWise audits your home using this
            email address, it&apos;ll show up here automatically.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

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
      <div>
        <h1 className="text-2xl font-semibold">{audit.address}</h1>
        <p className="text-muted-foreground text-sm">
          Audited {audit.audit_date} by {auditorName ?? "an EcoWise auditor"}
        </p>
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
        <Empty className="rounded-lg border bg-card py-12">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Home />
            </EmptyMedia>
            <EmptyTitle>Audit in progress</EmptyTitle>
            <EmptyDescription>
              Your auditor is still working through this one — check back
              once it&apos;s complete.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
}
