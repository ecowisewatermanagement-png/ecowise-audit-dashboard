"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { calculateAudit } from "@/lib/calculations/water-savings";
import { finalizeAudit } from "@/app/(dashboard)/audits/actions";
import type { ExteriorAudit, InteriorAudit, Recommendation } from "@/types/audit";
import type { HomeInfoInput } from "@/lib/validations/audit";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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

export function ReviewStep({
  auditId,
  homeInfo,
  exterior,
  interior,
  recommendations,
  waterCostPerGallon,
  auditorName,
}: {
  auditId: string;
  homeInfo: HomeInfoInput;
  exterior: ExteriorAudit;
  interior: InteriorAudit;
  recommendations: Recommendation[];
  waterCostPerGallon: number;
  auditorName?: string | null;
}) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const calculations = useMemo(
    () =>
      calculateAudit(exterior, interior, recommendations, {
        waterCostPerGallon,
      }),
    [exterior, interior, recommendations, waterCostPerGallon]
  );

  async function handleFinish() {
    setIsSaving(true);
    const result = await finalizeAudit(auditId, "reviewed");
    setIsSaving(false);
    if (!result.success) return toast.error(result.message);
    toast.success("Audit saved");
    router.push("/audits");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatBox label="Gallons saved / yr" value={calculations.gallonsSavedPerYear?.toLocaleString() ?? "—"} />
        <StatBox label="Dollar savings / yr" value={`$${calculations.dollarSavingsPerYear?.toLocaleString() ?? "—"}`} />
        <StatBox label="Rebate opportunity" value={`$${calculations.rebateAmount?.toLocaleString() ?? "—"}`} />
        <StatBox label="Efficiency score" value={`${calculations.efficiencyScore ?? "—"}/100`} />
        <StatBox label="Energy saved / yr" value={`${calculations.energySavingsPerYear?.toLocaleString() ?? "—"} kWh`} />
        <StatBox
          label="Payback period"
          value={calculations.paybackPeriodYears != null ? `${calculations.paybackPeriodYears.toFixed(1)} yrs` : "—"}
        />
        <StatBox
          label="ROI"
          value={calculations.roi != null ? `${Math.round(calculations.roi * 100)}%` : "—"}
        />
        <StatBox label="Recommendations" value={String(recommendations.length)} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <DownloadReportButton
          audit={{
            address: homeInfo.address,
            homeownerName: homeInfo.homeownerName || null,
            auditDate: homeInfo.auditDate,
            exterior,
            interior,
            recommendations,
            calculations,
          }}
          auditorName={auditorName}
        />
        <Button type="button" variant="outline" onClick={handleFinish} disabled={isSaving}>
          {isSaving ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
          Save & mark reviewed
        </Button>
      </div>
    </div>
  );
}
