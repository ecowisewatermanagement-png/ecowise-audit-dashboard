"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";

import { editClientSchema, type EditClientInput } from "@/lib/validations/community";
import { updateClientProfile, updateClientCommunities } from "@/app/(dashboard)/communities/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Field, FieldGroup, FieldLabel, FieldError, FieldDescription } from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import type { ClientType } from "@/types/database";

export function EditClientDialog({
  userId,
  fullName,
  email,
  clientType,
  homeAddress,
  communities = [],
  currentCommunityIds = [],
}: {
  userId: string;
  fullName: string | null;
  email: string | null;
  clientType: ClientType | null;
  homeAddress: string | null;
  /** All communities available to assign — omit to hide the community selector. */
  communities?: { id: string; name: string }[];
  currentCommunityIds?: string[];
}) {
  const [open, setOpen] = useState(false);
  const [selectedCommunityIds, setSelectedCommunityIds] = useState<string[]>(currentCommunityIds);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditClientInput>({
    resolver: zodResolver(editClientSchema),
    defaultValues: {
      fullName: fullName ?? "",
      email: email ?? "",
      clientType: clientType ?? "homeowner",
      homeAddress: homeAddress ?? "",
    },
  });

  function resetAll() {
    reset({
      fullName: fullName ?? "",
      email: email ?? "",
      clientType: clientType ?? "homeowner",
      homeAddress: homeAddress ?? "",
    });
    setSelectedCommunityIds(currentCommunityIds);
  }

  async function onSubmit(values: EditClientInput) {
    const [profileResult, communitiesResult] = await Promise.all([
      updateClientProfile(userId, values),
      communities.length > 0
        ? updateClientCommunities(userId, selectedCommunityIds)
        : Promise.resolve({ success: true as const }),
    ]);

    if (!profileResult.success) return toast.error(profileResult.message);
    if (!communitiesResult.success) return toast.error(communitiesResult.message);

    toast.success("Client updated");
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) resetAll();
      }}
    >
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Edit ${fullName ?? email}`}
          />
        }
      >
        <Pencil />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit client</DialogTitle>
          <DialogDescription>
            Changing the email also updates their login — they&apos;ll sign in
            with the new address going forward.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor={`edit-name-${userId}`}>Name</FieldLabel>
              <Input id={`edit-name-${userId}`} {...register("fullName")} />
              <FieldError errors={[errors.fullName]} />
            </Field>

            <Field>
              <FieldLabel htmlFor={`edit-email-${userId}`}>Email</FieldLabel>
              <Input id={`edit-email-${userId}`} type="email" {...register("email")} />
              <FieldError errors={[errors.email]} />
            </Field>

            <Field>
              <FieldLabel htmlFor={`edit-address-${userId}`}>Home address</FieldLabel>
              <Textarea id={`edit-address-${userId}`} rows={2} {...register("homeAddress")} />
              <FieldError errors={[errors.homeAddress]} />
            </Field>

            <Field>
              <FieldLabel>Client type</FieldLabel>
              <Controller
                control={control}
                name="clientType"
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="grid-flow-col justify-start gap-6"
                  >
                    <label className="flex items-center gap-2 text-sm">
                      <RadioGroupItem value="homeowner" />
                      Homeowner
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <RadioGroupItem value="hoa_director" />
                      HOA director
                    </label>
                  </RadioGroup>
                )}
              />
            </Field>

            {communities.length > 0 && (
              <Field>
                <FieldLabel>Community</FieldLabel>
                <FieldDescription>
                  Fix this if they were added to the wrong community by mistake.
                </FieldDescription>
                <div className="flex flex-col gap-2 rounded-md border p-3">
                  {communities.map((c) => {
                    const checked = selectedCommunityIds.includes(c.id);
                    return (
                      <label key={c.id} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(value) => {
                            setSelectedCommunityIds((prev) =>
                              value ? [...prev, c.id] : prev.filter((id) => id !== c.id)
                            );
                          }}
                        />
                        {c.name}
                      </label>
                    );
                  })}
                </div>
              </Field>
            )}
          </FieldGroup>

          <DialogFooter className="mt-4">
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
