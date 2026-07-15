import type { Metadata } from "next";
import { ComingSoon } from "@/components/dashboard/ComingSoon";

export const metadata: Metadata = { title: "Audit Detail" };

export default function AuditDetailPage() {
  return (
    <ComingSoon
      title="Audit detail & report"
      description="Viewing full audit details, editing, duplicating, and generating the homeowner PDF report will land with the intake workflow."
    />
  );
}
