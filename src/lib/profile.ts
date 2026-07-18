import type { Profile } from "@prisma/client";
import { prisma } from "./db";
import { profileSchema, ProfileInput } from "./validation/profile";

export async function getProfile(userId: string) {
  return prisma.profile.findUnique({ where: { userId } });
}

export function isProfileComplete(profile: Profile | null): boolean {
  if (!profile) return false;
  return Boolean(profile.bio) && profile.skills.length > 0 && Boolean(profile.roleType) && Boolean(profile.commitment);
}

export async function updateProfile(userId: string, input: ProfileInput) {
  const parsed = profileSchema.parse(input);
  return prisma.profile.update({ where: { userId }, data: parsed });
}
