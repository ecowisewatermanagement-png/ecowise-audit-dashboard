import { z } from "zod";

export const communitySchema = z.object({
  name: z.string().min(1, "Name is required"),
  goalHomes: z.number().min(1).optional(),
});

export type CommunityInput = z.infer<typeof communitySchema>;

export const inviteClientSchema = z.object({
  fullName: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email address"),
  clientType: z.enum(["homeowner", "hoa_director"]),
  communityIds: z.array(z.string()).min(1, "Select at least one community"),
});

export type InviteClientInput = z.infer<typeof inviteClientSchema>;
