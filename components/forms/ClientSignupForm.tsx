"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { clientSignupSchema, type ClientSignupInput } from "@/lib/validations/auth";
import { signUpAsClient } from "@/app/(auth)/join/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "@/components/ui/field";

export function ClientSignupForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ClientSignupInput>({
    resolver: zodResolver(clientSignupSchema),
    defaultValues: { clientType: "homeowner" },
  });

  const clientType = watch("clientType");

  async function onSubmit(values: ClientSignupInput) {
    setIsSubmitting(true);
    const result = await signUpAsClient(values);
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.message);
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <p className="text-muted-foreground text-sm">
        Thanks! Your account is created. An EcoWise admin will review your
        request and grant access to your community shortly — then you can{" "}
        <a href="/login" className="text-primary underline">
          sign in
        </a>
        .
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field>
          <FieldLabel>I am a...</FieldLabel>
          <Controller
            control={control}
            name="clientType"
            render={({ field }) => (
              <RadioGroup value={field.value} onValueChange={field.onChange}>
                <label className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value="homeowner" />
                  Homeowner
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value="hoa_director" />
                  HOA director / community manager
                </label>
              </RadioGroup>
            )}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="fullName">Full name</FieldLabel>
          <Input id="fullName" autoComplete="name" {...register("fullName")} />
          <FieldError errors={[errors.fullName]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" type="email" autoComplete="email" {...register("email")} />
          <FieldError errors={[errors.email]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            {...register("password")}
          />
          <FieldDescription>At least 8 characters.</FieldDescription>
          <FieldError errors={[errors.password]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="requestedCommunity">
            Which community are you in?
          </FieldLabel>
          <Input
            id="requestedCommunity"
            placeholder="e.g. Promontory"
            {...register("requestedCommunity")}
          />
          <FieldError errors={[errors.requestedCommunity]} />
        </Field>

        {clientType === "homeowner" && (
          <Field>
            <FieldLabel htmlFor="homeAddress">Your home address</FieldLabel>
            <Input id="homeAddress" {...register("homeAddress")} />
            <FieldDescription>
              You&apos;ll only ever see your own home&apos;s results, never a
              neighbor&apos;s — plus the whole community&apos;s combined
              progress.
            </FieldDescription>
            <FieldError errors={[errors.homeAddress]} />
          </Field>
        )}
      </FieldGroup>

      <Button type="submit" disabled={isSubmitting} className="mt-6 w-full">
        {isSubmitting && <Loader2 className="animate-spin" />}
        Create account
      </Button>
    </form>
  );
}
