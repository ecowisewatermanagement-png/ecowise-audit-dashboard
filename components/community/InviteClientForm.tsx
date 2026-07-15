"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { inviteClientSchema, type InviteClientInput } from "@/lib/validations/community";
import { inviteClient } from "@/app/(dashboard)/communities/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Field, FieldGroup, FieldLabel, FieldError, FieldDescription } from "@/components/ui/field";

export function InviteClientForm({
  communities,
}: {
  communities: { id: string; name: string }[];
}) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InviteClientInput>({
    resolver: zodResolver(inviteClientSchema),
    defaultValues: { clientType: "homeowner", communityIds: [] },
  });

  async function onSubmit(values: InviteClientInput) {
    const result = await inviteClient(values);
    if (!result.success) return toast.error(result.message);
    toast.success(`Invite sent to ${values.email}`);
    reset({ fullName: "", email: "", clientType: "homeowner", communityIds: [] });
  }

  if (communities.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Add a community first, then you can invite clients to it.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="fullName">Client name</FieldLabel>
            <Input id="fullName" {...register("fullName")} />
            <FieldError errors={[errors.fullName]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="email">Client email</FieldLabel>
            <Input id="email" type="email" {...register("email")} />
            <FieldError errors={[errors.email]} />
          </Field>
        </div>

        <Field>
          <FieldLabel>Client type</FieldLabel>
          <Controller
            control={control}
            name="clientType"
            render={({ field }) => (
              <RadioGroup value={field.value} onValueChange={field.onChange} className="grid-flow-col justify-start gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value="homeowner" />
                  Homeowner (own home only)
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value="hoa_director" />
                  HOA director (sees everything)
                </label>
              </RadioGroup>
            )}
          />
        </Field>

        <Field>
          <FieldLabel>Community access</FieldLabel>
          <FieldDescription>
            This client will only ever see the community dashboard for the
            communities checked below.
          </FieldDescription>
          <Controller
            control={control}
            name="communityIds"
            render={({ field }) => (
              <div className="flex flex-col gap-2 rounded-md border p-3">
                {communities.map((c) => {
                  const checked = field.value?.includes(c.id) ?? false;
                  return (
                    <label
                      key={c.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(value) => {
                          const next = new Set(field.value ?? []);
                          if (value) next.add(c.id);
                          else next.delete(c.id);
                          field.onChange(Array.from(next));
                        }}
                      />
                      {c.name}
                    </label>
                  );
                })}
              </div>
            )}
          />
          <FieldError errors={[errors.communityIds]} />
        </Field>

        <div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin" /> : <UserPlus />}
            Send invite
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
