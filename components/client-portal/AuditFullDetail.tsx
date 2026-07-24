import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ExteriorAudit, InteriorAudit, Recommendation } from "@/types/audit";

function DetailGrid({ items }: { items: [string, string][] }) {
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
      {items.map(([label, value]) => (
        <div key={label}>
          <dt className="text-muted-foreground text-xs uppercase">{label}</dt>
          <dd className="text-sm">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function exteriorItems(exterior: ExteriorAudit): [string, string][] {
  return [
    ["Irrigated area", exterior.irrigatedAreaSqFt ? `${exterior.irrigatedAreaSqFt} sq ft` : "—"],
    ["Landscape type", exterior.landscapeType ?? "—"],
    [
      "Irrigation controller",
      exterior.hasIrrigationController
        ? exterior.isSmartController
          ? "Smart controller"
          : "Standard timer"
        : "None",
    ],
    ["Sprinkler type", exterior.sprinklerType ?? "—"],
    ["Number of zones", exterior.numberOfZones ? String(exterior.numberOfZones) : "—"],
    ["Static PSI", exterior.staticPsi ? String(exterior.staticPsi) : "—"],
    ["Rain sensor", exterior.hasRainSensor ? "Yes" : "No"],
    [
      "Issues observed",
      [
        exterior.hasOverspray && "Overspray",
        exterior.hasRunoff && "Runoff",
        exterior.hasLeaks && "Leaks",
        exterior.brokenHeadCount ? `${exterior.brokenHeadCount} broken heads` : null,
      ]
        .filter(Boolean)
        .join(", ") || "None",
    ],
    [
      "Pool",
      exterior.hasPool
        ? [
            exterior.poolGallons ? `${exterior.poolGallons.toLocaleString()} gal capacity` : null,
            exterior.poolGallonsUsedPerYear
              ? `${exterior.poolGallonsUsedPerYear.toLocaleString()} gal/yr used`
              : null,
          ]
            .filter(Boolean)
            .join(", ") || "Yes"
        : "None",
    ],
    [
      "Spa",
      exterior.hasSpa
        ? [
            exterior.spaGallons ? `${exterior.spaGallons.toLocaleString()} gal capacity` : null,
            exterior.spaGallonsUsedPerYear
              ? `${exterior.spaGallonsUsedPerYear.toLocaleString()} gal/yr used`
              : null,
          ]
            .filter(Boolean)
            .join(", ") || "Yes"
        : "None",
    ],
  ];
}

function interiorItems(interior: InteriorAudit): [string, string][] {
  return [
    [
      "Toilets",
      interior.toiletCount
        ? `${interior.toiletCount} @ ${interior.toiletFlushVolumeGal ?? "?"} GPF`
        : "—",
    ],
    [
      "Showerheads",
      interior.showerheadCount
        ? `${interior.showerheadCount} @ ${interior.showerheadFlowRateGpm ?? "?"} GPM`
        : "—",
    ],
    [
      "Bathroom faucets",
      interior.bathroomFaucetCount
        ? `${interior.bathroomFaucetCount} @ ${interior.bathroomFaucetFlowRateGpm ?? "?"} GPM`
        : "—",
    ],
    ["Kitchen faucet", interior.kitchenFaucetFlowRateGpm ? `${interior.kitchenFaucetFlowRateGpm} GPM` : "—"],
    ["High-efficiency washer", interior.hasHighEfficiencyWasher ? "Yes" : "No"],
    ["Dishwasher", interior.hasDishwasher ? (interior.isDishwasherWaterEfficient ? "Yes (efficient)" : "Yes") : "No"],
    ["Hot water recirculation", interior.hasHotWaterRecirculation ? "Yes" : "No"],
    [
      "Leaks found",
      [interior.hasToiletLeaks && "Toilet", interior.hasFaucetLeaks && "Faucet", interior.hasShowerLeaks && "Shower"]
        .filter(Boolean)
        .join(", ") || "None",
    ],
  ];
}

const PRIORITY_VARIANT: Record<Recommendation["priority"], "default" | "secondary" | "outline"> = {
  high: "default",
  medium: "secondary",
  low: "outline",
};

export function AuditFullDetail({
  exterior,
  interior,
  recommendations,
}: {
  exterior: ExteriorAudit;
  interior: InteriorAudit;
  recommendations: Recommendation[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Exterior</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <DetailGrid items={exteriorItems(exterior)} />
          {exterior.notes && (
            <div>
              <p className="text-muted-foreground text-xs uppercase">Auditor notes</p>
              <p className="text-sm whitespace-pre-wrap">{exterior.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Interior</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <DetailGrid items={interiorItems(interior)} />
          {interior.notes && (
            <div>
              <p className="text-muted-foreground text-xs uppercase">Auditor notes</p>
              <p className="text-sm whitespace-pre-wrap">{interior.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          {recommendations.length === 0 ? (
            <p className="text-muted-foreground text-sm">No recommendations recorded.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {recommendations.map((r) => (
                <div key={r.id} className="rounded-md border p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-medium">{r.title}</div>
                    <Badge variant={PRIORITY_VARIANT[r.priority]} className="text-[10px] capitalize">
                      {r.priority} priority
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mt-1 text-xs">{r.category}</p>
                  {r.description && <p className="mt-2 text-sm">{r.description}</p>}
                  <p className="text-muted-foreground mt-2 text-xs">
                    {r.estimatedGallonsSavedPerYear
                      ? `${r.estimatedGallonsSavedPerYear.toLocaleString()} gal/yr saved`
                      : null}
                    {r.rebateAmount ? `  ·  $${r.rebateAmount.toLocaleString()} rebate` : null}
                    {r.estimatedCost ? `  ·  Est. cost $${r.estimatedCost.toLocaleString()}` : null}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
