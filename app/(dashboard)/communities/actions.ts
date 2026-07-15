"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth";
import {
  communitySchema,
  inviteClientSchema,
  type CommunityInput,
  type InviteClientInput,
} from "@/lib/validations/community";

type ActionResult = { success: true } | { success: false; message: string };

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function requireAdmin() {
  const user = await getCurrentUser();
  if (user?.role !== "admin") {
    throw new Error("Only admins can do this.");
  }
  return user;
}

export async function createCommunity(input: CommunityInput): Promise<ActionResult> {
  await requireAdmin();
  const values = communitySchema.parse(input);
  const supabase = await createClient();

  const { error } = await supabase.from("communities").insert({
    name: values.name,
    slug: slugify(values.name),
    goal_homes: values.goalHomes ?? null,
  });

  if (error) return { success: false, message: error.message };
  revalidatePath("/communities");
  return { success: true };
}

export async function deleteCommunity(id: string): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("communities").delete().eq("id", id);
  if (error) return { success: false, message: error.message };
  revalidatePath("/communities");
  return { success: true };
}

export async function inviteClient(input: InviteClientInput): Promise<ActionResult> {
  await requireAdmin();
  const values = inviteClientSchema.parse(input);

  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }

  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(
    values.email,
    { data: { full_name: values.fullName } }
  );

  if (inviteError || !invited?.user) {
    return { success: false, message: inviteError?.message ?? "Could not invite user" };
  }

  const userId = invited.user.id;

  const { error: roleError } = await admin
    .from("profiles")
    .update({ role: "client", client_type: values.clientType, full_name: values.fullName })
    .eq("id", userId);

  if (roleError) return { success: false, message: roleError.message };

  const { error: accessError } = await admin.from("community_access").insert(
    values.communityIds.map((communityId) => ({
      user_id: userId,
      community_id: communityId,
    }))
  );

  if (accessError) return { success: false, message: accessError.message };

  revalidatePath("/communities");
  return { success: true };
}

export async function approveClientRequest(
  userId: string,
  communityId: string
): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("community_access")
    .insert({ user_id: userId, community_id: communityId });

  if (error) return { success: false, message: error.message };

  await supabase.from("profiles").update({ requested_community: null }).eq("id", userId);

  revalidatePath("/communities");
  return { success: true };
}

export async function revokeClientAccess(
  userId: string,
  communityId: string
): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("community_access")
    .delete()
    .eq("user_id", userId)
    .eq("community_id", communityId);

  if (error) return { success: false, message: error.message };
  revalidatePath("/communities");
  return { success: true };
}
