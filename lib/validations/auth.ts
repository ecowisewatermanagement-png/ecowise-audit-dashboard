import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  fullName: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type SignupInput = z.infer<typeof signupSchema>;

export const clientSignupSchema = z
  .object({
    clientType: z.enum(["homeowner", "hoa_director"]),
    fullName: z.string().min(1, "Name is required"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    requestedCommunity: z.string().min(1, "Enter your community's name"),
    homeAddress: z.string().optional(),
  })
  .refine(
    (data) => data.clientType !== "homeowner" || Boolean(data.homeAddress?.trim()),
    { message: "Enter your home address", path: ["homeAddress"] }
  );

export type ClientSignupInput = z.infer<typeof clientSignupSchema>;
