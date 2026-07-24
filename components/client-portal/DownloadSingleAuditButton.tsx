"use client";

import { DownloadPdfButton } from "@/components/reports/DownloadPdfButton";
import type { AuditReportInput } from "@/components/reports/AuditReportDocument";

export function DownloadSingleAuditButton({
  audit,
  auditorName,
}: {
  audit: AuditReportInput;
  auditorName?: string | null;
}) {
  const fileName = `ecowise-audit-${audit.address.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.pdf`;

  return (
    <DownloadPdfButton
      fileName={fileName}
      variant="ghost"
      size="icon-sm"
      buildDocument={async () => {
        const { AuditReportDocument } = await import("@/components/reports/AuditReportDocument");
        return (
          <AuditReportDocument
            audit={audit}
            auditorName={auditorName}
            logoUrl={`${window.location.origin}/logo/ecowise-logo.png`}
          />
        );
      }}
    >
      <span className="sr-only">Download PDF</span>
    </DownloadPdfButton>
  );
}
