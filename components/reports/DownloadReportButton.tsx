"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuditReportDocument } from "./AuditReportDocument";
import type { Audit } from "@/types/audit";

export default function DownloadReportButton({
  audit,
  auditorName,
}: {
  audit: Pick<
    Audit,
    | "address"
    | "homeownerName"
    | "auditDate"
    | "exterior"
    | "interior"
    | "recommendations"
    | "calculations"
  >;
  auditorName?: string | null;
}) {
  const fileName = `ecowise-audit-${audit.address.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.pdf`;

  return (
    <PDFDownloadLink
      document={
        <AuditReportDocument
          audit={audit}
          auditorName={auditorName}
          logoUrl={typeof window !== "undefined" ? `${window.location.origin}/logo/ecowise-logo.png` : ""}
        />
      }
      fileName={fileName}
    >
      {({ loading }) => (
        <Button type="button" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : <Download />}
          {loading ? "Preparing report…" : "Download PDF report"}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
