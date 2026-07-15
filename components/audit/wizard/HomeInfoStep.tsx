"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { homeInfoSchema, type HomeInfoInput } from "@/lib/validations/audit";
import { createAudit, updateHomeInfo } from "@/app/(dashboard)/audits/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";

const DEFAULTS: HomeInfoInput = {
  address: "",
  communityId: "",
  homeId: "",
  homeownerName: "",
  homeownerEmail: "",
  homeownerPhone: "",
  builder: "",
  neighborhood: "",
  lotNumber: "",
  auditDate: new Date().toISOString().slice(0, 10),
};

export function HomeInfoStep({
  auditId,
  defaultValues,
  communities,
  onSaved,
}: {
  auditId: string | null;
  defaultValues?: Partial<HomeInfoInput>;
  communities: { id: string; name: string }[];
  onSaved: (result: { id: string; values: HomeInfoInput }) => void;
}) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<HomeInfoInput>({
    resolver: zodResolver(homeInfoSchema),
    defaultValues: { ...DEFAULTS, ...defaultValues },
  });

  async function onSubmit(values: HomeInfoInput) {
    if (auditId) {
      const result = await updateHomeInfo(auditId, values);
      if (!result.success) return toast.error(result.message);
      onSaved({ id: auditId, values });
    } else {
      const result = await createAudit(values);
      if (!result.success) return toast.error(result.message);
      toast.success("Audit created");
      onSaved({ id: result.id, values });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="address">Address *</FieldLabel>
            <Input id="address" {...register("address")} />
            <FieldError errors={[errors.address]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="communityId">Community *</FieldLabel>
            <Controller
              control={control}
              name="communityId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="communityId" className="w-full">
                    <SelectValue placeholder="Select community" />
                  </SelectTrigger>
                  <SelectContent>
                    {communities.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[errors.communityId]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="homeId">Home ID</FieldLabel>
            <Input id="homeId" {...register("homeId")} />
            <FieldError errors={[errors.homeId]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="auditDate">Audit date *</FieldLabel>
            <Input id="auditDate" type="date" {...register("auditDate")} />
            <FieldError errors={[errors.auditDate]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="builder">Builder</FieldLabel>
            <Input id="builder" {...register("builder")} />
          </Field>

          <Field>
            <FieldLabel htmlFor="neighborhood">Neighborhood</FieldLabel>
            <Input id="neighborhood" {...register("neighborhood")} />
          </Field>

          <Field>
            <FieldLabel htmlFor="lotNumber">Lot number</FieldLabel>
            <Input id="lotNumber" {...register("lotNumber")} />
          </Field>

          <Field>
            <FieldLabel htmlFor="homeownerName">Homeowner name</FieldLabel>
            <Input id="homeownerName" {...register("homeownerName")} />
          </Field>

          <Field>
            <FieldLabel htmlFor="homeownerEmail">Homeowner email</FieldLabel>
            <Input
              id="homeownerEmail"
              type="email"
              {...register("homeownerEmail")}
            />
            <FieldError errors={[errors.homeownerEmail]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="homeownerPhone">Homeowner phone</FieldLabel>
            <Input id="homeownerPhone" {...register("homeownerPhone")} />
          </Field>
        </div>

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
