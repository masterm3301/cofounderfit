import { z } from "zod";

export const profileSchema = z.object({
  bio: z.string().min(1, "Bio is required"),
  skills: z.array(z.string()).min(1, "At least one skill is required"),
  roleType: z.enum(["TECHNICAL", "BUSINESS", "DESIGN", "OTHER"]),
  commitment: z.enum(["FULL_TIME", "PART_TIME"]),
  hasIdea: z.boolean(),
  location: z.string().optional(),
  coFounderTraitsWanted: z.string().optional(),
  otherLinks: z.array(z.string().url()).optional().default([]),
});

export type ProfileInput = z.infer<typeof profileSchema>;
