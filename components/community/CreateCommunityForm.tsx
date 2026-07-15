"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { communitySchema, type CommunityInput } from "@/lib/validations/community";
import { createCommunity } from "@/app/(dashboard)/communities/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";

export function CreateCommunityForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CommunityInput>({ resolver: zodResolver(communitySchema) });

  async function onSubmit(values: CommunityInput) {
    const result = await createCommunity(values);
    if (!result.success) return toast.error(result.message);
    toast.success("Community created");
    reset({ name: "", goalHomes: undefined });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <div className="flex flex-wrap items-end gap-3">
          <Field className="min-w-48 flex-1">
            <FieldLabel htmlFor="name">Community name</FieldLabel>
            <Input id="name" placeholder="e.g. Promontory" {...register("name")} />
            <FieldError errors={[errors.name]} />
          </Field>
          <Field className="w-36">
            <FieldLabel htmlFor="goalHomes">Goal homes</FieldLabel>
            <Input
              id="goalHomes"
              type="number"
              placeholder="750"
              {...register("goalHomes", { valueAsNumber: true })}
            />
          </Field>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin" /> : <Plus />}
            Add community
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
