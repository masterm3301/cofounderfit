import { z } from "zod";

const optionalUrl = z
  .string()
  .url()
  .optional()
  .or(z.literal(""));

export const projectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  tagline: z.string().min(1, "Tagline is required"),
  description: z.string().min(1, "Description is required"),
  industry: z.string().optional(),
  rolesNeeded: z.array(z.string()).default([]),
  equityOffered: z.string().optional(),
  commitmentExpected: z.enum(["FULL_TIME", "PART_TIME"]).optional(),
  websiteUrl: optionalUrl,
  deckUrl: optionalUrl,
  demoUrl: optionalUrl,
});

export type ProjectInput = z.infer<typeof projectSchema>;
