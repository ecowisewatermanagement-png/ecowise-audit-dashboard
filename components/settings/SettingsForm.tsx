"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";

import { settingsSchema, type SettingsInput } from "@/lib/validations/settings";
import { updateSettings } from "@/app/(dashboard)/settings/actions";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
  FieldSet,
  FieldLegend,
  FieldDescription,
} from "@/components/ui/field";

export function SettingsForm({
  initialValues,
  isAdmin,
}: {
  initialValues: SettingsInput;
  isAdmin: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    defaultValues: initialValues,
  });

  async function onSubmit(values: SettingsInput) {
    const result = await updateSettings(values);
    if (result.success) {
      toast.success("Settings saved");
    } else {
      toast.error(result.message);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <fieldset disabled={!isAdmin} className="contents">
        <FieldGroup>
          <FieldSet>
            <FieldLegend>Water & energy cost</FieldLegend>
            <FieldDescription>
              Used to convert gallons saved into estimated dollar savings on
              every audit.
            </FieldDescription>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="water_cost_per_gallon">
                  Water cost (per gallon)
                </FieldLabel>
                <InputGroup>
                  <InputGroupAddon>$</InputGroupAddon>
                  <InputGroupInput
                    id="water_cost_per_gallon"
                    type="number"
                    step="0.0001"
                    {...register("water_cost_per_gallon", { valueAsNumber: true })}
                  />
                </InputGroup>
                <FieldError errors={[errors.water_cost_per_gallon]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="energy_cost_per_kwh">
                  Energy cost (per kWh)
                </FieldLabel>
                <InputGroup>
                  <InputGroupAddon>$</InputGroupAddon>
                  <InputGroupInput
                    id="energy_cost_per_kwh"
                    type="number"
                    step="0.01"
                    {...register("energy_cost_per_kwh", { valueAsNumber: true })}
                  />
                </InputGroup>
                <FieldError errors={[errors.energy_cost_per_kwh]} />
              </Field>
            </div>
          </FieldSet>

          <FieldSet>
            <FieldLegend>Rebate amounts</FieldLegend>
            <FieldDescription>
              Applied automatically when a recommendation for that fixture is
              added to an audit.
            </FieldDescription>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="rebate_toilet">Toilet</FieldLabel>
                <InputGroup>
                  <InputGroupAddon>$</InputGroupAddon>
                  <InputGroupInput
                    id="rebate_toilet"
                    type="number"
                    step="1"
                    {...register("rebate_toilet", { valueAsNumber: true })}
                  />
                </InputGroup>
                <FieldError errors={[errors.rebate_toilet]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="rebate_showerhead">Showerhead</FieldLabel>
                <InputGroup>
                  <InputGroupAddon>$</InputGroupAddon>
                  <InputGroupInput
                    id="rebate_showerhead"
                    type="number"
                    step="1"
                    {...register("rebate_showerhead", { valueAsNumber: true })}
                  />
                </InputGroup>
                <FieldError errors={[errors.rebate_showerhead]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="rebate_smart_controller">
                  Smart controller
                </FieldLabel>
                <InputGroup>
                  <InputGroupAddon>$</InputGroupAddon>
                  <InputGroupInput
                    id="rebate_smart_controller"
                    type="number"
                    step="1"
                    {...register("rebate_smart_controller", { valueAsNumber: true })}
                  />
                </InputGroup>
                <FieldError errors={[errors.rebate_smart_controller]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="rebate_faucet_aerator">
                  Faucet aerator
                </FieldLabel>
                <InputGroup>
                  <InputGroupAddon>$</InputGroupAddon>
                  <InputGroupInput
                    id="rebate_faucet_aerator"
                    type="number"
                    step="1"
                    {...register("rebate_faucet_aerator", { valueAsNumber: true })}
                  />
                </InputGroup>
                <FieldError errors={[errors.rebate_faucet_aerator]} />
              </Field>
            </div>
          </FieldSet>

          {isAdmin ? (
            <div>
              <Button type="submit" disabled={isSubmitting || !isDirty}>
                {isSubmitting && <Loader2 className="animate-spin" />}
                Save changes
              </Button>
            </div>
          ) : (
            <p className="text-muted-foreground flex items-center gap-2 text-sm">
              <Lock className="size-3.5" />
              Only admins can edit these values.
            </p>
          )}
        </FieldGroup>
      </fieldset>
    </form>
  );
}
