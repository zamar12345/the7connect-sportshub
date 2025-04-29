
import { z } from "zod";

export const passwordResetSchema = z.object({
  email: z.string().email("Please enter a valid email address")
});

export type PasswordResetFormValues = z.infer<typeof passwordResetSchema>;
