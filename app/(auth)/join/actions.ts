"use server";

import { clientSignupSchema, type ClientSignupInput } from "@/lib/validations/auth";
import { createAdminClient } from "@/lib/supabase/admin";

type ActionResult = { success: true } | { success: false; message: string };

/**
 * Self-service signup for community clients. Runs entirely through the
 * admin client so it doesn't touch the request's own session cookies, and
 * so the account is usable immediately (no email-confirm wait). The account
 * is created as role 'client' with zero community_access — an admin has to
 * review requestedCommunity and grant real access from /communities.
 */
export async function signUpAsClient(input: ClientSignupInput): Promise<ActionResult> {
  const values = clientSignupSchema.parse(input);

  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: values.email,
    password: values.password,
    email_confirm: true,
    user_metadata: { full_name: values.fullName },
  });

  if (createError || !created?.user) {
    return {
      success: false,
      message: createError?.message ?? "Could not create account",
    };
  }

  const { error: profileError } = await admin
    .from("profiles")
    .update({
      role: "client",
      client_type: values.clientType,
      full_name: values.fullName,
      home_address: values.clientType === "homeowner" ? values.homeAddress : null,
      requested_community: values.requestedCommunity,
    })
    .eq("id", created.user.id);

  if (profileError) return { success: false, message: profileError.message };

  return { success: true };
}
