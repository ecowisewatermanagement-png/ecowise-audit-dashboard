"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { WizardStepper } from "./WizardStepper";
import { WIZARD_STEP_LABELS, type WizardStep } from "./types";
import { HomeInfoStep } from "./HomeInfoStep";
import { ExteriorStep } from "./ExteriorStep";
import { InteriorStep } from "./InteriorStep";
import { RecommendationsStep, type RecommendationTemplate } from "./RecommendationsStep";
import { ReviewStep } from "./ReviewStep";
import type { HomeInfoInput, ExteriorInput, InteriorInput } from "@/lib/validations/audit";
import type { Recommendation } from "@/types/audit";

export function AuditWizard({
  initialId,
  initialStep = "home",
  homeInfo: initialHomeInfo,
  exterior: initialExterior,
  interior: initialInterior,
  recommendations: initialRecommendations,
  templates,
  communities,
  waterCostPerGallon,
  auditorName,
}: {
  initialId: string | null;
  initialStep?: WizardStep;
  homeInfo?: Partial<HomeInfoInput>;
  exterior?: Partial<ExteriorInput>;
  interior?: Partial<InteriorInput>;
  recommendations?: Recommendation[];
  templates: RecommendationTemplate[];
  communities: { id: string; name: string }[];
  waterCostPerGallon: number;
  auditorName?: string | null;
}) {
  const router = useRouter();
  const [id, setId] = useState(initialId);
  const [step, setStep] = useState<WizardStep>(initialStep);
  const [homeInfo, setHomeInfo] = useState<Partial<HomeInfoInput>>(initialHomeInfo ?? {});
  const [exterior, setExterior] = useState<Partial<ExteriorInput>>(initialExterior ?? {});
  const [interior, setInterior] = useState<Partial<InteriorInput>>(initialInterior ?? {});
  const [recommendations, setRecommendations] = useState<Recommendation[]>(
    initialRecommendations ?? []
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-x-auto pb-1">
        <WizardStepper current={step} canNavigate={Boolean(id)} onNavigate={setStep} />
      </div>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <h2 className="mb-4 text-lg font-semibold">{WIZARD_STEP_LABELS[step]}</h2>

          {step === "home" && (
            <HomeInfoStep
              auditId={id}
              defaultValues={homeInfo}
              communities={communities}
              onSaved={({ id: newId, values }) => {
                setHomeInfo(values);
                if (!id) {
                  router.replace(`/audits/${newId}?step=exterior`);
                  return;
                }
                setId(newId);
                setStep("exterior");
              }}
            />
          )}

          {step === "exterior" && id && (
            <ExteriorStep
              auditId={id}
              defaultValues={exterior}
              onSaved={(values) => {
                setExterior(values);
                setStep("interior");
              }}
            />
          )}

          {step === "interior" && id && (
            <InteriorStep
              auditId={id}
              defaultValues={interior}
              onSaved={(values) => {
                setInterior(values);
                setStep("recommendations");
              }}
            />
          )}

          {step === "recommendations" && id && (
            <RecommendationsStep
              auditId={id}
              templates={templates}
              defaultValues={recommendations}
              onSaved={(values) => {
                setRecommendations(values);
                setStep("review");
              }}
            />
          )}

          {step === "review" && id && homeInfo.address && (
            <ReviewStep
              auditId={id}
              homeInfo={homeInfo as HomeInfoInput}
              exterior={exterior}
              interior={interior}
              recommendations={recommendations}
              waterCostPerGallon={waterCostPerGallon}
              auditorName={auditorName}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
