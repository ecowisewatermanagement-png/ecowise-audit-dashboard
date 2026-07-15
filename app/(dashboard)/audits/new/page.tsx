import type { Metadata } from "next";
import { ComingSoon } from "@/components/dashboard/ComingSoon";

export const metadata: Metadata = { title: "New Audit" };

export default function NewAuditPage() {
  return (
    <ComingSoon
      title="Audit intake workflow"
      description="The Home Info → Exterior → Interior → Recommendations → Review → Report step-by-step wizard (with autosave) is the next build phase."
    />
  );
}
