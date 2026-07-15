"use client";

import { useState } from "react";
import { ClipboardList, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";

import { updateRecommendations } from "@/app/(dashboard)/audits/actions";
import type { Recommendation, RecommendationPriority } from "@/types/audit";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export interface RecommendationTemplate {
  id: string;
  title: string;
  category: string;
  description: string | null;
  default_priority: RecommendationPriority;
  estimated_gallons_saved_per_year: number | null;
  estimated_cost: number | null;
  rebate_amount: number | null;
}

const PRIORITY_VARIANT: Record<RecommendationPriority, "default" | "secondary" | "outline"> = {
  high: "default",
  medium: "secondary",
  low: "outline",
};

export function RecommendationsStep({
  auditId,
  templates,
  defaultValues,
  onSaved,
}: {
  auditId: string;
  templates: RecommendationTemplate[];
  defaultValues: Recommendation[];
  onSaved: (values: Recommendation[]) => void;
}) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>(defaultValues);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function addFromTemplate(template: RecommendationTemplate) {
    if (recommendations.some((r) => r.templateId === template.id)) {
      toast.info("Already added");
      return;
    }
    setRecommendations((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        templateId: template.id,
        title: template.title,
        category: template.category,
        description: template.description ?? undefined,
        priority: template.default_priority,
        estimatedGallonsSavedPerYear: template.estimated_gallons_saved_per_year ?? undefined,
        estimatedCost: template.estimated_cost ?? undefined,
        rebateAmount: template.rebate_amount ?? undefined,
      },
    ]);
  }

  function remove(id: string) {
    setRecommendations((prev) => prev.filter((r) => r.id !== id));
  }

  async function handleSaveAndContinue() {
    setIsSubmitting(true);
    const result = await updateRecommendations(auditId, recommendations);
    setIsSubmitting(false);
    if (!result.success) return toast.error(result.message);
    onSaved(recommendations);
  }

  const grouped = templates.reduce<Record<string, RecommendationTemplate[]>>((acc, t) => {
    (acc[t.category] ??= []).push(t);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="mb-3 text-sm font-medium">Recommendation library</h3>
        <div className="flex flex-col gap-4">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <div className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">
                {category}
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {items.map((template) => {
                  const added = recommendations.some((r) => r.templateId === template.id);
                  return (
                    <Card key={template.id} className="gap-2 py-3">
                      <CardContent className="flex items-start justify-between gap-3 px-3">
                        <div className="min-w-0">
                          <div className="text-sm font-medium">{template.title}</div>
                          {template.description && (
                            <p className="text-muted-foreground text-xs">
                              {template.description}
                            </p>
                          )}
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant={added ? "secondary" : "outline"}
                          disabled={added}
                          onClick={() => addFromTemplate(template)}
                        >
                          {added ? "Added" : <Plus />}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">
          Added to this audit ({recommendations.length})
        </h3>
        {recommendations.length === 0 ? (
          <Empty className="rounded-lg border py-8">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ClipboardList />
              </EmptyMedia>
              <EmptyTitle>No recommendations yet</EmptyTitle>
              <EmptyDescription>
                Add from the library above based on what the audit found.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="flex flex-col gap-2">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="flex items-center justify-between gap-3 rounded-md border p-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Badge variant={PRIORITY_VARIANT[rec.priority]} className="capitalize">
                    {rec.priority}
                  </Badge>
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{rec.title}</div>
                    <div className="text-muted-foreground text-xs">
                      {rec.estimatedGallonsSavedPerYear
                        ? `${rec.estimatedGallonsSavedPerYear.toLocaleString()} gal/yr`
                        : null}
                      {rec.estimatedCost ? ` · $${rec.estimatedCost} cost` : null}
                      {rec.rebateAmount ? ` · $${rec.rebateAmount} rebate` : null}
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => remove(rec.id)}
                  aria-label={`Remove ${rec.title}`}
                >
                  <X />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <Button type="button" onClick={handleSaveAndContinue} disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          Save & continue
        </Button>
      </div>
    </div>
  );
}
