"use client";

import dynamic from "next/dynamic";
import { Card, CardContent } from "@/components/ui/card";
import type { Audit } from "@/types/audit";

const DownloadReportButton = dynamic(
  () => import("@/components/reports/DownloadReportButton"),
  { ssr: false }
);

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <Card className="gap-1 py-3">
      <CardContent className="px-3">
        <div className="text-xl font-semibold tabular-nums">{value}</div>
        <div className="text-muted-foreground text-xs">{label}</div>
      </CardContent>
    </Card>
  );
}

export function MyHomeSummary({
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
  const c = audit.calculations;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatBox label="Gallons saved / yr" value={c.gallonsSavedPerYear?.toLocaleString() ?? "—"} />
        <StatBox label="Dollar savings / yr" value={`$${c.dollarSavingsPerYear?.toLocaleString() ?? "—"}`} />
        <StatBox label="Rebate opportunity" value={`$${c.rebateAmount?.toLocaleString() ?? "—"}`} />
        <StatBox label="Efficiency score" value={`${c.efficiencyScore ?? "—"}/100`} />
      </div>

      <div>
        <DownloadReportButton audit={audit} auditorName={auditorName} />
      </div>
    </div>
  );
}
