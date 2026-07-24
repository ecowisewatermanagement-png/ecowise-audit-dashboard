"use client";

import { DownloadPdfButton } from "@/components/reports/DownloadPdfButton";
import type { AuditReportInput } from "@/components/reports/AuditReportDocument";

export function DownloadAllAuditsButton({
  communityName,
  audits,
}: {
  communityName: string;
  audits: (AuditReportInput & { id: string; auditorName?: string | null })[];
}) {
  const fileName = `ecowise-audits-${communityName.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.pdf`;

  return (
    <DownloadPdfButton
      fileName={fileName}
      buildDocument={async () => {
        const { CommunityAuditsBundleDocument } = await import("@/components/reports/AuditReportDocument");
        return (
          <CommunityAuditsBundleDocument
            audits={audits}
            logoUrl={`${window.location.origin}/logo/ecowise-logo.png`}
          />
        );
      }}
    >
      Download all {audits.length} audits (PDF)
    </DownloadPdfButton>
  );
}
