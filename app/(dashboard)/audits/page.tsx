import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuditTable } from "@/components/audit/AuditTable";

export const metadata: Metadata = { title: "Audits" };

// TODO(data): replace MOCK_AUDITS (in AuditTable) with a paginated Supabase
// query against the `audits` table once the intake workflow writes real rows.
export default function AuditsPage() {
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

      <AuditTable />
    </div>
  );
}
