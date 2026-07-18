import { prisma } from "./db";
import { COMPLETE_PROFILE_FILTER } from "./profile";

export async function getHomeStats(): Promise<{
  profileCount: number;
  projectCount: number;
  matchCount: number;
}> {
  const [profileCount, projectCount, matchCount] = await Promise.all([
    prisma.profile.count({ where: COMPLETE_PROFILE_FILTER }),
    prisma.project.count(),
    prisma.match.count(),
  ]);

  return { profileCount, projectCount, matchCount };
}
