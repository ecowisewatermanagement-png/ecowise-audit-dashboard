"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { interiorSchema, type InteriorInput } from "@/lib/validations/audit";
import { updateInterior } from "@/app/(dashboard)/audits/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldGroup, FieldLabel, FieldSet, FieldLegend } from "@/components/ui/field";

function SwitchField({
  control,
  name,
  label,
}: {
  control: ReturnType<typeof useForm<InteriorInput>>["control"];
  name: keyof InteriorInput;
  label: string;
}) {
  return (
    <Field orientation="horizontal" className="justify-between rounded-md border p-3">
      <FieldLabel htmlFor={name} className="font-normal">
        {label}
      </FieldLabel>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Switch
            id={name}
            checked={Boolean(field.value)}
            onCheckedChange={field.onChange}
          />
        )}
      />
    </Field>
  );
}

export function InteriorStep({
  auditId,
  defaultValues,
  onSaved,
}: {
  auditId: string;
  defaultValues?: Partial<InteriorInput>;
  onSaved: (values: InteriorInput) => void;
}) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = useForm<InteriorInput>({
    resolver: zodResolver(interiorSchema),
    defaultValues,
  });

  const hasDishwasher = watch("hasDishwasher");

  async function onSubmit(values: InteriorInput) {
    const result = await updateInterior(auditId, values);
    if (!result.success) return toast.error(result.message);
    onSaved(values);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <FieldSet>
          <FieldLegend variant="label">Bathrooms & showers</FieldLegend>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field>
              <FieldLabel htmlFor="bathroomCount">Bathrooms</FieldLabel>
              <Input id="bathroomCount" type="number" {...register("bathroomCount", { valueAsNumber: true })} />
            </Field>
            <Field>
              <FieldLabel htmlFor="showerheadCount">Showerheads</FieldLabel>
              <Input id="showerheadCount" type="number" {...register("showerheadCount", { valueAsNumber: true })} />
            </Field>
            <Field>
              <FieldLabel htmlFor="showerheadFlowRateGpm">Shower flow (GPM)</FieldLabel>
              <Input id="showerheadFlowRateGpm" type="number" step="0.1" {...register("showerheadFlowRateGpm", { valueAsNumber: true })} />
            </Field>
          </div>
        </FieldSet>

        <FieldSet>
          <FieldLegend variant="label">Toilets</FieldLegend>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="toiletCount">Toilets</FieldLabel>
              <Input id="toiletCount" type="number" {...register("toiletCount", { valueAsNumber: true })} />
            </Field>
            <Field>
              <FieldLabel htmlFor="toiletFlushVolumeGal">Flush volume (gal)</FieldLabel>
              <Input id="toiletFlushVolumeGal" type="number" step="0.1" {...register("toiletFlushVolumeGal", { valueAsNumber: true })} />
            </Field>
          </div>
        </FieldSet>

        <FieldSet>
          <FieldLegend variant="label">Faucets</FieldLegend>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field>
              <FieldLabel htmlFor="bathroomFaucetCount">Bathroom faucets</FieldLabel>
              <Input id="bathroomFaucetCount" type="number" {...register("bathroomFaucetCount", { valueAsNumber: true })} />
            </Field>
            <Field>
              <FieldLabel htmlFor="bathroomFaucetFlowRateGpm">Bath faucet flow (GPM)</FieldLabel>
              <Input id="bathroomFaucetFlowRateGpm" type="number" step="0.1" {...register("bathroomFaucetFlowRateGpm", { valueAsNumber: true })} />
            </Field>
            <Field>
              <FieldLabel htmlFor="kitchenFaucetFlowRateGpm">Kitchen faucet flow (GPM)</FieldLabel>
              <Input id="kitchenFaucetFlowRateGpm" type="number" step="0.1" {...register("kitchenFaucetFlowRateGpm", { valueAsNumber: true })} />
            </Field>
          </div>
        </FieldSet>

        <FieldSet>
          <FieldLegend variant="label">Appliances & leaks</FieldLegend>
          <div className="grid gap-2 sm:grid-cols-2">
            <SwitchField control={control} name="hasHighEfficiencyWasher" label="High-efficiency washer" />
            <SwitchField control={control} name="hasDishwasher" label="Has dishwasher" />
            {hasDishwasher && (
              <SwitchField control={control} name="isDishwasherWaterEfficient" label="Dishwasher is water efficient" />
            )}
            <SwitchField control={control} name="hasHotWaterRecirculation" label="Hot water recirculation" />
            <SwitchField control={control} name="hasToiletLeaks" label="Toilet leaks" />
            <SwitchField control={control} name="hasFaucetLeaks" label="Faucet leaks" />
            <SwitchField control={control} name="hasShowerLeaks" label="Shower leaks" />
          </div>
        </FieldSet>

        <Field>
          <FieldLabel htmlFor="notes">Notes</FieldLabel>
          <Textarea id="notes" rows={3} {...register("notes")} />
        </Field>

        <div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            Save & continue
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
