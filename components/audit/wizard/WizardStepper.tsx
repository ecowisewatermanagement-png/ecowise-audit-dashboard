import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { WIZARD_STEPS, WIZARD_STEP_LABELS, type WizardStep } from "./types";

export function WizardStepper({
  current,
  canNavigate,
  onNavigate,
}: {
  current: WizardStep;
  canNavigate: boolean;
  onNavigate: (step: WizardStep) => void;
}) {
  const currentIndex = WIZARD_STEPS.indexOf(current);

  return (
    <ol className="flex flex-wrap items-center gap-2">
      {WIZARD_STEPS.map((step, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = step === current;
        const clickable = canNavigate && index <= currentIndex;

        return (
          <li key={step} className="flex items-center gap-2">
            <button
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onNavigate(step)}
              className={cn(
                "flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                isCurrent
                  ? "border-primary bg-primary text-primary-foreground"
                  : isComplete
                    ? "border-success/40 bg-success/10 text-success"
                    : "border-border text-muted-foreground",
                clickable && !isCurrent && "hover:bg-muted"
              )}
            >
              <span
                className={cn(
                  "flex size-5 items-center justify-center rounded-full text-xs",
                  isCurrent
                    ? "bg-primary-foreground/20"
                    : isComplete
                      ? "bg-success/20"
                      : "bg-muted"
                )}
              >
                {isComplete ? <Check className="size-3" /> : index + 1}
              </span>
              {WIZARD_STEP_LABELS[step]}
            </button>
            {index < WIZARD_STEPS.length - 1 && (
              <div className="bg-border h-px w-4 sm:w-8" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
