export const WIZARD_STEPS = [
  "home",
  "exterior",
  "interior",
  "recommendations",
  "review",
] as const;

export type WizardStep = (typeof WIZARD_STEPS)[number];

export const WIZARD_STEP_LABELS: Record<WizardStep, string> = {
  home: "Home Info",
  exterior: "Exterior",
  interior: "Interior",
  recommendations: "Recommendations",
  review: "Review & Report",
};
