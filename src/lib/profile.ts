import type { Profile, User } from "@prisma/client";
import { prisma } from "./db";
import { profileSchema, ProfileInput } from "./validation/profile";
import { PAGE_SIZE, clampPage } from "./pagination";

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

const COMPLETE_PROFILE_FILTER = {
  bio: { not: null },
  roleType: { not: null },
  commitment: { not: null },
  skills: { isEmpty: false },
};

export async function listProfiles(
  page: number
): Promise<{ profiles: (Profile & { user: User })[]; totalPages: number }> {
  const total = await prisma.profile.count({ where: COMPLETE_PROFILE_FILTER });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = clampPage(page, totalPages);

  const profiles = await prisma.profile.findMany({
    where: COMPLETE_PROFILE_FILTER,
    include: { user: true },
    orderBy: { user: { createdAt: "desc" } },
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  return { profiles, totalPages };
}
