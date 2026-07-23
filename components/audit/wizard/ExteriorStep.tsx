"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { exteriorSchema, type ExteriorInput } from "@/lib/validations/audit";
import { updateExterior } from "@/app/(dashboard)/audits/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";

function SwitchField({
  control,
  name,
  label,
}: {
  control: ReturnType<typeof useForm<ExteriorInput>>["control"];
  name: keyof ExteriorInput;
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

export function ExteriorStep({
  auditId,
  defaultValues,
  onSaved,
}: {
  auditId: string;
  defaultValues?: Partial<ExteriorInput>;
  onSaved: (values: ExteriorInput) => void;
}) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = useForm<ExteriorInput>({
    resolver: zodResolver(exteriorSchema),
    defaultValues,
  });

  const hasController = watch("hasIrrigationController");
  const hasPool = watch("hasPool");
  const hasSpa = watch("hasSpa");

  async function onSubmit(values: ExteriorInput) {
    const result = await updateExterior(auditId, values);
    if (!result.success) return toast.error(result.message);
    onSaved(values);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="irrigatedAreaSqFt">
              Irrigated area (sq ft)
            </FieldLabel>
            <Input
              id="irrigatedAreaSqFt"
              type="number"
              {...register("irrigatedAreaSqFt", { valueAsNumber: true })}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="landscapeType">Landscape type</FieldLabel>
            <Controller
              control={control}
              name="landscapeType"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="landscapeType" className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="turf">Turf</SelectItem>
                    <SelectItem value="xeriscape">Xeriscape</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="sprinklerType">Sprinkler type</FieldLabel>
            <Controller
              control={control}
              name="sprinklerType"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="sprinklerType" className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spray">Spray</SelectItem>
                    <SelectItem value="rotor">Rotor</SelectItem>
                    <SelectItem value="drip">Drip</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="numberOfZones">Number of zones</FieldLabel>
            <Input
              id="numberOfZones"
              type="number"
              {...register("numberOfZones", { valueAsNumber: true })}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="staticPsi">Static PSI</FieldLabel>
            <Input
              id="staticPsi"
              type="number"
              {...register("staticPsi", { valueAsNumber: true })}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="brokenHeadCount">Broken heads</FieldLabel>
            <Input
              id="brokenHeadCount"
              type="number"
              {...register("brokenHeadCount", { valueAsNumber: true })}
            />
          </Field>

          {hasController && (
            <Field>
              <FieldLabel htmlFor="controllerBrand">
                Controller brand
              </FieldLabel>
              <Input id="controllerBrand" {...register("controllerBrand")} />
            </Field>
          )}

          {hasPool && (
            <>
              <Field>
                <FieldLabel htmlFor="poolGallons">Pool capacity (gallons)</FieldLabel>
                <Input
                  id="poolGallons"
                  type="number"
                  {...register("poolGallons", { valueAsNumber: true })}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="poolGallonsUsedPerYear">
                  Pool water usage (gal/year)
                </FieldLabel>
                <Input
                  id="poolGallonsUsedPerYear"
                  type="number"
                  {...register("poolGallonsUsedPerYear", { valueAsNumber: true })}
                />
              </Field>
            </>
          )}

          {hasSpa && (
            <>
              <Field>
                <FieldLabel htmlFor="spaGallons">Spa capacity (gallons)</FieldLabel>
                <Input
                  id="spaGallons"
                  type="number"
                  {...register("spaGallons", { valueAsNumber: true })}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="spaGallonsUsedPerYear">
                  Spa water usage (gal/year)
                </FieldLabel>
                <Input
                  id="spaGallonsUsedPerYear"
                  type="number"
                  {...register("spaGallonsUsedPerYear", { valueAsNumber: true })}
                />
              </Field>
            </>
          )}
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <SwitchField control={control} name="hasIrrigationController" label="Has irrigation controller" />
          {hasController && (
            <SwitchField control={control} name="isSmartController" label="Smart controller" />
          )}
          <SwitchField control={control} name="hasDripSystem" label="Drip system present" />
          <SwitchField control={control} name="hasRainSensor" label="Rain sensor installed" />
          <SwitchField control={control} name="hasOverspray" label="Overspray observed" />
          <SwitchField control={control} name="hasRunoff" label="Runoff observed" />
          <SwitchField control={control} name="hasLeaks" label="Irrigation leaks observed" />
          <SwitchField control={control} name="hasPool" label="Pool on property" />
          <SwitchField control={control} name="hasSpa" label="Spa on property" />
        </div>

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
