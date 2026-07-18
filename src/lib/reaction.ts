import type { User, Profile, Project, ReactionStatus } from "@prisma/client";
import { prisma } from "./db";
import { getProject } from "./project";

function canonicalPair(userXId: string, userYId: string): [string, string] {
  return userXId < userYId ? [userXId, userYId] : [userYId, userXId];
}

export async function hasLikedUser(fromUserId: string, targetUserId: string): Promise<boolean> {
  const directLike = await prisma.profileReaction.findUnique({
    where: { fromUserId_toUserId: { fromUserId, toUserId: targetUserId } },
  });
  if (directLike?.status === "LIKE") return true;

  const targetProject = await getProject(targetUserId);
  if (!targetProject) return false;

  const projectLike = await prisma.projectReaction.findUnique({
    where: { fromUserId_toProjectId: { fromUserId, toProjectId: targetProject.id } },
  });
  return projectLike?.status === "LIKE";
}

async function createMatchIfMutual(userXId: string, userYId: string): Promise<boolean> {
  const reciprocal = await hasLikedUser(userYId, userXId);
  if (!reciprocal) return false;

  const [userAId, userBId] = canonicalPair(userXId, userYId);
  await prisma.match.upsert({
    where: { userAId_userBId: { userAId, userBId } },
    update: {},
    create: { userAId, userBId },
  });
  return true;
}

export async function reactToProfile(
  fromUserId: string,
  toUserId: string,
  status: ReactionStatus
): Promise<{ matched: boolean }> {
  if (fromUserId === toUserId) {
    throw new Error("You cannot react to your own profile.");
  }

  await prisma.profileReaction.upsert({
    where: { fromUserId_toUserId: { fromUserId, toUserId } },
    update: { status },
    create: { fromUserId, toUserId, status },
  });

  if (status !== "LIKE") return { matched: false };
  const matched = await createMatchIfMutual(fromUserId, toUserId);
  return { matched };
}

export async function reactToProject(
  fromUserId: string,
  projectId: string,
  status: ReactionStatus
): Promise<{ matched: boolean }> {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    throw new Error("Project not found.");
  }
  if (project.ownerId === fromUserId) {
    throw new Error("You cannot react to your own project.");
  }

  await prisma.projectReaction.upsert({
    where: { fromUserId_toProjectId: { fromUserId, toProjectId: projectId } },
    update: { status },
    create: { fromUserId, toProjectId: projectId, status },
  });

  if (status !== "LIKE") return { matched: false };
  const matched = await createMatchIfMutual(fromUserId, project.ownerId);
  return { matched };
}

export async function getMatches(
  userId: string
): Promise<{ matchId: string; otherUser: User & { profile: Profile | null; project: Project | null }; matchedAt: Date }[]> {
  const matches = await prisma.match.findMany({
    where: { OR: [{ userAId: userId }, { userBId: userId }] },
    include: {
      userA: { include: { profile: true, project: true } },
      userB: { include: { profile: true, project: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return matches.map((match) => ({
    matchId: match.id,
    otherUser: match.userAId === userId ? match.userB : match.userA,
    matchedAt: match.createdAt,
  }));
}

export async function isMatch(userId: string, otherUserId: string): Promise<boolean> {
  const [userAId, userBId] = canonicalPair(userId, otherUserId);
  const match = await prisma.match.findUnique({ where: { userAId_userBId: { userAId, userBId } } });
  return Boolean(match);
}
